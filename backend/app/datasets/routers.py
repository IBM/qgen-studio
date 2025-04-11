import os
import shutil
import json
from typing import Annotated
from urllib.parse import unquote

from fastapi import APIRouter, Depends, Body, UploadFile, Form

from ..utils.metrics import get_sentence_spans, get_text_spans
from ..configs import config
from .models import DataEntry
# from .utils import create_data_entries


DATASETS_PATH = config.datasets_path


router = APIRouter(
    prefix='/datasets',
    tags=['Generated Datasets'],
    dependencies=[]
)


# Moving to router because __init__ messes with the SentenceTransformers (it also imports utils from dataset)
def create_data_entries(project_name:str) -> list[DataEntry]:
    dataset_dir_path = os.path.join(DATASETS_PATH, 
                                    project_name)
    if not os.path.exists(dataset_dir_path):
        return []
    dataset_names = [f for f in os.listdir(dataset_dir_path) if f.endswith('.json')]
    datasets = [
        json.load(open(os.path.join(DATASETS_PATH, project_name, dn)))
        for dn in dataset_names
    ]
    data_entries = [
        DataEntry(
            doc_group=project_name,
            source_file=dn,
            chunk=chunk_id,
            question=q, answer=a,
            context=chunk_item['context'],
            metrics={metric_name: metric_values[i] for metric_name, metric_values in chunk_item['metrics'].items()},
            sentence_span=get_sentence_spans(chunk_item['context'], q, a),
            question_span=get_text_spans(chunk_item['context'], q),
            answer_span=get_text_spans(chunk_item['context'], a)
        )
        for dn, ds in zip(dataset_names, datasets) 
        for chunk_id, chunk_val in ds.items()
        for chunk_item in chunk_val
        for i, (q, a) in enumerate(zip(chunk_item['questions'], chunk_item['answers']))   
    ]
    return data_entries


@router.get('/get_datasets')
async def get_datasets(project_name: str) -> list[DataEntry]:
    entries = create_data_entries(project_name)
    return entries


@router.get('/get_generated_datasets')
async def get_generated_datasets() -> list:
    gen_datasets = []
    dir_files = os.listdir(DATASETS_PATH)
    for file in dir_files:
        if file not in '.DS_Store':
            gen_datasets.append(file)
    return gen_datasets