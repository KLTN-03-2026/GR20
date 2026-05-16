# AI/rag_service.py

import os
import numpy as np
import faiss
from google import genai
from dotenv import load_dotenv
from prompt_template import SYSTEM_PROMPT

# 1. Khởi tạo và kết nối API
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("Chưa tìm thấy GEMINI_API_KEY trong file .env")

# Khởi tạo Client theo chuẩn SDK mới của Google
client = genai.Client(api_key=api_key)

# Cập nhật model chuẩn xác nhất hiện tại
EMBEDDING_MODEL = "gemini-embedding-001"  
LLM_MODEL = "gemini-2.5-flash-lite"        

DATA_DIR = "knowledge_data"
VECTOR_DB_PATH = "vector_store/faiss_index.bin"

class RAGService:
    def __init__(self):
        self.index = None
        self.documents = []
        self.build_vector_db()

    def load_documents(self):
        docs = []
        if not os.path.exists(DATA_DIR):
            os.makedirs(DATA_DIR)
            return docs

        for filename in os.listdir(DATA_DIR):
            if filename.endswith(".txt"):
                with open(os.path.join(DATA_DIR, filename), 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                    for line in lines:
                        text = line.strip()
                        if text: 
                            docs.append(text)
        return docs

    def get_embedding(self, text):
        response = client.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=text,
        )
        return response.embeddings[0].values

    def build_vector_db(self):
        self.documents = self.load_documents()
        if not self.documents:
            print("⚠️ Không có dữ liệu nội bộ trong thư mục knowledge_data.")
            return

        print("⏳ Đang nhúng (Embedding) dữ liệu vào Vector Database...")
        embeddings = [self.get_embedding(doc) for doc in self.documents]
        
        embedding_matrix = np.array(embeddings).astype('float32')

        dimension = embedding_matrix.shape[1]
        self.index = faiss.IndexFlatL2(dimension)
        self.index.add(embedding_matrix)

        if not os.path.exists("vector_store"):
            os.makedirs("vector_store")
            
        faiss.write_index(self.index, VECTOR_DB_PATH)
        print("✅ Đã tạo Vector Database (FAISS) thành công!")

    def get_answer(self, user_question,db_context=""):
        context_text = ""

        if self.index is not None and self.index.ntotal > 0:
            query_embedding = self.get_embedding(user_question)
            query_vector = np.array([query_embedding]).astype('float32')
            
            k = 2 
            distances, indices = self.index.search(query_vector, k)
            
            retrieved_docs = []
            for idx in indices[0]:
                if idx < len(self.documents) and idx >= 0:
                    retrieved_docs.append(self.documents[idx])
            
            context_text = "\n".join(retrieved_docs)

        final_prompt = SYSTEM_PROMPT.format(context=context_text,db_context=db_context, question=user_question)

        try:
            response = client.models.generate_content(
                model=LLM_MODEL,
                contents=final_prompt
            )
            return response.text
        except Exception as e:
            error_msg = str(e)
            print(f"❌ Gemini API Error: {error_msg}")
            
            if "429" in error_msg or "quota" in error_msg.lower():
                return "Hệ thống AI đang quá tải, vui lòng thử lại sau ít phút."
            
            return f"Hệ thống AI đang bận hoặc lỗi: {error_msg}"