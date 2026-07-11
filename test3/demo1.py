import os
import sys
import uvicorn
from fastapi import FastAPI
import gradio as gr

app = FastAPI(title="基礎融合服務")

def greet(name):
    return f"哈囉，{name}！這是由 FastAPI 後端與 Gradio 前端融合的服務。"

demo = gr.Interface(
    fn=greet,
    inputs=gr.Textbox(label="您的名字", placeholder="請輸入名字"),
    outputs=gr.Textbox(label="回傳訊息"),
    title="🚀 基礎 FastAPI + Gradio 掛載示範"
)

app = gr.mount_gradio_app(app, demo, path="/")

if __name__ == "__main__":
    print("服務啟動中，請造訪 http://127.0.0.1:8000/")
    uvicorn.run("demo1:app", host="127.0.0.1", port=8000, reload=True)