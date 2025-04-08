import { Home } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

//  כפתור עבור חזרה למסך הבית של האפליקציה
const HomeButton = () => {
  const navigate = useNavigate();

  return (
    <button onClick={() => navigate("/")}>
      <Home />
    </button>
  );
};

export default HomeButton;
