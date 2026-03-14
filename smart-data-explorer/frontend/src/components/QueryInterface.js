import React, { useState } from 'react';
import { Card, Form, Button, Spinner, Alert, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';

const QueryInterface = ({ dataset }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const datasetId = 'temp-id'; // Replace with actual dataset ID
      const result = await axios.post('http://localhost:8000/query', {
        query: query,
        dataset_id: datasetId
      });
      
      setResponse(result.data);
      setHistory(prev => [...prev, { query, response: result.data, timestamp: new Date() }]);
      setQuery('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to process query');
    } finally {
      setLoading(false);
    }
  };

  if (!dataset) {
    return (
      <Alert variant="info">
        Please upload a dataset first to use the AI query feature.
      </Alert>
    );
  }

  const suggestedQuestions = [
    "What is the top selling product?",
    "Show me total revenue",
    "Which region has the highest sales?",
    "What are the customer segments?",
    "Show me revenue trend",
    "Who are the top 5 customers?"
  ];

  return (
    <div>
      <h2 className="mb-4">AI Data Analyst</h2>
      <p className="lead mb-4">
        Ask questions about your data in natural language
      </p>

      <Row>
        <Col md={8}>
          <Card className="dashboard-card">
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="e.g., What is the best selling product?"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="query-input"
                    disabled={loading}
                  />
                </Form.Group>
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={loading || !query.trim()}
                  className="w-100"
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />
                      <span className="ms-2">Analyzing...</span>
                    </>
                  ) : (
                    'Ask Question'
                  )}
                </Button>
              </Form>

              {error && (
                <Alert variant="danger" className="mt-3">
                  {error}
                </Alert>
              )}

              {response && (
                <div className="mt-4">
                  <h5>Answer:</h5>
                  <div className="query-response">
                    {response.answer}
                  </div>

                  {response.visualization && (
                    <div className="mt-4">
                      <h6>Visualization:</h6>
                      <div className="chart-container">
                        {response.visualization.type === 'line' && (
                          <Line
                            data={{
                              labels: response.visualization.labels,
                              datasets: [{
                                label: response.visualization.title,
                                data: response.visualization.values,
                                borderColor: 'rgb(75, 192, 192)',
                                backgroundColor: 'rgba(75, 192, 192, 0.5)'
                              }]
                            }}
                            options={{ responsive: true, maintainAspectRatio: false }}
                          />
                        )}
                        {response.visualization.type === 'bar' && (
                          <Bar
                            data={{
                              labels: response.visualization.labels,
                              datasets: [{
                                label: response.visualization.title,
                                data: response.visualization.values,
                                backgroundColor: 'rgba(54, 162, 235, 0.5)'
                              }]
                            }}
                            options={{ responsive: true, maintainAspectRatio: false }}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {response.data && (
                    <div className="mt-4">
                      <h6>Data:</h6>
                      <pre className="bg-light p-3 rounded">
                        {JSON.stringify(response.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="dashboard-card">
            <Card.Header>Suggested Questions</Card.Header>
            <Card.Body>
              <div className="d-flex flex-column gap-2">
                {suggestedQuestions.map((q, index) => (
                  <Button
                    key={index}
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setQuery(q)}
                    className="text-start"
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </Card.Body>
          </Card>

          {history.length > 0 && (
            <Card className="dashboard-card mt-3">
              <Card.Header>Query History</Card.Header>
              <Card.Body>
                <div className="d-flex flex-column gap-2">
                  {history.slice(-5).reverse().map((item, index) => (
                    <div key={index} className="p-2 bg-light rounded">
                      <small className="text-muted">
                        {item.timestamp.toLocaleTimeString()}
                      </small>
                      <div className="fw-bold">{item.query}</div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default QueryInterface;