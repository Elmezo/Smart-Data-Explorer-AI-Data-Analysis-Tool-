import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, Alert, Tabs, Tab } from 'react-bootstrap';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = ({ dataset }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState(null);
  const [forecast, setForecast] = useState(null);

  useEffect(() => {
    if (dataset) {
      fetchInsights();
      fetchForecast();
    }
  }, [dataset]);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      // You'll need to implement proper dataset ID tracking
      const datasetId = 'temp-id'; // Replace with actual dataset ID
      const response = await axios.get(`http://localhost:8000/insights/${datasetId}`);
      setInsights(response.data);
    } catch (err) {
      setError('Failed to fetch insights');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchForecast = async () => {
    try {
      const datasetId = 'temp-id'; // Replace with actual dataset ID
      const response = await axios.get(`http://localhost:8000/forecast/${datasetId}`);
      setForecast(response.data.forecast);
    } catch (err) {
      console.error('Failed to fetch forecast:', err);
    }
  };

  if (!dataset) {
    return (
      <Alert variant="info">
        Please upload a dataset first to view the dashboard.
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="loading-spinner">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Analyzing your data...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  const revenueTrendChart = {
    labels: insights?.revenue_trend?.map(item => item.date) || [],
    datasets: [
      {
        label: 'Revenue',
        data: insights?.revenue_trend?.map(item => item.revenue) || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1
      }
    ]
  };

  const topProductsChart = {
    labels: insights?.top_products?.map(item => item.product) || [],
    datasets: [
      {
        label: 'Value',
        data: insights?.top_products?.map(item => item.value) || [],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1
      }
    ]
  };

  const customerSegmentsChart = {
    labels: insights?.customer_analysis?.customer_segments?.map(item => item.segment) || [],
    datasets: [
      {
        label: 'Customers',
        data: insights?.customer_analysis?.customer_segments?.map(item => item.count) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1
      }
    ]
  };

  return (
    <div className="dashboard">
      <h2 className="mb-4">Data Dashboard</h2>
      
      {/* Summary Statistics */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="dashboard-card">
            <Card.Body>
              <div className="stat-label">Total Revenue</div>
              <div className="stat-value">
                ${insights?.summary_stats?.total_revenue?.toFixed(2) || 0}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="dashboard-card">
            <Card.Body>
              <div className="stat-label">Total Rows</div>
              <div className="stat-value">{insights?.summary_stats?.total_rows || 0}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="dashboard-card">
            <Card.Body>
              <div className="stat-label">Avg Transaction</div>
              <div className="stat-value">
                ${insights?.summary_stats?.avg_transaction?.toFixed(2) || 0}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="dashboard-card">
            <Card.Body>
              <div className="stat-label">Total Customers</div>
              <div className="stat-value">{insights?.customer_analysis?.total_customers || 0}</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="overview" className="mb-4">
        <Tab eventKey="overview" title="Overview">
          <Row>
            <Col md={8}>
              <Card className="dashboard-card">
                <Card.Header>Revenue Trend</Card.Header>
                <Card.Body>
                  <div className="chart-container">
                    <Line data={revenueTrendChart} options={{ responsive: true, maintainAspectRatio: false }} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="dashboard-card">
                <Card.Header>Top Products</Card.Header>
                <Card.Body>
                  <div className="chart-container">
                    <Bar data={topProductsChart} options={{ 
                      responsive: true, 
                      maintainAspectRatio: false,
                      indexAxis: 'y' 
                    }} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="products" title="Products">
          <Row>
            <Col md={6}>
              <Card className="dashboard-card">
                <Card.Header>Top Performing Products</Card.Header>
                <Card.Body>
                  <ul className="list-unstyled">
                    {insights?.top_products?.map((product, index) => (
                      <li key={index} className="mb-3">
                        <strong>{index + 1}. {product.product}</strong>
                        <br />
                        <span className="text-success">
                          {product.metric}: {product.value.toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="dashboard-card">
                <Card.Header>Product Performance</Card.Header>
                <Card.Body>
                  <Bar data={topProductsChart} options={{ responsive: true }} />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="customers" title="Customers">
          <Row>
            <Col md={6}>
              <Card className="dashboard-card">
                <Card.Header>Customer Segments</Card.Header>
                <Card.Body>
                  <div className="chart-container">
                    <Pie data={customerSegmentsChart} options={{ responsive: true, maintainAspectRatio: false }} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="dashboard-card">
                <Card.Header>Top Customers</Card.Header>
                <Card.Body>
                  <ul className="list-unstyled">
                    {insights?.customer_analysis?.top_customers?.map((customer, index) => (
                      <li key={index} className="mb-3">
                        <strong>{index + 1}. {customer.customer}</strong>
                        <br />
                        <span className="text-success">Total: ${customer.total_value.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="forecast" title="Forecast">
          <Card className="dashboard-card">
            <Card.Header>Revenue Forecast (Next 3 Months)</Card.Header>
            <Card.Body>
              {forecast ? (
                <Row>
                  {forecast.map((item, index) => (
                    <Col md={4} key={index}>
                      <Card className="text-center">
                        <Card.Body>
                          <h5>{item.date}</h5>
                          <h3 className="text-primary">${item.forecast.toFixed(2)}</h3>
                          <small className="text-muted">Forecasted Revenue</small>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <p>No forecast data available</p>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="regions" title="Regions">
          <Card className="dashboard-card">
            <Card.Header>Regional Performance</Card.Header>
            <Card.Body>
              {insights?.regional_performance?.length > 0 ? (
                <ul className="list-unstyled">
                  {insights.regional_performance.map((region, index) => (
                    <li key={index} className="mb-3">
                      <strong>{region.region}</strong>
                      <div className="progress mt-1">
                        <div 
                          className="progress-bar" 
                          role="progressbar" 
                          style={{ width: `${(region.revenue / Math.max(...insights.regional_performance.map(r => r.revenue)) * 100)}%` }}
                          aria-valuenow={region.revenue} 
                          aria-valuemin="0" 
                          aria-valuemax={Math.max(...insights.regional_performance.map(r => r.revenue))}
                        >
                          ${region.revenue.toFixed(2)}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No regional data available</p>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Dataset Info */}
      <Card className="dashboard-card mt-4">
        <Card.Header>Dataset Information</Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
              <strong>Filename:</strong> {dataset.filename}
            </Col>
            <Col md={3}>
              <strong>Rows:</strong> {dataset.rows}
            </Col>
            <Col md={3}>
              <strong>Columns:</strong> {dataset.columns?.length}
            </Col>
            <Col md={3}>
              <strong>Data Types:</strong> {Object.keys(dataset.data_types || {}).length}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Dashboard;