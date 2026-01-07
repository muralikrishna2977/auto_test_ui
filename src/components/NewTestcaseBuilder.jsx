import { useState } from "react";
import "./NewTestcaseBuilder.css";
import ElementName from "./custom/ElementName";
import DataValue from "./custom/DataValue";
import Dropdown from "./custom/Dropdown";
import Select from "react-select";
import "./NewTestcaseBuilder.css";
import THREE_DOTS from "../assets/three-dots.svg";

import axiosInstance from "../axios.js";

// ENGLISH SENTENCE BUILDER

function buildEnglishSentence(action) {
  if (action.type === "step") {
    switch (action.action) {
      case "click":
        return <>Click on the element <ElementName>{action.element}</ElementName></>;

      case "input":
        return <>Enter <DataValue>{action.data}</DataValue> into the input field <ElementName>{action.element}</ElementName></>;

      case "upload":
        return <>Upload the file <DataValue>{action.data}</DataValue> into <ElementName>{action.element}</ElementName></>;

      case "autocomplete":
        return <>Select <DataValue>{action.data}</DataValue> from the dropdown <ElementName>{action.element}</ElementName></>;

      case "toggleState":
        return <>Set the toggle <ElementName>{action.element}</ElementName> to <DataValue>{action.data}</DataValue></>;

      case "checkbox":
        return <>Set the checkbox <ElementName>{action.element}</ElementName> to <DataValue>{action.data}</DataValue></>;

      case "date":
        return <>Select the date <DataValue>{action.data}</DataValue> for <ElementName>{action.element}</ElementName></>;

      case "editor":
        return <>Enter <DataValue>{action.data}</DataValue> into the text editor <ElementName>{action.element}</ElementName></>;

      case "multiSelectCreate":
        return <>Select or create <DataValue>{(action.data || []).join(", ")}</DataValue> in <ElementName>{action.element}</ElementName></>;

      case "clickPerticularJobTitle":
        return <>Click on the job title with ID <DataValue>{action.data}</DataValue></>;

      default:
        return null;
    }
  }

  if (action.type === "assert") {
    switch (action.assert) {
      case "text":
        return <>Verify that the text of <ElementName>{action.element}</ElementName> is exactly <DataValue>{action.expected}</DataValue></>;

      case "contains":
        return <>Verify that <ElementName>{action.element}</ElementName> contains the text <DataValue>{action.expected}</DataValue></>;

      case "arrayContains":
        return <>Verify that the list <ElementName>{action.element}</ElementName> contains <DataValue>{action.expected}</DataValue></>;

      default:
        return null;
    }
  }

  if (action.type === "output") {
    switch (action.action) {
      case "saveJobID":
        return <>Store the Job ID into the variable <DataValue>{action.key}</DataValue></>;
      default:
        return null;
    }
  }

  return null;
}


//  COMPONENT
export default function NewTestcaseBuilder({
  allScenarios,
  testcases,
  setTestcases,
}) {
  const [tcId, setTcId] = useState("");
  const [tcName, setTcName] = useState("");
  const [tags, setTags] = useState("");
  const [scenarioList, setScenarioList] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [open, setOpen]=useState("preview");

  const saveTestcase = async () => {
    if (!tcId.trim() || !tcName.trim()) {
      alert("Testcase ID and Name are required");
      return;
    }

    const scnarioIds=scenarioList.map((sc)=>sc.scenario_id);
    const tcObject = {
      testcase_id: tcId,
      name: tcName,
      tags: tags ? tags.split(",").map(t => t.trim()) : [],
      scenarios: scnarioIds,
    };

    try {
      await axiosInstance.post("/savenewtestcase", {
        testcase_id: tcId,
        name: tcName,
        testcase_json: tcObject,
      });

      setTestcases([...testcases, tcObject]);
      setTcId("");
      setTcName("");
      setTags("");
      setScenarioList([]);

      alert("Testcase saved successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to save testcase");
    }
  };

  const scenarioOptions = allScenarios.map(sc => ({
    value: sc.scenario_id,
    label: `${sc.scenario_id} - ${sc.name}`,
    object: sc.scenario_json,
  }));


  return (
    <div className="new-testcase-builder-container">

      <div className="testcase-form-section">
        <h2>Testcase Builder</h2>

        <input
          placeholder="Testcase ID"
          value={tcId}
          onChange={e => setTcId(e.target.value)}
        />

        <input
          placeholder="Testcase Name"
          value={tcName}
          onChange={e => setTcName(e.target.value)}
        />

        <input
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={e => setTags(e.target.value)}
        />

        <Select
          className="react_select"
          value={selectedScenario}
          options={scenarioOptions}
          placeholder="Search scenario..."
          onChange={(selected) => {
            if (!selected) return;
            if (!scenarioList.some(sc => sc.scenario_id === selected.object.scenario_id)) {
              setScenarioList([...scenarioList, selected.object]);
            }
            setSelectedScenario(null);
          }}
        />
        <br />
        <button className="add-btn" onClick={saveTestcase}>Save Testcase</button>

      </div>

      <div className="pannel3-testcases">
        <div className="new-buttons-container">
          {open==="preview" && <h3>Preview of the testcase {tcName}</h3>}
          {open==="allCases" && <h3>All Testcases</h3>}


          <Dropdown
            trigger={
              <img src={THREE_DOTS} alt="Actions" width="30" height="30" />
            }
            menuStyle={{ top: "20px", right: "0px" }}
          >
            <button
                className="menu-item"
                onClick={() => {setOpen("preview")}}
            >
              <span>Live Preview</span>
            </button>

            <button
                className="menu-item"
                onClick={() => {setOpen("allCases")}}
            >
              <span>All Testcases</span>
            </button>
          </Dropdown>
        </div>

        {open=="preview" && 
          <div className="allSteps">
            {tcId && <p><strong>Testcase id:</strong> {tcId}</p>}
            {tcName && <p><strong>Testcase name:</strong> {tcName}</p>}

            {scenarioList.map((scn, i)=>{
              return (
                <div key={i}>
                  <p className="scn_heading">{scn.scenario_id} - {scn.name}</p>
                  {scn.flow.map((step, i) => {
                    const showPage = i === 0 || scn.flow[i - 1].page !== step.page;
                    return (
                      <div key={i}>
                        {showPage && <strong>{step.page}</strong>}
                        <div className="preview-step">
                          {/* <span className="step-number">{i + 1}.</span> */}
                          <span>{buildEnglishSentence(step)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );  
            })}
          </div>
        }

        {open=="allCases" && Array.isArray(testcases) && testcases.length > 0 &&
          <div className="allSteps">
            {testcases.map((tcase, ind)=>{
                return (
                  <div key={ind}>
                    {ind==0 && <hr />}
                    <p><span><strong>Tesstcase id: </strong></span>{tcase.testcase_id}</p>
                    <p><span><strong>Tesstcase name: </strong></span>{tcase.name}</p>
                    <p>
                      <span><strong>Testcase tags: </strong></span>
                      {tcase.tags.map((tag, index) => (
                        <span key={index}>
                          {tag}
                          {index < tcase.tags.length - 1 && ", "}
                        </span>
                      ))}
                    </p>

                    {tcase?.scenarios?.map((scenId, i) => {
                      const fetchedScenario=allScenarios.find((sc)=>sc.scenario_id===scenId) || [];
                      return (
                        <div key={i}>
                          <p className="scn_heading">{fetchedScenario.scenario_id} - {fetchedScenario.name}</p>
                          {fetchedScenario.scenario_json.flow.map((step, i) => {
                            const showPage = i === 0 || fetchedScenario.scenario_json.flow[i - 1].page !== step.page;
                            return (
                              <div key={i}>
                                {showPage && <strong>{step.page}</strong>}
                                <div className="preview-step">
                                  {/* <span className="step-number">{i + 1}.</span> */}
                                  <span>{buildEnglishSentence(step)}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ); 
                    })}
                    <hr />
                  </div>
                );
            })}
          </div>
        }

      </div>

    </div>
  );
}


