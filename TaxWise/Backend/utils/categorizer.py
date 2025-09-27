import pandas as pd

def categorize_transactions(df: pd.DataFrame) -> pd.DataFrame:
    categories = {
        "SALARY": "Income",
        "EMI": "EMI",
        "LOAN": "EMI",
        "SIP": "SIP",
        "MUTUAL FUND": "SIP",
        "INSURANCE": "Insurance",
        "LIC": "Insurance",
        "RENT": "Rent",
        "SHOP": "Shopping",
        "SWIGGY": "Food",
        "ZOMATO": "Food",
        "UBER": "Travel",
        "OLA": "Travel",
        "ELECTRICITY": "Utilities",
        "GAS": "Utilities"
    }

    def classify(desc):
        if not isinstance(desc, str):
            return "Other"
        for keyword, cat in categories.items():
            if keyword in desc.upper():
                return cat
        return "Other"

    df["Category"] = df["Description"].apply(classify)
    return df
