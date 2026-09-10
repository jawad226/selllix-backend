import swaggerJsdoc from "swagger-jsdoc";
import path from "path";

const bearer = [{ bearerAuth: [] }];
const json = { "application/json": { schema: { type: "object" } } };

function post(summary: string, tags: string[], secured = true) {
  return {
    post: {
      summary,
      tags,
      security: secured ? bearer : [],
      requestBody: { required: true, content: json },
      responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" } },
    },
  };
}

function get(summary: string, tags: string[], secured = true) {
  return {
    get: {
      summary,
      tags,
      security: secured ? bearer : [],
      responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" } },
    },
  };
}

function patch(summary: string, tags: string[]) {
  return {
    patch: {
      summary,
      tags,
      security: bearer,
      requestBody: { content: json },
      responses: { 200: { description: "OK" } },
    },
  };
}

function del(summary: string, tags: string[]) {
  return {
    delete: {
      summary,
      tags,
      security: bearer,
      responses: { 200: { description: "OK" } },
    },
  };
}

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "SELLlIX API",
      version: "1.0.0",
      description:
        "Seller intelligence API. Marketplace figures in demo mode are labeled with dataStatus: demo and must not be treated as live marketplace statistics.",
    },
    servers: [{ url: "http://localhost:4000", description: "Local" }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    security: bearer,
    paths: {
      "/api/health": get("Health check", ["System"], false),
      "/api/auth/register": post("Register", ["Auth"], false),
      "/api/auth/login": post("Login", ["Auth"], false),
      "/api/auth/logout": post("Logout", ["Auth"], false),
      "/api/auth/refresh": post("Refresh access token", ["Auth"], false),
      "/api/auth/forgot-password": post("Forgot password", ["Auth"], false),
      "/api/auth/reset-password": post("Reset password", ["Auth"], false),
      "/api/auth/verify-email": post("Verify email", ["Auth"], false),
      "/api/auth/me": get("Current user", ["Auth"]),
      "/api/products/search": get("Search products", ["Products"]),
      "/api/products/trending": get("Trending products", ["Products"]),
      "/api/products/{id}": get("Product detail", ["Products"]),
      "/api/products/{id}/history": get("Product history", ["Products"]),
      "/api/products/{id}/similar": get("Similar products", ["Products"]),
      "/api/competitors": get("List competitors", ["Competitors"]),
      "/api/competitors/compare": post("Compare competitors (2-5)", ["Competitors"]),
      "/api/competitors/{sellerId}": get("Competitor profile", ["Competitors"]),
      "/api/competitors/{sellerId}/products": get("Competitor products", ["Competitors"]),
      "/api/competitors/{sellerId}/analytics": get("Competitor analytics", ["Competitors"]),
      "/api/keywords/search": get("Search keywords", ["Keywords"]),
      "/api/keywords/{keyword}": get("Keyword detail", ["Keywords"]),
      "/api/keywords/title": post("Generate listing title draft", ["Keywords"]),
      "/api/keywords/optimize": post("Optimize listing draft", ["Keywords"]),
      "/api/tracker": { ...get("List tracked products", ["Tracker"]), ...post("Track a product", ["Tracker"]) },
      "/api/tracker/{id}": { ...get("Get tracked product", ["Tracker"]), ...del("Untrack product", ["Tracker"]) },
      "/api/market/trending": get("Market trending products", ["Market"]),
      "/api/market/categories": get("Market categories", ["Market"]),
      "/api/market/category/{id}": get("Category detail", ["Market"]),
      "/api/profit/calculate": post("Calculate profit", ["Profit"]),
      "/api/suppliers/search": get("Search suppliers", ["Suppliers"]),
      "/api/suppliers/{id}": get("Supplier detail", ["Suppliers"]),
      "/api/suppliers/match": post("Match suppliers to a product", ["Suppliers"]),
      "/api/users/me": { ...get("Get profile", ["Users"]), ...patch("Update profile", ["Users"]) },
      "/api/users/password": patch("Change password", ["Users"]),
      "/api/users/usage": get("Usage limits", ["Users"]),
      "/api/billing": get("Billing info", ["Billing"]),
      "/api/billing/checkout": post("Create checkout", ["Billing"]),
      "/api/billing/portal": post("Billing portal", ["Billing"]),
      "/api/billing/cancel": post("Cancel subscription", ["Billing"]),
      "/api/notifications": get("List notifications", ["Notifications"]),
      "/api/notifications/{id}/read": patch("Mark notification read", ["Notifications"]),
      "/api/saved/products": { ...get("Saved products", ["Saved"]), ...post("Save product", ["Saved"]) },
      "/api/saved/products/{id}": del("Remove saved product", ["Saved"]),
      "/api/saved/searches": { ...get("Saved searches", ["Saved"]), ...post("Save search", ["Saved"]) },
      "/api/saved/searches/{id}": del("Remove saved search", ["Saved"]),
      "/api/search-history": get("Search history", ["Saved"]),
      "/api/search-history/{id}": del("Delete history item", ["Saved"]),
      "/api/admin/overview": get("Admin overview", ["Admin"]),
      "/api/admin/users": get("Admin users", ["Admin"]),
      "/api/admin/users/{id}": patch("Update user (plan/status/role)", ["Admin"]),
      "/api/admin/subscriptions": get("Admin subscriptions", ["Admin"]),
      "/api/admin/usage": get("Admin API usage", ["Admin"]),
      "/api/admin/payments": get("Admin payments", ["Admin"]),
      "/api/admin/products": get("Admin products", ["Admin"]),
    },
  },
  apis: [path.join(__dirname, "../routes/*.ts"), path.join(__dirname, "../routes/*.js")],
});
