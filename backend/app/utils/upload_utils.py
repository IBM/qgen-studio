import os
import re
import json
import zipfile
import uuid
from tqdm import tqdm

from docling.document_converter import DocumentConverter
from ..configs import config


UPLOADS_FILE_PATH = config.upload_path
CORPUS_FILE_PATH = config.corpus_path


def extract_text_between_headings(text: str):
    """ Extracts headings and text from markdown. """
    pattern = r"## (.*?)\n\n(.*?)(?=## |\Z)"
    matches = re.findall(pattern, text, re.DOTALL)
    outputs = []
    for match in matches:
        outputs.append(match[0] + "\n\n" + match[1])
    return outputs


def get_corpus_ids(corpus: list):
    """ Annotate corpus with ids. """
    random_id = str(uuid.uuid4().hex)[:10]
    corpus_dict = {}
    for i in range(len(corpus)):
        corpus_dict[random_id + "_" + str(i)] = [corpus[i]]
    return corpus_dict


def unzip_folder(zip_file_path: str, extract_to_folder: str):
    """ Unzips folder's pdfs to target folder. """
    with zipfile.ZipFile(zip_file_path, 'r') as zip_ref:
        pdf_files = [file for file in zip_ref.namelist() 
                     if file.endswith('.pdf') and not file.startswith('__MACOSX/')]
        if not pdf_files:
            print("No PDF files found in the zip archive.")
            return
        zip_ref.extractall(path=extract_to_folder, members=pdf_files)
        print(f"Extracted {len(pdf_files)} PDF files to {extract_to_folder}")


def process_urls(file_path: str, final_path: str):
    """ Processes the list of URLs uploaded by the user. """
    with open(file_path, 'r') as f:
        urls = json.load(f)
    outputs = {}
    converter = DocumentConverter()
    for i in range(len(urls)):
        print(f"processing {i}: ", urls[i])
        result = converter.convert(urls[i])
        markdown_result = result.document.export_to_markdown()
        cleaned_result = extract_text_between_headings(markdown_result)
        file_title = cleaned_result[0].strip().split("\n\n")[0]
        annnotated_corpus = get_corpus_ids(cleaned_result)
        with open(os.path.join(final_path, file_title + ".json"), "w") as f:
            json.dump(annnotated_corpus, f)
        outputs[file_title] = annnotated_corpus
    return outputs


def process_pdfs(file_path: str, final_path: str):
    """ Processes the zip file of PDFs uploaded by the user. """
    unzip_file_path = '/'.join(file_path.split('/')[:-1])
    unzipped_path = os.path.splitext(file_path)[0]
    unzip_folder(file_path, unzip_file_path)
    outputs = {}
    files = os.listdir(unzipped_path)
    converter = DocumentConverter()
    for i in range(len(files)):
        file_path = os.path.join(unzipped_path, files[i])
        file_name = files[i].split('.pdf')[0]
        print(f"processing {i}: ", file_name)
        result = converter.convert(file_path)
        markdown_result = result.document.export_to_markdown()
        cleaned_result = extract_text_between_headings(markdown_result)
        annnotated_corpus = get_corpus_ids(cleaned_result)
        with open(os.path.join(final_path, file_name + ".json"), "w") as f:
            json.dump(annnotated_corpus, f)
        outputs[file_name] = annnotated_corpus
    return outputs


def process_single_pdf(file_path: str, final_path: str):
    """ Processes an uploaded pdf by the user. """
    outputs = {}
    converter = DocumentConverter()
    file_name = file_path.split('/')[-1].split('.pdf')[0]
    print(f"processing : ", file_name)
    result = converter.convert(file_path)
    markdown_result = result.document.export_to_markdown()
    cleaned_result = extract_text_between_headings(markdown_result)
    file_title = cleaned_result[0].strip().split("\n\n")[0]
    annnotated_corpus = get_corpus_ids(cleaned_result)
    with open(os.path.join(final_path, file_title + ".json"), "w") as f:
        json.dump(annnotated_corpus, f)
    outputs[file_name] = annnotated_corpus
    return outputs


def get_file_type(file_path: str):
    """ Returns the type of file the user has uploaded. """
    if "zip" in file_path:
        return "zip"
    elif "pdf" in file_path:
        return "pdf"
    with open(file_path, 'r') as f:
        out_file = json.load(f)
    if type(out_file) == list:
        if 'https' in out_file[0]:
            return "list_urls"
        else:
            return "list_context"
    else:
        return "id_dict"


def process_context_upload(file_paths: list, doc_group_id: str):
    """ Process the uploaded files. """
    corpus_doc_group_dir = os.path.join(CORPUS_FILE_PATH, doc_group_id)
    for i in range(len(file_paths)):
        file = file_paths[i].split('/')[-1]
        file_path = file_paths[i]
        file_type = get_file_type(file_path)
        if file_type == 'zip':
            process_pdfs(file_path, corpus_doc_group_dir)
        elif file_type == 'pdf':
            process_single_pdf(file_path, corpus_doc_group_dir)
        elif file_type == 'list_urls':
            process_urls(file_path, corpus_doc_group_dir)
        else:
            with open(file_path, 'r') as f:
                out_file = json.load(f)
            if file_type == 'list_context':
                with open(os.path.join(corpus_doc_group_dir, file), "w") as f:
                    json.dump(get_corpus_ids(out_file), f)
            else:
                with open(os.path.join(corpus_doc_group_dir, file), "w") as f:
                    json.dump(out_file, f)
        print("processed file ", file)


def delete_upload_files(file_paths: list):
    """ Deletes files in upload folder. """
    for path in file_paths:
        os.remove(path)
