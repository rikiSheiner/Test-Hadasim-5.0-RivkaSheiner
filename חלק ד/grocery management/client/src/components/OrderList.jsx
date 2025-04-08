import React from "react";
import SingleOrder from "./SingleOrder";
import styles from "../styles/components/OrderList.module.css";

// רכיב רשימת הזמנות
// מורכב מרכיבים של הזמנה יחידה
const OrderList = ({ orders, onApprove, role }) => {
  // במידה ואין הזמנות נציג הודעה מתאימה
  if (!orders || orders.length === 0) {
    return <p className={styles.noOrders}>אין הזמנות להצגה</p>;
  }

  // אחרת נציג את רשימת ההזמנות
  return (
    <ul className={styles.orderList}>
      {orders.map((order) => (
        <SingleOrder
          key={order.order_id || order.id}
          order={order}
          onApprove={onApprove}
          role={role}
        />
      ))}
    </ul>
  );
};

export default OrderList;
