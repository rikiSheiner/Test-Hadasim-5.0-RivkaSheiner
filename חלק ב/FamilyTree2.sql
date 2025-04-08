
-- חלק ב 
-- תרגיל 1 - הקמת עץ משפחה

-- שלב א
-- יצירת טבלה המייצגת עץ משפחה
-- לכל אדם נשמור את הקרובים אליו וסוג הקשר בינהם
CREATE TABLE FamilyTree (
	Person_Id INT NOT NULL,					-- מספר מזהה של האדם
	Relative_Id INT NOT NULL,				-- מספר מזהה של קרוב המשפחה
	Connection_Type VARCHAR(10) NOT NULL,	-- סוג הקשר בינהם - בן / בת / אב / אם / אח / אחות / בן או בת זוג
	PRIMARY KEY(Person_Id, Relative_Id)		-- המפתח הראשי מורכב ממזהה אדם ומזהה קרוב כי  לא יכול להיות יותר מקשר אחד  בינהם 
);

-- שלב ב 
-- מילוי הטבלה בנתונים על סמך הטבלה הנתונה
-- אלו השדות Ρerson_Id | Рersonal_Νame | Family_Name | Gender | Fathеr_Id | Mother_Id | Spouѕe_Id
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

-- שלב א 
-- נמצא את בני או בת הזוג שבהם הנתונים חלקיים ולא הדדיים


-- שלב ב
-- נוסיף את הקשר ההפוך כדי שהנתונים יהיו מלאים
