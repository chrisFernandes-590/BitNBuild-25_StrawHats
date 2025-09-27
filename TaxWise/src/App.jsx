import { useState } from "react";
import FileUpload from "./components/FileUpload";
import TransactionsTable from "./components/TransactionsTable";


function App() {
  const [transactions, setTransactions] = useState([]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
        📊 TaxWise - Smart Financial Ingestion
      </h1>

      <FileUpload setTransactions={setTransactions} />

      {transactions.length > 0 && (
        <div className="mt-8">
          <TransactionsTable transactions={transactions} />
        </div>
      )}
    </div>
  );
}

export default App;
