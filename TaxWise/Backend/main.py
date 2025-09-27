from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from io import StringIO
from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# Add CORS middleware to allow your frontend to connect
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect to MongoDB
MONGO_URI = os.getenv("MONGODB_URI")
client = MongoClient(MONGO_URI)
db = client["taxwise_db"]
transactions_collection = db["transactions"]

# Note: The 'clean_and_normalize' and 'categorize_transactions' functions
# should be imported from your 'utils' folder as you have them.
# from utils.parser import clean_and_normalize
# from utils.categorizer import categorize_transactions

@app.get("/")
def root():
    return {"message": "TaxWise Backend Running 🚀"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    user_id = "test_user_123"  # In a real app, this would come from user authentication

    # Read the CSV file contents
    contents = await file.read()
    df = pd.read_csv(StringIO(contents.decode("utf-8")))

    # Note: Replace this with your actual utility functions
    # df_clean = clean_and_normalize(df)
    # df_final = categorize_transactions(df_clean)
    
    # --- Simplified Processing (for demonstration) ---
    df["Category"] = df["Description"].apply(
        lambda x: "Income" if "SALARY" in str(x).upper() else "Expense"
    )
    df_final = df
    # --------------------------------------------------

    # Prepare data for MongoDB storage
    transactions = df_final.to_dict(orient="records")
    for txn in transactions:
        txn["user_id"] = user_id
    
    # Save to MongoDB
    result = transactions_collection.insert_many(transactions)

    # Return a success message instead of the full data
    return {
        "message": "File uploaded and data stored successfully.",
        "inserted_count": len(result.inserted_ids)
    }