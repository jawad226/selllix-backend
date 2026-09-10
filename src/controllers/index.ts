import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { sendSuccess } from "../utils/api-response";
import { productService } from "../services/product.service";
import { competitorService } from "../services/competitor.service";
import { marketService } from "../services/market.service";
import { keywordService } from "../services/keyword.service";
import { trackerService } from "../services/tracker.service";
import { profitCalcService, savedService } from "../services/saved.service";
import { supplierService } from "../services/supplier.service";
import { userService } from "../services/user.service";
import { billingService } from "../services/billing.service";
import { notificationService } from "../services/notification.service";
import { adminService } from "../services/admin.service";

function param(req: Request, key: string): string {
  const value = req.params[key];
  return Array.isArray(value) ? String(value[0]) : String(value ?? "");
}

export const productController = {
  search: asyncHandler(async (req: Request, res: Response) => {
    const result = await productService.search(req.query as Record<string, unknown>, req.user!);
    sendSuccess(res, result.data, undefined, result.pagination);
  }),
  get: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await productService.getById(param(req, "id")));
  }),
  history: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await productService.history(param(req, "id")));
  }),
  trending: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await productService.trending(String(req.query.range ?? "30d")));
  }),
  similar: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await productService.similar(param(req, "id")));
  }),
};

export const competitorController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await competitorService.list(req.query as Record<string, unknown>, req.user!);
    sendSuccess(res, result.data, undefined, result.pagination);
  }),
  get: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await competitorService.get(param(req, "sellerId"), req.user!));
  }),
  products: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await competitorService.products(param(req, "sellerId")));
  }),
  analytics: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await competitorService.analytics(param(req, "sellerId")));
  }),
  compare: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await competitorService.compare(req.body.sellerIds, req.user!));
  }),
};

export const marketController = {
  trending: asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, await marketService.trending());
  }),
  categories: asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, await marketService.categories());
  }),
  category: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await marketService.category(param(req, "id")));
  }),
};

export const keywordController = {
  search: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await keywordService.search(String(req.query.q ?? ""), req.user!));
  }),
  get: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await keywordService.get(param(req, "keyword")));
  }),
  title: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await keywordService.generateTitle(req.body));
  }),
  optimize: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await keywordService.optimize(req.body));
  }),
};

export const trackerController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await trackerService.list(req.user!));
  }),
  add: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await trackerService.add(req.body.productId, req.user!), "Product tracked", undefined, 201);
  }),
  get: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await trackerService.get(param(req, "id"), req.user!));
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await trackerService.remove(param(req, "id"), req.user!), "Removed from tracker");
  }),
};

export const profitController = {
  calculate: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await profitCalcService.calculate(req.user!, req.body));
  }),
};

export const supplierController = {
  search: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await supplierService.search(typeof req.query.q === "string" ? req.query.q : undefined));
  }),
  get: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await supplierService.get(param(req, "id")));
  }),
  match: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await supplierService.match(req.body.productId));
  }),
};

export const userController = {
  me: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await userService.me(req.user!.sub));
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await userService.update(req.user!.sub, req.body), "Profile updated");
  }),
  password: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await userService.changePassword(req.user!.sub, req.body.currentPassword, req.body.newPassword), "Password updated");
  }),
  usage: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await userService.usage(req.user!));
  }),
};

export const billingController = {
  get: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await billingService.get(req.user!));
  }),
  checkout: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await billingService.checkout(req.user!, req.body.plan, req.body.cycle));
  }),
  portal: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await billingService.portal(req.user!));
  }),
  cancel: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await billingService.cancel(req.user!));
  }),
};

export const notificationController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await notificationService.list(req.user!));
  }),
  read: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await notificationService.markRead(param(req, "id"), req.user!));
  }),
};

export const savedController = {
  products: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await savedService.products(req.user!));
  }),
  saveProduct: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await savedService.saveProduct(req.user!, req.body.productId, req.body.notes), "Saved", undefined, 201);
  }),
  removeProduct: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await savedService.removeProduct(param(req, "id"), req.user!));
  }),
  searches: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await savedService.searches(req.user!));
  }),
  saveSearch: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await savedService.saveSearch(req.user!, req.body), "Saved", undefined, 201);
  }),
  removeSearch: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await savedService.removeSearch(param(req, "id"), req.user!));
  }),
  history: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await savedService.history(req.user!));
  }),
  deleteHistory: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await savedService.deleteHistory(param(req, "id"), req.user!));
  }),
};

export const adminController = {
  overview: asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, await adminService.overview());
  }),
  users: asyncHandler(async (req: Request, res: Response) => {
    const result = await adminService.users(req.query as Record<string, unknown>);
    sendSuccess(res, result.data, undefined, result.pagination);
  }),
  updateUser: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminService.updateUser(param(req, "id"), req.body, req.user), "User updated");
  }),
  subscriptions: asyncHandler(async (req: Request, res: Response) => {
    const result = await adminService.subscriptions(req.query as Record<string, unknown>);
    sendSuccess(res, result.data, undefined, result.pagination);
  }),
  usage: asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, await adminService.usage());
  }),
  payments: asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, await adminService.payments());
  }),
  products: asyncHandler(async (req: Request, res: Response) => {
    const result = await adminService.products(req.query as Record<string, unknown>);
    sendSuccess(res, result.data, undefined, result.pagination);
  }),
  plans: asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, await adminService.plans());
  }),
  updatePlan: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminService.updatePlan(param(req, "id"), req.body), "Plan updated");
  }),
};
