import os
import shutil
import json
from typing import Annotated
from urllib.parse import unquote

from fastapi import APIRouter, Depends, Body, UploadFile, Form

from ..configs import config
from .models import Prompt
from ..utils.upload_utils import process_context_upload


PROMPTS_PATH = config.prompts_path


router = APIRouter(
    prefix='/prompts',
    tags=['Prompts'],
    dependencies=[]
)


@router.get('/get_prompts')
async def get_prompts(project_name: str, doc_name: str) -> list[Prompt]:
    # load prompts file 
    doc_name = unquote(doc_name)
    prompt_file_name = f'{doc_name}.prompts.json'
    prompt_file_path = os.path.join(PROMPTS_PATH, 
                                    project_name, 
                                    prompt_file_name)
    if not os.path.exists(prompt_file_path):
        return []
    with open(prompt_file_path) as f:
        prompts = json.load(f)
    prompt_models = [Prompt(**p) for p in prompts]
    return prompt_models


@router.post('/set_prompts')
async def set_prompts(prompts: list[Prompt], project_name: str=Body(embed=True), doc_name: str=Body(embed=True)):
    prompt_file_name = f'{unquote(doc_name)}.prompts.json'
    prompt_file_path = os.path.join(PROMPTS_PATH, 
                                    project_name, 
                                    prompt_file_name)
    if not os.path.exists(os.path.join(PROMPTS_PATH, project_name)):
        os.makedirs(os.path.join(PROMPTS_PATH, project_name))
    with open(prompt_file_path, 'w') as f:
        prompts = json.dump([p.model_dump() for p in prompts], f)