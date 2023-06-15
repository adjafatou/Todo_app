import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../Firebase";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import "../inscriptionn.css";

function Register() {
  const navigate = useNavigate();
  const [registerEmail, setRegisterEmail] = useState("");
  const [confirmEmailError, setConfirmEmailError] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerFirstname, setRegisterFirstName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const firestore = getFirestore();

  const uuidv4 = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0,
          v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  };

  const handleRegister = async () => {
    if (
      !registerEmail ||
      !registerPassword ||
      !confirmPassword ||
      !registerFirstname ||
      !registerName
    ) {
      setErrorMessage("Please fill in all fields");
      return;
    }

    if (registerPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    try {
      const signInMethods = await fetchSignInMethodsForEmail(
        auth,
        registerEmail
      );

      if (signInMethods && signInMethods.length > 0) {
        setConfirmEmailError(
          "This email already exists. Please enter another email."
        );
        return;
      }

      const id = uuidv4();
      const userDocRef = doc(firestore, `Users/${registerEmail}`);
      const data = {
        id: id,
        email: registerEmail,
        name: registerName,
        firstname: registerFirstname,
        isAdmin: false,
      };

      await setDoc(userDocRef, data);

      const user = await createUserWithEmailAndPassword(
        auth,
        registerEmail,
        registerPassword
      );
      console.log(user);
      navigate("../Log");
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="contenu">
      <div className="form-contenu">
        <h3>Registration Form</h3>
        <input
          type="text"
          placeholder="Enter your name"
          onChange={(event) => {
            setRegisterName(event.target.value);
            setErrorMessage("");
          }}
        />

        <input
          type="text"
          placeholder="Enter your firstname"
          onChange={(event) => {
            setRegisterFirstName(event.target.value);
            setErrorMessage("");
          }}
        />
        <input
          type="email"
          placeholder="Enter the email"
          onChange={(event) => {
            setRegisterEmail(event.target.value);
            setErrorMessage("");
            setConfirmEmailError("");
          }}
        />

        <input
          type="password"
          placeholder="Enter the password"
          onChange={(event) => {
            setRegisterPassword(event.target.value);
            setErrorMessage("");
          }}
        />

        <input
          type="password"
          placeholder="Confirm the password"
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            setErrorMessage("");
          }}
        />

        <button onClick={handleRegister}>Create an account</button>

        {confirmEmailError && <h6>{confirmEmailError}</h6>}
        {errorMessage && <p>{errorMessage}</p>}
        <p>already a member?</p>
        <a href="/log">login</a>
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
    </div>
  );
}

export default Register;
