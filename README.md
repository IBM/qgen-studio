# QGen Studio: An Adaptive Question-Answer Generation, Training and Evaluation Platform

[![arXiv](https://img.shields.io/badge/arXiv-2408.09869-b31b1b.svg)](https://arxiv.org/abs/2504.06136)
[![License Apache](https://img.shields.io/github/license/ibm/qgen-studio)](https://www.apache.org/licenses/LICENSE-2.0)

QGen Studio enables users to leverage large language models (LLMs) to create custom question-answer datasets and fine-tune scalable, domain-adaptable models on this synthetic data. 


https://github.com/user-attachments/assets/7ba6bc92-ecc6-4318-9465-f93708392eab


## Features

- Context Focused Approach: Ensures data aligns closely with the given context yielding task-specific relevance.
- Interactivity and Control: These insights enable users to refine datasets, reducing noise and improving relevance.
- Dataset Viewer: View generated datasets along with metrics and the context they are generated from.
- Model Explorer: Test the performance and alignment of the trained models.
- Document Upload: Process PDFs, URLs, JSON files, etc. for question generation. Find sample files [here](docs/samples).
- Add Example Prompts:  Allows user to add custom examples for QA generation via an interactive interface. You can also modify the prompts used for generation [here](backend/app/utils/prompts.json).
- Usability: Supports local deployment and offers an intuitive interface, making it accessible to users across various user skill levels.


## Coming Soon!

- Complex Question Generation: Incorporate support for generation of questions of different complexity types such as multi-hop, superlative, conversational, etc.
- Extended Functionality for Downstream Tasks: Broaden the studio’s capabilities to support additional downstream tasks such as summarization, entailment, and classification, for diverse workflows.
- Multilingual Data Generation: Allow users to generate multilingual datasets and models to address tasks in various languages, fostering inclusivity and broader adoption.
- Usability Improvements: Add functionalities for precise control over the LLM prompts used for generation and the resulting QA pairs.


## Usage

### Frontend
Go to `/frontend` and run the following commands:

If you're using npm:

- `npm install` - to build the project

If you're using yarn:

- `yarn` - to install yarn
- `yarn build` - to build the project

If you do not have node.js or npm installed, please refer to [this documentation](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

### Backend
Open downloads.py and add the ids of the models you would like to download from Hugging Face to models_to_download. Then, run the following command:

`pip install -r requirements.txt && python downloads.py`

Alternatively, you can also create an enviroment using the qgen-env.yml file:

`conda env create -f environment.yml`

Navigate to `/backend/app`:

- Rename env_sample to .env
- Add your IBM Watsonx or OpenAI keys if you would like to use these frameworks.
- Add the file paths where you would like to store your data as detailed in the env file. It is recommended to create a folder called data in `/backend/app` and the corresponding subfolders.

### Running QGen Studio
Open two seperate terminals and run the following.
- Backend: from `/backend/app` run `fastapi run`
- Frontend: from `/frontend` run `npm run dev` or `yarn dev`

The studio will start at `localhost:3000`.


## References

If you use QGen Studio in your projects, please consider citing the following:

```bib
@article{Moses_Elkaref_Barry_Tanaka_Kuruvanthodi_Herr_Watson_Mel_2025,
      title={QGen Studio: An Adaptive Question-Answer Generation, Training and Evaluation Platform},
      volume={39},
      url={https://ojs.aaai.org/index.php/AAAI/article/view/35362},
      DOI={10.1609/aaai.v39i28.35362},
      abstractNote={We present QGen Studio: an adaptive question-answer generation, training, and evaluation platform. QGen Studio enables users to leverage large language models (LLMs) to create custom question-answer datasets and fine-tune models on this synthetic data. It features a dataset viewer and model explorer to streamline this process. The dataset viewer provides key metrics and visualizes the context from which the QA pairs are generated, offering insights into data quality. The model explorer supports model comparison, allowing users to contrast the performance of their trained LLMs against other models, supporting performance benchmarking and refinement. QGen Studio delivers an interactive, end-to-end solution for generating QA datasets and training scalable, domain-adaptable models. The studio will be open-sourced soon, allowing users to deploy it locally.},
      number={28},
      journal={Proceedings of the AAAI Conference on Artificial Intelligence},
      author={Moses, Movina and Elkaref, Mohab and Barry, James and Tanaka, Shinnosuke and Kuruvanthodi, Vishnudev and Herr, Nathan and Watson, Campbell D and Mel, Geeth De},
      year={2025},
      month={Apr.},
      pages={29670-29672}
}
