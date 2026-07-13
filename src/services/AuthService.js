/**
 * שירות Authentication בצד ה-Client. מנהל Login, Register, Logout והמשתמש הנוכחי.
 * ההערות בקובץ מסבירות את הזרימה וההחלטות המרכזיות בפרויקט.
 */
import { StorageService } from "./StorageService";
import { LoggerService } from "./LoggerService";
import { ApiService } from "./ApiService";
// שירות מרכזי לניהול מצב Authentication.
export class AuthService {
  static currentUser() {
    return StorageService.get("current_user", null);
  }
  static async register(data) {
    const response = await ApiService.register(data);
    const user = ApiService.saveAuth(response);
    LoggerService.info("Registration completed", { email: user.email });
    return user;
  }
  static async login(email, password) {
    const response = await ApiService.login(
      email.trim().toLowerCase(),
      password,
    );
    const user = ApiService.saveAuth(response);
    LoggerService.info("User logged in", { email: user.email });
    return user;
  }
  static logout() {
    ApiService.clearAuth();
    LoggerService.info("User logged out");
  }
}
