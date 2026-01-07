import { useState, useEffect } from "react";
import PageBuilder from "./PageBuilder.jsx";
import GroupTestcases from "./GroupTestcases.jsx";
import TestRuns from "./TestRuns.jsx";
import NewTestcaseBuilder from "./NewTestcaseBuilder.jsx";
import NewScenarioBuilder from "./NewScenarioBuilder.jsx";
import TestData from "./TestData.jsx";
import UserData from "./UserData.jsx";
import "./Main.css";
import X0PA_LOGO from "../assets/x0pa_logo.png";
import { useLocation, useNavigate } from "react-router-dom";
import Dropdown2 from "./custom/Dropdown2.jsx";
import PROFILE_ICON from "../assets/profile2.png";
import axiosInstance from "../axios.js";

export default function Main() {
  const location = useLocation();
  const navigate = useNavigate();

  const userData = location.state?.user;
  const name = userData.name;
  const email = userData.email;
  const userid = userData.userid;


  const [activePage, setActivePage] = useState("testruns");
  const [pages, setPages] = useState([]);  
  const [groups, setGroups] = useState([]);
  const [allScenarios, setAllScenarios] = useState([]);
  const [newTestcases, setNewTestcases]=useState([]);



  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };


  
  
  async function loadPages() {
    try {
      const response=await axiosInstance.get("/getpages");
      const pages_ =response.data.map((p)=>{
        return {
          id: p.id,
          ...p.page_json,
        }
      });
      console.log("all Pages", pages_);
      setPages(pages_);
    } catch (err) {
      console.log(err);
    }
  }

  async function loadGroups() {
    try {
      const res = await axiosInstance.get("/getgroups");
      setGroups(res.data || []);
    } catch (err) {
      console.error("Error loading groups:", err);
    }
  }

  async function loadNewScenarios() {
    try {
      const response = await axiosInstance.get("/getscenariosnew");
      console.log("all scna ",response.data);
      setAllScenarios(response.data);
    } catch (err) {
      console.log(err);
    }
  }

  async function loadNewTestcases() {
    try {
      const response = await axiosInstance.get("/getnewtestcases");
      const testcases_=response.data.map((t)=>t.testcase_json);
      setNewTestcases(testcases_);
    } catch (err) {
      console.log(err);
    }
  }
  
  useEffect(() => {
    loadPages();
    loadNewScenarios();
    loadNewTestcases();
    loadGroups();
  }, []);

  return (
    <div className="mainContainer">
      <nav className="navbar">
        <div className="navbar_noProfile">

          <img className="x0pa_logo" src={X0PA_LOGO} alt="X0PA Logo" width="60px" height="35px" />

          <button
            className={activePage === "pages" ? "active" : ""}
            onClick={() => setActivePage("pages")}
          >
            Page Builder
          </button>

          <button
            className={activePage === "newScenarioBuilder" ? "active" : ""}
            onClick={() => setActivePage("newScenarioBuilder")}
          >
            Scenario Builder
          </button>

          <button
            className={activePage === "newTestcaseBuilder" ? "active" : ""}
            onClick={() => setActivePage("newTestcaseBuilder")}
          >
            Testcase Builder
          </button>

          <button
            className={activePage === "grouptestcases" ? "active" : ""}
            onClick={() => setActivePage("grouptestcases")}
          >
            Group TestCases
          </button>

          <button
            className={activePage === "testdata" ? "active" : ""}
            onClick={() => setActivePage("testdata")}
          >
            Test Data
          </button>


          <button
            className={activePage === "testruns" ? "active" : ""}
            onClick={() => setActivePage("testruns")}
          >
            Test Runs
          </button>

          <button
            className={activePage === "userData" ? "active" : ""}
            onClick={() => setActivePage("userData")}
          >
            User data
          </button>
        </div>

        <Dropdown2
          trigger={
            <img src={PROFILE_ICON} alt="Actions" width="40" height="40" />
          }
          menuStyle={{ top: "45px", right: "10px" }}
        >
          <p><strong>Name: </strong>{name}</p>
          <p><strong>Email: </strong>{email}</p>

          <button
              className="menu-item"
              onClick={handleLogout}
          >
            <span><strong>Logout</strong></span>
          </button>
        </Dropdown2>


      </nav>

      <div className="content">

        {activePage === "pages" && (
          <PageBuilder
            pages={pages}
            setPages={setPages}
            userid={userid}
          />
        )}

        {activePage === "grouptestcases" && (
          <GroupTestcases
            testcases={newTestcases}
            groups={groups}
            loadGroups={loadGroups}
          />
        )}

        {activePage === "testruns" && (
          <TestRuns
            groups={groups}
          />
        )}

        {activePage==="newScenarioBuilder" && (
          <NewScenarioBuilder
            allScenarios={allScenarios}
            setAllScenarios={setAllScenarios}
            pages={pages}
            userid={userid}
          />
        )}

        {activePage==="newTestcaseBuilder" && (
            <NewTestcaseBuilder 
              allScenarios={allScenarios}
              testcases={newTestcases}
              setTestcases={setNewTestcases}
            />
        )}

        {activePage==="testdata" && (
          <TestData 
            testcases={newTestcases}
            allScenarios={allScenarios}
          />
        )}

        {activePage==="userData" && (
          <UserData 
            name={name}
            email={email}
            userid={userid}
          />
        )}

      </div>
    </div>
  );
}






