from pydantic import BaseModel


class Prompt(BaseModel):
    question: str
    answer: str