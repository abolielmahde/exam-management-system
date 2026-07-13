/**
 * שירות קונפיגורציה. מרכז ערכים קבועים כגון Roles, Statuses וחשבונות Demo.
 * ההערות בקובץ מסבירות את הזרימה וההחלטות המרכזיות בפרויקט.
 */
export class ConfigurationService {
  static appName = "Exam Management System";
  static version = "2.0.0";
  static author = "Mahde Aboliel";

  static roles() {
    return ["teacher", "student"];
  }

  static examStatuses() {
    return ["draft", "published", "closed"];
  }

  static statusLabel(status) {
    const labels = {
      draft: "Draft",
      published: "Published",
      closed: "Closed",
    };
    return labels[status] || status;
  }

  static demoAccounts() {
    return {
      teacher: { email: "teacher@test.com", password: "123456" },
      student: { email: "student@test.com", password: "123456" },
    };
  }
}
