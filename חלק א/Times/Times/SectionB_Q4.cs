using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using ClosedXML.Excel;
using DocumentFormat.OpenXml.Vml;
using Parquet;
using Parquet.Data;
using Parquet.Schema;

namespace Times
{
    public class SectionB_Q4
    {
         /// <summary>
         /// פונקציה שמקבלת נתיב לקובץ PARQUET שמכיל ערכי מדידות 
         /// מחשבת ממוצעים שעתיים ושומרת את התוצאות בקובץ אקסל
         /// </summary>
         /// <param name="parquetFilePath"></param>
         /// <param name="destPath">נתיב הקובץ לשמירת התוצאות</param>
         /// <returns></returns>
        public static async Task ExtractHourlyDataParquet(string parquetFilePath, string destPath)
        {
            // קריאת הנתונים מהקובץ
            var rawData = await ReadParquetData(parquetFilePath);

            Console.WriteLine($"סה\"כ שורות לפני סינון: {rawData.Count}");

            // סינון נתונים חוקיים בלבד
            var validData = ValidateData(rawData);

            Console.WriteLine($"סה\"כ שורות אחרי סינון: {validData.Count}");


            // חישוב ממוצעים שעתיים ושמירת התוצאות בקובץ אקסל
            CalculateAndWriteHourlyAverage(validData, destPath);
        }

        /// <summary>
        /// פונקציה עבור קריאת נתונים מקובץ Parquet 
        /// </summary>
        /// <param name="parquetFilePath">נתיב הקובץ</param>
        /// <returns>Task<List<(object timestamp, object value)>> </returns>
        private static async Task<List<(object timestamp, object value)>> ReadParquetData(string parquetFilePath)
        {
            // רשימה עבור הנתונים
            var rawData = new List<(object timestamp, object value)>();

            using (Stream fileStream = File.OpenRead(parquetFilePath))
            using (var parquetReader = await ParquetReader.CreateAsync(fileStream))
            {
                // הדפסת סכמה - שמות עמודות וסוגים לצורך בדיקה
                var schema = parquetReader.Schema;

                Console.WriteLine("סכימת הקובץ:");
                foreach (var field in schema.GetDataFields())
                {
                    Console.WriteLine($"- Field: {field.Name}, Type: {field.ClrType}");
                }

                // בדיקה שהשדות הרלוונטיים - חתימת זמן וערך ממוצע- קיימים
                DataField timestampField = schema.GetDataFields()
                    .FirstOrDefault(f => f.Name.Equals("timestamp", StringComparison.OrdinalIgnoreCase));
                DataField valueField = schema.GetDataFields()
                    .FirstOrDefault(f => f.Name.Equals("mean_value", StringComparison.OrdinalIgnoreCase));

                // אם אחד מהשדות לא קיים יש בעיה 
                if (timestampField == null || valueField == null)
                {
                    Console.WriteLine("חסר שדה חתימת זמן או ערך");
                    return rawData;
                }

                // מעבר על כל השורות בקובץ בקבוצות
                for (int rowGroup = 0; rowGroup < parquetReader.RowGroupCount; rowGroup++)
                {
                    // שימוש בקבוצת שורות
                    using (ParquetRowGroupReader groupReader = parquetReader.OpenRowGroupReader(rowGroup))
                    {
                        try
                        {
                            // קריאת עמודות רלוונטיות
                            var timestampColumn = await groupReader.ReadColumnAsync(timestampField);
                            var valueColumn = await groupReader.ReadColumnAsync(valueField);

                            // המרה לערכים
                            var timestampData = (DateTime?[])timestampColumn.Data;
                            var valueData = (double?[])valueColumn.Data;

                            // מעבר על כל הערכים בקקבוצת השורות
                            for (int i = 0; i < timestampData.Length; i++)
                            {
                                // חילוץ ערכים של שורה נוכחית
                                var ts = timestampData[i];
                                var val = valueData[i];

                                // במידה והערכים תקינים ערכי השורה יתווספו למערך הנתונים
                                if (ts.HasValue && val.HasValue) 
                                    rawData.Add((ts.Value, val.Value));

                                else  
                                    Console.WriteLine("נתון חסר בשורה {i}");

                            }
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"קריאת נתונים נכשלה בקבוצת השורות: {ex.Message}");
                        }
                    }
                }
            }

            return rawData;
        }

        /// <summary>
        /// פונקציה עבור סינון נתונים חוקיים 
        /// </summary>
        /// <param name="rawData">מקבלת רשימה של זוגות ערכים - חתימת זמן וערך</param>
        /// <returns>List<(DateTime timestamp, double value)> רשימה של ערכים חוקיים בלבד </returns>
        private static List<(DateTime timestamp, double value)> ValidateData(List<(object timestamp, object value)> rawData)
        {
            // הגדרת רשימה של ערכים חוקיים
            var validData = new List<(DateTime timestamp, double value)>();

            // מעבר על כל שורות הנתונים
            foreach (var row in rawData)
            {
                // בדיקה האם ערכי השורה הנוכחית תקינים
                if (row.timestamp is DateTime dt && row.value is double val && !double.IsNaN(val))
                {
                    // הוספת הערכים לרשימת ערכים חוקיים
                    validData.Add((dt, val));
                }
                else
                {
                    Console.WriteLine("נתונים לא חוקיים");
                }
            }

            // הסרת שורות כפולות (בעלות חתימת זמן וערך זהים)
            validData = validData
                .Distinct()
                .ToList();

            return validData;
        }

        /// <summary>
        /// הפונקציה מחשבת ממוצעים שעתיים וכותבת את התוצאות לקובץ אקסל
        /// </summary>
        /// <param name="data">הנתונים החוקיים שחולצו מהקובץ</param>
        /// <param name="destPath">נתיב של הקובץ שבו שומרים את התוצאות</param>
        private static void CalculateAndWriteHourlyAverage(List<(DateTime timestamp, double value)> data, string destPath)
        {
            // קיבוץ נתונים לפי תאריך ושעת מדידה וחישוב ממוצעים שעתיים
            var hourlyGroups = data
                .GroupBy(d => new DateTime(d.timestamp.Year, d.timestamp.Month, d.timestamp.Day, d.timestamp.Hour, 0, 0))
                .Select(g => new
                {
                    Hour = g.Key,
                    Average = Math.Round(g.Average(x => x.value), 2)
                })
                .OrderBy(x => x.Hour)
                .ToList();

            // שמירת התוצאות  לקובץ אקסל
            using (var workbook = new XLWorkbook())
            {
                var worksheet = workbook.AddWorksheet("HourlyData");

                // הוספת כותרות
                worksheet.Cell(1, 1).Value = "Time";
                worksheet.Cell(1, 2).Value = "Average";

                int row = 2;
                // שמירת כל אחת משורות הנתונים
                foreach (var item in hourlyGroups.OrderBy(e => e.Hour))
                {
                    // חתימת זמן שעתית
                    worksheet.Cell(row, 1).Value = item.Hour.ToString("yyyy-MM-dd HH:00:00");
                    // ערך ממוצע
                    worksheet.Cell(row, 2).Value = Math.Round(item.Average, 2); // או תוכל גם בלי עיגול
                    row++;
                }

                // שמירה לתוך הקובץ
                workbook.SaveAs(destPath);
            }

        }
    }
}
