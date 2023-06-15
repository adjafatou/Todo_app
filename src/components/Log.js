import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../Firebase";
import { getDoc, doc } from "firebase/firestore";
import { firestore } from "../Firebase";
import "../logg.css";

function Login() {
  const navigate = useNavigate();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const login = async () => {
    try {
      const user = await signInWithEmailAndPassword(
        auth,
        loginEmail,
        loginPassword
      );
      const _doc = doc(firestore, `Users/${loginEmail}`);
      const userdata = await getDoc(_doc);
      const logininfo = userdata.data();
      const userEmail = window.localStorage.setItem("userEmail", loginEmail);

      console.log(logininfo);

      const isAdmin = logininfo.isAdmin;
      if (isAdmin) {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.log(error.message);
      setErrorMessage("Email or password are invalid");
    }
  };

  return (
    <div className="contain">
      <div className="form-container">
        <h3>MEMBER LOGIN</h3>
        <input
          type="email"
          placeholder="Enter your email"
          onChange={(event) => {
            setLoginEmail(event.target.value);
          }}
        />
        <input
          type="password"
          placeholder="Enter your password"
          onChange={(event) => {
            setLoginPassword(event.target.value);
          }}
        />
        <button onClick={login}>login</button>
        {errorMessage && <h6>{errorMessage}</h6>}

        <p>Not a member?</p>
        <a href="/inscription">Create an account</a>
        <br />
      </div>

      <div className="right">
        <div className="right-text">
          <h2>To Do App</h2>
          <h5>organize and manage your day-to-day tasks</h5>
        </div>
        <div className="right-inductor">
          <img src="todo1.png" alt="todo" className="logo" />
        </div>
      </div>
      {/* <div className="images">
        <img src="todo2.png" alt="todo2" className="logo" />
        <img src="imagetodo.png" alt="todo2" className="logo" />
      </div> */}
    </div>
  );
}

export default Login;
