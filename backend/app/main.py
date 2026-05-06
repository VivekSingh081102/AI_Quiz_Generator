from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

from .ingest import ingest
from .rag import generate_quiz
from .evaluate import evaluate

app = FastAPI(
    title="AI Quiz Generator",
    description="Generate quizzes from documents using AI"
)

# ---------------------------
# CORS CONFIG (Production Safe)
# ---------------------------

origins = [
    "https://ai-quiz-tau.vercel.app",
    "https://ai-quiz-tau.vercel.app/",
    # Allow all Vercel preview deployments for this project
    "https://ai-quiz-main.vercel.app",
    "https://ai-quiz-main.vercel.app/",
    # local dev
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# Directories
# ---------------------------

UPLOAD_DIR = Path("data/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# ---------------------------
# Routes
# ---------------------------

@app.get("/")
def home():
    return {"status": "ok", "message": "AI Quiz Backend is running"}


@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    try:
        file_path = UPLOAD_DIR / file.filename

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        ingest(str(file_path))

        return {"status": "ingested"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/quiz")
async def quiz(n: int, difficulty: str):
    from .db import get_vectorstore
    import traceback
    vs = get_vectorstore()
    if vs is None:
        raise HTTPException(status_code=400, detail="No document uploaded. Please upload a PDF first.")
    try:
        q = generate_quiz(n, difficulty)
        return {"quiz": q}
    except Exception as e:
        error_detail = traceback.format_exc()
        print(f"ERROR: {error_detail}")
        raise HTTPException(status_code=500, detail=error_detail)


@app.post("/evaluate")
async def eval_quiz(payload: dict):
    try:
        result = evaluate(payload["quiz"], payload["answers"])
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
