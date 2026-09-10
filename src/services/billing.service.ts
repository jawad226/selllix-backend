import { v4 as uuid } from "uuid";
import { env } from "../config/env";
import { PLANS, getPlan } from "../config/plans";
import { repo } from "../store/repo";
import type { AuthUser, BillingCycle, Plan } from "../types";
import { AppError } from "../utils/app-error";
import { nowIso } from "../utils/serialize";
import { usageService } from "./usage.service";

async function applyPlan(userId: string, plan: Plan, cycle: BillingCycle, cancelAtPeriodEnd = false) {
  const user = await repo.users.findById(userId);
  if (!user) throw AppError.notFound("User not found");
  const definition = getPlan(plan);
  await repo.users.updateById(userId, {
    plan,
    credits: definition.credits,
    subscriptionStatus: plan === "FREE" ? "none" : "active",
    updatedAt: nowIso(),
  });
  const existing = (await repo.subscriptions.find({ userId }))[0];
  const periodDays = cycle === "yearly" ? 365 : 30;
  const patch = {
    plan,
    status: plan === "FREE" ? ("none" as const) : ("active" as const),
    billingCycle: cycle,
    cancelAtPeriodEnd,
    currentPeriodEnd: new Date(Date.now() + periodDays * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: nowIso(),
  };
  if (existing) {
    await repo.subscriptions.updateById(existing._id, patch);
  } else {
    await repo.subscriptions.create({
      _id: uuid(),
      userId,
      ...patch,
      createdAt: nowIso(),
    });
  }
}

export const billingService = {
  async get(user: AuthUser) {
    const dbUser = await repo.users.findById(user.sub);
    if (!dbUser) throw AppError.notFound("User not found");
    const sub = (await repo.subscriptions.find({ userId: user.sub }))[0];
    const usage = await usageService.getUsage(user.sub, dbUser.plan);
    return {
      plan: dbUser.plan,
      status: dbUser.subscriptionStatus,
      creditsUsed: usage.searches.used,
      creditsLimit: getPlan(dbUser.plan).credits,
      billingCycle: sub?.billingCycle ?? "monthly",
      nextBillingDate: sub?.currentPeriodEnd,
      cancelAtPeriodEnd: sub?.cancelAtPeriodEnd ?? false,
      dataStatus: env.STRIPE_SECRET_KEY ? ("actual" as const) : ("demo" as const),
    };
  },

  async checkout(user: AuthUser, plan: Plan, cycle: BillingCycle) {
    if (!(plan in PLANS)) throw AppError.badRequest("Invalid plan");
    if (!env.STRIPE_SECRET_KEY) {
      await applyPlan(user.sub, plan, cycle);
      await repo.payments.create({
        _id: uuid(),
        userId: user.sub,
        amount: cycle === "yearly" ? PLANS[plan].yearly : PLANS[plan].monthly,
        currency: "USD",
        plan,
        status: "demo",
        dataStatus: "demo",
        createdAt: nowIso(),
      });
      return {
        demo: true,
        message: "Stripe is not configured. Plan was updated in demo mode.",
        plan,
        billingCycle: cycle,
      };
    }

    const params = new URLSearchParams({
      mode: "subscription",
      success_url: `${env.FRONTEND_URL}/dashboard/billing?success=1`,
      cancel_url: `${env.FRONTEND_URL}/dashboard/billing?canceled=1`,
      "line_items[0][quantity]": "1",
      "line_items[0][price_data][currency]": "usd",
      "line_items[0][price_data][product_data][name]": `SELLlIX ${plan}`,
      "line_items[0][price_data][unit_amount]": String(
        Math.round((cycle === "yearly" ? PLANS[plan].yearly : PLANS[plan].monthly) * 100),
      ),
      "line_items[0][price_data][recurring][interval]": cycle === "yearly" ? "year" : "month",
      client_reference_id: user.sub,
    });

    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });
    const json = (await response.json()) as { id?: string; url?: string; error?: { message: string } };
    if (!response.ok) {
      throw AppError.badRequest(json.error?.message ?? "Stripe checkout failed", "STRIPE_ERROR");
    }
    return { demo: false, checkoutUrl: json.url, sessionId: json.id };
  },

  async portal(user: AuthUser) {
    if (!env.STRIPE_SECRET_KEY) {
      return {
        demo: true,
        message: "Stripe billing portal is unavailable without STRIPE_SECRET_KEY.",
        portalUrl: `${env.FRONTEND_URL}/dashboard/billing`,
      };
    }
    const sub = (await repo.subscriptions.find({ userId: user.sub }))[0];
    if (!sub?.stripeCustomerId) {
      throw AppError.badRequest("No Stripe customer on file");
    }
    const params = new URLSearchParams({
      customer: sub.stripeCustomerId,
      return_url: `${env.FRONTEND_URL}/dashboard/billing`,
    });
    const response = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });
    const json = (await response.json()) as { url?: string; error?: { message: string } };
    if (!response.ok) {
      throw AppError.badRequest(json.error?.message ?? "Stripe portal failed", "STRIPE_ERROR");
    }
    return { demo: false, portalUrl: json.url };
  },

  async cancel(user: AuthUser) {
    if (!env.STRIPE_SECRET_KEY) {
      await applyPlan(user.sub, "FREE", "monthly", true);
      return {
        demo: true,
        message: "Stripe is not configured. Subscription canceled and plan set to Free in demo mode.",
        plan: "FREE",
      };
    }
    const sub = (await repo.subscriptions.find({ userId: user.sub }))[0];
    if (!sub?.stripeSubscriptionId) {
      throw AppError.badRequest("No Stripe subscription on file");
    }
    const response = await fetch(`https://api.stripe.com/v1/subscriptions/${sub.stripeSubscriptionId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ cancel_at_period_end: "true" }),
    });
    if (!response.ok) {
      throw AppError.badRequest("Unable to cancel Stripe subscription", "STRIPE_ERROR");
    }
    await repo.subscriptions.updateById(sub._id, { cancelAtPeriodEnd: true, updatedAt: nowIso() });
    return { demo: false, cancelAtPeriodEnd: true };
  },
};
