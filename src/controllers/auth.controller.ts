import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { sendSuccess } from "../utils/api-response";
import { authService } from "../services/auth.service";
import { REFRESH_COOKIE, refreshCookieOptions } from "../utils/tokens";

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body, req.headers["user-agent"]);
    res.cookie(REFRESH_COOKIE, result.refreshToken, refreshCookieOptions());
    sendSuccess(
      res,
      { user: result.user, accessToken: result.accessToken, verifyToken: result.verifyToken },
      "Account created",
      undefined,
      201,
    );
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body, req.headers["user-agent"]);
    res.cookie(REFRESH_COOKIE, result.refreshToken, refreshCookieOptions(Boolean(req.body.remember)));
    sendSuccess(res, { user: result.user, accessToken: result.accessToken }, "Logged in");
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    const result = await authService.refresh(token ?? "", req.headers["user-agent"]);
    res.cookie(REFRESH_COOKIE, result.refreshToken, refreshCookieOptions());
    sendSuccess(res, { user: result.user, accessToken: result.accessToken }, "Token refreshed");
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    await authService.logout(token);
    res.clearCookie(REFRESH_COOKIE, { path: "/" });
    sendSuccess(res, { loggedOut: true }, "Logged out");
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.me(req.user!.sub);
    sendSuccess(res, user);
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    const data = await authService.forgotPassword(req.body.email);
    sendSuccess(res, data, data.message);
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    const data = await authService.resetPassword(req.body.token, req.body.password);
    sendSuccess(res, data, "Password updated");
  }),

  verifyEmail: asyncHandler(async (req: Request, res: Response) => {
    const data = await authService.verifyEmail(req.body.token);
    sendSuccess(res, data, "Email verified");
  }),
};
