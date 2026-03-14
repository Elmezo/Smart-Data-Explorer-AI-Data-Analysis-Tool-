import pandas as pd
import numpy as np
from typing import Dict, List, Any, Tuple
from datetime import datetime
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import statsmodels.api as sm
from .utils import find_date_column, find_numeric_columns, find_categorical_columns

class DataAnalyzer:
    def __init__(self, df: pd.DataFrame):
        self.df = df
        self.date_col = find_date_column(df)
        self.numeric_cols = find_numeric_columns(df)
        self.categorical_cols = find_categorical_columns(df)
        
    def get_top_products(self, top_n: int = 10) -> List[Dict[str, Any]]:
        """Analyze top performing products"""
        results = []
        
        # Try to find product column
        product_col = None
        for col in self.df.columns:
            if 'product' in col.lower() or 'item' in col.lower():
                product_col = col
                break
        
        # Try to find quantity/price columns
        quantity_col = None
        price_col = None
        revenue_col = None
        
        for col in self.df.columns:
            col_lower = col.lower()
            if 'quantity' in col_lower or 'qty' in col_lower:
                quantity_col = col
            elif 'price' in col_lower or 'cost' in col_lower:
                price_col = col
            elif 'revenue' in col_lower or 'sales' in col_lower or 'total' in col_lower:
                revenue_col = col
        
        if product_col:
            # Calculate revenue if possible
            if revenue_col:
                product_revenue = self.df.groupby(product_col)[revenue_col].sum().sort_values(ascending=False)
            elif quantity_col and price_col:
                self.df['calculated_revenue'] = self.df[quantity_col] * self.df[price_col]
                product_revenue = self.df.groupby(product_col)['calculated_revenue'].sum().sort_values(ascending=False)
            elif quantity_col:
                product_revenue = self.df.groupby(product_col)[quantity_col].sum().sort_values(ascending=False)
            else:
                product_revenue = self.df[product_col].value_counts()
            
            # Format results
            for product, value in product_revenue.head(top_n).items():
                results.append({
                    'product': product,
                    'value': float(value),
                    'metric': 'Revenue' if 'revenue' in str(value) else 'Quantity'
                })
        
        return results
    
    def get_revenue_trend(self) -> List[Dict[str, Any]]:
        """Analyze revenue trends over time"""
        results = []
        
        if self.date_col and self.numeric_cols:
            # Group by date (monthly)
            self.df['month'] = self.df[self.date_col].dt.to_period('M')
            
            # Use first numeric column as revenue
            revenue_col = self.numeric_cols[0]
            
            monthly_revenue = self.df.groupby('month')[revenue_col].sum()
            
            for period, revenue in monthly_revenue.items():
                results.append({
                    'date': str(period),
                    'revenue': float(revenue)
                })
        
        return results
    
    def analyze_customers(self) -> Dict[str, Any]:
        """Analyze customer behavior and segmentation"""
        results = {
            'top_customers': [],
            'customer_segments': [],
            'total_customers': 0
        }
        
        # Find customer column
        customer_col = None
        for col in self.df.columns:
            if 'customer' in col.lower() or 'client' in col.lower():
                customer_col = col
                break
        
        if customer_col:
            results['total_customers'] = self.df[customer_col].nunique()
            
            # Find purchase value
            if self.numeric_cols:
                purchase_col = self.numeric_cols[0]
                customer_value = self.df.groupby(customer_col)[purchase_col].sum().sort_values(ascending=False)
                
                # Top customers
                for customer, value in customer_value.head(10).items():
                    results['top_customers'].append({
                        'customer': customer,
                        'total_value': float(value)
                    })
                
                # Customer segmentation (RFM-like)
                if len(customer_value) > 5:
                    # Simple segmentation based on value
                    segments = pd.qcut(customer_value, q=3, labels=['Low', 'Medium', 'High'])
                    segment_counts = segments.value_counts()
                    
                    for segment, count in segment_counts.items():
                        results['customer_segments'].append({
                            'segment': segment,
                            'count': int(count)
                        })
        
        return results
    
    def analyze_regional_performance(self) -> List[Dict[str, Any]]:
        """Analyze performance by region"""
        results = []
        
        # Find region column
        region_col = None
        for col in self.df.columns:
            if 'region' in col.lower() or 'country' in col.lower() or 'area' in col.lower():
                region_col = col
                break
        
        if region_col and self.numeric_cols:
            revenue_col = self.numeric_cols[0]
            regional = self.df.groupby(region_col)[revenue_col].sum().sort_values(ascending=False)
            
            for region, revenue in regional.items():
                results.append({
                    'region': region,
                    'revenue': float(revenue)
                })
        
        return results
    
    def get_summary_statistics(self) -> Dict[str, Any]:
        """Get summary statistics for the dataset"""
        stats = {
            'total_rows': len(self.df),
            'total_columns': len(self.df.columns),
            'numeric_columns': len(self.numeric_cols),
            'categorical_columns': len(self.categorical_cols),
            'missing_values': int(self.df.isnull().sum().sum()),
            'total_revenue': 0,
            'avg_transaction': 0
        }
        
        if self.numeric_cols:
            stats['total_revenue'] = float(self.df[self.numeric_cols[0]].sum())
            stats['avg_transaction'] = float(self.df[self.numeric_cols[0]].mean())
        
        return stats
    
    def generate_all_insights(self) -> Dict[str, Any]:
        """Generate all insights from the dataset"""
        return {
            'top_products': self.get_top_products(),
            'revenue_trend': self.get_revenue_trend(),
            'customer_analysis': self.analyze_customers(),
            'regional_performance': self.analyze_regional_performance(),
            'summary_stats': self.get_summary_statistics()
        }
    
    def forecast_revenue(self, periods: int = 3) -> List[Dict[str, Any]]:
        """Simple revenue forecast using moving average"""
        forecasts = []
        
        if self.date_col and self.numeric_cols:
            # Prepare time series data
            ts_data = self.df.set_index(self.date_col)[self.numeric_cols[0]].resample('M').sum()
            
            if len(ts_data) > 3:
                # Simple moving average forecast
                last_values = ts_data.tail(3).values
                forecast_value = np.mean(last_values)
                
                last_date = ts_data.index[-1]
                for i in range(1, periods + 1):
                    forecast_date = last_date + pd.DateOffset(months=i)
                    forecasts.append({
                        'date': forecast_date.strftime('%Y-%m'),
                        'forecast': float(forecast_value)
                    })
        
        return forecasts