import React, { useState, useMemo, useCallback } from 'react';

// --- UTILITIES AND FORMATTING ---

const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

const InputField = ({ label, id, value, onChange, type = 'number', unit, min = 0, step = 1000 }) => (
    <div className="mb-4">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
        </label>
        <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-500">
            {unit === '₹' && <span className="pl-3 text-gray-500 font-bold text-lg">₹</span>}
            <input
                type={type}
                id={id}
                value={value}
                onChange={onChange}
                min={min}
                step={step}
                required
                className="flex-grow p-3 bg-transparent border-none focus:ring-0 rounded-lg text-gray-900"
            />
            {unit === 'years' && <span className="pr-3 text-gray-500">years</span>}
        </div>
    </div>
);

// --- CIBIL SCORING LOGIC (Simulated Model) ---

/**
 * Calculates a simulated CIBIL score (300-900) based on key financial inputs.
 * This model is simplified, based on real-world factor weights.
 */
const calculateSimulatedCIBIL = (inputs) => {
    const { total_credit_limit, current_outstanding_debt, late_payments_24m, oldest_account_years } = inputs;

    // Default Score (Average/Base)
    let score = 750;

    // --- 1. Credit Utilization (Weight ~30%) ---
    const utilization = total_credit_limit > 0 ? current_outstanding_debt / total_credit_limit : 1;
    let utilPenalty = 0;

    if (utilization >= 0.8) {
        utilPenalty = 120; // Severe penalty for >80% utilization
    } else if (utilization >= 0.5) {
        utilPenalty = 80;  // High penalty for >50% utilization
    } else if (utilization >= 0.3) {
        utilPenalty = 40;  // Moderate penalty for >30% utilization
    } else if (utilization < 0.1) {
        score += 30; // Small bonus for very low utilization
    }
    score -= utilPenalty;

    // --- 2. Payment History (Weight ~35%) ---
    // Penalty scales exponentially based on late payment count
    let paymentPenalty = 0;

    if (late_payments_24m > 0) {
        paymentPenalty = late_payments_24m * 60;
    }
    score -= paymentPenalty;

    // --- 3. Credit Age & Mix (Weight ~20%) ---
    if (oldest_account_years >= 8) {
        score += 40; // Bonus for established history
    } else if (oldest_account_years < 3) {
        score -= 30; // Penalty for very young credit history
    }
    
    // --- 4. Final Constraints ---
    return Math.max(300, Math.min(900, Math.round(score)));
};

/**
 * Generates personalized, actionable advice based on simulated inputs.
 */
const generateAdvice = (inputs, currentScore) => {
    const { total_credit_limit, current_outstanding_debt, late_payments_24m, oldest_account_years } = inputs;
    const utilization = total_credit_limit > 0 ? current_outstanding_debt / total_credit_limit : 1;

    const advice = [];

    // 1. Payment History Advice (Highest Priority)
    if (late_payments_24m > 0) {
        advice.push({
            icon: '❌',
            title: 'Critical: Clear Payment History',
            text: `Your ${late_payments_24m} late payment(s) in the last 2 years is the **biggest factor** lowering your score. Set up autopay for all EMIs and credit card bills immediately. Consistent, timely payments are crucial for recovery.`,
            priority: 1,
        });
    } else {
        advice.push({
            icon: '✅',
            title: 'Excellent Payment History',
            text: 'You have maintained a perfect payment record. Continue to pay all your debts on or before the due date—this is the foundation of a high score!',
            priority: 4,
        });
    }

    // 2. Utilization Advice (High Priority)
    if (utilization >= 0.5) {
        advice.push({
            icon: '⚠️',
            title: 'Urgent: High Credit Utilization',
            text: `Your utilization is **${(utilization * 100).toFixed(0)}%**, which is severely penalizing your score. Aim to bring this below 30% (and ideally below 10%). Focus extra payments on high-interest credit card debt.`,
            priority: 2,
        });
    } else if (utilization >= 0.3) {
        advice.push({
            icon: '🟡',
            title: 'Improve Utilization',
            text: `Your utilization of ${(utilization * 100).toFixed(0)}% is moderate. To reach the 750+ club, try to keep your total outstanding debt below 30% of your limit. Consider requesting a limit increase.`,
            priority: 3,
        });
    }

    // 3. Credit Age Advice (Moderate Priority)
    if (oldest_account_years < 3) {
        advice.push({
            icon: '⏳',
            title: 'Build Credit History',
            text: `With an oldest account age of ${oldest_account_years} years, your profile is still young. Be patient; time and responsible use are key. Avoid closing old accounts as this can reduce your average credit age.`,
            priority: 5,
        });
    }
    
    // Sort by priority (1 is highest) and return
    return advice.sort((a, b) => a.priority - b.priority);
};

// --- AI API INTEGRATION with GUARANTEED FALLBACK ---

/**
 * Generates a simulated fallback response for the CIBIL advisor.
 */
const getSimulatedCibilAdvice = (currentScore, simulatedScore, whatIfAmount, whatIfType) => {
    const improvement = simulatedScore - currentScore;
    const actionText = whatIfType === 'payoff'
        ? `paying off ₹${whatIfAmount.toLocaleString('en-IN')} of high-interest debt`
        : `receiving a ₹${whatIfAmount.toLocaleString('en-IN')} credit limit increase`;
    
    const conclusion = improvement > 0 
        ? "This action is highly beneficial and strongly recommended if financially feasible."
        : "This action has no immediate score impact but maintains credit stability.";

    let advice = `(Simulated Advice: API unavailable) Based on your current score of **${currentScore}**, your proposed action of **${actionText}** is analyzed below:
    
**Scenario Analysis**
1.  **Primary Credit Factor Impacted:** Credit Utilization Ratio (CUR). This is the second most important factor.
2.  **Mechanism of Score Change:** By either reducing the numerator (debt) or increasing the denominator (limit), you decrease the CUR, directly boosting your score by **${improvement} points**.
3.  **Long-term Behavioral Advice:** To sustain a high score, continue to pay credit card balances multiple times a month, keeping your *reported* CUR below 10%.
4.  **Final Conclusion:** ${conclusion}`;

    return { text: advice, isSimulated: true };
};

/**
 * Calls the external LLM to analyze the what-if scenario with a guaranteed fallback.
 * * !!! FUTURE API INTEGRATION POINT !!!
 * When integrating a new external API (e.g., OpenAI, Claude, etc.), you must update the following four sections:
 * 1. PROMPT: Ensure the prompt format works for your new model.
 * 2. API_CONFIG: Replace the apiKey variable, apiUrl, and model name.
 * 3. FETCH_CALL: Update headers and payload format to match your new API's requirements.
 * 4. RESPONSE_PARSING: Update how 'text' is extracted from the new API's JSON response structure.
 * * Keep the surrounding try/catch and the 'fallback' return logic to ensure the app remains stable
 * if your new API also encounters a network error.
 */
const fetchAdvisorAnalysis = async (currentScore, simulatedScore, whatIfAmount, whatIfType) => {
    const fallback = getSimulatedCibilAdvice(currentScore, simulatedScore, whatIfAmount, whatIfType);

    // 1. PROMPT: Structure the query for the new API model
    const prompt = `Act as a senior credit health consultant. Analyze a client's hypothetical "What-If" scenario:
    - Current Simulated CIBIL Score: ${currentScore}
    - What-If Action: ${whatIfType === 'payoff' ? `Pay off ₹${whatIfAmount}` : `Receive ₹${whatIfAmount} credit limit increase`}
    - Projected New Score: ${simulatedScore}

    Provide a concise, 4-point analysis covering: 
    1. The primary credit factor impacted (e.g., Utilization).
    2. The exact mechanism of score change.
    3. Long-term behavioral advice to sustain the new score.
    4. A final conclusion on whether the action is worth the cost. Use markdown formatting (bolding, lists).`;
    
    // 2. API_CONFIG: Replace this section for a new API
    const apiKey = ""; // System-provided key for Gemini. Replace with your new API key setup.
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`; // Replace with your new API URL
    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: {
            parts: [{ text: "You are an Indian credit bureau expert providing professional, actionable, and non-judgemental advice on CIBIL scores and financial strategy." }]
        },
    };
    
    try {
        // 3. FETCH_CALL: Update headers and payload for the new API
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error(`AI Fetch Failed (HTTP ${response.status}). Switching to simulated advice.`);
            return fallback;
        }

        const result = await response.json();
        const candidate = result.candidates?.[0];

        // 4. RESPONSE_PARSING: Update this logic to extract text from the new API's response structure
        if (candidate && candidate.content?.parts?.[0]?.text) {
            return {
                text: candidate.content.parts[0].text,
                isSimulated: false
            };
        } else {
            console.error("Invalid response structure from AI model. Switching to simulated advice.");
            return fallback;
        }
    } catch (error) {
        console.error("AI Fetch Failed (Network/Error). Switching to simulated advice.", error);
        return fallback; 
    }
};


// --- SIMULATION LOGIC COMPONENT ---

const CibilAdvisorApp = () => {
    const [inputs, setInputs] = useState({
        total_credit_limit: 500000,
        current_outstanding_debt: 200000,
        late_payments_24m: 0,
        oldest_account_years: 5,
    });
    
    // State for the "What-If" simulation
    const [whatIfAmount, setWhatIfAmount] = useState(50000);
    const [whatIfType, setWhatIfType] = useState('payoff'); // 'payoff' or 'limit_increase'
    
    // State for AI Integration
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [isAiSimulated, setIsAiSimulated] = useState(false);
    
    const handleChange = (e) => {
        const { id, value } = e.target;
        setInputs(prev => ({
            ...prev,
            [id]: parseFloat(value) || 0,
        }));
        // Reset AI advice when inputs change
        setAiAnalysis(null);
    };

    // Calculate current score and advice based on base inputs
    const currentScore = useMemo(() => calculateSimulatedCIBIL(inputs), [inputs]);
    const adviceList = useMemo(() => generateAdvice(inputs, currentScore), [inputs, currentScore]);
    
    // Calculate the score for the "What-If" scenario
    const simulatedScore = useMemo(() => {
        let simulatedInputs = { ...inputs };

        if (whatIfType === 'payoff') {
            // Simulate paying off a portion of the debt
            simulatedInputs.current_outstanding_debt = Math.max(0, inputs.current_outstanding_debt - whatIfAmount);
        } else if (whatIfType === 'limit_increase') {
            // Simulate receiving a credit limit increase
            simulatedInputs.total_credit_limit = inputs.total_credit_limit + whatIfAmount;
        }

        return calculateSimulatedCIBIL(simulatedInputs);
    }, [inputs, whatIfAmount, whatIfType]);

    // Determine score status for styling
    const scoreStatus = useMemo(() => {
        if (currentScore >= 750) return { label: 'Excellent', color: 'bg-green-600', text: 'text-green-800' };
        if (currentScore >= 680) return { label: 'Good', color: 'bg-blue-600', text: 'text-blue-800' };
        if (currentScore >= 600) return { label: 'Fair', color: 'bg-yellow-600', text: 'text-yellow-800' };
        return { label: 'Poor', color: 'bg-red-600', text: 'text-red-800' };
    }, [currentScore]);

    // Handle "What-If" change for amount input
    const handleWhatIfAmountChange = useCallback((e) => {
        setWhatIfAmount(parseFloat(e.target.value) || 0);
        setAiAnalysis(null);
    }, []);

    // Handle "What-If" type selection
    const handleWhatIfTypeChange = useCallback((type) => {
        setWhatIfType(type);
        setAiAnalysis(null);
    }, []);
    
    // Handler to trigger AI analysis
    const handleAnalyzeScenario = useCallback(async () => {
        setIsAiLoading(true);
        setAiAnalysis(null);
        
        // This calls the modular function
        const { text, isSimulated } = await fetchAdvisorAnalysis(
            currentScore, 
            simulatedScore, 
            whatIfAmount, 
            whatIfType
        );
        
        setAiAnalysis(text);
        setIsAiSimulated(isSimulated);
        setIsAiLoading(false);
    }, [currentScore, simulatedScore, whatIfAmount, whatIfType]);


    const scoreImprovement = simulatedScore - currentScore;


    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-inter">
            <script src="https://cdn.tailwindcss.com"></script>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
                .font-inter { font-family: 'Inter', sans-serif; }
                .whitespace-pre-line { white-space: pre-line; }
            `}</style>
            
            <header className="text-center py-6 bg-white shadow-md rounded-xl mb-8 max-w-4xl mx-auto">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 flex items-center justify-center">
                    <span className="mr-3 text-blue-500">🏦</span> Simulated CIBIL Score Advisor
                </h1>
                <p className="mt-2 text-lg text-gray-600">Analyze your credit behavior and simulate your path to a higher score.</p>
            </header>

            <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* --- COLUMN 1: INPUTS --- */}
                <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-xl h-fit">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Your Credit Snapshot</h2>
                    <form>
                        <InputField 
                            label="Total Sanctioned Credit Limit (All Accounts)"
                            id="total_credit_limit"
                            value={inputs.total_credit_limit}
                            onChange={handleChange}
                            unit="₹"
                            step={10000}
                        />
                        <InputField 
                            label="Current Outstanding Debt (Credit Card + Loans)"
                            id="current_outstanding_debt"
                            value={inputs.current_outstanding_debt}
                            onChange={handleChange}
                            unit="₹"
                            step={10000}
                        />
                        <InputField 
                            label="30+ Day Late Payments (Last 24 Months)"
                            id="late_payments_24m"
                            value={inputs.late_payments_24m}
                            onChange={handleChange}
                            type="number"
                            min={0}
                            step={1}
                        />
                        <InputField 
                            label="Age of Oldest Credit Account"
                            id="oldest_account_years"
                            value={inputs.oldest_account_years}
                            onChange={handleChange}
                            type="number"
                            min={0}
                            unit="years"
                            step={1}
                        />
                    </form>
                </div>

                {/* --- COLUMN 2: SCORE AND WHAT-IF SIMULATION --- */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Current Score Display */}
                    <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center border-t-8 border-blue-500">
                        <div className="flex items-end">
                            <p className="text-6xl font-black text-gray-900">{currentScore}</p>
                            <span className={`ml-3 px-3 py-1 text-sm font-bold rounded-full text-white ${scoreStatus.color} shadow-md`}>
                                {scoreStatus.label}
                            </span>
                        </div>
                        <div className="mt-4 sm:mt-0 text-right">
                            <p className="text-sm text-gray-500">Current Credit Utilization:</p>
                            <p className="text-2xl font-extrabold text-blue-600">
                                {((inputs.current_outstanding_debt / inputs.total_credit_limit) * 100).toFixed(0)}%
                            </p>
                        </div>
                    </div>

                    {/* What-If Simulation */}
                    <div className="bg-white p-6 rounded-2xl shadow-xl border-l-4 border-yellow-500">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                            <span className="mr-2 text-yellow-500">🧪</span> What-If Simulation
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <button
                                onClick={() => handleWhatIfTypeChange('payoff')}
                                className={`p-3 rounded-lg font-semibold transition duration-200 ${whatIfType === 'payoff' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                Pay Off Debt
                            </button>
                            <button
                                onClick={() => handleWhatIfTypeChange('limit_increase')}
                                className={`p-3 rounded-lg font-semibold transition duration-200 ${whatIfType === 'limit_increase' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                Increase Limit
                            </button>
                        </div>
                        
                        <InputField
                            label={`Amount to ${whatIfType === 'payoff' ? 'Pay Off' : 'Increase Limit By'} (₹)`}
                            id="what_if_amount"
                            value={whatIfAmount}
                            onChange={handleWhatIfAmountChange}
                            unit="₹"
                            step={10000}
                        />

                        {/* Simulation Result */}
                        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200 flex justify-between items-center">
                            <div>
                                <p className="text-lg font-semibold text-blue-800">New Simulated Score</p>
                                <p className="text-4xl font-black text-blue-900 mt-1">{simulatedScore}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-700">Improvement</p>
                                <p className={`text-3xl font-extrabold ${scoreImprovement > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                                    {scoreImprovement > 0 ? `+${scoreImprovement}` : '± 0'} pts
                                </p>
                            </div>
                        </div>
                        
                        {/* AI Analysis Button */}
                        <button 
                            onClick={handleAnalyzeScenario}
                            disabled={isAiLoading}
                            className={`w-full mt-6 py-3 rounded-lg font-bold text-white transition duration-300 shadow-md ${
                                isAiLoading ? 'bg-gray-400' : 'bg-pink-600 hover:bg-pink-700'
                            }`}
                        >
                            {isAiLoading ? 'Generating AI Analysis...' : 'Analyze Scenario with AI'}
                        </button>
                    </div>
                    
                    {/* AI Advice Display */}
                    <div className="bg-white p-6 rounded-2xl shadow-xl border-l-4 border-pink-500">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center">
                            <span className="mr-2 text-pink-500 text-3xl">🧠</span> AI Scenario Analysis
                        </h3>
                        
                        {aiAnalysis ? (
                            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                                {isAiSimulated && (
                                    <div className="p-2 mb-3 text-sm font-bold text-red-700 bg-red-100 border border-red-300 rounded-lg">
                                        🚨 Live AI service is restricted (403 Error). Displaying calculated fallback analysis.
                                    </div>
                                )}
                                {aiAnalysis}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">Click "Analyze Scenario with AI" above to get detailed, AI-powered advice on your hypothetical action.</p>
                        )}
                    </div>
                </div>

                {/* --- COLUMN 3: ACTIONABLE ADVICE (Stacked) --- */}
                <div className="lg:col-span-3">
                    <div className="bg-white p-6 rounded-2xl shadow-xl border-b-8 border-teal-500">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center">
                            <span className="mr-2 text-teal-500">🎯</span> General Actionable Steps to Improve
                        </h3>
                        <div className="space-y-4">
                            {adviceList.map((advice, index) => (
                                <div key={index} className="flex p-4 bg-gray-50 rounded-lg shadow-inner">
                                    <div className="text-2xl mr-4">{advice.icon}</div>
                                    <div>
                                        <p className="font-bold text-gray-800">{advice.title}</p>
                                        <p className="text-sm text-gray-600">{advice.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
            
            <footer className="text-center mt-10 py-4 text-gray-500 text-sm">
                Disclaimer: This is a simulated score based on typical CIBIL weighting. Your actual score may vary.
            </footer>
        </div>
    );
};

export default CibilAdvisorApp;
