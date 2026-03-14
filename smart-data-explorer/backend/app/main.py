from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import json
from typing import List
import os

from .models import UploadResponse, InsightResponse, QueryRequest, QueryResponse
from .analysis import DataAnalyzer
from .ai_query import AIQueryHandler
from .utils import clean_dataset, detect_column_types

app = FastAPI(title="Smart Data Explorer API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store datasets in memory (in production, use database)
datasets = {}
analyzers = {}
query_handler = AIQueryHandler()

@app.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """Upload and process a CSV or Excel file"""
    
    # Check file extension
    if not (file.filename.endswith('.csv') or file.filename.endswith('.xlsx')):
        raise HTTPException(status_code=400, detail="Only CSV and Excel files are supported")
    
    try:
        # Read file
        contents = await file.read()
        
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        else:
            df = pd.read_excel(io.BytesIO(contents))
        
        # Clean the dataset
        df_clean = clean_dataset(df)
        
        # Generate unique ID for dataset
        dataset_id = str(hash(file.filename + str(pd.Timestamp.now())))
        
        # Store dataset and analyzer
        datasets[dataset_id] = df_clean
        analyzers[dataset_id] = DataAnalyzer(df_clean)
        
        # Detect column types
        column_types = detect_column_types(df_clean)
        
        return UploadResponse(
            filename=file.filename,
            columns=df_clean.columns.tolist(),
            rows=len(df_clean),
            data_types=column_types,
            message=f"Successfully uploaded {file.filename} with {len(df_clean)} rows"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.get("/datasets")
async def list_datasets():
    """List all uploaded datasets"""
    return {
        "datasets": [
            {
                "id": dataset_id,
                "rows": len(df),
                "columns": df.columns.tolist()
            }
            for dataset_id, df in datasets.items()
        ]
    }

@app.get("/insights/{dataset_id}", response_model=InsightResponse)
async def get_insights(dataset_id: str):
    """Get automatic insights for a dataset"""
    
    if dataset_id not in analyzers:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    analyzer = analyzers[dataset_id]
    insights = analyzer.generate_all_insights()
    
    return InsightResponse(**insights)

@app.post("/query", response_model=QueryResponse)
async def query_data(request: QueryRequest):
    """Query the data using natural language"""
    
    if request.dataset_id not in datasets or request.dataset_id not in analyzers:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    df = datasets[request.dataset_id]
    analyzer = analyzers[request.dataset_id]
    insights = analyzer.generate_all_insights()
    
    # Process query
    result = query_handler.process_query(request.query, df, insights)
    
    return QueryResponse(**result)

@app.get("/forecast/{dataset_id}")
async def get_forecast(dataset_id: str, periods: int = 3):
    """Get revenue forecast"""
    
    if dataset_id not in analyzers:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    analyzer = analyzers[dataset_id]
    forecast = analyzer.forecast_revenue(periods)
    
    return {"forecast": forecast}

@app.get("/data/{dataset_id}")
async def get_data_preview(dataset_id: str, limit: int = 100):
    """Get a preview of the dataset"""
    
    if dataset_id not in datasets:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    df = datasets[dataset_id]
    preview = df.head(limit).to_dict(orient='records')
    
    return {
        "data": preview,
        "total_rows": len(df),
        "columns": df.columns.tolist()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)