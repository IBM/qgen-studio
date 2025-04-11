from pydantic import BaseModel
from typing import List, Optional


class Parameters(BaseModel):
    chunkText: bool
    chunkSize: int
    chunkOverlap: int
    maxTokens: int
    temperature: float
    topP: float
    frequencyPenalty: float
    presencePenalty: float
    repetitionPenalty: float


class GenerationRequest(BaseModel):
    datasets: List[str] 
    model: str
    framework: str
    parameters: Parameters 
    promptType: str
    rankingMetric: str
    numQuestions: int