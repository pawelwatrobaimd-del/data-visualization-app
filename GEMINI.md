# GEMINI.md

## Project Overview

This is a data visualization web application designed for financial analysis. It consists of a React frontend and a Python/Flask backend. The application allows users to view financial data through various charts and tables. Administrators have the ability to upload and manage the underlying data files.

The application is configured for deployment on Google App Engine.

### Key Technologies

*   **Frontend:**
    *   React (bootstrapped with Create React App)
    *   Charting Libraries: Recharts, D3, Plotly.js
    *   HTTP Client: Axios
    *   Routing: React Router

*   **Backend:**
    *   Python
    *   Web Framework: Flask
    *   WSGI Server: Gunicorn
    *   Data Processing: Pandas, NumPy

*   **Deployment:**
    *   Google App Engine

### Architecture

The application follows a client-server architecture:

1.  **Frontend (`src/`):** A single-page application (SPA) built with React. It handles user authentication, provides the user interface for data visualization, and includes an admin panel for data management.
2.  **Backend (`backend/`):** A Flask server that exposes a RESTful API. The API handles:
    *   User authentication (`/api/login`).
    *   Serving processed data to the frontend (`/api/list-json-files`).
    *   File uploads and data processing (`/api/upload-json`).
    *   User management (`/api/users`).
3.  **Data:** The application processes `.xlsx` files, converts them to `.json`, and serves the JSON data to the frontend. User information is stored in `backend/users.json`.

## Building and Running

### Frontend

To run the frontend development server:

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Start the server:
    ```bash
    npm start
    ```
    The application will be available at [http://localhost:3000](http://localhost:3000).

### Backend

To run the backend server:

1.  Install Python dependencies:
    ```bash
    pip install -r requirements.txt
    ```
2.  Start the Flask server:
    ```bash
    python backend/server.py
    ```
    The backend API will be available at [http://localhost:8080](http://localhost:8080).

### Production

The `app.yaml` file is configured to run the application using `gunicorn`. The entrypoint is `gunicorn -b :$PORT backend.server:app`.

## Development Conventions

*   **API:** The backend provides a RESTful API under the `/api/` prefix.
*   **Authentication:** User authentication is handled via a simple username/password login that returns a role (`admin` or `user`). The user's role determines access to administrative features.
*   **Data Processing:** The `backend/processor.py` script contains the logic for converting uploaded `.xlsx` files into the `.json` format consumed by the frontend.
*   **Styling:** CSS files are located alongside their respective components (e.g., `App.css`, `FileManagementModal.css`).
*   **Code Style:** The project follows standard conventions for React and Python. The frontend uses ESLint, as configured in `package.json`.
