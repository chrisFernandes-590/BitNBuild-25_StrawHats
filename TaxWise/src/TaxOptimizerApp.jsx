import React, { useState, useEffect, useMemo } from 'react';

// --- 1. SIMULATED DUMMY DATA (Equivalent to dummy_data.csv) ---
// Note: In a real app, this data would come from the FastAPI endpoint.
const DUMMY_TRANSACTIONS = [
    { date: '2024-04-01', description: 'Monthly Salary Credit', amount: 80000.00, type: 'CREDIT' },
    { date: '2024-05-01', description: 'Monthly Salary Credit', amount: 80000.00, type: 'CREDIT' },
    { date: '2024-06-01', description: 'Monthly Salary Credit', amount: 80000.00, type: 'CREDIT' },
    { date: '2024-07-01', description: 'Monthly Salary Credit', amount: 80000.00, type: 'CREDIT' },
    { date: '2024-08-01', description: 'Monthly Salary Credit', amount: 80000.00, type: 'CREDIT' },
    { date: '2024-09-01', description: 'Monthly Salary Credit', amount: 80000.00, type: 'CREDIT' },
    { date: '2024-10-01', description: 'Monthly Salary Credit', amount: 80000.00, type: 'CREDIT' },
    { date: '2024-11-01', description: 'Monthly Salary Credit', amount: 80000.00, type: 'CREDIT' },
    { date: '2024-12-01', description: 'Monthly Salary Credit', amount: 80000.00, type: 'CREDIT' },
    { date: '2025-01-01', description: 'Monthly Salary Credit', amount: 80000.00, type: 'CREDIT' },
    { date: '2025-02-01', description: 'Monthly Salary Credit', amount: 80000.00, type: 'CREDIT' },
    { date: '2025-03-01', description: 'Monthly Salary Credit', amount: 80000.00, type: 'CREDIT' },
    
    // Deductions (DEBIT transactions)
    { date: '2024-04-30', description: 'LIC Premium Payment', amount: -20000.00, type: 'DEBIT' }, // 80C
    { date: '2024-05-30', description: 'Health Insurance Payment - Family', amount: -5000.00, type: 'DEBIT' }, // 80D
    { date: '2024-06-30', description: 'PPF Investment', amount: -10000.00, type: 'DEBIT' }, // 80C
    { date: '2024-07-30', description: 'HDFC Home Loan Principal Repayment', amount: -15000.00, type: 'DEBIT' }, // 80C
    { date: '2024-07-30', description: 'HDFC Home Loan Interest Payment', amount: -20000.00, type: 'DEBIT' }, // 24B
    { date: '2025-03-25', description: 'ELSS Mutual Fund Purchase', amount: -30000.00, type: 'DEBIT' }, // 80C
    { date: '2025-03-28', description: 'Additional Health Insurance', amount: -15000.00, type: 'DEBIT' }, // 80D
];

// --- 2. SIMULATED TAX ENGINE LOGIC (Equivalent to tax_engine.py) ---

/**
 * Calculates tax liability under the Old Regime (India, simplified).
 * Standard Deduction: ₹50,000 (included by default).
 * 80C limit: ₹1,50,000
 * 80D limit: ₹25,000 (self/family) + ₹50,000 (parents > 60) -> Simplified to ₹50,000 max here.
 * 24B limit: ₹2,00,000
 */
const calculateOldRegimeTax = (grossIncome, deductions) => {
    const stdDeduction = 50000;
    const max80C = 150000;
    const max80D = 50000;
    const max24B = 200000;

    // Apply Limits
    const claimed80C = Math.min(deductions['80C'], max80C);
    const claimed80D = Math.min(deductions['80D'], max80D);
    const claimed24B = Math.min(deductions['24B'], max24B);

    const totalDeductions = stdDeduction + claimed80C + claimed80D + claimed24B;
    const taxableIncome = Math.max(0, grossIncome - totalDeductions);

    let tax = 0;
    
    // Simplified Slabs (Pre-Health & Education Cess)
    if (taxableIncome > 1000000) {
        tax += (taxableIncome - 1000000) * 0.30;
        tax += 112500; // Tax on 10,00,000
    } else if (taxableIncome > 500000) {
        tax += (taxableIncome - 500000) * 0.20;
        tax += 12500; // Tax on 5,00,000
    } else if (taxableIncome > 250000) {
        tax += (taxableIncome - 250000) * 0.05;
    }

    // Rebate under section 87A (if taxable income <= 500,000, max rebate of ₹12,500)
    if (taxableIncome <= 500000) {
        tax = Math.max(0, tax - 12500);
    }

    // Health and Education Cess (4%)
    const finalTax = tax * 1.04;

    return { tax_liability: finalTax, total_deductions: totalDeductions, taxable_income: taxableIncome };
};

/**
 * Calculates tax liability under the New Regime (India, simplified).
 * Standard Deduction: ₹50,000 (included by default for salaried).
 * No other common deductions (80C, 80D, 24B) are allowed.
 */
const calculateNewRegimeTax = (grossIncome) => {
    const stdDeduction = 50000;
    const totalDeductions = stdDeduction; // Only Standard Deduction is available
    const taxableIncome = Math.max(0, grossIncome - totalDeductions);
    let tax = 0;

    // New Regime Slabs (Simplified and Consolidated)
    // Up to ₹3,00,000: Nil
    // ₹3,00,001 to ₹6,00,000: 5%
    // ₹6,00,001 to ₹9,00,000: 10%
    // ₹9,00,001 to ₹12,00,000: 15%
    // ₹12,00,001 to ₹15,00,000: 20%
    // Above ₹15,00,000: 30%

    // Calculate tax based on progressive slabs
    if (taxableIncome > 1500000) {
        tax += (taxableIncome - 1500000) * 0.30;
        tax += 150000; // Tax on 15,00,000
    } else if (taxableIncome > 1200000) {
        tax += (taxableIncome - 1200000) * 0.20;
        tax += 90000; // Tax on 12,00,000
    } else if (taxableIncome > 900000) {
        tax += (taxableIncome - 900000) * 0.15;
        tax += 45000; // Tax on 9,00,000
    } else if (taxableIncome > 600000) {
        tax += (taxableIncome - 600000) * 0.10;
        tax += 15000; // Tax on 6,00,000
    } else if (taxableIncome > 300000) {
        tax += (taxableIncome - 300000) * 0.05;
    }

    // Rebate under section 87A (if taxable income <= 700,000, tax is Nil)
    if (taxableIncome <= 700000) {
        tax = 0;
    } else {
        // Health and Education Cess (4%)
        tax = tax * 1.04;
    }

    return { tax_liability: tax, total_deductions: totalDeductions, taxable_income: taxableIncome };
};


/**
 * Core Optimization Logic - Equivalent to compute_tax_optimization
 */
const computeTaxOptimization = (grossIncome, deductions) => {
    // 1. Calculate tax under both regimes
    const oldRegime = calculateOldRegimeTax(grossIncome, deductions);
    const newRegime = calculateNewRegimeTax(grossIncome);

    // 2. Compare and Recommend
    let recommendation = {};
    const savingsPotential = Math.abs(oldRegime.tax_liability - newRegime.tax_liability);

    if (oldRegime.tax_liability < newRegime.tax_liability) {
        recommendation = {
            regime: "Old Regime (Recommended)",
            final_tax: oldRegime.tax_liability,
            savings_potential: savingsPotential,
            investment_advice: "Your existing deductions (80C, 80D, 24B) provide a significant tax advantage. Continue maximizing investments under the Old Regime for maximum savings."
        };
    } else {
        recommendation = {
            regime: "New Regime (Recommended)",
            final_tax: newRegime.tax_liability,
            savings_potential: savingsPotential,
            investment_advice: "The New Regime offers lower marginal tax rates, resulting in less tax liability despite having fewer deductions. Review your non-tax-saving investment strategy."
        };
    }

    return {
        Old_Regime: oldRegime,
        New_Regime: newRegime,
        Recommendation: recommendation,
    };
};

// --- 3. DATA INGESTION AND PROCESSING (Equivalent to ingest_and_process_data) ---

const processFinancialData = (transactions) => {
    let grossIncome = 0;
    const deductionMap = {
        '80C': ['lic', 'ppf', 'elss', 'principal repay', 'nsc', 'tuition'],
        '80D': ['health insurance', 'mediclaim'],
        '24B': ['interest payment'],
    };
    const deductions = { '80C': 0.0, '80D': 0.0, '24B': 0.0 };

    for (const tx of transactions) {
        const amount = Math.abs(tx.amount); // Ensure amounts are positive for calculations
        const description = tx.description.toLowerCase();
        const type = tx.type.toUpperCase().trim();

        if (type === 'CREDIT') {
            grossIncome += amount;
        } else if (type === 'DEBIT' || amount < 0) {
            // Apply rule-based categorization
            let isDeduction = false;
            for (const section in deductionMap) {
                if (deductionMap[section].some(keyword => description.includes(keyword))) {
                    deductions[section] += amount;
                    isDeduction = true;
                    break;
                }
            }
        }
    }

    return { grossIncome, deductions };
};

// --- 4. REACT COMPONENT FOR FRONTEND DISPLAY ---

const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

const StatCard = ({ title, value, colorClass }) => (
    <div className={`p-4 rounded-xl shadow-lg transition-shadow duration-300 hover:shadow-xl ${colorClass}`}>
        <p className="text-sm font-semibold text-gray-700">{title}</p>
        <p className="mt-1 text-2xl font-extrabold">{value}</p>
    </div>
);

const App = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Run the data processing and optimization logic on mount
    useEffect(() => {
        // Simulate API delay
        setTimeout(() => {
            try {
                // 1. Ingest and Process Data
                const { grossIncome, deductions } = processFinancialData(DUMMY_TRANSACTIONS);
                
                if (grossIncome === 0) {
                    throw new Error("Gross income is zero. Cannot perform optimization.");
                }

                // 2. Compute Optimization
                const results = computeTaxOptimization(grossIncome, deductions);

                setData({ ...results, deductions });
            } catch (error) {
                console.error("Error computing tax optimization:", error);
                setData({ status: 'error', message: error.message || 'An unknown error occurred during computation.' });
            } finally {
                setIsLoading(false);
            }
        }, 500);
    }, []);

    // Memoize formatted results
    const formattedResults = useMemo(() => {
        if (!data || data.status === 'error') return null;

        const rec = data.Recommendation;
        const oldRegime = data.Old_Regime;
        // Reconstruct gross income for display
        const gross = data.Old_Regime.taxable_income + data.Old_Regime.total_deductions; 

        return {
            grossIncome: formatter.format(gross),
            recommendedRegime: rec.regime,
            taxLiability: formatter.format(rec.final_tax),
            savingsPotential: formatter.format(rec.savings_potential),
            advice: rec.investment_advice,
            oldTax: formatter.format(oldRegime.tax_liability),
            newTax: formatter.format(data.New_Regime.tax_liability),
            totalDeductionsClaimed: formatter.format(oldRegime.total_deductions),
            deductionsBreakdown: data.deductions // Use the deductions data we passed in the state
        };
    }, [data]);
    
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-4 border-blue-500 border-opacity-20 border-t-blue-500"></div>
                <p className="ml-3 text-lg text-gray-600">Calculating tax optimization...</p>
            </div>
        );
    }
    
    if (data && data.status === 'error') {
        return (
            <div className="p-6 max-w-lg mx-auto bg-red-100 border-l-4 border-red-500 rounded-lg shadow-md mt-10">
                <h2 className="text-xl font-bold text-red-700 mb-2">Calculation Error</h2>
                <p className="text-red-600">{data.message}</p>
                <p className="mt-3 text-sm text-red-500">
                    Please ensure the transaction data is correctly structured.
                </p>
            </div>
        );
    }

    if (!formattedResults) {
        return <p className="text-center mt-10 text-gray-500">No data available after processing.</p>;
    }


    const recommendationColor = formattedResults.recommendedRegime.includes("Old") 
        ? "bg-purple-100 text-purple-800" 
        : "bg-green-100 text-green-800";


    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-inter">
            {/* The script tag was removed here! */}
            <style>{`
                .font-inter { font-family: 'Inter', sans-serif; }
                .tax-advice { transition: all 0.3s ease; }
            `}</style>
            
            <header className="text-center py-6 bg-white shadow-md rounded-xl mb-8">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">TaxWise Optimizer</h1>
                <p className="mt-2 text-lg text-gray-600">Harnessing smart data for financial planning.</p>
            </header>

            <main className="max-w-6xl mx-auto">
                {/* Recommendation Banner */}
                <div className={`p-6 mb-8 rounded-2xl shadow-xl border-t-8 ${formattedResults.recommendedRegime.includes("Old") ? 'border-purple-500 bg-white' : 'border-green-500 bg-white'}`}>
                    <h2 className="text-xl font-bold text-gray-800">Your Personalized Recommendation</h2>
                    <p className={`mt-2 inline-block px-3 py-1 rounded-full font-semibold text-lg ${recommendationColor}`}>
                        {formattedResults.recommendedRegime}
                    </p>
                    <div className="flex flex-col md:flex-row justify-between items-center mt-4 border-t pt-4">
                        <div className="flex flex-col items-start">
                             <p className="text-sm text-gray-500">Estimated Final Tax Liability:</p>
                            <p className="text-4xl font-black text-gray-900 mt-1">{formattedResults.taxLiability}</p>
                        </div>
                        <div className="text-right mt-4 md:mt-0">
                            <p className="text-lg text-gray-700 font-medium">Potential Savings</p>
                            <p className="text-3xl font-extrabold text-blue-600">{formattedResults.savingsPotential}</p>
                        </div>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard 
                        title="Annual Gross Income" 
                        value={formattedResults.grossIncome} 
                        colorClass="bg-blue-50 text-blue-800 border-b-4 border-blue-500" 
                    />
                    <StatCard 
                        title="Total Deductions Claimed (Old)" 
                        value={formattedResults.totalDeductionsClaimed} 
                        colorClass="bg-yellow-50 text-yellow-800 border-b-4 border-yellow-500" 
                    />
                     <StatCard 
                        title="Tax Advice" 
                        value="Read Below" 
                        colorClass="bg-indigo-50 text-indigo-800 border-b-4 border-indigo-500" 
                    />
                </div>
                
                {/* Detailed Comparison & Advice */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Comparison Table */}
                    <div className="bg-white p-6 rounded-2xl shadow-xl">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Regime Comparison</h3>
                        <table className="min-w-full text-left text-sm font-medium">
                            <tbody>
                                <tr className="border-b transition duration-300 ease-in-out hover:bg-gray-50">
                                    <td className="px-3 py-3 text-lg font-semibold text-gray-700">Old Regime Tax</td>
                                    <td className="px-3 py-3 text-lg font-bold text-red-600">{formattedResults.oldTax}</td>
                                </tr>
                                <tr className="border-b transition duration-300 ease-in-out hover:bg-gray-50">
                                    <td className="px-3 py-3 text-lg font-semibold text-gray-700">New Regime Tax</td>
                                    <td className="px-3 py-3 text-lg font-bold text-green-600">{formattedResults.newTax}</td>
                                </tr>
                                <tr className="transition duration-300 ease-in-out bg-blue-50 font-extrabold">
                                    <td className="px-3 py-3 text-lg text-blue-700">Best Case Scenario</td>
                                    <td className="px-3 py-3 text-lg text-blue-700">{formattedResults.taxLiability}</td>
                                </tr>
                            </tbody>
                        </table>

                        <h4 className="text-lg font-bold text-gray-800 mt-6 mb-3">Deductions Breakdown</h4>
                        <ul className="space-y-1 text-gray-700">
                            {Object.entries(formattedResults.deductionsBreakdown).map(([key, value]) => (
                                <li key={key} className="flex justify-between text-sm py-1 border-b border-dashed">
                                    <span className="font-medium text-gray-600">Section {key} Total:</span>
                                    <span className="font-semibold">{formatter.format(value)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Investment Advice */}
                    <div className="bg-white p-6 rounded-2xl shadow-xl tax-advice">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Investment Strategy</h3>
                        <p className="text-gray-700 leading-relaxed">
                           {formattedResults.advice}
                        </p>
                        <ul className="mt-4 space-y-2 text-sm text-gray-600 list-disc list-inside">
                            <li>Check your remaining investment capacity for 80C (max ₹1.5 Lakh).</li>
                            <li>Ensure all Health Insurance premiums are accounted for under 80D.</li>
                        </ul>
                    </div>

                </div>
            </main>
            
            <footer className="text-center mt-10 py-4 text-gray-500 text-sm">
                Data used is a dummy representation of 12 months of salary and various deductions.
            </footer>
        </div>
    );
};

export default App;
