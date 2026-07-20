from fastapi import FastAPI
import uvicorn
from source import get_camera_position, CameraPosition

app = FastAPI()


@app.get("/")
def read_root():
    data:list[CameraPosition] = get_camera_position()
    return data


#@app.get("/items/{item_id}")
#def read_item(item_id: int, q: str | None = None):
#    return {"item_id": item_id, "q": q}

if __name__ == "__main__":
    uvicorn.run("practice2:app",reload=True)