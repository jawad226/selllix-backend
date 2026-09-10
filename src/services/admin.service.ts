import { getPlan, listPlans, updatePlan, PLANS } from "../config/plans";
import { repo } from "../store/repo";
import { paginate } from "../utils/api-response";
import { AppError } from "../utils/app-error";
import { nowIso, parseLimit, parsePage, toProductDto, toPublicUser } from "../utils/serialize";
import type { AccountStatus, Plan } from "../types";
import { getDbMode } from "../config/db";
import { env } from "../config/env";

export const adminService = {
  async overview() {
    const users = await repo.users.find();
    const payments = await repo.payments.find();
    const usage = await repo.apiUsage.find();
    const subscriptions = await repo.subscriptions.find();
    const month = nowIso().slice(0, 7);
    const newThisMonth = users.filter((u) => u.createdAt.startsWith(month)).length;
    const byPlan = users.reduce<Record<string, number>>((acc, u) => {
      acc[u.plan] = (acc[u.plan] ?? 0) + 1;
      return acc;
    }, {});
    const mrr = subscriptions
      .filter((s) => s.status === "active")
      .reduce((sum, s) => {
        const plan = getPlan(s.plan);
        return sum + (s.billingCycle === "yearly" ? plan.yearly / 12 : plan.monthly);
      }, 0);
    return {
      users: { total: users.length, newThisMonth, byPlan },
      revenue: { mrr: Math.round(mrr * 100) / 100, dataStatus: env.STRIPE_SECRET_KEY ? "actual" : "demo" },
      searches: {
        thisMonth: usage.filter((u) => u.createdAt.startsWith(month) && u.usageType === "searches").length,
      },
      subscriptions: { active: subscriptions.filter((s) => s.status === "active").length },
      payments: payments.length,
      dbMode: getDbMode(),
      dataStatus: "demo" as const,
    };
  },

  async users(query: Record<string, unknown>) {
    let items = await repo.users.find();
    const search = typeof query.search === "string" ? query.search.toLowerCase() : "";
    if (search) {
      items = items.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(search));
    }
    if (typeof query.plan === "string") items = items.filter((u) => u.plan === query.plan);
    if (typeof query.role === "string") items = items.filter((u) => u.role === query.role);
    if (typeof query.status === "string") items = items.filter((u) => u.accountStatus === query.status);
    return paginate(items.map(toPublicUser), parsePage(query.page), parseLimit(query.limit));
  },

  async updateUser(
    id: string,
    patch: { accountStatus?: AccountStatus; plan?: Plan; role?: "USER" | "ADMIN" | "SUPER_ADMIN" },
    actor?: { sub: string; role: string },
  ) {
    const user = await repo.users.findById(id);
    if (!user) throw AppError.notFound("User not found");
    if (actor?.sub === id && patch.accountStatus === "suspended") {
      throw AppError.forbidden("You cannot suspend your own account");
    }
    if (patch.role && actor?.role !== "SUPER_ADMIN" && user.role === "SUPER_ADMIN") {
      throw AppError.forbidden("Only a super admin can change this role");
    }
    const updated = await repo.users.updateById(id, {
      ...patch,
      plan: patch.plan ?? user.plan,
      credits: patch.plan ? getPlan(patch.plan).credits : user.credits,
      subscriptionStatus: patch.plan ? (patch.plan === "FREE" ? "none" : "active") : user.subscriptionStatus,
      updatedAt: nowIso(),
    });
    return toPublicUser(updated!);
  },

  async subscriptions(query: Record<string, unknown>) {
    const items = await repo.subscriptions.find();
    return paginate(items, parsePage(query.page), parseLimit(query.limit));
  },

  async usage() {
    const items = await repo.apiUsage.find();
    return {
      total: items.length,
      recent: items.slice(-50).reverse(),
      dataStatus: "actual" as const,
    };
  },

  async payments() {
    const items = await repo.payments.find();
    return items.map((p) => ({ ...p, id: p._id }));
  },

  async products(query: Record<string, unknown>) {
    const items = await repo.products.find();
    const search = typeof query.search === "string" ? query.search.toLowerCase() : "";
    const filtered = search
      ? items.filter((p) => p.title.toLowerCase().includes(search) || p.category.toLowerCase().includes(search))
      : items;
    return paginate(filtered.map(toProductDto), parsePage(query.page), parseLimit(query.limit));
  },

  async plans() {
    return listPlans();
  },

  async updatePlan(
    id: string,
    patch: {
      name?: string;
      monthly?: number;
      yearly?: number;
      searches?: number;
      competitors?: number;
      tracked?: number;
      credits?: number;
      features?: string[];
    },
  ) {
    if (!(id in PLANS)) throw AppError.notFound("Plan not found");
    return updatePlan(id as Plan, patch);
  },
};
