using ClosedXML.Excel;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Times
{
    // סעיף ב שאלה 2
    // עיבוד נתוני קובץ האקסל בחלקים
    // ביצוע חישובים על כל יחידה ואיחוד התוצאות
    internal class SectionB_Q2
    {
        /// <summary>
        /// פונקציה המשמשת לפיצול קובץ המדידות לחלקים קטנים יותר לפי ימים
        /// ושמירה של נתוני כל יום בקובץ נפרד 
        /// </summary>
        /// <param name="filePath">נתיב קובץ אקסל המכיל את כל הנתונים</param>
        /// <param name="splitFolder">תיקיית היעד שבה נשמור את  תתי הקבצים </param>
        public static void SplitFileByDays(string filePath, string splitFolder)
        {
            // מילון שבו נשמור את נתוני כל יום ברשומה נפרדת 
            // לכל יום נשמור רשימה של צמדי תאריך ושעה וערך מדידה
            Dictionary<DateTime, List<(DateTime, double)>> dailyData = new Dictionary<DateTime, List<(DateTime, double)>>();

            // בדיקה האם תיקיית היעד לשמירת תתי הקבצים קיימת
            if (!Directory.Exists(splitFolder))
                // יצירה של תיקיית היעד במקרה הצורך
                Directory.CreateDirectory(splitFolder);

            // שימוש בקובץ המדידות 
            using (var workbook = new XLWorkbook(filePath))
            {
                var worksheet = workbook.Worksheet(1);
                var rows = worksheet.RowsUsed().Skip(1); // דילוג על שורת הכותרות

                // מעבר על כל אחת מהשורות בקובץ
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

                    // חילוץ תאריך המדידה ללא שעה
                    DateTime dayStart = timestamp.Date;

                    // בדיקה האם תאריך זה כבר קיים
                    if (!dailyData.ContainsKey(dayStart))
                        // אם לא נוסיף רשומה חדשה עבורו
                        dailyData[dayStart] = new List<(DateTime, double)>();

                    // הוספת ערכי המדידה הנוכחית כולל תאריך ושעה מדויקת למילון
                    dailyData[dayStart].Add((timestamp, value));
                }
            }


            // מעבר על כל הרשומות היומיות
            // עבור שמירת הנתונים היומיים בקבצי אקסל נפרדים
            foreach (var entry in dailyData)
            {
                DateTime day = entry.Key; // חילוץ יום המדידה
                string dailyFilePath = Path.Combine(splitFolder, $"{day:yyyy-MM-dd}.xlsx"); // הגדרת נתיב לשמירת הקובץ

                // יצירת האקסל
                using (var dailyWorkbook = new XLWorkbook())
                {
                    // יצירת הגיליון והגדרת העמודות
                    var dailyWorksheet = dailyWorkbook.AddWorksheet("Data");
                    dailyWorksheet.Cell(1, 1).Value = "Timestamp";
                    dailyWorksheet.Cell(1, 2).Value = "Value";

                    int row = 2;
                    
                    // הוספת ערכי המדידות עם תאריך ושעה לקובץ
                    foreach (var (timestamp, value) in entry.Value)
                    {
                        dailyWorksheet.Cell(row, 1).Value = timestamp.ToString("dd/MM/yyyy HH:mm:ss");
                        dailyWorksheet.Cell(row, 2).Value = value;
                        row++;
                    }

                    // שמירת הקובץ
                    dailyWorkbook.SaveAs(dailyFilePath);
                }
            }

        }

        /// <summary>
        ///  פונקצהי המשמשת לחישוב ממוצעי ערכי מדידות שעתיים לכל יום ומיזוגם לקובץ אחד
        /// </summary>
        /// <param name="splitFolder">התיקיה המכילה את תתי הקבצים של הנתונים  לפי ימים</param>
        /// <param name="destPath">תיקיית היעד שבה נשמור את הממוצעים של כל הימים וכל השעות</param>
        public static void CombineDailyFiles(string splitFolder, string destPath)
        {
            // רשימה עבור שמירת  התוצאות של ממוצעי ערכים שעתיים לכל הימים יחד 
            List<(DateTime, double)> mergedResults = new List<(DateTime, double)>();

            // מעבר על כל אחד מהקבצים המכילים מדידות של יום מסוים
            foreach (var dailyFile in Directory.GetFiles(splitFolder, "*.xlsx"))
            {
                // פתיחת הקובץ היומי
                using (var dailyWorkbook = new XLWorkbook(dailyFile))
                {
                    var dailyWorksheet = dailyWorkbook.Worksheet(1);
                    var rows = dailyWorksheet.RowsUsed().Skip(1); // דילוג על שורת הכותרות

                    // מילון עבור שמירת נתוני מדידות של יום מסוים
                    Dictionary<DateTime, List<double>> dailyHourlyData = new Dictionary<DateTime, List<double>>();

                    // מעבר על כל השורות הקובץ היומי
                    foreach (var row in rows)
                    {
                        string timestampText = row.Cell(1).GetValue<string>().Trim(); // חילוץ תאריך ושעה
                        string valueText = row.Cell(2).GetValue<string>().Trim(); // חילוץ ערך מדידה

                        // בדיקות תקינות והמרת סוגי ערכים
                        // בדיקה שהתאריך בפורמט הנכון
                        if (!DateTime.TryParseExact(timestampText, "dd/MM/yyyy HH:mm:ss",
                            CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime timestamp))
                            continue;
                        
                        // בדיקה שערך המדידה הוא מספר עשרוני 
                        if (!double.TryParse(valueText, NumberStyles.Any, CultureInfo.InvariantCulture, out double value) || double.IsNaN(value))
                            continue;

                        // הגדרת זמן המדידה לפי שעה עגולה
                        DateTime hourStart = new DateTime(timestamp.Year, timestamp.Month, timestamp.Day, timestamp.Hour, 0, 0);

                        // בדיקה האם זמן זה קיים כבר במילון
                        if (!dailyHourlyData.ContainsKey(hourStart))
                        {
                            // אם לא נוסיף עבורו רשומה
                            dailyHourlyData[hourStart] = new List<double>();
                        }
                        // הוספת ערך המדידה במקום המתאים
                        dailyHourlyData[hourStart].Add(value);
                    }

                    // מעבר על כל הרשומות המכילות מדידות לפי שעות לפי ימים
                    foreach (var entry in dailyHourlyData)
                    {
                        // חישוב ממוצע ערכי מדידות עבור כל שעה בכל תאריך
                        mergedResults.Add((entry.Key, Math.Round(entry.Value.Average(),2)));
                    }
                }
            }

            // יצירת קובץ אקסל חדש עבור שמירת התוצאות
            using (var finalWorkbook = new XLWorkbook())
            {
                // הוספת גיליון
                var finalWorksheet = finalWorkbook.AddWorksheet("CombinedData");

                // הוספת כותרות לעמודות
                finalWorksheet.Cell(1, 1).Value = "Timestamp";
                finalWorksheet.Cell(1, 2).Value = "Average Value";

                int row = 2;
                // מעבר על כל הרשומות ברשימת התוצאות המאוחדות  
                foreach (var entry in mergedResults.OrderBy(e => e.Item1))
                {
                    // הוספת הערכים לקובץ
                    finalWorksheet.Cell(row, 1).Value = entry.Item1.ToString("dd/MM/yyyy HH:00:00");
                    finalWorksheet.Cell(row, 2).Value = entry.Item2;
                    row++;
                }

                // שמירת קובץ התוצאות המאוחדות
                finalWorkbook.SaveAs(destPath);
            }
        }

        public static void WithSplit(string filePath)
        {
            // הגדרת נתיב לתיקיה שמכילה את תתי הקבצים היומיים
            string dirPath = Path.GetDirectoryName(filePath);
            string splitFolder = Path.Combine(dirPath, "SplitDailyFiles");

            // פיצול מדידות לקבצים נפרדים לפי ימים
            SplitFileByDays(filePath, splitFolder);

            // הגדרת נתיב לשמירת התוצאות
            string destPath = Path.Combine(dirPath, "hourly_data_with_split.xlsx");

            // חישוב ממוצעי ערכים שעתיים עבור כל יום בנפרד ואיחוד התוצאות לקובץ אחד
            CombineDailyFiles(splitFolder, destPath);

        }
    }
}
