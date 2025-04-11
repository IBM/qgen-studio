'use server';


export async function getTrainingModels() {
    const res = fetch(process.env.BACKEND_URL + '/train/get_train_models', {
        method: 'GET'
    }).then(response => response.json());
    return res;
}


export async function trainMlxModel(formData) {
    const res = fetch(process.env.BACKEND_URL + '/train/train_mlx_model', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
        .then(response => response.json());
    return res;
}