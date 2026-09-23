export type NotificationType = 'like' | 'comment' | 'contact';

export interface NotificationResponse {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationListResponse {
  items: NotificationResponse[];
  unreadCount: number;
}

/** How each type is drawn: the bell's icon chip and the notifications table's badge. */
export const NOTIFICATION_TYPES: Record<
  NotificationType,
  { label: string; icon: string; iconClass: string; badgeClass: string }
> = {
  like: {
    label: 'Like',
    icon: 'heart',
    iconClass: 'bg-rose-50 text-rose-600',
    badgeClass: 'tbl-badge-danger',
  },
  comment: {
    label: 'Comment',
    icon: 'message-square',
    iconClass: 'bg-blue-50 text-blue-600',
    badgeClass: 'tbl-badge-category',
  },
  contact: {
    label: 'Contact',
    icon: 'mail',
    iconClass: 'bg-fuchsia-50 text-fuchsia-600',
    badgeClass: 'tbl-badge-success',
  },
};
