import { useEffect, useState } from "react";

import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../firebase";

import Profile from "./Profile";
import Learn from "./Learn";

function Dashboard({ onLogout }) {

  // ==============================
  // BASIC STATES
  // ==============================

  const [userName, setUserName] = useState("Student");

  const [showProfile, setShowProfile] = useState(false);
  const [showLearn, setShowLearn] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [showConnections, setShowConnections] = useState(false);
  const [showShare, setShowShare] = useState(false);

  // ==============================
  // CONNECTION STATES
  // ==============================

  const [requests, setRequests] = useState([]);
  const [connections, setConnections] = useState([]);

  const [loadingRequests, setLoadingRequests] = useState(false);
  const [loadingConnections, setLoadingConnections] =
    useState(false);

  const [pendingCount, setPendingCount] = useState(0);

  // ==============================
  // SHARE CRUD STATES
  // ==============================

  const [skills, setSkills] = useState([]);

  const [skillName, setSkillName] = useState("");
  const [category, setCategory] = useState("");
  const [skillDescription, setSkillDescription] =
    useState("");

  const [editingSkillId, setEditingSkillId] =
    useState(null);

  const [loadingSkills, setLoadingSkills] =
    useState(false);


  // =====================================================
  // GET CURRENT USER DATA
  // =====================================================

  useEffect(() => {

    const getUserData = async () => {

      try {

        const user = auth.currentUser;

        if (user) {

          const userDoc = await getDoc(
            doc(db, "users", user.uid)
          );

          if (userDoc.exists()) {

            setUserName(
              userDoc.data().name || "Student"
            );

          }

        }

      } catch (error) {

        console.log(
          "Error getting user data:",
          error
        );

      }

    };

    getUserData();

  }, []);


  // =====================================================
  // REAL-TIME SHARE SKILLS
  // =====================================================

  useEffect(() => {

    const user = auth.currentUser;

    if (!user) {
      return;
    }

    setLoadingSkills(true);

    const q = query(
      collection(db, "skills"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,

      (querySnapshot) => {

        const skillList =
          querySnapshot.docs.map(
            (skillDoc) => ({
              id: skillDoc.id,
              ...skillDoc.data(),
            })
          );

        setSkills(skillList);

        setLoadingSkills(false);

      },

      (error) => {

        console.log(
          "Error loading skills:",
          error
        );

        setLoadingSkills(false);

      }
    );

    return () => unsubscribe();

  }, []);


  // =====================================================
  // ADD NEW SKILL
  // =====================================================

  const addSkill = async (e) => {

    e.preventDefault();

    if (
      skillName.trim() === "" ||
      category.trim() === "" ||
      skillDescription.trim() === ""
    ) {

      alert("Please fill all skill fields.");

      return;

    }

    const user = auth.currentUser;

    if (!user) {

      alert("Please login first.");

      return;

    }

    try {

      await addDoc(
        collection(db, "skills"),
        {
          userId: user.uid,

          userName: userName,

          skillName: skillName.trim(),

          category: category.trim(),

          description:
            skillDescription.trim(),

          createdAt:
            serverTimestamp(),
        }
      );

      alert(
        "Skill shared successfully! 🎉"
      );

      // Clear form

      setSkillName("");
      setCategory("");
      setSkillDescription("");

    } catch (error) {

      console.log(
        "Error adding skill:",
        error
      );

      alert(
        "Failed to share skill."
      );

    }

  };


  // =====================================================
  // EDIT SKILL
  // =====================================================

  const editSkill = (skill) => {

    setEditingSkillId(skill.id);

    setSkillName(
      skill.skillName || ""
    );

    setCategory(
      skill.category || ""
    );

    setSkillDescription(
      skill.description || ""
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  };


  // =====================================================
  // UPDATE SKILL
  // =====================================================

  const updateSkill = async (e) => {

    e.preventDefault();

    if (!editingSkillId) {

      return;

    }

    if (
      skillName.trim() === "" ||
      category.trim() === "" ||
      skillDescription.trim() === ""
    ) {

      alert(
        "Please fill all skill fields."
      );

      return;

    }

    try {

      await updateDoc(
        doc(
          db,
          "skills",
          editingSkillId
        ),
        {
          skillName:
            skillName.trim(),

          category:
            category.trim(),

          description:
            skillDescription.trim(),
        }
      );

      alert(
        "Skill updated successfully! ✨"
      );

      // Clear form

      setSkillName("");
      setCategory("");
      setSkillDescription("");

      setEditingSkillId(null);

    } catch (error) {

      console.log(
        "Error updating skill:",
        error
      );

      alert(
        "Failed to update skill."
      );

    }

  };


  // =====================================================
  // DELETE SKILL
  // =====================================================

  const deleteSkill = async (skillId) => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this skill?"
      );

    if (!confirmDelete) {

      return;

    }

    try {

      await deleteDoc(
        doc(
          db,
          "skills",
          skillId
        )
      );

      alert(
        "Skill deleted successfully! 🗑️"
      );

    } catch (error) {

      console.log(
        "Error deleting skill:",
        error
      );

      alert(
        "Failed to delete skill."
      );

    }

  };


  // =====================================================
  // REAL-TIME CONNECTION REQUESTS
  // =====================================================

  useEffect(() => {

    const user = auth.currentUser;

    if (!user) {
      return;
    }

    setLoadingRequests(true);

    const q = query(
      collection(db, "connectionRequests"),
      where(
        "receiverId",
        "==",
        user.uid
      )
    );

    const unsubscribe = onSnapshot(
      q,

      (querySnapshot) => {

        const requestList =
          querySnapshot.docs.map(
            (requestDoc) => ({
              id: requestDoc.id,
              ...requestDoc.data(),
            })
          );

        setRequests(requestList);

        const pendingRequests =
          requestList.filter(
            (request) =>
              request.status ===
              "pending"
          );

        setPendingCount(
          pendingRequests.length
        );

        setLoadingRequests(false);

      },

      (error) => {

        console.log(
          "Error listening to requests:",
          error
        );

        setLoadingRequests(false);

      }
    );

    return () => unsubscribe();

  }, []);


  // =====================================================
  // GET MY CONNECTIONS
  // =====================================================

  useEffect(() => {

    const user = auth.currentUser;

    if (!user) {
      return;
    }

    setLoadingConnections(true);

    const q = query(
      collection(db, "connectionRequests"),
      where(
        "status",
        "==",
        "accepted"
      )
    );

    const unsubscribe = onSnapshot(
      q,

      (querySnapshot) => {

        const connectionList =
          querySnapshot.docs

            .map(
              (connectionDoc) => ({
                id: connectionDoc.id,
                ...connectionDoc.data(),
              })
            )

            .filter(
              (connection) =>
                connection.senderId ===
                  user.uid ||
                connection.receiverId ===
                  user.uid
            );

        setConnections(
          connectionList
        );

        setLoadingConnections(false);

      },

      (error) => {

        console.log(
          "Error getting connections:",
          error
        );

        setLoadingConnections(false);

      }
    );

    return () => unsubscribe();

  }, []);


  // =====================================================
  // ACCEPT REQUEST
  // =====================================================

  const acceptRequest = async (
    requestId
  ) => {

    try {

      await updateDoc(
        doc(
          db,
          "connectionRequests",
          requestId
        ),
        {
          status: "accepted",
        }
      );

      alert(
        "Connection request accepted! 🎉"
      );

    } catch (error) {

      console.log(
        "Accept request error:",
        error
      );

      alert(
        "Failed to accept request."
      );

    }

  };


  // =====================================================
  // REJECT REQUEST
  // =====================================================

  const rejectRequest = async (
    requestId
  ) => {

    try {

      await updateDoc(
        doc(
          db,
          "connectionRequests",
          requestId
        ),
        {
          status: "rejected",
        }
      );

      alert(
        "Connection request rejected."
      );

    } catch (error) {

      console.log(
        "Reject request error:",
        error
      );

      alert(
        "Failed to reject request."
      );

    }

  };


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = async () => {

    try {

      await auth.signOut();

      alert(
        "You have been logged out."
      );

      onLogout();

    } catch (error) {

      console.log(error);

      alert(
        "Logout failed. Please try again."
      );

    }

  };


  // =====================================================
  // PROFILE PAGE
  // =====================================================

  if (showProfile) {

    return (
      <Profile
        onBack={() =>
          setShowProfile(false)
        }
      />
    );

  }


  // =====================================================
  // LEARN PAGE
  // =====================================================

  if (showLearn) {

    return (
      <Learn
        onBack={() =>
          setShowLearn(false)
        }
      />
    );

  }


  // =====================================================
  // SHARE PAGE
  // =====================================================

  if (showShare) {

    return (

      <div className="dashboard">

        {/* HEADER */}

        <div className="dashboard-header">

          <div>

            <button
              className="profile-btn dashboard-back-btn"
              onClick={() =>
                setShowShare(false)
              }
            >
              ← Back
            </button>

            <h1>
              💡 Share Your Skill
            </h1>

            <p>
              Share your knowledge and
              help other students learn.
            </p>

          </div>

        </div>


        {/* FORM */}

        <div className="share-form-card">

          <h2>

            ✨{" "}

            {editingSkillId
              ? "Edit Your Skill"
              : "Add a New Skill"}

          </h2>


          <form
            onSubmit={
              editingSkillId
                ? updateSkill
                : addSkill
            }
          >

            {/* SKILL NAME */}

            <label>
              Skill Name
            </label>

            <input
              type="text"
              placeholder="e.g. React, Python, Canva"
              value={skillName}
              onChange={(e) =>
                setSkillName(
                  e.target.value
                )
              }
            />


            {/* CATEGORY */}

            <label>
              Category
            </label>

            <input
              type="text"
              placeholder="e.g. Web Development"
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value
                )
              }
            />


            {/* DESCRIPTION */}

            <label>
              Description
            </label>

            <textarea
              placeholder="Describe what you can teach..."
              value={skillDescription}
              onChange={(e) =>
                setSkillDescription(
                  e.target.value
                )
              }
              rows="5"
            />


            {/* SUBMIT */}

            <button
              type="submit"
              className="share-submit-btn"
            >

              {editingSkillId
                ? "✏️ Update Skill"
                : "🚀 Share Skill"}

            </button>


            {/* CANCEL EDIT */}

            {editingSkillId && (

              <button
                type="button"
                onClick={() => {

                  setEditingSkillId(null);

                  setSkillName("");

                  setCategory("");

                  setSkillDescription("");

                }}
                style={{
                  width: "100%",
                  marginTop: "10px",
                  padding: "12px",
                  border:
                    "1px solid #dbe3ef",
                  borderRadius: "12px",
                  background:
                    "#f8fafc",
                  color: "#475569",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >

                ✕ Cancel Edit

              </button>

            )}

          </form>

        </div>


        {/* MY SKILLS */}

        <h2 className="my-skills-title">
          📚 My Shared Skills
        </h2>


        {loadingSkills ? (

          <div className="dashboard-card">

            <h3>
              ⏳ Loading...
            </h3>

            <p>
              Loading your shared skills.
            </p>

          </div>

        ) : skills.length === 0 ? (

          <div className="dashboard-card">

            <h3>
              📭 No Skills Shared Yet
            </h3>

            <p>
              Add your first skill using
              the form above.
            </p>

          </div>

        ) : (

          <div className="dashboard-cards">

            {skills.map((skill) => (

              <div
                className="skill-card"
                key={skill.id}
              >

                <h2>
                  💡 {skill.skillName}
                </h2>


                <span className="skill-category">

                  🏷️{" "}

                  {skill.category}

                </span>


                <p className="skill-description">

                  {skill.description}

                </p>


                {/* BUTTONS */}

                <div className="skill-actions">

                  <button
                    className="skill-edit-btn"
                    onClick={() =>
                      editSkill(skill)
                    }
                  >
                    ✏️ Edit
                  </button>


                  <button
                    className="skill-delete-btn"
                    onClick={() =>
                      deleteSkill(
                        skill.id
                      )
                    }
                  >
                    🗑️ Delete
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    );

  }


  // =====================================================
  // CONNECTION REQUESTS PAGE
  // =====================================================

  if (showRequests) {

    const pendingRequests =
      requests.filter(
        (request) =>
          request.status ===
          "pending"
      );

    return (

      <div className="dashboard">

        <div className="dashboard-header">

          <div>

            <button
              className="profile-btn dashboard-back-btn"
              onClick={() =>
                setShowRequests(false)
              }
            >
              ← Back
            </button>

            <h1>
              Connection Requests 🤝
            </h1>

            <p>
              Manage your student
              connection requests.
            </p>

          </div>

        </div>


        <div className="dashboard-cards">

          {loadingRequests ? (

            <div className="dashboard-card">

              <h2>
                ⏳ Loading...
              </h2>

              <p>
                Loading your connection
                requests.
              </p>

            </div>

          ) : pendingRequests.length ===
            0 ? (

            <div className="dashboard-card">

              <h2>
                📭 No Requests
              </h2>

              <p>
                You don't have any pending
                connection requests.
              </p>

            </div>

          ) : (

            pendingRequests.map(
              (request) => (

                <div
                  className="dashboard-card"
                  key={request.id}
                >

                  <div
                    style={{
                      width: "65px",
                      height: "65px",
                      borderRadius:
                        "50%",
                      background:
                        "linear-gradient(135deg, #2563eb, #38bdf8)",
                      color: "white",
                      display: "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      fontSize: "25px",
                      fontWeight:
                        "bold",
                      marginBottom:
                        "15px",
                    }}
                  >

                    {request.senderName
                      ? request.senderName
                          .charAt(0)
                          .toUpperCase()
                      : "S"}

                  </div>


                  <h2>
                    {request.senderName ||
                      "Student"}
                  </h2>


                  <p>
                    📧{" "}
                    {request.senderEmail ||
                      "No email"}
                  </p>


                  <p>
                    wants to connect
                    with you.
                  </p>


                  <div
                    style={{
                      display:
                        "flex",
                      gap: "10px",
                      marginTop:
                        "20px",
                    }}
                  >

                    <button
                      onClick={() =>
                        acceptRequest(
                          request.id
                        )
                      }
                      style={{
                        flex: 1,
                        border: "none",
                        padding:
                          "12px",
                        borderRadius:
                          "10px",
                        background:
                          "#16a34a",
                        color:
                          "white",
                        fontWeight:
                          "700",
                        cursor:
                          "pointer",
                      }}
                    >
                      ✓ Accept
                    </button>


                    <button
                      onClick={() =>
                        rejectRequest(
                          request.id
                        )
                      }
                      style={{
                        flex: 1,
                        border: "none",
                        padding:
                          "12px",
                        borderRadius:
                          "10px",
                        background:
                          "#dc2626",
                        color:
                          "white",
                        fontWeight:
                          "700",
                        cursor:
                          "pointer",
                      }}
                    >
                      ✕ Reject
                    </button>

                  </div>

                </div>

              )
            )

          )}

        </div>

      </div>

    );

  }


  // =====================================================
  // MY CONNECTIONS PAGE
  // =====================================================

  if (showConnections) {

    const user =
      auth.currentUser;

    return (

      <div className="dashboard">

        <div className="dashboard-header">

          <div>

            <button
              className="profile-btn dashboard-back-btn"
              onClick={() =>
                setShowConnections(
                  false
                )
              }
            >
              ← Back
            </button>

            <h1>
              My Connections 👥
            </h1>

            <p>
              Students you are
              connected with.
            </p>

          </div>

        </div>


        <div className="dashboard-cards">

          {loadingConnections ? (

            <div className="dashboard-card">

              <h2>
                ⏳ Loading...
              </h2>

              <p>
                Loading your connections.
              </p>

            </div>

          ) : connections.length ===
            0 ? (

            <div className="dashboard-card">

              <h2>
                👥 No Connections Yet
              </h2>

              <p>
                Accept a connection request
                to start building your
                network.
              </p>

            </div>

          ) : (

            connections.map(
              (connection) => {

                const isSender =
                  connection.senderId ===
                  user?.uid;

                const connectionName =
                  isSender
                    ? connection.receiverName
                    : connection.senderName;

                const connectionEmail =
                  isSender
                    ? connection.receiverEmail
                    : connection.senderEmail;

                return (

                  <div
                    className="dashboard-card"
                    key={connection.id}
                  >

                    <div
                      style={{
                        width: "70px",
                        height: "70px",
                        borderRadius:
                          "50%",
                        background:
                          "linear-gradient(135deg, #2563eb, #38bdf8)",
                        color: "white",
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        fontSize: "28px",
                        fontWeight:
                          "bold",
                        marginBottom:
                          "15px",
                      }}
                    >

                      {connectionName
                        ? connectionName
                            .charAt(0)
                            .toUpperCase()
                        : "S"}

                    </div>


                    <h2>
                      {connectionName ||
                        "Student"}
                    </h2>


                    <p>
                      📧{" "}
                      {connectionEmail ||
                        "No email"}
                    </p>


                    <p
                      style={{
                        color:
                          "#16a34a",
                        fontWeight:
                          "700",
                        marginTop:
                          "10px",
                      }}
                    >
                      🟢 Connected
                    </p>

                  </div>

                );

              }
            )

          )}

        </div>

      </div>

    );

  }


  // =====================================================
  // MAIN DASHBOARD
  // =====================================================

  return (

    <div className="dashboard">

      {/* HEADER */}

      <div className="dashboard-header">

        <div>

          <h1>
            Welcome, {userName}! 👋
          </h1>

          <p>
            Welcome to your
            StudentSolve dashboard.
          </p>

        </div>


        <div>

          <button
            className="profile-btn"
            onClick={() =>
              setShowProfile(true)
            }
          >
            My Profile 👤
          </button>


          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout 🚪
          </button>

        </div>

      </div>


      {/* STUDY GROUP WELCOME */}

      <section className="dashboard-study-banner">

        <div className="study-banner-copy">
          <span className="study-banner-label">LEARN TOGETHER</span>
          <h2>Every question is better with a study partner.</h2>
          <p>
            Meet helpful students, share what you know, and make progress
            together.
          </p>
          <div className="study-helpers">
            <img
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=85"
              alt="Student helping a classmate"
            />
            <img
              src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=85"
              alt="Student studying with a classmate"
            />
            <span>Students learning together</span>
          </div>
        </div>

        <div className="study-banner-image">
          <img
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=88"
            alt="Students studying together and helping each other"
          />
          <span className="study-image-badge">🤝 Help each other grow</span>
        </div>

      </section>


      {/* DASHBOARD CARDS */}

      <div className="dashboard-actions-intro">
        <span>MAKE YOUR NEXT MOVE</span>
        <h2>What would you like to do today?</h2>
        <p>Choose a path below and keep learning with your student community.</p>
      </div>

      <div className="dashboard-cards">

        {/* LEARN */}

        <div
          className="dashboard-card"
          onClick={() =>
            setShowLearn(true)
          }
        >

          <img
            className="dashboard-card-image"
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=520&q=85"
            alt="Students finding academic help together"
          />

          <h2>
            🔍 Find Help
          </h2>

          <p>
            Find students who can help
            you learn new skills.
          </p>

        </div>


        {/* CONNECTION REQUESTS */}

        <div
          className="dashboard-card"
          onClick={() =>
            setShowRequests(true)
          }
        >

          <img
            className="dashboard-card-image"
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=520&q=85"
            alt="Students connecting and working together"
          />

          <h2>
            🤝 Connect

            {pendingCount > 0 && (

              <span
                style={{
                  marginLeft: "10px",
                  background:
                    "#ef4444",
                  color: "white",
                  fontSize: "12px",
                  padding:
                    "5px 9px",
                  borderRadius:
                    "20px",
                  verticalAlign:
                    "middle",
                }}
              >

                {pendingCount} New

              </span>

            )}

          </h2>

          <p>
            View and manage your
            connection requests.
          </p>

        </div>


        {/* MY CONNECTIONS */}

        <div
          className="dashboard-card"
          onClick={() =>
            setShowConnections(
              true
            )
          }
        >

          <img
            className="dashboard-card-image"
            src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=520&q=85"
            alt="Students collaborating in a study group"
          />

          <h2>
            👥 My Connections
          </h2>

          <p>
            View students you are
            connected with.
          </p>

        </div>


        {/* SHARE */}

        <div
          className="dashboard-card"
          onClick={() =>
            setShowShare(true)
          }
        >

          <img
            className="dashboard-card-image"
            src="https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=520&q=85"
            alt="Students sharing skills and ideas"
          />

          <h2>
            💡 Share Skill
          </h2>

          <p>
            Share your skills and
            knowledge with others.
          </p>

        </div>

      </div>

      <footer className="site-footer dashboard-footer">
        <div className="footer-main">
          <div className="footer-brand">
            <strong><span>🎓</span> StudentSolve</strong>
            <p>Your space to learn, share skills, and build meaningful connections.</p>
          </div>
          <div className="footer-column">
            <h3>Dashboard</h3>
            <span>Find Help</span>
            <span>Share Skills</span>
            <span>My Connections</span>
          </div>
          <div className="footer-column">
            <h3>Community</h3>
            <span>Learn together</span>
            <span>Help each other</span>
            <span>Grow together</span>
          </div>
          <div className="footer-column footer-contact">
            <h3>Need Help?</h3>
            <span>We are here for your journey.</span>
            <span>support@studentsolve.com</span>
            <div className="footer-socials">
              <span aria-label="Community chat">💬</span>
              <span aria-label="Learning resources">📚</span>
              <span aria-label="Student updates">✨</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <small>© 2026 StudentSolve. All rights reserved.</small>
          <span>Keep learning. Keep helping.</span>
        </div>
      </footer>

    </div>

  );

}

export default Dashboard;