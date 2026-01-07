import { useEffect, useState } from "react";
import "./NewScenarioBuilder.css";
import ElementName from "./custom/ElementName";
import DataValue from "./custom/DataValue";
import Dropdown from "./custom/Dropdown";

import THREE_DOTS from "../assets/three-dots.svg";
import EDIT from "../assets/edit-button.svg";
import ADD_ABOVE from "../assets/up-arrow.svg";
import ADD_BELOW from "../assets/down-arrow.svg";
import DELETE from "../assets/delete-button.svg";

import {STEP_ACTIONS, ASSERT_ACTIONS, OUTPUT_ACTIONS} from "../constants.js";

import axiosInstance from "../axios.js";


function parseCommaSeparatedValues(input) {
  return input.split(",").map(v => v.trim()).filter(Boolean);
}

const InsertIndicator = ({ targetIndex }) => (
  <div className="insert-indicator">
    <span className="insert-line" />
    <span className="insert-text">
      New step will be inserted here (position {targetIndex + 1})
    </span>
    <span className="insert-line" />
  </div>
);

const EditIndicator=({ targetIndex }) => (
  <div className="edit-indicator">
    <span className="edit-line" />
    <span className="edit-text">
      Edited step will replace the step at position {targetIndex + 1}
    </span>
    <span className="edit-line" />
  </div>
);

function buildEnglishSentence(action) {
  if (action.type === "step") {
    switch (action.action) {
      case "click":
        return <>Click on the element <ElementName>{action.element}</ElementName></>;

      case "input":
        return <>Enter <DataValue>{action.data}</DataValue> into the input field{" "}
          <ElementName>{action.element}</ElementName></>;

      case "upload":
        return <>Upload the file <DataValue>{action.data}</DataValue> into{" "}
          <ElementName>{action.element}</ElementName></>;

      case "autocomplete":
        return <>Select <DataValue>{action.data}</DataValue> from the dropdown{" "}
          <ElementName>{action.element}</ElementName></>;

      case "toggleState":
        return <>Set the toggle <ElementName>{action.element}</ElementName> to{" "}
          <DataValue>{action.data}</DataValue></>;

      case "checkbox":
        return <>Set the checkbox <ElementName>{action.element}</ElementName> to{" "}
          <DataValue>{action.data}</DataValue></>;

      case "date":
        return <>Select the date <DataValue>{action.data}</DataValue> for{" "}
          <ElementName>{action.element}</ElementName></>;

      case "editor":
        return <>Enter <DataValue>{action.data}</DataValue> into the text editor{" "}
          <ElementName>{action.element}</ElementName></>;

      case "multiSelectCreate":
        return <>Select or create{" "}
          <DataValue>{(action.data || []).join(", ")}</DataValue> in{" "}
          <ElementName>{action.element}</ElementName></>;

      case "clickPerticularJobTitle":
        return <>Click on the job title with ID{" "}
          <DataValue>{action.data}</DataValue></>;

      default:
        return null;
    }
  }

  if (action.type === "assert") {
    switch (action.assert) {
      case "text":
        return <>Verify that the text of{" "}
          <ElementName>{action.element}</ElementName> is exactly{" "}
          <DataValue>{action.expected}</DataValue></>;

      case "contains":
        return <>Verify that{" "}
          <ElementName>{action.element}</ElementName> contains the text{" "}
          <DataValue>{action.expected}</DataValue></>;

      case "arrayContains":
        return <>Verify that the list{" "}
          <ElementName>{action.element}</ElementName> contains{" "}
          <DataValue>{action.expected}</DataValue></>;

      default:
        return null;
    }
  }

  if (action.type === "output") {
    switch (action.action) {
      case "saveJobID":
        return <>Store the Job ID into the variable{" "}
          <DataValue>{action.key}</DataValue></>;
      default:
        return null;
    }
  }

  return null;
}


export default function NewScenarioBuilder({ allScenarios, setAllScenarios, pages, userid }) {
  const [scenario, setScenario] = useState({
    scenario_id: "",
    name: "",
    flow: [],
  });

  const [draft, setDraft] = useState({
    page: "",
    category: "step",
    action: "",
    element: "",
    value: "",
    values: [],
    key: "",
  });

  const [mode, setMode] = useState("add");
  const [targetIndex, setTargetIndex] = useState(null);
  const [preview, setPreview] = useState("json");
  const [editId, setEditId]=useState("");

  const selectedPage = pages.find(p => p.page === draft.page);
  const elements = selectedPage?.elements || [];
  const filteredElements = draft.action ? elements.filter(el => el.type === draft.action) : elements;
  const actionList = draft.category === "step" ? STEP_ACTIONS : draft.category === "assert" ? ASSERT_ACTIONS : OUTPUT_ACTIONS;
  const selectedAction = actionList.find(a => a.key === draft.action);

  function buildStepFromDraft() {
    if (draft.category === "step") {
      return {
        type: "step",
        page: draft.page,
        action: draft.action,
        element: draft.element,
        data: (draft.action === "multiSelectCreate" || draft.action==="upload") ? draft.values : draft.value,
      };
    }
    if (draft.category === "assert") {
      return {
        type: "assert",
        page: draft.page,
        assert: draft.action,
        element: draft.element,
        expected: draft.value,
      };
    }
    return {
      type: "output",
      page: draft.page,
      action: draft.action,
      key: draft.key,
    };
  }

  function resetDraftFields() {
    setDraft(prev => ({
      ...prev,
      value: "",
      values: [],
      key: "",
    }));
  }

  function resetDraftFields2(){
    setDraft({
      page: "",
      category: "step",
      action: "",
      element: "",
      value: "",
      values: [],
      key: "",
    });
  }

  function exitEditInsertMode() {
    setMode("add");
    setTargetIndex(null);
  }

  function handleAddOrSave() {
    if (!draft.page || !draft.category || !draft.action) return;
    if (draft.category !== "output" && !draft.element) return;
    if (draft.category === "output" && !draft.key) return;

    if ((draft.action === "multiSelectCreate" || draft.action==="upload") && (!draft.values || draft.values.length === 0)) {
      alert("Please enter at least one value separated by commas");
      return;
    }

    const step = buildStepFromDraft();
    const flow = [...scenario.flow];

    if (mode === "edit") {
      flow[targetIndex] = step;
    } else if (mode === "insert") {
      flow.splice(targetIndex, 0, step);
    } else {
      flow.push(step);
    }

    setScenario({ ...scenario, flow });

    resetDraftFields();
    exitEditInsertMode();
  }

  function handleEdit(index) {
    const step = scenario.flow[index];
    setMode("edit");
    setTargetIndex(index);

    setDraft({
      page: step.page,
      category: step.type,
      action: step.action || step.assert,
      element: step.element || "",
      value: step.expected || (Array.isArray(step.data) ? step.data.join(", ") : (step.data ?? "")),
      values: Array.isArray(step.data) ? step.data : [],
      key: step.key || "",
    });
  }

  function handleInsert(index) {
    setMode("insert");
    setTargetIndex(index);
    resetDraftFields();
  }

  function handleCancel() {
    resetDraftFields();
    exitEditInsertMode();
  }

  function handleDelete(index) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this step?"
    );

    if (!confirmDelete) return;

    const flow = [...scenario.flow];
    flow.splice(index, 1);

    setScenario({ ...scenario, flow });

    // If deleting the step currently being edited or inserted
    if (mode !== "add" && targetIndex === index) {
      resetDraftFields();
      exitEditInsertMode();
    }

    // If deleting a step before the targetIndex, adjust index
    if (mode === "insert" && targetIndex > index) {
      setTargetIndex(prev => prev - 1);
    }
  }

  const saveScenario = async () => {
    if (!scenario.scenario_id.trim() || !scenario.name.trim()) {
      alert("Scenario ID and Name are required");
      return;
    }

    const scenarioObject = {
      scenario_id: scenario.scenario_id,
      name: scenario.name,
      scenario_json: scenario,
      user_id: userid, 
    };

    try {
      const res=await axiosInstance.post("/savescenarionew", scenarioObject);
      const insertedId = res.data.id;
      setAllScenarios((prev)=>[
        {
          id: insertedId, 
          name: scenario.name, 
          scenario_id: scenario.scenario_id, 
          scenario_json: scenario
        }, ...prev]);
      alert("Scenario saved successfully");
      setScenario({scenario_id: "", name: "", flow: []});
      resetDraftFields2();

    } catch (err) {
      if (err.response?.status === 409) {
        alert(err.response.data.message || "Scenario id already exists");
      } else {
        alert("Server error. Please try again.");
      }
    }
  };

  useEffect(()=>{
    console.log("asss ", allScenarios);
  }, [allScenarios]);

  const handleEditScenario=(scenarioId)=>{
    const scWithId=allScenarios.find((sc)=>sc.id===scenarioId);

    setScenario({
      scenario_id: scWithId.scenario_id,
      name: scWithId.name,
      flow: scWithId.scenario_json.flow.map(step => ({ ...step })),
    });

    setPreview("json");
    setEditId(scenarioId);
  }

  const handleCancelEdit=()=>{
    setEditId("");
    setPreview("all");
    setScenario({
      scenario_id: "",
      name: "",
      flow: [],
    });
  }

  const handleSaveEdit=async ()=>{
    if (!scenario.scenario_id.trim() || !scenario.name.trim()) {
      alert("Scenario ID and Name are required");
      return;
    }

    const scenarioObject = {
      id: editId,
      scenario_id: scenario.scenario_id,
      name: scenario.name,
      scenario_json: scenario,
      user_id: userid,  
    };

    try {
      await axiosInstance.post("/saveeditedscenarionew", scenarioObject);

      setAllScenarios(prev =>
        prev.map(sc =>
          sc.id === editId ? {id: editId, name: scenario.name, scenario_id: scenario.scenario_id, scenario_json: scenario} : sc
        )
      );

      alert("Scenario edited successfully");
      setEditId("");
      setPreview("all");
      setScenario({
        scenario_id: "",
        name: "",
        flow: [],
      });
      resetDraftFields2();

    } catch (err) {
      console.error("Save scenario error:", err);
      alert("Failed to save scenario");
    }
  }

  return (
    <div className="newTestCase-container">
      <div className="newTestcasePannel1">
        <h2>New Scenario Builder</h2>
        

        <input
          placeholder="Scenario ID"
          value={scenario.scenario_id}
          onChange={e => setScenario({ ...scenario, scenario_id: e.target.value })}
        />

        <input
          placeholder="Scenario Name"
          value={scenario.name}
          onChange={e => setScenario({ ...scenario, name: e.target.value })}
        />

        <select
          value={draft.page}
          onChange={e => setDraft({ ...draft, page: e.target.value, element: "" })}
        >
          <option value="">--Select Page--</option>
          {pages.map(p => (
            <option key={p.page} value={p.page}>{p.page}</option>
          ))}
        </select>

        <select
          value={draft.category}
          onChange={e =>
            setDraft({
              ...draft,
              category: e.target.value,
              action: "",
              element: "",
              value: "",
              values: [],
              key: "",
            })
          }
        >
          <option value="step">Perform action</option>
          <option value="assert">Verify result</option>
          <option value="output">Save value</option>
        </select>

        <select
          value={draft.action}
          onChange={e =>
            setDraft({
              ...draft,
              action: e.target.value,
              element: "",
              value: "",
              values: [],
            })
          }
        >

          {draft.category === "step" && (
            <option value="">-- Select which action to perform --</option>
          )}

          {draft.category === "assert" && (
            <option value="">-- Select what to verify --</option>
          )}

          {draft.category === "output" && (
            <option value="">-- Select what to save --</option>
          )}
          
          {actionList.map(a => (
            <option key={a.key} value={a.key}>{a.label}</option>
          ))}
        </select>

        {draft.category !== "output" && (
          <select
            value={draft.element}
            onChange={e => setDraft({ ...draft, element: e.target.value })}
            disabled={!draft.page || !draft.action}
          >
            <option value="">--Select element--</option>
            {filteredElements.map(el => (
              <option key={el.name} value={el.name}>{el.name}</option>
            ))}
          </select>
        )}

        {(selectedAction?.needsData || selectedAction?.needsValue) && (
          <input
            placeholder={
              (draft.action === "multiSelectCreate" || draft.action==="upload")
                ? "Enter values separated by commas"
                : "Enter value"
            }
            value={draft.value}
            onChange={e =>
              (draft.action === "multiSelectCreate" || draft.action==="upload")
                ? setDraft({
                    ...draft,
                    value: e.target.value,
                    values: parseCommaSeparatedValues(e.target.value),
                  })
                : setDraft({ ...draft, value: e.target.value })
            }
          />
        )}

        {draft.category === "output" && (
          <input
            placeholder="Output key"
            value={draft.key}
            onChange={e => setDraft({ ...draft, key: e.target.value })}
          />
        )}

        <div className="builder-actions">
          <button className="primary" onClick={handleAddOrSave}>
            {mode === "edit" ? "Save" : mode === "insert" ? "Insert" : "Add"}
          </button>

          {(mode === "edit" || mode === "insert") && (
            <button className="secondary" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </div>

        <br />
        {preview === "json" && !editId && <button className="save-btn" onClick={saveScenario}>Save</button>}

        <div className="buttons-container">
          {preview === "json" && editId && <button className="add-btn" onClick={handleCancelEdit}>Cancel Edit</button>}
          {preview === "json" && editId && <button className="save-btn" onClick={handleSaveEdit}>Save Edit</button>}
        </div>


      </div>

      <div className="newTestcasePannel2">

        <div className="buttons-container-2">
          <div className="headingSave">
            <h3>{preview === "json" ? "Live Preview" : "All Scenarios"}</h3>
          </div>

          {!editId && 
            <Dropdown
              trigger={
                <img src={THREE_DOTS} alt="Actions" width="30" height="30" />
              }
              menuStyle={{ top: "30px", right: "0px" }}
            >
              <button
                  className="menu-item"
                  onClick={() => {setPreview("json")}}
              >
                <span>Live Preview</span>
              </button>

              <button
                  className="menu-item"
                  onClick={() => {setPreview("all")}}
              >
                <span>All Scenarios</span>
              </button>
            </Dropdown>
          }
          
        </div>


        {preview === "json" && (
          <div className="english-preview">
            {scenario.scenario_id && <p><strong>Scenario id:</strong> {scenario.scenario_id}</p>}
            {scenario.name && <p><strong>Scenario name:</strong> {scenario.name}</p>}
            {mode === "insert" && targetIndex === 0 && (<InsertIndicator targetIndex={targetIndex} />)}


            {scenario.flow.map((step, i) => {
              const showPage = i === 0 || scenario.flow[i - 1].page !== step.page;

              return (
                <div key={i}>
                  {showPage && <strong>{step.page}</strong>}

                  <div className="preview-step">
                    <span className="step-number">{i + 1}.</span>

                    <Dropdown
                      trigger={
                        <img src={THREE_DOTS} alt="Actions" width="20" height="18" />
                      }
                      menuStyle={{ top: "20px", left: "0" }}
                    >
                      <button className="menu-item" onClick={() => handleEdit(i)}>
                        <img src={EDIT} width="16" />
                        <span>Edit</span>
                      </button>

                      <button className="menu-item" onClick={() => handleInsert(i)}>
                        <img src={ADD_ABOVE} width="16" />
                        <span>Add Above</span>
                      </button>

                      <button className="menu-item" onClick={() => handleInsert(i+1)}>
                        <img src={ADD_BELOW} width="16" />
                        <span>Add Below</span>
                      </button>

                      <button className="menu-item danger" onClick={() => handleDelete(i)}>
                        <img src={DELETE} width="16" />
                        <span>Delete</span>
                      </button>
                    </Dropdown>

                    <span>{buildEnglishSentence(step)}</span>
                  </div>


                  {/* Insert indicator between i and i+1 */}
                  {mode === "insert" && targetIndex === i + 1 && 
                      <InsertIndicator targetIndex={targetIndex}/>
                  }

                  {/* Edit indicator (optional) – shows on the step being edited */}
                  {mode === "edit" && targetIndex === i && 
                      <EditIndicator targetIndex={targetIndex}/>
                  }
                </div>
              );
            })}

            {/* Indicator at bottom when inserting at end */}
            {/* {mode === "insert" && targetIndex === scenario.flow.length && (<InsertIndicator targetIndex={targetIndex} />)} */}
          </div>
        )}


        {preview === "all" && (
          <div className="all-scenarios">
            <hr />
            {allScenarios.map((s, index) => (
              <div key={index} style={{ marginBottom: "20px" }}>
                {/* console.log("sc ",index+1, "...",s); */}
           

                <div className="buttons-container-3">
                  <p><strong>Scenario id:</strong> {s.scenario_id}</p>   

                  <Dropdown
                    trigger={
                      <img src={THREE_DOTS} alt="Actions" width="20" height="20" />
                    }
                    menuStyle={{ top: "20px", left: "0px" }}
                  >
                    <button onClick={()=>handleEditScenario(s.id)} className="menu-item">
                      <img src={EDIT} width="16" />
                      <span>Edit Scenario</span>
                    </button>

                  </Dropdown>
                </div>
                <p><strong>Scenario name:</strong> {s.name}</p>
                {s.scenario_json.flow.map((step, i) => {
                  const showPage = i === 0 || s.scenario_json.flow[i - 1].page !== step.page;

                  return (
                    <div key={i}>
                      {showPage && <strong>{step.page}</strong>}

                      <div className="preview-step">
                        <span className="step-number">{i + 1}.</span>
                        <span>{buildEnglishSentence(step)}</span>
                      </div>
                    </div>
                  );
                })}

                <hr />
              </div>
            ))}
          </div>
        )}


      </div>
    </div>
  );
}



