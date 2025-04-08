using ClosedXML.Excel;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Times
{
    //סעיף ב שאלה 1
    // עיבוד נתוני קובץ האקסל כיחידה אחת 
    // ללא פיצול לחלקים
    internal class SectionB_Q1
    {
        /// <summary>
        /// פונקציה שמקבלת נתיב לקובץ שמכיל חתימות זמן וערכים של מדידות שהתבצעו
        /// ומוצאת עבור כל שעה עגולה בכל יום את ערכי המדידות החוקיים שהתבצעו בזמן זה
        /// </summary>
        /// <param name="filePath">נתיב הקובץ של המדידות</param>
        /// <returns>Dictionary<DateTime, List<double>> מילון שבו המפתחות הם תאריכים והערכים הם רשימות ערכי מדידות</returns>
        public static Dictionary<DateTime, List<double>> ExtractHourlyData(string filePath)
        {
            // הגדרת מילון עבור שמירת הערכים שנמדדו עבור כל נקודת זמן שעתית
            Dictionary<DateTime, List<double>> hourlyData = new Dictionary<DateTime, List<double>>();

            // שימוש בקובץ המדידות
            using (var workbook = new XLWorkbook(filePath))
            {
                var worksheet = workbook.Worksheet(1);
                var rows = worksheet.RowsUsed().Skip(1); // דילוג על שורת הכותרות

                // מעבר על כל השורות בקובץ
                foreach (var row in rows)
                {
                    string timestampText = row.Cell(1).GetValue<string>().Trim(); // חילוץ חתימת זמן 
                    string valueText = row.Cell(2).GetValue<string>().Trim(); // חילוץ הערך הנמדד

                    // בדיקות תקינות

                    // בדיקה האם התאריך בפורמט הרצוי
                    if (!DateTime.TryParseExact(timestampText, "dd/MM/yyyy HH:mm:ss",
                        CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime timestamp))
                    {
                        continue;
                    }

                    // בדיקה האם הערך הנמדד הוא מספר 
                    if (!double.TryParse(valueText, NumberStyles.Any, CultureInfo.InvariantCulture, out double value))
                    {
                        continue;
                    }

                    // בדיקה האם הערך הנמדד הוא בכלל מספר תקין
                    if (double.IsNaN(value))
                    {
                        continue;
                    }

                    // שינוי התאריך לתאריך עם שעה עגולה
                    DateTime hourStart = new DateTime(timestamp.Year, timestamp.Month, timestamp.Day, timestamp.Hour, 0, 0);

                    // שמירת הערכים לפי שעה
                    // אם התאריך והשעה הזו לא קיימים עדיין ניצור רשימה חדשה
                    if (!hourlyData.ContainsKey(hourStart))
                    {
                        hourlyData[hourStart] = new List<double>();
                    }
                    // נוסיף את ערך המדידה לשעה המתאימה
                    hourlyData[hourStart].Add(value);
                }
            }

            return hourlyData;
        }


        /// <summary>
        /// הפוקנציה מקבלת רשימות ערכים שנמדדו עבור כל תאריך ושעה 
        /// מחשבת עבור כל תארי ושעה את ממוצע ערכי המדידות 
        /// ושומרת את התוצאות בקובץ אקסל
        /// </summary>
        /// <param name="hourlyData">מילון שבו המפתחות הם תאריכים והערכים הם רשימות ערכי מדידות</param>
        /// <param name="destPath">נתיב לשמירת קובץ התוצאות</param>
        public static void CalcSaveHourlyAvg(Dictionary<DateTime, List<double>> hourlyData, string destPath)
        {
            // ניצור קובץ אקסל חדש לשמירת התוצאות
            using (var workbook = new XLWorkbook())
            {
                var worksheet = workbook.AddWorksheet("HourlyData");

                // נוסיף לקובץ כותרות
                worksheet.Cell(1, 1).Value = "Timestamp";
                worksheet.Cell(1, 2).Value = "Average Value";

                //  נוסיף את הנתונים לקובץ
                int row = 2; // החל משורה 2 כדי לדלג על שורת כותרות
                // לכל אחת מחתימות הזמן ממויינות לפי תאריך ושעה
                foreach (var sample in hourlyData.OrderBy(e => e.Key))
                {
                    // נוסיף את התאריך והשעה
                    worksheet.Cell(row, 1).Value = sample.Key.ToString("dd/MM/yyyy HH:00:00");
                    // נחשב ונוסיף את ממוצע הערכים בזמן זה
                    worksheet.Cell(row, 2).Value = Math.Round(sample.Value.Average(), 2);
                    row++;
                }


                // נשמור את קובץ הממוצעים
                workbook.SaveAs(destPath);
            }
        }

        public static void NoSplit(string filePath)
        {
            // חילוץ ערכי מדידות שעתיות מקובץ האקסל
            Dictionary<DateTime, List<double>> hourlyData = ExtractHourlyData(filePath);

            // הגדרת נתיב יעד לשמירת התוצאות 
            string directoryPath = System.IO.Path.GetDirectoryName(filePath);
            string destPath = System.IO.Path.Combine(directoryPath, "hourly_data_output_no_split.xlsx");

            // חישוב ממוצעים שעתיים ושמירת ההתוצאות בקובץ אקסל
            CalcSaveHourlyAvg(hourlyData, destPath);
        }


    }
}
