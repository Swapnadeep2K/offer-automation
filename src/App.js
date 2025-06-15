import React, { useState } from "react";

function App() {
  const [jsonInput, setJsonInput] = useState("");
  const [dataPath, setDataPath] = useState("");
  const [responses, setResponses] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [intervalId, setIntervalId] = useState(null);

  const configIds = [
    { label: "Development", value: "0fd7f30c-ae2b-4365-9db9-2ef9ed5e1dc6" },
    { label: "Staging", value: "140d9dfa-12d0-4e8e-95fa-99df70030bc8" },
    { label: "Production", value: "99998888-7777-6666-5555-444433332222" }
  ];

  const [selectedConfigId, setSelectedConfigId] = useState(configIds[0].value);

  const generateUUID = () =>
    "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });

  const extractValueFromPath = (obj, path) => {
    try {
      return path
        .replace(/\[(\d+)\]/g, ".$1")
        .split(".")
        .reduce((acc, key) => acc?.[key], obj);
    } catch {
      return undefined;
    }
  };

  const fetchData = async () => {
    try {
      const payload = JSON.parse(jsonInput);
      const requestId = generateUUID();

      const url = `https://smetrics.wyndhamhotels.com/ee/ind1/v1/interact?configId=${selectedConfigId}&requestId=${requestId}`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await response.json();
      const value = extractValueFromPath(json, dataPath);

      setResponses((prev) => [
        ...prev,
        {
          timestamp: new Date().toLocaleTimeString(),
          value,
        },
      ]);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const startPolling = () => {
    stopPolling(); // just in case

    const id = setInterval(() => {
      fetchData();
    }, 10000);

    setIntervalId(id);
    setIsRunning(true);
  };

  const stopPolling = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setIsRunning(false);
    setResponses([]); // clear table
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Offer Automation: JSON Polling</h2>

      <label>Select Config ID:</label>
      <select
        value={selectedConfigId}
        onChange={(e) => setSelectedConfigId(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      >
        {configIds.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>

      <textarea
        rows={15}
        placeholder="Paste JSON payload here"
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <input
        placeholder="Path to extract (e.g. propositions[0].items[0].id)"
        value={dataPath}
        onChange={(e) => setDataPath(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      {!isRunning ? (
        <button onClick={startPolling}>Start</button>
      ) : (
        <button onClick={stopPolling}>Stop</button>
      )}

      <table border="1" cellPadding="8" style={{ marginTop: 20, width: "100%" }}>
        <thead>
          <tr>
            <th>Time</th>
            <th>Extracted Value</th>
          </tr>
        </thead>
        <tbody>
          {responses.map((row, idx) => (
            <tr key={idx}>
              <td>{row.timestamp}</td>
              <td>
                <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  {row.value !== undefined
                    ? typeof row.value === "object"
                      ? JSON.stringify(row.value, null, 2)
                      : row.value.toString()
                    : "N/A"}
                </pre>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
