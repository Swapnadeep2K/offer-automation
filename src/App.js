import React, { useState } from "react";

function App() {
  const [jsonInput, setJsonInput] = useState("");
  const [dataPath, setDataPath] = useState("");
  const [responses, setResponses] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [intervalSeconds, setIntervalSeconds] = useState(10);
  const [isDarkTheme, setIsDarkTheme] = useState(true); // default dark

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
    if (!jsonInput.trim()) {
      alert("Please enter a valid JSON payload.");
      return;
    }

    if (!dataPath.trim()) {
      alert("Please enter a data path to extract.");
      return;
    }

    if (intervalSeconds < 1) {
      alert("Polling interval must be at least 1 second.");
      return;
    }

    stopPolling(); // clear any previous polling

    const id = setInterval(() => {
      fetchData();
    }, intervalSeconds * 1000); // convert seconds to ms

    setIntervalId(id);
    setIsRunning(true);
  };

  const stopPolling = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setIsRunning(false);
  };

  // --- Theme styles ----------------------------------------------------

  const containerStyle = {
    fontFamily: "Adobe Clean, Helvetica Neue, sans-serif",
    backgroundColor: isDarkTheme ? "#121212" : "#F2F2F2",
    color: isDarkTheme ? "#FFFFFF" : "#333333",
    minHeight: "100vh",
    padding: "40px",
    boxSizing: "border-box",
    transition: "background-color 0.3s ease, color 0.3s ease",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    backgroundColor: isDarkTheme ? "#1E1E1E" : "#FFFFFF",
    color: isDarkTheme ? "#fff" : "#333",
    border: "1px solid " + (isDarkTheme ? "#555" : "#ccc"),
    borderRadius: "4px",
    marginTop: "5px",
    marginBottom: "15px",
  };

  const buttonStyle = (bgColor) => ({
    padding: "10px 20px",
    backgroundColor: bgColor,
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
    marginRight: "10px",
  });

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: isDarkTheme ? "#1E1E1E" : "#fff",
    color: isDarkTheme ? "#fff" : "#333",
  };

  const thStyle = {
    border: "1px solid " + (isDarkTheme ? "#444" : "#ccc"),
    padding: "10px",
    backgroundColor: isDarkTheme ? "#2A2A2A" : "#EAEAEA",
  };

  const tdStyle = {
    border: "1px solid " + (isDarkTheme ? "#444" : "#ccc"),
    padding: "10px",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  };

  // const toggleTheme = () => {
  //   setIsDarkTheme((prev) => !prev);
  // };

  // --- Render ----------------------------------------------------------
  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between" }}>
        <h2 style={{ margin: 0 }}>Offer Automation: JSON Polling</h2>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
            <div style={{
              position: "relative",
              width: 40,
              height: 20,
              background: isDarkTheme ? "#333" : "#ccc",
              borderRadius: 20,
              marginRight: 10,
              transition: "background 0.3s"
            }}>
              <div style={{
                position: "absolute",
                top: 2,
                left: isDarkTheme ? 20 : 2,
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "#fff",
                transition: "left 0.3s"
              }} />
            </div>
            <input
              type="checkbox"
              checked={isDarkTheme}
              onChange={() => setIsDarkTheme(!isDarkTheme)}
              style={{ display: "none" }}
            />
            <span style={{ color: isDarkTheme ? "#fff" : "#000", fontWeight: 500 }}>Dark theme</span>
          </label>
        </div>
      </div>

      <div style={{ display: "flex", gap: "20px", marginBottom: "15px" }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", marginBottom: 5 }}>Select Datastream ID:</label>
          <select
            value={selectedConfigId}
            onChange={(e) => setSelectedConfigId(e.target.value)}
            style={inputStyle}
          >
            {configIds.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1 }}>
          <label style={{ display: "block", marginBottom: 5 }}>Enter the interval in seconds:</label>
          <input
            type="number"
            placeholder="Polling interval in seconds"
            value={intervalSeconds}
            onChange={(e) => setIntervalSeconds(Number(e.target.value))}
            style={inputStyle}
          />
        </div>
      </div>

      <textarea
        rows={10}
        placeholder="Paste JSON payload here"
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        style={inputStyle}
      />

      <input
        placeholder="Path to extract (e.g. propositions[0].items[0].id)"
        value={dataPath}
        onChange={(e) => setDataPath(e.target.value)}
        style={inputStyle}
      />

      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        {!isRunning ? (
          <button onClick={startPolling} style={buttonStyle("#3663D8")}>
            <i className="fa-solid fa-play" style={{ color: "#ffffff" }}></i>
            &nbsp;Start
          </button>
        ) : (
          <button onClick={stopPolling} style={buttonStyle("#D83636")}>
            <i class="fa-solid fa-stop" style={{ color: "#ffffff" }}></i>
            &nbsp;Stop
          </button>
        )}

        {responses.length > 0 && (
          <button onClick={() => setResponses([])} style={buttonStyle("#999")}>
            <i class="fa-solid fa-rotate" style={{ color: "#ffffff" }}></i>
            &nbsp;Reset Table
          </button>
        )}
      </div>


      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Time</th>
            <th style={thStyle}>Extracted Value</th>
          </tr>
        </thead>
        <tbody>
          {responses.map((row, idx) => (
            <tr key={idx}>
              <td style={tdStyle}>{row.timestamp}</td>
              <td style={tdStyle}>
                <pre style={{ margin: 0 }}>
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
