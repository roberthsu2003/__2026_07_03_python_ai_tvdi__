import gradio as gr
from fastapi import FastAPI
import uvicorn

#1. 初始化FastAPI應用程式

app = FastAPI(
    title="FastAPI + Gradio 整合範例",
    description="利用 FastAPI 作為後端 API，並掛載 Gradio UI",
    version="1.0"
)

# --------------------------------------------------
# FastAPI 原生路由 (API 端點)
# --------------------------------------------------

@app.get("/")
def read_root():
    return {"message": "歡迎來到 FastAPI 主頁！請存取 /ui 使用 Gradio 介面。"}

@app.get("/api/greet")
def api_greet(name:str="World"):
    """一個簡單的原生 FastAPI 端點"""
    return {
        "status":"success",
        "result":f"Hello, {name} from FastAPI"
        }

if __name__ == "__main__":
    # 執行伺服器：http://0.0.0.0:8000
    uvicorn.run(app, host="0.0.0.0", port=8000)