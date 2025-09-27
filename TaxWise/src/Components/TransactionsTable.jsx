function TransactionsTable({ transactions }) {
    return (
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-3 border">Date</th>
              <th className="p-3 border">Description</th>
              <th className="p-3 border">Amount</th>
              <th className="p-3 border">Category</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="p-3 border">{txn.Date}</td>
                <td className="p-3 border">{txn.Description}</td>
                <td className="p-3 border">₹{txn.Amount}</td>
                <td className="p-3 border font-semibold text-blue-600">
                  {txn.Category}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  
  export default TransactionsTable;
  