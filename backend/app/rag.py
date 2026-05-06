import os
from langchain_groq import ChatGroq
from langchain_ollama import OllamaEmbeddings
from .db import get_vectorstore

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

def generate_quiz(n: int, difficulty: str):
    vs = get_vectorstore()
    retriever = vs.as_retriever(search_kwargs={"k": 10 if difficulty=="easy" else 15 if difficulty=="medium" else 25})

    docs = retriever.invoke("Generate exam questions")
    context = "\n".join([d.page_content for d in docs])

    prompt = f"""Generate {n} {difficulty} level MCQ questions from the context below.

Context:
{context}

IMPORTANT: Return a valid JSON array only. No other text. Format:
[{{"question": "...", "options": {{"A": "...", "B": "...", "C": "...", "D": "..."}}, "answer": "X"}}]

Where answer is the correct option letter (A, B, C, or D).
Do not include any markdown, explanation, or additional text."""

    llm = ChatGroq(model="llama-3.3-70b-versatile", api_key=GROQ_API_KEY, temperature=0.5)
    res = llm.invoke(prompt)
    
    content = res.content.strip()
    if content.startswith("```json"):
        content = content[7:]
    elif content.startswith("```"):
        content = content[3:]
    if content.endswith("```"):
        content = content[:-3]
    
    print(f"Quiz generated: {content[:200]}...")
    return content.strip()