
import pandas as pd
import json
import sys
import os

file_path = os.path.join(os.getcwd(), 'public', 'Masterlistoflocations8-10-25.xlsx')

try:
    df = pd.read_excel(file_path)
    # Convert dates to strings to avoid serialization issues
    for col in df.columns:
        if df[col].dtype == 'datetime64[ns]':
            df[col] = df[col].astype(str)
            
    # Replace NaN with None (null in JSON)
    df = df.where(pd.notnull(df), None)
    
    data = df.to_dict(orient='records')
    data = df.to_dict(orient='records')
    
    output_path = os.path.join(os.getcwd(), 'src', 'data', 'location-managers.json')
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, 'w') as f:
        json.dump(data, f, indent=2)
        
    print(f"Successfully wrote data to {output_path}")
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)
