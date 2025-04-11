"use client";

import { useState } from "react";
import { Button, FileUploaderDropContainer, FileUploaderItem, ProgressBar } from "@carbon/react";
import { Upload } from "@carbon/icons-react";
import { uploadFiles } from "../../app/api/doc_backend";


export default function DocUploader({ docGroupId }) {
    const [selectedFiles, setSelectedFiles] = useState([]);

    const handleFile = (e, files) => {
        setSelectedFiles(selectedFiles => selectedFiles.concat(files.addedFiles));
    };

    const deleteFile = (id) => {
        setSelectedFiles(selectedFiles => selectedFiles.filter((f, i) => i != id));
    }

    const [showProgressBar, setShowProgressBar] = useState(false)
    const [progressBarLabel, setProgressBarLabel] = useState('Uploading')
    const [progressStatus, setProgressStatus] = useState('active')

    const updateProgressBar = (label, status) => {
        setProgressBarLabel(label);
        setProgressStatus(status);
    };

    const handleUpload = async () => {
        const formData = new FormData();
        formData.append('docGroupId', docGroupId);
        for (var i = 0; i < selectedFiles.length; i++) {
            formData.append('files', selectedFiles[i]);
        }
        try {
            setShowProgressBar(true);
            updateProgressBar('Uploading.', 'active')
            const res = await uploadFiles(formData);
            setSelectedFiles([]);
            if (res.status == 'success') {
                console.log('Success:', res);
                updateProgressBar('Finished Upload.', 'finished')
                window.location.reload();
            } else {
                updateProgressBar('Please try again.', 'error')
                console.error('Failed to generate response.');
            }
        } catch (error) {
            console.error("File upload failed", error);
            updateProgressBar('Please try again.', 'error')
        }
    }

    return (
        <>
            <p className="cds--file--label">
                Upload files
            </p>
            <p className="cds--label-description">
                Max file size is 500kb. Supported file types are .json, .zip and .pdf.
            </p>
            <FileUploaderDropContainer
                labelText='Drag and drop files here or click to upload'
                multiple={true}
                accept={['.json', '.zip', '.pdf']}
                onAddFiles={handleFile}
            />
            <br />
            {selectedFiles.length > 0 && Array.from(selectedFiles).map((file, index) => (
                <FileUploaderItem
                    key={index}
                    name={file.name}
                    status="edit"
                    onDelete={() => deleteFile(index)} />
            ))}
            <Button
                renderIcon={Upload}
                disabled={selectedFiles.length == 0}
                onClick={handleUpload}
            >
                Upload
            </Button>

            {showProgressBar && (
                <div style={{ marginTop: "1rem" }}>
                    <ProgressBar
                        label=""
                        helperText={progressBarLabel}
                        status={progressStatus} />
                </div>
            )}
        </>
    );
}