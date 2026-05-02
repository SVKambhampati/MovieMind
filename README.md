# MovieMind

A hybrid movie recommendation system combining **content-based filtering** (TF-IDF cosine similarity) and **collaborative filtering** (SVD) into a single ranked list — with a clean, fast, dark-mode web UI.

## Features

- **Hybrid engine** — 60% collaborative + 40% content-based, weighted by user ratings
- **Fuzzy search** — RapidFuzz matching, tolerant of typos
- **Explainability** — "Because you liked Inception" / "Users similar to you enjoyed this"
- **Cold start handling** — Trending and Top Rated rows when no input given
- **Star ratings** — Rate liked movies (1–5) to tune recommendations
- **Movie detail modal** — Overview, genres, rating, and "Add to my list"
- **Pagination** — Top 10–15 results per page, load more on demand
- **Precomputed similarity matrix** — cached, no recomputation per request
- **Demo mode** — Ships with 150 curated movies, no dataset download required

## Quick Start

```bash
cd moviemind
python3 -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python backend/app.py
```

Open http://localhost:5001

## Full Dataset (Optional)

For production-quality recommendations, download [The Movies Dataset](https://www.kaggle.com/datasets/rounakbanik/the-movies-dataset) and place these files in `data/`:

```
data/
├── movies_metadata.csv
├── credits.csv
├── keywords.csv
└── ratings.csv          # enables real collaborative filtering
```

Then delete `backend/cache/processed_data.pkl` and restart.

Or run the setup helper:
```bash
python setup_data.py
```

## Environment Variables

Copy `.env.example` to `.env`:

```env
FLASK_SECRET_KEY=your-secret-here
TMDB_API_KEY=your-tmdb-key     # optional: enables movie poster images
PORT=5001
CB_WEIGHT=0.4                   # content-based weight (0–1)
CF_WEIGHT=0.6                   # collaborative weight (0–1)
```

Get a free TMDB API key at https://www.themoviedb.org/settings/api

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search?query=inception` | Fuzzy movie search |
| POST | `/api/recommend` | Hybrid recommendations |
| GET | `/api/trending?n=10` | Trending movies |
| GET | `/api/top-rated?n=10` | Top-rated movies |
| GET | `/api/movie/<id>` | Movie detail |
| GET | `/api/health` | System status |

**POST /api/recommend body:**
```json
{
  "liked": [
    { "id": 2, "title": "Inception", "rating": 5 },
    { "id": 1, "title": "The Dark Knight" }
  ],
  "page": 1,
  "per_page": 12
}
```

## Project Structure

```
moviemind/
├── backend/
│   ├── app.py              Flask API + static serving
│   ├── recommender.py      Hybrid engine (CB + CF)
│   ├── preprocessing.py    TF-IDF pipeline + caching
│   └── demo_data.py        150 curated fallback movies
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── data/                   Place Kaggle dataset files here
├── requirements.txt
├── Procfile                Railway/Render deployment
└── setup_data.py           Dataset download helper
```

## Deployment

**Backend → Railway / Render**

The `Procfile` is ready:
```
web: gunicorn --chdir backend app:app --bind 0.0.0.0:$PORT
```

Set environment variables in the platform dashboard.

**Frontend → Vercel** (optional separate deploy)

The `vercel.json` is included. Point `API` in `app.js` to your deployed backend URL.

Or keep everything together — the Flask app serves `frontend/` as static files at `/`.
