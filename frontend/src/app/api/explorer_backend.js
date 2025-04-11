'use server';

export async function getTrainedModels() {
    const res = fetch(process.env.BACKEND_URL + '/explorer/get_trained_models', {
        method: 'GET'
    }).then(response => response.json());
    return res;
}


export async function getInferenceModels() {
    const res = fetch(process.env.BACKEND_URL + '/explorer/get_inference_models', {
        method: 'GET'
    }).then(response => response.json());
    return res;
}


export async function runInferenceMLXAdapter(formData) {
    const res = fetch(process.env.BACKEND_URL + '/explorer/run_inference_mlx_adapter', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
        .then(response => response.json());
    return res;
}


export async function runInferenceMLXModel(formData) {
    const res = fetch(process.env.BACKEND_URL + '/explorer/run_inference_mlx_model', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
        .then(response => response.json());
    return res;
}

