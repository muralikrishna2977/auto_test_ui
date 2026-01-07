import "./TestData.css";
import { useState, useRef } from "react";
import { REQUIRED_DATA } from "../constants";
import axiosInstance from "../axios";

function TestData({ testcases, allScenarios }) {
  const [selectedTestcaseId, setSelectedTestcaseId] = useState("");
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [activeRow, setActiveRow] = useState(1);

  const inputRefs = useRef([]);

  // Helpers

  const createEmptyRow = (cols) =>
    cols.map((col) => ({
      id: col.id,
      element: col.element,
      value: "",
    }));

    //  Testcase selection

  const handleTestcaseSelect = async (e) => {
    const testcaseId = e.target.value;
    setSelectedTestcaseId(testcaseId);
    inputRefs.current = [];

    if (!testcaseId) {
      setColumns([]);
      setRows([]);
      return;
    }

    const tc = testcases.find((t) => t.testcase_id === testcaseId);
    if (!tc) return;

    //  BUILD STABLE COLUMNS (FIX)

    const cols = [];

    tc.scenarios.forEach((scId) => {
      const scenario = allScenarios.find((s) => s.scenario_id === scId);
      if (!scenario) return;

      scenario.scenario_json.flow.forEach((step, stepIndex) => {
        const key = step.action || step.assert;
        if (REQUIRED_DATA[key]) {
          cols.push({
            id: `${scId}_${stepIndex}`, // stable occurrence ID
            element: step.element,
            scenarioId: scId,
            stepIndex,
          });
        }
      });
    });

    setColumns(cols);

    //  LOAD SAVED DATA

    const res = await axiosInstance.get(`/testdata/${testcaseId}`);

    if (!res.data?.rows?.length) {
      setRows([createEmptyRow(cols)]);
      setActiveRow(1);
      return;
    }

    const normalizedRows = res.data.rows.map((row) =>
      cols.map((col) => ({
        id: col.id,
        element: col.element,
        value: row.find((c) => c.id === col.id)?.value || "",
      }))
    );

    setRows(normalizedRows);
    setActiveRow(res.data.row_used || 1);
  };

  //  Row operations

  const addRow = () => {
    setRows((prev) => [...prev, createEmptyRow(columns)]);
  };

  const handleCellChange = (rowIndex, colIndex, value) => {
    const updated = [...rows];
    updated[rowIndex][colIndex] = {
      ...updated[rowIndex][colIndex],
      value,
    };
    setRows(updated);
  };

  //  Keyboard navigation

  const handleKeyNavigation = (e, rowIndex, colIndex) => {
    const maxRow = rows.length - 1;
    const maxCol = columns.length - 1;

    let r = rowIndex;
    let c = colIndex;

    switch (e.key) {
      case "ArrowRight":
        c = Math.min(colIndex + 1, maxCol);
        break;
      case "ArrowLeft":
        c = Math.max(colIndex - 1, 0);
        break;
      case "ArrowDown":
        r = Math.min(rowIndex + 1, maxRow);
        break;
      case "ArrowUp":
        r = Math.max(rowIndex - 1, 0);
        break;
      default:
        return;
    }

    e.preventDefault();
    inputRefs.current?.[r]?.[c]?.focus();
  };

  //  Save operations

  const handleSaveRows = async () => {
    await axiosInstance.post("/savetestdata", {
      selectedTestcaseId,
      rows,
    });
    alert("Test data saved");
  };

  const handleSaveActiveRow = async () => {
    await axiosInstance.put("/activerow", {
      testcase_id: selectedTestcaseId,
      row_used: activeRow,
    });
    alert("Active row saved");
  };

  //  UI

  return (
    <div className="testdata">
      <div className="data-toppannel">
        <div className="data-buttons-container">
          <select value={selectedTestcaseId} onChange={handleTestcaseSelect}>
            <option value="">-- Select Testcase --</option>
            {testcases.map((tc) => (
              <option key={tc.testcase_id} value={tc.testcase_id}>
                {tc.name} ({tc.testcase_id})
              </option>
            ))}
          </select>

          {selectedTestcaseId && (
            <>
              <button onClick={addRow} className="add-btn">
                Add Row
              </button>
              <button onClick={handleSaveRows} className="save-btn">
                Save
              </button>
            </>
          )}
        </div>

        {selectedTestcaseId && (
          <div className="data-buttons-container">
            <p>
              <strong>
                Enter the SI.NO of the row used for this testcase{" "}
              </strong>
            </p>
            <input
              type="number"
              value={activeRow}
              onChange={(e) => setActiveRow(Number(e.target.value))}
            />
            <button className="save-btn" onClick={handleSaveActiveRow}>
              Save
            </button>
          </div>
        )}
      </div>

      <div className="table-wrapper">
        {!selectedTestcaseId && (
          <h4>
            <strong>Select a testcase to display data</strong>
          </h4>
        )}

        {selectedTestcaseId && (
          <table border="1" className="excel-table">
            <thead>
              <tr>
                <th>SI.NO</th>
                {columns.map((col) => (
                  <th key={col.id}>{col.element}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td>{rowIndex + 1}</td>

                  {row.map((cell, colIndex) => (
                    <td key={cell.id}>
                      <input
                        ref={(el) => {
                          if (!inputRefs.current[rowIndex]) {
                            inputRefs.current[rowIndex] = [];
                          }
                          inputRefs.current[rowIndex][colIndex] = el;
                        }}
                        value={cell.value}
                        title={cell.element}
                        onChange={(e) =>
                          handleCellChange(rowIndex, colIndex, e.target.value)
                        }
                        onKeyDown={(e) =>
                          handleKeyNavigation(e, rowIndex, colIndex)
                        }
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default TestData;
