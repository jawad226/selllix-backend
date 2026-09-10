import { Router } from "express";
import { authRoutes } from "./auth.routes";
import {
  adminController,
  billingController,
  competitorController,
  keywordController,
  marketController,
  notificationController,
  productController,
  profitController,
  savedController,
  supplierController,
  trackerController,
  userController,
} from "../controllers";
import { requireAuth, requireRole } from "../middleware/auth";
import { checkLimit } from "../middleware/usage";
import { validate } from "../middleware/validate";
import {
  adminPlanPatchSchema,
  adminUserPatchSchema,
  changePasswordSchema,
  checkoutSchema,
  compareSchema,
  keywordOptimizeSchema,
  keywordTitleSchema,
  profitSchema,
  saveProductSchema,
  saveSearchSchema,
  supplierMatchSchema,
  trackerCreateSchema,
  updateMeSchema,
} from "../validators";

export const productRoutes = Router();
productRoutes.use(requireAuth);
productRoutes.get("/search", checkLimit("searches"), productController.search);
productRoutes.get("/trending", productController.trending);
productRoutes.get("/:id/history", productController.history);
productRoutes.get("/:id/similar", productController.similar);
productRoutes.get("/:id", productController.get);

export const competitorRoutes = Router();
competitorRoutes.use(requireAuth);
competitorRoutes.get("/", checkLimit("competitors"), competitorController.list);
competitorRoutes.post("/compare", checkLimit("competitors"), validate(compareSchema), competitorController.compare);
competitorRoutes.get("/:sellerId/products", competitorController.products);
competitorRoutes.get("/:sellerId/analytics", competitorController.analytics);
competitorRoutes.get("/:sellerId", checkLimit("competitors"), competitorController.get);

export const keywordRoutes = Router();
keywordRoutes.use(requireAuth);
keywordRoutes.get("/search", checkLimit("searches"), keywordController.search);
keywordRoutes.post("/title", validate(keywordTitleSchema), keywordController.title);
keywordRoutes.post("/optimize", validate(keywordOptimizeSchema), keywordController.optimize);
keywordRoutes.get("/:keyword", keywordController.get);

export const trackerRoutes = Router();
trackerRoutes.use(requireAuth);
trackerRoutes.get("/", trackerController.list);
trackerRoutes.post("/", checkLimit("tracked"), validate(trackerCreateSchema), trackerController.add);
trackerRoutes.get("/:id", trackerController.get);
trackerRoutes.delete("/:id", trackerController.remove);

export const marketRoutes = Router();
marketRoutes.use(requireAuth);
marketRoutes.get("/trending", marketController.trending);
marketRoutes.get("/categories", marketController.categories);
marketRoutes.get("/category/:id", marketController.category);

export const profitRoutes = Router();
profitRoutes.use(requireAuth);
profitRoutes.post("/calculate", validate(profitSchema), profitController.calculate);

export const supplierRoutes = Router();
supplierRoutes.use(requireAuth);
supplierRoutes.get("/search", supplierController.search);
supplierRoutes.post("/match", validate(supplierMatchSchema), supplierController.match);
supplierRoutes.get("/:id", supplierController.get);

export const userRoutes = Router();
userRoutes.use(requireAuth);
userRoutes.get("/me", userController.me);
userRoutes.patch("/me", validate(updateMeSchema), userController.update);
userRoutes.patch("/password", validate(changePasswordSchema), userController.password);
userRoutes.get("/usage", userController.usage);

export const billingRoutes = Router();
billingRoutes.use(requireAuth);
billingRoutes.get("/", billingController.get);
billingRoutes.post("/checkout", validate(checkoutSchema), billingController.checkout);
billingRoutes.post("/portal", billingController.portal);
billingRoutes.post("/cancel", billingController.cancel);

export const notificationRoutes = Router();
notificationRoutes.use(requireAuth);
notificationRoutes.get("/", notificationController.list);
notificationRoutes.patch("/:id/read", notificationController.read);

export const savedRoutes = Router();
savedRoutes.use(requireAuth);
savedRoutes.get("/products", savedController.products);
savedRoutes.post("/products", validate(saveProductSchema), savedController.saveProduct);
savedRoutes.delete("/products/:id", savedController.removeProduct);
savedRoutes.get("/searches", savedController.searches);
savedRoutes.post("/searches", validate(saveSearchSchema), savedController.saveSearch);
savedRoutes.delete("/searches/:id", savedController.removeSearch);

export const searchHistoryRoutes = Router();
searchHistoryRoutes.use(requireAuth);
searchHistoryRoutes.get("/", savedController.history);
searchHistoryRoutes.delete("/:id", savedController.deleteHistory);

export const adminRoutes = Router();
adminRoutes.use(requireAuth, requireRole("ADMIN", "SUPER_ADMIN"));
adminRoutes.get("/overview", adminController.overview);
adminRoutes.get("/users", adminController.users);
adminRoutes.patch("/users/:id", validate(adminUserPatchSchema), adminController.updateUser);
adminRoutes.get("/subscriptions", adminController.subscriptions);
adminRoutes.get("/usage", adminController.usage);
adminRoutes.get("/payments", adminController.payments);
adminRoutes.get("/products", adminController.products);
adminRoutes.get("/plans", adminController.plans);
adminRoutes.patch("/plans/:id", validate(adminPlanPatchSchema), adminController.updatePlan);

export const apiRouter = Router();
apiRouter.get("/plans", adminController.plans);
apiRouter.use("/auth", authRoutes);
apiRouter.use("/products", productRoutes);
apiRouter.use("/competitors", competitorRoutes);
apiRouter.use("/keywords", keywordRoutes);
apiRouter.use("/tracker", trackerRoutes);
apiRouter.use("/market", marketRoutes);
apiRouter.use("/profit", profitRoutes);
apiRouter.use("/suppliers", supplierRoutes);
apiRouter.use("/users", userRoutes);
apiRouter.use("/billing", billingRoutes);
apiRouter.use("/notifications", notificationRoutes);
apiRouter.use("/saved", savedRoutes);
apiRouter.use("/search-history", searchHistoryRoutes);
apiRouter.use("/admin", adminRoutes);
