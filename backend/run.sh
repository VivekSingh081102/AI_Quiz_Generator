cd "$(dirname "$0")"
export PYTHONPATH=.
../.venv/bin/python3 -m uvicorn app.main:app --reload --port 8000