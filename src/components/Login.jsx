import { useState } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";

function Login({ onBack, onRegister, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    // Check empty fields
    if (email.trim() === "" || password === "") {
      alert("Please enter email and password");
      return;
    }

    try {
      // Start loading
      setIsLoading(true);

      // Login with Firebase
      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      // Login successful
      alert("Login successful! 🎉");
      onLoginSuccess();

    } catch (error) {
      console.log(error);

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        alert("Incorrect email or password.");
      } 
      else if (error.code === "auth/invalid-email") {
        alert("Invalid email address.");
      } 
      else {
        alert("Login failed. Please try again.");
      }

    } finally {
      // Stop loading
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (email.trim() === "") {
      alert("Pehle apna email likhein, phir 'Forgot Password' par click karein.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      alert("Password reset link aapke email par bhej diya gaya hai. 📧");
    } catch (error) {
      console.log(error);

      if (error.code === "auth/user-not-found") {
        alert("Is email se koi account nahi mila.");
      } else if (error.code === "auth/invalid-email") {
        alert("Invalid email address.");
      } else {
        alert("Reset email bhejne mein masla hua. Dobara try karein.");
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Back Button */}
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>

        <h1>Welcome Back 👋</h1>
        <p>Login to your StudentSolve account</p>

        <form onSubmit={handleLogin}>

          {/* Email */}
          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Password */}
          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Forgot Password */}
          <p className="forgot-password-text" onClick={handleForgotPassword}>
            Forgot Password?
          </p>

          {/* Login Button */}
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>

        </form>

        {/* Register Link */}
        <p className="register-text">
          Don't have an account?{" "}
          <span onClick={onRegister}>Register</span>
        </p>

      </div>
    </div>
  );
}

export default Login;

