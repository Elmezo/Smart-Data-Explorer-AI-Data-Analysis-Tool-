import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import QueryInterface from './components/QueryInterface';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';

function App() {
  const [currentDataset, setCurrentDataset] = useState(null);

  return (
    <Router>
      <div className="App">
        <Navbar bg="dark" variant="dark" expand="lg">
          <Container>
            <Navbar.Brand as={Link} to="/">
              <img 
                src="/logo192.png" 
                width="30" 
                height="30" 
                className="d-inline-block align-top me-2" 
                alt="Logo"
              />
              Smart Data Explorer
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link as={Link} to="/">Home</Nav.Link>
                <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/query">AI Query</Nav.Link>
              </Nav>
              {currentDataset && (
                <Button variant="outline-light" size="sm">
                  Dataset: {currentDataset.filename}
                </Button>
              )}
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <Container className="mt-4">
          <Routes>
            <Route path="/" element={
              <div>
                <h1 className="text-center mb-4">Welcome to Smart Data Explorer</h1>
                <p className="text-center lead mb-4">
                  Upload your Excel or CSV file and get instant AI-powered insights
                </p>
                <FileUpload onUploadSuccess={setCurrentDataset} />
              </div>
            } />
            <Route path="/dashboard" element={
              <Dashboard dataset={currentDataset} />
            } />
            <Route path="/query" element={
              <QueryInterface dataset={currentDataset} />
            } />
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

export default App;