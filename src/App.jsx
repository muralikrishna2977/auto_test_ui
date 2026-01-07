import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Main from "./components/Main.jsx";
import SignIn from "./login/SignIn.jsx";
import SignUp from "./login/SignUp.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Main />} />
      </Routes>
    </Router>
  );
}

export default App;


