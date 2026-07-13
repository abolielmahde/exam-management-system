/**
 * שירות הודעות. שולח אירועים ל-Toast לפי סוג ההודעה.
 * ההערות בקובץ מסבירות את הזרימה וההחלטות המרכזיות בפרויקט.
 */
// כל מתודה שולחת Custom Event שה-Toast מציג למשתמש.
export class NotifyService {
  static success(message) {
    window.dispatchEvent(
      new CustomEvent("app-notify", { detail: { type: "success", message } }),
    );
  }

  static error(message) {
    window.dispatchEvent(
      new CustomEvent("app-notify", { detail: { type: "error", message } }),
    );
  }

  static info(message) {
    window.dispatchEvent(
      new CustomEvent("app-notify", { detail: { type: "info", message } }),
    );
  }
}
