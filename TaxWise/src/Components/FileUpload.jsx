import { useState } from "react";

function FileUpload({ setTransactions }) {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setTransactions(data);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <label className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700">
        {loading ? "Uploading..." : "Upload Bank CSV"}
        <input type="file" accept=".csv" hidden onChange={handleUpload} />
      </label>
    </div>
  );
}

export default FileUpload;
