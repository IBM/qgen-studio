'use client';

import { Button, Heading, Section, Dropdown, NumberInput, Tile, Toggle, MultiSelect, RadioButtonGroup, RadioButton, TextInput, ProgressBar } from "@carbon/react";
import { useState, useEffect } from "react";
import {
    getWatsonXModels,
    getMLXModels,
    getOpenAIModels,
    getRankingMetrics,
    generateData,
    getFrameworks
} from "../../app/api/qgen_backend";
import { getDocumentGroups } from "../api/doc_backend";


export default function Page() {

    const toggleChunkText = (e) => { setChunkText(!chunkText) }

    const [models, setModels] = useState(["Select a framework"]);
    const [frameworks, setFrameworks] = useState([]);
    const [datasets, setDatasets] = useState([]);
    const [rankingMetrics, setRankingMetrics] = useState([]);


    const [selectedModel, setSelectedModel] = useState(null);
    const [selectedFramework, setSelectedFramework] = useState("not-selected");
    const [selectedDatasets, setSelectedDatasets] = useState(null);
    const [selectedRankingMetric, setSelectedRankingMetric] = useState(null);

    const [promptType, setPromptType] = useState('zero-shot');
    const [chunkText, setChunkText] = useState(true);
    const [chunkSize, setChunkSize] = useState(512);
    const [chunkOverlap, setChunkOverlap] = useState(128);
    const [numQuestions, setNumQuestions] = useState(10);

    const [maxTokens, setMaxTokens] = useState(1024)
    const [temperature, setTemperature] = useState(1.0);
    const [topP, setTopP] = useState(1.0)

    // For GPT
    const [frequencyPenalty, setFrequencyPenalty] = useState(0)
    const [presencePenalty, setPresencePenalty] = useState(0)

    // Others
    const [repetitionPenalty, setRepetitionPenalty] = useState(1)

    const [showProgressBar, setShowProgressBar] = useState(false)
    const [progressBarLabel, setProgressBarLabel] = useState('Generating question-answer pairs.')
    const [progressStatus, setProgressStatus] = useState('active')

    const updateProgressBar = (label, status) => {
        setProgressBarLabel(label);
        setProgressStatus(status);
    };

    const handleFramework = async (e) => {
        const value = e
        setSelectedFramework(value)
        if (value.toLowerCase() === 'IBM watsonx'.toLowerCase()) {
            const data = await getWatsonXModels()
            setModels(data || []);
        } else if (value.toLowerCase() === 'MLX-LM'.toLowerCase()) {
            const data = await getMLXModels()
            setModels(data || []);
        } else {
            const data = await getOpenAIModels()
            setModels(data || []);
        }
    };


    // To get list of frameworks 
    useEffect(() => {
        const fetchFrameworks = async () => {
            try {
                const data = await getFrameworks()
                setFrameworks(data || []);
            } catch (error) {
                console.error("Error fetching frameworks:", error);
            }
        };
        fetchFrameworks();
    }, []);

    // To fetch list of document groups available
    useEffect(() => {
        const fetchDocumentGroups = async () => {
            try {
                const data = await getDocumentGroups()
                const names = data.map((item) => item.name);
                setDatasets([
                    // { text: 'Select All', id: 'select-all' },
                    ...names.map((name, index) => ({ text: name, id: index.toString() }))
                ]);
            } catch (error) {
                console.error("Error fetching document groups:", error);
            }
        };
        fetchDocumentGroups();
    }, []);

    // Fetch available metrics to rank by
    useEffect(() => {
        const fetchRankingMetrics = async () => {
            try {
                const data = await getRankingMetrics()
                setRankingMetrics(data || []);
            } catch (error) {
                console.error("Error fetching metrics:", error);
            }
        };
        fetchRankingMetrics();
    }, []);

    const [datasetLabel, setDatasetLabel] = useState('Choose options');

    const onChange = ({ selectedItems }) => {
        const selectedNames = selectedItems.map(item => item.text);
        setSelectedDatasets(selectedNames)
        if (selectedItems.length === 1) {
            setDatasetLabel('Option selected');
        } else if (selectedItems.length > 1) {
            setDatasetLabel('Options selected');
        } else {
            setDatasetLabel('Choose options');
        }
    };

    const handleTemperature = (e) => {
        const value = e.target.value;
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 2) {
            setTemperature(numericValue);
        }
    };

    // What happens on clicking submit
    const handleSubmit = async (e) => {

        e.preventDefault();
        const formData = {
            model: selectedModel,
            framework: selectedFramework,
            datasets: selectedDatasets,
            promptType: promptType,
            rankingMetric: selectedRankingMetric,
            numQuestions: Number(numQuestions),
            parameters: {
                chunkText: chunkText,
                chunkSize: Number(chunkSize),
                chunkOverlap: Number(chunkOverlap),
                maxTokens: Number(maxTokens),
                temperature: Number(temperature),
                topP: Number(topP),
                frequencyPenalty: Number(frequencyPenalty),
                presencePenalty: Number(presencePenalty),
                repetitionPenalty: Number(repetitionPenalty)
            }
        };
        try {
            setShowProgressBar(true);
            updateProgressBar('Generating question-answer pairs.', 'active')
            const response = await generateData(formData);
            if (response.status == 'success') {
                // Can handle output here if needed
                console.log('Success:', response);
                updateProgressBar('Done!', 'finished')
            } else {
                console.error('Failed to generate questions');
                updateProgressBar('Please try again.', 'error')
            }
        } catch (error) {
            console.error('Error:', error);
            updateProgressBar('Please try again.', 'error')

        }
    };


    return (
        <>
            <Heading style={{ marginBottom: "2rem" }}>Question-Answer Generation</Heading>
            <Tile style={{ marginBottom: "2rem" }}>
                <form onSubmit={handleSubmit}>
                    <Section level={4} style={{ paddingBottom: "3rem" }}>
                        <Heading style={{ marginBottom: "1rem" }}>Framework</Heading>
                        Select framework for generation
                        <Dropdown
                            style={{ float: "right" }}
                            id="framework"
                            initialSelectedItem={0}
                            label="Select a Framework"
                            type="inline"
                            items={frameworks}
                            onChange={(e) => handleFramework(e.selectedItem)}
                        />
                    </Section>
                    <Section level={4} style={{ paddingBottom: "3rem" }}>
                        <Heading style={{ marginBottom: "1rem" }}>Model</Heading>
                        Select model to use for generating questions
                        <Dropdown
                            style={{ float: "right" }}
                            id="model"
                            initialSelectedItem={0}
                            label="Select a model"
                            type="inline"
                            items={models}
                            onChange={(e) => setSelectedModel(e.selectedItem)}
                        />
                    </Section>
                    <Section level={4} style={{ paddingBottom: "3rem" }}>
                        <Heading style={{ marginBottom: "1rem" }}>Dataset</Heading>
                        <div style={{ marginBottom: "2rem" }}>
                            Select dataset to use for generating questions
                            <div style={{
                                float: "right"
                            }}>
                                <MultiSelect
                                    label={datasetLabel}
                                    id="dataset"
                                    items={datasets}
                                    type="inline"
                                    itemToString={item => (item && item.text) ? item.text : ''}
                                    selectionFeedback="top-after-reopen"
                                    onChange={onChange} />
                            </div>
                        </div>
                        <div style={{ marginBottom: "0.5rem" }}>
                            Chunk Text?
                            <div style={{ marginRight: "3rem" }}>
                                <Toggle
                                    size="sm"
                                    labelA="No"
                                    labelB="Yes"
                                    defaultToggled
                                    id="chunkText"
                                    onToggle={(toggled) => setChunkText(toggled)}
                                />
                            </div>
                        </div>
                        <div hidden={!chunkText} style={{ marginBottom: "1rem" }}>
                            Select chunk size
                            <div style={{ float: "right", width: "10rem" }}>
                                <NumberInput
                                    id="chunkSize"
                                    min={128} max={4096} value={chunkSize} step={128}
                                    invalidText="Number is not valid"
                                    onChange={(e, value) => setChunkSize(value.value)}
                                    size="sm"
                                />
                            </div>
                        </div>
                        <div hidden={!chunkText} style={{ marginBottom: "0.5rem" }}>
                            Select chunk overlap
                            <div style={{ float: "right", width: "10rem" }}>
                                <NumberInput
                                    id="chunkOverlap"
                                    min={0} max={1024} value={chunkOverlap} step={1}
                                    invalidText="Number is not valid"
                                    onChange={(e, value) => setChunkOverlap(value.value)}
                                    size="sm"
                                />
                            </div>
                        </div>
                    </Section>
                    <Section level={4} style={{ paddingBottom: "2rem" }}>
                        <Heading style={{ marginBottom: "1rem" }}>Prompt Type</Heading>
                        Select the type of prompt for generation
                        <div style={{ float: "right", width: "15rem" }}>
                            <RadioButtonGroup legendText=""
                                name="prompt-buttons"
                                defaultSelected="zero-shot"
                                onChange={(value) => { setPromptType(value) }}>
                                <RadioButton labelText="Zero-Shot" value="zero-shot" id="zero-shot" />
                                <RadioButton labelText="Few-Shot" value="few-shot" id="few-shot" />
                            </RadioButtonGroup>
                        </div>
                    </Section>
                    <Section level={4} style={{ paddingBottom: "3rem" }}>
                        <Heading style={{ marginBottom: "1rem" }}>Number of Questions</Heading>
                        Select number of questions to generate per passage
                        <div style={{ float: "right", width: "10rem" }}>
                            <NumberInput
                                id="numQuestions"
                                min={1} max={50}
                                invalidText="Number is not valid"
                                value={numQuestions}
                                onChange={(e, value) => setNumQuestions(value.value)}
                                size="sm"
                            />
                        </div>
                    </Section>
                    <Section level={4} style={{ paddingBottom: "2rem" }}>
                        <Heading style={{ marginBottom: "1rem" }}>Ranking Metric</Heading>
                        Select evaluation metric with which to rank questions
                        <Dropdown
                            style={{ float: "right" }}
                            id="rankingMetric"
                            initialSelectedItem={0}
                            label="Select ranking metric"
                            type="inline"
                            items={rankingMetrics}
                            onChange={(e) => setSelectedRankingMetric(e.selectedItem)}
                        />
                    </Section>

                    {/* Generation Parameters */}

                    <Section level={4} style={{ paddingBottom: "3rem" }}>
                        <Heading style={{ marginBottom: "1rem" }}>Generation Parameters</Heading>

                        {/* Max Tokens */}
                        <div style={{ marginBottom: "2rem" }}>
                            Maximum Completion Tokens
                            <div style={{ float: "right", width: "10rem" }}>
                                <NumberInput
                                    id="maxTokens"
                                    min={128} max={2048} step={128}
                                    invalidText="Number is not valid"
                                    value={maxTokens}
                                    onChange={(e, value) => setMaxTokens(value.value)}
                                    size="sm"
                                />
                            </div>
                        </div>



                        {/* Top p */}
                        <div style={{ marginBottom: "2rem" }}>
                            top_p
                            <div style={{ float: "right", width: "10rem" }}>
                                <NumberInput
                                    id="topP"
                                    min={0} max={1} step={0.10}
                                    invalidText="Number is not valid"
                                    value={topP}
                                    onChange={(e, value) => setTopP(value.value)}
                                    size="sm"
                                />
                            </div>
                        </div>

                        {/* MLX */}

                        {selectedFramework.toLowerCase() === 'MLX-LM'.toLowerCase() && (
                            <div>
                                <div style={{ marginBottom: "2rem" }}>
                                    Repetition Penalty
                                    <div style={{ float: "right", width: "10rem" }}>
                                        <NumberInput
                                            id="repetitionPenalty"
                                            min={1.00} max={2.00} step={0.10}
                                            invalidText="Number is not valid"
                                            value={repetitionPenalty}
                                            onChange={(e, value) => setRepetitionPenalty(value.value)}
                                            size="sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* For watsonx */}
                        {selectedFramework.toLowerCase() === 'IBM watsonx'.toLowerCase() && (
                            <div>
                                <div style={{ marginBottom: "2rem" }}>
                                    Temperature
                                    <div style={{ float: "right", width: "10rem" }}>
                                        <TextInput
                                            id="temperature"
                                            type="text"
                                            defaultValue={temperature}
                                            onChange={(e) => handleTemperature(e)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* For GPT */}

                        {selectedFramework.toLowerCase() === 'OpenAI'.toLowerCase() && (
                            <div>
                                <div style={{ marginBottom: "2rem" }}>
                                    Temperature
                                    <div style={{ float: "right", width: "10rem" }}>
                                        <TextInput
                                            id="temperature"
                                            type="text"
                                            defaultValue={temperature}
                                            onChange={(e) => handleTemperature(e)}
                                        />
                                    </div>
                                </div>
                                <div style={{ marginBottom: "2rem" }}>
                                    Frequency Penalty
                                    <div style={{ float: "right", width: "10rem" }}>
                                        <NumberInput
                                            id="frequencyPenalty"
                                            min={-2.00} max={2.00} step={0.10}
                                            invalidText="Number is not valid"
                                            value={frequencyPenalty}
                                            onChange={(e, value) => setFrequencyPenalty(value.value)}
                                            size="sm"
                                        />
                                    </div>
                                </div>
                                <div style={{ marginBottom: "2rem" }}>
                                    Presence Penalty
                                    <div style={{ float: "right", width: "10rem" }}>
                                        <NumberInput
                                            id="presencePenalty"
                                            min={-2.00} max={2.00} step={0.10}
                                            invalidText="Number is not valid"
                                            value={presencePenalty}
                                            onChange={(e, value) => setPresencePenalty(value.value)}
                                            size="sm"
                                        />
                                    </div>
                                </div>
                            </div>)}

                    </Section>

                    <Button kind="tertiary" href="/generation" style={{ marginRight: "0.5rem" }}>Reset to default settings</Button>
                    <Button type="submit" kind="primary" onClick={handleSubmit}>Generate</Button>

                    {showProgressBar && (
                        <div style={{ marginTop: "1rem" }}>
                            <ProgressBar
                                label=""
                                helperText={progressBarLabel}
                                status={progressStatus} />
                        </div>
                    )}

                </form>
            </Tile>
            <div style={{ display: "flex", flexFlow: "row-reverse" }}>
                <Button href="/datasets">Next</Button>
                <Button kind="secondary" href="/prompts">Back</Button>
            </div>
        </>
    )
}