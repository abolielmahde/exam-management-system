/**
 * נקודת הכניסה של React. מחברת את App לאלמנט root שנמצא ב-index.html.
 * ההערות בקובץ מסבירות את הזרימה וההחלטות המרכזיות בפרויקט.
 */
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles/main.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
