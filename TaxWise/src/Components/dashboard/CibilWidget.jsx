import React from 'react';
import { ShieldCheck, TrendingUp, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function CibilWidget({ cibilAnalysis, isLoading }) {
  const getScoreDetails = (score) => {
    if (score >= 750) return { color: 'green', text: 'Excellent', textColor: 'text-green-800', bgColor: 'bg-green-100', ringColor: 'text-green-500' };
    if (score >= 700) return { color: 'yellow', text: 'Good', textColor: 'text-yellow-800', bgColor: 'bg-yellow-100', ringColor: 'text-yellow-500' };
    if (score >= 600) return { color: 'orange', text: 'Fair', textColor: 'text-orange-800', bgColor: 'bg-orange-100', ringColor: 'text-orange-500' };
    return { color: 'red', text: 'Needs Improvement', textColor: 'text-red-800', bgColor: 'bg-red-100', ringColor: 'text-red-500' };
  };

  if (isLoading) {
    return (
      <div className="oneui-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!cibilAnalysis) {
    return (
      <div className="oneui-card p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
          <ShieldCheck className="w-5 h-5 text-blue-500" />
          CIBIL Health
        </h2>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🏦</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">Check your CIBIL score</h3>
          <p className="text-gray-500 mb-4">Get personalized tips to improve your credit health.</p>
          <Link to={createPageUrl("CibilAnalyzer")}>
            <button className="oneui-button">
              Analyze Score
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const scoreDetails = getScoreDetails(cibilAnalysis.current_score);
  const strokeDasharray = `${(cibilAnalysis.current_score - 300) / 600 * 283} 283`;

  return (
    <div className="oneui-card p-6">
      <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-800">
        <ShieldCheck className="w-5 h-5 text-blue-500" />
        CIBIL Health
      </h2>
      
      <div className="flex justify-center items-center mb-6">
        <div className="relative w-40 h-40">
          <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" stroke="#e9ecef" strokeWidth="10" fill="none" />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              className={scoreDetails.ringColor}
              strokeWidth="10"
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset="0"
              transform="rotate(-90 50 50)"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold ${scoreDetails.textColor}`}>{cibilAnalysis.current_score}</span>
            <span className={`font-semibold text-sm ${scoreDetails.textColor}`}>{scoreDetails.text}</span>
          </div>
        </div>
      </div>
      
      {cibilAnalysis.improvement_recommendations?.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-gray-500 text-center">Top recommendations to improve your score:</h4>
          {cibilAnalysis.improvement_recommendations.slice(0, 2).map((rec, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-gray-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-gray-800">{rec.action}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <Link to={createPageUrl("CibilAnalyzer")} className="w-full">
          <button className="oneui-button-secondary w-full">
            View Full Report
          </button>
        </Link>
      </div>
    </div>
  );
}