import React, { useState, useEffect } from "react";
import { Transaction, TaxCalculation, CibilAnalysis } from "@/entities/all";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Upload, 
  Calculator, 
  ShieldCheck,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Target
} from "lucide-react";

import FinancialOverview from "../components/dashboard/FinancialOverview";
import TaxStatus from "../components/dashboard/TaxStatus";
import CibilWidget from "../components/dashboard/CibilWidget";

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [taxCalculation, setTaxCalculation] = useState(null);
  const [cibilAnalysis, setCibilAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [transactionData, taxData, cibilData] = await Promise.all([
        Transaction.list('-date', 100),
        TaxCalculation.list('-created_date', 1),
        CibilAnalysis.list('-created_date', 1)
      ]);
      
      setTransactions(transactionData);
      setTaxCalculation(taxData[0] || null);
      setCibilAnalysis(cibilData[0] || null);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
    setIsLoading(false);
  };

  const totalIncome = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="pt-8 pb-16">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome Back!</h1>
        <p className="text-lg text-gray-500">Here's your financial snapshot for today.</p>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <FinancialOverview 
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            transactions={transactions}
            isLoading={isLoading}
          />
          
          <TaxStatus 
            taxCalculation={taxCalculation}
            isLoading={isLoading}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <CibilWidget 
            cibilAnalysis={cibilAnalysis}
            isLoading={isLoading}
          />

          {/* Action Center */}
          <div className="oneui-card p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
              <Target className="w-5 h-5 text-blue-500" />
              Action Center
            </h3>
            <div className="space-y-4">
               {!transactions.length && (
                <Link to={createPageUrl("Upload")} className="block p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center">
                      <Upload className="w-5 h-5"/>
                    </div>
                    <div>
                      <p className="font-bold text-blue-800">Upload your statements</p>
                      <p className="text-sm text-blue-600">Get started by importing your data.</p>
                    </div>
                  </div>
                </Link>
              )}
               {transactions.length > 0 && !taxCalculation && (
                <Link to={createPageUrl("TaxCalculator")} className="block p-4 rounded-lg bg-yellow-50 hover:bg-yellow-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500 text-white rounded-full flex items-center justify-center">
                      <Calculator className="w-5 h-5"/>
                    </div>
                    <div>
                      <p className="font-bold text-yellow-800">Run Tax Simulation</p>
                      <p className="text-sm text-yellow-600">Find the best tax regime for you.</p>
                    </div>
                  </div>
                </Link>
              )}
               {transactions.length > 0 && !cibilAnalysis && (
                <Link to={createPageUrl("CibilAnalyzer")} className="block p-4 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5"/>
                    </div>
                    <div>
                      <p className="font-bold text-green-800">Analyze Your CIBIL</p>
                      <p className="text-sm text-green-600">Get tips to improve your score.</p>
                    </div>
                  </div>
                </Link>
              )}
               {transactions.length > 0 && taxCalculation && cibilAnalysis && (
                <div className="p-4 rounded-lg bg-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-500 text-white rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5"/>
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">You're all set!</p>
                      <p className="text-sm text-gray-600">Check reports for detailed insights.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}