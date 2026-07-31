import os,sys

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

# ==========================================
# 1. 載入模型與狀態管理
# ==========================================

model_path:str = os.path.join(current_dir, "salary_model.joblib")
MODEL_STATE:dict = {}

def load_model_state():
    if not os.path.exists(model_path):
        print("未檢測到模型檔案，正在自動執行訓練以生成 salary_model.joblib...")
        try:
            from train_save import train_and_save_model
            train_and_save_model()
        except Exception as e:
            raise RuntimeError(f"自動訓練模型失敗: {str(e)}")

if __name__ == "__main__":
    load_model_state()

