import React from 'react';
import { ArrowUpRight, ArrowDownRight, PieChart, BarChart2 } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export default function FinancialOverview({ totalIncome, totalExpenses, transactions, isLoading }) {
  const getCategoryBreakdown = () => {
    const breakdown = {};
    transactions.filter(t => t.type === 'debit').forEach(t => {
      const category = t.category || 'other_expense';
      breakdown[category] = (breakdown[category] || 0) + t.amount;
    });
    return Object.entries(breakdown)
      .map(([name, value]) => ({ name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };
  
  const categoryData = getCategoryBreakdown();

  if (isLoading) {
    return (
      <div className="oneui-card p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="h-24 bg-gray-200 rounded-2xl"></div>
            <div className="h-24 bg-gray-200 rounded-2xl"></div>
          </div>
          <div className="h-40 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="oneui-card p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Financial Overview</h2>
      
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="oneui-card p-4 bg-green-50 border-none">
          <div className="flex items-center gap-2 mb-2 text-green-700">
            <ArrowUpRight className="w-5 h-5" />
            <span className="font-semibold">Total Income</span>
          </div>
          <div className="text-3xl font-bold text-green-800">
            ₹{totalIncome.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="oneui-card p-4 bg-red-50 border-none">
          <div className="flex items-center gap-2 mb-2 text-red-700">
            <ArrowDownRight className="w-5 h-5" />
            <span className="font-semibold">Total Expenses</span>
          </div>
          <div className="text-3xl font-bold text-red-800">
            ₹{totalExpenses.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {transactions.length > 0 ? (
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-500" />
            Top Spending Categories
          </h3>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6c757d' }} width={120} />
                <Tooltip cursor={{fill: '#f1f3f5'}} formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                <Bar dataKey="value" fill="#007bff" radius={[0, 8, 8, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">No Data Yet</h3>
          <p className="text-gray-500">Upload your financial data to see insights here!</p>
        </div>
      )}
    </div>
  );
}