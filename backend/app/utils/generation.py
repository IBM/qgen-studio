import json
import os
from dotenv import load_dotenv
from tqdm import tqdm

from openai import OpenAI
from mlx_lm import load, generate
from langchain.text_splitter import RecursiveCharacterTextSplitter

from ibm_watsonx_ai import APIClient, Credentials
from ibm_watsonx_ai.foundation_models.utils.enums import ModelTypes
from ibm_watsonx_ai.metanames import GenTextParamsMetaNames as GenParams
from ibm_watsonx_ai.foundation_models import ModelInference


from .metrics import *
from ..configs import config


load_dotenv()


# Load prompts
with open('utils/prompts.json', 'r') as f:
    PROMPTS = json.load(f)
PROMPTS_PATH = config.prompts_path


def chunk_dataset(dataset: dict, chunk_size:int = 512, chunk_overlap:int = 0):
    """ To chunk dataset by chunk size. """
    chunked_dataset = {}
    text_splitter = RecursiveCharacterTextSplitter(chunk_size = chunk_size, chunk_overlap = chunk_overlap)
    for id, text in dataset.items():
        texts = text_splitter.split_text(text[0])
        chunked_dataset[id] = texts
    return chunked_dataset


def clean_output(generated_output):
    """ Clean generated output. """
    q_count = 1
    questions = []
    answers = []
    output = generated_output.split('### ')
    start_idx = 0
    if len(output[0]) == 0 or output[0][0] != 'Q':
        start_idx = 1
    for i in range(start_idx, len(output), 2):
        try:
            try:
                q = output[i].split(f'Question {q_count}: ')[1].rstrip()
            except:
                q = output[i].split(f'Answer {q_count}: ')[1].rstrip()
            if i + 1 >= len(output):
                continue
            a = output[i + 1].split(f'Answer {q_count}: ')[1].rstrip()
            if q not in questions:
                questions.append(q)
                answers.append(a)
            q_count = q_count + 1
        except Exception as e:
            print(e)
    assert len(questions) == len(answers)
    return questions, answers


def clean_dataset(dataset: dict, chunk_overlap: int):
    """ Removed duplicate questions. """
    cleaned_dataset = {}
    for id, entry in dataset.items():
        total_question = 0
        unique_questions = []
        unique_answers = []
        # unique_metrics = {key: [] for key in entry[0]['metrics'].keys()}
        for i in range(len(entry)):
            entry_questions = entry[i]['questions']
            total_question = total_question + len(entry_questions)
            entry_answers = entry[i]['answers']
            for j in range(len(entry_questions)):
                if entry_questions[j] not in unique_questions:
                    unique_questions.append(entry_questions[j])
                    unique_answers.append(entry_answers[j])
                    # for key, value in entry[i]['metrics'].items():
                    #     unique_metrics[key].append(value[j])
        reconstructed_text = entry[0]['context']
        for i in range(1, len(entry)):
            reconstructed_text += entry[i]['context'][chunk_overlap:]
        cleaned_dataset[id] = []
        cleaned_dataset[id].append({'context': reconstructed_text, 'questions': unique_questions, 'answers': unique_answers}) #, 'metrics': unique_metrics})
    return cleaned_dataset


def prompt_gpt(dataset: dict, 
               prompt: str,
               model_id:str = 'gpt-3.5-turbo', 
               temperature: float = 0, 
               top_p: float = 1, 
               presence_penalty: float = 0,
               frequency_penalty: float = 0):
    """ Function to prompt OpenAI models. """
    open_ai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", None))
    generated_dataset = {}
    for id, context in tqdm(dataset.items()):
        open_ai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", None))
        generated_dataset[id] = []
        print(f"processing {id}")
        for i in range(len(context)):
            if len(context[i]) < 50:
                generated_dataset[id].append({'context': context[i], 'questions': [], 'answers': []})
            else:
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": context[i]}
                ]
                response = open_ai_client.chat.completions.create(
                    model=model_id,
                    messages=messages,
                    temperature=temperature,
                    top_p=top_p,
                    presence_penalty=presence_penalty,
                    frequency_penalty=frequency_penalty
                )
                output = response.choices[0].message.content
                questions, answers = clean_output(output)
                generated_dataset[id].append({'context': context[i], 'questions': questions, 'answers': answers})
    return generated_dataset


def prompt_mlx(dataset: list, 
               prompt: str,
               model_id:str = 'meta-llama/Meta-Llama-3.1-8B-Instruct', 
               top_p: float = 1,
               max_tokens: int = 1024,
               repetition_penalty: float = 1.0,
               verbose: bool = False):
    """ Function to prompt local models using MLX. """
    model, tokenizer = load(model_id)
    generated_dataset = {}
    for id, context in tqdm(dataset.items()):
        generated_dataset[id] = []
        for i in range(len(context)):
            if len(context[i]) < 50:
                generated_dataset[id].append({'context': context[i], 'questions': [], 'answers': []})
                continue
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": context[i]}
            ]
            qgen_prompt = tokenizer.apply_chat_template(
                messages, tokenize=False, add_generation_prompt=True
            )
            output = generate(model, tokenizer, prompt=qgen_prompt, verbose=verbose, max_tokens=max_tokens, 
                              top_p=top_p, repetition_penalty=float(repetition_penalty))
            questions, answers = clean_output(output)
            generated_dataset[id].append({'context': context[i], 'questions': questions, 'answers': answers})
    return generated_dataset


def prompt_watsonx(dataset: list, 
                   prompt: str,
                   model_id: str = 'LLAMA_3_70B_INSTRUCT',
                   max_tokens: int = 1024,
                   top_p: float = 1):
    """ Prompt watsonx. """
    credentials = Credentials(
                   url = os.getenv('WATSONX_URL', None),
                   api_key = os.getenv('WATSONX_API_KEY', None)
                  )
    client = APIClient(credentials)
    project_id = os.getenv('WATSONX_PROJECT_ID', None)
    model_id = client.foundation_models.TextModels[model_id]
    parameters = {
        GenParams.DECODING_METHOD: "greedy",
        GenParams.MAX_NEW_TOKENS: max_tokens,
        GenParams.TOP_P: top_p
    }
    model = ModelInference(
                model_id=model_id, 
                params=parameters, 
                credentials=credentials,
                project_id=project_id
            )
    generated_dataset = {}
    for id, context in tqdm(dataset.items()):
        generated_dataset[id] = []
        for i in range(len(context)):
            if len(context[i]) < 50:
                generated_dataset[id].append({'context': context[i], 'questions': [], 'answers': []})
                continue
            # TODO: Apply chat template
            # messages=[
            #     {"role": "system", "content": PROMPTS['zero_shot_prompt']},
            #     {"role": "user", "content": context[i]}
            # ]
            # qgen_prompt = tokenizer.apply_chat_template(
            #     messages, tokenize=False, add_generation_prompt=True
            # )
            qgen_prompt = prompt.format(context=context[i])
            output = model.generate(qgen_prompt)
            questions, answers = clean_output(output['results'][0]['generated_text'])
            generated_dataset[id].append({'context': context[i], 'questions': questions, 'answers': answers})
    return generated_dataset
    

def evaluate_generated_dataset(generated_dataset: dict):
    """ Evaluates generated dataset with all metrics. """
    for _, entry in generated_dataset.items():
        for i in range(len(entry)):
            context = entry[i]['context']
            questions = entry[i]['questions']
            answers = entry[i]['answers']
            _, _, tf_idf_scores = score_tf_idf_with_qa(context, questions, answers)
            cosine_similarity_scores = calculate_cosine_similarity(context, questions, answers)
            computational_scores = calculate_computational_metrics(context, questions, answers)
            metrics = {}
            metrics['tf_idf'] = tf_idf_scores
            metrics['cosine'] = cosine_similarity_scores
            metrics['bleu2'] = computational_scores['bleu2']
            metrics['bleu4'] = computational_scores['bleu4']
            metrics['rouge1'] = computational_scores['rouge1']
            metrics['rouge2'] = computational_scores['rouge2']
            metrics['rougeL'] = computational_scores['rougeL']
            metrics['meteor'] = computational_scores['meteor']
            entry[i]['metrics'] = metrics
    return generated_dataset


def get_prompt(dataset_id: str, framework: str, prompt_type: str):
    # For zero shot
    if prompt_type == 'zero-shot':
        if framework == 'IBM watsonx':
            return PROMPTS['watsonx_zero_shot_prompt']
        else:
            return PROMPTS['zero_shot_prompt']
    # For few shot
    if framework == 'IBM watsonx':
        few_shot_prompt = PROMPTS['watsonx_few_shot_prompt']
    else:
        few_shot_prompt = PROMPTS['few_shot_prompt']
    prompt_file_path = os.path.join(PROMPTS_PATH, dataset_id + '.prompts.json')
    if not os.path.exists(prompt_file_path):
        print("using zero shot")
        if framework == 'IBM watsonx':
            return PROMPTS['watsonx_zero_shot_prompt']
        else:
            return PROMPTS['zero_shot_prompt']
    with open(prompt_file_path, 'r') as f:
        examples = json.load(f)
    formatted_examples = ""
    for i, example in enumerate(examples):
        formatted_examples += f"### Question {i+1}: {example['question']}\n### Answer {i+1}: {example['answer']}\n"
    modified_prompt = few_shot_prompt.replace("<insert_examples>", formatted_examples.strip())
    print("using few shot")
    return modified_prompt


def generate_qa_pairs(model: str, 
                      framework: str,
                      dataset: dict, 
                      dataset_id: str,
                      chunk_text: bool = False,
                      chunk_size: int = 0,
                      chunk_overlap: int = 0,
                      n: int = None,
                      max_tokens: int = 1024,
                      ranking_metric: str = None,
                      temperature: float = 0, 
                      top_p: float = 1,
                      presence_penalty: float = 0,
                      frequency_penalty: float = 0,
                      repetition_penalty: float = 1,
                      prompt_type: str = 'zero-shot'):
    """ Generates QA pairs from a list of datasets. """
    if chunk_text:
        dataset = chunk_dataset(dataset, chunk_size, chunk_overlap)
    prompt = get_prompt(dataset_id, framework=framework, prompt_type=prompt_type)
    if framework == 'OpenAI':
        print("Generating with OpenAI")
        generated_dataset = prompt_gpt(dataset=dataset, model_id=model, 
                                       temperature=temperature, top_p=top_p, 
                                       presence_penalty=presence_penalty, frequency_penalty=frequency_penalty, prompt=prompt)
    elif framework == 'MLX-LM':
        print("Generating with MLX")
        generated_dataset = prompt_mlx(dataset=dataset, model_id=model, top_p=top_p, 
                                       max_tokens=max_tokens, repetition_penalty=repetition_penalty, prompt=prompt)
    elif framework == 'IBM watsonx':
        print("Generating with watsonx")
        generated_dataset = prompt_watsonx(dataset=dataset, prompt=prompt, model_id=model, 
                                           max_tokens=max_tokens, top_p=top_p)
    print("cleaning dataset")
    cleaned_dataset = clean_dataset(generated_dataset, chunk_overlap)
    print("evaluating dataset")
    evaluated_dataset = evaluate_generated_dataset(cleaned_dataset)
    print("sorting dataset")
    generated_dataset = sort_by_metric(evaluated_dataset, ranking_metric=ranking_metric, n=n)
    return generated_dataset