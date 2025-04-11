"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Button, Grid, Row, Column, ContainedList, ContainedListItem, ComposedModal, ModalHeader, ModalBody, ModalFooter, Heading, Section, Tile } from "@carbon/react";
import { DocumentAdd, TrashCan } from "@carbon/icons-react";
import DocUploader from "@/components/DocUploader/DocUploader";
import { listDocs, getDoc, deleteDocumentGroup, deleteDoc } from "@/app/api/doc_backend";

export default function Page({params}) {
    const router = useRouter();

    const [docGroupId, setDocGroupId] = useState(decodeURI(params.id))
    const [addDocOpen, setAddDocOpen] = useState(false);
    const [delGroupOpen, setDelGroupOpen] = useState(false);
    const [delDocOpen, setDelDocOpen] = useState(false);
    const [delDocTitle, setDelDocTitle] = useState('');
    const [docList, setDocList] = useState([]);
    const [docTitle, setDocTitle] = useState("No Document Selected");
    const [docIds, setDocIds] = useState([]);
    const [docText, setDocText] = useState("");

    const fetchDocs = async (project_name) => {
        const res = await listDocs(project_name);
        setDocList(res);
    }

    const fetchDoc = async (project_name, doc_name) => {
        const res = await getDoc(project_name, doc_name);
        const { id, text, cleanDocName } = res
        setDocIds(id)
        setDocTitle(cleanDocName);
        setDocText(text);
    }

    const handleDelDocModal = (docName) => {
        setDelDocTitle(docName);
        setDelDocOpen(true);
    }

    const handleDelDoc = async () => {
        if (docTitle == delDocTitle) {
            setDocTitle("No Document Selected");
            setDocText("");
        }
        await deleteDoc(docGroupId, delDocTitle);
        fetchDocs(docGroupId);
        setDelDocOpen(false);
    }

    const handleDelGroup = async () => {
        await deleteDocumentGroup(docGroupId);
        router.push('/doc_groups');
    }

    useEffect(()=>{
        fetchDocs(docGroupId);
        // fetchDoc(decodeURI(params.id), "id_1.json");
    }, [])
    
    return (
        <>
        <Heading style={{marginBottom: "1rem"}}>{docGroupId} <Button kind="danger--tertiary" renderIcon={TrashCan}  style={{float: "right"}} onClick={()=>setDelGroupOpen(true)}>Delete Document Group</Button></Heading>
        <Section style={{marginBottom: "2rem"}}>Inspect and add/remove documents.</Section>
        <ComposedModal 
            open={addDocOpen} 
            onClose={() => setAddDocOpen(false)} >
            <ModalBody>
                <Section level={4} style={{marginBottom: "1rem"}}><Heading>Add Documents</Heading></Section>
                <DocUploader docGroupId={docGroupId}/>
            </ModalBody>
        </ComposedModal>
        <ComposedModal 
            open={delGroupOpen} 
            onClose={() => setDelGroupOpen(false)} >
            <ModalBody>
                <Section level={4}>
                    <Heading style={{marginBottom: "1rem"}}>
                        Are you sure you want to delete the group {docGroupId}?
                    </Heading>
                    This will also delete {docList.length} documents.
                </Section>
            </ModalBody>
            <ModalFooter 
                danger 
                primaryButtonText="Delete Group" 
                secondaryButtonText="Cancel" 
                onRequestSubmit={handleDelGroup}/>
        </ComposedModal>
        <ComposedModal 
            open={delDocOpen} 
            onClose={() => setDelDocOpen(false)} >
            <ModalBody>
                <Section level={4}>
                    <Heading>
                        Are you sure you want to delete {delDocTitle}?
                    </Heading>
                </Section>
            </ModalBody>
            <ModalFooter 
                danger 
                primaryButtonText="Delete Document" 
                secondaryButtonText="Cancel" 
                onRequestSubmit={handleDelDoc}/>
        </ComposedModal>
        <Tile style={{position: "absolute", height: "75%", width: "80%"}}>
            <div style={{position: "absolute", height: "95%", width: "100%"}}>
                <Grid style={{width: "100%", height: "100%"}} narrow>
                    {/* <Row style={{backgroundColor: "green", width: "100%"}}> */}
                        <Column lg={4} md={2} style={{overflowY: "scroll", border: "gray solid 2px", paddingTop: "0rem"}}>
                            <ContainedList label="Documents" kind="disclosed" size="md">
                                {docList.map((docName)=>
                                    <ContainedListItem 
                                        onClick={()=>fetchDoc(docGroupId, docName)} 
                                        action={<Button 
                                                    kind="ghost" 
                                                    iconDescription="Dismiss" 
                                                    hasIconOnly 
                                                    renderIcon={TrashCan} 
                                                    onClick={()=>handleDelDocModal(docName)} />}>
                                        {docName}
                                    </ContainedListItem>
                                )}
                                <ContainedListItem></ContainedListItem>
                                <ContainedListItem></ContainedListItem>
                            </ContainedList>
                            <Button renderIcon={DocumentAdd} style={{position: "absolute", bottom: "1rem", left: "5%", width: "16%"}} onClick={() => setAddDocOpen(true)}>Add Document</Button>
                        </Column>
                        <Column lg={12} md={6} style={{overflowY: "scroll"}}>
                            <Section level={4} style={{marginBottom: "1rem"}}>
                            <Heading>{docTitle}</Heading>
                            </Section>
                            
                            {docIds.map((id, index) => (
                                <Section key={id} level={6} style={{ marginBottom: "1rem" }}>
                                    <Heading style={{ fontSize: "0.8rem", color: "#666" }}>{id}</Heading>
                                    <p><pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{docText[index].join(" ")}</pre></p>
                                </Section>
                            ))}

                        </Column>
                    {/* </Row> */}
                </Grid>
            </div>
        </Tile>
        </>
    );
}