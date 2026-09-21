import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../firebase";

function Profile({ onBack }) {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
const [bio, setBio] = useState("");
const [subject, setSubject] = useState("");
const [skills, setSkills] = useState("");
const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const user = auth.currentUser;

        if (user) {
          const userDoc = await getDoc(
            doc(db, "users", user.uid)
          );

          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        }
      } catch (error) {
        console.log("Error loading profile:", error);
      }
    };

    getProfile();
  }, []);
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      return;
    }

    try {
      setUploadingPhoto(true);

      const photoRef = ref(storage, `profilePictures/${user.uid}`);

      await uploadBytes(photoRef, file);

      const photoURL = await getDownloadURL(photoRef);

      await updateDoc(doc(db, "users", user.uid), {
        photoURL: photoURL,
      });

      setUserData({
        ...userData,
        photoURL: photoURL,
      });

      alert("Profile picture updated! 📸");
    } catch (error) {
      console.log("Error uploading photo:", error);
      alert("Photo upload failed. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
  try {
    const user = auth.currentUser;

    if (user) {
      await updateDoc(doc(db, "users", user.uid), {
        name: name,
        bio: bio,
        subject: subject,
        skills: skills,
      });

      setUserData({
        ...userData,
        name: name,
        bio: bio,
        subject: subject,
        skills: skills,
      });

      setIsEditing(false);

      alert("Profile updated successfully!");
    }

  } catch (error) {
    console.log("Error updating profile:", error);
    alert("Profile update failed.");
  }
};

  return (
    <div className="profile-page">

      <button onClick={onBack}>
        ← Back to Dashboard
      </button>

      <div className="profile-card">

        <div className="profile-icon">
          {userData && userData.photoURL ? (
            <img src={userData.photoURL} alt="Profile" className="profile-photo-img" />
          ) : (
            "👤"
          )}
        </div>

        <label className="upload-photo-btn">
          {uploadingPhoto ? "Uploading..." : "📷 Change Photo"}
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            disabled={uploadingPhoto}
            style={{ display: "none" }}
          />
        </label>

        <h1>My Profile</h1>

        {userData ? (
          <>
            <h2>{userData.name}</h2>

            <p>
              📧 {userData.email}
            </p>

            <p>
              🎓 Student
            </p>
            <p>
  📝 Bio: {userData.bio || "No bio added yet"}
</p>

<p>
  📚 Subject: {userData.subject || "No subject added yet"}
</p>

<p>
  💡 Skills: {userData.skills || "No skills added yet"}
</p>
<button
  onClick={() => {
    setName(userData.name || "");
    setBio(userData.bio || "");
    setSubject(userData.subject || "");
    setSkills(userData.skills || "");
    setIsEditing(true);
  }}
>
  ✏️ Edit Profile
</button>
{isEditing && (
  <div className="edit-profile-form">

    <h2>Edit Profile</h2>

    <input
      type="text"
      placeholder="Your Name"
      value={name}
onChange={(e) => setName(e.target.value)}
    />

    <input
      type="text"
      placeholder="Your Bio"
      value={bio}
onChange={(e) => setBio(e.target.value)}
    />

    <input
      type="text"
      placeholder="Your Subject"
      value={subject}
onChange={(e) => setSubject(e.target.value)}
    />

    <input
      type="text"
      placeholder="Your Skills"
      value={skills}
onChange={(e) => setSkills(e.target.value)}
    />

   <button onClick={handleSave}>
  💾 Save Changes
</button>

    <button onClick={() => setIsEditing(false)}>
      Cancel
    </button>

  </div>
)}
          </>
        ) : (
          <p>Loading profile...</p>
        )}

      </div>

    </div>
  );
}

export default Profile;