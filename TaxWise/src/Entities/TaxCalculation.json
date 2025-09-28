{
  "name": "TaxCalculation",
  "type": "object",
  "properties": {
    "financial_year": {
      "type": "string",
      "description": "Financial year (e.g., 2024-25)"
    },
    "total_income": {
      "type": "number",
      "description": "Total annual income"
    },
    "old_regime_tax": {
      "type": "number",
      "description": "Tax liability under old regime"
    },
    "new_regime_tax": {
      "type": "number",
      "description": "Tax liability under new regime"
    },
    "recommended_regime": {
      "type": "string",
      "enum": [
        "old",
        "new"
      ],
      "description": "AI recommended tax regime"
    },
    "total_deductions": {
      "type": "number",
      "description": "Total eligible deductions"
    },
    "deduction_breakdown": {
      "type": "object",
      "properties": {
        "section_80c": {
          "type": "number"
        },
        "section_80d": {
          "type": "number"
        },
        "section_80g": {
          "type": "number"
        },
        "section_24b": {
          "type": "number"
        },
        "section_80e": {
          "type": "number"
        }
      }
    },
    "suggested_investments": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "investment_type": {
            "type": "string"
          },
          "amount": {
            "type": "number"
          },
          "tax_saving": {
            "type": "number"
          },
          "section": {
            "type": "string"
          }
        }
      }
    },
    "calculation_date": {
      "type": "string",
      "format": "date",
      "description": "When calculation was performed"
    }
  },
  "required": [
    "financial_year",
    "total_income"
  ]
}