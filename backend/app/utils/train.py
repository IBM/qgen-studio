from tqdm import tqdm
import random
import os
import json

from mlx_lm import load, generate


def write_to_jsonl_file(output_dir: str, file_name:str, data: list):
    """ Function to write data to jsonl file. """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    with open(os.path.join(output_dir, file_name), 'w') as outfile:
        for entry in data:
            json.dump(entry, outfile)
            outfile.write('\n')
    return True


def process_dataset_mlx(dataset: dict, 
                        output_dir: str = None,
                        model_id: str = 'meta-llama/Meta-Llama-3.1-8B-Instruct',
                        with_context: bool = False,
                        shuffle: bool = True,
                        split_valid: float = 0.2,
                        split_test: float = 0.0):
    """ Function to process dataset for training using MLX. """
    _, tokenizer = load(model_id)
    processed_dataset = []
    for _, entry in tqdm(dataset.items()):
        for i in range(len(entry)):
            context = entry[i]['context']
            questions =  entry[i]['questions']
            answers =  entry[i]['answers']
            content_value = '{question}'
            if with_context:
                content_value = 'Context: '+ context + '\n\nQuestion: {question}'
            for j in range(len(questions)):
                messages=[
                    {"role": "user", "content": content_value.format(question=questions[j])},
                    {"role": "assistant", "content": answers[j]}
                ]
                prompt = tokenizer.apply_chat_template(
                    messages, tokenize=False, add_generation_prompt=True
                )
                processed_dataset.append({'text': prompt})
    if shuffle:
        random.shuffle(processed_dataset)
    valid_size = int(split_valid * len(processed_dataset))
    test_size = int(split_test * len(processed_dataset))
    train_size = int(len(processed_dataset) - valid_size - test_size)
    train_data = processed_dataset[:train_size]
    valid_data = processed_dataset[train_size:train_size+valid_size]
    if test_size != 0:
        test_data = processed_dataset[train_size+valid_size:]
        write_to_jsonl_file(output_dir, 'test.jsonl', test_data)
    write_to_jsonl_file(output_dir, 'train.jsonl', train_data)
    write_to_jsonl_file(output_dir, 'valid.jsonl', valid_data)
    return output_dir


def train_mlx(data: str, 
              model: str = 'meta-llama/Meta-Llama-3.1-8B-Instruct',
              seed: int = 0,
              lora_layers: int = 16,
              batch_size: int = 4,
              iters: int = 100,
              val_batches: int = 25,
              learning_rate: float = 1e-5,
              steps_per_report: int = 10,
              steps_per_eval: int = 200,
              adapter_path: str = None,
              save_every: int = 100,
              test: bool = False,
              train: bool = True,
              test_batches: int = 100,
              max_seq_length: int = 2048,
              grad_checkpoint: bool = False):
    """ Train adapters with MLX. For example yaml file - https://github.com/ml-explore/mlx-examples/blob/main/llms/mlx_lm/examples/lora_config.yaml """
    train_command = '''mlx_lm.lora \
                --model {model} \
                --train \
                --fine-tune-type lora \
                --data {data} \
                --iters {iters} \
                --num-layers {lora_layers} \
                --batch-size {batch_size} \
                --learning-rate {learning_rate} \
                --steps-per-eval {steps_per_eval} \
                --adapter-path {adapter_path} \
                --max-seq-length {max_seq_length}'''
    test_command = '''mlx_lm.lora \
                --model {model} \
                --test \
                --data {data} \
                --adapter-path {adapter_path}'''
    if train == True:
        command = train_command.format(model=model, data=data, iters=iters, lora_layers=lora_layers, 
                                batch_size=batch_size, learning_rate=learning_rate, steps_per_eval=steps_per_eval,
                                adapter_path=adapter_path, max_seq_length=max_seq_length)
        os.system(command)
    if test == True:
        command = test_command.format(model=model, data=data, adapter_path=adapter_path)
        os.system(command)
    return
