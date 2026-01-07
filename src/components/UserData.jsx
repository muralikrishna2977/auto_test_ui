import { useEffect, useState } from "react";
import "./UserData.css";
import axiosInstance from "../axios";
import "./UserData.css";

export default function NewScenarioBuilder({ name, email, userid }) {
  const [siteData, setSiteData] = useState({
    url: "",
    username: "",
    password: "",
  });
  const [viewPassword, setViewPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSiteData((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const para = {
        site_url: siteData.url,
        site_email_id: siteData.username,
        site_password: siteData.password,
        user_id: userid,
      };
      await axiosInstance.post("/updatemaindata", para);
    } catch (err) {
      console.log("error ", err);
    }
  };

  const getUserData = async () => {
    try {
      const res = await axiosInstance.get("/getmaindata");
      if (res.data) {
        const { site_url, site_email_id, site_password_hash } = res.data;
        setSiteData({
          url: site_url,
          username: site_email_id,
          password: site_password_hash,
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  return (
    <div className="mainData">
      <p>
        <strong>Name: </strong>
        {name}
      </p>
      <p>
        <strong>Email: </strong>
        {email}
      </p>

      <form onSubmit={handleSubmit} className="dataform">
        <div className="labelInput">
          <p>
            <strong>Site URL</strong>
          </p>
          <input
            type="text"
            name="url"
            value={siteData.url}
            onChange={handleChange}
            placeholder="Site URL"
            required
          />
        </div>

        <div className="labelInput">
          <p>
            <strong>Email or Username</strong>
          </p>
          <input
            type="text"
            name="username"
            value={siteData.username}
            onChange={handleChange}
            placeholder="Email or Username"
            required
          />
        </div>

        <div className="labelInput">
          <p>
            <strong>Password </strong>
          </p>
          <input
            type={viewPassword ? "text" : "password"}
            name="password"
            value={siteData.password}
            onChange={handleChange}
            placeholder="Password"
            required
          />
        </div>

        <div className="showpassword">
          <p>
            <strong>Show password </strong>
          </p>
          <input
            className="checkbox2"
            type="checkbox"
            checked={viewPassword}
            onChange={(e) => setViewPassword(e.target.checked)}
          />
        </div>

        <button className="save-btn" type="submit">
          Submit
        </button>
      </form>
    </div>
  );
}
