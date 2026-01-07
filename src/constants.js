//used in page builder
export const ElementTypeOptions=[
  {key: "click", label: "Click"}, 
  {key: "input", label: "Enter text"}, 
  {key: "upload", label: "Upload file"},
  {key: "autocomplete", label: "Select from dropdown"}, 
  {key: "toggleState", label: "Set toggle"}, 
  {key: "checkbox", label: "Set checkbox"}, 
  {key: "date", label: "Select date"}, 
  {key: "editor", label: "Fill editor"}, 
  {key: "multiSelectCreate", label: "Select or create values"},
  {key: "clickPerticularJobTitle", label: "Click job by ID"},
  {key: "arrayContains", label: "Verify list contains value"}, 
  {key: "text", label: "Verify exact text"}, 
  {key: "contains", label: "Verify contains text"},
];

//used in page builder
export const ElementsTypeToFieldsMap={
  toggleState: ["locator", "onLocator", "offLocator", "defaultData"],
  arrayContains: ["locator"],
  click: ["locator"],
  text: ["locator"],
  upload: ["locator"],
  autocomplete: ["locator", "dropdownLocator", "defaultData"],
  input: ["locator", "defaultData"],
  date: ["locator", "comment"],
  checkbox: ["locator"],
  multiSelectCreate: ["locator", "dropdownLocator"],
  editor: ["locator"],
  clickPerticularJobTitle: ["requiredJobTitleLocator", "nextPage", "numberOfPages"],
  contains: ["locator"],
};

//used in NewScenarioBuilder
export const STEP_ACTIONS = [
  { key: "click", label: "Click", needsData: false },
  { key: "input", label: "Enter text", needsData: true },
  { key: "upload", label: "Upload file", needsData: true },
  { key: "autocomplete", label: "Select from dropdown", needsData: true },
  { key: "toggleState", label: "Set toggle", needsData: true },
  { key: "checkbox", label: "Set checkbox", needsData: true },
  { key: "date", label: "Select date", needsData: true },
  { key: "editor", label: "Fill editor", needsData: true },
  { key: "multiSelectCreate", label: "Select or create values", needsData: true },
  { key: "clickPerticularJobTitle", label: "Click job by ID", needsData: true },
];

//used in NewScenarioBuilder
export const ASSERT_ACTIONS = [
  { key: "text", label: "Verify exact text", needsValue: true },
  { key: "contains", label: "Verify contains text", needsValue: true },
  { key: "arrayContains", label: "Verify list contains value", needsValue: true },
];

//used in NewScenarioBuilder
export const OUTPUT_ACTIONS = [{ key: "saveJobID", label: "Save Job ID from URL", needsData: false }];

//used in TestData
export const REQUIRED_DATA = {
  click: false,
  input: true,
  upload: true,
  autocomplete: true,
  toggleState: true,
  checkbox: true,
  date: true,
  editor: true,
  multiSelectCreate: true,
  clickPerticularJobTitle: true,
  text: true,
  contains: true,
  arrayContains: true,
  saveJobID: false,
};

// API_URL 
// export const API_URL = "http://localhost:5000";
export const API_URL = "https://autotestserver-production.up.railway.app";
