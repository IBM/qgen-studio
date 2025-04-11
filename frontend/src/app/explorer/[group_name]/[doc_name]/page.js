'use client';

import { Button, Heading, Section, Tabs, TabList, Tab, TabPanels, TabPanel, Dropdown, NumberInput, Tile, TextInput, TextArea, Toggle, ComboBox, ProgressBar } from "@carbon/react";
import { ArrowRight } from "@carbon/icons-react";
import { useState, useEffect } from "react";

import {
    getTrainedModels,
    getInferenceModels,
    runInferenceMLXAdapter,
    runInferenceMLXModel
} from "../../../api/explorer_backend";
import { getDocumentGroups, listDocs } from "../../../api/doc_backend";
import { getDoc } from "@/app/api/doc_backend";
import "./explorer.scss"

export default function Page({ params }) {
    const [docTitle, setDocTitle] = useState("Document Title");
    const [docFile, setDocFile] = useState("Document Original File");
    const [docIds, setDocIds] = useState([]);
    const [docText, setDocText] = useState("Document Title");

    const [allModels, setAllModels] = useState([])
    const [inferenceModels, setInferenceModels] = useState([])
    const [trainedModels, setTrainedModels] = useState([])
    const [docGroups, setDocGroups] = useState([])
    const [docs, setDocs] = useState([])

    const [selectedDocGroup, setSelectedDocGroup] = useState(null)
    const [selectedDoc, setSelectedDoc] = useState(null)
    const [query, setQuery] = useState(null)
    const [model1, setModel1] = useState(null)
    const [model2, setModel2] = useState(null)
    const [chatEntries, setChatEntries] = useState([])

    const [showProgressBar, setShowProgressBar] = useState(false)
    const [progressBarLabel, setProgressBarLabel] = useState('Generating responses.')
    const [progressStatus, setProgressStatus] = useState('active')

    const updateProgressBar = (label, status) => {
        setProgressBarLabel(label);
        setProgressStatus(status);
    };

    const fetchDoc = async (project_name, doc_name) => {
        const res = await getDoc(project_name, doc_name);
        const { id, text, cleanDocName } = res
        setDocIds(id)
        setDocTitle(cleanDocName);
        setDocText(text);
        setSelectedDoc(cleanDocName);
        setSelectedDocGroup(project_name);
    }


    useEffect(() => {
        const fetchTrainedModels = async () => {
            try {
                const data = await getTrainedModels()
                setTrainedModels(data || []);
            } catch (error) {
                console.error("Error fetching trained models:", error);
            }
        };
        fetchTrainedModels();
    }, []);

    useEffect(() => {
        const fetchInferenceModels = async () => {
            try {
                const data = await getInferenceModels()
                setInferenceModels(data || []);
            } catch (error) {
                console.error("Error fetching inference models:", error);
            }
        };
        fetchInferenceModels();
    }, []);

    useEffect(() => {
        setAllModels([...trainedModels, ...inferenceModels]);
    }, [trainedModels, inferenceModels]);

    useEffect(() => {
        fetchDoc(decodeURI(params.group_name), decodeURI(params.doc_name));
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault();

        setShowProgressBar(true);
        updateProgressBar('Generating responses.', 'active')

        const processModel = async (model) => {
            const formData = {
                query: String(query),
                documentName: String(selectedDoc),
                documentGroup: String(selectedDocGroup),
                adapterName: trainedModels.includes(model) ? String(model) : '',
                modelId: inferenceModels.includes(model) ? String(model) : '',
            };

            try {
                const res = inferenceModels.includes(model)
                    ? await runInferenceMLXModel(formData)
                    : await runInferenceMLXAdapter(formData);

                if (res.status === 'success') {
                    console.log(`Success for ${model}:`, res);
                    return res.response;
                } else {
                    console.error(`Error for ${model}`);
                    return null;
                }
            } catch (error) {
                console.error(`Error for ${model}:`, error);
                return null;
            }
        };

        // Process both models and get their responses
        const response1 = await processModel(model1);
        const response2 = await processModel(model2);

        // Handle responses as needed
        if (response1 && response2) {
            updateProgressBar('Done!', 'finished')
            const newEntry = {
                question: query,
                model_1_answer: response1,
                model_2_answer: response2,
            };
            setChatEntries([...chatEntries, newEntry])
        } else {
            console.log('Both models failed.');
            updateProgressBar('Please try again.', 'error')
        }
    };

    return (
        <>
            <div class="box">
                <div class="row header">
                    <Heading style={{ marginBottom: "2rem" }}>Model Explorer</Heading>
                </div>
                <Tile style={{ flex: "1 1 auto", height: "100%", flexDirection: "column" }}>
                    <Section level={3} style={{ marginBottom: "1rem", marginLeft: "1rem" }}>
                        <Heading>{docTitle}</Heading>
                    </Section>
                    <div style={{ padding: "1rem", overflowY: "auto", maxHeight: "20%" }}>

                        {docIds.map((id, index) => (
                            <Section key={id} level={6} style={{ marginBottom: "1rem" }}>
                                <Heading style={{ fontSize: "0.8rem", color: "#666" }}>{id}</Heading>
                                <p>{docText[index].join(" ")}</p>
                            </Section>
                        ))}
                    </div>
                    <div style={{ display: "block", maxHeight: "75%", overflowY: "scroll" }}>
                        {chatEntries.map((c, i) => (
                            <div style={{ margin: "1rem" }}>
                                <Section level={4} style={{ marginBottom: "0.5rem" }}>
                                    <Heading>{c.question}</Heading>
                                </Section>
                                <div style={{ display: "inline-block", border: "2px solid #6A9BD1", width: "45%", padding: "0.5rem" }}>
                                    {c.model_1_answer}
                                </div>
                                <div style={{ display: "inline-block", border: "2px solid #A3BBA1", width: "45%", float: "right", padding: "0.5rem" }}>
                                    {c.model_2_answer}
                                </div>
                            </div>
                        ))}
                        {/* do not remove */}
                        <div style={{ height: "15rem" }}></div>
                    </div>
                    <Tile style={{ position: "fixed", display: "flex", flexDirection: "column", bottom: "3rem", left: "38vw", width: "40%", border: "2px solid gray", alignSelf: "flex-end" }}>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                <div style={{ flex: 1, marginRight: "1rem" }}>  {/* Flex 1 to take available space */}
                                    <ComboBox
                                        style={{ border: "2px solid #6A9BD1" }}
                                        placeholder="Model 1"
                                        onChange={({ selectedItem }) => { setModel1(selectedItem) }}
                                        id="group-selector"
                                        items={allModels}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>  {/* Flex 1 to take available space */}
                                    <ComboBox
                                        style={{ border: "2px solid #A3BBA1" }}
                                        placeholder="Model 2"
                                        onChange={({ selectedItem }) => { setModel2(selectedItem) }}
                                        id="group-selector"
                                        items={allModels}
                                    />
                                </div>
                            </div>
                            <div>
                                <TextArea
                                    style={{ border: "none", marginBottom: "0.5rem", resize: "none" }}
                                    placeholder="Enter your question"
                                    onChange={(e) => { setQuery(e.target.value) }}
                                    // helperText="Optional helper text" 
                                    rows={2}
                                    id="query" />
                            </div>
                            <div style={{ display: "flex", flexDirection: "row-reverse" }}><Button onClick={handleSubmit} renderIcon={ArrowRight} hasIconOnly></Button></div>
                            {showProgressBar && (
                                <div style={{ marginTop: "1rem" }}>
                                    <ProgressBar
                                        label=""
                                        // helperText={progressBarLabel}
                                        status={progressStatus} />
                                </div>
                            )}
                        </form>
                    </Tile>
                </Tile>
            </div>
        </>
    )
}