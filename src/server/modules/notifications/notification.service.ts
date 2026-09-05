import { NotificationRepository } from './notification.repository';

export class NotificationService {
  private notificationRepository: NotificationRepository;

  constructor(notificationRepository = new NotificationRepository()) {
    this.notificationRepository = notificationRepository;
  }

  async getMyNotifications(userId: string, page = 1, limit = 20) {
    return this.notificationRepository.findUserNotifications(userId, page, limit);
  }

  async markAsRead(id: string, userId: string) {
    await this.notificationRepository.markAsRead(id, userId);
    return { message: 'Notification marked as read' };
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepository.markAllAsRead(userId);
    return { message: 'All notifications marked as read' };
  }
}
