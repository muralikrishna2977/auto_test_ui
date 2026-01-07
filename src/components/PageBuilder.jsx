import { useState, useEffect, useRef } from "react";
import "./PageBuilder.css";
import {ElementTypeOptions, ElementsTypeToFieldsMap} from "../constants.js";

import axiosInstance from "../axios.js";

import Dropdown from "./custom/Dropdown";
import THREE_DOTS from "../assets/three-dots.svg";
import EDIT from "../assets/edit-button.svg";

export default function PageBuilder({
  pages,
  setPages,
  userid
}) {
  const [pageName, setPageName] = useState("");
  const [currentElements, setCurrentElements] = useState([]);



  
  const [preview, setPreview] = useState("json");
  const [editId, setEditId]=useState("");
  // resize panels
  const containerRef = useRef(null);
  const isDragging = useRef(false);
  const [leftWidth, setLeftWidth] = useState(null);

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDragging.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();

      const newLeftWidth = e.clientX - rect.left;
      const minWidth = 150;

      if (
        newLeftWidth < minWidth ||
        rect.width - newLeftWidth < minWidth
      ) {
        return;
      }

      setLeftWidth(newLeftWidth);
    };

    const onMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = "default";
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const handleSaveEdit=async ()=>{
    if (!editId) {
      alert("Invalid edit state");
      return;
    }
    if (!pageName.trim()){
      alert("Page name is required!");
      return;
    }
    if(currentElements.length===0){
      alert("Add atleast one element");
      return;
    }
    for (const el of currentElements) {
      if (!el.name || !el.type) {
        alert("Element name and type are required!");
        return;
      }
    }

    const newPage = {
      page: pageName,
      elements: currentElements,
    };
    try {
      await axiosInstance.post("/saveeditedpage", {
        page_name: pageName,
        page_json: newPage,
        id: editId,
        user_id: userid,
      });

      setPages((prev)=>{
        const editedPages=prev.map((page)=>page.id===editId? {id: editId, ...newPage}: page);
        return editedPages;
      });

      alert("Page edited successfully!");
      setPageName("");
      setCurrentElements([]);
      setEditId("");
      setPreview("all");
    } catch (err) {
      if (err.response?.status === 409) {
        alert(err.response.data.message || "Page name already exists");
      } else {
        alert("Server error. Please try again.");
      }
    }

  }

  const addPage = async () => {
    if (!pageName.trim()){
      alert("Page name is required!");
      return;
    }
    if(currentElements.length===0){
      alert("Add atleast one element");
      return;
    }
    for (const el of currentElements) {
      if (!el.name || !el.type) {
        alert("Element name and type are required!");
        return;
      }
    }

    const newPage = {
      page: pageName,
      elements: currentElements,
    };
    try {

      const res = await axiosInstance.post("/savepage", {
        page_name: pageName,
        page_json: newPage,
        user_id: userid
      });

      const insertedId = res.data.id;
      setPages(prev => [{ id: insertedId, ...newPage }, ...prev]);

      alert("Page saved successfully!");

      setPageName("");
      setCurrentElements([]);
    } catch (err) {
      if (err.response?.status === 409) {
        alert(err.response.data.message || "Page name already exists");
      } else {
        alert("Server error. Please try again.");
      }
    }
  };

  const addElement = () => {
    setCurrentElements((prev) => [{ name: "", type: "" }, ...prev]);
  };

  const updateElement = (i, key, value, typeFields) => {
    setCurrentElements((prev) => {
      const updated = [...prev];
      let element = { ...updated[i] };

      element[key] = value;

      if (key === "type") {
        const base = { name: element.name, type: value };

        (typeFields ?? []).forEach((field) => {
          base[field] = "";
        });

        updated[i] = base;
      } else {
        updated[i] = element;
      }

      return updated;
    });
  };

  const handleEdit = (pageId) => {
    const editPage = pages.find(page => page.id === pageId);
    if (editPage) {
      setCurrentElements(editPage.elements.map(el => ({ ...el })));
      setPageName(editPage.page);
      setEditId(pageId);
      setPreview("json");
    }
  };

  const handleCalcel=()=>{
    setCurrentElements([]);
    setPageName("");
    setEditId("");
    setPreview("all");
  }

  const handleRemoveElement=(index)=>{
    setCurrentElements((prev)=>prev.filter((element, i)=>i!==index));
  }

  return (
    <div 
      ref={containerRef}
      className="page-builder-container"
      style={{
        gridTemplateColumns: leftWidth
          ? `${leftWidth}px 6px 1.5fr`
          : "1fr 6px 1.5fr", 
      }}
    >
      <div className="page-form-section">
        <div className="buttons-container">
          {!editId && <h2>Create Page</h2>}
          {editId && <h2>Edit Page</h2>}
          <button className="add-btn" onClick={addElement}>
            + Add Element
          </button>
          {pageName && currentElements.length>0 && !editId && <button className="save-btn" onClick={addPage}>Save Page</button>}
          {editId && <button className="add-btn" onClick={handleCalcel}>Cancel</button>}
          {editId && <button className="save-btn" onClick={handleSaveEdit}>Save Edit</button>}
        </div>

        <input
          type="text"
          className="page-input"
          placeholder="Page Name"
          value={pageName}
          onChange={(e) => setPageName(e.target.value)}
        />

        <div className="page-elements-container">
          {currentElements.map((el, i) => (
            <div key={i} className="page-element-card">
              <button className="add-btn remove-btn" onClick={()=>handleRemoveElement(i)}>Remove element</button>
              <input
                type="text"
                placeholder="Element name"
                value={el.name ?? ""}
                onChange={(e) => updateElement(i, "name", e.target.value)}
              />

              <select
                value={el.type ?? ""}
                onChange={(e) =>
                  updateElement(
                    i,
                    "type",
                    e.target.value,
                    ElementsTypeToFieldsMap[e.target.value]
                  )
                }
              >
                <option value="" disabled hidden>
                  -- Select element type --
                </option>

                {ElementTypeOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>

              {ElementsTypeToFieldsMap[el.type]?.map((field) => (
                <input
                  key={field}
                  type="text"
                  placeholder={field}
                  value={el[field] ?? ""}
                  onChange={(e) => updateElement(i, field, e.target.value)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div
        className="resizer"
        onMouseDown={() => {
          isDragging.current = true;
          document.body.style.cursor = "col-resize";
        }}
      />

      <div className="page-preview-section">
        <div className="buttons-container">
          {!editId && <button
            className={preview === "json" ? "active-p" : "inactive-p"}
            onClick={() => setPreview("json")}
          >
            Live JSON Preview
          </button>}

          {!editId && <button
            className={preview === "all" ? "active-p" : "inactive-p"}
            onClick={() => setPreview("all")}
          >
            All Pages
          </button>}
          <h3>{preview === "json" ? "Live JSON Preview" : "All Pages"}</h3>
        </div>

        {preview === "json" && (
          <pre className="page-jsonView">
            {JSON.stringify(
              { page: pageName, elements: currentElements },
              null,
              2
            )}
          </pre>
        )}

        {preview === "all" && (
          <div className="page-jsonView">
            {pages.map((p, index) => (
              <div key={index} className="eachPageView">
                <div className="buttons-container">
                  <h3>{p.page}</h3>
                  <Dropdown
                    trigger={
                      <img src={THREE_DOTS} alt="Actions" width="20" height="20" />
                    }
                    menuStyle={{ top: "20px", left: "0px" }}
                  >
                    <button className="menu-item" onClick={()=>handleEdit(p.id)}>
                      <img src={EDIT} width="16" />
                      <span>Edit</span>
                    </button>
                  </Dropdown>
                </div>



                
                <pre>
                  {JSON.stringify(
                    { page: p.page, elements: p.elements },
                    null,
                    2
                  )}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
