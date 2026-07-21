from source import get_camera_position, CameraPosition
from pathlib import Path
import json


def main():
    data:list[CameraPosition] = get_camera_position()
    all_dict:list[dict] = [item.model_dump() for item in data]
    current_dir:Path = Path(__file__).parent
    file_path:Path = current_dir / "cameras.json"
    with open(file_path, mode="w", encoding="utf-8") as file:
        json.dump(all_dict, file, ensure_ascii=False, indent=4)

if __name__ == "__main__":
    main()