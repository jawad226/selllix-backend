import type { Plan } from "../types";

export interface PlanDefinition {
  id: Plan;
  name: string;
  monthly: number;
  yearly: number;
  searches: number;
  competitors: number;
  tracked: number;
  credits: number;
  stripePriceMonthly?: string;
  stripePriceYearly?: string;
  features: string[];
}

export const PLANS: Record<Plan, PlanDefinition> = {
  FREE: {
    id: "FREE",
    name: "Free",
    monthly: 0,
    yearly: 0,
    searches: 10,
    competitors: 3,
    tracked: 5,
    credits: 10,
    features: [
      "10 product searches / month",
      "3 competitor analyses",
      "5 tracked products",
      "Basic profit calculator",
    ],
  },
  STARTER: {
    id: "STARTER",
    name: "Starter",
    monthly: 19,
    yearly: 182,
    searches: 500,
    competitors: 50,
    tracked: 100,
    credits: 500,
    features: [
      "500 product searches",
      "50 competitor analyses",
      "100 tracked products",
      "Keyword research",
      "Advanced profit calculator",
    ],
  },
  PRO: {
    id: "PRO",
    name: "Pro",
    monthly: 49,
    yearly: 470,
    searches: 2500,
    competitors: -1,
    tracked: 500,
    credits: 2500,
    features: [
      "2,500 searches",
      "Unlimited competitor research",
      "500 tracked products",
      "Advanced filters",
      "AI listing optimization",
      "Market analytics",
    ],
  },
  BUSINESS: {
    id: "BUSINESS",
    name: "Business",
    monthly: 99,
    yearly: 950,
    searches: 10000,
    competitors: -1,
    tracked: -1,
    credits: 10000,
    features: [
      "10,000 searches",
      "Team members",
      "API access",
      "Advanced analytics",
      "Priority support",
    ],
  },
};

export const UNLIMITED = -1;

export function getPlan(id: Plan): PlanDefinition {
  return PLANS[id];
}

export function listPlans(): PlanDefinition[] {
  return Object.values(PLANS);
}

export function updatePlan(id: Plan, patch: Partial<Omit<PlanDefinition, "id">>): PlanDefinition {
  const current = PLANS[id];
  const next: PlanDefinition = {
    ...current,
    ...patch,
    id,
    name: patch.name ?? current.name,
    monthly: patch.monthly ?? current.monthly,
    yearly: patch.yearly ?? current.yearly,
    searches: patch.searches ?? current.searches,
    competitors: patch.competitors ?? current.competitors,
    tracked: patch.tracked ?? current.tracked,
    credits: patch.credits ?? patch.searches ?? current.credits,
    features: patch.features ?? current.features,
  };
  PLANS[id] = next;
  return next;
}

export function isUnlimited(limit: number): boolean {
  return limit === UNLIMITED;
}

export function remaining(used: number, limit: number): number {
  if (isUnlimited(limit)) return Number.POSITIVE_INFINITY;
  return Math.max(0, limit - used);
}
