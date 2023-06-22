import React from "react";
import { Link } from "react-router-dom";

function Page() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <button
        style={{
          backgroundColor: " #008080",
          color: "#181820",
          border: "none",
          padding: "10px 20px",
          margin: "10px",
          borderRadius: "9px",
          fontSize: "16px",
          cursor: "pointer",
          textDecoration: "none",
        }}
      >
        <Link
          to="/autorise"
          style={{ textDecoration: "none", color: "#181820" }}
        >
          Manage Autorisations
        </Link>
      </button>
      <button
        style={{
          backgroundColor: "#8fbc8f",
          color: "#181820",
          border: "none",
          padding: "10px 20px",
          margin: "10px",
          borderRadius: "9px",
          fontSize: "16px",
          cursor: "pointer",
          textDecoration: "none",
        }}
        className="button1"
      >
        <Link
          to="/admin"
          style={{
            textDecoration: "none",
            color: "#181820",
          }}
        >
          Manage Tasks
        </Link>
      </button>
    </div>
  );
}

export default Page;
