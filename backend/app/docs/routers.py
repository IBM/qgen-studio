import os
import shutil
import json
from typing import Annotated
from urllib.parse import unquote

from fastapi import APIRouter, Depends, Body, UploadFile, Form

from ..configs import config
from .models import NewProject, Project, Document
from ..utils.upload_utils import process_context_upload, delete_upload_files
from ..utils.paths import safe_join


CORPUS_PATH = config.corpus_path
UPLOAD_PATH = config.upload_path


router = APIRouter(
    prefix='/docs',
    tags=['Documents'],
    dependencies=[]
)

@router.post('/upload')
async def upload(docGroupId: Annotated[str, Form()], files: list[UploadFile]):
    upload_dir = safe_join(UPLOAD_PATH, docGroupId)
    file_paths = []
    for file in files:
        file_path = safe_join(upload_dir, os.path.basename(file.filename or ''))
        with open(file_path, 'wb') as f:
            f.write(file.file.read())
        file_paths.append(file_path)
    process_context_upload(file_paths, docGroupId)
    delete_upload_files(file_paths)
    return {"filenames": [file.filename for file in files], "status": "success"}

# Document Groups

@router.get('/get_document_groups')
async def get_document_groups() -> list[Project]:
    # [ name for name in os.listdir(thedir) if os.path.isdir(os.path.join(thedir, name)) ]
    dir_contents = os.listdir(config.corpus_path)
    doc_groups = [Project(name=name) 
                  for name in dir_contents 
                  if os.path.isdir(os.path.join(config.corpus_path, name))]
    return doc_groups


@router.post('/create_document_group')
async def create_document_group(new_project: NewProject) -> str:
    corpus_dir = safe_join(config.corpus_path, new_project.name)
    upload_dir = safe_join(config.upload_path, new_project.name)
    if os.path.isdir(corpus_dir):
        # TODO: This should throw and error
        return 'Document Group already exists!'
    os.mkdir(corpus_dir)
    os.mkdir(upload_dir)
    return 'Success!'


@router.delete('/delete_document_group')
async def delete_document_group(project_name: str=Body(embed=True)):
    shutil.rmtree(safe_join(config.corpus_path, project_name))
    shutil.rmtree(safe_join(config.upload_path, project_name))


@router.get('/list_docs')
async def list_docs(project_name: str) -> list[str]:
    files = os.listdir(safe_join(config.corpus_path, project_name))
    clean_file_names = []
    for file in files:
        clean_file_names.append(file.split('.json')[0])
    return clean_file_names


@router.get('/get_doc')
async def get_doc(project_name: str, doc_name: str) -> Document:
    # TODO: Maybe fix this logic?
    doc_name = unquote(doc_name)
    if '.json' not in doc_name:
        path = safe_join(config.corpus_path, project_name, doc_name + '.json')
    else:
        path = safe_join(config.corpus_path, project_name, doc_name)
    with open(path) as f:
        doc = json.load(f)
    doc = Document(id=list(doc.keys()), text=list(doc.values()), cleanDocName=doc_name.split('.json')[0])
    return doc

@router.delete('/delete_doc')
async def delete_doc(project_name: str=Body(embed=True), doc_name: str=Body(embed=True)):
    if '.json' not in doc_name:
        corpus_doc_path = safe_join(config.corpus_path, project_name, doc_name + '.json')
    else:
        corpus_doc_path = safe_join(config.corpus_path, project_name, doc_name)
    os.remove(corpus_doc_path)