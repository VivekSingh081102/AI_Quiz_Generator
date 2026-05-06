# AI Quiz Generator

Transform your documents into interactive quizzes using AI. Upload any PDF, DOCX, or TXT file and get personalized multiple-choice questions generated instantly.

## Features

- **Document-Based Quiz Generation** - Upload any document and AI creates questions from its content
- **Adjustable Difficulty** - Choose between Easy, Medium, or Hard questions
- **Customizable Question Count** - Generate 1-20 questions per quiz
- **Smart Evaluation** - Get detailed feedback with explanations for each answer
- **Timer & Progress Tracking** - Track your performance with built-in timer

## Tech Stack

### Backend
- **FastAPI** - Python web framework
- **LangChain** - AI/LLM framework
- **Groq API** - LLM for quiz generation and evaluation
- **Ollama** (local) - Embeddings via `nomic-embed-text` model
- **FAISS** - Vector database for document retrieval

### Frontend
- **Vanilla HTML/CSS/JS** - Clean, minimalistic UI
- **Golden Yellow Theme** - Modern, colorful design

## Architecture

```
User Upload → FastAPI → Document Processing → FAISS Vector Store
                                         ↓
                                    RAG Pipeline
                                         ↓
            ┌────────────────────────────┴────────────────────────────┐
            ↓                                                       ↓
    Embeddings (Ollama)                                     LLM (Groq)
            ↓                                                       ↓
    Document Retrieval                                    Quiz Generation
                                                              ↓
                                                         Evaluation
```

## Setup

### Prerequisites
- Python 3.12+
- Node.js (for frontend)
- Ollama installed locally

### Installation

1. **Clone the repository**
   ```bash
   cd AI--Quiz-main
   ```

2. **Set up backend**
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate  # or .venv\Scripts\activate on Windows
   pip install -r requirements.txt
   ```

3. **Install Ollama models**
   ```bash
   ollama pull nomic-embed-text
   ```

4. **Start Ollama**
   ```bash
   ollama serve
   ```

5. **Start the backend**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

6. **Start the frontend**
   ```bash
   cd frontend
   # Open index.html in browser or use a local server
   python -m http.server 3000
   ```

### Environment Variables

Create a `.env` file in `backend/` (optional - Groq key is hardcoded for convenience):
```
GROQ_API_KEY=your_groq_api_key_here
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/upload` | POST | Upload document (PDF, DOCX, TXT) |
| `/quiz` | POST | Generate quiz (params: n, difficulty) |
| `/evaluate` | POST | Evaluate quiz answers |

## Usage

1. Open the frontend in your browser
2. Upload a PDF, DOCX, or TXT file
3. Choose number of questions (1-20)
4. Select difficulty level (Easy/Medium/Hard)
5. Click "Generate Quiz"
6. Answer the questions
7. Submit to get detailed results with explanations

## Project Structure

```
AI--Quiz-main/
├── backend/
│   ├── app/
│   │   ├── main.py        # FastAPI app
│   │   ├── db.py          # Vector store management
│   │   ├── ingest.py      # Document processing
│   │   ├── rag.py         # Quiz generation
│   │   └── evaluate.py    # Answer evaluation
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
└── README.md
```
