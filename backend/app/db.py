from langchain_community.vectorstores import FAISS

# In-memory vectorstore — avoids ephemeral filesystem issues on Render
_vectorstore = None

def get_vectorstore():
    return _vectorstore

def save_vectorstore(vs):
    global _vectorstore
    _vectorstore = vs
