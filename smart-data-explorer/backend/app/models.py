from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class UploadResponse(BaseModel):
    filename: str
    columns: List[str]
    rows: int
    data_types: Dict[str, str]
    message: str

class InsightResponse(BaseModel):
    top_products: List[Dict[str, Any]]
    revenue_trend: List[Dict[str, Any]]
    customer_analysis: Dict[str, Any]
    regional_performance: List[Dict[str, Any]]
    summary_stats: Dict[str, Any]

class QueryRequest(BaseModel):
    query: str
    dataset_id: str

class QueryResponse(BaseModel):
    answer: str
    visualization: Optional[Dict[str, Any]] = None
    data: Optional[List[Dict[str, Any]]] = None