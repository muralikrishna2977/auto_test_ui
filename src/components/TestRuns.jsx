import { useState, useEffect, useRef } from "react";
import "./TestRuns.css";
import Switch from "react-switch";
import axiosInstance from "../axios";

const browsers = ["chromium", "firefox", "webkit"];

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "20px",
};

const thStyle = {
  border: "1px solid #ccc",
  padding: "10px",
  background: "#f6f6f6",
};

const tdStyle = {
  border: "1px solid #ddd",
  padding: "8px",
};

export default function TestRuns({groups}) {
  const [idsInput, setIdsInput] = useState("");
  const [tag, setTag] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [modeOfRun, setModeOfRun] = useState(true);
  const [modeOfView, setModeOfView]=useState(true);
  const runMode = modeOfRun ? "serial" : "parallel";
  const viewMode= modeOfView ? "headed": "hidden";
  const [selectedBrowsers, setSelectedBrowsers] = useState(["chromium"]);
  const [testruns, setTestruns] = useState([]);


  // track status transitions
  const [runStatus, setRunStatus] = useState({ status: "idle" });
  const lastStatusRef = useRef("idle");

  const returnTime=()=>{
    const now = new Date();
    const options = {
      timeZone: "Asia/Kolkata",
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    const parts = new Intl.DateTimeFormat("en-IN", options)
      .formatToParts(now)
      .reduce((acc, p) => ({ ...acc, [p.type]: p.value }), {});

    const year = parts.year;
    const month = parts.month;
    const day = parts.day;

    const hour = parts.hour;
    const minute = parts.minute;
    const second = parts.second;
    const ampm = parts.dayPeriod.toUpperCase(); // AM / PM

    return `${day}-${month}-${year}_${hour}-${minute}-${second}_${ampm}`;
  }

  const guardRunning = () => {
    if (lastStatusRef.current  === "running") {
      alert("Please wait for the current run to finish");
      return true;
    }
    return false;
  };

  const loadRuns = async () => {
    try {
      const res = await axiosInstance.get("/testruns");
      setTestruns(res.data || []);
    } catch (err) {
      console.error("Error loading testruns:", err);
    }
  };

  const pollRunStatus = async () => {
    try {
      const res = await axiosInstance.get("/runStatus");
      const newStatus = res.data?.status || "idle";

      // update state ONLY if status changed
      if (lastStatusRef.current !== newStatus) {
        setRunStatus(res.data || { status: "idle" });
      }

      // load history ONLY when run finishes
      if (
        lastStatusRef.current === "running" &&
        newStatus !== "running"
      ) {
        await loadRuns();
      }

      lastStatusRef.current = newStatus;
    } catch (err) {
      console.error("Polling error", err);
    }
  };


  useEffect(() => {
    loadRuns();
    pollRunStatus();
    const interval = setInterval(pollRunStatus, 2000);
    return () => clearInterval(interval);
  }, []);



  const handleCheckbox = (browser) => {
    let updated;
    if (selectedBrowsers.includes(browser)) {
      updated = selectedBrowsers.filter((b) => b !== browser);
    } else {
      updated = [...selectedBrowsers, browser];
    }
    if (updated.length === 0) {
      alert("At least one browser must be selected");
      return;
    }
    setSelectedBrowsers(updated);
  };

  const runRequest = async (body) => {
    try {
      await axiosInstance.post("/runTestcases", body);
    } catch (err) {
      console.error("Run request failed:", err);
      alert(err.response?.data?.message || "Run failed");
    }
  };


  const runByIds = () => {
    if (guardRunning()) return;
    const ids = idsInput.split(",").map((s) => s.trim()).filter(Boolean);
    if (!ids.length) return alert("Enter testcase IDs");
    runRequest({
      mode: "byIds",
      testcase_ids: ids,
      selectedBrowsers,
      runMode,
      viewMode,
      time: returnTime(),
    });
  };

  const runByGroup = () => {
    if (guardRunning()) return;
    if (!selectedGroupId) return alert("Select a group");
    runRequest({
      mode: "byGroup",
      group_id: selectedGroupId,
      selectedBrowsers,
      runMode,
      viewMode,
      time: returnTime(),
    });
  };

  const runByTag = () => {
    if (guardRunning()) return;
    if (!tag.trim()) return alert("Enter tag");
    runRequest({
      mode: "byTag",
      tag,
      selectedBrowsers,
      runMode,
      viewMode,
      time: returnTime(),
    });
  };

  const runAll = () => {
    if (guardRunning()) return;
    runRequest({
      mode: "all",
      selectedBrowsers,
      runMode,
      viewMode,
      time: returnTime(),
    });
  };

  function formatRunTime(time) {
    if (typeof time !== "string") return "";
    const parts = time.split("_");
    if (parts.length !== 3) return time;
    const [date, timePart, ampm] = parts;
    return `${date} ${timePart.replace(/-/g, ":")} ${ampm}`;
  }


  const openReport = async (reportName) => {
    try {
      await axiosInstance.get(`/previousReport/${reportName}`);
    } catch (err) {
      console.error("Failed to open report:", err);
      alert(err.response?.data?.error || "Report open failed");
    }
  };


  const statusText = (runStatus?.status || "idle").toUpperCase();
  const isRunning = runStatus?.status === "running";

  return (
    <div className="testruns-container">
      {/* LEFT PANEL */}
      <div className="left-panel">
        <h2>Run Automation</h2>

        <div className="modes-controll">
          <div className="browsers">
            <h4>Browsers</h4>
            {browsers.map((browser) => (
              <label className="checkbox" key={browser}>
                <span>{browser}</span>
                <input
                  type="checkbox"
                  checked={selectedBrowsers.includes(browser)}
                  onChange={() => handleCheckbox(browser)}
                />
              </label>
            ))}
          </div>
          
          <div className="modesOfRun">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span><h4>Run Mode</h4></span>
              <Switch
                onChange={setModeOfRun}
                checked={modeOfRun}
                onColor="#4caf50"
                offColor="#ccc"
                uncheckedIcon={false}
                checkedIcon={false}
              />
              <span>{modeOfRun ? "Serial" : "Parallel"}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span><h4>View Mode</h4></span>
              <Switch
                onChange={setModeOfView}
                checked={modeOfView}
                onColor="#4caf50"
                offColor="#ccc"
                uncheckedIcon={false}
                checkedIcon={false}
              />
              <span>{modeOfView ? "Headed" : "Hidden"}</span>
            </div>
          </div>

        </div>

        <div className="card">
          <h4>Run by Testcase IDs</h4>
          <input
            type="text"
            placeholder="TC-001, TC-002"
            value={idsInput}
            onChange={(e) => setIdsInput(e.target.value)}
            disabled={isRunning}
          />
          <button className="run-btn" onClick={runByIds} disabled={isRunning}>
            Run
          </button>
        </div>

        <div className="card">
          <h4>Run by Group</h4>
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            disabled={isRunning}
          >
            <option value="">-- select group --</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.group_name}
              </option>
            ))}
          </select>
          <button className="run-btn" onClick={runByGroup} disabled={isRunning}>
            Run Group
          </button>
        </div>

        <div className="card">
          <h4>Run by Tag</h4>
          <input
            type="text"
            placeholder="smoke"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            disabled={isRunning}
          />
          <button className="run-btn" onClick={runByTag} disabled={isRunning}>
            Run Tag
          </button>
        </div>

        <div className="card">
          <h4>Run All</h4>
          <button className="run-btn" onClick={runAll} disabled={isRunning}>
            Run All
          </button>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="right-panel">
        <h2>Framework Status</h2>

        <p className={`status-line ${isRunning ? "running" : "idle"}`}>
          <label>Status of Playwright:</label>{" "}
          <span className="status-pill">{statusText}</span>
        </p>

        <h2>Test Run History</h2>

        <div className="history">
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Run Mode</th>
                <th style={thStyle}>Group Name</th>
                <th style={thStyle}>Tag</th>
                <th style={thStyle}>Testcase IDs</th>
                <th style={thStyle}>Browsers</th>
                <th style={thStyle}>RunMode</th>
                <th style={thStyle}>Open Report</th>
                <th style={thStyle}>Start Time</th>
              </tr>
            </thead>
            <tbody>
              {testruns.map((run) => (
                <tr key={run.id}>
                  <td style={tdStyle}>{run.id}</td>
                  <td style={tdStyle}>{run.testcaserunmode}</td>


                  <td style={tdStyle}>{run.group_name || "-"}</td>
                  <td style={tdStyle}>{run.tag || "-"}</td>
                  <td style={tdStyle}>
                    {Array.isArray(run.rantestcaseids)
                      ? run.rantestcaseids.map((id, index) => (
                          <div key={index}>{id}</div>
                        ))
                      : run.rantestcaseids}
                  </td>

                  <td style={tdStyle}>
                    {typeof run.selectedbrowsers === "string"
                      ? run.selectedbrowsers.split(",").map((browser, index) => (
                          <div key={index}>{browser.trim()}</div>
                        ))
                      : run.selectedbrowsers}
                  </td>


                  <td style={tdStyle}>{run.runmode}</td>
                  <td style={tdStyle}>
                    <button
                      className="report-btn"
                      onClick={() => openReport(run.reportname)}
                    >
                      Open Report
                    </button>
                  </td>
                  <td style={tdStyle}>{formatRunTime(run.reportname)}</td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


