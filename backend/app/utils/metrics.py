import stanza
import nltk
import string
import numpy as np
import re
from tqdm import tqdm

from rouge_score import rouge_scorer
from nltk.translate.bleu_score import corpus_bleu
from nltk.translate.meteor_score import meteor_score
from nltk.corpus import stopwords
from sentence_transformers import SentenceTransformer, util
from transformers import BertTokenizerFast
from tfIdfInheritVectorizer.feature_extraction.vectorizer import TFIDFVectorizer


STOP_WORDS = set(stopwords.words('english'))
STOP_WORDS.add('of the')
PUNCTUATION = set(string.punctuation)


model = SentenceTransformer(
    'sentence-transformers/msmarco-distilbert-base-tas-b')
stanza_tokenizer = stanza.Pipeline(lang='en', processors='tokenize')
text_tokenizer = BertTokenizerFast.from_pretrained('bert-base-uncased')


def calculate_computational_metrics(context, questions, answers):
    """ Calculates computational metrics"""
    rouge1_scores = []
    rouge2_scores = []
    rougel_scores = []
    bleu2_scores = []
    bleu4_scores = []
    m_scores = []
    scorer = rouge_scorer.RougeScorer(['rouge1', 'rouge2', 'rougeL'])
    for i in range(len(questions)):
        ref_tokens = text_tokenizer.tokenize(context, truncation=True, max_length=512,padding='max_length')
        ref_tokens = list(filter(('[PAD]').__ne__, ref_tokens))
        ref_tokens = list(filter(('[CLS]').__ne__, ref_tokens))
        ref_tokens = list(filter(('[SEP]').__ne__, ref_tokens))
        qa_pair = ' '.join([questions[i], answers[i]])
        out_tokens = text_tokenizer.tokenize(qa_pair, truncation=True, max_length=512,padding='max_length')
        out_tokens = list(filter(('[PAD]').__ne__, out_tokens))
        out_tokens = list(filter(('[CLS]').__ne__, out_tokens))
        out_tokens = list(filter(('[SEP]').__ne__, out_tokens))
        # Meteor Score
        try:
            mscore = meteor_score([ref_tokens], out_tokens)
        except Exception as e:
            mscore = 0
        m_scores.append(mscore)
        # Rouge Scores
        rs = scorer.score(qa_pair, context)
        rouge1_scores.append(rs['rouge1'].fmeasure)
        rouge2_scores.append(rs['rouge2'].fmeasure)
        rougel_scores.append(rs['rougeL'].fmeasure)
        # Bleu Scores
        try:
            bleu2_score = corpus_bleu([[ref_tokens]], [out_tokens], weights=(.5,.5))
            bleu4_score = corpus_bleu([[ref_tokens]], [out_tokens], weights=(.25,.25,.25,.25))
        except Exception as e:
            bleu2_score = 0
            bleu4_score = 0
        bleu2_scores.append(bleu2_score)
        bleu4_scores.append(bleu4_score)
    return {'rouge1': rouge1_scores, 'rouge2': rouge2_scores, 'rougeL': rougel_scores, 
            'bleu2': bleu2_scores, 'bleu4': bleu4_scores, 'meteor': m_scores }


def calculate_cosine_similarity(context, questions, answers):
    """ Calculates cosine similarity. """
    scores = []
    context_emb = model.encode(context)
    for i in range(len(questions)):
        query_emb = model.encode(' '.join([questions[i], answers[i]]))
        scores.append(util.pytorch_cos_sim(query_emb, context_emb)[0].tolist()[0])
    return scores


def score_tf_idf_with_qa(sample_context, questions, answers):
    """ Calculates TF_IDF scores for relevancy. """
    doc_tokenised = stanza_tokenizer(sample_context)
    doc_tokens = [word.text.lower() for sent in doc_tokenised.sentences for word in sent.words]
    doc_processed = " ".join(doc_tokens)

    qa_pairs = [' '.join([q, a]) for q, a in zip(questions, answers)]
    qa_pairs_tokens_list = []
    qa_pairs_processed = []
    qa_pairs_tokenised = []
    scores = []

    for idx, qa_pair in enumerate(qa_pairs):
        qa_tokenised = stanza_tokenizer(qa_pair)
        qa_pairs_tokenised.append(qa_tokenised)
        question_tokens = [word.text.lower() for sent in qa_tokenised.sentences for word in sent.words]
        question_processed = " ".join(question_tokens)
        qa_pairs_tokens_list.append(question_tokens)
        qa_pairs_processed.append(question_processed)

    all_text = [doc_processed] + qa_pairs_processed

    vectorizer = TFIDFVectorizer(stop_words=list(STOP_WORDS)).fit(all_text)
    tfid_matrix = vectorizer.transform(all_text)
    feature_names = vectorizer.get_feature_names_out()

    doc_tdidf = dict(zip(feature_names, tfid_matrix.toarray()[0]))

    qa_pairs_scores = []
    tfidf_scores = []
    for idx, qa_pair in enumerate(qa_pairs):
        qa_pair_tdidf = dict(zip(feature_names, tfid_matrix.toarray()[idx + 1]))
        relevance_score = sum(doc_tdidf.get(word, 0) for word in qa_pairs_tokens_list[idx])
        qa_pairs_scores.append((qa_pair, relevance_score))
        scores.append(relevance_score)
        qa_pair_rel_tfidf = {}
        for key, value in qa_pair_tdidf.items():
            if value > 0.0:
                qa_pair_rel_tfidf[key] = value
        tfidf_scores.append((qa_pair, qa_pair_rel_tfidf))

    passage_tokens = []
    for sent in doc_tokenised.sentences:
        sent_tokens = []
        for word in sent.words:
            sent_tokens.append(word.text.lower())
        passage_tokens.append(sent_tokens)

    ranked_qa_pairs_relevance = sorted(qa_pairs_scores, key=lambda x: x[1], reverse=True)
    
    tokenised_data = {}
    tokenised_data['passage_tokenised'] = doc_tokenised
    tokenised_data['passage_tokens'] = passage_tokens
    tokenised_data['passage_processed'] = doc_processed
    tokenised_data['qa_pairs_tokens_list'] = qa_pairs_tokens_list
    tokenised_data['qa_pairs_processed'] = qa_pairs_processed
    tokenised_data['qa_pairs_tokenised'] = qa_pairs_tokenised
    return ranked_qa_pairs_relevance, tokenised_data, scores


def sort_by_metric(dataset: dict, ranking_metric: str = None, n: int = None):
    """ Sorts questions according to metric. """
    output = {}
    for key, value in dataset.items():
        entry = value[0]
        questions = entry['questions']
        answers = entry['answers']
        metric = entry['metrics'].get(ranking_metric)
        sorted_indices = np.argsort(metric)[::-1].tolist()
        ranked_questions = []
        ranked_answers = []
        ranked_metrics = {key: [] for key in entry['metrics'].keys()}
        for idx in sorted_indices:
            ranked_questions.append(questions[idx])
            ranked_answers.append(answers[idx])
            for metric_key, metric_value in entry['metrics'].items():
                ranked_metrics[metric_key].append(metric_value[idx])
            if len(ranked_questions) == n:
                break
        output[key] = []
        output[key].append({'context': entry['context'], 'questions': ranked_questions, 'answers': ranked_answers, 'metrics': ranked_metrics})
    return output


def check_threshold(metric_thresholds, metrics, index):
    for metric, threshold in metric_thresholds.items():
        if metrics[metric][index] < threshold:
            return False
    return True


def filter_by_metric(metric_thresholds: dict, dataset: dict):
    """ Filters dataset according to the metric thresholds. """
    filtered_dataset = {}
    for key, value in dataset.items():
        filtered_dataset[key] = []
        for i in range(len(value)):
            entry = value[i]
            filtered_questions = []
            filtered_answers = []
            filtered_metrics = {key: [] for key in entry['metrics'].keys()}
            context, questions, answers, metrics = entry['context'], entry['questions'], entry['answers'], entry['metrics']
            for j in range(len(questions)):
                if check_threshold(metric_thresholds, metrics, j):
                    filtered_questions.append(questions[j])
                    filtered_answers.append(answers[j])
                    for metric_key, metric_value in metrics.items():
                        filtered_metrics[metric_key].append(metric_value[j])
            filtered_dataset[key].append({'context': context, 'questions': filtered_questions, 'answers': filtered_answers, 'metrics': filtered_metrics})
    return filtered_dataset


def get_text_spans(context, text):
    """ Returns (phrase, start_idx, end_idx) for all subwords of text occurring in context. """
    spans = []
    if text[-1] == "?" or text[-1] == ".":
        text = text[:-1]
        text = text.strip()
    text_words = text.split()
    i = 0
    while i < len(text_words):
        # Try to match multiple words as a group
        for j in range(len(text_words), i, -1):
            phrase = ' '.join(text_words[i:j]).strip(",.")
            if phrase.strip().lower() not in STOP_WORDS:
                start_idx = context.lower().find(phrase.lower())
                if start_idx != -1:
                    end_idx = start_idx + len(phrase) - 1
                    if (phrase, start_idx, end_idx) not in spans:
                        spans.append((phrase, start_idx, end_idx))
                    i = j - 1  # Move index to the end of the matched phrase
                    break
        i += 1
    spans = sorted(spans, key=lambda x: x[1])
    if len(spans) == 0:
        return spans
    clean_spans = []
    curr_start_span = spans[0][1]
    new_end = spans[0][2]
    for i in range(1, len(spans)):
        if spans[i][1] == curr_start_span or new_end >= spans[i][1] - 10:
            new_end = spans[i][2]
        else:
            clean_spans.append((context[curr_start_span:new_end], curr_start_span, new_end))
            curr_start_span = spans[i][1]
            new_end = spans[i][2]
    clean_spans.append((context[curr_start_span:new_end], curr_start_span, new_end))
    return clean_spans


def get_sentence_spans(context, question, answer):
    """ Returns the start and end index of the sentence with the most occurring spans from question + answer. """
    # Split into sentences
    if question[-1] == "?":
        question = question[:-1]
    qa_pair = question + " " + answer
    sentences = re.split(r'(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s', context)
    qa_pair_spans = get_text_spans(context, qa_pair)
    max_count = 0
    best_sentence_span = ("", -1, -1) 
    for sentence in sentences:
        count = sum(1 for phrase, _, _ in qa_pair_spans if phrase in sentence)
        if count > max_count:
            max_count = count
            start_idx = context.find(sentence)
            end_idx = start_idx + len(sentence) - 1
            best_sentence_span = (sentence, start_idx, end_idx)
    return [best_sentence_span]