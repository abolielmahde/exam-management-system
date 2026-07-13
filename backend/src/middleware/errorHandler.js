/**
 * Middleware מרכזי לטיפול ב-404 ובשגיאות שרת לא צפויות.
 * ההערות בקובץ מסבירות את הזרימה וההחלטות המרכזיות בפרויקט.
 */
// מחזיר 404 כאשר לא נמצא Endpoint מתאים.
export const notFound = (req, res) =>
  res.status(404).json({ message: "Route not found" });
// לוכד שגיאות לא צפויות ומונע חשיפת פרטים פנימיים ל-Client.
export function errorHandler(error, req, res, next) {
  console.error(error);
  res
    .status(error.status || 500)
    .json({ message: error.status ? error.message : "Internal server error" });
}
