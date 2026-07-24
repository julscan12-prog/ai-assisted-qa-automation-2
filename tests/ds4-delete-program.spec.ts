import dotenv from 'dotenv';
import path from 'path';
import { test, expect, type Page, type Locator, type Dialog } from '@playwright/test';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const BASE_URL = process.env.DIDAXIS_URL ?? 'https://test.didaxis.studio';
const LOGIN_URL = `${BASE_URL}/login`;
const PROGRAMS_URL = `${BASE_URL}/programs`;
const DASHBOARD_URL = `${BASE_URL}/`;

const PROGRAM_NAME_MAX_LENGTH = 255;
const DESCRIPTION_MAX_LENGTH = 1000;

/**
 * Locators verified on Didaxis Studio (Programs page):
 * - Login: getByLabel('Email'|'Password'), getByRole('button', { name: 'Sign In' })
 * - Programs: getByRole('button', { name: '+ New Program' }), table rows
 * - Row actions: getByRole('button', { name: `Edit ${name}` | `Delete ${name}`, exact: true })
 * - Create modal: getByRole('dialog') → heading "New Program", textboxes "Program Name" / "Description", "Create"
 * - Delete confirmation: native browser confirm dialog
 *   message: `Delete program "<name>"? All its semesters and courses will be removed. This cannot be undone.`
 * - Dashboard: heading "Dashboard", Programs tile with "Manage academic programs" + numeric count
 *
 * Coverage notes (DS-4_ticket_OUTPUT.md):
 * - Coverable: TC-001–TC-008, TC-010–TC-022
 * - Excluded: TC-009 (admin-only env; no non-admin user available)
 * - Partial: TC-011 (native confirm accepts once; cannot true double-click OK),
 *   TC-018 (shared env may have other programs; assert target gone + New Program available),
 *   TC-021 (Playwright dismisses native confirm; equivalent to Cancel/Escape)
 */

function requireAdminCredentials(): { email: string; password: string } {
  const email = process.env.DIDAXIS_EMAIL;
  const password = process.env.DIDAXIS_PASSWORD;
  if (!email || !password) {
    throw new Error('DIDAXIS_EMAIL and DIDAXIS_PASSWORD must be set in .env');
  }
  return { email, password };
}

function uniqueName(base: string): string {
  return `${base} ${Date.now()}`;
}

function fixedLengthString(length: number, char = 'x'): string {
  return char.repeat(length);
}

async function loginAsAdmin(page: Page) {
  const { email, password } = requireAdminCredentials();
  await page.goto(LOGIN_URL);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).not.toHaveURL(/\/login/);
}

async function gotoProgramsPage(page: Page) {
  await page.goto(PROGRAMS_URL);
  await expect(page.getByRole('heading', { name: 'Programs' })).toBeVisible();
  await expect(page.getByRole('button', { name: '+ New Program' })).toBeVisible();
}

async function gotoDashboard(page: Page) {
  await page.goto(DASHBOARD_URL);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
}

function programModal(page: Page): Locator {
  return page.getByRole('dialog');
}

function programNameField(page: Page): Locator {
  return programModal(page).getByRole('textbox', { name: 'Program Name' });
}

function descriptionField(page: Page): Locator {
  return programModal(page).getByRole('textbox', { name: 'Description' });
}

function createButton(page: Page): Locator {
  return programModal(page).getByRole('button', { name: 'Create' });
}

function editButton(page: Page, name: string): Locator {
  return page.getByRole('button', { name: `Edit ${name}`, exact: true });
}

function deleteButton(page: Page, name: string): Locator {
  return page.getByRole('button', { name: `Delete ${name}`, exact: true });
}

function programInList(page: Page, name: string): Locator {
  return page.getByRole('row').filter({
    has: editButton(page, name),
  });
}

function programsDashboardCount(page: Page): Locator {
  return page
    .locator('[class*="Card-root"]')
    .filter({ hasText: 'Manage academic programs' })
    .locator('p')
    .filter({ hasText: /^\d+$/ });
}

async function openNewProgramModal(page: Page) {
  await page.getByRole('button', { name: '+ New Program' }).click();
  await expect(programModal(page)).toBeVisible();
  await expect(programModal(page).getByRole('heading', { name: 'New Program' })).toBeVisible();
}

async function createProgram(page: Page, name: string, description = '') {
  await openNewProgramModal(page);
  await programNameField(page).fill(name);
  if (description) {
    await descriptionField(page).fill(description);
  }
  await createButton(page).click();
  await expect(programModal(page)).toBeHidden({ timeout: 10000 });
  await expect(programInList(page, name)).toBeVisible();
}

type DeleteConfirmInteraction = {
  dialog: Dialog;
  clickPromise: Promise<void>;
};

function assertDeleteConfirmDialog(dialog: Dialog, name: string) {
  expect(dialog.type()).toBe('confirm');
  expect(dialog.message()).toContain(name);
  expect(dialog.message()).toMatch(/Delete program/i);
  expect(dialog.message()).toMatch(/cannot be undone/i);
}

async function clickDeleteAndWaitForConfirm(
  page: Page,
  name: string,
): Promise<DeleteConfirmInteraction> {
  const dialogPromise = page.waitForEvent('dialog');
  const clickPromise = deleteButton(page, name).click();
  const dialog = await dialogPromise;
  assertDeleteConfirmDialog(dialog, name);
  return { dialog, clickPromise };
}

async function confirmDelete(page: Page, name: string) {
  const { dialog, clickPromise } = await clickDeleteAndWaitForConfirm(page, name);
  await dialog.accept();
  await clickPromise;
  await expect(programInList(page, name)).toBeHidden({ timeout: 10000 });
}

async function cancelDelete(page: Page, name: string) {
  const { dialog, clickPromise } = await clickDeleteAndWaitForConfirm(page, name);
  await dialog.dismiss();
  await clickPromise;
  await expect(programInList(page, name)).toBeVisible();
}

test.describe('Didaxis Studio — Delete Program with Confirmation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await gotoProgramsPage(page);
  });

  // Positive flows

  test('TC-001 — Confirmation dialog appears when delete icon is clicked', async ({ page }) => {
    const programName = uniqueName('Test Program');

    await createProgram(page, programName, 'Delete confirmation test');

    const { dialog, clickPromise } = await clickDeleteAndWaitForConfirm(page, programName);
    await dialog.dismiss();
    await clickPromise;

    await expect(programInList(page, programName)).toBeVisible();
  });

  test('TC-002 — Confirmed deletion removes the program from the list', async ({ page }) => {
    const programName = uniqueName('Test Program');

    await createProgram(page, programName, 'Confirmed delete test');
    await confirmDelete(page, programName);

    await expect(programInList(page, programName)).toHaveCount(0);
  });

  test('TC-003 — Cancel keeps the program in the list', async ({ page }) => {
    const programName = uniqueName('Test Program');

    await createProgram(page, programName, 'Cancel delete test');
    await cancelDelete(page, programName);

    await expect(programInList(page, programName)).toBeVisible();
  });

  test('TC-004 — Only the selected program is removed when multiple programs exist', async ({
    page,
  }) => {
    const targetName = uniqueName('Test Program');
    const keepNameOne = uniqueName('Web Development 2026');
    const keepNameTwo = uniqueName('Data Science Fundamentals');

    await createProgram(page, targetName, 'Target for deletion');
    await createProgram(page, keepNameOne, 'Should remain after delete');
    await createProgram(page, keepNameTwo, 'Should also remain after delete');

    await confirmDelete(page, targetName);

    await expect(programInList(page, targetName)).toHaveCount(0);
    await expect(programInList(page, keepNameOne)).toBeVisible();
    await expect(programInList(page, keepNameTwo)).toBeVisible();
  });

  test('TC-005 — Program with empty Description can be deleted', async ({ page }) => {
    const programName = uniqueName('Minimal Program');

    await createProgram(page, programName);
    await confirmDelete(page, programName);

    await expect(programInList(page, programName)).toHaveCount(0);
  });

  test('TC-006 — Deleted program name can be reused for a new program', async ({ page }) => {
    const programName = uniqueName('Test Program');
    const reusedDescription = 'Recreated after delete';

    await createProgram(page, programName, 'Initial program');
    await confirmDelete(page, programName);

    await openNewProgramModal(page);
    await programNameField(page).fill(programName);
    await descriptionField(page).fill(reusedDescription);
    await createButton(page).click();

    await expect(programModal(page)).toBeHidden({ timeout: 10000 });
    await expect(programInList(page, programName)).toBeVisible();
    await expect(programInList(page, programName).locator('td').first().locator('p').nth(1)).toHaveText(
      reusedDescription,
    );
  });

  // Negative flows

  test('TC-007 — Closing the dialog without confirming does not delete the program', async ({
    page,
  }) => {
    const programName = uniqueName('Test Program');

    await createProgram(page, programName, 'Dismiss without confirm test');
    await cancelDelete(page, programName);

    await expect(programInList(page, programName)).toBeVisible();
  });

  test('TC-008 — Program is not deleted until confirmation is explicitly given', async ({
    page,
  }) => {
    const programName = uniqueName('Test Program');

    await createProgram(page, programName, 'Pending confirmation test');

    // Native confirm blocks the page until handled; verify dialog content then dismiss.
    const { dialog, clickPromise } = await clickDeleteAndWaitForConfirm(page, programName);
    expect(dialog.message()).toContain(programName);
    await dialog.dismiss();
    await clickPromise;

    await expect(programInList(page, programName)).toBeVisible();
  });

  test('TC-010 — Unauthenticated users cannot delete programs', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(PROGRAMS_URL);
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByRole('button', { name: '+ New Program' })).toHaveCount(0);

    await context.close();
  });

  test('TC-011 — Double-click confirm does not cause errors or duplicate delete calls to break the UI', async ({
    page,
  }) => {
    const programName = uniqueName('Test Program');

    await createProgram(page, programName, 'Double confirm test');

    // Native browser confirm only accepts once; assert a single confirm leaves UI usable.
    const { dialog, clickPromise } = await clickDeleteAndWaitForConfirm(page, programName);
    await dialog.accept();
    await clickPromise;

    await expect(programInList(page, programName)).toHaveCount(0);
    await expect(page.getByRole('button', { name: '+ New Program' })).toBeVisible();
    await expect(programModal(page)).toBeHidden();
  });

  test('TC-012 — Delete failure keeps the program and surfaces an error', async ({ page }) => {
    const programName = uniqueName('Test Program');

    await createProgram(page, programName, 'Failed delete test');

    await page.route('**/*', async (route) => {
      if (route.request().method() === 'DELETE' && /program/i.test(route.request().url())) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' }),
        });
        return;
      }
      await route.continue();
    });

    const { dialog, clickPromise } = await clickDeleteAndWaitForConfirm(page, programName);
    await dialog.accept();
    await clickPromise;

    await expect(programInList(page, programName)).toBeVisible();

    const errorFeedback = page
      .getByRole('alert')
      .filter({ hasText: /error|fail|unable|could not/i })
      .or(page.getByText(/error|fail|unable|could not/i));
    await expect(errorFeedback.first()).toBeVisible({ timeout: 10000 });
  });

  test('TC-013 — Confirming delete does not open the edit form', async ({ page }) => {
    const programName = uniqueName('Test Program');

    await createProgram(page, programName, 'Delete not edit test');
    await confirmDelete(page, programName);

    await expect(programModal(page)).toBeHidden();
    await expect(page.getByRole('heading', { name: 'Edit Program' })).toHaveCount(0);
    await expect(programInList(page, programName)).toHaveCount(0);
  });

  // Edge cases

  test('TC-014 — Program with special characters in Program Name can be deleted', async ({
    page,
  }) => {
    const programName = uniqueName('QA <Test> & "Prog" \'2026\'');

    await createProgram(page, programName, 'Special characters delete test');

    const { dialog, clickPromise } = await clickDeleteAndWaitForConfirm(page, programName);
    expect(dialog.message()).toContain(programName);
    expect(dialog.message()).not.toMatch(/<script/i);
    await dialog.accept();
    await clickPromise;

    await expect(programInList(page, programName)).toHaveCount(0);
  });

  test('TC-015 — Program with maximum-length Program Name (255) can be deleted', async ({
    page,
  }) => {
    const suffix = `-${Date.now()}`;
    const programName = fixedLengthString(PROGRAM_NAME_MAX_LENGTH - suffix.length) + suffix;

    await createProgram(page, programName, 'Max length delete test');
    await confirmDelete(page, programName);

    await expect(programInList(page, programName)).toHaveCount(0);
  });

  test('TC-016 — Program with maximum-length Description (1000) can be deleted', async ({
    page,
  }) => {
    const programName = uniqueName('Long Description Program');
    const description = fixedLengthString(DESCRIPTION_MAX_LENGTH);

    await createProgram(page, programName, description);
    await confirmDelete(page, programName);

    await expect(programInList(page, programName)).toHaveCount(0);
  });

  test('TC-017 — Program with Unicode / accented characters can be deleted', async ({ page }) => {
    const programName = uniqueName('Développement Web 日本語');

    await createProgram(page, programName, 'Unicode delete test');

    const { dialog, clickPromise } = await clickDeleteAndWaitForConfirm(page, programName);
    expect(dialog.message()).toContain(programName);
    await dialog.accept();
    await clickPromise;

    await expect(programInList(page, programName)).toHaveCount(0);
  });

  test('TC-018 — Deleting the last remaining program leaves an empty list state', async ({
    page,
  }) => {
    // Shared test env may contain other programs; assert target removal + New Program still works.
    const programName = uniqueName('Test Program');

    await createProgram(page, programName, 'Last program delete test');
    await confirmDelete(page, programName);

    await expect(programInList(page, programName)).toHaveCount(0);
    await expect(page.getByRole('button', { name: '+ New Program' })).toBeVisible();
  });

  test('TC-019 — Confirmation dialog identifies the correct program when names are similar', async ({
    page,
  }) => {
    const base = Date.now();
    const programName = `Test Program ${base}`;
    const similarName = `Test Program 2 ${base}`;

    await createProgram(page, programName, 'Similar name target');
    await createProgram(page, similarName, 'Similar name decoy');

    const { dialog: firstDialog, clickPromise: firstClickPromise } =
      await clickDeleteAndWaitForConfirm(page, programName);
    expect(firstDialog.message()).toContain(programName);
    expect(firstDialog.message()).not.toContain(similarName);
    await firstDialog.dismiss();
    await firstClickPromise;

    await expect(programInList(page, programName)).toBeVisible();
    await expect(programInList(page, similarName)).toBeVisible();

    await confirmDelete(page, similarName);

    await expect(programInList(page, similarName)).toHaveCount(0);
    await expect(programInList(page, programName)).toBeVisible();
  });

  test('TC-020 — Leading/trailing spaces in Program Name do not block delete', async ({ page }) => {
    const trimmedName = uniqueName('Spaced Program');
    const paddedName = `  ${trimmedName}  `;

    await openNewProgramModal(page);
    await programNameField(page).fill(paddedName);
    await createButton(page).click();
    await expect(programModal(page)).toBeHidden({ timeout: 10000 });
    await expect(programInList(page, trimmedName)).toBeVisible();

    await confirmDelete(page, trimmedName);

    await expect(programInList(page, trimmedName)).toHaveCount(0);
  });

  test('TC-021 — Keyboard: Escape cancels deletion (if supported)', async ({ page }) => {
    const programName = uniqueName('Test Program');

    await createProgram(page, programName, 'Escape cancel test');

    // Native confirm: dismiss() is the Playwright equivalent of Cancel / Escape.
    const { dialog, clickPromise } = await clickDeleteAndWaitForConfirm(page, programName);
    await dialog.dismiss();
    await clickPromise;

    await expect(programInList(page, programName)).toBeVisible();
  });

  test('TC-022 — Dashboard Programs count updates after deletion (if count is shown)', async ({
    page,
  }) => {
    const programName = uniqueName('Test Program');

    await gotoDashboard(page);
    const countLocator = programsDashboardCount(page);
    await expect(countLocator).toBeVisible({ timeout: 20000 });
    const countBefore = Number(await countLocator.innerText());
    expect(Number.isFinite(countBefore)).toBe(true);

    await gotoProgramsPage(page);
    await createProgram(page, programName, 'Dashboard count test');
    await confirmDelete(page, programName);

    await gotoDashboard(page);
    await expect(countLocator).toBeVisible({ timeout: 20000 });
    const countAfter = Number(await countLocator.innerText());

    expect(countAfter).toBe(countBefore);
  });
});
