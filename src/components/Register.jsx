import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

function Register({ onBack, onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password strength
  const getPasswordStrength = () => {
    if (password.length === 0) {
      return "";
    }

    if (password.length < 6) {
      return "Weak";
    }

    if (password.length < 10) {
      return "Medium";
    }

    return "Strong";
  };

  // Register user
  const handleRegister = async (e) => {
    e.preventDefault();

    // Check empty fields
    if (
      name.trim() === "" ||
      email.trim() === "" ||
      password === "" ||
      confirmPassword === ""
    ) {
      alert("Please fill all fields");
      return;
    }

    // Email validation
    if (!email.includes("@") || !email.includes(".")) {
      alert("Please enter a valid email address");
      return;
    }

    // Password validation
    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    // Confirm password
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      // Start loading
      setIsLoading(true);

      // Create account in Firebase
      await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      const user = auth.currentUser;

await setDoc(doc(db, "users", user.uid), {
  name: name.trim(),
  email: email.trim(),
  createdAt: new Date()
});

      // Success message
      alert("Registration successful! 🎉");

      // Go to Login page
      onLogin();

    } catch (error) {
      console.log(error);

      // Firebase errors
      if (error.code === "auth/email-already-in-use") {
        alert("This email is already registered.");
      } 
      else if (error.code === "auth/invalid-email") {
        alert("Invalid email address.");
      } 
      else if (error.code === "auth/weak-password") {
        alert("Password is too weak.");
      } 
      else {
        alert("Registration failed. Please try again.");
      }

    } finally {
      // Stop loading
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Back Button */}
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>

        <h1>Create Account ✨</h1>
        <p>Create your StudentSolve account</p>

        <form onSubmit={handleRegister}>

          {/* Name */}
          <label>Name</label>

          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

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

          <div className="password-box">

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              className="show-password-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>

          </div>

          {/* Password Strength */}
          {password && (
            <p
              className={`password-strength ${getPasswordStrength().toLowerCase()}`}
            >
              Password Strength: {getPasswordStrength()}
            </p>
          )}

          {/* Confirm Password */}
          <label>Confirm Password</label>

          <div className="password-box">

            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button
              type="button"
              className="show-password-btn"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
            >
              {showConfirmPassword ? "🙈" : "👁️"}
            </button>

          </div>

          {/* Password Match */}
          {confirmPassword && (
            <p
              className={
                password === confirmPassword
                  ? "password-match"
                  : "password-not-match"
              }
            >
              {password === confirmPassword
                ? "✅ Passwords match"
                : "❌ Passwords do not match"}
            </p>
          )}

          {/* Register Button */}
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Register"}
          </button>

        </form>

        {/* Login Link */}
        <p className="register-text">
          Already have an account?{" "}
          <span onClick={onLogin}>Login</span>
        </p>

      </div>
    </div>
  );
}

export default Register;