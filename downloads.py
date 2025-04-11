import nltk
from transformers import AutoTokenizer, AutoModelForCausalLM


nltk.download('punkt')
nltk.download('stopwords')

# Models you would like to use through MLX
models_to_download = ["meta-llama/Llama-3.1-8B-Instruct"]

for model in models_to_download:
    download_model = AutoModelForCausalLM.from_pretrained(model)
    # In case you want to add a cache directory or download a private model
    # download_model = AutoModelForCausalLM.from_pretrained(model, cache_dir='', auth_token='')

