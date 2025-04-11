from pydantic import BaseModel

class DataEntry(BaseModel):
    doc_group: str
    source_file: str
    chunk: str
    question: str
    answer: str
    context: str
    metrics: dict
    question_span: tuple
    answer_span: tuple
    sentence_span: tuple