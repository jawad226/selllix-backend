import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  remember: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(128),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(6),
});

export const updateMeSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  avatar: z.string().url().optional(),
  timezone: z.string().min(1).max(80).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export const profitSchema = z.object({
  sellingPrice: z.number().min(0),
  productCost: z.number().min(0),
  shipping: z.number().min(0).default(0),
  marketplaceFees: z.number().min(0).default(0),
  advertisingCost: z.number().min(0).default(0),
  otherCosts: z.number().min(0).default(0),
});

export const trackerCreateSchema = z.object({
  productId: z.string().min(1),
});

export const keywordTitleSchema = z.object({
  productName: z.string().min(1),
  keywords: z.array(z.string()).default([]),
});

export const keywordOptimizeSchema = z.object({
  productName: z.string().min(1),
  description: z.string().default(""),
  keywords: z.string().default(""),
});

export const compareSchema = z.object({
  sellerIds: z.array(z.string().min(1)).min(2).max(5),
});

export const checkoutSchema = z.object({
  plan: z.enum(["FREE", "STARTER", "PRO", "BUSINESS"]),
  cycle: z.enum(["monthly", "yearly"]).default("monthly"),
});

export const saveProductSchema = z.object({
  productId: z.string().min(1),
  notes: z.string().max(500).optional().default(""),
});

export const saveSearchSchema = z.object({
  name: z.string().min(1).max(80),
  query: z.string().default(""),
  filters: z.record(z.unknown()).default({}),
});

export const supplierMatchSchema = z.object({
  productId: z.string().min(1),
});

export const adminUserPatchSchema = z.object({
  accountStatus: z.enum(["active", "suspended"]).optional(),
  plan: z.enum(["FREE", "STARTER", "PRO", "BUSINESS"]).optional(),
  role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]).optional(),
});

export const adminPlanPatchSchema = z.object({
  name: z.string().min(1).max(40).optional(),
  monthly: z.number().min(0).optional(),
  yearly: z.number().min(0).optional(),
  searches: z.number().int().min(-1).optional(),
  competitors: z.number().int().min(-1).optional(),
  tracked: z.number().int().min(-1).optional(),
  credits: z.number().int().min(-1).optional(),
  features: z.array(z.string().min(1)).min(1).optional(),
});
