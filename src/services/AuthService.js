import { StorageService } from './StorageService';
import { LoggerService } from './LoggerService';
import { ApiService } from './ApiService';

const SESSION_KEY = 'current_user';

export class AuthService {
  static currentUser() {
    return StorageService.get(SESSION_KEY, null);
  }

  static async register(data) {
    const response = await ApiService.register(data);
    const user = ApiService.saveAuth(response);
    LoggerService.info('Registration login completed', { email: user.email });
    return user;
  }

  static async login(email, password) {
    const response = await ApiService.login(email.trim().toLowerCase(), password);
    const user = ApiService.saveAuth(response);
    LoggerService.info('User logged in', { email: user.email });
    return user;
  }

  static logout() {
    ApiService.clearAuth();
    LoggerService.info('User logged out');
  }
}
