# AI/main.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag_service import RAGService

# 1. Khởi tạo FastAPI và RAG Service
app = FastAPI(title="HomeLink AI Assistant API")
rag_service = RAGService()

# 2. Cấu hình CORS (Để Frontend React có thể gọi API trực tiếp)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Trong thực tế nên giới hạn lại địa chỉ Frontend của bạn
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Định dạng dữ liệu đầu vào (Request Body)
class ChatRequest(BaseModel):
    message: str

# 4. Định nghĩa Endpoint /chat
@app.post("/api/ai/chat")
async def chat_endpoint(request: ChatRequest):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Nội dung câu hỏi không được để trống")
    
    # Gọi service xử lý RAG
    answer = rag_service.get_answer(request.message)
    
    return {
        "status": "success",
        "answer": answer
    }

# 5. Endpoint kiểm tra trạng thái server
@app.get("/health")
async def health_check():
    return {"status": "online", "message": "AI Server is running"}

if __name__ == "__main__":
    import uvicorn
    # Chạy server ở port 8080
    uvicorn.run(app, host="0.0.0.0", port=8080)