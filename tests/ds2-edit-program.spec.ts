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

function programNameField(page: Page): Locator {
  return programModal(page).getByRole('textbox', { name: 'Program Name' });
}

function descriptionField(page: Page): Locator {
  return programModal(page).getByRole('textbox', { name: 'Description' });
}

function createButton(page: Page): Locator {
  return programModal(page).getByRole('button', { name: 'Create' });
}

function saveButton(page: Page): Locator {
  return programModal(page).getByRole('button', { name: 'Save' });
}

function editButton(page: Page, name: string): Locator {
  return page.getByRole('button', { name: `Edit ${name}`, exact: true });
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

async function openEditProgram(page: Page, name: string) {
  await editButton(page, name).click();
  await expect(programModal(page)).toBeVisible();
  await expect(programModal(page).getByRole('heading', { name: 'Edit Program' })).toBeVisible();
}

async function dismissEditModal(page: Page) {
  const modal = programModal(page);
  const cancelButton = modal.getByRole('button', { name: 'Cancel' });
  if (await cancelButton.isVisible()) {
    await cancelButton.click();
    await expect(modal).toBeHidden();
    return;
  }

  await page.keyboard.press('Escape');
  await expect(modal).toBeHidden();
}

async function waitForEditModalClosed(page: Page) {
  await expect(programModal(page)).toBeHidden({ timeout: 10000 });
}

test.describe('Didaxis Studio — Edit Existing Program Details', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await gotoProgramsPage(page);
  });

  // Positive flows

  test('TC-001 — Edit form opens pre-populated with the program\'s current data', async ({ page }) => {
    const programName = uniqueName('Web Development 2026');
    const description = 'Full-stack web development program';

    await createProgram(page, programName, description);
    await openEditProgram(page, programName);

    await expect(programNameField(page)).toHaveValue(programName);
    await expect(descriptionField(page)).toHaveValue(description);
  });

  test('TC-002 — Valid Program Name change is saved and reflected in the list', async ({ page }) => {
    const originalName = uniqueName('Web Development 2026');
    const updatedName = uniqueName('Web Development 2026 - Updated');

    await createProgram(page, originalName, 'Full-stack web development program');
    await openEditProgram(page, originalName);

    await programNameField(page).fill(updatedName);
    await saveButton(page).click();

    await waitForEditModalClosed(page);
    await expect(programInList(page, updatedName)).toBeVisible();
    await expect(programInList(page, originalName)).toHaveCount(0);
  });

  test('TC-003 — Saving after changing only Description leaves Program Name unchanged', async ({ page }) => {
    const programName = uniqueName('Web Development 2026');
    const originalDescription = 'Full-stack web development program';
    const updatedDescription = 'Updated full-stack curriculum for 2026';

    await createProgram(page, programName, originalDescription);
    await openEditProgram(page, programName);

    await descriptionField(page).fill(updatedDescription);
    await saveButton(page).click();

    await waitForEditModalClosed(page);
    await expect(programInList(page, programName)).toBeVisible();
    await expect(programDescriptionInList(page, programName)).toHaveText(updatedDescription);
  });

  test('TC-004 — Both Program Name and Description can be updated in one save', async ({ page }) => {
    const originalName = uniqueName('Data Science Fundamentals');
    const updatedName = uniqueName('Data Science Fundamentals - Advanced');
    const updatedDescription = 'Advanced statistics and machine learning track';

    await createProgram(page, originalName, 'Introductory data science track');
    await openEditProgram(page, originalName);

    await programNameField(page).fill(updatedName);
    await descriptionField(page).fill(updatedDescription);
    await saveButton(page).click();

    await waitForEditModalClosed(page);
    await expect(programInList(page, updatedName)).toBeVisible();
    await expect(programDescriptionInList(page, updatedName)).toHaveText(updatedDescription);
    await expect(programInList(page, originalName)).toHaveCount(0);
  });

  test('TC-005 — Description can be cleared when Program Name remains valid', async ({ page }) => {
    const programName = uniqueName('Cybersecurity 2026');

    await createProgram(page, programName, 'Security fundamentals and labs');
    await openEditProgram(page, programName);

    await descriptionField(page).fill('');
    await saveButton(page).click();

    await waitForEditModalClosed(page);
    await expect(programInList(page, programName)).toBeVisible();
    await expect(programDescriptionInList(page, programName)).toHaveCount(0);
  });

  test('TC-006 — Save button is enabled when valid changes are made', async ({ page }) => {
    const programName = uniqueName('Web Development 2026');

    await createProgram(page, programName, 'Full-stack web development program');
    await openEditProgram(page, programName);

    await descriptionField(page).fill('Minor wording update');
    await expect(saveButton(page)).toBeEnabled();

    await saveButton(page).click();
    await waitForEditModalClosed(page);
    await expect(programInList(page, programName)).toBeVisible();
  });

  test('TC-007 — Dismissing the edit form without saving leaves program data unchanged', async ({ page }) => {
    const programName = uniqueName('Web Development 2026');
    const description = 'Full-stack web development program';

    await createProgram(page, programName, description);
    await openEditProgram(page, programName);

    await programNameField(page).fill('Should Not Be Saved');
    await dismissEditModal(page);

    await expect(programInList(page, programName)).toBeVisible();
    await expect(programInList(page, 'Should Not Be Saved')).toHaveCount(0);
    await expect(programDescriptionInList(page, programName)).toHaveText(description);
  });

  test('TC-008 — Saving with no field changes does not corrupt program data', async ({ page }) => {
    const programName = uniqueName('Web Development 2026');
    const description = 'Full-stack web development program';

    await createProgram(page, programName, description);
    await openEditProgram(page, programName);

    const save = saveButton(page);
    if (await save.isEnabled()) {
      await save.click();
      await waitForEditModalClosed(page);
    } else {
      await dismissEditModal(page);
    }

    await expect(programInList(page, programName)).toHaveCount(1);
    await expect(programDescriptionInList(page, programName)).toHaveText(description);
  });

  // Negative flows

  test('TC-009 — Empty Program Name prevents save', async ({ page }) => {
    const programName = uniqueName('Web Development 2026');

    await createProgram(page, programName, 'Full-stack web development program');
    await openEditProgram(page, programName);

    await programNameField(page).fill('');
    await expect(saveButton(page)).toBeDisabled();

    await dismissEditModal(page);
    await expect(programInList(page, programName)).toBeVisible();
  });

  test('TC-010 — Whitespace-only Program Name is rejected on save', async ({ page }) => {
    const programName = uniqueName('Web Development 2026');

    await createProgram(page, programName, 'Full-stack web development program');
    await openEditProgram(page, programName);

    await programNameField(page).fill('   ');
    await expect(saveButton(page)).toBeDisabled();

    await dismissEditModal(page);
    await expect(programInList(page, programName)).toBeVisible();
  });

  test('TC-012 — Unauthenticated users are blocked from editing programs', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(PROGRAMS_URL);

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Edit Program' })).toHaveCount(0);

    await context.close();
  });

  test('TC-013 — Renaming a program to an existing program name is rejected', async ({ page }) => {
    test.fixme(true, 'App currently allows duplicate program names on create/edit (same as DS-1 TC-010)');

    const existingName = uniqueName('Web Development 2026');
    const otherName = uniqueName('Mobile Development 2026');

    await createProgram(page, existingName, 'Existing program');
    await createProgram(page, otherName, 'Other program');

    await openEditProgram(page, otherName);
    await programNameField(page).fill(existingName);
    await saveButton(page).click();

    await expect(duplicateNameError(page)).toBeVisible();
    await expect(programInList(page, otherName)).toHaveCount(1);
    await expect(programInList(page, existingName)).toHaveCount(1);
  });

  test('TC-014 — Renaming a program to its own current name does not create a duplicate', async ({ page }) => {
    const programName = uniqueName('Web Development 2026');
    const updatedDescription = 'Description-only update';

    await createProgram(page, programName, 'Full-stack web development program');
    await openEditProgram(page, programName);

    await expect(programNameField(page)).toHaveValue(programName);
    await descriptionField(page).fill(updatedDescription);
    await saveButton(page).click();

    await waitForEditModalClosed(page);
    await expect(programInList(page, programName)).toHaveCount(1);
    await expect(programDescriptionInList(page, programName)).toHaveText(updatedDescription);
  });

  test('TC-015 — Repeated Save clicks do not create duplicate programs or corrupt data', async ({ page }) => {
    const originalName = uniqueName('Web Development 2026');
    const updatedName = uniqueName('Web Development 2026 - Revised');

    await createProgram(page, originalName, 'Full-stack web development program');
    await openEditProgram(page, originalName);

    await programNameField(page).fill(updatedName);
    const save = saveButton(page);
    await Promise.all([save.click(), save.click()]);

    await waitForEditModalClosed(page);
    await expect(programInList(page, updatedName)).toHaveCount(1);
    await expect(programInList(page, originalName)).toHaveCount(0);
  });

  test('TC-016 — Failed save shows error and does not falsely update the list', async ({ page }) => {
    const programName = uniqueName('Web Development 2026');
    const failedName = uniqueName('Network Failure Test');

    await createProgram(page, programName, 'Full-stack web development program');

    await page.route('**/api/programs/**', async (route) => {
      const method = route.request().method();
      if (method === 'PUT' || method === 'PATCH') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Internal server error' }),
        });
        return;
      }
      await route.continue();
    });

    await openEditProgram(page, programName);
    await programNameField(page).fill(failedName);
    await saveButton(page).click();

    await expect(programModal(page)).toBeVisible();
    await expect(programNameField(page)).toHaveValue(failedName);
    await expect(programInList(page, programName)).toBeVisible();
    await expect(programInList(page, failedName)).toHaveCount(0);
  });

  // Edge cases

  test('TC-017 — Single-character Program Name is accepted on edit', async ({ page }) => {
    const originalName = uniqueName('QA Boundary Test Program');
    const singleCharName = String.fromCharCode(65 + (Date.now() % 26));
    const description = `Single letter rename ${Date.now()}`;

    await createProgram(page, originalName, description);
    await openEditProgram(page, originalName);

    await programNameField(page).fill(singleCharName);
    await saveButton(page).click();

    await waitForEditModalClosed(page);
    await expect(page.getByRole('row').filter({ hasText: description })).toBeVisible();
    await expect(editButton(page, singleCharName)).toBeVisible();
  });

  test('TC-018 — Program Name at max length is saved correctly on edit', async ({ page }) => {
    const originalName = uniqueName('Max Length Source Program');
    const suffix = `-${Date.now()}`;
    const maxName = fixedLengthString(PROGRAM_NAME_MAX_LENGTH - suffix.length) + suffix;

    await createProgram(page, originalName, 'Max length edit source');
    await openEditProgram(page, originalName);

    await programNameField(page).fill(maxName);
    await saveButton(page).click();

    await waitForEditModalClosed(page);
    await expect(programInList(page, maxName)).toBeVisible();
  });

  test('TC-019 — Over-max Program Name cannot be saved on edit', async ({ page }) => {
    test.fixme(true, 'App accepts 256+ character names with no validation (same as DS-1 TC-015)');

    const programName = uniqueName('Web Development 2026');
    const overMaxName = fixedLengthString(PROGRAM_NAME_MAX_LENGTH + 1);

    await createProgram(page, programName, 'Over-max edit source');
    await openEditProgram(page, programName);

    await programNameField(page).fill(overMaxName);

    const actualValue = await programNameField(page).inputValue();
    const save = saveButton(page);
    const isDisabled = await save.isDisabled();
    const hasValidationError = await page
      .getByText(/too long|maximum|max length|character limit/i)
      .isVisible()
      .catch(() => false);

    expect(
      actualValue.length <= PROGRAM_NAME_MAX_LENGTH || isDisabled || hasValidationError,
    ).toBeTruthy();

    if (!isDisabled) {
      await save.click();
      await expect(programModal(page)).toBeVisible();
    }

    await expect(programInList(page, programName)).toBeVisible();
  });

  test('TC-020 — Description at max length is saved correctly on edit', async ({ page }) => {
    const programName = uniqueName('Web Development 2026');
    const description = fixedLengthString(DESCRIPTION_MAX_LENGTH);

    await createProgram(page, programName, 'Short description');
    await openEditProgram(page, programName);

    await descriptionField(page).fill(description);
    await saveButton(page).click();

    await waitForEditModalClosed(page);
    await expect(programInList(page, programName)).toBeVisible();

    await openEditProgram(page, programName);
    await expect(descriptionField(page)).toHaveValue(description);
  });

  test('TC-021 — Program Name with special characters is saved correctly on edit', async ({ page }) => {
    const originalName = uniqueName('Web Development 2026');
    const specialName = uniqueName('Web Dev & Design (2026) – Cohort #1');

    await createProgram(page, originalName, 'Special chars source');
    await openEditProgram(page, originalName);

    await programNameField(page).fill(specialName);
    await saveButton(page).click();

    await waitForEditModalClosed(page);
    await expect(programInList(page, specialName)).toBeVisible();
  });

  test('TC-022 — Unicode and emoji in fields are preserved on edit', async ({ page }) => {
    const originalName = uniqueName('Web Development 2026');
    const unicodeName = uniqueName('Програма розробки 🎓 2026');
    const unicodeDescription = 'Опис програми — full-stack 🚀';

    await createProgram(page, originalName, 'Unicode source');
    await openEditProgram(page, originalName);

    await programNameField(page).fill(unicodeName);
    await descriptionField(page).fill(unicodeDescription);
    await saveButton(page).click();

    await waitForEditModalClosed(page);
    await expect(programInList(page, unicodeName)).toBeVisible();
    await expect(programDescriptionInList(page, unicodeName)).toHaveText(unicodeDescription);
  });

  test('TC-023 — Leading and trailing spaces in Program Name are trimmed on save', async ({ page }) => {
    const originalName = uniqueName('Web Development 2026');
    const trimmedName = uniqueName('Mobile Development 2026');
    const paddedName = `  ${trimmedName}  `;

    await createProgram(page, originalName, 'Trim source');
    await openEditProgram(page, originalName);

    await programNameField(page).fill(paddedName);
    await saveButton(page).click();

    await waitForEditModalClosed(page);
    const row = programInList(page, trimmedName);
    await expect(row).toBeVisible();
    await expect(row.locator('td p').first()).toHaveText(trimmedName);
  });

  test('TC-024 — Case-variant duplicate name policy is applied consistently on edit', async ({ page }) => {
    const existingName = uniqueName('Web Development 2026');
    const otherName = uniqueName('Mobile Development 2026');
    const caseVariant = existingName.replace('Web', 'web');

    await createProgram(page, existingName, 'Case policy existing');
    await createProgram(page, otherName, 'Case policy other');

    await openEditProgram(page, otherName);
    await programNameField(page).fill(caseVariant);
    await saveButton(page).click();

    // Observed create-flow policy (DS-1): case variants are treated as distinct names.
    await waitForEditModalClosed(page);
    await expect(programInList(page, caseVariant)).toHaveCount(1);
    await expect(programInList(page, existingName)).toHaveCount(1);
  });

  test('TC-025 — HTML and script content in fields is safely handled on edit', async ({ page }) => {
    const originalName = uniqueName('Web Development 2026');
    const xssName = uniqueName("<script>alert('xss')</script>");
    const xssDescription = '<img src=x onerror=alert(1)>';

    page.on('dialog', (dialog) => {
      throw new Error(`Unexpected dialog: ${dialog.message()}`);
    });

    await createProgram(page, originalName, 'XSS source');
    await openEditProgram(page, originalName);

    await programNameField(page).fill(xssName);
    await descriptionField(page).fill(xssDescription);
    await saveButton(page).click();

    await waitForEditModalClosed(page);
    await expect(programInList(page, xssName)).toBeVisible();
    await expect(page.getByRole('button', { name: '+ New Program' })).toBeVisible();
  });

  test('TC-026 — Edit succeeds when Description is empty and Program Name is long', async ({ page }) => {
    const originalName = uniqueName('Long Name Source Program');
    const suffix = `-${Date.now()}`;
    const longName = fixedLengthString(200 - suffix.length) + suffix;

    await createProgram(page, originalName, 'Short description');
    await openEditProgram(page, originalName);

    await programNameField(page).fill(longName);
    await descriptionField(page).fill('');
    await saveButton(page).click();

    await waitForEditModalClosed(page);
    await expect(programInList(page, longName)).toBeVisible();
  });

  test('TC-027 — Program with empty Description opens edit form with empty Description field', async ({ page }) => {
    const programName = uniqueName('Minimal Program');

    await createProgram(page, programName);
    await openEditProgram(page, programName);

    await expect(programNameField(page)).toHaveValue(programName);
    await expect(descriptionField(page)).toHaveValue('');
  });
});
