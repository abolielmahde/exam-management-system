export class NotifyService {
  static success(message) {
    window.dispatchEvent(new CustomEvent('app-notify', { detail: { type: 'success', message } }));
  }

  static error(message) {
    window.dispatchEvent(new CustomEvent('app-notify', { detail: { type: 'error', message } }));
  }

  static info(message) {
    window.dispatchEvent(new CustomEvent('app-notify', { detail: { type: 'info', message } }));
  }
}
