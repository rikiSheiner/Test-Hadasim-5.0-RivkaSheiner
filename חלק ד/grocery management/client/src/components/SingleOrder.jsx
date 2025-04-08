import React from "react";
import SingleOrderItem from "./SingleOrderItem";
import styles from "../styles/components/SingleOrder.module.css";

// רכיב הזמנה יחידה מתוך רשימת הזמנות
const SingleOrder = ({ order, onApprove, role }) => {
  // לפי התפקיד נקבע האם להציג כפתור אישור הזמנה
  // ספק מאשר הזמנות בהמתנה ובעל החנות מאשר הזמנות בתהליך
  const shouldShowButton = () => {
    if (role === "supplier" && order.status === "ממתינה") return true;
    if (role === "owner" && order.status === "בתהליך") return true;
    return false;
  };

  // לפי התפקיד נקבע איזה טקסט להציג על כפתור אישור הזמנה
  const getApproveButtonText = () => {
    if (role === "supplier" && order.status === "ממתינה") return "אשר הזמנה";
    if (role === "owner" && order.status === "בתהליך") return "אשר קבלת הזמנה";
    return "";
  };

  // קביעת הגדרות עיצוב מצב הזמנה לפי המצב
  const getStatusClass = (status) => {
    if (status === "הושלמה") return styles.completed;
    if (status === "ממתינה") return styles.pending;
    if (status === "בתהליך") return styles.processing;
    return "";
  };

  // הצגת ההזמנה
  return (
    <li className={styles.orderCard}>
      <div className={styles.headerRow}>
        <span className={styles.orderId}>
          הזמנה #{order.order_id || order.id}
        </span>
        <span
          className={`${styles.statusBadge} ${getStatusClass(order.status)}`}
        >
          {order.status}
        </span>
      </div>

      {role !== "supplier" && (
        <div className={styles.row}>
          <span className={styles.label}>ספק:</span>
          <span className={styles.value}>{order.company_name}</span>
        </div>
      )}

      <div className={styles.row}>
        <span className={styles.label}>תאריך :</span>
        <span className={styles.value}>
          {new Date(order.created_at).toLocaleDateString("he-IL")}
        </span>
      </div>

      {order.items?.length > 0 && (
        <div className={styles.itemsSection}>
          <span className={styles.label}>מוצרים:</span>

          <div className={styles.tableHeader}>
            <span>מוצר</span>
            <span>כמות</span>
            <span>מחיר</span>
            <span>סה"כ</span>
          </div>

          <ul className={styles.itemList}>
            {order.items.map((item, index) => (
              <SingleOrderItem key={index} item={item} />
            ))}
          </ul>

          <div className={styles.totalRow}>
            <span>סה"כ להזמנה:</span>
            <span>
              ₪
              {order.items
                .reduce((sum, item) => sum + item.price * item.quantity, 0)
                .toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {shouldShowButton() && onApprove && (
        <button className={styles.button} onClick={() => onApprove(order)}>
          {getApproveButtonText()}
        </button>
      )}
    </li>
  );
};

export default SingleOrder;
