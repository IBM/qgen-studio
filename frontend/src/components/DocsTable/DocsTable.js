'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Button,
    DataTable,
    Table,
    TableHead,
    TableRow,
    TableHeader,
    TableBody,
    TableCell,
    TableContainer,
    TableToolbar,
    TableToolbarContent,
    TableToolbarSearch,
    Modal,
    TextInput
} from '@carbon/react';
import { FolderAdd, ArrowRight, TrashCan } from '@carbon/icons-react';
import "./_docs-table.scss";
import { listDocs } from '@/app/api/doc_backend';

export default function DocGroups({ project_name, path }) {
    const [rows, setRows] = useState([]);
    const [headers, setHeaders] = useState([]);

    const initHeaders = [
        { 
            key: 'name',
            header: 'Name'
        },
        {
            key: 'action',
            header: ''
        }
    ];

    const fetchModels = async () => {
        try {
            const data = await listDocs(project_name);
            const newRows = data.map((p, i) => ({
                id: p,
                name: p,
                action: <>
                    <Button kind="ghost" renderIcon={ArrowRight} href={path + project_name + '/' + p} style={{float: "inline-end"}} />
                </>
            }))
            setRows(newRows);
        } catch (error) {
            console.error("Error fetching models:", error);
        }
    };

    useEffect(() => {
        fetchModels();
        setHeaders(initHeaders);
    }, []);

    useEffect(() => {
        fetchModels();
    }, [project_name])

    return (
        <>
        <DataTable rows={rows} headers={headers} isSortable useZebraStyles={false}>
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps, onInputChange }) => (
            <TableContainer>
                <TableToolbar style={{padding: "0.5rem"}}>
                    <TableToolbarContent>
                        <TableToolbarSearch onChange={onInputChange} />
                    </TableToolbarContent>
                </TableToolbar>
                <Table {...getTableProps()}>
                <TableHead>
                    <TableRow>
                    {headers.map((header) => (
                        <TableHeader {...getHeaderProps({ header })}>
                        {header.header}
                        </TableHeader>
                    ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row) => (
                    <TableRow {...getRowProps({ row })}>
                        {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                        ))}
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </TableContainer>
        )}
        </DataTable>
        </>
    );
}