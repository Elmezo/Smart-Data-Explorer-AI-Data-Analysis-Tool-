import openai
import pandas as pd
import json
from typing import Dict, Any, List
import os
from dotenv import load_dotenv

load_dotenv()

class AIQueryHandler:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv('OPENAI_API_KEY')
        if self.api_key:
            openai.api_key = self.api_key
        self.use_ai = bool(self.api_key)
    
    def process_query(self, query: str, df: pd.DataFrame, insights: Dict[str, Any]) -> Dict[str, Any]:
        """Process a natural language query about the data"""
        
        # If no AI key, use rule-based responses
        if not self.use_ai:
            return self._rule_based_response(query, df, insights)
        
        # Prepare context for AI
        context = self._prepare_context(df, insights)
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a data analyst assistant. Answer questions based on the provided data context."},
                    {"role": "user", "content": f"Context: {context}\n\nQuestion: {query}\n\nProvide a concise answer with specific numbers from the data."}
                ],
                temperature=0.3,
                max_tokens=300
            )
            
            answer = response.choices[0].message.content
            
            # Try to extract visualization data if relevant
            visualization = self._extract_visualization(query, df)
            
            return {
                'answer': answer,
                'visualization': visualization,
                'data': None
            }
            
        except Exception as e:
            return {
                'answer': f"Sorry, I couldn't process that query. Error: {str(e)}",
                'visualization': None,
                'data': None
            }
    
    def _prepare_context(self, df: pd.DataFrame, insights: Dict[str, Any]) -> str:
        """Prepare context string for AI"""
        context = f"""
        Dataset Information:
        - Columns: {', '.join(df.columns)}
        - Total rows: {len(df)}
        - Numeric columns: {', '.join(df.select_dtypes(include=['number']).columns)}
        
        Key Insights:
        - Total Revenue: {insights.get('summary_stats', {}).get('total_revenue', 'N/A')}
        - Top Products: {insights.get('top_products', [])}
        - Customer Segments: {insights.get('customer_analysis', {}).get('customer_segments', [])}
        """
        return context
    
    def _rule_based_response(self, query: str, df: pd.DataFrame, insights: Dict[str, Any]) -> Dict[str, Any]:
        """Simple rule-based response system"""
        query_lower = query.lower()
        
        # Common question patterns
        if 'top product' in query_lower or 'best product' in query_lower:
            products = insights.get('top_products', [])
            if products:
                top = products[0]
                return {
                    'answer': f"The top product is {top['product']} with {top['value']} {top['metric']}.",
                    'visualization': None,
                    'data': products[:5]
                }
        
        elif 'total revenue' in query_lower or 'total sales' in query_lower:
            revenue = insights.get('summary_stats', {}).get('total_revenue', 0)
            return {
                'answer': f"Total revenue is ${revenue:,.2f}",
                'visualization': None,
                'data': None
            }
        
        elif 'customer' in query_lower and ('segment' in query_lower or 'type' in query_lower):
            segments = insights.get('customer_analysis', {}).get('customer_segments', [])
            if segments:
                return {
                    'answer': f"Customer segments: {', '.join([f'{s["segment"]}: {s["count"]}' for s in segments])}",
                    'visualization': None,
                    'data': segments
                }
        
        elif 'region' in query_lower:
            regions = insights.get('regional_performance', [])
            if regions:
                best_region = regions[0]
                return {
                    'answer': f"The best performing region is {best_region['region']} with revenue of ${best_region['revenue']:,.2f}",
                    'visualization': None,
                    'data': regions
                }
        
        # Default response
        return {
            'answer': "I can help you with questions about top products, revenue, customers, and regional performance. What would you like to know?",
            'visualization': None,
            'data': None
        }
    
    def _extract_visualization(self, query: str, df: pd.DataFrame) -> Dict[str, Any]:
        """Extract data for visualization based on query"""
        query_lower = query.lower()
        
        if 'trend' in query_lower or 'over time' in query_lower:
            # Find date column
            date_col = None
            for col in df.columns:
                if pd.api.types.is_datetime64_any_dtype(df[col]):
                    date_col = col
                    break
            
            if date_col and len(df.select_dtypes(include=['number']).columns) > 0:
                num_col = df.select_dtypes(include=['number']).columns[0]
                
                # Prepare time series data
                df['period'] = df[date_col].dt.to_period('M')
                trend_data = df.groupby('period')[num_col].sum().head(10)
                
                return {
                    'type': 'line',
                    'title': f'{num_col} Trend',
                    'labels': [str(d) for d in trend_data.index],
                    'values': trend_data.values.tolist()
                }
        
        return None