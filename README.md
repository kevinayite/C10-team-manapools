# CasePilot

CasePilot is an AI-powered complaint intelligence platform for financial institutions. It accepts customer complaints, classifies issue types with a DistilBERT model, analyzes sentiment, assigns priority, stores cases, and presents the results in an operations dashboard.

## Features

- Complaint intake with customer name and message
- Issue classification using the bundled DistilBERT checkpoint
- Human-readable issue labels from the saved label encoder
- Sentiment analysis with an optional local model or deterministic fallback
- Priority assignment based on sentiment and issue score
- SQLite persistence for classified complaints
- Live complaint queue and dashboard metrics
- Category mapping, routing teams, drafted responses, exports, and review actions
- Git LFS support for the large model weights file

## Architecture

The project has two local services:

```text
Browser
	|
	| Vite / TanStack Start frontend
	| http://localhost:5173
	v
FastAPI model service
	| http://localhost:8000
	| DistilBERT + label encoder + SQLite
```

The browser calls the FastAPI service through `VITE_MODEL_API_URL`. In local development this defaults to `http://localhost:8000`.

## Repository layout

```text
CasePilot/
|-- Model/
|   |-- api/main.py                  FastAPI application
|   |-- requirements.txt             Python dependencies
|   |-- distilbert_issue_model/      Issue classifier checkpoint
|   `-- distilbert_label_encoder.pkl Human-readable issue labels
|-- src/
|   |-- components/                  Dashboard and intake UI
|   |-- lib/model-api.ts             Frontend API client
|   `-- routes/                      TanStack Start routes
|-- data/                            Local SQLite database directory
|-- docs/model-api.md                API and deployment notes
|-- scripts/start-model-api.ps1      Windows API start helper
|-- public/                          Static assets
|-- package.json                     Frontend scripts and dependencies
`-- vite.config.ts                   Vite/TanStack configuration
```

## Prerequisites

- Node.js 20 or newer
- npm
- Python 3.11 or newer
- Git LFS for cloning and downloading the model weights

## Clone the repository

Install Git LFS before cloning so the model file is downloaded instead of the small pointer file:

```powershell
git lfs install
git clone https://github.com/Janeworld001/C10-team-manapools.git
cd C10-team-manapools
git lfs pull
```

## Run locally

Install frontend dependencies:

```powershell
npm install
```

Create and activate the Python environment:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r Model\requirements.txt
```

Start the model API in one terminal:

```powershell
python -m uvicorn Model.api.main:app --reload --port 8000
```

Start the frontend in a second terminal:

```powershell
npm run dev
```

Open the application at `http://localhost:5173`.

The API health endpoint is available at `http://localhost:8000/health`.

If PowerShell blocks environment activation, use the current process policy for that terminal:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
.\.venv\Scripts\Activate.ps1
```

## Frontend configuration

Create a `.env.local` file when the API is not running on the default local URL:

```env
VITE_MODEL_API_URL=http://localhost:8000
```

`VITE_*` values are embedded into the browser bundle at build time. Set the production API URL before running `npm run build`.

## API reference

### Health check

```http
GET /health
```

Example response:

```json
{
	"issue_model": "loaded",
	"sentiment_model": "lexicon-fallback",
	"issue_labels": 43
}
```

### Classify and store a complaint

```http
POST /api/v1/classify
Content-Type: application/json
```

Request:

```json
{
	"customer": "Alex Morgan",
	"text": "My card payment was declined while travelling overseas."
}
```

The endpoint returns the predicted issue, sentiment, priority, and internal model scores. It also stores the complaint in SQLite.

### List stored complaints

```http
GET /api/v1/complaints
```

PowerShell example:

```powershell
$body = @{ customer = "Alex Morgan"; text = "My card payment was declined." } | ConvertTo-Json
Invoke-RestMethod http://localhost:8000/api/v1/classify -Method Post -ContentType "application/json" -Body $body
Invoke-RestMethod http://localhost:8000/api/v1/complaints
```

## Data storage

Classified complaints are stored in `data/support-sense.db`. The database is ignored by Git so local customer data is not committed accidentally.

The API uses the `DATA_DIR` environment variable when set:

```powershell
$env:DATA_DIR = "C:\casepilot-data"
```

For production, mount a persistent disk and set `DATA_DIR` to that mount point. Without persistent storage, SQLite data may be lost when the host redeploys or restarts.

## Build and validation

Build the frontend and server bundle:

```powershell
npm run build
```

Run linting:

```powershell
npm run lint
```

Check the Python API module:

```powershell
python -m py_compile Model\api\main.py
```

## Production deployment

Deploy the frontend and FastAPI service separately.

### FastAPI service

Use Render, Railway, Fly.io, or another Python host.

```text
Build command: pip install -r Model/requirements.txt
Start command: uvicorn Model.api.main:app --host 0.0.0.0 --port $PORT
```

Configure these environment variables on the API service:

```text
CORS_ORIGINS=https://your-frontend-domain.com
DATA_DIR=/data
```

Attach a persistent disk at `/data` if complaint records must survive restarts.

### Frontend static site

Use Vercel, Netlify, Render Static Site, or another static host.

```text
Build command: npm install && npm run build
Publish directory: dist/client
```

Set this environment variable on the frontend before building:

```text
VITE_MODEL_API_URL=https://your-api-domain.com
```

Configure a rewrite from unknown routes to `/index.html` if the hosting provider does not automatically support SPA fallback.

## Git LFS model file

The file `Model/distilbert_issue_model/distilbert_issue_model/model.safetensors` is larger than GitHub's normal 100 MB limit. It is tracked with Git LFS. Confirm it is available after cloning:

```powershell
git lfs ls-files
git lfs pull
```

Do not replace the LFS pointer with a normal Git commit.

## Troubleshooting

### `ModuleNotFoundError: No module named 'joblib'`

Use the project virtual environment and install all API requirements:

```powershell
.\.venv\Scripts\python.exe -m pip install -r Model\requirements.txt
```

### `OPTIONS /api/v1/classify 400 Bad Request`

Set `CORS_ORIGINS` to the exact frontend origin, including the scheme and port. Local development accepts both `http://localhost:5173` and `http://127.0.0.1:5173` by default.

### Port already in use

Start the API on another port and update `VITE_MODEL_API_URL`:

```powershell
python -m uvicorn Model.api.main:app --reload --port 8001
```

```env
VITE_MODEL_API_URL=http://localhost:8001
```

### Low issue confidence

The current checkpoint has 43 issue classes and was trained for three epochs. Confidence is retained in the API for monitoring, while the interface presents the issue category, sentiment, and priority to users. Improving model accuracy requires retraining with more data, class balancing, and evaluation.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
