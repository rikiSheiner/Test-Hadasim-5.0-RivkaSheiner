using ClosedXML.Excel;
using DocumentFormat.OpenXml.Vml;
using System.Globalization;

namespace Times
{
    internal class Program
    {

        static async Task Main(string[] args)
        {
            // דוגמת שימוש סעיף ב1
            //SectionB_Q1.NoSplit("C:\\Users\\1\\Desktop\\Test-Hadasim-5.0-RivkaSheiner\\חלק א\\Times\\Times\\data\\time_series.xlsx");
            // דוגמת שימוש סעיף ב2
            //SectionB_Q2.WithSplit("C:\\Users\\1\\Desktop\\Test-Hadasim-5.0-RivkaSheiner\\חלק א\\Times\\Times\\data\\time_series.xlsx");

            // דוגמת שימוש סעיף ב4
            await SectionB_Q4.ExtractHourlyDataParquet("C:\\Users\\1\\Desktop\\Test-Hadasim-5.0-RivkaSheiner\\חלק א\\Times\\Times\\data\\time_series.parquet", "C:\\Users\\1\\Desktop\\Test-Hadasim-5.0-RivkaSheiner\\חלק א\\Times\\Times\\data\\hourly_data_praquet.xlsx");

        }
    }
}