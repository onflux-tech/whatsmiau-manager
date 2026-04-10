import { test, expect } from "@playwright/test";

test.describe("Auth flow", () => {
  test("redirects to /login when unauthenticated", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });

  test("shows login form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Senha")).toBeVisible();
    await expect(page.getByRole("button", { name: /entrar|criar conta/i })).toBeVisible();
  });

  test("shows setup form on first access", async ({ page }) => {
    await page.goto("/login");
    const heading = page.getByText("Crie sua conta de administrador");
    const confirmField = page.getByLabel("Confirmar senha");
    const isSetup = await heading.isVisible().catch(() => false);
    if (isSetup) {
      await expect(confirmField).toBeVisible();
      await expect(page.getByRole("button", { name: /criar conta/i })).toBeVisible();
    } else {
      await expect(confirmField).not.toBeVisible();
      await expect(page.getByRole("button", { name: /entrar/i })).toBeVisible();
    }
  });
});
