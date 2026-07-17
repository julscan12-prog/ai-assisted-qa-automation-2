import { test, expect, type Page } from '@playwright/test';

const TODO_URL = 'https://demo.playwright.dev/todomvc/';

async function gotoApp(page: Page) {
  await page.goto(TODO_URL);
}

async function addTodo(page: Page, text: string) {
  const input = page.getByPlaceholder('What needs to be done?');
  await input.fill(text);
  await input.press('Enter');
}

function todoItem(page: Page, text: string) {
  return page.getByRole('listitem').filter({ hasText: text });
}

test.describe('TodoMVC', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
  });

  // Positive flows

  test('TC-001 — New todo appears in the list after Enter is pressed', async ({ page }) => {
    await addTodo(page, 'Buy groceries');

    await expect(page.getByText('Buy groceries')).toBeVisible();
    await expect(page.getByPlaceholder('What needs to be done?')).toHaveValue('');
    await expect(page.getByText('1 item left')).toBeVisible();
  });

  test('TC-002 — Multiple todos are added and displayed in creation order', async ({ page }) => {
    await addTodo(page, 'Buy groceries');
    await addTodo(page, 'Walk the dog');
    await addTodo(page, 'Pay bills');

    const items = page.getByRole('listitem');
    await expect(items.nth(0)).toContainText('Buy groceries');
    await expect(items.nth(1)).toContainText('Walk the dog');
    await expect(items.nth(2)).toContainText('Pay bills');
    await expect(page.getByText('3 items left')).toBeVisible();
  });

  test('TC-003 — Todo item is marked completed when its checkbox is checked', async ({ page }) => {
    await addTodo(page, 'Buy groceries');

    await todoItem(page, 'Buy groceries').getByRole('checkbox', { name: 'Toggle Todo' }).check();

    await expect(todoItem(page, 'Buy groceries')).toHaveClass(/completed/);
    await expect(page.getByText('0 items left')).toBeVisible();
  });

  test('TC-004 — Completed todo can be toggled back to active', async ({ page }) => {
    await addTodo(page, 'Buy groceries');
    const checkbox = todoItem(page, 'Buy groceries').getByRole('checkbox', { name: 'Toggle Todo' });
    await checkbox.check();
    await checkbox.uncheck();

    await expect(todoItem(page, 'Buy groceries')).not.toHaveClass(/completed/);
    await expect(page.getByText('1 item left')).toBeVisible();
  });

  test('TC-005 — Single todo is removed from the list via the delete button', async ({ page }) => {
    await addTodo(page, 'Buy groceries');
    const item = todoItem(page, 'Buy groceries');

    await item.hover();
    await item.getByRole('button', { name: 'Delete' }).click();

    await expect(page.getByText('Buy groceries')).not.toBeVisible();
    await expect(page.getByText(/item(s)? left/)).not.toBeVisible();
  });

  test('TC-006 — One todo is deleted while others remain', async ({ page }) => {
    await addTodo(page, 'Buy groceries');
    await addTodo(page, 'Walk the dog');
    await addTodo(page, 'Pay bills');
    const item = todoItem(page, 'Walk the dog');

    await item.hover();
    await item.getByRole('button', { name: 'Delete' }).click();

    await expect(page.getByText('Walk the dog')).not.toBeVisible();
    await expect(page.getByText('Buy groceries')).toBeVisible();
    await expect(page.getByText('Pay bills')).toBeVisible();
    await expect(page.getByText('2 items left')).toBeVisible();
  });

  test('TC-007 — Completed todo is removed via Clear completed', async ({ page }) => {
    await addTodo(page, 'Buy groceries');
    await addTodo(page, 'Walk the dog');
    await todoItem(page, 'Walk the dog').getByRole('checkbox', { name: 'Toggle Todo' }).check();

    await page.getByRole('button', { name: 'Clear completed' }).click();

    await expect(page.getByText('Walk the dog')).not.toBeVisible();
    await expect(page.getByText('Buy groceries')).toBeVisible();
    await expect(todoItem(page, 'Buy groceries')).not.toHaveClass(/completed/);
    await expect(page.getByText('1 item left')).toBeVisible();
  });

  test('TC-008 — All todos are marked complete via Mark all as complete', async ({ page }) => {
    await addTodo(page, 'Buy groceries');
    await addTodo(page, 'Walk the dog');
    await addTodo(page, 'Pay bills');

    await page.getByRole('checkbox', { name: 'Mark all as complete' }).check();

    await expect(todoItem(page, 'Buy groceries')).toHaveClass(/completed/);
    await expect(todoItem(page, 'Walk the dog')).toHaveClass(/completed/);
    await expect(todoItem(page, 'Pay bills')).toHaveClass(/completed/);
    await expect(page.getByText('0 items left')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Clear completed' })).toBeVisible();
  });

  // Negative flows

  test('TC-009 — Empty submission does not add a todo item', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    await input.click();
    await input.press('Enter');

    await expect(page.getByRole('listitem')).toHaveCount(0);
    await expect(page.getByText(/item(s)? left/)).not.toBeVisible();
  });

  test('TC-010 — Whitespace-only input does not create a todo', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill('   ');
    await input.press('Enter');

    await expect(page.getByRole('listitem')).toHaveCount(0);
  });

  test('TC-011 — Delete button is not actionable without hovering the todo row', async ({ page }) => {
    await addTodo(page, 'Buy groceries');
    const deleteButton = todoItem(page, 'Buy groceries').getByRole('button', { name: 'Delete' });

    await expect(deleteButton).not.toBeVisible();
    await expect(page.getByText('Buy groceries')).toBeVisible();
  });

  test('TC-012 — Completing a todo does not remove it from the list', async ({ page }) => {
    await addTodo(page, 'Buy groceries');

    await todoItem(page, 'Buy groceries').getByRole('checkbox', { name: 'Toggle Todo' }).check();

    await expect(page.getByText('Buy groceries')).toBeVisible();
    await expect(todoItem(page, 'Buy groceries')).toHaveClass(/completed/);
  });

  test('TC-013 — Clear completed has no effect when no todos are completed', async ({ page }) => {
    await addTodo(page, 'Buy groceries');
    await addTodo(page, 'Walk the dog');

    await expect(page.getByRole('button', { name: 'Clear completed' })).not.toBeVisible();
    await expect(page.getByText('Buy groceries')).toBeVisible();
    await expect(page.getByText('Walk the dog')).toBeVisible();
  });

  // Edge cases

  test('TC-014 — Todo text with special characters is stored and displayed correctly', async ({ page }) => {
    const text = 'Buy milk & eggs @ 50% off!';
    await addTodo(page, text);

    await expect(page.getByText(text)).toBeVisible();
  });

  test('TC-015 — Duplicate todo titles are allowed as separate list entries', async ({ page }) => {
    await addTodo(page, 'Buy groceries');
    await addTodo(page, 'Buy groceries');

    await expect(page.getByRole('listitem').filter({ hasText: 'Buy groceries' })).toHaveCount(2);
    await expect(page.getByText('2 items left')).toBeVisible();
  });

  test('TC-016 — Very long todo text is accepted and fully visible or truncated per UI rules', async ({ page }) => {
    const longText =
      'Plan quarterly review meeting with design team and stakeholders to align on roadmap priorities deliverables and success metrics for Q3 launch';
    await addTodo(page, longText);

    await expect(page.getByText(longText)).toBeVisible();
    await expect(page.getByText('1 item left')).toBeVisible();
  });

  test('TC-017 — Unicode and emoji characters are preserved in todo text', async ({ page }) => {
    const text = 'Купити продукти 🛒';
    await addTodo(page, text);

    await expect(page.getByText(text)).toBeVisible();
  });

  test('TC-018 — Leading and trailing spaces in todo text are handled consistently', async ({ page }) => {
    await addTodo(page, '  Buy groceries  ');

    const item = page.getByRole('listitem').first();
    await expect(item).toBeVisible();
    const label = (await item.textContent())?.trim() ?? '';
    expect(label === 'Buy groceries' || label === '  Buy groceries  ').toBeTruthy();

    await item.getByRole('checkbox', { name: 'Toggle Todo' }).check();
    await item.hover();
    await item.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByRole('listitem')).toHaveCount(0);
  });

  test('TC-019 — Active items left counter uses singular grammar for one item', async ({ page }) => {
    await addTodo(page, 'Buy groceries');

    await expect(page.getByText('1 item left')).toBeVisible();
    await expect(page.getByText('1 items left')).not.toBeVisible();
  });

  test('TC-020 — Active items left counter uses plural grammar for multiple items', async ({ page }) => {
    await addTodo(page, 'Buy groceries');
    await addTodo(page, 'Walk the dog');

    await expect(page.getByText('2 items left')).toBeVisible();
  });

  test('TC-021 — Todo list persists after page reload via local storage', async ({ page }) => {
    await addTodo(page, 'Buy groceries');
    await addTodo(page, 'Walk the dog');
    await todoItem(page, 'Walk the dog').getByRole('checkbox', { name: 'Toggle Todo' }).check();

    await page.reload();

    await expect(page.getByText('Buy groceries')).toBeVisible();
    await expect(page.getByText('Walk the dog')).toBeVisible();
    await expect(todoItem(page, 'Buy groceries')).not.toHaveClass(/completed/);
    await expect(todoItem(page, 'Walk the dog')).toHaveClass(/completed/);
    await expect(page.getByText('1 item left')).toBeVisible();
  });

  test('TC-022 — Filter Active shows only incomplete todos', async ({ page }) => {
    await addTodo(page, 'Buy groceries');
    await addTodo(page, 'Walk the dog');
    await todoItem(page, 'Buy groceries').getByRole('checkbox', { name: 'Toggle Todo' }).check();

    await page.getByRole('link', { name: 'Active' }).click();

    await expect(page.getByText('Walk the dog')).toBeVisible();
    await expect(page.getByText('Buy groceries')).not.toBeVisible();
  });

  test('TC-023 — Filter Completed shows only completed todos', async ({ page }) => {
    await addTodo(page, 'Buy groceries');
    await addTodo(page, 'Walk the dog');
    await todoItem(page, 'Buy groceries').getByRole('checkbox', { name: 'Toggle Todo' }).check();

    await page.getByRole('link', { name: 'Completed' }).click();

    await expect(page.getByText('Buy groceries')).toBeVisible();
    await expect(page.getByText('Walk the dog')).not.toBeVisible();
  });

  test('TC-024 — Filter All restores the full list', async ({ page }) => {
    await addTodo(page, 'Buy groceries');
    await addTodo(page, 'Walk the dog');
    await todoItem(page, 'Buy groceries').getByRole('checkbox', { name: 'Toggle Todo' }).check();

    await page.getByRole('link', { name: 'Active' }).click();
    await page.getByRole('link', { name: 'All' }).click();

    await expect(page.getByText('Buy groceries')).toBeVisible();
    await expect(page.getByText('Walk the dog')).toBeVisible();
  });
});
