param(
  [int]$Port = 8000
)

python -m uvicorn Model.api.main:app --reload --port $Port