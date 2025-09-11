import React, { useState } from 'react';
import axios from 'axios';

const AdminPanel = ({ onUpdate }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [generationMessage, setGenerationMessage] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadMessage('Wybierz plik, aby go przesłać.');
      return;
    }
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadMessage(response.data.message);
    } catch (error) {
      setUploadMessage('Błąd podczas przesyłania pliku.');
    }
  };

  const handleGenerate = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/generate-json');
      setGenerationMessage(response.data.message);
    } catch (error) {
      setGenerationMessage('Błąd podczas generowania danych.');
    }
  };
  
  const handleUpdate = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/update-data');
      setUpdateMessage(response.data.message);
      onUpdate(); // Odświeżenie danych w App.js
    } catch (error) {
      setUpdateMessage('Błąd podczas aktualizowania danych.');
    }
  };

  return (
    <div style={{ border: '1px dashed #ccc', padding: '10px', marginTop: '20px' }}>
      <h4>Panel Administracyjny</h4>
      <div>
        <label>Wczytaj plik XLSX:</label>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload}>Prześlij</button>
        {uploadMessage && <p style={{ fontSize: '0.8em' }}>{uploadMessage}</p>}
      </div>
      <div style={{ marginTop: '10px' }}>
        <button onClick={handleGenerate}>Generuj pliki JSON</button>
        {generationMessage && <p style={{ fontSize: '0.8em' }}>{generationMessage}</p>}
      </div>
      <div style={{ marginTop: '10px' }}>
        <button onClick={handleUpdate}>Wczytaj nowe dane</button>
        {updateMessage && <p style={{ fontSize: '0.8em' }}>{updateMessage}</p>}
      </div>
    </div>
  );
};

export default AdminPanel;