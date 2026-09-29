import os

from fastapi import HTTPException


def safe_join(base_dir: str, *parts: str) -> str:
    """ Joins user supplied parts onto base_dir, rejecting any path that escapes it. """
    base_path = os.path.realpath(base_dir)
    full_path = os.path.realpath(os.path.join(base_path, *parts))
    if not full_path.startswith(base_path + os.sep):
        raise HTTPException(status_code=400, detail='Invalid path')
    return full_path
