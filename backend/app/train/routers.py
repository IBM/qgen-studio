import os
import shutil
import json
from typing import Annotated
from urllib.parse import unquote

from fastapi import APIRouter, Depends, Body, UploadFile, Form, Request

from ..configs import config
from ..utils.metrics import filter_by_metric
from ..utils.train import process_dataset_mlx, train_mlx
from .models import TrainRequest


CORPUS_PATH = config.corpus_path
UPLOAD_PATH = config.upload_path
MLX_MODELS = config.mlx_models
DATASETS_PATH = config.datasets_path
MLX_DATA_PATH = config.mlx_data_path
MODELS_PATH = config.models_path
MLX_MODELS = config.mlx_models

router = APIRouter(
    prefix='/train',
    tags=['Train'],
    dependencies=[]
)

def get_train_datasets(dataset_ids: list, filter: bool = False):
    """ Return datasets for training. """
    train_datasets = []
    for i in range(len(dataset_ids)):
        dataset_dir = os.path.join(DATASETS_PATH, dataset_ids[i])
        dataset_files = os.listdir(dataset_dir)
        for file in dataset_files:
            with open(os.path.join(dataset_dir, file), 'r') as f:
                train_datasets.append(json.load(f))
    if filter:
        return train_datasets
    else:
        train_dataset = {}
        for dataset in train_datasets:
            train_dataset.update(dataset)
        return train_dataset


def filter_datasets(metric_thresholds: dict, dataset_ids: list):
    """ Filters dataset according to evaluation metrics. """
    train_datasets = get_train_datasets(dataset_ids=dataset_ids, filter=True)
    filtered_dataset = {}
    for dataset in train_datasets:
        filtered_dataset.update(filter_by_metric(metric_thresholds=metric_thresholds, dataset=dataset))
    return filtered_dataset


@router.post('/train_mlx_model')
async def train_mlx_model(request: TrainRequest):

    model_id = request.model
    datasets = request.datasets
    adapter_name = request.adapterName
    filterDataset = request.filterDataset

    # Parameters
    iters = request.parameters.iters
    learning_rate = request.parameters.learningRate
    lora_layers = request.parameters.loraLayers
    batch_size = request.parameters.batchSize
    steps_per_eval = request.parameters.stepsPerEval
    max_seq_length = request.parameters.maxSeqLength

    # Data Params
    shuffle = request.dataParams.shuffle
    include_context = request.dataParams.includeContext
    split_valid = request.dataParams.validSplit
    split_test = request.dataParams.testSplit

    # Metrics
    bleu2 =request.metrics.bleu2
    bleu4 = request.metrics.bleu4
    rouge1 = request.metrics.rouge1
    rouge2 = request.metrics.rouge2
    rougeL = request.metrics.rougeL
    tfIdf = request.metrics.tfIdf
    cosine = request.metrics.cosine

    try:

    # Filter dataset
        if filterDataset:
            metric_thresholds = {'bleu2': float(bleu2), 
                                'bleu4': float(bleu4), 
                                'rouge1': float(rouge1), 
                                'rouge2': float(rouge2), 
                                'rougeL': float(rougeL), 
                                'tf_idf': float(tfIdf),
                                'cosine': float(cosine),}
            train_dataset = filter_datasets(metric_thresholds=metric_thresholds, dataset_ids=datasets)
        else:
            train_dataset = get_train_datasets(dataset_ids=datasets, filter=False)
                                
        data_dir = os.path.join(MLX_DATA_PATH, adapter_name)
        model_save_dir = os.path.join(MODELS_PATH, adapter_name)

        # Process MLX Data here
        process_dataset_mlx(dataset=train_dataset, 
                            output_dir=data_dir, 
                            model_id=model_id, 
                            with_context=include_context, shuffle=shuffle, 
                            split_valid=split_valid, split_test=split_test)

        train_mlx(data=data_dir, 
                model=model_id,
                iters=iters,
                learning_rate=learning_rate,
                train=True,
                adapter_path=model_save_dir,
                lora_layers=lora_layers,
                steps_per_eval=steps_per_eval,
                batch_size=batch_size,
                max_seq_length=max_seq_length)
        
        response_object = {'status': 'success', 'exception': ''}

    except Exception as e:
        response_object = {'status': 'fail', 'exception': str(e)}
        print(e)
        
    return response_object


@router.get('/get_train_models')
async def get_train_models():
    return MLX_MODELS