import dotenv from 'dotenv';
import path from 'path';
import { test, expect, type Page, type Locator } from '@playwright/test';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const BASE_URL = process.env.DIDAXIS_URL ?? 'https://test.didaxis.studio';
const LOGIN_URL = `${BASE_URL}/login`;
const PROGRAMS_URL = `${BASE_URL}/programs`;

/** Confluence: Program Setup — Field Definitions */
const PROGRAM_NAME_MAX_LENGTH = 100;

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

function programNameField(page: Page): Locator {
  return programModal(page).getByRole('textbox', { name: 'Program Name' });
}

function descriptionField(page: Page): Locator {
  return programModal(page).getByRole('textbox', { name: 'Description' });
}

function createButton(page: Page): Locator {
  return programModal(page).getByRole('button', { name: 'Create' });
}

function programRowsByName(page: Page, name: string): Locator {
  return page.getByRole('row').filter({
    has: page.getByRole('button', { name: `Edit ${name}`, exact: true }),
  });
}

function programInList(page: Page, name: string): Locator {
  return programRowsByName(page, name);
}

function programDescriptionInList(page: Page, name: string): Locator {
  return programInList(page, name).locator('td').first().locator('p').nth(1);
}

function duplicateNameError(page: Page): Locator {
  return page.getByRole('alert').filter({ hasText: /already exists/i });
}

async function openNewProgramModal(page: Page) {
  await page.getByRole('button', { name: '+ New Program' }).click();
  await expect(programModal(page)).toBeVisible();
  await expect(programModal(page).getByRole('heading', { name: 'New Program' })).toBeVisible();
  await expect(programNameField(page)).toBeVisible();
  await expect(descriptionField(page)).toBeVisible();
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

async function waitForCreateModalClosed(page: Page) {
  await expect(programModal(page)).toBeHidden({ timeout: 10000 });
}

test.describe('Didaxis Studio — Program Name Validation and Duplicate Prevention', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await gotoProgramsPage(page);
  });

  // Positive flows

  test('TC-001 — Program with special characters in the name is created successfully', async ({ page }) => {
    const programName = uniqueName('Informatique & IA - Niveau 2');
    const description = 'Advanced informatics and AI track, level 2';

    await openNewProgramModal(page);
    await programNameField(page).fill(programName);
    await descriptionField(page).fill(description);
    await createButton(page).click();

    await waitForCreateModalClosed(page);
    const row = programInList(page, programName);
    await expect(row).toBeVisible();
    await expect(row.locator('td p').first()).toHaveText(programName);
  });

  test('TC-002 — Valid alphanumeric program name is accepted', async ({ page }) => {
    const programName = uniqueName('Web Development 2026');
    const description = 'Full-stack web development program';

    await openNewProgramModal(page);
    await programNameField(page).fill(programName);
    await descriptionField(page).fill(description);
    await createButton(page).click();

    await waitForCreateModalClosed(page);
    await expect(programInList(page, programName)).toBeVisible();
  });

  test('TC-003 — Program name with parentheses, hash, and en-dash is accepted', async ({ page }) => {
    const programName = uniqueName('Web Dev & Design (2026) – Cohort #1');
    const description = 'Special characters validation test';

    await openNewProgramModal(page);
    await programNameField(page).fill(programName);
    await descriptionField(page).fill(description);
    await createButton(page).click();

    await waitForCreateModalClosed(page);
    const row = programInList(page, programName);
    await expect(row).toBeVisible();
    await expect(row.locator('td p').first()).toHaveText(programName);
  });

  test('TC-004 — Program is created when Description is empty but Program Name is valid', async ({ page }) => {
    const programName = uniqueName('Data Science Fundamentals');

    await openNewProgramModal(page);
    await programNameField(page).fill(programName);
    await expect(descriptionField(page)).toHaveValue('');
    await createButton(page).click();

    await waitForCreateModalClosed(page);
    await expect(programInList(page, programName)).toBeVisible();
  });

  // Negative flows

  test('TC-005 — Whitespace-only Program Name prevents form submission', async ({ page }) => {
    await openNewProgramModal(page);
    await programNameField(page).fill('   ');
    await descriptionField(page).fill('Some description text');

    await expect(createButton(page)).toBeDisabled();
    await expect(programModal(page)).toBeVisible();
  });

  test('TC-006 — Empty Program Name prevents submission', async ({ page }) => {
    await openNewProgramModal(page);
    await descriptionField(page).fill('Description without a name');

    await expect(createButton(page)).toBeDisabled();
    await expect(programModal(page)).toBeVisible();
  });

  test('TC-007 — Duplicate Program Name is rejected with a clear error', async ({ page }) => {
    const programName = uniqueName('Web Development 2026');

    await createProgram(page, programName, 'Initial program');
    await expect(programInList(page, programName)).toHaveCount(1);

    await openNewProgramModal(page);
    await programNameField(page).fill(programName);
    await descriptionField(page).fill('Duplicate attempt description');
    await createButton(page).click();

    await expect(duplicateNameError(page)).toBeVisible();
    await expect(programInList(page, programName)).toHaveCount(1);
  });

  test('TC-008 — Duplicate name does not overwrite the existing program', async ({ page }) => {
    const programName = uniqueName('Web Development 2026');
    const originalDescription = 'Full-stack web development program';

    await createProgram(page, programName, originalDescription);

    await openNewProgramModal(page);
    await programNameField(page).fill(programName);
    await descriptionField(page).fill('This should not replace the original description');
    await createButton(page).click();

    await expect(duplicateNameError(page)).toBeVisible();
    await expect(programInList(page, programName)).toHaveCount(1);
    await expect(programDescriptionInList(page, programName)).toHaveText(originalDescription);
  });

  test('TC-009 — Repeated Create clicks do not create multiple programs with the same name', async ({ page }) => {
    const programName = uniqueName('Unique Program 2026');

    await openNewProgramModal(page);
    await programNameField(page).fill(programName);
    await descriptionField(page).fill('Double submit test');

    const create = createButton(page);
    await Promise.all([create.click(), create.click()]);

    await waitForCreateModalClosed(page);
    await expect(programInList(page, programName)).toHaveCount(1);
  });

  // Edge cases

  test('TC-011 — Tabs and newlines only in Program Name are treated as empty', async ({ page }) => {
    await openNewProgramModal(page);

    await programNameField(page).fill('\t\t');
    await expect(createButton(page)).toBeDisabled();

    // Single-line textbox strips newlines; result is empty → Create stays disabled
    await programNameField(page).fill('\n\n');
    await expect(programNameField(page)).toHaveValue('');
    await expect(createButton(page)).toBeDisabled();
  });

  test('TC-012 — Leading and trailing whitespace is trimmed before save and duplicate check', async ({ page }) => {
    const trimmedName = uniqueName('Mobile Development 2026');
    const paddedName = `  ${trimmedName}  `;

    await openNewProgramModal(page);
    await programNameField(page).fill(paddedName);
    await createButton(page).click();

    await waitForCreateModalClosed(page);
    const row = programInList(page, trimmedName);
    await expect(row).toBeVisible();
    await expect(row.locator('td p').first()).toHaveText(trimmedName);
  });

  test('TC-013 — Duplicate is detected when new name matches existing name after trim', async ({ page }) => {
    const programName = uniqueName('Web Development 2026');

    await createProgram(page, programName, 'Existing program');

    await openNewProgramModal(page);
    await programNameField(page).fill(`  ${programName}  `);
    await createButton(page).click();

    await expect(duplicateNameError(page)).toBeVisible();
    await expect(programInList(page, programName)).toHaveCount(1);
  });

  test('TC-014 — Single-character Program Name is accepted', async ({ page }) => {
    const programName = String.fromCharCode(65 + (Date.now() % 26));
    const description = `Minimum length boundary test ${Date.now()}`;

    await openNewProgramModal(page);
    await programNameField(page).fill(programName);
    await descriptionField(page).fill(description);
    await createButton(page).click();

    await waitForCreateModalClosed(page);
    await expect(page.getByRole('row').filter({ hasText: description })).toBeVisible();
    await expect(page.getByRole('button', { name: `Edit ${programName}`, exact: true })).toBeVisible();
  });

  test('TC-015 — Program Name at maximum length is accepted', async ({ page }) => {
    const suffix = `-${Date.now()}`.slice(-8);
    const programName = fixedLengthString(PROGRAM_NAME_MAX_LENGTH - suffix.length) + suffix;

    await openNewProgramModal(page);
    await programNameField(page).fill(programName);
    await descriptionField(page).fill('Max length boundary test');
    await createButton(page).click();

    await waitForCreateModalClosed(page);
    await expect(programInList(page, programName)).toBeVisible();
  });

  test('TC-016 — Program Name exceeding maximum length is rejected', async ({ page }) => {
    const overMaxName = fixedLengthString(PROGRAM_NAME_MAX_LENGTH + 1);

    await openNewProgramModal(page);
    await programNameField(page).fill(overMaxName);
    await expect(programNameField(page)).toHaveValue(overMaxName);

    const create = createButton(page);
    await expect(create).toBeDisabled();

    await expect(programRowsByName(page, overMaxName)).toHaveCount(0);
  });

  test('TC-017 — Unicode and emoji in Program Name are preserved', async ({ page }) => {
    const programName = uniqueName('Програма розробки 🎓 2026');
    const description = 'Unicode and emoji test';

    await openNewProgramModal(page);
    await programNameField(page).fill(programName);
    await descriptionField(page).fill(description);
    await createButton(page).click();

    await waitForCreateModalClosed(page);
    const row = programInList(page, programName);
    await expect(row).toBeVisible();
    await expect(row.locator('td p').first()).toHaveText(programName);
  });

  test('TC-018 — Case-variant duplicate name is rejected', async ({ page }) => {
    const programName = uniqueName('Web Development 2026');
    const caseVariant = programName.replace('Web', 'web');

    await createProgram(page, programName, 'Case policy existing');

    await openNewProgramModal(page);
    await programNameField(page).fill(caseVariant);
    await createButton(page).click();

    await expect(duplicateNameError(page)).toBeVisible();
    await expect(programInList(page, caseVariant)).toHaveCount(0);
    await expect(programInList(page, programName)).toHaveCount(1);
  });

  test('TC-019 — HTML/script content in Program Name does not execute or break the UI', async ({ page }) => {
    const programName = uniqueName("<script>alert('xss')</script>");
    const description = 'XSS validation test';

    page.on('dialog', (dialog) => {
      throw new Error(`Unexpected dialog: ${dialog.message()}`);
    });

    await openNewProgramModal(page);
    await programNameField(page).fill(programName);
    await descriptionField(page).fill(description);
    await createButton(page).click();

    await waitForCreateModalClosed(page);
    await expect(programInList(page, programName)).toBeVisible();
    await expect(page.getByRole('button', { name: '+ New Program' })).toBeVisible();
  });

  test('TC-020 — Whitespace becomes valid after user adds non-space characters', async ({ page }) => {
    const trimmedName = uniqueName('Cybersecurity 2026');

    await openNewProgramModal(page);
    await programNameField(page).fill('   ');
    await expect(createButton(page)).toBeDisabled();

    await programNameField(page).fill(`   ${trimmedName}   `);
    await expect(createButton(page)).toBeEnabled();
    await createButton(page).click();

    await waitForCreateModalClosed(page);
    const row = programInList(page, trimmedName);
    await expect(row).toBeVisible();
    await expect(row.locator('td p').first()).toHaveText(trimmedName);
  });
});
