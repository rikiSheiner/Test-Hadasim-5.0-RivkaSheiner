import React, { useEffect, useState } from "react";
import axios from "axios";
import LogoutButton from "../../components/LogoutButton";
import OrdersSection from "../../components/supplier/OrdersSection";
import ProductsSection from "../../components/supplier/ProductsSection";
import styles from "../../styles/supplier/SupplierHome.module.css";

// עמוד הבית של ספק
// מכיל אפשרות נווט בין עמוד הזמנות לבין עמוד מוצרים שהוא משווק
const SupplierHome = () => {
  const [orders, setOrders] = useState([]); // הזמנות של הספק
  const [products, setProducts] = useState([]); // מוצרים של הספק
  const [errors, setErrors] = useState({}); // שגיאות אם ישנן
  const [activeTab, setActiveTab] = useState("all"); // הטאב הנבחר בתוך עמוד ההזמנות
  const [activePage, setActivePage] = useState("orders"); // העמוד הנבחר בניווט
  const [supplierName, setSupplierName] = useState(""); // שם ספק
  const [companyName, setCompanyName] = useState(""); // חברה של הספק

  // בעת טעינת הרכיב של עמוד הבית נטען את פרטי הספק כולל הזמנות ומוצרים שלו
  useEffect(() => {
    const supplier = JSON.parse(localStorage.getItem("supplier"));
    if (supplier) {
      setSupplierName(supplier.supplier_name);
      setCompanyName(supplier.company_name);
      fetchOrders(supplier.id);
      fetchProducts(supplier.id);
    }
  }, []);

  // אחזור הזמנות השייכות לספק מהשרת
  const fetchOrders = async (supplierId) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/suppliers/${supplierId}/orders`
      );
      setOrders(res.data.orders);
    } catch (err) {
      console.error("שגיאה בטעינת הזמנות:", err);
    }
  };

  // אחזור מוצרים המשווקים ע"י הספק לספק מהשרת
  const fetchProducts = async (supplierId) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/suppliers/${supplierId}/products`
      );
      setProducts(res.data.products);
    } catch (err) {
      console.error("שגיאה בטעינת מוצרים:", err);
    }
  };

  // פונקציה לאישור הזמנה ע"י ספק בצד השרת / העברה למצב בתהליך
  const approveOrder = async (order) => {
    if (order.status !== "ממתינה") return;
    try {
      await axios.post(
        `http://localhost:3000/suppliers/orders/${order.order_id}/approve`
      );
      alert("ההזמנה אושרה!");
      const supplier = JSON.parse(localStorage.getItem("supplier"));
      fetchOrders(supplier.id);
    } catch (err) {
      alert("שגיאה באישור הזמנה");
    }
  };


  return (
    <div className={styles.container}>
      <div className={styles.navbar}>
        <LogoutButton />
        <button
          className={activePage === "orders" ? styles.activePage : ""}
          onClick={() => setActivePage("orders")}
        >
          הזמנות
        </button>
        <button
          className={activePage === "products" ? styles.activePage : ""}
          onClick={() => setActivePage("products")}
        >
          מוצרים
        </button>
      </div>

      {supplierName && companyName && (
        <div className={styles.welcomeMessage}>
          שלום {supplierName} מ{companyName}
        </div>
      )}

      {activePage === "orders" && (
        <OrdersSection
          orders={orders}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onApprove={approveOrder}
        />
      )}

      {activePage === "products" && (
        <ProductsSection
          products={products}
        />
      )}
    </div>
  );
};

export default SupplierHome;