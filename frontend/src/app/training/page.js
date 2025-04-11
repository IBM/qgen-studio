'use client';

import { Button, Heading, Section, Tabs, TabList, Tab, TabPanels, TabPanel, Dropdown, NumberInput, Tile, TextInput, Toggle, MultiSelect, ProgressBar } from "@carbon/react";
import { useState, useEffect } from "react";
import {
    getTrainingModels,
    trainMlxModel
} from "../../app/api/train_backend";
import { getGeneratedDatasets } from "../api/datasets_backend";


export default function Page() {

    const [models, setModels] = useState([]);
    const [datasets, setDatasets] = useState([]);

    const [selectedModel, setSelectedModel] = useState(null);
    const [selectedDatasets, setSelectedDatasets] = useState(null);

    const [adapterName, setAdapterName] = useState(null)

    const [filterDataset, setFilterDataset] = useState(false)
    const [bleu2, setBleu2] = useState(0.0)
    const [bleu4, setBleu4] = useState(0.0)
    const [rouge1, setRouge1] = useState(0.0)
    const [rouge2, setRouge2] = useState(0.0)
    const [rougeL, setRougeL] = useState(0.0)
    const [tfIdf, setTfIdf] = useState(0.0)
    const [cosine, setCosine] = useState(0.0)

    const [shuffle, setShuffle] = useState(false)
    const [includeContext, setIncludeContext] = useState(false)
    const [validSplit, setValidSplit] = useState(0.2)
    const [testSplit, setTestSplit] = useState(0.0)

    const [iterations, setIterations] = useState(100);
    const [loraLayers, setLoraLayers] = useState(16)
    const [batchSize, setBatchSize] = useState(4)
    const [learningRate, setLearningRate] = useState(1e-5)
    const [stepsPerEval, setStepsPerEval] = useState(200)
    const [maxSeqLength, setMaxSeqLength] = useState(2048)

    const [showProgressBar, setShowProgressBar] = useState(false)
    const [progressBarLabel, setProgressBarLabel] = useState('Training.')
    const [progressStatus, setProgressStatus] = useState('active')

    const updateProgressBar = (label, status) => {
        setProgressBarLabel(label);
        setProgressStatus(status);
    };


    // To get list of models 
    useEffect(() => {
        const fetchModels = async () => {
            try {
                const data = await getTrainingModels()
                setModels(data || []);
            } catch (error) {
                console.error("Error fetching models:", error);
            }
        };
        fetchModels();
    }, []);

    const handleLearningRate = (e) => {
        const value = e.target.value;
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue)) {
            setLearningRate(numericValue);
        }
    };

    const handleValidSplit = (e) => {
        const value = e.target.value;
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 1) {
            setValidSplit(numericValue);
        }
    };

    const handleTestSplit = (e) => {
        const value = e.target.value;
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 1) {
            setTestSplit(numericValue);
        }
    };

    // To fetch list of document groups available
    useEffect(() => {
        const fetchGeneratedDatasets = async () => {
            try {
                const data = await getGeneratedDatasets()
                setDatasets([
                    // { text: 'Select All', id: 'select-all' },
                    ...data.map((name, index) => ({ text: name, id: index.toString() }))
                ]);
            } catch (error) {
                console.error("Error fetching document groups:", error);
            }
        };
        fetchGeneratedDatasets();
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

    // What happens on clicking submit
    const handleSubmit = async (e) => {

        e.preventDefault();
        const formData = {
            model: selectedModel,
            datasets: selectedDatasets,
            adapterName: adapterName,
            filterDataset: filterDataset,
            dataParams: {
                shuffle: shuffle,
                includeContext: includeContext,
                validSplit: Number(validSplit),
                testSplit: Number(testSplit),
            },
            metrics: {
                bleu2: bleu2,
                bleu4: bleu4,
                rouge1: rouge1,
                rouge2: rouge2,
                rougeL: rougeL,
                tfIdf: tfIdf,
                cosine: cosine
            },
            parameters: {
                iters: Number(iterations),
                loraLayers: Number(loraLayers),
                batchSize: Number(batchSize),
                learningRate: Number(learningRate),
                stepsPerEval: Number(stepsPerEval),
                maxSeqLength: Number(maxSeqLength),
            }
        };

        try {
            setShowProgressBar(true);
            updateProgressBar('Training.', 'active')
            const response = await trainMlxModel(formData);
            if (response.status == 'success') {
                console.log('Success:', response);
                updateProgressBar('Done!', 'finished')
            } else {
                console.error('Failed to start training.');
                updateProgressBar('Please try again.', 'error')
            }
        } catch (error) {
            console.error('Error:', error);
            updateProgressBar('Please try again.', 'error')
        }
    };


    return (
        <>
            <Heading style={{ marginBottom: "2rem" }}>Train Models</Heading>
            <Tile style={{ marginBottom: "2rem", paddingTop: "0", paddingLeft: "0" }}>
                <Tabs>
                    {/* <TabList contained>
                        <Tab>Train Model</Tab>
                        <Tab>Test Model</Tab>
                    </TabList> */}
                    <TabPanels>
                        <TabPanel>

                            <form onSubmit={handleSubmit}>

                                {/* Model */}
                                <Section level={4} style={{ paddingBottom: "3rem" }}>
                                    <Heading style={{ marginBottom: "1rem" }}>Model</Heading>
                                    Select model for training
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

                                {/* Dataset */}
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

                                    {/* Filter Dataset */}
                                    <div style={{ marginBottom: "1rem" }}>
                                        Would you like to filter the dataset based on evaluation metrics?
                                        <div style={{ float: "right", marginRight: "3.5rem" }}>
                                            <Toggle
                                                size="sm"
                                                labelA="No"
                                                labelB="Yes"
                                                id="filterDataset"
                                                onToggle={(toggled) => setFilterDataset(toggled)}
                                            />
                                        </div>
                                    </div>

                                    <div hidden={!filterDataset} >
                                        <div style={{ marginBottom: "2rem" }}>
                                            <div style={{ display: "flex", gap: "2rem" }}>
                                                <div style={{ width: "10rem" }}>
                                                    BLEU2
                                                    <TextInput
                                                        id="bleu2"
                                                        type="text"
                                                        defaultValue={bleu2}
                                                        onChange={(e) => setBleu2(Number(e.target.value))}
                                                    />
                                                </div>
                                                <div style={{ width: "10rem" }}>
                                                    BLEU4
                                                    <TextInput
                                                        id="bleu4"
                                                        type="text"
                                                        defaultValue={bleu4}
                                                        onChange={(e) => setBleu4(Number(e.target.value))}
                                                    />
                                                </div>
                                                <div style={{ width: "10rem" }}>
                                                    Rouge1
                                                    <TextInput
                                                        id="rouge1"
                                                        type="text"
                                                        defaultValue={rouge1}
                                                        onChange={(e) => setRouge1(Number(e.target.value))}
                                                    />
                                                </div>
                                                <div style={{ width: "10rem" }}>
                                                    Rouge2
                                                    <TextInput
                                                        id="rouge2"
                                                        type="text"
                                                        defaultValue={rouge2}
                                                        onChange={(e) => setRouge2(Number(e.target.value))}
                                                    />
                                                </div>
                                                <div style={{ width: "10rem" }}>
                                                    RougeL
                                                    <TextInput
                                                        id="rougeL"
                                                        type="text"
                                                        defaultValue={rougeL}
                                                        onChange={(e) => setRougeL(Number(e.target.value))}
                                                    />
                                                </div>
                                                <div style={{ width: "10rem" }}>
                                                    TF IDF
                                                    <TextInput
                                                        id="tfIdf"
                                                        type="text"
                                                        defaultValue={tfIdf}
                                                        onChange={(e) => setTfIdf(Number(e.target.value))}
                                                    />
                                                </div>
                                                <div style={{ width: "10rem" }}>
                                                    Cosine
                                                    <TextInput
                                                        id="cosine"
                                                        type="text"
                                                        defaultValue={cosine}
                                                        onChange={(e) => setCosine(Number(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Shuffe */}
                                    <div style={{ marginBottom: "1rem" }}>
                                        Shuffle Dataset
                                        <div style={{ float: "right", marginRight: "3.5rem" }}>
                                            <Toggle
                                                size="sm"
                                                labelA="No"
                                                labelB="Yes"
                                                id="shuffle"
                                                onToggle={(toggled) => setShuffle(toggled)}
                                            />
                                        </div>
                                    </div>

                                    {/* With Context */}
                                    <div style={{ marginBottom: "1.5rem" }}>
                                        Include Context
                                        <div style={{ float: "right", marginRight: "3.5rem" }}>
                                            <Toggle
                                                size="sm"
                                                labelA="No"
                                                labelB="Yes"
                                                id="includeContext"
                                                onToggle={(toggled) => setIncludeContext(toggled)}
                                            />
                                        </div>
                                    </div>

                                    {/* Validation Split */}
                                    <div style={{ marginBottom: "1.5rem" }}>
                                        Set Validation Split Ratio
                                        <div style={{ float: "right", width: "10rem" }}>
                                            <TextInput
                                                id="validSplit"
                                                type="text"
                                                defaultValue={validSplit}
                                                onChange={(e) => handleValidSplit(e)}
                                            />
                                        </div>
                                    </div>

                                    {/* Test Split */}
                                    <div>
                                        Set Test Split Ratio
                                        <div style={{ float: "right", width: "10rem" }}>
                                            <TextInput
                                                id="testSplit"
                                                type="text"
                                                defaultValue={testSplit}
                                                onChange={(e) => handleTestSplit(e)}
                                            />
                                        </div>
                                    </div>


                                </Section>

                                {/* Model Name */}
                                <Section level={4} style={{ paddingBottom: "3rem" }}>
                                    <Heading style={{ marginBottom: "1rem" }}>Model Name</Heading>
                                    <div>
                                        Enter name of trained model
                                        <div style={{ float: "right", width: "10rem" }}>
                                            <TextInput
                                                id="adapterName"
                                                type="text"
                                                defaultValue={adapterName}
                                                onChange={(e) => setAdapterName(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </Section>

                                {/* Iterations */}
                                <Section level={4} style={{ paddingBottom: "3rem" }}>
                                    <Heading style={{ marginBottom: "1rem" }}>Number of Iterations</Heading>
                                    <div>
                                        Select number of train iterations
                                        <div style={{ float: "right", width: "10rem" }}>
                                            <NumberInput
                                                id="iterations"
                                                min={10} max={10000} step={10}
                                                invalidText="Number is not valid"
                                                value={iterations}
                                                onChange={(e, value) => setIterations(value.value)}
                                                size="sm"
                                            />
                                        </div>
                                    </div>
                                </Section>

                                {/* Lora Layers */}
                                <Section level={4} style={{ paddingBottom: "3rem" }}>
                                    <Heading style={{ marginBottom: "1rem" }}>Number of Lora Layers</Heading>
                                    <div>
                                        Select number of lora layers
                                        <div style={{ float: "right", width: "10rem" }}>
                                            <NumberInput
                                                id="loraLayers"
                                                min={2} max={128} step={2}
                                                invalidText="Number is not valid"
                                                value={loraLayers}
                                                onChange={(e, value) => setLoraLayers(value.value)}
                                                size="sm"
                                            />
                                        </div>
                                    </div>
                                </Section>

                                {/* Batch Size */}
                                <Section level={4} style={{ paddingBottom: "3rem" }}>
                                    <Heading style={{ marginBottom: "1rem" }}>Training Batch Size</Heading>
                                    <div>
                                        Set training batch size
                                        <div style={{ float: "right", width: "10rem" }}>
                                            <NumberInput
                                                id="batchSize"
                                                min={2} max={128} step={1}
                                                invalidText="Number is not valid"
                                                value={batchSize}
                                                onChange={(e, value) => setBatchSize(value.value)}
                                                size="sm"
                                            />
                                        </div>
                                    </div>
                                </Section>

                                {/* Learning Rate */}
                                <Section level={4} style={{ paddingBottom: "3rem" }}>
                                    <Heading style={{ marginBottom: "1rem" }}>Learning Rate</Heading>
                                    <div>
                                        Set learning rate
                                        <div style={{ float: "right", width: "10rem" }}>
                                            <TextInput
                                                id="learningRate"
                                                type="text"
                                                defaultValue={learningRate}
                                                onChange={(e) => handleLearningRate(e)}
                                            />
                                        </div>
                                    </div>
                                </Section>

                                {/* steps-per-eval */}
                                <Section level={4} style={{ paddingBottom: "3rem" }}>
                                    <Heading style={{ marginBottom: "1rem" }}>Steps per Eval</Heading>
                                    <div>
                                        Set steps per eval
                                        <div style={{ float: "right", width: "10rem" }}>
                                            <NumberInput
                                                id="stepsPerEval"
                                                min={2} max={10000} step={1}
                                                invalidText="Number is not valid"
                                                value={stepsPerEval}
                                                onChange={(e, value) => setStepsPerEval(value.value)}
                                                size="sm"
                                            />
                                        </div>
                                    </div>
                                </Section>

                                {/* Max Seq Length */}
                                <Section level={4} style={{ paddingBottom: "3rem" }}>
                                    <Heading style={{ marginBottom: "1rem" }}>Maximum Sequence Length</Heading>
                                    <div>
                                        Set maximum sequence length
                                        <div style={{ float: "right", width: "10rem" }}>
                                            <NumberInput
                                                id="maxSeqLength"
                                                min={128} max={5096} step={128}
                                                invalidText="Number is not valid"
                                                value={maxSeqLength}
                                                onChange={(e, value) => setMaxSeqLength(value.value)}
                                                size="sm"
                                            />
                                        </div>
                                    </div>
                                </Section>

                                <Button kind="tertiary" href="/training" style={{ marginRight: "0.5rem" }}>Reset to default settings</Button>
                                <Button type="submit" kind="primary" onClick={handleSubmit}>Train Model</Button>

                                {showProgressBar && (
                                    <div style={{ marginTop: "1rem" }}>
                                        <ProgressBar
                                            label=""
                                            helperText={progressBarLabel}
                                            status={progressStatus} />
                                    </div>
                                )}


                            </form>

                        </TabPanel>
                        <TabPanel>Tab Panel 2</TabPanel>
                    </TabPanels>
                </Tabs>
            </Tile>
            <div style={{ display: "flex", flexFlow: "row-reverse" }}>
                <Button href="/explorer">Next</Button>
                <Button kind="secondary" href="/datasets">Back</Button>
            </div>
        </>
    )
}