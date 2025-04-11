from pydantic import BaseModel
from typing import List


class DataParams(BaseModel):
    shuffle: bool
    includeContext: bool
    validSplit: float
    testSplit: float

class Parameters(BaseModel):
    iters: int
    learningRate: float
    loraLayers: int
    batchSize: int
    stepsPerEval: int
    maxSeqLength: int

class Metrics(BaseModel):
    bleu2: float
    bleu4: float
    rouge1: float
    rouge2: float
    rougeL: float
    tfIdf: float
    cosine: float

class TrainRequest(BaseModel):
    model: str
    datasets: List[str] 
    adapterName: str
    filterDataset: bool
    dataParams: DataParams
    metrics: Metrics
    parameters: Parameters