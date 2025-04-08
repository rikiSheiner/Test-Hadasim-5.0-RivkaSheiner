import React from 'react';
import OrderList from '../OrderList';
import styles from '../../styles/OrdersSection.module.css';

// רכיב הזמנות של ספק 
// מחולק ל4  חלקים - 3 לפי מצב הזמנה ו1 עבור כל ההזמנות
const OrdersSection = ({ orders, activeTab, setActiveTab, onApprove }) => {
  // הגדרת רשימות חלקיות של ההזמנות לפי מצבים
  const filteredOrders = {
    all: orders,
    pending: orders.filter(order => order.status === 'ממתינה'),
    inProgress: orders.filter(order => order.status === 'בתהליך'),
    completed: orders.filter(order => order.status === 'הושלמה'),
  };

  return (
    <>
      <div className={styles.statusFilters}>
        {[
          { key: 'all', label: 'הכל' },
          { key: 'pending', label: 'ממתינות' },
          { key: 'inProgress', label: 'בתהליך' },
          { key: 'completed', label: 'הושלמו' },
        ].map(({ key, label }) => (
          <div
            key={key}
            className={`${styles.filterItem} ${activeTab === key ? styles.activeFilter : ''}`}
            onClick={() => setActiveTab(key)}
          >
            <span className={styles.filterIcon}></span>
            <span className={styles.filterLabel}>{label}</span>
          </div>
        ))}
      </div>

      <OrderList orders={filteredOrders[activeTab]} onApprove={onApprove} role="supplier" />
    </>
  );
};

export default OrdersSection;
