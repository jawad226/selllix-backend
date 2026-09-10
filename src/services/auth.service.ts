import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { env } from "../config/env";
import { PLANS } from "../config/plans";
import { isMemoryMode } from "../config/db";
import { UserModel } from "../models";
import { repo } from "../store/repo";
import type { UserDoc } from "../types";
import { AppError } from "../utils/app-error";
import { memoryStore } from "../utils/memory-store";
import { nowIso, toPublicUser } from "../utils/serialize";
import {
  hashToken,
  randomToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/tokens";

const SALT_ROUNDS = 10;

async function findByEmailWithPassword(email: string): Promise<UserDoc | undefined> {
  const normalized = email.toLowerCase();
  if (isMemoryMode()) {
    return memoryStore.users.find((u) => u.email === normalized);
  }
  const doc = await UserModel.findOne({ email: normalized }).select("+password").lean();
  return (doc as unknown as UserDoc | null) ?? undefined;
}

function tokensFor(user: UserDoc, remember = false) {
  const payload = { sub: user._id, role: user.role, plan: user.plan };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload, remember),
  };
}

async function persistSession(userId: string, refreshToken: string, remember: boolean, userAgent?: string) {
  const days = remember ? 30 : 7;
  await repo.sessions.create({
    _id: uuid(),
    userId,
    refreshTokenHash: hashToken(refreshToken),
    userAgent,
    expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
    revoked: false,
    createdAt: nowIso(),
  });
}

export const authService = {
  async register(input: { name: string; email: string; password: string }, userAgent?: string) {
    const email = input.email.toLowerCase();
    const existing = await findByEmailWithPassword(email);
    if (existing) {
      throw AppError.conflict("An account with that email already exists", "EMAIL_TAKEN");
    }
    const now = nowIso();
    const users = await repo.users.find();
    const hasOwner = users.some((u) => u.role === "SUPER_ADMIN");
    const isOwner = !hasOwner;
    const plan = isOwner ? "BUSINESS" : "FREE";
    const user: UserDoc = {
      _id: uuid(),
      name: input.name.trim(),
      email,
      password: await bcrypt.hash(input.password, SALT_ROUNDS),
      role: isOwner ? "SUPER_ADMIN" : "USER",
      plan,
      credits: PLANS[plan].credits,
      subscriptionStatus: isOwner ? "active" : "none",
      emailVerified: isOwner,
      timezone: "UTC",
      accountStatus: "active",
      emailVerifyToken: randomToken(),
      createdAt: now,
      updatedAt: now,
    };
    await repo.users.create(user);
    await repo.subscriptions.create({
      _id: uuid(),
      userId: user._id,
      plan,
      status: isOwner ? "active" : "none",
      billingCycle: "monthly",
      cancelAtPeriodEnd: false,
      createdAt: now,
      updatedAt: now,
    });
    const tokens = tokensFor(user);
    await persistSession(user._id, tokens.refreshToken, false, userAgent);
    return {
      user: toPublicUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      verifyToken: env.DEMO_MODE || env.NODE_ENV !== "production" ? user.emailVerifyToken : undefined,
    };
  },

  async login(input: { email: string; password: string; remember?: boolean }, userAgent?: string) {
    const user = await findByEmailWithPassword(input.email);
    if (!user || !(await bcrypt.compare(input.password, user.password))) {
      throw AppError.unauthorized("Invalid email or password", "INVALID_CREDENTIALS");
    }
    if (user.accountStatus === "suspended") {
      throw AppError.forbidden("Account is suspended", "ACCOUNT_SUSPENDED");
    }
    const others = await repo.users.find();
    const ownerExists = others.some((u) => u.role === "SUPER_ADMIN");
    if (!ownerExists && user.role !== "SUPER_ADMIN") {
      const promoted = await repo.users.updateById(user._id, {
        role: "SUPER_ADMIN",
        plan: "BUSINESS",
        credits: PLANS.BUSINESS.credits,
        subscriptionStatus: "active",
        emailVerified: true,
        updatedAt: nowIso(),
      });
      if (promoted) Object.assign(user, promoted);
    }
    const tokens = tokensFor(user, Boolean(input.remember));
    await persistSession(user._id, tokens.refreshToken, Boolean(input.remember), userAgent);
    return {
      user: toPublicUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  },

  async refresh(refreshToken: string, userAgent?: string) {
    if (!refreshToken) throw AppError.unauthorized("Refresh token missing");
    const payload = verifyRefreshToken(refreshToken);
    const hash = hashToken(refreshToken);
    const session = (await repo.sessions.find({ userId: payload.sub, refreshTokenHash: hash, revoked: false }))[0];
    if (!session || new Date(session.expiresAt).getTime() < Date.now()) {
      throw AppError.unauthorized("Refresh session expired");
    }
    const user = await repo.users.findById(payload.sub);
    if (!user || user.accountStatus === "suspended") {
      throw AppError.unauthorized("User not found");
    }
    await repo.sessions.updateById(session._id, { revoked: true });
    const tokens = tokensFor(user);
    await persistSession(user._id, tokens.refreshToken, false, userAgent);
    return { user: toPublicUser(user), accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
  },

  async logout(refreshToken?: string) {
    if (refreshToken) {
      const hash = hashToken(refreshToken);
      const sessions = await repo.sessions.find({ refreshTokenHash: hash, revoked: false });
      await Promise.all(sessions.map((s) => repo.sessions.updateById(s._id, { revoked: true })));
    }
  },

  async me(userId: string) {
    const user = await repo.users.findById(userId);
    if (!user) throw AppError.notFound("User not found");
    return toPublicUser(user);
  },

  async forgotPassword(email: string): Promise<{ demo: boolean; message: string; resetToken?: string }> {
    const user = await findByEmailWithPassword(email);
    const generic = {
      demo: env.DEMO_MODE,
      message: "If an account exists, a reset email has been sent.",
    };
    if (!user) return generic;
    const token = randomToken();
    await repo.users.updateById(user._id, {
      passwordResetToken: hashToken(token),
      passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      updatedAt: nowIso(),
    });
    return {
      ...generic,
      ...(env.DEMO_MODE || env.NODE_ENV !== "production" ? { resetToken: token } : {}),
    };
  },

  async resetPassword(token: string, password: string) {
    const hashed = hashToken(token);
    const users = await repo.users.find({ passwordResetToken: hashed });
    const user = users[0];
    if (!user || !user.passwordResetExpires || new Date(user.passwordResetExpires).getTime() < Date.now()) {
      throw AppError.badRequest("Reset token is invalid or expired", "INVALID_TOKEN");
    }
    await repo.users.updateById(user._id, {
      password: await bcrypt.hash(password, SALT_ROUNDS),
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
      updatedAt: nowIso(),
    });
    return { reset: true };
  },

  async verifyEmail(token: string) {
    const users = await repo.users.find({ emailVerifyToken: token });
    const user = users[0];
    if (!user) throw AppError.badRequest("Verification token is invalid", "INVALID_TOKEN");
    const updated = await repo.users.updateById(user._id, {
      emailVerified: true,
      emailVerifyToken: undefined,
      updatedAt: nowIso(),
    });
    return toPublicUser(updated!);
  },
};
