import os
from dotenv import load_dotenv

from pydantic import BaseModel

load_dotenv()

CORPUS_PATH = os.getenv('CORPUS_PATH')
UPLOAD_PATH = os.getenv('UPLOAD_PATH')
PROMPTS_PATH = os.getenv('PROMPTS_PATH')
DATASETS_PATH = os.getenv('DATASETS_PATH')
MLX_DATA_PATH = os.getenv('MLX_DATA_PATH')
MODELS_PATH = os.getenv('MODELS_PATH')

MLX_MODELS = eval(os.getenv('MLX_MODELS'))

class Config(BaseModel):
    upload_path: str = UPLOAD_PATH
    corpus_path: str = CORPUS_PATH
    prompts_path: str = PROMPTS_PATH
    datasets_path: str = DATASETS_PATH
    mlx_data_path: str = MLX_DATA_PATH
    models_path: str = MODELS_PATH
    mlx_models: list = MLX_MODELS


config = Config()