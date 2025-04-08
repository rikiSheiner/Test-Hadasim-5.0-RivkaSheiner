import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

// כפתור עבור התנתקות של משתמש מהאפליקציה - ספק או בעל חנות
const LogoutButton = () => {
  const navigate = useNavigate();

  // טיפול בהתנתקות
  const handleLogout = () => {
    // אם המשתמש הוא ספק נמחק אותו
    if (localStorage.getItem("supplier")) {
      localStorage.removeItem("supplier");
    }

    // ניווט לדף הבית
    navigate("/");
  };

  return (
    <button
      onClick={handleLogout}
      style={{ margin: "10px", padding: "8px 12px" }}
    >
      <LogOut></LogOut>
    </button>
  );
};

export default LogoutButton;
