import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FileManagementModal.css';

const FileManagementModal = ({ onClose, onUpdate }) => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [stage, setStage] = useState('initial'); // 'initial', 'show_list', 'decision', 'replace_select', 'confirm'
  const [fileToReplace, setFileToReplace] = useState('');

  const fetchFiles = async () => {
    try {
      const response = await axios.get('https://analiza-finansowa.lm.r.appspot.com/api/list-json-files');
      setFiles(response.data);
    } catch (error) {
      setMessage('Błąd podczas ładowania listy plików.');
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setMessage('');
      setStage('decision'); // Correctly transition to the 'decision' stage without calling the server
    }
  };

  const handleActionDecision = (action) => {
    if (action === 'add') {
      handleFinalUpload('add');
    } else if (action === 'replace') {
      setStage('replace_select');
    }
  };

  const handleFinalUpload = async (action, oldFilename = null) => {
    if (!selectedFile) {
      setMessage('Błąd: Nie wybrano pliku do wgrania.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('action', action);
    if (oldFilename) {
      formData.append('old_filename', oldFilename);
    }

    try {
      const response = await axios.post('https://analiza-finansowa.lm.r.appspot.com/api/upload-json', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage(response.data.message);
      setStage('initial');
      setSelectedFile(null);
      setFileToReplace('');
      onUpdate();
      fetchFiles();
    } catch (error) {
      setMessage(`Błąd: ${error.response?.data?.message || 'Nieznany błąd'}`);
    }
  };

  const renderModalBody = () => {
    switch (stage) {
      case 'initial':
        return (
          <div className="file-actions">
            <button onClick={() => setStage('show_list')}>Pokaż listę plików JSON</button>
            <div className="upload-area">
              <label>Wgraj nowy plik JSON:</label>
              <input type="file" onChange={handleFileChange} accept=".json" />
            </div>
          </div>
        );
      case 'show_list':
        return (
          <div className="file-list-container">
            <h4>Lista plików w folderze `public`</h4>
            <ul className="file-list">
              {files.length > 0 ? (
                files.map((file, index) => (
                  <li key={index}>
                    <strong>{file.name}</strong> - Wgrano: {file.timestamp}
                  </li>
                ))
              ) : (
                <li>Brak plików JSON.</li>
              )}
            </ul>
            <button onClick={() => setStage('initial')}>Wróć</button>
          </div>
        );
      case 'decision':
        return (
          <>
            <p>Wybierz akcję dla pliku "{selectedFile?.name}":</p>
            <div className="decision-buttons">
              <button onClick={() => handleActionDecision('add')}>Dodaj jako nowy plik</button>
              <button onClick={() => handleActionDecision('replace')}>Zastąp istniejący</button>
            </div>
          </>
        );
      case 'replace_select':
        return (
          <>
            <p>Wybierz plik do zastąpienia:</p>
            <select value={fileToReplace} onChange={(e) => setFileToReplace(e.target.value)}>
              <option value="">-- Wybierz plik --</option>
              {files.map(file => (
                <option key={file.name} value={file.name}>{file.name}</option>
              ))}
            </select>
            {fileToReplace && (
              <div className="upload-prompt">
                <p>Zastąpić plik "{fileToReplace}" plikiem "{selectedFile?.name}"?</p>
                <button onClick={() => handleFinalUpload('replace', fileToReplace)}>Tak</button>
                <button onClick={() => setStage('decision')}>Nie</button>
              </div>
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Zarządzanie plikami JSON</h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {message && <p className="message">{message}</p>}
          {renderModalBody()}
        </div>
      </div>
    </div>
  );
};

export default FileManagementModal;