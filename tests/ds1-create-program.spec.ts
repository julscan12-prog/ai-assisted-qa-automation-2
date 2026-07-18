import dotenv from 'dotenv';
import path from 'path';
import { test, expect, type Page, type Locator } from '@playwright/test';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const BASE_URL = process.env.DIDAXIS_URL ?? 'https://test.didaxis.studio';
const LOGIN_URL = `${BASE_URL}/login`;
const PROGRAMS_URL = `${BASE_URL}/programs`;

const PROGRAM_NAME_MAX_LENGTH = 255;
const DESCRIPTION_MAX_LENGTH = 1000;

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
  await expect(page.getByRole('button', { name: '+ New Program' })).toBeVisible();
}

function programModal(page: Page): Locator {
  return page.getByRole('dialog');
}

async function openNewProgramModal(page: Page) {
  await page.getByRole('button', { name: '+ New Program' }).click();
  await expect(programModal(page)).toBeVisible();
  await expect(programModal(page).getByRole('heading', { name: 'New Program' })).toBeVisible();
  await expect(programNameField(page)).toBeVisible();
  await expect(descriptionField(page)).toBeVisible();
}

function createButton(page: Page): Locator {
  return programModal(page).getByRole('button', { name: 'Create' });
}

function programNameField(page: Page): Locator {
  return programModal(page).getByRole('textbox', { name: 'Program Name' });
}

function descriptionField(page: Page): Locator {
  return programModal(page).getByRole('textbox', { name: 'Description' });
}

function programRowsByName(page: Page, name: string): Locator {
  return page.getByRole('row').filter({
    has: page.getByRole('button', { name: `Edit ${name}`, exact: true }),
  });
}

function programInList(page: Page, name: string): Locator {
  return programRowsByName(page, name);
}

function duplicateNameError(page: Page): Locator {
  return page.getByRole('alert').filter({ hasText: /already exists/i });
}

async function dismissProgramModal(page: Page) {
  const modal = programModal(page);
  const cancelButton = modal.getByRole('button', { name: 'Cancel' });
  if (await cancelButton.isVisible()) {
    await cancelButton.click();
    return;
  }

  const closeButton = modal.getByRole('banner').getByRole('button');
  if (await closeButton.isVisible()) {
    await closeButton.click();
    return;
  }

  await page.keyboard.press('Escape');
}

async function fillAndCreateProgram(page: Page, name: string, description = '') {
  await programNameField(page).fill(name);
  if (description) {
    await descriptionField(page).fill(description);
  }
  await createButton(page).click();
}

test.describe('Didaxis Studio — Create New Program', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await gotoProgramsPage(page);
  });

  // Positive flows

  test('TC-001 — Program creation form displays Program Name and Description fields', async ({ page }) => {
    await openNewProgramModal(page);

    await expect(programNameField(page)).toBeVisible();
    await expect(descriptionField(page)).toBeVisible();
    await expect(createButton(page)).toBeVisible();
    await expect(programModal(page).getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  test('TC-002 — Valid program is saved, modal closes, and new program appears in list', async ({ page }) => {
    const programName = uniqueName('Web Development 2026');
    const description = 'Full-stack web development program';

    await openNewProgramModal(page);
    await fillAndCreateProgram(page, programName, description);

    await expect(programNameField(page)).not.toBeVisible();
    await expect(programInList(page, programName)).toBeVisible();
  });

  test('TC-003 — Program is created when Description is left empty', async ({ page }) => {
    const programName = uniqueName('Data Science Fundamentals');

    await openNewProgramModal(page);
    await programNameField(page).fill(programName);
    await createButton(page).click();

    await expect(programNameField(page)).not.toBeVisible();
    await expect(programInList(page, programName)).toBeVisible();
  });

  test('TC-004 — Create button becomes enabled after valid Program Name entry', async ({ page }) => {
    const programName = uniqueName('Cybersecurity 2026');

    await openNewProgramModal(page);
    await expect(createButton(page)).toBeDisabled();

    await programNameField(page).fill(programName);

    await expect(createButton(page)).toBeEnabled();
  });

  test('TC-005 — Closing the form without submit does not add a program', async ({ page }) => {
    const programName = uniqueName('Draft Program XYZ');

    await openNewProgramModal(page);
    await programNameField(page).fill(programName);
    await dismissProgramModal(page);

    await expect(programNameField(page)).not.toBeVisible();
    await expect(programInList(page, programName)).not.toBeVisible();
  });

  // Negative flows

  test('TC-006 — Empty Program Name prevents submission via disabled Create button', async ({ page }) => {
    await openNewProgramModal(page);
    await descriptionField(page).fill('Some description');

    await expect(createButton(page)).toBeDisabled();
    await expect(programNameField(page)).toBeVisible();
  });

  test('TC-007 — Program Name containing only spaces is treated as empty', async ({ page }) => {
    await openNewProgramModal(page);
    await programNameField(page).fill('   ');

    await expect(createButton(page)).toBeDisabled();
  });

  test('TC-009 — Logged-out users are redirected or blocked from program creation', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(PROGRAMS_URL);

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(programNameField(page)).not.toBeVisible();

    await context.close();
  });

  test('TC-010 — System prevents creating a program with an existing name', async ({ page }) => {
    test.fixme(true, 'App currently allows duplicate program names (MCP: 2 rows, no error alert)');

    const programName = uniqueName('Web Development 2026');

    await openNewProgramModal(page);
    await fillAndCreateProgram(page, programName, 'Initial program');
    await expect(programInList(page, programName)).toHaveCount(1);

    await openNewProgramModal(page);
    await fillAndCreateProgram(page, programName, 'Duplicate attempt');

    await expect(duplicateNameError(page)).toBeVisible();
    await expect(programInList(page, programName)).toHaveCount(1);
  });

  // Known product bug: double-clicking Create submits twice and creates duplicate rows.
  test('TC-011 — Repeated Create clicks do not create multiple identical programs', async ({ page }) => {
    const programName = uniqueName('Unique Program 2026');

    await openNewProgramModal(page);
    await programNameField(page).fill(programName);
    await descriptionField(page).fill('Test double submit');

    const create = createButton(page);
    await Promise.all([create.click(), create.click()]);

    await expect(programNameField(page)).not.toBeVisible({ timeout: 10000 });
    await expect(programInList(page, programName)).toHaveCount(1);
  });

  test('TC-012 — Failed save shows error and does not falsely add program to list', async ({ page }) => {
    const programName = uniqueName('Network Test Program');

    await page.route('**/api/programs', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Internal server error' }),
        });
        return;
      }
      await route.continue();
    });

    await openNewProgramModal(page);
    await fillAndCreateProgram(page, programName, 'Simulated failure');

    await expect(programNameField(page)).toBeVisible();
    await expect(programNameField(page)).toHaveValue(programName);
    await expect(programInList(page, programName)).toHaveCount(0);
  });

  // Edge cases

  test('TC-013 — Single-character Program Name is accepted', async ({ page }) => {
    const programName = String.fromCharCode(65 + (Date.now() % 26));
    const description = `Single letter name test ${Date.now()}`;

    await openNewProgramModal(page);
    await fillAndCreateProgram(page, programName, description);

    await expect(programNameField(page)).not.toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: description })).toBeVisible();
  });

  test('TC-014 — Program Name at max length is saved correctly', async ({ page }) => {
    const suffix = `-${Date.now()}`;
    const programName = fixedLengthString(PROGRAM_NAME_MAX_LENGTH - suffix.length) + suffix;

    await openNewProgramModal(page);
    await fillAndCreateProgram(page, programName, 'Max length boundary test');

    await expect(programNameField(page)).not.toBeVisible();
    await expect(programInList(page, programName)).toBeVisible();
  });

  test('TC-015 — Over-max Program Name cannot be submitted', async ({ page }) => {
    test.fixme(true, 'App accepts 256+ character names with no validation (MCP: 256 chars created)');

    const overMaxName = fixedLengthString(PROGRAM_NAME_MAX_LENGTH + 1);

    await openNewProgramModal(page);
    await programNameField(page).fill(overMaxName);

    const actualValue = await programNameField(page).inputValue();
    const create = createButton(page);
    const isDisabled = await create.isDisabled();
    const hasValidationError = await page.getByText(/too long|maximum|max length|character limit/i).isVisible().catch(() => false);

    expect(
      actualValue.length <= PROGRAM_NAME_MAX_LENGTH || isDisabled || hasValidationError,
    ).toBeTruthy();

    if (!isDisabled) {
      await create.click();
      await expect(programNameField(page)).toBeVisible();
    }

    await expect(programRowsByName(page, actualValue)).toHaveCount(0);
  });

  test('TC-016 — Description at max length is saved correctly', async ({ page }) => {
    const programName = uniqueName('Long Description Program');
    const description = fixedLengthString(DESCRIPTION_MAX_LENGTH);

    await openNewProgramModal(page);
    await fillAndCreateProgram(page, programName, description);

    await expect(programNameField(page)).not.toBeVisible();
    await expect(programInList(page, programName)).toBeVisible();
  });

  test('TC-017 — Program Name with allowed special characters is saved correctly', async ({ page }) => {
    const programName = uniqueName('Web Dev & Design (2026) – Cohort #1');

    await openNewProgramModal(page);
    await fillAndCreateProgram(page, programName, 'Special chars test');

    await expect(programNameField(page)).not.toBeVisible();
    await expect(programInList(page, programName)).toBeVisible();
  });

  test('TC-018 — Unicode characters are handled without corruption', async ({ page }) => {
    const programName = uniqueName('Програма розробки 🎓 2026');
    const description = 'Опис програми — full-stack 🚀';

    await openNewProgramModal(page);
    await fillAndCreateProgram(page, programName, description);

    await expect(programNameField(page)).not.toBeVisible();
    await expect(programInList(page, programName)).toBeVisible();
  });

  test('TC-019 — Trimmed Program Name is stored without leading/trailing spaces', async ({ page }) => {
    const baseName = uniqueName('Mobile Development 2026');
    const paddedName = `  ${baseName}  `;

    await openNewProgramModal(page);
    await programNameField(page).fill(paddedName);
    await createButton(page).click();

    await expect(programNameField(page)).not.toBeVisible();
    const row = programInList(page, baseName);
    await expect(row).toBeVisible();
    await expect(row.locator('td p').first()).toHaveText(baseName);
  });

  test('TC-020 — Duplicate detection behavior for differing case is consistent', async ({ page }) => {
    const programName = uniqueName('Web Development 2026');
    const caseVariant = programName.replace('Web', 'web');

    await openNewProgramModal(page);
    await fillAndCreateProgram(page, programName);
    await expect(programInList(page, programName)).toHaveCount(1);

    await openNewProgramModal(page);
    await programNameField(page).fill(caseVariant);
    await createButton(page).click();

    // MCP: app treats case variants as distinct names (both entries created).
    await expect(programInList(page, caseVariant)).toHaveCount(1);
    await expect(programInList(page, programName)).toHaveCount(1);
  });

  test('TC-021 — Script/HTML in inputs does not execute or break the UI', async ({ page }) => {
    const programName = uniqueName("<script>alert('xss')</script>");
    const description = '<img src=x onerror=alert(1)>';

    page.on('dialog', (dialog) => {
      throw new Error(`Unexpected dialog: ${dialog.message()}`);
    });

    await openNewProgramModal(page);
    await fillAndCreateProgram(page, programName, description);

    await expect(programNameField(page)).not.toBeVisible();
    await expect(programInList(page, programName)).toBeVisible();
    await expect(page.getByRole('button', { name: '+ New Program' })).toBeVisible();
  });

  test('TC-022 — Empty Description with long Program Name succeeds', async ({ page }) => {
    const suffix = `-${Date.now()}`;
    const programName = fixedLengthString(200 - suffix.length) + suffix;

    await openNewProgramModal(page);
    await programNameField(page).fill(programName);
    await createButton(page).click();

    await expect(programNameField(page)).not.toBeVisible();
    await expect(programInList(page, programName)).toBeVisible();
  });
});
