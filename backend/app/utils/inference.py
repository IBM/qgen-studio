import json
import os

from mlx_lm import load, generate
from sentence_transformers import SentenceTransformer, util, CrossEncoder
import torch

from ..configs import config

MODELS_PATH = config.models_path

bi_encoder = SentenceTransformer('sentence-transformers/multi-qa-MiniLM-L6-cos-v1')
cross_encoder = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')

def get_ranked_context_hits(docs, query, top_n=1):
    """ Returns top 1 paragraph from a list of docs. """
    doc_emb = bi_encoder.encode(docs, convert_to_tensor=True, show_progress_bar=False)
    query_emb = bi_encoder.encode(query, convert_to_tensor=True)
    device = "cuda" if torch.cuda.is_available() else "cpu"
    if device == 'cuda':
        query_emb = query_emb.cuda()
    else:
        query_emb = query_emb.cpu()
    hits = util.semantic_search(query_emb, doc_emb, top_k=100)
    hits = hits[0]  # Get the hits for the first query
    cross_inp = [[query, docs[hit['corpus_id']]] for hit in hits]
    cross_scores = cross_encoder.predict(cross_inp)
    for idx in range(len(cross_scores)):
        hits[idx]['cross-score'] = cross_scores[idx]
    del doc_emb
    del query_emb
    hits = sorted(hits, key=lambda x: x['cross-score'], reverse=True)
    return hits[:top_n][0]


def get_paragraph(document_path: str, query: str):
    """ Returns paragraph for a given query. """
    with open(document_path, 'r') as f:
        document = json.load(f)
    docs_dict = {}
    for key, entry in document.items():
        for text in entry:
            docs_dict[text] = key
    docs = list(docs_dict.keys())
    hit = get_ranked_context_hits(docs, query)
    hit_id = docs_dict[docs[hit['corpus_id']]]
    hit_text = docs[hit['corpus_id']]
    return hit_id, hit_text


def mlx_generate(model, tokenizer, document_path, query):
    """ Generate using mlx.generate"""
    doc_id, doc_text = get_paragraph(document_path=document_path, query=query)
    doc_text = doc_text.replace("{", "{{").replace("}", "}}")
    prompt = 'Context: '+ doc_text + '\n\nQuestion: {question}'
    prompt_text = prompt.format(question=query)
    messages=[
            {"role": "system", "content": "Answer the question using the information present in the following context."},
            {"role": "user", "content": prompt_text}
        ]
    inference_prompt = tokenizer.apply_chat_template(
        messages, tokenize=False, add_generation_prompt=True
    )
    response = generate(model, tokenizer, prompt=inference_prompt, verbose=False, max_tokens=1024)
    return response


def inference_mlx_adapter(document_path: str, 
                      query: str,
                      adapter_name: str = None):
    """ Run inference using mlx adapter. """
    config_path = os.path.join(MODELS_PATH, adapter_name, 'adapter_config.json')
    adapter_path = os.path.join(MODELS_PATH, adapter_name)
    with open(config_path, 'r') as f:
        config_file = json.load(f)
        model_id = config_file['model']
    model, tokenizer = load(model_id, adapter_path=adapter_path)
    response = mlx_generate(model=model, tokenizer=tokenizer, document_path=document_path, query=query)
    return response


def inference_mlx_model(document_path: str, 
                      query: str,
                      model_id: str = None):
    """ Run inference using mlx. """
    model, tokenizer = load(model_id)
    response = mlx_generate(model=model, tokenizer=tokenizer, document_path=document_path, query=query)
    return response