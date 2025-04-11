'use server';

export async function uploadFiles(formData) {
    const res = fetch(process.env.BACKEND_URL+'/docs/upload', {
                    method: 'POST',
                    body: formData,
                })
                .then(response => response.json());
    return res;
}


export async function getDocumentGroups() {
    const res = fetch(process.env.BACKEND_URL+'/docs/get_document_groups', {
                    method: 'GET'
                }).then(response => response.json());
return res;
}


export async function createDocumentGroup(name) {
    const res = fetch(process.env.BACKEND_URL+'/docs/create_document_group', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body:JSON.stringify({'name': name}),
    }).then(response => response.json());
    return res;
}


export async function deleteDocumentGroup(name) {
    const res = fetch(process.env.BACKEND_URL+'/docs/delete_document_group', {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body:JSON.stringify({'project_name': name}),
    }).then(response => response.json());
    return res;
}


export async function listDocs(name) {
    const res = fetch(process.env.BACKEND_URL+'/docs/list_docs?' + new URLSearchParams({
        project_name: name
    }).toString(), {
        method: 'GET',
    }).then(response => response.json());
    return res;
}

export async function getDoc(project_name, doc_name) {
    const res = fetch(process.env.BACKEND_URL+'/docs/get_doc?' + new URLSearchParams({
        project_name: project_name,
        doc_name: doc_name
    }).toString(), {
        method: 'GET',
    }).then(response => response.json());
    return res;
}


export async function deleteDoc(project_name, doc_name) {
    const res = fetch(process.env.BACKEND_URL+'/docs/delete_doc', {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body:JSON.stringify({'project_name': project_name, 'doc_name': doc_name}),
    }).then(response => response.json());
    return res;
}

