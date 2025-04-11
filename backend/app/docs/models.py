from pydantic import BaseModel


class NewProject(BaseModel):
    name: str

class Project(NewProject):
    ...

class Document(BaseModel):
    id: list[str]
    text: list[list[str]]
    cleanDocName: str