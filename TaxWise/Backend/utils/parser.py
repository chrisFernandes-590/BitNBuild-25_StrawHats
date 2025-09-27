import pandas as pd

def clean_and_normalize(df: pd.DataFrame) -> pd.DataFrame:
    # Standardize column names
    rename_map = {
        "Txn Date": "Date",
        "Transaction Date": "Date",
        "Value Date": "Date",
        "Narration": "Description",
        "Description": "Description",
        "Particulars": "Description",
        "Withdrawal Amt.": "Amount",
        "Deposit Amt.": "Amount",
        "Amount": "Amount",
        "Credit": "Amount",
        "Debit": "Amount"
    }
    df = df.rename(columns=lambda x: rename_map.get(x.strip(), x.strip()))

    # Keep required columns
    keep_cols = ["Date", "Description", "Amount"]
    df = df[[col for col in df.columns if col in keep_cols]]

    # Clean Date
    df["Date"] = pd.to_datetime(df["Date"], errors="coerce")

    # Clean Amount
    df["Amount"] = df["Amount"].astype(str).str.replace(",", "", regex=True)
    df["Amount"] = pd.to_numeric(df["Amount"], errors="coerce")

    # Drop bad rows
    df = df.dropna(subset=["Date", "Amount"])

    return df
