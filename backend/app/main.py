import json
import os
from typing import Annotated, Dict

from fastapi import FastAPI, Body, Form, UploadFile, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .configs import config

from .docs.routers import router as doc_router
from .prompts.routers import router as prompt_router
from .datasets.routers import router as dataset_router
from .qgen.routers import router as qgen_router
from .train.routers import router as train_router
from .explorer.routers import router as explorer_router


app = FastAPI()

origins = [
"http://localhost",
"http://localhost:8000"
"http://localhost:8080",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(doc_router)
app.include_router(prompt_router)
app.include_router(qgen_router)
app.include_router(dataset_router)
app.include_router(train_router)
app.include_router(explorer_router)


@app.get('/')
def index():
    return "Hello World!"