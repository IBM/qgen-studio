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
import "./_doc-groups.scss";
import { createDocumentGroup, getDocumentGroups, deleteDocumentGroup } from '@/app/api/doc_backend';

export default function DocGroups() {
    const [open, setOpen] = useState(false);
    const [rows, setRows] = useState([]);
    const [headers, setHeaders] = useState([]);
    const newProjName = useRef();

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
    // const headers = ['Name', 'Status', 'Blargh']
    const fetchModels = async () => {
        try {
            const data = await getDocumentGroups();
            const newRows = data.map((p, i) => ({
                id: p.name,
                name: p.name,
                status: 'Active',
                blargh: 'foo ' + i,
                action: <>
                    <Button kind="ghost" renderIcon={ArrowRight} href={'/doc_groups/' + p.name} style={{float: "inline-end"}} />
                    <Button kind="ghost" renderIcon={TrashCan} style={{float: "inline-end"}} onClick={()=>handleOnDelete(p.name)} />
                </>
            }))
            setRows(newRows);
        } catch (error) {
            console.error("Error fetching models:", error);
        }
    };

    const handleOnDelete = async (name) => {
        await deleteDocumentGroup(name);
        fetchModels();
    }

    useEffect(() => {
        fetchModels();
        setHeaders(initHeaders);
    }, []);

    const handleNewProject = async() => {
        const projName = newProjName.current.value;
        const res = await createDocumentGroup(projName);
        fetchModels();
        newProjName.current.value = '';
    }

    return (
        <>
        <Modal 
            open={open} 
            onRequestClose={() => setOpen(false)}
            onRequestSubmit={(e)=> {handleNewProject(); setOpen(false);}} 
            modalHeading="Add a document group" 
            primaryButtonText="Add" 
            secondaryButtonText="Cancel">
            <TextInput id="new-proj-name" ref={newProjName} type="text" labelText="Group Name" />
        </Modal>
        <DataTable rows={rows} headers={headers} isSortable useZebraStyles={false}>
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps, onInputChange }) => (
            <TableContainer>
                <TableToolbar style={{padding: "0.5rem"}}>
                    <TableToolbarContent>
                        <TableToolbarSearch onChange={onInputChange} />
                    </TableToolbarContent>
                    <Button renderIcon={FolderAdd} onClick={() => setOpen(true)}>New Group</Button>
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