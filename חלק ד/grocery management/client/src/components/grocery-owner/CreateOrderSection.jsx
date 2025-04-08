import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../../styles/grocery-owner/CreateOrder.module.css";

// רכיב עבור יצירת הזמנה ע"י סעל החנות
const CreateOrderSection = ({ onOrderCreated }) => {
  const [suppliers, setSuppliers] = useState([]); // הספקים שמשווקים לחנות
  const [selectedSupplier, setSelectedSupplier] = useState(""); // הספק שממנו רוצים להזמין
  const [products, setProducts] = useState([]); // המוצרים שהספק הנבחר משווק
  const [selectedItems, setSelectedItems] = useState([]); // הפריטים שנבחרו להזמנה
  const [errors, setErrors] = useState({}); // שגיאות אם ישנן

  // בעת טעינת הרכיב פניה לשרת לצורך אחזור כל הספקים שישנם
  useEffect(() => {
    axios
      .get("http://localhost:3000/suppliers")
      .then((res) => setSuppliers(res.data.suppliers))
      .catch((err) => console.error("שגיאה בטעינת ספקים", err));
  }, []);

  // בעת בחירת ספק פניה לשרת לצורך אחזור כל המוצרים של הספק הנבחר
  useEffect(() => {
    if (selectedSupplier) {
      axios
        .get(`http://localhost:3000/suppliers/${selectedSupplier}/products`)
        .then((res) => setProducts(res.data.products))
        .catch((err) => console.error("שגיאה בטעינת מוצרים", err));
    }
  }, [selectedSupplier]);

  // טיפול בשינוי כמות יחידות של מוצר בהזמנה
  const handleQuantityChange = (productId, quantity) => {
    const product = products.find((p) => p.id === productId); // שליפת המוצר ההמתאים
    if (!product) return;

    const updatedErrors = { ...errors };
    // אם הכמות הנבחרת קטנה מהמינימום נציג הודעת שגיאה
    if (quantity < product.min_quantity) {
      updatedErrors[
        productId
      ] = `כמות מינימלית להזמנה: ${product.min_quantity}`;
    } else { // אחרת נמחק את השגיאה אם קיימת
      delete updatedErrors[productId];
    }
    // עדכון אוביקט שגיאות
    setErrors(updatedErrors);

    // עדכון הכמות של המוצר הנבחר 
    const updated = [...selectedItems];
    const index = updated.findIndex((item) => item.product_id === productId);

    // אם המוצר קיים נעדכן כמות
    if (index > -1) {
      updated[index].quantity = quantity;
    } else { // אחרת נוסיף אותו עם הכמות החדשה
      updated.push({ product_id: productId, quantity });
    }

    // עדכון רשימת פריטים
    setSelectedItems(updated);
  };

  // טיפול בבחירה או ביטול בחירה של מוצר בהזמנה
  const handleProductSelect = (productId, selected) => {
    // מציאת המוצר
    const product = products.find((p) => p.id === productId);
    if (!product) return; 

    const updatedItems = [...selectedItems];
    // אם המוצר נבחר נוסיף אותו לרשימה
    if (selected) {
      updatedItems.push({
        product_id: productId,
        quantity: product.min_quantity,
      }); 
    } else { // אם בוטלה בחירת מוצר נסיר אותו מהרשימה
      const index = updatedItems.findIndex(
        (item) => item.product_id === productId
      );
      if (index > -1) updatedItems.splice(index, 1);
    }
    // עדכון רשימת המוצרים
    setSelectedItems(updatedItems);
  };

  // יצירת הזמנה בפועל ע"י פניה לשרת
  const handleSubmit = () => {
    if (
      !selectedSupplier ||
      selectedItems.length === 0 ||
      Object.keys(errors).length > 0
    ) {
      return alert("חסרים פרטים להזמנה");
    }

    axios
      .post("http://localhost:3000/owner/order", {
        supplier_id: selectedSupplier,
        items: selectedItems,
      })
      .then(() => {
        alert("הזמנה נשלחה בהצלחה!");
        setSelectedItems([]);
        setSelectedSupplier("");
        setProducts([]);
        setErrors({});

        // נעדכן את רשימת ההזמנות בעמוד הראשי
        if (onOrderCreated) {
          onOrderCreated();
        }
      })
      .catch((err) => console.error("שגיאה בשליחת הזמנה", err));
  };

  return (
      <div className={styles.container}>
        <h2 className={styles.title}> הזמנה חדשה</h2>

        <div className={styles.selectWrapper}>
          <label className={styles.productLabel}>בחר ספק</label>
          <select
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
          >
            <option value="">-- בחר ספק --</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.supplier_name}, {s.company_name}
              </option>
            ))}
          </select>
        </div>

        {products.length > 0 && (
          <>
            <label className={styles.productLabel}>בחר מוצרים</label>
            <div className={styles.productList}>
              {products.map((product) => (
                <div key={product.id} className={styles.productRow}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    onChange={(e) =>
                      handleProductSelect(product.id, e.target.checked)
                    }
                    checked={selectedItems.some(
                      (item) => item.product_id === product.id
                    )}
                  />

                  <div className={styles.productInfo}>
                    <strong>{product.product_name}</strong> - ₪{product.price}
                    <span style={{ marginRight: "8px", color: "#555" }}>
                      (מינימום: {product.min_quantity})
                    </span>
                    {selectedItems.find(
                      (item) => item.product_id === product.id
                    ) && (
                      <input
                        type="number"
                        min={product.min_quantity}
                        placeholder="כמות"
                        className={styles.quantityInput}
                        onChange={(e) =>
                          handleQuantityChange(
                            product.id,
                            parseInt(e.target.value)
                          )
                        }
                        style={{ marginTop: "8px" }}
                      />
                    )}
                    {errors[product.id] && (
                      <div className={styles.errorText}>
                        {errors[product.id]}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.buttonGroup}>
              <button
                onClick={handleSubmit}
                disabled={Object.keys(errors).length > 0}
              >
                שלח הזמנה
              </button>
            </div>
          </>
        )}
      </div>
  );
};

export default CreateOrderSection;
