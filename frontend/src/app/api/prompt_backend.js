'use server';

export async function getPrompts(project_name, doc_name) {
    const res = fetch(process.env.BACKEND_URL+'/prompts/get_prompts?' 
        + new URLSearchParams({
            project_name: project_name,
            doc_name: doc_name
    }).toString(), {
        method: 'GET',
    }).then(response => response.json());
    return res;
}

export async function setPrompts(project_name, doc_name, prompts) {
    const res = fetch(process.env.BACKEND_URL+'/prompts/set_prompts', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body:JSON.stringify({
            'project_name': project_name,
            'doc_name': doc_name,
            'prompts': prompts
        }),
    }).then(response => response.json());
    return res;
}