{
  "name": "CibilAnalysis",
  "type": "object",
  "properties": {
    "current_score": {
      "type": "number",
      "minimum": 300,
      "maximum": 900,
      "description": "Current CIBIL score"
    },
    "score_range": {
      "type": "string",
      "enum": [
        "poor",
        "fair",
        "good",
        "very_good",
        "excellent"
      ],
      "description": "Score category"
    },
    "credit_utilization": {
      "type": "number",
      "description": "Current credit utilization percentage"
    },
    "payment_history_score": {
      "type": "number",
      "minimum": 0,
      "maximum": 100,
      "description": "Payment punctuality score"
    },
    "credit_mix_score": {
      "type": "number",
      "minimum": 0,
      "maximum": 100,
      "description": "Diversity of credit types score"
    },
    "credit_age_months": {
      "type": "number",
      "description": "Average age of credit accounts in months"
    },
    "negative_factors": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "factor": {
            "type": "string"
          },
          "impact": {
            "type": "string",
            "enum": [
              "high",
              "medium",
              "low"
            ]
          },
          "description": {
            "type": "string"
          }
        }
      }
    },
    "improvement_recommendations": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "action": {
            "type": "string"
          },
          "priority": {
            "type": "string",
            "enum": [
              "high",
              "medium",
              "low"
            ]
          },
          "estimated_impact": {
            "type": "number"
          },
          "timeline": {
            "type": "string"
          }
        }
      }
    },
    "predicted_score_3_months": {
      "type": "number",
      "description": "Projected score after 3 months following recommendations"
    },
    "predicted_score_6_months": {
      "type": "number",
      "description": "Projected score after 6 months following recommendations"
    },
    "analysis_date": {
      "type": "string",
      "format": "date",
      "description": "When analysis was performed"
    }
  },
  "required": [
    "current_score",
    "analysis_date"
  ]
}