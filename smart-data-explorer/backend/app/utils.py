import pandas as pd
import numpy as np
from typing import Tuple, Dict, Any
import re

def clean_dataset(df: pd.DataFrame) -> pd.DataFrame:
    """Clean the dataset by handling missing values and fixing data types"""
    
    # Make a copy to avoid modifying original
    df_clean = df.copy()
    
    # Remove duplicate rows
    df_clean = df_clean.drop_duplicates()
    
    # Handle missing values
    for col in df_clean.columns:
        if df_clean[col].dtype in ['int64', 'float64']:
            # Fill numeric columns with median
            df_clean[col] = df_clean[col].fillna(df_clean[col].median())
        else:
            # Fill categorical columns with mode
            df_clean[col] = df_clean[col].fillna(df_clean[col].mode()[0] if not df_clean[col].mode().empty else 'Unknown')
    
    # Detect and convert date columns
    for col in df_clean.columns:
        if df_clean[col].dtype == 'object':
            # Try to convert to datetime
            try:
                df_clean[col] = pd.to_datetime(df_clean[col])
            except:
                pass
    
    return df_clean

def detect_column_types(df: pd.DataFrame) -> Dict[str, str]:
    """Detect the type of each column in the dataset"""
    column_types = {}
    
    for col in df.columns:
        if pd.api.types.is_numeric_dtype(df[col]):
            column_types[col] = 'numeric'
        elif pd.api.types.is_datetime64_any_dtype(df[col]):
            column_types[col] = 'date'
        else:
            # Check if it might be categorical
            unique_ratio = df[col].nunique() / len(df)
            if unique_ratio < 0.05:  # Less than 5% unique values
                column_types[col] = 'categorical'
            else:
                column_types[col] = 'text'
    
    return column_types

def find_date_column(df: pd.DataFrame) -> str:
    """Find the most likely date column in the dataset"""
    date_columns = []
    
    for col in df.columns:
        if pd.api.types.is_datetime64_any_dtype(df[col]):
            date_columns.append(col)
        elif 'date' in col.lower() or 'time' in col.lower():
            date_columns.append(col)
    
    return date_columns[0] if date_columns else None

def find_numeric_columns(df: pd.DataFrame) -> list:
    """Find all numeric columns in the dataset"""
    return df.select_dtypes(include=[np.number]).columns.tolist()

def find_categorical_columns(df: pd.DataFrame) -> list:
    """Find all categorical columns in the dataset"""
    categorical = []
    for col in df.columns:
        if df[col].dtype == 'object' and df[col].nunique() < 20:
            categorical.append(col)
    return categorical