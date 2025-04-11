'use server';

export async function generateData (formData) {
    const res = fetch(process.env.BACKEND_URL+'/qgen/generate_data', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json', 
                },
                body: JSON.stringify(formData),
            })
            .then(response => response.json());
    return res;
}


export async function getMLXModels() {
    const res = fetch(process.env.BACKEND_URL+'/qgen/get_mlx_models', {
                    method: 'GET'
                }).then(response => response.json());
return res;
}


export async function getWatsonXModels() {
    const res = fetch(process.env.BACKEND_URL+'/qgen/get_watsonx_models', {
                    method: 'GET'
                }).then(response => response.json());
return res;
}


export async function getOpenAIModels() {
    const res = fetch(process.env.BACKEND_URL+'/qgen/get_openai_models', {
                    method: 'GET'
                }).then(response => response.json());
return res;
}


export async function getRankingMetrics() {
    const res = fetch(process.env.BACKEND_URL+'/qgen/get_ranking_metrics', {
                    method: 'GET'
                }).then(response => response.json());
return res;
}


export async function getFrameworks() {
    const res = fetch(process.env.BACKEND_URL+'/qgen/get_frameworks', {
                    method: 'GET'
                }).then(response => response.json());
return res;
}