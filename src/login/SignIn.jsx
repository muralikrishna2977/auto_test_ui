import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../constants.js";
import X0PA_LOGO from "../assets/X0PA_login.jpg";
import "./SignIn.css";

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSigningIn(true); 

    try {
      const response = await axios.post(`${API_URL}/signin`, { email, password });
      
      if (response.data.message === "Login successful") {
        localStorage.setItem("token", response.data.token);
        const userData = {
          userid: response.data.userid,
          name: response.data.name,
          email: response.data.email,
        };
        navigate("/dashboard", { state: { user: userData } });
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "An error occurred");
    } finally{
      setIsSigningIn(false);
    }
  }

  return (
    <div className="signin">
      <div className="left_pannel">
        <h2>Sign In</h2>
        <form className="signinform" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            name="emailid"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            disabled={isSigningIn}
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            disabled={isSigningIn}
          />
          <button className="signInSubmit" type="submit">
            {isSigningIn ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <div className="signnuppage">
          <p>Don't have an account?</p>
          <button className="signUpInSignIn" onClick={() => navigate("/signup")}>Sign Up</button>
        </div>
        <div className="signinmessage">
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      </div>

      <div className="right_pannel">
        <img src={X0PA_LOGO} alt="Actions" width="300px" height="200px" />
        <h2>Test Automation</h2>
      </div>

    </div>
  );
}

export default SignIn;
