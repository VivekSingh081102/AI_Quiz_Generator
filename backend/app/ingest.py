from langchain_community.document_loaders import PyMuPDFLoader, TextLoader, Docx2txtLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings
from langchain_community.vectorstores import FAISS
from .db import save_vectorstore

def load_file(path: str):
    if path.endswith(".pdf"):
        return PyMuPDFLoader(path).load()
    elif path.endswith(".docx"):
        return Docx2txtLoader(path).load()
    else:
        return TextLoader(path).load()

def ingest(path: str):
    docs = load_file(path)

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=120
    )
    chunks = splitter.split_documents(docs)

    embeddings = OllamaEmbeddings(model="nomic-embed-text")
    vs = FAISS.from_documents(chunks, embeddings)
    save_vectorstore(vs)