const mysql = require('mysql2');

// הגדרת חיבור לבסיס הנתונים 
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'fullstack',
    database: 'grocery_db'
});

// חיבור לבסיס הנתונים בפועל
db.connect(err => {
    if (err) {
        console.error('שגיאה בחיבור לבסיס הנתונים :', err);
    } else {
        console.log('החיבור לבסיס הנתונים בוצע בהצלחה');
    }
});

module.exports = db;