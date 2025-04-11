import os
import shutil
import json
from typing import Annotated
from urllib.parse import unquote

from fastapi import APIRouter, Depends, Body, UploadFile, Form, Request
from ibm_watsonx_ai.foundation_models.utils.enums import ModelTypes

from ..configs import config
from ..utils.generation import generate_qa_pairs
from .models import GenerationRequest


CORPUS_PATH = config.corpus_path
UPLOAD_PATH = config.upload_path
DATASETS_PATH = config.datasets_path
MLX_MODELS = config.mlx_models


router = APIRouter(
    prefix='/qgen',
    tags=['QGen'],
    dependencies=[]
)


@router.post('/generate_data')
async def generate_data(request: GenerationRequest):
    """ Generates QA pairs using the paramaters. """
    print("Generating data")

    model = request.model
    framework = request.framework
    parameters = request.parameters
    dataset_ids = request.datasets
    prompt_type = request.promptType
    ranking_metric = request.rankingMetric
    num_questions = request.numQuestions

    chunk_text = parameters.chunkText
    chunk_size = parameters.chunkSize
    chunk_overlap = parameters.chunkOverlap
    max_tokens = parameters.maxTokens
    temperature = parameters.temperature
    top_p = parameters.topP
    frequency_penalty = parameters.frequencyPenalty
    presence_penalty = parameters.presencePenalty
    repetition_penalty = parameters.repetitionPenalty

    try:
        for i in range(len(dataset_ids)):
            dataset_files = os.listdir(os.path.join(CORPUS_PATH, dataset_ids[i]))
            for j in range(len(dataset_files)):
                dataset_file_path = os.path.join(CORPUS_PATH, dataset_ids[i], dataset_files[j])
                gen_file_path = os.path.join(DATASETS_PATH, dataset_ids[i])
                if not os.path.exists(gen_file_path):
                    os.makedirs(gen_file_path)
                with open(dataset_file_path, 'r') as f:
                    dataset = json.load(f)
                # TODO: Change dataset ID logic here 
                generated_data = generate_qa_pairs(model=model, framework=framework,
                                                   dataset=dataset,
                                                   dataset_id=os.path.join(dataset_ids[i], dataset_files[j]), 
                                                   chunk_text=chunk_text, chunk_size=chunk_size, chunk_overlap=chunk_overlap,
                                                   n=num_questions, max_tokens=max_tokens, ranking_metric=ranking_metric,
                                                   temperature=temperature, top_p=top_p,
                                                   frequency_penalty=frequency_penalty, presence_penalty=presence_penalty,
                                                   repetition_penalty=repetition_penalty, prompt_type=prompt_type)
                with open(os.path.join(gen_file_path, dataset_files[j]), 'w') as f:
                    json.dump(generated_data, f)
        response_object = {'status': 'success', 'exception': ''}
    except Exception as e:
        response_object = {'status': 'fail', 'exception': str(e)}
        print(e)
    return response_object


@router.get('/get_mlx_models')
async def get_mlx_models():
    return MLX_MODELS


@router.get('/get_openai_models')
async def get_openai_models():
    models = ['gpt-3.5-turbo', 'gpt-4o', 'gpt-4o-mini', 'o1-preview', 'o1-mini', 'gpt-4-turbo', 'gpt-4']
    return models


@router.get('/get_watsonx_models')
async def get_watsonx_models():
    models = [model.name for model in ModelTypes]
    return models


@router.get('/get_ranking_metrics')
async def get_ranking_metrics():
    metrics = ['bleu2', 'bleu4', 'rouge1', 'rouge2', 'rougeL', 'meteor', 'tf_idf', 'cosine']
    return metrics


@router.get('/get_frameworks')
async def get_frameworks():
    models = ['IBM watsonx', 'MLX-LM', 'OpenAI']
    return models
