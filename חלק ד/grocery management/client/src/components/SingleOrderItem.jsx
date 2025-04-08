import React from "react";
import styles from "../styles/components/SingleOrderItem.module.css";

// רכיב פריט מתוך הזמנה
// מוצג בתוך רכיב של הזמנה יחידה
const SingleOrderItem = ({ item }) => {
  // חישוב עלות פריט
  const total = (item.price * item.quantity).toFixed(2);
  // החזרת פרטי פריט זה בהזמנה
  return (
    <li className={styles.item}>
      <span>{item.name}</span>
      <span>{item.quantity}</span>
      <span>₪{item.price}</span>
      <span>₪{total}</span>
    </li>
  );
};

export default SingleOrderItem;
