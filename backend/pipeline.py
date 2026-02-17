"""
Data pipeline - automatically downloads fresh match data
and retrains the ML model weekly.
"""

import os
import requests
import pandas as pd
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

# URLs for current season data
SEASON_URLS = {
    "SP1.csv": "https://www.football-data.co.uk/mmz4281/2526/SP1.csv",
    "E0.csv": "https://www.football-data.co.uk/mmz4281/2526/E0.csv",
    "F1.csv": "https://www.football-data.co.uk/mmz4281/2526/F1.csv",
    "I1.csv": "https://www.football-data.co.uk/mmz4281/2526/I1.csv",
    "D1.csv": "https://www.football-data.co.uk/mmz4281/2526/D1.csv"
}

# Track pipeline status
pipeline_status = {
    "last_run": None,
    "last_success": None,
    "last_error": None,
    "files_updated": [],
    "model_accuracy": None,
    "status": "never_run"
}


def download_fresh_data():
    """Download latest CSVs from football-data.co.uk"""
    
    print("📥 Pipeline: Downloading fresh match data...")
    updated = []
    
    for filename, url in SEASON_URLS.items():
        path = os.path.join(DATA_DIR, filename)
        try:
            response = requests.get(url, timeout=15)
            response.raise_for_status()
            
            with open(path, "wb") as f:
                f.write(response.content)
            
            updated.append(filename)
            print(f"  ✓ Updated {filename}")
        
        except Exception as e:
            print(f"  ✗ Failed to download {filename}: {e}")
    
    return updated


def retrain_model():
    """Retrain the ML model with fresh data and swap it in"""
    
    # Import here to avoid circular imports
    from predictor import (
        load_data, engineer_features, train_model,
        _le, _models, FEATURES
    )
    
    print("🤖 Pipeline: Retraining model with fresh data...")
    
    try:
        # Reload fresh data
        df = load_data()
        
        # Retrain for each cached league
        new_models = {}
        accuracies = []
        
        leagues = df['league'].unique()
        for league in leagues:
            df_league = engineer_features(df, league)
            df_league = df_league.dropna(subset=FEATURES + ['winner'])
            df_league['winner_encoded'] = _le.transform(df_league['winner'])
            
            X = df_league[FEATURES]
            y = df_league['winner_encoded']
            
            if len(X) < 50:  # Not enough data
                continue
            
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, shuffle=False
            )
            
            model = RandomForestClassifier(
                n_estimators=100, max_depth=10,
                min_samples_split=5, class_weight='balanced',
                random_state=42
            )
            model.fit(X_train, y_train)
            
            # Evaluate
            y_pred = model.predict(X_test)
            acc = accuracy_score(y_test, y_pred)
            accuracies.append(acc)
            
            new_models[league] = (model, df_league)
            print(f"  ✓ {league}: {acc:.1%} accuracy")
        
        # Swap models live without restarting server
        import predictor
        predictor._df = df
        predictor._models = new_models
        
        avg_accuracy = sum(accuracies) / len(accuracies) if accuracies else 0
        print(f"✅ Pipeline: Retraining complete. Avg accuracy: {avg_accuracy:.1%}")
        
        return avg_accuracy
    
    except Exception as e:
        print(f"❌ Pipeline: Retraining failed: {e}")
        raise


def run_pipeline():
    """Full pipeline: download data + retrain model"""
    
    print(f"\n{'='*50}")
    print(f"🚀 Pipeline starting at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*50}")
    
    pipeline_status["last_run"] = datetime.now().isoformat()
    pipeline_status["status"] = "running"
    
    try:
        # Step 1: Download fresh data
        updated_files = download_fresh_data()
        pipeline_status["files_updated"] = updated_files
        
        if not updated_files:
            print("⚠️ No files were updated - skipping retraining")
            pipeline_status["status"] = "skipped"
            return
        
        # Step 2: Retrain model
        accuracy = retrain_model()
        
        # Update status
        pipeline_status["last_success"] = datetime.now().isoformat()
        pipeline_status["model_accuracy"] = f"{accuracy:.1%}"
        pipeline_status["status"] = "success"
        pipeline_status["last_error"] = None
        
        print(f"✅ Pipeline complete at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    except Exception as e:
        pipeline_status["status"] = "failed"
        pipeline_status["last_error"] = str(e)
        print(f"❌ Pipeline failed: {e}")


def start_scheduler():
    """Start background scheduler - runs pipeline weekly"""
    
    scheduler = BackgroundScheduler()
    
    # Run every Monday at 3am
    scheduler.add_job(
        run_pipeline,
        trigger='cron',
        day_of_week='mon',
        hour=3,
        minute=0,
        id='weekly_pipeline'
    )
    
    scheduler.start()
    print("✓ Pipeline scheduler started - runs every Monday at 3am")
    
    return scheduler