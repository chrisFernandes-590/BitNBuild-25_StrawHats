{
  "name": "Transaction",
  "type": "object",
  "properties": {
    "date": {
      "type": "string",
      "format": "date",
      "description": "Transaction date"
    },
    "description": {
      "type": "string",
      "description": "Transaction description"
    },
    "amount": {
      "type": "number",
      "description": "Transaction amount"
    },
    "type": {
      "type": "string",
      "enum": [
        "credit",
        "debit"
      ],
      "description": "Transaction type"
    },
    "category": {
      "type": "string",
      "enum": [
        "salary",
        "freelance_income",
        "investment_returns",
        "other_income",
        "rent",
        "emi",
        "sip",
        "insurance",
        "utilities",
        "food",
        "transportation",
        "entertainment",
        "shopping",
        "medical",
        "education",
        "travel",
        "other_expense"
      ],
      "description": "AI-categorized transaction type"
    },
    "subcategory": {
      "type": "string",
      "description": "Detailed subcategory"
    },
    "tax_deductible": {
      "type": "boolean",
      "default": false,
      "description": "Whether this qualifies for tax deduction"
    },
    "deduction_section": {
      "type": "string",
      "enum": [
        "80C",
        "80D",
        "80G",
        "24b",
        "80E",
        "80EE",
        "none"
      ],
      "default": "none",
      "description": "Applicable tax deduction section"
    },
    "source_file": {
      "type": "string",
      "description": "Original uploaded file reference"
    }
  },
  "required": [
    "date",
    "description",
    "amount",
    "type"
  ]
}