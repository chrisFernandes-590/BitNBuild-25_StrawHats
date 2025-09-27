import React, { useState, useRef } from "react";
import { Transaction } from "@/entities/all";
import { UploadFile, ExtractDataFromUploadedFile } from "@/integrations/Core";
import { 
  Upload as UploadIcon,
  CheckCircle, 
  AlertCircle,
  Loader2,
  Zap,
  Save
} from "lucide-react";

import FileUploadZone from "../components/upload/FileUploadZone";
import FileProcessor from "../components/upload/FileProcessor";
import DataPreview from "../components/upload/DataPreview";

export default function Upload() {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleFileSelect = (selectedFiles) => {
    const newFiles = Array.from(selectedFiles).filter(file => 
      file.type === 'application/pdf' || 
      file.type.startsWith('image/') ||
      file.type === 'text/csv' ||
      file.type === 'application/vnd.ms-excel' ||
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    
    if (newFiles.length === 0) {
      setError("Please upload PDF, image, or CSV/Excel files only");
      return;
    }
    
    setFiles(prev => [...prev, ...newFiles]);
    setError(null);
    setSuccessMessage(null);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // ... (keep existing helper functions: categorizeTransaction, isDeductible, getDeductionSection)
  const categorizeTransaction = (description, type) => {
    const desc = description.toLowerCase();
    
    if (type === 'credit') {
      if (desc.includes('salary') || desc.includes('payroll')) return 'salary';
      if (desc.includes('freelance') || desc.includes('consulting')) return 'freelance_income';
      if (desc.includes('dividend') || desc.includes('interest')) return 'investment_returns';
      return 'other_income';
    } else {
      if (desc.includes('rent') || desc.includes('lease')) return 'rent';
      if (desc.includes('emi') || desc.includes('loan')) return 'emi';
      if (desc.includes('sip') || desc.includes('mutual')) return 'sip';
      if (desc.includes('insurance') || desc.includes('premium')) return 'insurance';
      if (desc.includes('electricity') || desc.includes('water') || desc.includes('gas')) return 'utilities';
      if (desc.includes('food') || desc.includes('restaurant') || desc.includes('grocery')) return 'food';
      if (desc.includes('uber') || desc.includes('ola') || desc.includes('petrol')) return 'transportation';
      if (desc.includes('movie') || desc.includes('entertainment')) return 'entertainment';
      if (desc.includes('shopping') || desc.includes('amazon') || desc.includes('flipkart')) return 'shopping';
      if (desc.includes('medical') || desc.includes('hospital') || desc.includes('pharmacy')) return 'medical';
      if (desc.includes('school') || desc.includes('education') || desc.includes('course')) return 'education';
      return 'other_expense';
    }
  };

  const isDeductible = (description, type) => {
    if (type === 'credit') return false;
    
    const desc = description.toLowerCase();
    return desc.includes('insurance') || 
           desc.includes('sip') || 
           desc.includes('mutual') ||
           desc.includes('ppf') ||
           desc.includes('elss') ||
           desc.includes('medical') ||
           desc.includes('education') ||
           desc.includes('home loan');
  };

  const getDeductionSection = (description, type) => {
    if (type === 'credit') return 'none';
    
    const desc = description.toLowerCase();
    if (desc.includes('insurance')) return '80D';
    if (desc.includes('sip') || desc.includes('ppf') || desc.includes('elss')) return '80C';
    if (desc.includes('medical')) return '80D';
    if (desc.includes('education')) return '80E';
    if (desc.includes('home loan')) return '24b';
    return 'none';
  };
  
  const processFiles = async () => {
    if (files.length === 0) return;
    
    setProcessing(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const allTransactions = [];
      
      for (const file of files) {
        const { file_url } = await UploadFile({ file });
        const result = await ExtractDataFromUploadedFile({
          file_url,
          json_schema: {
            type: "object",
            properties: {
              transactions: {
                type: "array",
                items: Transaction.schema()
              }
            }
          }
        });
        
        if (result.status === "success" && result.output?.transactions) {
          const processedTransactions = result.output.transactions.map(t => ({
            ...t,
            source_file: file.name,
            category: categorizeTransaction(t.description, t.type),
            tax_deductible: isDeductible(t.description, t.type),
            deduction_section: getDeductionSection(t.description, t.type)
          }));
          
          allTransactions.push(...processedTransactions);
        } else {
            throw new Error(result.details || `Could not extract data from ${file.name}`);
        }
      }
      
      setExtractedData(allTransactions);
      
    } catch (error) {
      setError(`Processing failed: ${error.message}`);
    }
    
    setProcessing(false);
  };

  const saveTransactions = async () => {
    if (!extractedData || extractedData.length === 0) return;
    
    try {
      await Transaction.bulkCreate(extractedData);
      setFiles([]);
      setExtractedData(null);
      setSuccessMessage(`${extractedData.length} transactions saved successfully!`);
    } catch (error) {
      setError(`Save failed: ${error.message}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="pt-8 pb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Smart Upload Center</h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Drag and drop your financial statements, and let our AI do the heavy lifting.
        </p>
      </div>

      {error && (
        <div className="oneui-card p-4 bg-red-100 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="font-semibold text-red-800">{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="oneui-card p-4 bg-green-100 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-800">{successMessage}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-8">
          <FileUploadZone 
            onFileSelect={handleFileSelect}
            processing={processing}
          />
          
          {files.length > 0 && !extractedData && (
            <FileProcessor 
              files={files}
              onRemoveFile={removeFile}
              onProcessFiles={processFiles}
              processing={processing}
            />
          )}
        </div>

        <div>
          {extractedData && (
            <DataPreview 
              data={extractedData}
              onSave={saveTransactions}
            />
          )}
        </div>
      </div>
    </div>
  );
}