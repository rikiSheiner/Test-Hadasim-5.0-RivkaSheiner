using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Logs
{
    internal class SectionA
    {
        /// <summary>
        /// פונקציה לפיצול קובץ טקסט ענק לחלקים קטנים יותר
        /// </summary>
        /// <param name="inputFilePath">נתיב קובץ הטקסט המקורי</param>
        /// <param name="linesPerFile">מספר השורות שיכיל כל קובץ קטן</param>
        private static void SplitFile(string inputFilePath, int linesPerFile)
        {
            int fileIndex = 1; // אינדקס של תת קובץ נוכחי
            List<string> lines = new List<string>(); // רשימת שורות עבור תת קובץ

            string baseName = Path.GetFileNameWithoutExtension(inputFilePath); // שם הקובץ המקורי ללא סיומת
            string directory = Path.GetDirectoryName(inputFilePath); // נתיב לקובץ המקורי

            // מעבר על כל השורות בקובץ המקורי ושמירתן בתתי קבצים
            foreach (var line in File.ReadLines(inputFilePath))
            {
                // הוספת השורה הנוכחית לרשימת השורות של תת קובץ
                lines.Add(line);
                // שמירת השורות בתת קובץ כאשר הגענו לכמות הרצויה
                if (lines.Count >= linesPerFile)
                {
                    // קביעת שם תת הקובץ 
                    string newFileName = Path.Combine(directory, $"{baseName}_part{fileIndex++}.txt");
                    // כתיבת השורות לתת קובץ
                    File.WriteAllLines(newFileName, lines);
                    // ריקון רשימת השורות / הסרת השורות שכבר כתבנו
                    lines.Clear();
                }
            }

            //  אם יש שורות שלא נכתבו
            if (lines.Count > 0)
            {
                // שמירת השורות שנותרו בקובץ נוסף
                string newFileName = Path.Combine(directory, $"{baseName}_part{fileIndex}.txt");
                File.WriteAllLines(newFileName, lines);
            }
        }


        /// <summary>
        /// פונקציית עזר לחילוץ קוד שגיאה מתוך שורה בקובץ
        /// </summary>
        /// <param name="logLine">תוכן השורה</param>
        /// <returns>מחרוזת המייצגת את קוד השגיאה</returns>
        private static string ExtractErrorCode(string logLine)
        {
            // הפרדה בין חתימת זמן לקוד שגיאה
            var parts = logLine.Split("Error: ");

            // וידוא שיש קוד שגיאה
            if (parts.Length > 1)
            {
                // חילוץ קוד השגיאה ע"י הסרת רווחים וגרשיים מיותרים
                string errorCode = parts[1].Trim(' ', '"');
                return errorCode;
            }

            return null;
        }


        /// <summary>
        /// פונקציה עבור ספירת שכיחות שגיאות בקובץ מסוים 
        /// </summary>
        /// <param name="filePath">נתיב הקובץ לספירה</param>
        /// <returns>מילון שבו המפתחות הם קודי שגיאות והערכים הם השכיחויות שלהם</returns>
        private static Dictionary<string, int> CountErrorsInFile(string filePath)
        {
            // הגדרת מילון לשמירת שגיאות ושכיחויות 
            Dictionary<string, int> errorCounts = new Dictionary<string, int>();

            // עבור כל שורה בקובץ
            foreach (var line in File.ReadLines(filePath))
            {
                // נחלץ קוד שגיאה
                var errorCode = ExtractErrorCode(line);
                if (errorCode != null)
                {
                    // אם קוד השגיאה כבר קיים
                    if (errorCounts.ContainsKey(errorCode))
                    {
                        // נעדכן את  השכיחות שלו
                        errorCounts[errorCode]++;
                    }
                    else
                    {
                        // אחרת נוסיף את קוד השגיאה החדש עם שכיחות 1
                        errorCounts[errorCode] = 1;
                    }
                }
            }

            return errorCounts;
        }

        /// <summary>
        /// פונקציה עבור מיזוג שכיחויות שגיאות בכל תתי הקבצים
        /// </summary>
        /// <param name="errorCountParts">רשימה של מילונים של שכיחויות שגיאות בכל תת קובץ</param>
        /// <returns>מילון המסכם את קודי השגיאות והשכיחוית שלהם בכל הקבצים</returns>
        private static Dictionary<string, int> CombineErrorCounts(IEnumerable<Dictionary<string, int>> errorCountParts)
        {
            // מילון עבור שמירת קודי שגיאות ושכיחויות בכל הקבצים יחד
            var mergedErrorCounts = new Dictionary<string, int>();

            // נעבור על כל מילון שכיחיות של כל תת קובץ
            foreach (var part in errorCountParts)
            {
                // נעבור על כל שגיאה שיש במילון
                foreach (var error in part)
                {
                    //  נבדוק האם השגיאה הזו קיימת כבר במילון הממוזג
                    if (mergedErrorCounts.ContainsKey(error.Key))
                    {
                        // אם כן נגדיל את המונה השכיחויות בהתאם לערך השכיחות הנוכחי
                        mergedErrorCounts[error.Key] += error.Value;
                    }
                    else
                    {
                        // אחרת נוסיף את השגיאה למילון עם השכיחות המתאימה
                        mergedErrorCounts[error.Key] = error.Value;
                    }
                }
            }

            return mergedErrorCounts;
        }

        /// <summary>
        /// פונקציה עבור מציאת השגיאות השכיחות ביותר 
        /// </summary>
        /// <param name="mergedErrorCounts">מילון המסכם את שכיחויות כל השגיאות בכל הקבצים</param>
        /// <param name="topN">כמות קודי שגיאה שכיחים רצויה </param>
        /// <returns>רשימה של קודי שגיאה שכיחים עם  השכיחות שלהם</returns>
        private static List<KeyValuePair<string, int>> GetTopErrors(Dictionary<string, int> mergedErrorCounts, int topN)
        {
            return mergedErrorCounts
                .OrderByDescending(x => x.Value) // סידור בסדר יורד לפי ערך שכיחות
                .Take(topN) // לקיחת N איברים ראשונים שכיחים ביותר
                .ToList(); // המרה לרשימה
        }

        /// <summary>
        /// פונקציה עבור ביצוע כל התהליך
        /// ביצוע כל המשימות הנדרשות שלב אחרי שלב
        /// </summary>
        /// <param name="inputFilePath">נתיב הקובץ שבו מתועדות השגיאות</param>
        /// <param name="topN">כמות שגיאות שכיחות ביותר רצויה</param>
        public static void ProcessLogFile(string inputFilePath, int topN)
        {
            int linesPerFile = 100000; // כמות שורות בכל תת קובץ

            // 1. פיצול הקובץ לחלקים 
            SplitFile(inputFilePath, linesPerFile);

            // רשימת מילוני שכיחויות שגיאות בכל תת קובץ
            var errorCountParts = new List<Dictionary<string, int>>();

            // 2. מניית שכיחויות שגיאות לכל חלק 
            // מעבר על כל תת קובץ
            foreach (var part in Directory.GetFiles(Path.GetDirectoryName(inputFilePath), $"{Path.GetFileNameWithoutExtension(inputFilePath)}_part*.txt"))
            {
                // מניית שכיחויות שגיאות בתת קובץ
                var errorCounts = CountErrorsInFile(part);
                // הוספת מילון השכיחויות לרשימה  
                errorCountParts.Add(errorCounts);
            }


            // 3. מיזוג מילוני השכיחויות של תתי הקבצים למילון יחיד
            var mergedErrorCounts = CombineErrorCounts(errorCountParts);

            // 4. מציאת השגיאות השכיחות ביותר
            var topErrors = GetTopErrors(mergedErrorCounts, topN);

            // הדפסת התוצאה
            Console.WriteLine($"Top {topN} Errors:");
            foreach (var error in topErrors)
            {
                Console.WriteLine($"{error.Key}: {error.Value} times");
            }


        }
    }
}
