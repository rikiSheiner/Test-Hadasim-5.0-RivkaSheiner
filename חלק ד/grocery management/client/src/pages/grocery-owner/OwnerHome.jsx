import React, { useEffect, useState } from "react";
import axios from "axios";
import LogoutButton from "../../components/LogoutButton";
import OrdersSection from "../../components/grocery-owner/OrdersSection";
import CreateOrderSection from "../../components/grocery-owner/CreateOrderSection";
import styles from "../../styles/grocery-owner/OwnerHome.module.css";

// עמוד הבית של בעל החנות
const OwnerHome = () => {
  const [orders, setOrders] = useState([]); // הזמנות של החנות
  const [activeTab, setActiveTab] = useState("all"); // טאב פעיל עבור סוג הזמנות שמוצגות
  const [activePage, setActivePage] = useState("orders"); // עמוד המוצג כרגע

  // פניה לשרת לצורך יבוא כל ההזמנות שהוזמנו בחנות
  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:3000/owner/orders");
      setOrders(res.data.orders);
    } catch (err) {
      console.error("שגיאה בטעינת הזמנות:", err);
    }
  };

  // פניה לשרת לצורך אישור קבלת הזמנ ע"י בעל החנות
  const confirmOrderReceived = async (order) => {
    if (order.status !== "בתהליך") return;

    try {
      await axios.post(
        `http://localhost:3000/owner/orders/${order.order_id}/complete`
      );
      alert("הזמנה סומנה כהושלמה");
      fetchOrders();
    } catch (err) {
      console.error("שגיאה באישור קבלת ההזמנה:", err);
      alert("אירעה שגיאה");
    }
  };

  // יבוא הזמנות בעת טעינת העמוד
  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.navbar}>
          <LogoutButton />
          <button
            className={activePage === "orders" ? styles.activePage : ""}
            onClick={() => setActivePage("orders")}
          >
            הזמנות קיימות
          </button>
          <button
            className={activePage === "createOrder" ? styles.activePage : ""}
            onClick={() => setActivePage("createOrder")}
          >
            יצירת הזמנה
          </button>
        </div>
      </div>

      {activePage === "orders" && (
        <OrdersSection
          orders={orders}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onApprove={confirmOrderReceived}
        />
      )}

      {activePage === "createOrder" && (
        <CreateOrderSection onOrderCreated={fetchOrders} />
      )}
    </div>
  );
};

export default OwnerHome;
