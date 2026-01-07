import { useState, useEffect } from "react";
import "./GroupTestcases.css";
import axiosInstance from "../axios.js";

export default function GroupTestcases({ testcases, groups, loadGroups }) {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedTcIds, setSelectedTcIds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGroups();
    console.log("testcases ", testcases);
  }, []);

  // Create new group
  async function createGroup() {
    if (!groupName.trim()) {
      alert("Group name is required");
      return;
    }

    try {
      await axiosInstance.post("/savegroup", {
        group_name: groupName,
        group_description: description,
      });

      await loadGroups();
      setGroupName("");
      setDescription(""); 
      alert("Group created");
    } catch (err) {
      if (err.response?.status === 409) {
        alert(err.response.data.message || "group name already exists");
      } else {
        alert("Server error. Please try again.");
      }
    }
  }

  // Load full details (items) for a group
  async function loadGroupItems(groupId) {
    try {
      const res = await axiosInstance.get(`/groups/${groupId}`);
      setSelectedGroup(res.data);
                    console.log("select items ", res.data);

    } catch (err) {
      console.error("Error loading group items:", err);
    }
  }

  // Add multiple selected testcases to a group
  async function addSelectedToGroup() {
    if (!selectedGroup) return alert("Select a group first");
    if (selectedTcIds.length === 0)
      return alert("Select at least one testcase");

    setLoading(true);

    try {
      await axiosInstance.post("/groups/addMultiple", {
        group_id: selectedGroup.id,
        testcase_ids: selectedTcIds,
      });

      await loadGroupItems(selectedGroup.id);
      setSelectedTcIds([]);
      alert("Testcases added");
    } catch (err) {
      console.error("Error adding testcases:", err);
      alert("Failed to add testcases");
    } finally {
      setLoading(false);
    }
  }

  // Remove testcase from a group item row
  async function removeTestcase(itemId) {
    if (!selectedGroup) return;

    try {
      await axiosInstance.delete(`/groups/item/${itemId}`);
      await loadGroupItems(selectedGroup.id);
    } catch (err) {
      console.error("Error removing testcase:", err);
      alert("Failed to remove testcase from group");
    }
  }

  // Toggle testcase checkbox in search results
  function toggleSelected(tcId) {
    setSelectedTcIds((prev) =>
      prev.includes(tcId) ? prev.filter((id) => id !== tcId) : [...prev, tcId]
    );
  }

  // Global search on all testcases by id or name
  const filteredTestcases = (testcases || []).filter((tc) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return tc.testcase_id.toLowerCase().includes(q) || tc.name.toLowerCase().includes(q);
  });

  return (
    <div className="group-container">
      <div className="group-left">
        <h2>Testcase Groups</h2>

        <div className="group-create-box">
          <input
            type="text"
            placeholder="New group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />

          <textarea
            placeholder="Group description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <button className="create-group-btn" onClick={createGroup}>
            Create Group
          </button>
        </div>

        <h3>Existing Groups</h3>
        <div className="group-list">
          {groups.map((g) => (
            <div
              key={g.id}
              className={
                selectedGroup?.id === g.id ? "active each-group" : "each-group"
              }
              onClick={() => loadGroupItems(g.id)}
            >
              {g.group_name}
            </div>
          ))}
          {!groups.length && <div className="empty">No groups yet</div>}
        </div>
      </div>

      <div className="group-right">
        {selectedGroup ? (
          <>
            <h3 className="heading">Discription of {selectedGroup.group_name}</h3>
            <p>{selectedGroup.comment}</p>
            <h3 className="heading">Testcases in {selectedGroup.group_name}</h3>
            <div className="testcases-list">
              {selectedGroup.items.length === 0 && <p>No testcases in this group</p>}
              {selectedGroup.items.map((it, i) => (
                <div className="each-testcase" key={i}>
                  <p>{it.testcase_id}--{it.testcase_name}</p>
                  <button
                    className="remove-btn"
                    onClick={() => removeTestcase(it.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p>Select a group</p>
        )}
      </div>

      <div className="pannel3">
            <h3>Search Testcases</h3>
            <input
              type="text"
              placeholder="Search by id or name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {selectedGroup && (
              <button
                className="remove-btn"
                disabled={!selectedTcIds.length || loading}
                onClick={addSelectedToGroup}
              >
                {loading ? "Adding..." : "Add Selected"}
              </button>
            )}

            <ul className="search-results">
              {filteredTestcases.map((tc) => (
                <li className="each-search-result" key={tc.testcase_id}>
                  <span>
                    {tc.testcase_id}--{tc.name}
                  </span>

                  <input
                    className="checkbox-input"
                    type="checkbox"
                    checked={selectedTcIds.includes(tc.testcase_id)}
                    onChange={() => toggleSelected(tc.testcase_id)}
                  />
                </li>
              ))}
            </ul>
      </div>

    </div>
  );
}


