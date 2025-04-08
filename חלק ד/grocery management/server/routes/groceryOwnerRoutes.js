const express = require("express");
const router = express.Router();
const db = require("../db"); // שימוש בחיבור לבסיס הנתונים

// בקובץ זה אנו מגדירים את הנתיבים והפונקציות של פעולות הקשורות לבעל החנות

// פעולת התחברות של בעל החנות
router.post("/login", (req, res) => {
  const { username, password } = req.body; // חילוץ שם משתמש וסיסמה

  // בדיקה שהשדות סופקו
  if (!username || !password) {
    return res.status(400).json({ message: "יש להזין שם משתמש וסיסמה" });
  }

  // ביצוע השאילתה לאחזור בעל החנות המתאים
  const sql = `SELECT * FROM grocery_owners WHERE username = ? AND password = ?`;
  db.query(sql, [username, password], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "שגיאה בשרת" });
    }


    if (results.length === 0) {
      return res.status(401).json({ message: "שם משתמש או סיסמה שגויים" });
    }

    res.status(200).json({ message: "התחברות הצליחה", ownerId: results[0].id });
  });
});

// פעולת יצירת הזמנה ע"י בעל החנות
router.post("/order", (req, res) => {
  const { supplier_id, items } = req.body; // חילוץ מזהה ספק ורשימת פריטים

  // בדיקה שהשדות סופקו
  if (!supplier_id || !items || items.length === 0) {
    return res
      .status(400)
      .json({ message: "חובה לספק מזהה ספק ורשימת פריטים" });
  }

  // הכנסה של נתוני ההזמנה לבסיס הנתונים
  // הכנסת ההזמנה עצמה
  const insertOrder = `
        INSERT INTO orders (supplier_id, status, created_at) 
        VALUES (?, 'ממתינה', NOW())
    `;
  db.query(insertOrder, [supplier_id], (err, orderResult) => {
    if (err) return res.status(500).json({ error: "שגיאה ביצירת הזמנה" });

    const orderId = orderResult.insertId;

    // הכנסת פריטי ההזמנה
    const insertItems = `
            INSERT INTO order_items (order_id, product_id, quantity) 
            VALUES ?
        `;

    const values = items.map((item) => [
      orderId,
      item.product_id,
      item.quantity,
    ]);

    db.query(insertItems, [values], (err, itemResult) => {
      if (err)
        return res.status(500).json({ error: "שגיאה בהוספת פריטי ההזמנה" });

      res.status(201).json({ message: "הזמנה נוצרה בהצלחה", orderId });
    });
  });
});

// פעולת אישור קבלת הזמנה ע"י בעל החנות / שינוי סטטוס להושלמה
router.post("/orders/:orderId/complete", (req, res) => {
  const orderId = req.params.orderId;// חילוץ מזהה הזמנה

  // עדכון סטטוס ההזמנה להושלמה
  const sql = `UPDATE orders SET status = 'הושלמה' WHERE id = ?`;
  db.query(sql, [orderId], (err, result) => {
    if (err) return res.status(500).json({ error: "שגיאה בעדכון סטטוס" });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "הזמנה לא נמצאה" });
    }

    res.status(200).json({ message: 'הזמנה עודכנה ל"הושלמה"' });
  });
});

// פעולה עבור אחזור כל ההזמנות השמורות במערכת כולל פרטי הזמנה
router.get("/orders", (req, res) => {
  // הגדרת השאילתה
  const sql = `
      SELECT 
        o.id AS order_id, 
        o.status, 
        o.created_at, 
        s.company_name,
        oi.quantity,
        sp.id AS product_id,
        sp.product_name, 
        sp.price, 
        sp.min_quantity
      FROM orders o
      JOIN suppliers s ON o.supplier_id = s.id
      JOIN order_items oi ON o.id = oi.order_id
      JOIN supplier_products sp ON oi.product_id = sp.id
      ORDER BY o.created_at DESC
    `;
  // הרצה של השאילתה
  db.query(sql, (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "שגיאה בשרת", details: err.message });
    }

    const allOrders = {};

    // המרת תוצאות השאילתה לפורמט הרצוי
    // עבור כל הזמנה ניצור רשימה של הפריטים
    results.forEach((row) => {
      if (!allOrders[row.order_id]) {
        allOrders[row.order_id] = {
          order_id: row.order_id,
          company_name: row.company_name,
          status: row.status,
          created_at: row.created_at,
          items: [],
        };
      }

      allOrders[row.order_id].items.push({
        product_id: row.product_id,
        name: row.product_name,
        price: row.price,
        min_quantity: row.min_quantity,
        quantity: row.quantity,
      });
    });

    // המרה של המילון למערך ושליחת תגובה
    const formattedOrders = Object.values(allOrders);
    res.status(200).json({ orders: formattedOrders });
  });
});

module.exports = router;
