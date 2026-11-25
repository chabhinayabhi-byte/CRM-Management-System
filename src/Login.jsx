
import React, { useState } from "react";
import "./App.css";

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function registerUser(e) {
    e.preventDefault();

    const accounts = JSON.parse(
      localStorage.getItem("crmAccounts") || "[]"
    );

    const exists = accounts.some(
      a => a.email.toLowerCase() === email.toLowerCase()
    );

    if (exists) {
      alert("Email already registered!");
      return;
    }

    accounts.push({
      name,
      email,
      password
    });

    localStorage.setItem(
      "crmAccounts",
      JSON.stringify(accounts)
    );

    alert("Registration successful! Please login.");

    setIsRegister(false);
    setName("");
    setEmail("");
    setPassword("");
  }

  function loginUser(e) {
    e.preventDefault();
    onLogin(email, password);
  }

  return (
    <div className="auth-page">

      <form
        className="auth-card"
        onSubmit={isRegister ? registerUser : loginUser}
      >

        <h1>CRM<span>Pro</span></h1>

        <h2>
          {isRegister ? "Create Account" : "Welcome Back!"}
        </h2>

        <p>
          {isRegister
            ? "Register your CRM account"
            : "Login to your CRM dashboard"}
        </p>

        {isRegister && (
          <>
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </>
        )}

        <label>Email Address</label>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <label>Password</label>

        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          minLength={4}
          required
        />

        <button className="primary full" type="submit">
          {isRegister ? "Create Account" : "Login"}
        </button>

        <p className="auth-switch">
          {isRegister
            ? "Already have an account?"
            : "Don't have an account?"}

          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? " Login" : " Register"}
          </button>
        </p>

      </form>

    </div>
  );
}
