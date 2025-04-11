"use client";

import { useState, useEffect, useRef } from "react";
import { Button, Grid, Row, Column, ContainedList, ContainedListItem, ComposedModal, ModalHeader, ModalBody, Heading, Section, Tile, FormGroup, TextInput, TextArea, Stack, Dropdown } from "@carbon/react";
import { DocumentAdd, TrashCan } from "@carbon/icons-react";
import { useRouter } from "next/navigation";
import { getDoc } from "@/app/api/doc_backend";
import { getPrompts, setPrompts } from "@/app/api/prompt_backend";

export default function Page({params}) {
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [docTitle, setDocTitle] = useState("Document Title");
    const [docFile, setDocFile] = useState("Document Original File");
    const [docIds, setDocIds] = useState([]);
    const [docText, setDocText] = useState("Document Title");
    const [prompts, setPromptsList] = useState([]);
    const promptQuestion = useRef(null);
    const promptAnswer = useRef(null);
    const [isEditingPrompt, setEditingPrompt] = useState(false);
    
    const fetchDoc = async (project_name, doc_name) => {
        const res = await getDoc(project_name, doc_name);
        const { id, text, cleanDocName } = res
        setDocIds(id)
        setDocTitle(cleanDocName);
        setDocText(text);
    }

    const fetchPrompts = async (project_name, doc_name) => {
        const res = await getPrompts(project_name, doc_name);
        setPromptsList(res);
    }

    useEffect(()=>{
        fetchDoc(decodeURI(params.group_name), decodeURI(params.doc_name));
        fetchPrompts(decodeURI(params.group_name), decodeURI(params.doc_name));
    }, [])

    const handleAddPrompt = () => {
        const simList = prompts.filter(
            (f)=>f.question==promptQuestion.current.value
            && f.answer==promptAnswer.current.value);
        if (simList.length == 0) {
            setPromptsList(prompts.concat({
                question: promptQuestion.current.value,
                answer: promptAnswer.current.value
            }));
        }
        promptQuestion.current.value = '';
        promptAnswer.current.value = '';
        setEditingPrompt(false);
    }

    const handleDelPrompt = (q, a) => {
        setPromptsList(prompts => prompts.filter((f)=>f.question!=q||f.answer!=a));
    }

    const handleEditPrompt = (q, a) => {
        if(isEditingPrompt) { handleAddPrompt() }
        promptQuestion.current.value = q;
        promptAnswer.current.value = a;
        handleDelPrompt(q, a);
        setEditingPrompt(true);
    }

    const handleSave = async () => {
        await setPrompts(decodeURI(params.group_name), 
                         decodeURI(params.doc_name),
                         prompts);
        router.push('/prompts');
    }

    return (
        <>
        <div style={{display: "flex", flexFlow: "column", height: "95vh", paddingBottom: "4rem"}}>
            <Heading style={{marginBottom: "1rem"}}>Add Example Prompts</Heading>
            <Section style={{marginBottom: "2rem"}}>Inspect and add/remove examples of question-answer pairs to be generated from this document.</Section>
            <Tile style={{flex: "1", marginBottom: "1rem", paddingBottom: "2rem"}}>
                <div style={{display: "flex", maxHeight: "100%", marginBottom: "1rem"}}>
                    <div style={{minWidth: "25%", border: "gray solid 2px"}}>
                        <ContainedList label="Prompts" kind="disclosed" size="md">
                            {prompts.map((prompt)=>
                                <ContainedListItem 
                                    onClick={()=>handleEditPrompt(prompt.question, prompt.answer)} 
                                    action={<Button 
                                                kind="ghost" 
                                                iconDescription="Dismiss" 
                                                hasIconOnly 
                                                renderIcon={TrashCan} 
                                                onClick={()=>handleDelPrompt(prompt.question, prompt.answer)} />}>
                                    <strong>{prompt.question}</strong><br/>{prompt.answer}
                                </ContainedListItem>
                            )}
                            <ContainedListItem></ContainedListItem>
                            <ContainedListItem></ContainedListItem>
                        </ContainedList>
                    </div>
                    <div style={{display: "flex", flexDirection: "column"}}>
                        <div style={{display: "block", margin: "1rem", minWidth: "70%", overflowY: "scroll"}}>
                            <Section level={4} style={{marginBottom: "1rem"}}>
                                <Heading>{docTitle}</Heading>
                            </Section>
                                
                            {docIds.map((id, index) => (
                                <Section key={id} level={6} style={{ marginBottom: "1rem" }}>
                                    <Heading style={{ fontSize: "0.8rem", color: "#666" }}>{id}</Heading>
                                    <p>{docText[index].join(" ")}</p>
                                </Section>
                            ))}
                        </div>
                        <div style={{position: "block", display: "flex", flexFlow:"column", width: "100%", right: "0rem", bottom:"1rem", alignItems: "center"}}>
                            <div style={{width: "50%"}}>
                                <TextInput 
                                ref={promptQuestion}
                                placeholder="Question"
                                id="text-input-1" 
                                type="text" />
                            </div>
                            <div style={{width: "50%"}}>
                                <TextArea  
                                ref={promptAnswer}
                                placeholder="Answer"
                                rows={2} 
                                id="text-area-1" />
                            </div>
                            <div style={{width: "50%", display: "flex", flexFlow: "row-reverse", marginTop: "0.5rem"}}>
                                <Button onClick={handleAddPrompt}>{isEditingPrompt? 'Update Example' : 'Add Example' }</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Tile>
            <div style={{height: "2rem", display: "flex", flexFlow: "row-reverse"}}>
                <Button onClick={handleSave}>Save</Button>
                <Button kind="secondary" href="/prompts">Discard</Button>
            </div>
        </div>
        </>
    );
}