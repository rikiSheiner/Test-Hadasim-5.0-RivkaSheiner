import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../../styles/grocery-owner/OwnerLogin.module.css";
import HomeButton from "../../components/HomeButton";

// עמוד התחברות של בעל החנות
const GroceryOwnerLogin = () => {
  const [username, setUsername] = useState(""); // שם משתמש
  const [password, setPassword] = useState(""); // סיסמה
  const navigate = useNavigate(); // ניווט

  // פניה לשרת לצורך התחברות בעל החנות
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:3000/owner/login", {
        username,
        password,
      });

      if (res.status === 200) {
        navigate("/owner/home"); // ניווט לעמוד הבית של בעל החנות
      }
    } catch (err) {
      alert(err.response?.data?.message || "שגיאה בהתחברות");
    }
  };

  return (
    <div className={styles.loginContainer}>
      <HomeButton></HomeButton>
      <h2 className={styles.title}>התחברות בעל מכולת</h2>
      <form onSubmit={handleLogin} className={styles.form}>
        <label className={styles.label}>שם משתמש:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className={styles.input}
        />
        <label className={styles.label}>סיסמה:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={styles.input}
        />
        <button type="submit" className={styles.button}>
          התחבר
        </button>
      </form>
    </div>
  );
};

export default GroceryOwnerLogin;
