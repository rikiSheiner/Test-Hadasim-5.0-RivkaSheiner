import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import styles from "../../styles/supplier/SupplierLogin.module.css";
import HomeButton from "../../components/HomeButton";

// עמוד התחברות של ספק
const SupplierLogin = () => {
  const [supplierName, setSupplierName] = useState(""); // שם ספק
  const [phoneNum, setPhoneNum] = useState(""); // מספר טלפון
  const [error, setError] = useState(""); // הודעת שגיאה במקרה הצורך
  const navigate = useNavigate();

  // פניה לשרת לצורך התחברות ספק
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:3000/suppliers/login",
        {
          supplier_name: supplierName,
          phone_num: phoneNum,
        }
      );

      if (response.status === 200) {
        localStorage.setItem(
          "supplier",
          JSON.stringify(response.data.supplier)
        );
        navigate("/supplier/home");
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("שגיאה בהתחברות");
      }
    }
  };

  return (
    <div className={styles.loginContainer}>
      <HomeButton></HomeButton>
      <h2 className={styles.title}>התחברות ספק</h2>

      <form className={styles.form} onSubmit={handleLogin}>
        <label className={styles.label}>שם נציג:</label>
        <input
          type="text"
          value={supplierName}
          onChange={(e) => setSupplierName(e.target.value)}
          required
          className={styles.input}
        />

        <label className={styles.label}>מספר טלפון:</label>
        <input
          type="text"
          value={phoneNum}
          onChange={(e) => setPhoneNum(e.target.value)}
          required
          className={styles.input}
        />

        <button type="submit" className={styles.button}>
          התחבר
        </button>

        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
      </form>

      <p className={styles.link}>
        עדיין לא נרשמת? <Link to="/supplier/register">לחץ כאן להרשמה</Link>
      </p>
    </div>
  );
};

export default SupplierLogin;
