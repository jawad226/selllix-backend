import { repo } from "../store/repo";
import { AppError } from "../utils/app-error";
import type { AuthUser } from "../types";

export const notificationService = {
  async list(user: AuthUser) {
    const items = await repo.notifications.find({ userId: user.sub });
    return items
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((n) => ({
        id: n._id,
        type: n.type,
        title: n.title,
        message: n.message,
        read: n.read,
        createdAt: n.createdAt,
        href: n.href,
      }));
  },

  async markRead(id: string, user: AuthUser) {
    const item = await repo.notifications.findById(id);
    if (!item || item.userId !== user.sub) throw AppError.notFound("Notification not found");
    const updated = await repo.notifications.updateById(id, { read: true });
    return {
      id: updated!._id,
      type: updated!.type,
      title: updated!.title,
      message: updated!.message,
      read: true,
      createdAt: updated!.createdAt,
      href: updated!.href,
    };
  },
};
