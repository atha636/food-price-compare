import React from "react";

export default function Verified() {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      flexDirection: "column"
    }}>
      <h1>✅ Email Verified Successfully</h1>
      <p>You can now login to your account.</p>
    </div>
  );
}