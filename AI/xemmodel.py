import os
import json
import urllib.request
from dotenv import load_dotenv

# 1. Load API Key từ file .env
current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(current_dir, '.', '.env')
load_dotenv(dotenv_path=env_path)

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("❌ Lỗi: Không tìm thấy API Key trong file .env")
    exit()

print(f"🔑 Đang kiểm tra Key: ...{api_key[-5:]}")

# 2. Gọi trực tiếp API của Google (Không cần thư viện google-generative-ai)
url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"

try:
    print("⏳ Đang kết nối tới Google...")
    with urllib.request.urlopen(url) as response:
        if response.status == 200:
            data = json.loads(response.read().decode())
            print("\n📋 DANH SÁCH MODEL BẠN ĐƯỢC DÙNG:")
            found_flash = False
            found_pro = False
            
            for model in data.get('models', []):
                # Chỉ hiện các model tạo văn bản (chat)
                if "generateContent" in model.get("supportedGenerationMethods", []):
                    # Bỏ bớt chữ "models/" ở đầu cho dễ nhìn
                    clean_name = model['name'].replace("models/", "")
                    print(f"   ✅ {clean_name}")
                    
                    if "gemini-1.5-flash" in clean_name: found_flash = True
                    if "gemini-pro" in clean_name: found_pro = True
            
            print("\n-----------------------------------")
            if found_flash:
                print("💡 GỢI Ý: Bạn nên dùng 'gemini-1.5-flash'")
            elif found_pro:
                print("💡 GỢI Ý: Bạn nên dùng 'gemini-pro'")
            else:
                print("⚠️ Cảnh báo: Không tìm thấy model Gemini nào quen thuộc.")
        else:
            print(f"❌ Lỗi HTTP: {response.status}")
except Exception as e:
    print(f"❌ Lỗi khi gọi Google: {e}")
    print("👉 Khả năng cao là API Key bị sai hoặc chưa bật quyền truy cập.")