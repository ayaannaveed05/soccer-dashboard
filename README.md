# KickStats

A football analytics platform that predicts match outcomes using machine learning. Built over 3 weeks as a portfolio project to demonstrate full-stack development skills.

**Live:** https://soccerpredictions.up.railway.app

---

## What it does

Enter two teams, get a prediction. The model analyzes recent form, head-to-head history, and home advantage to predict who wins. It's trained on 3 seasons of match data from Europe's top leagues and gets about 68% accuracy - which honestly isn't perfect, but beats always picking the home team.

Also shows live fixtures, league tables, and lets you save favourite teams if you make an account.

---

## Screenshots

[Add your screenshots here]

---

## Why I built this

Started as a Random Forest project. I had this working model that predicted matches pretty well, but it was just a Python script. Decided to turn it into something actually usable - a real web app people could interact with.

Learned way more doing this than the assignment itself. Database design, authentication, API rate limiting, deployment issues... stuff you don't get from tutorials.

---

## Stack

**Frontend**
- React for the UI
- Zustand for auth state 
- Axios for API calls
- Vite because it's fast

**Backend**
- FastAPI - picked this over Flask because it's faster and has built-in API docs
- PostgreSQL for user data and favourites
- SQLAlchemy ORM
- JWT tokens for auth (24hr expiry)
- APScheduler runs a weekly job to download fresh data and retrain the model

**ML**
- Random Forest from scikit-learn
- GridSearchCV for hyperparameter tuning
- TimeSeriesSplit validation (can't use random splits on time-series data - that's cheating)

**Data**
- Live fixtures from football-data.org API
- Historical CSVs from football-data.co.uk for training

---

## The ML model

**Features it uses:**
- Recent form (last 5 home/away games)
- Goals scored/conceded trends
- Head-to-head record between the two teams (weighted by recency)
- Home advantage differential

**What it doesn't know:**
- Injuries or suspensions
- Tactics or formations
- Weather
- Motivation (cup vs league, relegation battles, etc.)

This is why draws are hard to predict. The model gets ~9% recall on draws because they often come down to random late goals or red cards.

**Performance:**
- 68% accuracy on test data
- 45% if you always pick home team
- 33% if you guess randomly

---

## Setup

If you want to run this locally:

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
```

Create `backend/.env`:
```
FOOTBALL_API_KEY=your_key_here
DATABASE_URL=postgresql://user:pass@localhost/dbname
SECRET_KEY=make_this_random
```

Then:
```bash
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Backend runs on 8000, frontend on 5173.

---

## Deployment

Deployed on Railway because it was the easiest option that supports PostgreSQL.

**Issues I ran into:**
- Had to use `psycopg2-binary` not `psycopg2` (missing system libs)
- CORS was annoying - had to whitelist the frontend domain
- Environment variables for Vite need to be set at build time, not runtime
- CSV files needed to be committed to git (usually you don't commit data)

---

## What I'd add next

**Better cross-league predictions** - currently blocks predictions between teams from different leagues because the model wasn't trained for that. Could fix this with Elo ratings or a separate model.

**More leagues** - only have top 5 European leagues. Could add Championship, MLS, Liga MX.

---

## File structure
```
soccer-dashboard/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── predictor.py         # ML model
│   ├── pipeline.py          # Auto data updates
│   ├── database.py          # PostgreSQL setup
│   ├── models.py            # User & Favourites tables
│   ├── auth.py              # JWT utilities
│   └── routers/
│       ├── teams.py
│       ├── matches.py
│       ├── predictions.py
│       ├── auth.py
│       └── favourites.py
└── frontend/
    └── src/
        ├── pages/           # 8 pages
        ├── components/      # Navbar, Toast, Skeleton
        ├── config.js        # API URL
        └── store.js         # Auth state
```

---

## Known bugs

- API rate limits hit during initial load sometimes (free tier only allows 10 req/min)
- Draws have terrible recall (~9%)
- No mobile navbar (it works, just looks bad on phones)

---

Built by Ayaan Naveed as a learning project.