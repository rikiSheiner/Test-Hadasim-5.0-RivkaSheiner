import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import styles from "../../styles/supplier/SupplierRegister.module.css";
import { FaTrashAlt, FaPlus } from "react-icons/fa";
import HomeButton from "../../components/HomeButton";

// עמוד רישום של ספק חדש למערכת
const SupplierRegister = () => {
  const navigate = useNavigate();

  // תוכן טופס הרישום מתעדכן בעת מילוי שדות הטופס
  const [formData, setFormData] = useState({
    company_name: "",
    phone_num: "",
    supplier_name: "",
    products: [{ product_name: "", price: "", min_quantity: "" }],
  });

  // עדכון שדות בטופס
  const handleChange = (e, index = null) => {
    const { name, value } = e.target;
    // יש אינדקס מדובר במוצר שהוא חלק מרשימה
    if (index !== null) {
      const updatedProducts = [...formData.products];
      updatedProducts[index][name] = value;
      setFormData({ ...formData, products: updatedProducts });
    }
    // אחרת מדובר בשדה רגיל
    else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // הוספת מוצר ריק לרשימה לצורך מילוי פרטים
  const addProduct = () => {
    setFormData({
      ...formData,
      products: [
        ...formData.products,
        { product_name: "", price: "", min_quantity: "" },
      ],
    });
  };

  // הסרת מוצר קיים מהרשימה
  const removeProduct = (indexToRemove) => {
    const updatedProducts = formData.products.filter(
      (_, index) => index !== indexToRemove
    );
    setFormData({ ...formData, products: updatedProducts });
  };

  // ביצוע הרישום בצד השרת
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:3000/suppliers/register",
        formData
      );
      alert("נרשמת בהצלחה!");
      localStorage.setItem("supplier", JSON.stringify(response.data.supplier));
      navigate("/supplier/home");
    } catch (error) {
      console.error(error);
      alert("שגיאה בהרשמה");
    }
  };

  return (
    <div className={styles.container}>
      <HomeButton></HomeButton>

      <h2 className={styles.title}>רישום ספק חדש</h2>

      <form className={styles.formCard} onSubmit={handleSubmit}>
        <input
          type="text"
          name="company_name"
          placeholder="שם חברה"
          value={formData.company_name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="phone_num"
          placeholder="מספר טלפון"
          value={formData.phone_num}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="supplier_name"
          placeholder="שם נציג"
          value={formData.supplier_name}
          onChange={handleChange}
          required
        />
        <h4>מוצרים:</h4>
        <div className={styles.productsList}>
          {formData.products.map((product, index) => (
            <div key={index} className={styles.productRow}>
              <input
                type="text"
                name="product_name"
                placeholder="שם מוצר"
                value={product.product_name}
                onChange={(e) => handleChange(e, index)}
                required
              />
              <input
                type="number"
                name="price"
                placeholder="מחיר"
                value={product.price}
                onChange={(e) => handleChange(e, index)}
                required
              />
              <input
                type="number"
                name="min_quantity"
                placeholder="כמות מינימלית"
                value={product.min_quantity}
                onChange={(e) => handleChange(e, index)}
                required
              />
              <button
                type="button"
                onClick={() => removeProduct(index)}
                className={styles.removeProductButton}
              >
                <FaTrashAlt />
              </button>
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={addProduct}
            className={styles.addProductButton}
          >
            <FaPlus></FaPlus>
          </button>

          <button type="submit">רישום</button>
        </div>

        <p>
          ספק רשום? <Link to="/supplier/login">לחץ כאן להתחברות</Link>
        </p>
      </form>
    </div>
  );
};

export default SupplierRegister;
