from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from dotenv import load_dotenv
from google import genai
import traceback
import os

# ==========================
# Gemini
# ==========================
load_dotenv()
client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

# ==========================
# FastAPI
# ==========================

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================
# Upload folder
# ==========================

UPLOAD_FOLDER = "uploads"

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# ==========================
# Embedding Model
# ==========================

embedding_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

db = None

# ==========================
# Request Model
# ==========================

class QuestionRequest(BaseModel):
    question: str

# ==========================
# Home
# ==========================

@app.get("/")
def home():
    return {
        "message": "Legal RAG Backend Running"
    }

# ==========================
# Upload PDF
# ==========================

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):

    global db
    try:
        file_path = os.path.join(
        UPLOAD_FOLDER,
        file.filename
        )

        with open(file_path, "wb") as f:
            f.write(await file.read())
        print("PDF Saved:", file_path)
        loader = PyPDFLoader(file_path)
        documents = loader.load()

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50
        )

        docs = splitter.split_documents(documents)

        db = FAISS.from_documents(
        docs,
        embedding_model
        )

        return {
        "message":
        "PDF uploaded successfully"
        }
    except Exception as e:
        traceback.print_exc()
        return {
            "message": "Error uploading PDF",
            "error": str(e)
        }

# ==========================
# Ask Question
# ==========================

@app.post("/ask")
def ask_question(data: QuestionRequest):

    global db

    if db is None:
        return {
            "answer":
            "Please upload PDF first"
        }

    retrieved_docs = db.similarity_search(
        data.question,
        k=3
    )

    context = "\n".join(
        [doc.page_content for doc in retrieved_docs]
    )

    prompt = f"""
You are an AI legal assistant.

Answer ONLY from the uploaded legal document.

If answer not found, say:
Answer not found in document.

Context:
{context}

Question:
{data.question}
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return {
        "answer": response.text
    }