import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button, Alert, ProgressBar } from 'react-bootstrap';
import axios from 'axios';

const FileUpload = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(null);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        },
      });

      setSuccess(`File uploaded successfully! ${response.data.rows} rows processed.`);
      onUploadSuccess({
        ...response.data,
        id: response.data.filename // You might want to use actual dataset ID
      });
      
      // Store dataset ID in localStorage or state management
      localStorage.setItem('currentDataset', JSON.stringify(response.data));
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Error uploading file. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1
  });

  return (
    <div className="upload-container">
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the file here...</p>
        ) : (
          <div>
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-2">Drag & drop your Excel or CSV file here</p>
            <p className="text-sm text-gray-500">or click to select</p>
            <p className="text-xs text-gray-400 mt-2">
              Supported formats: .csv, .xlsx, .xls
            </p>
          </div>
        )}
      </div>

      {uploading && (
        <div className="mt-4">
          <ProgressBar 
            animated 
            now={progress} 
            label={`${progress}%`} 
            variant="info"
          />
          <p className="text-center mt-2">Processing your file...</p>
        </div>
      )}

      {error && (
        <Alert variant="danger" className="mt-4" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="mt-4" onClose={() => setSuccess(null)} dismissible>
          {success}
        </Alert>
      )}

      {!uploading && !error && !success && (
        <div className="mt-4 text-center">
          <Button variant="outline-primary" size="sm" onClick={() => document.querySelector('input').click()}>
            Browse Files
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;