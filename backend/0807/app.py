import os
import sys
from train_save import train_and_save_model

current_dir = os.getcwd()
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)


if __name__ == "__main__":
    print("Hello!")