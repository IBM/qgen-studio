'use server';

export async function getDatasets(name) {
    const res = fetch(process.env.BACKEND_URL+'/datasets/get_datasets?' + new URLSearchParams({
        project_name: name
    }).toString(), {
        method: 'GET',
    }).then(response => response.json());
    return res;
}


export async function getGeneratedDatasets() {
    const res = fetch(process.env.BACKEND_URL+'/datasets/get_generated_datasets', {
                    method: 'GET'
                }).then(response => response.json());
return res;
}