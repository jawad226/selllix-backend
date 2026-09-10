import bcrypt from "bcryptjs";
import { repo } from "../store/repo";
import type { AuthUser } from "../types";
import { AppError } from "../utils/app-error";
import { nowIso, toPublicUser } from "../utils/serialize";
import { usageService } from "./usage.service";
import { isMemoryMode } from "../config/db";
import { UserModel } from "../models";
import { memoryStore } from "../utils/memory-store";

export const userService = {
  async me(userId: string) {
    const user = await repo.users.findById(userId);
    if (!user) throw AppError.notFound("User not found");
    return toPublicUser(user);
  },

  async update(userId: string, patch: { name?: string; avatar?: string; timezone?: string }) {
    const updated = await repo.users.updateById(userId, { ...patch, updatedAt: nowIso() });
    if (!updated) throw AppError.notFound("User not found");
    return toPublicUser(updated);
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = isMemoryMode()
      ? memoryStore.users.find((u) => u._id === userId)
      : ((await UserModel.findById(userId).select("+password").lean()) as { password: string } | null);
    if (!user) throw AppError.notFound("User not found");
    const matches = await bcrypt.compare(currentPassword, user.password);
    if (!matches) throw AppError.unauthorized("Current password is incorrect", "INVALID_CREDENTIALS");
    await repo.users.updateById(userId, {
      password: await bcrypt.hash(newPassword, 10),
      updatedAt: nowIso(),
    });
    return { updated: true };
  },

  async usage(user: AuthUser) {
    return usageService.getUsage(user.sub, user.plan);
  },
};
