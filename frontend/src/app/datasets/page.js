'use client';

import React from "react";
import { useState, useEffect } from "react";
import {
    Button, Heading, Section, Tile, ComboBox, MultiSelect, RadioButtonGroup, RadioButton
} from "@carbon/react";
import DatasetTable from "@/components/DatasetTable/DatasetTable";
import { getDocumentGroups } from "@/app/api/doc_backend";
import { getRankingMetrics } from "@/app/api/qgen_backend";


export default function Page() {
    const [docGroups, setDocGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [datasetTable, setDatasetTable] = useState(null);

    const [metrics, setMetrics] = useState([]);
    const [selectedMetrics, setSelectedMetrics] = useState([])
    const [metricsLabel, setMetricsLabel] = useState('Choose options');

    const [highlightType, setHighlightType] = useState('answer-highlight')

    const getMetricsDict = ({ selectedNames }) => {
        return selectedNames.map(selectedName => ({
            key: selectedName,
            header: selectedName
        }));
    };

    const onChange = ({ selectedItems }) => {
        if (!selectedItems || selectedItems.length === 0) {
            setSelectedMetrics([]);
            setMetricsLabel('Choose options');
            return;
        }
        const selectedNames = selectedItems.map(item => item.text);
        setSelectedMetrics(getMetricsDict({ selectedNames }));
        if (selectedItems.length === 1) {
            setMetricsLabel('Option selected');
        } else if (selectedItems.length > 1) {
            setMetricsLabel('Options selected');
        }
    };

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const data = await getRankingMetrics()
                setMetrics([
                    // { text: 'Select All', id: 'select-all' },
                    ...data.map((name, index) => ({ text: name, id: index.toString() }))
                ]);
            } catch (error) {
                console.error("Error fetching metrics:", error);
            }
        };
        fetchMetrics();
    }, []);

    const fetchDocGroups = async () => {
        const data = await getDocumentGroups();
        // const docNames = []
        // data.forEach(element => {
        //     docNames.push(element.name)
        // });
        setDocGroups(data);
    }

    useEffect(() => {
        fetchDocGroups();
    }, []);


    return (
        <>
            <Heading style={{ marginBottom: "2rem" }}>Dataset Viewer</Heading>
            <div style={{ marginBottom: "3rem", paddingBottom: "3rem" }}>
                <Tile>
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                            <ComboBox
                                onChange={({ selectedItem }) => {
                                    selectedItem ? setSelectedGroup(selectedItem.name) : null;
                                }}
                                id="group-selector"
                                items={docGroups}
                                itemToString={(dg) => (dg ? dg.name : '')}
                                titleText="Select Document Group"
                                helperText=""
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <MultiSelect
                                titleText="Select Evaluation Metrics"
                                id="metric"
                                label={metricsLabel}
                                items={metrics}
                                itemToString={item => (item && item.text) ? item.text : ''}
                                selectionFeedback="top-after-reopen"
                                onChange={onChange}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <RadioButtonGroup
                                legendText="Select text to highlight"
                                name="highlight-group"
                                valueSelected={highlightType}
                                onChange={(e) => { setHighlightType(e) }}>
                                {/* <div style={{ marginTop: "15px", display: 'flex', gap: '1rem', alignItems: 'flex-start' }}> */}
                                <RadioButton
                                    labelText={<span className="teal-highlight">Questions</span>}
                                    value="question-highlight"
                                    id="question-highlight" />
                                <RadioButton
                                    labelText={<span className="coral-highlight">Answers</span>}
                                    value="answer-highlight"
                                    id="answer-highlight" />
                                <RadioButton
                                    labelText={<span className="lavender-highlight">Context</span>}
                                    value="context-highlight"
                                    id="context-highlight" />
                                {/* </div> */}
                            </RadioButtonGroup>
                        </div>

                    </div>
                    {selectedGroup ? <DatasetTable
                        projectName={selectedGroup}
                        selectedMetrics={selectedMetrics}
                        highlightType={highlightType} /> :
                        <div style={{ margin: "5rem", top: "50%", left: "50%" }}>
                            {/* <strong>No Document Group Selected</strong> */}
                        </div>}

                </Tile>
            </div>

            <div style={{ display: "flex", flexFlow: "row-reverse" }}>
                <Button href="/training">Next</Button>
                <Button kind="secondary" href="/generation">Back</Button>
            </div>
        </>
    )
}