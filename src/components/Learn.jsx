import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

import { getAuth } from "firebase/auth";

import { db } from "../firebase";
import "./Learn.css";

function Learn({ onBack }) {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState([]);
const [skillsLoading, setSkillsLoading] = useState(true);
const [connectionStatuses, setConnectionStatuses] = useState({});

  const auth = getAuth();
  const currentUser = auth.currentUser;

  // ==============================
  // SEND CONNECTION REQUEST
  // ==============================

  const sendConnectionRequest = async () => {
    if (!currentUser) {
      alert("Please login first.");
      return;
    }

    if (!selectedStudent) {
      return;
    }

    // Don't allow sending request to yourself
    if (selectedStudent.id === currentUser.uid) {
      alert("You cannot send a connection request to yourself.");
      return;
    }

    try {
      // Check if request already exists
      const q = query(
        collection(db, "connectionRequests"),
        where("senderId", "==", currentUser.uid),
        where("receiverId", "==", selectedStudent.id)
      );

      const existingRequests = await getDocs(q);

      // If request already exists
      if (!existingRequests.empty) {
        const existingRequest =
          existingRequests.docs[0].data();

        // Pending request
        if (existingRequest.status === "pending") {
          alert(
            "Connection request is already pending. ⏳"
          );
          return;
        }

        // Accepted request
        if (existingRequest.status === "accepted") {
          alert(
            "You are already connected with this student! 🤝"
          );
          return;
        }

        // Rejected request
        if (existingRequest.status === "rejected") {
          // Allow sending again after rejection
          console.log(
            "Previous request was rejected. Sending a new request..."
          );
        }
      }

      // Send new connection request
      await addDoc(
        collection(db, "connectionRequests"),
        {
          senderId: currentUser.uid,

          senderName:
            currentUser.displayName || "Student",

          senderEmail: currentUser.email,

          receiverId: selectedStudent.id,

          receiverName:
            selectedStudent.name || "Student",

          receiverEmail: selectedStudent.email,

          status: "pending",

          createdAt: serverTimestamp(),
        }
      );

      alert(
        "Connection request sent successfully! 🎉"
      );

      // Close profile modal
      setSelectedStudent(null);

    } catch (error) {
      console.error(
        "Connection request error:",
        error
      );

      alert(
        "Failed to send connection request."
      );
    }
  };

  // ==============================
  // GET STUDENTS
  // ==============================

  useEffect(() => {
    const getStudents = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(db, "users")
        );

        const studentList =
          querySnapshot.docs.map((studentDoc) => ({
            id: studentDoc.id,
            ...studentDoc.data(),
          }));

        setStudents(studentList);

      } catch (error) {
        console.error(
          "Error fetching students:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    getStudents();
  }, []);

  // ==============================
// GET SHARED SKILLS
// ==============================

useEffect(() => {
  const skillsQuery = query(
    collection(db, "skills")
  );

  const unsubscribe = onSnapshot(
    skillsQuery,
    (snapshot) => {
      const skillList = snapshot.docs.map(
        (skillDoc) => ({
          id: skillDoc.id,
          ...skillDoc.data(),
        })
      );

      setSkills(skillList);
      setSkillsLoading(false);
    },
    (error) => {
      console.error(
        "Error fetching skills:",
        error
      );

      setSkillsLoading(false);
    }
  );

  return () => unsubscribe();
}, []);



// ==============================
// GET CONNECTION STATUSES
// ==============================

useEffect(() => {
  if (!currentUser) return;

  const q = query(
    collection(db, "connectionRequests"),
    where("senderId", "==", currentUser.uid)
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const statuses = {};

      snapshot.docs.forEach((requestDoc) => {
        const request = requestDoc.data();

        statuses[request.receiverId] =
          request.status;
      });

      setConnectionStatuses(statuses);
    },
    (error) => {
      console.error(
        "Error loading connection statuses:",
        error
      );
    }
  );

  return () => unsubscribe();
}, [currentUser]);


  // ==============================
  // PAGE
  // ==============================

  return (
    <div className="learn-page">

      {/* ================= HEADER ================= */}

      <div className="learn-header">

        <div>

          <button
            className="back-btn"
            onClick={onBack}
          >
            ← Back
          </button>

          <h1>Discover Students</h1>

          <p>
            Connect with students and learn new skills.
          </p>

        </div>

        <div className="student-count">

          <strong>
            {students.length}
          </strong>

          <span>
            Students
          </span>

        </div>

      </div>

      {/* ================= LOADING ================= */}

      {loading && (
        <div className="learn-loading">
          Loading students...
        </div>
      )}

      {/* ================= EMPTY ================= */}

      {!loading && students.length === 0 && (
        <div className="empty-students">

          <h2>
            No students found
          </h2>

          <p>
            Students will appear here after registration.
          </p>

        </div>
      )}
      {/* ================= SHARED SKILLS ================= */}

<div className="shared-skills-section">

  <div className="shared-skills-header">

    <div>
      <h2>💡 Shared Skills</h2>

      <p>
        Discover skills shared by students
        and connect with people who can help you learn.
      </p>
    </div>

    <div className="skills-count">
      <strong>{skills.length}</strong>
      <span>Skills</span>
    </div>

  </div>


  {skillsLoading && (
    <div className="skills-loading">
      Loading shared skills...
    </div>
  )}


  {!skillsLoading && skills.length === 0 && (
    <div className="no-skills">
      <div className="no-skills-icon">💡</div>

      <h3>No skills shared yet</h3>

      <p>
        Students can share their skills from
        the Share section.
      </p>
    </div>
  )}


  {!skillsLoading && skills.length > 0 && (

    <div className="skills-grid">

      {skills.map((skill) => (

        <div
          className="learn-skill-card"
          key={skill.id}
        >

          <div className="skill-card-icon">
            💡
          </div>

          <span className="learn-skill-category">
            {skill.category}
          </span>

          <h3>
            {skill.skillName}
          </h3>

          <p className="learn-skill-description">
            {skill.description}
          </p>

          <div className="skill-owner">

            <div className="owner-avatar">
              {skill.userName
                ? skill.userName
                    .charAt(0)
                    .toUpperCase()
                : "S"}
            </div>

            <div>
              <small>Shared by</small>

              <strong>
                {skill.userName || "Student"}
              </strong>
            </div>

          </div>

          <button
            className="skill-connect-btn"
            onClick={() => {
              const student = students.find(
                (s) => s.id === skill.userId
              );

              if (student) {
                setSelectedStudent(student);
              } else {
                alert(
                  "Student profile not found."
                );
              }
            }}
          >
            🤝 Connect
          </button>

        </div>

      ))}

    </div>

  )}

</div>

      {/* ================= STUDENTS ================= */}

      {!loading && students.length > 0 && (

        <div className="students-grid">

          {students.map((student) => (

            <div
              className="student-card"
              key={student.id}
            >

              {/* Avatar */}

              <div className="student-avatar">

                {student.name
                  ? student.name
                      .charAt(0)
                      .toUpperCase()
                  : "S"}

              </div>

              {/* Student Information */}

              <div className="student-info">

                <h2>
                  {student.name || "Student"}
                </h2>

                <p className="student-email">
                  {student.email ||
                    "No email available"}
                </p>

                <p className="student-skill">
                  🎓 Student
                </p>

              </div>

              {/* View Profile */}

              <button
  className="connect-btn"
  onClick={() => {
    if (student.id === currentUser?.uid) {
      alert("This is your profile. 👤");
      return;
    }

    setSelectedStudent(student);
  }}
>
  {student.id === currentUser?.uid
    ? "👤 You"
    : connectionStatuses[student.id] === "pending"
    ? "⏳ Pending"
    : connectionStatuses[student.id] === "accepted"
    ? "✅ Connected"
    : connectionStatuses[student.id] === "rejected"
    ? "🔄 Connect Again"
    : "🤝 Connect"}
</button>

            </div>

          ))}

        </div>

      )}

      {/* ================= PROFILE MODAL ================= */}

      {selectedStudent && (

        <div className="profile-overlay">

          <div className="profile-modal">

            {/* Close */}

            <button
              className="close-profile"
              onClick={() =>
                setSelectedStudent(null)
              }
            >
              ×
            </button>

            {/* Avatar */}

            <div className="profile-avatar">

              {selectedStudent.name
                ? selectedStudent.name
                    .charAt(0)
                    .toUpperCase()
                : "S"}

            </div>

            {/* Name */}

            <h2>
              {selectedStudent.name ||
                "Student"}
            </h2>

            <p className="profile-role">
              Student • StudentSolve
            </p>

            {/* Details */}

            <div className="profile-details">

              {/* Email */}

              <div className="profile-detail">

                <span>📧</span>

                <div>

                  <small>
                    Email
                  </small>

                  <p>
                    {selectedStudent.email ||
                      "Not available"}
                  </p>

                </div>

              </div>

              {/* Role */}

              <div className="profile-detail">

                <span>🎓</span>

                <div>

                  <small>
                    Role
                  </small>

                  <p>
                    Student
                  </p>

                </div>

              </div>

              {/* Learning */}

              <div className="profile-detail">

                <span>💡</span>

                <div>

                  <small>
                    Learning
                  </small>

                  <p>
                    Available for learning &
                    collaboration
                  </p>

                </div>

              </div>

            </div>

            {/* Connect Button */}

            <button
              className="message-btn"
              onClick={sendConnectionRequest}
            >
              💬 Connect with Student
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default Learn;
