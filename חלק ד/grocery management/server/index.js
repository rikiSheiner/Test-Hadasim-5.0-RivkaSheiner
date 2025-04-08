const cors = require('cors');
const express = require('express');
const supplierRoutes = require('./routes/supplierRoutes');
const groceryOwnerRoutes = require('./routes/groceryOwnerRoutes');

const app = express(); // אוביקט ניהול האפליקציה

app.use(cors()); // אפשור גישות לשרת

app.use(express.json()); // עבודה עם JSON

// הגדרת נתיבים לאפליקציה
app.use('/suppliers', supplierRoutes);
app.use('/owner', groceryOwnerRoutes);

// הפעלת השרת כדי שיוכל להאזין לבקשות 
app.listen(3000, () => {
    console.log('השרת רץ על פורט 3000');
});

