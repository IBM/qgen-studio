"use client";

import { useEffect, useState } from "react";
import { Button, Grid, Row, Column, ContainedList, ContainedListItem, ComposedModal, ModalHeader, ModalBody, Heading, Section, Tile, FormGroup, TextInput, Stack, Dropdown } from "@carbon/react";
import { DocumentAdd, TrashCan } from "@carbon/icons-react";
import DocUploader from "@/components/DocUploader/DocUploader";
import { getDisplayName } from "next/dist/shared/lib/utils";
import { getDocumentGroups } from "../api/doc_backend";
import DocsTable from "@/components/DocsTable/DocsTable";

export default function Page({params}) {
    const [open, setOpen] = useState(false);
    const [docGroups, setDocGroups] = useState([]);
    const [projectName, setProjectName] = useState(null);
    const onClick = () => alert('CLICK!!!');

    const fetchDocGroups = async () => {
        const res = await getDocumentGroups();
        setDocGroups(res);
    }

    useEffect(()=>{
        fetchDocGroups();
    }, []);

    // useEffect(() => {
    //     alert('affected!');
    // }, [projectName])
    
    const items = ["option 1", "option 2", "option 3"];

    return (
        <>
        <div style={{display: "flex", flexFlow: "column", height: "100vh", paddingBottom: "4rem"}}>
            <Heading style={{marginBottom: "1rem"}}>Example Prompts</Heading>
            <Section style={{marginBottom: "2rem"}}>
                Select a Document Group and a Document to start adding example question-answer pairs.
            </Section>
            <Tile style={{flex: "1", marginBottom: "3rem", paddingBottom: "3rem"}}>
            <div style={{display: "flex", flexDirection: "row", height: "100%", marginBottom: "1rem"}}>
                    <div style={{minWidth: "25%", height: "100%", border: "gray solid 2px"}}>
                        <ContainedList label="Document Groups" kind="disclosed" size="md">
                            {docGroups.map((docGroup)=>
                                <ContainedListItem 
                                    // onClick={()=>handleEditPrompt(prompt.question, prompt.answer)} 
                                    onClick={()=>setProjectName(docGroup.name)}
                                    >
                                    <strong>{docGroup.name}</strong>
                                </ContainedListItem>
                            )}
                            <ContainedListItem></ContainedListItem>
                            <ContainedListItem></ContainedListItem>
                        </ContainedList>
                    </div>
                    <div style={{minWidth: "70%", marginLeft: "2rem"}}>
                        {projectName? 
                            <DocsTable project_name={projectName} path={"/prompts/"} /> : 
                            <div style={{position: "absolute", top: "50%", left: "50%"}}>
                                <strong>No Document Group Selected</strong>
                            </div> }
                    </div>
                </div>
                <div style={{display: "flex", flexFlow: "row-reverse"}}>
                <Button href="/generation">Next</Button>
                <Button kind="secondary" href="/doc_groups">Back</Button>
            </div>
            </Tile>
        </div>
        </>
    );
}