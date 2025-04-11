import os
import shutil
import json
from typing import Annotated
from urllib.parse import unquote

from fastapi import APIRouter, Depends, Body, UploadFile, Form, Request
from ibm_watsonx_ai.foundation_models.utils.enums import ModelTypes

from ..configs import config
from ..utils.inference import inference_mlx_adapter, inference_mlx_model
from .models import InferenceRequest

CORPUS_PATH = config.corpus_path


router = APIRouter(
    prefix='/explorer',
    tags=['Explorer'],
    dependencies=[]
)

CORPUS_PATH = config.corpus_path
MODELS_PATH = config.models_path
MLX_MODELS = config.mlx_models


# To return document groups - docs/get_document_groups

# Return documents in document group - docs/list_docs

# Return document text - docs/get_doc

@router.get('/get_trained_models')
async def get_trained_models() -> list:
    """ Return list of trained models. """
    models = os.listdir(MODELS_PATH)
    trained_models = []
    for model in models:
        if model not in '.DS_Store':
            trained_models.append(model)
    return trained_models


# TODO: Modify this to return all framework models later
@router.get('/get_inference_models')
async def get_inference_models() -> list:
    """ Return list of models for inference. """
    return MLX_MODELS


@router.post('/run_inference_mlx_adapter')
async def run_inference_mlx_adapter(request: InferenceRequest):
    """ Run inference using MLX adapter. """
    # data = await request.json()
    document_name = request.documentName
    document_group = request.documentGroup
    # Remove .json if needed
    document_path = os.path.join(CORPUS_PATH, document_group, document_name + '.json')
    query = request.query
    adapter_name = request.adapterName
    response = inference_mlx_adapter(document_path=document_path, query=query, adapter_name=adapter_name)
    return {"response": response, "status": "success"}


@router.post('/run_inference_mlx_model')
async def run_inference_mlx_model(request: InferenceRequest):
    """ Run inference on MLX model. """
    document_name = request.documentName
    document_group = request.documentGroup
    # Remove .json if needed
    document_path = os.path.join(CORPUS_PATH, document_group, document_name + '.json')
    model_id = request.modelId
    query = request.query
    response = inference_mlx_model(document_path=document_path, query=query, model_id=model_id)
    return {"response": response, "status": "success"}