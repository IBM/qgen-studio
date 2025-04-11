'use client';

import React from "react";
import { useState, useEffect } from "react";
import {
    Button, Heading, Section, Tile,
    DataTable, TableContainer, Table, TableHead, TableHeader, TableRow,
    TableExpandHeader, TableBody, TableExpandRow, TableExpandedRow,
    TableCell, TableToolbar, TableToolbarContent, TableToolbarSearch, 
    TableToolbarFilter, TableToolbarMenu, TableToolbarAction,
    Popover, PopoverContent, Checkbox, Slider
} from "@carbon/react";
import { Settings, Filter } from "@carbon/icons-react";
import { getDatasets } from "@/app/api/datasets_backend";
import "./_dataset-table.scss";


export default function DatasetTable({ projectName, selectedMetrics, highlightType }) {
    const [dataEntries, setDataEntries] = useState([]);
    const [rows, setRows] = useState([]);
    const [contexts, setContexts] = useState([]);

    // For spans
    const [questionSpans, setQuestionSpans] = useState(null);
    const [answerSpans, setAnswerSpans] = useState(null);
    const [sentenceSpans, setSentenceSpans] = useState(null);

    function highlightText(context, sentenceSpan, questionSpan, answerSpan) {

        let spans = [];
        let highlightClass = '';
        let highlightedText = [];
        let lastIndex = 0;

        if (highlightType === 'question-highlight') {
            spans = questionSpan;
            highlightClass = 'teal-highlight'
        }
        if (highlightType === 'answer-highlight') {
            spans = answerSpan;
            highlightClass = 'coral-highlight'
        } 
        if (highlightType === 'context-highlight') {
            spans = sentenceSpan;
            highlightClass = 'lavender-highlight'
        }

        spans.forEach(span => {
            const [start_idx, end_idx] = [span[1], span[2]];
            if (lastIndex < start_idx) {
                highlightedText.push(context.slice(lastIndex, start_idx));
            }
            highlightedText.push(
                <span key={start_idx} className={highlightClass}>
                    {context.slice(start_idx, end_idx + 1)}
                </span>
            );
            lastIndex = end_idx + 1;
        });

        if (lastIndex < context.length) {
            highlightedText.push(context.slice(lastIndex));
        }

        return highlightedText;
    };

    const initialHeaders = [
        {
            key: 'question',
            header: 'Question',
        },
        {
            key: 'answer',
            header: 'Answer',
        }
    ];

    const headers = initialHeaders.concat(selectedMetrics)

    const fetchDataEntries = async () => {
        try {
            const data = await getDatasets(projectName);
            setDataEntries(data);
            const cs = []
            const rs = []
            const sent_spans = []
            const question_spans = []
            const answer_spans = []
            for (var i = 0; i < data.length; i++) {
                cs.push(data[i].context);
                sent_spans.push(data[i].sentence_span)
                question_spans.push(data[i].question_span)
                answer_spans.push(data[i].answer_span)
                const resultEntry = {
                    id: i,
                    question: data[i].question,
                    answer: data[i].answer,
                };
                const metrics = data[i].metrics;
                for (const metric in metrics) {
                    if (metrics.hasOwnProperty(metric)) {
                        resultEntry[metric] = parseFloat(metrics[metric].toFixed(4));
                    }
                }
                rs.push(resultEntry);
            }
            setContexts(cs);
            setRows(rs)
            setSentenceSpans(sent_spans);
            setQuestionSpans(question_spans);
            setAnswerSpans(answer_spans);
        } catch (error) {
            console.error("Error fetching data entries:", error);
        }
    };

    useEffect(() => {
        fetchDataEntries();
    }, []);

    useEffect(() => { fetchDataEntries() }, [projectName])

    return (
        <DataTable rows={rows} headers={headers} isSortable >
            {({
                rows,
                headers,
                getHeaderProps,
                getRowProps,
                getExpandedRowProps,
                getTableProps,
                getTableContainerProps,
                onInputChange
            }) =>
                <div style={{ marginTop: "2rem" }}>
                    <TableContainer title="" {...getTableContainerProps()}>
                        <TableToolbar>
                            <TableToolbarContent>
                                <TableToolbarSearch onChange={()=>{}} />
                            </TableToolbarContent>
                        </TableToolbar>
                        <Table {...getTableProps()} aria-label="sample table">
                            <TableHead>
                                <TableRow>
                                    <TableExpandHeader aria-label="expand row" />
                                    {headers.map((header, i) => (
                                        <TableHeader key={i} {...getHeaderProps({ header })}>
                                            {header.header}
                                        </TableHeader>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((row, i) => (
                                    <React.Fragment key={row.id}>
                                        <TableExpandRow {...getRowProps({ row })}>
                                            {row.cells.map(cell => (
                                                <TableCell key={cell.id}>{cell.value}</TableCell>
                                            ))}
                                        </TableExpandRow>
                                        <TableExpandedRow colSpan={headers.length + 1} className="demo-expanded-td">
                                            <div style={{ marginBottom: "0.5rem", marginTop: "0.5rem" }}>
                                                {highlightText(contexts[row.id], sentenceSpans[row.id], questionSpans[row.id], answerSpans[row.id])}
                                            </div>
                                        </TableExpandedRow>
                                    </React.Fragment>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            }

        </DataTable>
    )
}