import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../Firebase";
import "../reset.css";

function Resetpass() {
  const [resetEmail, setResetEmail] = useState("");

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      // Password reset email sent successfully
    } catch (error) {
      // Handle error, e.g., display an error message to the user
    }
  };

  return (
    <div className="component">
      <div className="form-container1">
        <h3>Reset Password</h3>

        <form onSubmit={handlePasswordReset}>
          <input
            type="email"
            placeholder="Enter your email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
          />
          <button type="submit">Reset Password</button>
        </form>
      </div>
    </div>
  );
}

export default Resetpass;
