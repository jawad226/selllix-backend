import { beforeEach, describe, expect, it } from "vitest";
import { memoryStore } from "../utils/memory-store";
import { authService } from "../services/auth.service";
import { AppError } from "../utils/app-error";

describe("auth service", () => {
  beforeEach(() => {
    memoryStore.reset();
  });

  it("makes the first registered account the owner admin", async () => {
    const result = await authService.register({
      name: "Owner",
      email: "owner@selllix.com",
      password: "Password1!",
    });
    expect(result.user.email).toBe("owner@selllix.com");
    expect(result.user.role).toBe("SUPER_ADMIN");
    expect(result.user.plan).toBe("BUSINESS");
    expect(result.accessToken).toBeTruthy();
  });

  it("registers later accounts as normal users", async () => {
    await authService.register({
      name: "Owner",
      email: "owner@selllix.com",
      password: "Password1!",
    });
    const result = await authService.register({
      name: "Seller",
      email: "seller@selllix.com",
      password: "Password1!",
    });
    expect(result.user.role).toBe("USER");
    expect(result.user.plan).toBe("FREE");
  });

  it("logs in a registered user", async () => {
    await authService.register({
      name: "Owner",
      email: "owner@selllix.com",
      password: "Password1!",
    });
    const result = await authService.login({
      email: "owner@selllix.com",
      password: "Password1!",
    });
    expect(result.user.role).toBe("SUPER_ADMIN");
    expect(result.accessToken).toBeTruthy();
  });

  it("rejects invalid credentials", async () => {
    await authService.register({
      name: "Owner",
      email: "owner@selllix.com",
      password: "Password1!",
    });
    await expect(
      authService.login({ email: "owner@selllix.com", password: "wrong" }),
    ).rejects.toMatchObject({ statusCode: 401, code: "INVALID_CREDENTIALS" } satisfies Partial<AppError>);
  });

  it("prevents duplicate registration", async () => {
    await authService.register({
      name: "Owner",
      email: "owner@selllix.com",
      password: "Password1!",
    });
    await expect(
      authService.register({
        name: "Owner",
        email: "owner@selllix.com",
        password: "Password1!",
      }),
    ).rejects.toMatchObject({ statusCode: 409, code: "EMAIL_TAKEN" });
  });

  it("resets a password in demo mode", async () => {
    await authService.register({
      name: "Owner",
      email: "owner@selllix.com",
      password: "Password1!",
    });
    const forgot = await authService.forgotPassword("owner@selllix.com");
    expect(forgot.resetToken).toBeTruthy();
    await authService.resetPassword(forgot.resetToken!, "NewPass123!");
    const login = await authService.login({ email: "owner@selllix.com", password: "NewPass123!" });
    expect(login.user.email).toBe("owner@selllix.com");
  });
});
