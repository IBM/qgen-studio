from pydantic import BaseModel
from typing import Optional

class InferenceRequest(BaseModel):
    query: str
    documentName: str
    documentGroup: str
    adapterName: str
    modelId: str