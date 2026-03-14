# Smart Data Explorer - AI-Powered Data Analysis Tool


## 📊 Overview

Smart Data Explorer is a powerful, AI-driven web application that automatically analyzes Excel and CSV files, providing instant insights, visualizations, and natural language query capabilities. No data analyst or complex BI tools required!

### ✨ Key Features

- **📤 Easy File Upload**: Drag-and-drop support for CSV and Excel files
- **🧹 Automatic Data Cleaning**: Handles missing values, detects data types automatically
- **📈 Instant Insights**: Automatically generates:
  - Top/bottom performing products
  - Revenue trends over time
  - Customer segmentation
  - Regional performance analysis
  - Summary statistics
- **📊 Interactive Dashboard**: Beautiful, responsive charts and visualizations
- **🤖 AI-Powered Queries**: Ask questions in plain English about your data
- **🔮 Basic Forecasting**: Simple revenue predictions
- **📱 Responsive Design**: Works on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 14+
- npm or yarn
- (Optional) OpenAI API key for advanced AI features

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/smart-data-explorer.git
cd smart-data-explorer
```

#### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "OPENAI_API_KEY=your_api_key_here" > .env
```

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Or using yarn
yarn install
```

### Running the Application

#### 1. Start the Backend Server

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Alternative docs: `http://localhost:8000/redoc`

#### 2. Start the Frontend Development Server

```bash
cd frontend
npm start
```

The application will open at `http://localhost:3000`

## 🎯 Usage Guide

### 1. Upload Your Data

- Click the upload area or drag and drop your file
- Supported formats: `.csv`, `.xlsx`, `.xls`
- Maximum file size: Configurable (default 100MB)

### 2. Explore the Dashboard

Once uploaded, the system automatically:

- Cleans and preprocesses your data
- Detects column types (numeric, categorical, date)
- Generates initial insights
- Creates interactive visualizations

### 3. View Insights

The dashboard provides multiple tabs:

- **Overview**: High-level metrics and trends
- **Products**: Product performance analysis
- **Customers**: Customer segmentation and top customers
- **Forecast**: Revenue predictions
- **Regions**: Geographic performance

### 4. Ask AI Questions

Use natural language to query your data:

```
"What is the best selling product?"
"Show me revenue by month"
"Which region has the highest sales?"
"Who are my top 5 customers?"
"What is the average transaction value?"
```

## 📁 Project Structure

```
smart-data-explorer/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py           # FastAPI application
│   │   ├── analysis.py        # Data analysis logic
│   │   ├── ai_query.py        # AI query handling
│   │   ├── models.py          # Pydantic models
│   │   └── utils.py           # Utility functions
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUpload.js
│   │   │   ├── Dashboard.js
│   │   │   └── QueryInterface.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── styles.css
│   └── package.json
├── datasets/                   # Sample datasets
└── README.md
```

## 🔧 Configuration

### Backend Configuration (.env)

```env
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=postgresql://user:password@localhost/smart_data_explorer
```

### Frontend Configuration

Modify API endpoint in services/files if needed:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
```

## 📊 Sample Data Format

The system works best with structured data. Here's an example:

```csv
OrderID,CustomerName,Product,Region,Quantity,Price,OrderDate
1001,John Smith,Laptop,West,2,1200,2024-01-15
1002,Jane Doe,Mouse,East,5,25,2024-01-16
1003,Bob Johnson,Keyboard,North,3,80,2024-01-17
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 🚢 Deployment

### Backend Deployment (Using Docker)

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Deployment

```bash
cd frontend
npm run build
# Serve the build folder using any static server
```

## 🔒 Security Considerations

- File upload validation and size limits
- CORS configuration for production
- API key protection
- Input sanitization
- Rate limiting (to be implemented)

## 🎨 Customization

### Adding New Chart Types

Modify `Dashboard.js` to add new visualizations:

```javascript
// Add new chart configuration
const newChartData = {
  labels: [...],
  datasets: [...]
};
```

### Extending Analysis Features

Add new analysis methods in `analysis.py`:

```python
def new_analysis_method(self):
    # Your analysis logic here
    pass
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) - Backend framework
- [React](https://reactjs.org/) - Frontend library
- [Chart.js](https://www.chartjs.org/) - Charting library
- [OpenAI](https://openai.com/) - AI capabilities
- [Pandas](https://pandas.pydata.org/) - Data analysis

## 🚦 Roadmap

- [ ] User authentication and multi-tenant support
- [ ] More advanced ML models for forecasting
- [ ] Export reports (PDF, Excel)
- [ ] Real-time data streaming
- [ ] Integration with databases (PostgreSQL, MongoDB)
- [ ] More sophisticated NLP for queries
- [ ] Custom dashboard builder
- [ ] API for third-party integrations

## ⚠️ Troubleshooting

### Common Issues

1. **Backend won't start**
   - Check Python version: `python --version`
   - Verify all dependencies installed: `pip list`
   - Check if port 8000 is available

2. **Frontend connection errors**
   - Verify backend is running
   - Check CORS configuration
   - Confirm API URL in frontend services

3. **File upload fails**
   - Check file format (CSV/Excel only)
   - Verify file size (default limit 100MB)
   - Check file permissions

4. **AI queries not working**
   - Verify OpenAI API key in .env
   - Check API key has sufficient credits
   - Ensure internet connection

## 📚 API Documentation

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload` | Upload dataset |
| GET | `/datasets` | List all datasets |
| GET | `/insights/{dataset_id}` | Get data insights |
| POST | `/query` | Ask AI questions |
| GET | `/forecast/{dataset_id}` | Get revenue forecast |
| GET | `/data/{dataset_id}` | Get data preview |

### Example API Call

```bash
# Upload file
curl -X POST http://localhost:8000/upload \
  -F "file=@sales_data.csv"

# Get insights
curl http://localhost:8000/insights/dataset_id

# Ask question
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"query": "top products", "dataset_id": "dataset_id"}'
```

## 💡 Use Cases

1. **Small Businesses**: Analyze sales data without hiring a data analyst
2. **Marketing Teams**: Understand customer behavior and campaign performance
3. **Financial Analysts**: Quick analysis of financial reports
4. **Researchers**: Explore research data patterns
5. **Students**: Learn data analysis concepts
6. **Consultants**: Rapid data assessment for clients

---

Made with ❤️ for data enthusiasts everywhere
