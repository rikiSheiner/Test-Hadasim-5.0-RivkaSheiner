import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// ייבוא הרכיבים הראשיים של האפליקציה
import Home from "./pages/Home";
import SupplierRegister from "./pages/supplier/SupplierRegister";
import SupplierLogin from "./pages/supplier/SupplierLogin";
import SupplierHome from "./pages/supplier/SupplierHome";
import GroceryLogin from "./pages/grocery-owner/OwnerLogin";
import GroceryHome from "./pages/grocery-owner/OwnerHome";

// הגדרת נתיבי האפליקציה לניווט בין העמודים השונים
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/supplier/register" element={<SupplierRegister />} />
        <Route path="/supplier/login" element={<SupplierLogin />} />
        <Route path="/supplier/home" element={<SupplierHome />} />

        <Route path="/owner/login" element={<GroceryLogin />} />
        <Route path="/owner/home" element={<GroceryHome />} />
      </Routes>
    </Router>
  );
}

export default App;
