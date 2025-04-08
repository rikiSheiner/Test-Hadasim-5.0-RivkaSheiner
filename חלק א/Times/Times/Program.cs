using ClosedXML.Excel;
using DocumentFormat.OpenXml.Vml;
using System.Globalization;

namespace Times
{
    internal class Program
    {

        static void Main(string[] args)
        {
            // דוגמת שימוש סעיף ב1
            SectionB_Q1.NoSplit("C:\\Users\\1\\Desktop\\תוכנית הדסים\\תרגיל בית\\חלק א\\Times\\Times\\data\\time_series.xlsx");
            // דוגמת שימוש סעיף ב2
            SectionB_Q2.WithSplit("C:\\Users\\1\\Desktop\\תוכנית הדסים\\תרגיל בית\\חלק א\\Times\\Times\\data\\time_series.xlsx");

        }
    }
}