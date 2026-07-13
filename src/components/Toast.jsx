/**
 * רכיב הודעות זמניות. מאזין לאירועי NotifyService ומציג הצלחה, שגיאה או מידע.
 * ההערות בקובץ מסבירות את הזרימה וההחלטות המרכזיות בפרויקט.
 */
import React from "react";
import { useEffect, useState } from "react";

// רכיב יחיד שמציג הודעות מכל חלקי האפליקציה.
export default function Toast() {
  const [toast, setToast] = useState(null);

  // הרשמה לאירוע app-notify וניקוי ההאזנה בעת Unmount.
  useEffect(() => {
    const listener = (event) => {
      setToast(event.detail);
      window.setTimeout(() => setToast(null), 2500);
    };

    window.addEventListener("app-notify", listener);
    return () => window.removeEventListener("app-notify", listener);
  }, []);

  if (!toast) return null;
  return <div className={`toast ${toast.type}`}>{toast.message}</div>;
}
