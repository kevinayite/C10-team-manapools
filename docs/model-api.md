# CasePilot model API

The FastAPI service in `Model/api/main.py` loads the checked-in DistilBERT issue model and its label encoder. It exposes:

- `GET /health` for model availability and label count
- `POST /api/v1/classify` with `{ "text": "..." }` for issue, confidence, sentiment, and priority

Run it from the repository root:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r Model\requirements.txt
uvicorn Model.api.main:app --reload --port 8000
```

The optional `Model/roberta_sentiment/` directory is used when present. Without it, the API uses a small deterministic sentiment fallback and reports that state from `/health`.

## Production deployment

Deploy the API as a Python service and the frontend as a static site.

API service settings:

- Build: `pip install -r Model/requirements.txt`
- Start: `uvicorn Model.api.main:app --host 0.0.0.0 --port $PORT`
- `CORS_ORIGINS`: the public frontend URL
- `DATA_DIR`: a persistent disk directory, such as `/data`, so SQLite records survive restarts

Frontend settings:

- Build: `npm install && npm run build`
- Publish directory: `dist/client`
- `VITE_MODEL_API_URL`: the public API URL, for example `https://support-sense-api.onrender.com`

Set `VITE_MODEL_API_URL` before building because Vite embeds `VITE_*` variables into the browser bundle. Configure the frontend host to rewrite unknown routes to `/index.html` if it does not provide SPA fallback automatically.