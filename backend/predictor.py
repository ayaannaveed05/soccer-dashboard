"""Soccer match predictor - refactored from interactive script to API-ready function"""

import pandas as pd
import os
from sklearn.model_selection import train_test_split, GridSearchCV, TimeSeriesSplit
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib

# Paths
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")

# Files and their leagues
FILES = {
    "SP1.csv": "Spain", "SP1 (1).csv": "Spain", "SP1 (2).csv": "Spain",
    "E0.csv": "England", "E0 (1).csv": "England", "E0 (2).csv": "England",
    "F1.csv": "France", "F1 (1).csv": "France", "F1 (2).csv": "France",
    "I1.csv": "Italy", "I1 (1).csv": "Italy", "I1 (2).csv": "Italy",
    "D1.csv": "Germany", "D1 (1).csv": "Germany", "D1 (2).csv": "Germany"
}

FEATURES = [
    'home_recent_goals', 'away_recent_goals',
    'home_recent_conceded', 'away_recent_conceded',
    'home_form', 'away_form',
    'h2h_home_goals', 'h2h_away_goals',
    'h2h_home_conceded', 'h2h_away_conceded',
    'home_advantage'
]


def load_data():
    """Load and preprocess all CSV files into one DataFrame"""
    
    dfs = []
    for file, league in FILES.items():
        path = os.path.join(DATA_DIR, file)
        if os.path.exists(path):
            temp_df = pd.read_csv(path)
            temp_df['league'] = league
            dfs.append(temp_df)
    
    # Combine all data
    df = pd.concat(dfs, ignore_index=True)
    
    # Parse dates
    df['Date'] = pd.to_datetime(df['Date'], format='%d/%m/%Y', errors='coerce')
    df = df.dropna(subset=['Date'])
    
    # Rename columns
    df.rename(columns={
        'HomeTeam': 'home_team', 'AwayTeam': 'away_team',
        'FTHG': 'home_goals', 'FTAG': 'away_goals', 'FTR': 'result'
    }, inplace=True)
    
    # Encode winner
    df['winner'] = df['result'].map({'H': 'home', 'A': 'away', 'D': 'draw'})
    df = df.dropna(subset=['winner'])
    
    return df


def engineer_features(df, league):
    """Add all engineered features to DataFrame"""
    
    # Filter for league
    df_league = df[df['league'] == league].copy()
    df_league = df_league.sort_values('Date')
    
    # Rolling averages
    df_league['home_recent_goals'] = df_league.groupby('home_team')['home_goals'].rolling(5, min_periods=1).mean().reset_index(0, drop=True)
    df_league['home_recent_conceded'] = df_league.groupby('home_team')['away_goals'].rolling(5, min_periods=1).mean().reset_index(0, drop=True)
    df_league['away_recent_goals'] = df_league.groupby('away_team')['away_goals'].rolling(5, min_periods=1).mean().reset_index(0, drop=True)
    df_league['away_recent_conceded'] = df_league.groupby('away_team')['home_goals'].rolling(5, min_periods=1).mean().reset_index(0, drop=True)
    
    # Form
    df_league['home_form'] = df_league['home_recent_goals'] - df_league['home_recent_conceded']
    df_league['away_form'] = df_league['away_recent_goals'] - df_league['away_recent_conceded']
    
    # Home advantage
    df_league['home_team_home_form'] = df_league.groupby('home_team')['home_form'].rolling(5, min_periods=1).mean().reset_index(0, drop=True)
    df_league['away_team_away_form'] = df_league.groupby('away_team')['away_form'].rolling(5, min_periods=1).mean().reset_index(0, drop=True)
    df_league['home_advantage'] = df_league['home_team_home_form'] - df_league['away_team_away_form']
    
    # H2H features
    weights = [0.4, 0.3, 0.15, 0.1, 0.05]
    h2h_home_goals, h2h_away_goals = [], []
    h2h_home_conceded, h2h_away_conceded = [], []
    
    for idx, row in df_league.iterrows():
        team = row['home_team']
        opponent = row['away_team']
        match_date = row['Date']
        
        h2h = df_league[
            (
                ((df_league['home_team'] == team) & (df_league['away_team'] == opponent)) |
                ((df_league['home_team'] == opponent) & (df_league['away_team'] == team))
            ) & (df_league['Date'] < match_date)
        ].sort_values('Date', ascending=False).head(5)
        
        hg = ag = hc = ac = 0
        for i, (_, r) in enumerate(h2h.iterrows()):
            w = weights[i] if i < len(weights) else 0.05
            if r['home_team'] == team:
                hg += r['home_goals'] * w
                hc += r['away_goals'] * w
            else:
                ag += r['away_goals'] * w
                ac += r['home_goals'] * w
        
        h2h_home_goals.append(hg)
        h2h_away_goals.append(ag)
        h2h_home_conceded.append(hc)
        h2h_away_conceded.append(ac)
    
    df_league['h2h_home_goals'] = h2h_home_goals
    df_league['h2h_away_goals'] = h2h_away_goals
    df_league['h2h_home_conceded'] = h2h_home_conceded
    df_league['h2h_away_conceded'] = h2h_away_conceded
    
    return df_league


def train_model(df_league, le):
    """Train Random Forest model on league data"""
    
    df_league = df_league.dropna(subset=FEATURES + ['winner'])
    df_league['winner_encoded'] = le.transform(df_league['winner'])
    
    X = df_league[FEATURES]
    y = df_league['winner_encoded']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)
    
    # Train with best known parameters (skip grid search for API speed)
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        class_weight='balanced',
        random_state=42
    )
    model.fit(X_train, y_train)
    
    return model


def get_recent_form(df, team, num_matches=5):
    """Get recent form stats for a team"""
    
    team_matches = df[(df['home_team'] == team) | (df['away_team'] == team)]
    recent = team_matches.sort_values('Date', ascending=False).head(num_matches)
    
    goals_scored, goals_conceded = [], []
    
    for _, row in recent.iterrows():
        if row['home_team'] == team:
            goals_scored.append(row['home_goals'])
            goals_conceded.append(row['away_goals'])
        else:
            goals_scored.append(row['away_goals'])
            goals_conceded.append(row['home_goals'])
    
    if not goals_scored:
        return 0, 0, 0
    
    avg_scored = sum(goals_scored) / len(goals_scored)
    avg_conceded = sum(goals_conceded) / len(goals_conceded)
    form = avg_scored - avg_conceded
    
    return avg_scored, avg_conceded, form


# Global variables - loaded once when server starts
print("Loading soccer prediction model...")
_df = load_data()
_le = LabelEncoder()
_le.fit(['away', 'draw', 'home'])  # Fit label encoder with all classes
_models = {}  # Cache trained models per league
print("✓ Data loaded successfully")


def get_available_teams():
    """Return list of all teams in the dataset"""
    teams = pd.concat([_df['home_team'], _df['away_team']]).unique().tolist()
    return sorted(teams)


def predict_match(home_team: str, away_team: str) -> dict:
    """
    Predict match outcome given home and away team names
    
    Args:
        home_team: Name of home team
        away_team: Name of away team
    
    Returns:
        Dictionary with prediction and probabilities
    """
    
    # Validate teams exist in dataset
    all_teams = pd.concat([_df['home_team'], _df['away_team']]).unique()
    
    # Case insensitive matching
    home_match = next((t for t in all_teams if t.lower() == home_team.lower()), None)
    away_match = next((t for t in all_teams if t.lower() == away_team.lower()), None)
    
    if not home_match:
        return {"error": f"Team '{home_team}' not found in dataset"}
    if not away_match:
        return {"error": f"Team '{away_team}' not found in dataset"}
    
    # Get league for home team
    league_rows = _df[_df['home_team'] == home_match]['league']
    if league_rows.empty:
        return {"error": f"Could not determine league for {home_match}"}
    
    league = league_rows.iloc[0]
    
    # Train or load cached model for this league
    if league not in _models:
        print(f"Training model for {league}...")
        df_league = engineer_features(_df, league)
        _models[league] = (train_model(df_league, _le), df_league)
        print(f"✓ Model ready for {league}")
    
    model, df_league = _models[league]
    
    # Get current season data only
    season_start = pd.to_datetime("2025-08-01")
    df_season = df_league[df_league['Date'] >= season_start]
    
    # Get recent form
    home_scored, home_conceded, home_form = get_recent_form(df_season, home_match)
    away_scored, away_conceded, away_form = get_recent_form(df_season, away_match)
    
    # Get H2H stats from latest match
    latest = df_league[
        (df_league['home_team'] == home_match) |
        (df_league['away_team'] == home_match)
    ]
    
    if latest.empty:
        h2h_hg = h2h_ag = h2h_hc = h2h_ac = 0
    else:
        last_row = latest.iloc[-1]
        h2h_hg = last_row.get('h2h_home_goals', 0)
        h2h_ag = last_row.get('h2h_away_goals', 0)
        h2h_hc = last_row.get('h2h_home_conceded', 0)
        h2h_ac = last_row.get('h2h_away_conceded', 0)
    
    # Home advantage
    home_team_form = df_season[df_season['home_team'] == home_match]['home_form'].tail(5).mean()
    away_team_form = df_season[df_season['away_team'] == away_match]['away_form'].tail(5).mean()
    home_advantage = (home_team_form if pd.notna(home_team_form) else 0) - \
                     (away_team_form if pd.notna(away_team_form) else 0)
    
    # Build feature row
    features = pd.DataFrame([{
        'home_recent_goals': home_scored,
        'away_recent_goals': away_scored,
        'home_recent_conceded': home_conceded,
        'away_recent_conceded': away_conceded,
        'home_form': home_form,
        'away_form': away_form,
        'h2h_home_goals': h2h_hg,
        'h2h_away_goals': h2h_ag,
        'h2h_home_conceded': h2h_hc,
        'h2h_away_conceded': h2h_ac,
        'home_advantage': home_advantage
    }])
    
    # Make prediction
    pred_encoded = model.predict(features)[0]
    pred_probs = model.predict_proba(features)[0]
    pred_winner = _le.inverse_transform([pred_encoded])[0]
    
    # Build probability dict
    prob_dict = {}
    for label, prob in zip(_le.classes_, pred_probs):
        prob_dict[label] = round(float(prob), 3)
    
    # Human readable prediction
    if pred_winner == 'home':
        prediction_text = f"{home_match} Win"
    elif pred_winner == 'away':
        prediction_text = f"{away_match} Win"
    else:
        prediction_text = "Draw"
    
    return {
        "home_team": home_match,
        "away_team": away_match,
        "league": league,
        "prediction": prediction_text,
        "winner": pred_winner,
        "probabilities": {
            "home_win": prob_dict.get('home', 0),
            "draw": prob_dict.get('draw', 0),
            "away_win": prob_dict.get('away', 0)
        },
        "confidence": round(max(pred_probs) * 100, 1)
    }