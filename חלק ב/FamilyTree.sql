
-- חלק ב 
-- תרגיל 1 - הקמת עץ משפחה

-- שלב א
-- יצירת טבלה המייצגת עץ משפחה
-- לכל אדם נשמור את הקרובים אליו וסוג הקשר בינהם
CREATE TABLE FamilyTree (
	Person_Id INT NOT NULL,	-- מספר מזהה של האדם
	Relative_Id INT NOT NULL,  -- מספר מזהה של קרוב המשפחה
	Connection_Type VARCHAR(10) NOT NULL, -- סוג הקשר בינהם - בן / בת / אב / אם / אח / אחות / בן או בת זוג
	PRIMARY KEY(Person_Id, Relative_Id)	-- המפתח הראשי מורכב ממזהה אדם ומזהה קרוב כי  לא יכול להיות יותר מקשר אחד  בינהם 
);

-- שלב ב 
-- מילוי הטבלה בנתונים על סמך הטבלה הנתונה
-- אלו השדות ?erson_Id | ?ersonal_?ame | Family_Name | Gender | Fath?r_Id | Mother_Id | Spou?e_Id
-- נניח כי שם הטבלה הוא PersonalInfo

--  נוסיף לטבלה שיצרנו נתונים 

-- 1. קשר אב ניצור לפי מזהה איש ומזהה אב
INSERT INTO FamilyTree (Person_Id, Relative_Id, Connection_Type)
SELECT Person_Id, Father_Id, 'אב'
FROM PersonalInfo
WHERE Father_Id IS NOT NULL;


-- 2. קשר אם ניצור לפי מזהה איש ומזהה אם
INSERT INTO FamilyTree (Person_Id, Relative_Id, Connection_Type)
SELECT Person_Id, Mother_Id, 'אם'
FROM PersonalInfo
WHERE Mother_Id IS NOT NULL;


-- 3. קשר בת ניצור לפי מזהה אב  או אם ומזהה איש שמגדרו נקבה
-- 4. קשר בן ניצור לפי מזהה אב או אם ומזהה איש שמגדרו זכר

INSERT INTO FamilyTree (Person_Id, Relative_Id, Connection_Type)
SELECT Mother_Id, Person_Id, CASE WHEN  Gender = 'נקבה' THEN 'בת' ELSE 'בן' END
FROM PersonalInfo
WHERE Mother_Id IS NOT NULL;

INSERT INTO FamilyTree (Person_Id, Relative_Id, Connection_Type)
SELECT Father_Id, Person_Id, CASE WHEN  Gender = 'נקבה' THEN 'בת' ELSE 'בן' END
FROM PersonalInfo
WHERE Father_Id IS NOT NULL;


-- 5. קשר אח ניצור לפי מזהה אב או מזהה אם משותף וכן מגדר זכר
-- 6. קשר אחות ניצור לפי מזהה אב או מזהה אם משותף וכן מגדר נקבה
INSERT INTO FamilyTree (Person_Id, Relative_Id, Connection_Type)
SELECT p1.Person_Id, p2.Person_Id, CASE WHEN p2.Gender='נקבה' THEN 'אחות' ELSE 'אח' END 
FROM PersonalInfo p1 
INNER JOIN PersonalInfo p2 
ON p1.Father_Id = p2.Father_Id OR p1.Mother_Id = p2.Mother_Id
WHERE p1.Person_Id <> p2.Person_Id;


-- 7. קשר בן זוג ניצור לפי מזהה בן זוג ומגדר של בן הזוג זכר
-- 8. קשר בת זוג ניצור לפי מזהה בן זוג ומגדר של בן הזוג נקבה
INSERT INTO FamilyTree (Person_Id, Relative_Id, Connection_Type)
SELECT p1.Person_Id, p1.Spouse_Id, CASE WHEN p2.Gender='נקבה' THEN 'בת זוג' ELSE 'בן זוג' END
FROM PersonalInfo p1 
INNER JOIN PersonalInfo p2 
ON p1.Spouse_Id = p2.Person_Id 
WHERE p1.Spouse_Id IS NOT NULL;


-- תרגיל 2 
-- השלמת בן או בת זוג
-- במקרה של נתונים חלקיים / נתון קשר חד צדדי בלבד

-- נמצא את בני או בת הזוג שבהם הנתונים חלקיים ולא הדדיים
-- ונוסיף את הקשר ההפוך כדי שהנתונים יהיו מלאים


-- הרעיון של מה שאנחנו מבצעים הוא
-- קודם כל מנסים לצרף 2 רשומות תואמות של עץ משפחה כדי לבדוק האם יש קשר זוגי דו צדדי
-- אם בצירוף קיבלנו מזהה איש חסר ערך אזי הצירוף לא עבד ומדובר בקשר חד צדדי
-- במקרה זה נרצה להוסיף את הרושמה החסרה בכיוון ההפוך
INSERT INTO FamilyTree(Person_Id, Relative_Id, Connection_Type)
SELECT ft.Relative_Id AS Person_Id,  ft.Person_Id AS Relative_Id,  
		CASE WHEN p.Gender = 'נקבה' THEN 'בת זוג' ELSE 'בן זוג' END
FROM FamilyTree ft
INNER JOIN PersonalInfo p ON ft.Relative_Id = p.Person_Id -- צירוף לטבלת אנשים כדי לדעת מגדר במידה ונצטרך להוסיף
LEFT JOIN FamilyTree ft2  -- צירוף לטבלת עץ משפחה כדי לבדוק שהקשר חד צדדי ולא קיים בכיוון השני
ON ft.Relative_Id = ft2.Person_Id  
   AND ft.Person_Id = ft2.Relative_Id
   AND ft2.Connection_Type IN ('בן זוג', 'בת זוג')
WHERE ft.Connection_Type IN ('בן זוג', 'בת זוג')  -- כאשר הקשר זוגי 
	AND ft2.Person_Id IS NULL; -- כאשר המזהה איש NULL אזי אין קשר הפוך
