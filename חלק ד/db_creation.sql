-- יצירת בסיס נתונים עבור ניהול מכולת
-- CREATE DATABASE grocery_db;

USE grocery_db;
-- יצירת טבלת ספקים המספקים מוצרים לחנות
CREATE TABLE suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY, -- מספר מזהה של ספק
    company_name VARCHAR(20) NOT NULL, -- שם החברה אליה משתייך הספק
    phone_num VARCHAR(10), -- מספר טלפון של הספק
    supplier_name VARCHAR(15) -- שם הספק / נציג החברה
);

-- יצירת טבלה עבור רשימת סחורות שכל ספק מציע
CREATE TABLE supplier_products (
    id INT AUTO_INCREMENT PRIMARY KEY, -- מזהה מוצר
    supplier_id INT NOT NULL, -- מזהה ספק 
    product_name VARCHAR(20) NOT NULL, -- שם מוצר
    price DECIMAL(6, 2) NOT NULL, -- מחיר לפריט
    min_quantity INT NOT NULL, -- כמות מינימלית לרכישה ממוצר זה
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)  
);

-- יצירת טבלת הזמנות מוצרים שמזמין בעל המכולת מספקים
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY, -- מזהה הזמנה
    supplier_id INT NOT NULL, -- מזהה ספק
    status ENUM('ממתינה', 'בתהליך', 'הושלמה') DEFAULT 'ממתינה', -- מצב ההזמנה
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- תאריך יצירת ההזמנה
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

-- יצירת טבלה שבה יש פירוט של המוצרים המוזמנים בכל הזמנה
CREATE TABLE order_items (
    order_id INT NOT NULL, -- מזהה הזמנה
    product_id INT NOT NULL, -- מזהה מוצר
    quantity INT NOT NULL, -- כמות יחידות שהוזמנו מהמוצר
    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES supplier_products(id)
);

-- יצירת טבלה עבור בעל המכולת
CREATE TABLE grocery_owners (
  id INT AUTO_INCREMENT PRIMARY KEY, -- מזהה 
  username VARCHAR(15) NOT NULL UNIQUE, -- שם משתמש 
  password VARCHAR(15) NOT NULL -- סיסמה 
);
