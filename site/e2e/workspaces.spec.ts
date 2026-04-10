import { test, expect } from "@playwright/test";

test.describe("Workspaces", () => {
  test.skip(true, "Requires running manager with auth");

  test("shows empty state when no workspaces exist", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Nenhum workspace")).toBeVisible();
  });

  test("can open add workspace dialog", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /novo/i }).click();
    await expect(page.getByText("Novo workspace")).toBeVisible();
  });
});
