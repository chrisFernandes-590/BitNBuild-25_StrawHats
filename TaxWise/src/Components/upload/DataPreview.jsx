import React from 'react';
import { CheckCircle, Eye, Save, TrendingUp, TrendingDown, FileBadge, Banknote } from "lucide-react";

export default function DataPreview({ data, onSave }) {
  const totalTransactions = data.length;
  const totalCredits = data.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
  const totalDebits = data.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
  const deductibleTransactions = data.filter(t => t.tax_deductible).length;

  return (
    <div className="oneui-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <CheckCircle className="w-6 h-6 text-green-500" />
        <h2 className="text-xl font-bold text-gray-800">Processing Complete</h2>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="oneui-card p-4 bg-gray-100 border-none">
          <div className="flex items-center gap-2 mb-2 text-gray-600">
             <FileBadge className="w-5 h-5" />
             <div className="font-semibold">Transactions</div>
          </div>
          <div className="text-2xl font-bold text-gray-800">{totalTransactions}</div>
        </div>
        
        <div className="oneui-card p-4 bg-gray-100 border-none">
          <div className="flex items-center gap-2 mb-2 text-gray-600">
             <Banknote className="w-5 h-5" />
             <div className="font-semibold">Deductible</div>
          </div>
          <div className="text-2xl font-bold text-gray-800">{deductibleTransactions}</div>
        </div>
      </div>
      
      {/* Sample Transactions */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-3">Preview</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto p-1">
          {data.slice(0, 10).map((transaction, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg text-sm">
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-gray-800 truncate pr-4">{transaction.description}</span>
                <span className={`font-bold whitespace-nowrap ${
                  transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span className="font-medium">{new Date(transaction.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                <span className="font-semibold capitalize bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">{transaction.category?.replace(/_/g, ' ')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <button
        onClick={onSave}
        className="oneui-button w-full flex items-center justify-center gap-2"
      >
        <Save className="w-5 h-5" />
        Save {totalTransactions} Transactions
      </button>
    </div>
  );
}