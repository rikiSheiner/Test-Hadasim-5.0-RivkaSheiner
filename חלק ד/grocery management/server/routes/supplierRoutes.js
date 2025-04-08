const express = require("express");
const router = express.Router();
const db = require("../db"); // שימוש בחיבור לבסיס הנתונים

// בקובץ זה אנו מגדירים את הנתיבים והפונקציות של פעולות הקשורות לספקים

// פעולה עבור אחזור כל הספקים השמורים במערכת
router.get("/", (req, res) => {
  // הגדרת השאילתה לשליפת ספקים
  const sql = "SELECT id,supplier_name, company_name FROM suppliers";

  // ביצוע השאילתה וטיפול בתוצאות
  db.query(sql, (err, results) => {
    if (err) {
      console.error("שגיאה בשליפת ספקים:", err);
      return res.status(500).json({ message: "שגיאה בשרת" });
    }
    res.status(200).json({ suppliers: results });
  });
});

// פעולה עבור אחזור מוצרים המשווקים ע"י ספק מסוים
router.get("/:supplierId/products", (req, res) => {
  const supplierId = req.params.supplierId; // שליפת מזהה ספק

  // הגדרת השאילתה לשליפת המוצרים של הספק
  const sql = `SELECT id, product_name, price, min_quantity 
                 FROM supplier_products 
                 WHERE supplier_id = ?`;

  // ביצוע השאילתה בפועל וטיפול בתוצאות
  db.query(sql, [supplierId], (err, results) => {
    if (err) {
      console.error("שגיאה בשליפת מוצרים:", err);
      return res.status(500).json({ message: "שגיאה בשרת" });
    }
    res.status(200).json({ products: results });
  });
});

// פעולה עבור רישום ספק חדש למערכת
router.post("/register", (req, res) => {
  const { company_name, phone_num, supplier_name, products } = req.body; // חילוץ פרטי הספק

  // בדיקה שכל השדות הדרושים התקבלו
  if (
    !company_name ||
    !phone_num ||
    !supplier_name ||
    !Array.isArray(products) ||
    products.length === 0
  ) {
    return res
      .status(400)
      .json({ message: "נא למלא את כל השדות ולצרף רשימת מוצרים" });
  }

  // הגדרת שאילתה להכנסת פרטי ספק
  const insertSupplier = `
      INSERT INTO suppliers (company_name, phone_num, supplier_name)
      VALUES (?, ?, ?)
    `;

  // ביצוע השאילתה בפועל
  db.query(
    insertSupplier,
    [company_name, phone_num, supplier_name],
    (err, result) => {
      if (err) {
        console.error("שגיאה ברישום ספק:", err);
        return res.status(500).json({ error: "שגיאה ברישום ספק" });
      }

      const supplierId = result.insertId; // חילוץ מזהה ספק שנוצר

      // הגדרת שאילתה להכנסת המוצרים של הספק החדש
      const insertProducts = `
          INSERT INTO supplier_products (supplier_id, product_name, price, min_quantity)
          VALUES ?
        `;

      // הגדרת רשימת המוצרים להכנסה
      const productValues = products.map((p) => [
        supplierId,
        p.product_name,
        p.price,
        p.min_quantity,
      ]);

      // ביצוע השאילתה בפועל
      db.query(insertProducts, [productValues], (err2) => {
        if (err2) {
          console.error("שגיאה בהוספת מוצרים:", err2);
          return res
            .status(500)
            .json({ error: "הספק נרשם בהצלחה אבל יש שגיאה בהוספת מוצרים" });
        }

        // שליפה של פרטי הספק החדש
        const getSupplier = `SELECT * FROM suppliers WHERE id = ?`;
        db.query(getSupplier, [supplierId], (err3, rows) => {
          if (err3) {
            console.error("שגיאה בשליפת פרטי הספק:", err3);
            return res.status(500).json({ error: "שגיאה בשליפת הספק" });
          }

          res.status(201).json({
            message: "הספק נרשם בהצלחה עם מוצריו",
            supplier: rows[0], // החזרת פרטי הספק החדש
          });
        });
      });
    }
  );
});

// פעולת התחברות של ספק
router.post("/login", (req, res) => {
  const { supplier_name, phone_num } = req.body; // חילוץ פרטי התחברות של ספק

  // בדיקה שהשדות סופקו
  if (!supplier_name || !phone_num) {
    return res.status(400).json({ message: "יש להזין שם נציג ומספר טלפון" });
  }

  // הגדרת שאילתה לשליפת הספק 
  const sql = `SELECT * FROM suppliers WHERE supplier_name = ? AND phone_num = ?`;

  // ביצוע השאילתה בפועל וטיפול בתוצאות
  db.query(sql, [supplier_name, phone_num], (err, results) => {
    if (err) return res.status(500).json({ error: "שגיאה בבדיקת ספק" });

    if (results.length === 0) {
      return res.status(404).json({ message: "ספק לא נמצא" });
    }

    res.status(200).json({ message: "הכניסה בוצעה בהצלחה ", supplier: results[0] });
  });
});

// פעולה עבור אחזור הזמנות של ספק מסוים
router.get("/:supplierId/orders", (req, res) => {
  const supplierId = req.params.supplierId; // חילוץ מזהה ספק

  // הגדרת שאילתה לאחזור הזמנות של ספק כולל פרטי הזמנה 
  const sql = `
    SELECT 
      o.id AS order_id, 
      o.status, 
      o.created_at, 
      oi.quantity,
      sp.id AS product_id,
      sp.product_name, 
      sp.price, 
      sp.min_quantity
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN supplier_products sp ON oi.product_id = sp.id
    WHERE o.supplier_id = ?
    ORDER BY o.created_at DESC
  `;

  // ביצוע השאילתה בפועל ועיבוד תוצאות
  db.query(sql, [supplierId], (err, results) => {
    if (err) {
      console.error("שגיאה בשליפת הזמנות:", err);
      return res
        .status(500)
        .json({ error: "שגיאה בשרת", details: err.message });
    }

    const allOrders = {};

    // המרת תוצאות השאילתה לפורמט הרצוי
    // עבור כל תוצאה ניצור רשימה של פריטים
    results.forEach((row) => {
      if (!allOrders[row.order_id]) {
        allOrders[row.order_id] = {
          order_id: row.order_id,
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

    // המרה של המילו למערך ושליחת התגובה
    const formattedOrders = Object.values(allOrders);
    res.status(200).json({ orders: formattedOrders });
  });
});

// פעולה עבור אישור הזמנה ע"י ספק / שינוי סטטוס לבתהליך
router.post("/orders/:orderId/approve", (req, res) => {
  const orderId = req.params.orderId; // חילוץ מזהה הזמנה

  // הגדרת שאילתת עדכון
  const sql = `UPDATE orders SET status = 'בתהליך' WHERE id = ?`;

  // ביצוע השאילתה בפועל ועיבוד התוצאות
  db.query(sql, [orderId], (err, result) => {
    if (err) {
      console.error("שגיאה באישור הזמנה:", err);
      return res.status(500).json({ error: "שגיאה בעדכון סטטוס" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "הזמנה לא נמצאה" });
    }

    res.status(200).json({ message: "הזמנה אושרה בהצלחה" });
  });
});

module.exports = router;
