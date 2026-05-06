# AI Quiz Backend

A FastAPI-based backend for generating AI-powered quizzes from documents using Google Gemini.

## Features

- **Document Upload**: Supports PDF, DOCX, and TXT file uploads
- **Intelligent Chunking**: Uses LangChain's RecursiveCharacterTextSplitter for optimal document chunking
- **Vector Search**: FAISS-based vector store with Google Gemini embeddings
- **Quiz Generation**: AI-generated multiple-choice questions using Gemini 1.5 Flash
- **Answer Evaluation**: Automated answer checking with detailed explanations

## Setup

### Prerequisites

- Python 3.12+
- UV package manager
- Google Gemini API key

### Installation

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies using UV:**
   ```bash
   uv pip install -r requirements.txt
   ```

3. **Configure environment variables:**
   Create a `.env` file in the `backend` directory with your Google API key:
   ```env
   GOOGLE_API_KEY=your_gemini_api_key_here
   ```

### Running the Server

Start the development server with hot reload:

```bash
../.venv/bin/uvicorn app.main:app --reload
```

The server will start at `http://127.0.0.1:8000`

## API Endpoints

### 1. Upload Document
**POST** `/upload`

Upload a document to be processed and stored in the vector database.

**Request:**
- Form data with file upload
- Supported formats: PDF, DOCX, TXT

**Response:**
```json
{
  "status": "ingested"
}
```

### 2. Generate Quiz
**POST** `/quiz`

Generate quiz questions based on the uploaded document.

**Request:**
```json
{
  "n": 5,
  "difficulty": "medium"
}
```
- `n`: Number of questions (integer)
- `difficulty`: Question difficulty level ("easy", "medium", or "hard")

**Response:**
```json
{
  "quiz": [
    {
      "question": "What is...",
      "options": {
        "A": "Option A",
        "B": "Option B",
        "C": "Option C",
        "D": "Option D"
      },
      "answer": "B"
    }
  ]
}
```

### 3. Evaluate Answers
**POST** `/evaluate`

Evaluate user answers and provide feedback.

**Request:**
```json
{
  "quiz": [...],
  "answers": {
    "0": "A",
    "1": "B",
    "2": "C"
  }
}
```

**Response:**
```json
{
  "result": {
    "score": "3/5",
    "details": [
      {
        "question": "...",
        "user_answer": "A",
        "correct": true,
        "explanation": "..."
      }
    ]
  }
}
```

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI app and routes
│   ├── ingest.py        # Document processing and embedding
│   ├── rag.py           # Quiz generation logic
│   ├── evaluate.py      # Answer evaluation logic
│   └── db.py            # Vector store operations
├── data/
│   ├── uploads/         # Uploaded documents
│   └── vectorstore/     # FAISS vector database
├── .env                 # Environment variables
├── requirements.txt     # Python dependencies
└── readme.md           # This file
```

## Technology Stack

- **FastAPI**: Web framework
- **LangChain**: LLM orchestration
- **Google Gemini**: LLM (gemini-1.5-flash) and embeddings (text-embedding-004)
- **FAISS**: Vector database
- **PyMuPDF**: PDF processing
- **python-docx**: DOCX processing
- **python-pptx**: PPTX support

## Configuration

### Environment Variables

- `GOOGLE_API_KEY`: Your Google Gemini API key (required)

### Chunking Configuration

Documents are split using:
- Chunk size: 800 characters
- Chunk overlap: 120 characters

### Retrieval Configuration

- Easy difficulty: 10 chunks
- Medium difficulty: 15 chunks
- Hard difficulty: 25 chunks

## Troubleshooting

### Port Already in Use
If you see "Address already in use" error, kill existing processes:
```bash
pkill -f "uvicorn app.main:app"
```

### API Key Not Found
Ensure your `.env` file is in the `backend` directory and contains:
```env
GOOGLE_API_KEY=your_actual_api_key
```

### Import Errors
Make sure you're using the virtual environment's Python:
```bash
../.venv/bin/uvicorn app.main:app --reload
```

## Development

To add support for new file formats, update the `load_file` function in `app/ingest.py`.

To modify the quiz generation prompt, edit the prompt in `app/rag.py`.

To change the evaluation criteria, update the prompt in `app/evaluate.py`.
