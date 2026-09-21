import { useState, useEffect } from 'react'
import './App.css'
import Login from './components/Login'
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

function App() {
   const [showLogin, setShowLogin] = useState(false);
   const [showRegister, setShowRegister] = useState(false);
   const [showDashboard, setShowDashboard] = useState(false);
   const [checkingAuth, setCheckingAuth] = useState(true);
   const [searchQuery, setSearchQuery] = useState("");

   // ==============================
   // SESSION PERSISTENCE
   // Keeps the user logged in after a page refresh
   // ==============================
   useEffect(() => {
     const unsubscribe = onAuthStateChanged(auth, (user) => {
       if (user) {
         setShowDashboard(true);
       } else {
         setShowDashboard(false);
       }
       setCheckingAuth(false);
     });

     return () => unsubscribe();
   }, []);

   if (checkingAuth) {
     return (
       <div className="auth-loading-screen">
         <div className="auth-loading-spinner"></div>
         <p>Loading StudentSolve...</p>
       </div>
     );
   }

  if (showRegister) {
  return (
   <Register
  onBack={() => setShowRegister(false)}
  onLogin={() => {
    setShowRegister(false)
    setShowLogin(true)
  }}
/>
  );
}
if (showDashboard) {
  return (
    <Dashboard
      onLogout={() => {
        setShowDashboard(false);
      }}
    />
  );
}
if (showLogin) {
  return (
   <Login
  onBack={() => setShowLogin(false)}
  onRegister={() => setShowRegister(true)}
  onLoginSuccess={() => {
    setShowLogin(false);
    setShowDashboard(true);
  }}
/>
  );
}
  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo" aria-label="StudentSolve">
          <span className="logo-mark" aria-hidden="true">🎓</span>
          <span className="logo-text">StudentSolve</span>
        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#about">About</a>
       <button
  className="login-btn"
  onClick={() => setShowLogin(true)}
>
  Login
</button>
        </div>
      </nav>

      <main>
        <section className="hero-section" id="home">
          <div className="hero-content">
            <p className="small-title">YOUR STUDENT SUPPORT PLATFORM</p>

            <h1>
              <span className="hero-title-line hero-title-first">
                Learn Smarter.
              </span>
              <br />
              <span className="hero-title-line hero-title-accent">
                Solve Better.
              </span>
            </h1>

            <p className="hero-text">
              StudentSolve helps students find academic support,
              connect with other students, and learn together.
            </p>

            <div className="hero-buttons">
              <button
  className="primary-btn"
  onClick={() => setShowRegister(true)}
>
  Get Started
</button>
              <button
  className="secondary-btn"
  onClick={() => {
    document.getElementById('features').scrollIntoView({
      behavior: 'smooth',
    })
  }}
>
  Explore
</button> 
            </div>
          </div>

          <div className="hero-card">
            <div className="card-icon">🎓</div>
            <h2>Need Help?</h2>
            <p>
              Find students who can help you understand
              difficult topics and improve your skills.
            </p>

            <div className="welcome-study-photo">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=760&q=88"
                alt="Female and male students studying together"
              />
              <span>Study together. Grow together.</span>
            </div>

            <div className="student-photo-row" aria-label="Students ready to help">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=85"
                alt="Student mentor"
                loading="eager"
              />
              <img
                src="https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=160&q=85"
                alt="Student learning"
                loading="eager"
              />
              <img
                src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=160&q=85"
                alt="Student tutor"
                loading="eager"
              />
              <span>+ students ready to help</span>
            </div>

            <div className="search-box">
              <input
                type="text"
                placeholder="What do you want to learn?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                onClick={() => {
                  if (searchQuery.trim() === "") {
                    alert("Pehle kuch likhein jo aap seekhna chahte hain.");
                    return;
                  }
                  setShowLogin(true);
                }}
              >
                Search
              </button>
            </div>
          </div>
        </section>

        <section className="welcome-action-gallery" aria-labelledby="welcome-action-title">
          <div className="welcome-action-heading">
            <span>YOUR LEARNING COMMUNITY</span>
            <h2 id="welcome-action-title">Find your people. Learn your way.</h2>
            <p>Explore, share, connect, and grow with students who are moving forward together.</p>
          </div>

          <div className="welcome-action-grid">
            <div className="welcome-action-card">
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=520&q=85"
                alt="Students finding academic help together"
              />
              <strong>Find Help</strong>
            </div>
            <div className="welcome-action-card">
              <img
                src="https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=520&q=85"
                alt="Students sharing skills and ideas"
              />
              <strong>Share Skills</strong>
            </div>
            <div className="welcome-action-card">
              <img
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=520&q=85"
                alt="Students connecting and working together"
              />
              <strong>Connect</strong>
            </div>
            <div className="welcome-action-card">
              <img
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=520&q=85"
                alt="Students collaborating in a study group"
              />
              <strong>Grow Together</strong>
            </div>
          </div>
        </section>

        <section className="features" id="features">
          <h2>What StudentSolve Offers</h2>
          <p className="section-text">
            A simple platform designed to make student-to-student
            learning easier.
          </p>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Find Help</h3>
              <p>
                Search for students who can help you with a
                specific subject or skill.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3>Share Skills</h3>
              <p>
                Share your own knowledge and help other students
                learn something new.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>Connect</h3>
              <p>
                Connect with students and build a helpful
                learning community.
              </p>
            </div>
          </div>
        </section>

        <section className="about-section" id="about">
          <div className="about-content">
            <h2>About StudentSolve</h2>
            <p className="section-text">
              StudentSolve is a peer-to-peer learning platform built for
              students. Our goal is simple: make it easy to find someone who
              can help you with a subject, and just as easy to share what
              you're good at with someone else.
            </p>
          </div>

          <div className="about-stats">
            <div className="about-stat">
              <h3>100%</h3>
              <p>Student Driven</p>
            </div>
            <div className="about-stat">
              <h3>Free</h3>
              <p>To Join & Use</p>
            </div>
            <div className="about-stat">
              <h3>24/7</h3>
              <p>Learn Anytime</p>
            </div>
          </div>
        </section>

        <footer className="site-footer">
          <div className="footer-main">
            <div className="footer-brand">
              <strong><span>🎓</span> StudentSolve</strong>
              <p>Learn smarter, solve better, and grow together with your student community.</p>
            </div>
            <div className="footer-column">
              <h3>Platform</h3>
              <a href="#features">Find Help</a>
              <a href="#features">Share Skills</a>
              <a href="#features">Connect</a>
            </div>
            <div className="footer-column">
              <h3>Explore</h3>
              <a href="#home">Home</a>
              <a href="#about">About Us</a>
              <a href="#features">Features</a>
            </div>
            <div className="footer-column footer-contact">
              <h3>Stay Connected</h3>
              <span>Built for curious students.</span>
              <span>support@studentsolve.com</span>
              <div className="footer-socials">
                <a href="#home" aria-label="StudentSolve community">💬</a>
                <a href="#features" aria-label="StudentSolve learning">📚</a>
                <a href="#about" aria-label="StudentSolve updates">✨</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <small>© 2026 StudentSolve. All rights reserved.</small>
            <span>Made for students, by students.</span>
          </div>
        </footer>
      </main>
    </div>
  )
}
export default App;
