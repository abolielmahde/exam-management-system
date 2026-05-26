import { StorageService } from './StorageService';
import { MockApiDbService } from './MockApiDbService';
import { LoggerService } from './LoggerService';

const SESSION_KEY = 'current_user';

export class AuthService {
  static currentUser() {
    return StorageService.get(SESSION_KEY, null);
  }

  static register(data) {
    const user = MockApiDbService.createUser(data);
    StorageService.set(SESSION_KEY, user);
    LoggerService.info('Registration login completed', { email: user.email });
    return user;
  }

  static login(email, password) {
    const cleanEmail = email.trim().toLowerCase();
    const user = MockApiDbService.getUsers().find(item => item.email.toLowerCase() === cleanEmail && item.password === password);

    if (!user) throw new Error('Invalid email or password');

    StorageService.set(SESSION_KEY, user);
    LoggerService.info('User logged in', { email: cleanEmail });
    return user;
  }

  static logout() {
    StorageService.remove(SESSION_KEY);
    LoggerService.info('User logged out');
  }
}
