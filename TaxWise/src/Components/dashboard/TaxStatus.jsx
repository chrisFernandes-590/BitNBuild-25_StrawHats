import React from 'react';
import { Calculator, TrendingDown, ShieldHalf } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function TaxStatus({ taxCalculation, isLoading }) {
  if (isLoading) {
    return (
      <div className="oneui-card p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-20 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!taxCalculation) {
    return (
      <div className="oneui-card p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <Calculator className="w-6 h-6 text-blue-500" />
          Tax Status
        </h2>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🧮</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">Ready to optimize?</h3>
          <p className="text-gray-500 mb-4">Run a simulation to see your tax liability.</p>
          <Link to={createPageUrl("TaxCalculator")}>
            <button className="oneui-button">
              Calculate Tax
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const savings = Math.abs(taxCalculation.old_regime_tax - taxCalculation.new_regime_tax);
  const recommendedTax = taxCalculation.recommended_regime === 'old' 
    ? taxCalculation.old_regime_tax 
    : taxCalculation.new_regime_tax;

  return (
    <div className="oneui-card p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <Calculator className="w-6 h-6 text-blue-500" />
        Tax Status
      </h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="oneui-card p-4 bg-blue-50 border-none">
          <div className="flex items-center gap-2 mb-2 text-blue-700">
            <ShieldHalf className="w-5 h-5" />
            <h3 className="font-semibold">Recommended Regime</h3>
          </div>
          <div className="text-2xl font-bold text-blue-800 mb-1">
            {taxCalculation.recommended_regime?.toUpperCase()}
          </div>
          <div className="text-lg font-bold text-blue-600">
            Tax: ₹{recommendedTax.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="oneui-card p-4 bg-green-50 border-none">
          <div className="flex items-center gap-2 mb-2 text-green-700">
            <TrendingDown className="w-5 h-5" />
            <h3 className="font-semibold">Potential Savings</h3>
          </div>
          <div className="text-3xl font-bold text-green-800">
            ₹{savings.toLocaleString('en-IN')}
          </div>
        </div>
      </div>
    </div>
  );
}