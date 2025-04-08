import React from "react";
import OrderList from "../../components/OrderList";
import styles from "../../styles/OrdersSection.module.css";

const OrdersSection = ({ orders, activeTab, setActiveTab, onApprove }) => {
  const filteredOrders = {
    all: orders,
    pending: orders.filter((order) => order.status === "ממתינה"),
    inProgress: orders.filter((order) => order.status === "בתהליך"),
    completed: orders.filter((order) => order.status === "הושלמה"),
  };

  return (
    <section className={styles.ordersSection}>
      <h2 className={styles.title}>הזמנות מספקים</h2>

      <div className={styles.statusFilters}>
        {[
          { key: "all", label: "הכל" },
          { key: "pending", label: "ממתינות" },
          { key: "inProgress", label: "בתהליך" },
          { key: "completed", label: "הושלמו" },
        ].map(({ key, label }) => (
          <div
            key={key}
            className={`${styles.filterItem} ${
              activeTab === key ? styles.activeFilter : ""
            }`}
            onClick={() => setActiveTab(key)}
          >
            <span className={styles.filterIcon}></span>
            <span className={styles.filterLabel}>{label}</span>
          </div>
        ))}
      </div>

      <OrderList
        orders={filteredOrders[activeTab]}
        onApprove={onApprove}
        role="owner"
      />
    </section>
  );
};

export default OrdersSection;
