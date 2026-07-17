# TodoMVC — Test Plan Output

**Feature:** Todo list management at [https://demo.playwright.dev/todomvc/](https://demo.playwright.dev/todomvc/)  
**Scope:** Add, complete, and delete todo items  
**Source:** test_template.md

---

## Positive Flows

---

### TC-001 — New todo appears in the list after Enter is pressed

**Preconditions:** User is on the TodoMVC page; the todo list is empty  
**Steps:**
1. Navigate to `https://demo.playwright.dev/todomvc/`.
2. Click the input with placeholder **What needs to be done?**.
3. Type `Buy groceries`.
4. Press **Enter**.

**Expected result:** `Buy groceries` is visible in the todo list. The input field is cleared. The footer shows **1 item left**.

---

### TC-002 — Multiple todos are added and displayed in creation order

**Preconditions:** User is on the TodoMVC page; the todo list is empty  
**Steps:**
1. Add `Buy groceries` via the **What needs to be done?** input and press **Enter**.
2. Add `Walk the dog` and press **Enter**.
3. Add `Pay bills` and press **Enter**.

**Expected result:** The todo list shows three items in order: `Buy groceries`, `Walk the dog`, `Pay bills`. The footer shows **3 items left**.

---

### TC-003 — Todo item is marked completed when its checkbox is checked

**Preconditions:** Todo list contains `Buy groceries` (active)  
**Steps:**
1. Click the checkbox labeled **Toggle Todo** for `Buy groceries`.

**Expected result:** The todo row for `Buy groceries` has the **completed** styling (strikethrough). The footer shows **0 items left**.

---

### TC-004 — Completed todo can be toggled back to active

**Preconditions:** Todo list contains `Buy groceries` marked as completed  
**Steps:**
1. Click the checkbox labeled **Toggle Todo** for `Buy groceries` again.

**Expected result:** `Buy groceries` is no longer styled as completed. The footer shows **1 item left**.

---

### TC-005 — Single todo is removed from the list via the delete button

**Preconditions:** Todo list contains one active item: `Buy groceries`  
**Steps:**
1. Hover over the `Buy groceries` row.
2. Click the **Delete** button (×) on that row.

**Expected result:** `Buy groceries` is no longer visible in the list. The main footer (counter and filters) is hidden when the list is empty.

---

### TC-006 — One todo is deleted while others remain

**Preconditions:** Todo list contains `Buy groceries`, `Walk the dog`, and `Pay bills` (all active)  
**Steps:**
1. Hover over the `Walk the dog` row.
2. Click **Delete** on that row.

**Expected result:** `Walk the dog` is removed. `Buy groceries` and `Pay bills` remain visible in original order. The footer shows **2 items left**.

---

### TC-007 — Completed todo is removed via Clear completed

**Preconditions:** Todo list contains active `Buy groceries` and completed `Walk the dog`  
**Steps:**
1. Click the **Clear completed** button in the footer.

**Expected result:** `Walk the dog` is removed. `Buy groceries` remains active. The footer shows **1 item left**.

---

### TC-008 — All todos are marked complete via Mark all as complete

**Preconditions:** Todo list contains active items `Buy groceries`, `Walk the dog`, and `Pay bills`  
**Steps:**
1. Click the checkbox labeled **Mark all as complete**.

**Expected result:** All three todos display as completed. The footer shows **0 items left**. **Clear completed** is visible.

---

## Negative Flows

---

### TC-009 — Empty submission does not add a todo item

**Preconditions:** User is on the TodoMVC page; the todo list is empty  
**Steps:**
1. Click the **What needs to be done?** input without typing.
2. Press **Enter**.

**Expected result:** No new item appears in the todo list. The footer remains hidden.

---

### TC-010 — Whitespace-only input does not create a todo

**Preconditions:** User is on the TodoMVC page; the todo list is empty  
**Steps:**
1. Type three spaces in **What needs to be done?**.
2. Press **Enter**.

**Expected result:** No todo is added. The list stays empty.

---

### TC-011 — Delete button is not actionable without hovering the todo row

**Preconditions:** Todo list contains `Buy groceries`  
**Steps:**
1. Without hovering the todo row, attempt to click **Delete** if visible.
2. Observe the list.

**Expected result:** `Buy groceries` remains in the list. Deletion only occurs after the row is hovered and **Delete** is clicked.

---

### TC-012 — Completing a todo does not remove it from the list

**Preconditions:** Todo list contains active `Buy groceries`  
**Steps:**
1. Check **Toggle Todo** for `Buy groceries`.
2. Review the todo list.

**Expected result:** `Buy groceries` remains visible but styled as completed. It is not deleted until **Delete** or **Clear completed** is used.

---

### TC-013 — Clear completed has no effect when no todos are completed

**Preconditions:** Todo list contains only active items `Buy groceries` and `Walk the dog`  
**Steps:**
1. Confirm **Clear completed** is not shown or is disabled (if present).
2. If the button is absent, verify both items remain after any incidental click attempts on footer controls.

**Expected result:** Both active todos remain. No items are removed.

---

## Edge Cases

---

### TC-014 — Todo text with special characters is stored and displayed correctly

**Preconditions:** User is on the TodoMVC page; the todo list is empty  
**Steps:**
1. Enter `Buy milk & eggs @ 50% off!` in **What needs to be done?**.
2. Press **Enter**.

**Expected result:** The list shows exactly `Buy milk & eggs @ 50% off!` with no encoding or display errors.

---

### TC-015 — Duplicate todo titles are allowed as separate list entries

**Preconditions:** Todo list contains `Buy groceries`  
**Steps:**
1. Add another todo with the same text `Buy groceries`.
2. Press **Enter**.

**Expected result:** Two separate rows both labeled `Buy groceries` appear. The footer shows **2 items left**.

---

### TC-016 — Very long todo text is accepted and fully visible or truncated per UI rules

**Preconditions:** User is on the TodoMVC page; the todo list is empty  
**Steps:**
1. Enter a 200-character string: `Plan quarterly review meeting with design team and stakeholders to align on roadmap priorities deliverables and success metrics for Q3 launch`.
2. Press **Enter**.

**Expected result:** The todo is added with the full text preserved in the list (or truncated consistently in the UI without breaking layout). The footer shows **1 item left**.

---

### TC-017 — Unicode and emoji characters are preserved in todo text

**Preconditions:** User is on the TodoMVC page; the todo list is empty  
**Steps:**
1. Enter `Купити продукти 🛒`.
2. Press **Enter**.

**Expected result:** The list displays `Купити продукти 🛒` correctly without corruption.

---

### TC-018 — Leading and trailing spaces in todo text are handled consistently

**Preconditions:** User is on the TodoMVC page; the todo list is empty  
**Steps:**
1. Enter `  Buy groceries  ` in **What needs to be done?**.
2. Press **Enter**.

**Expected result:** Either the todo is saved as `Buy groceries` (trimmed) or as `  Buy groceries  ` (exact input)—behavior is consistent and the item is usable for complete/delete actions.

---

### TC-019 — Active items left counter uses singular grammar for one item

**Preconditions:** Todo list contains exactly one active todo: `Buy groceries`  
**Steps:**
1. Observe the footer counter text.

**Expected result:** Footer displays **1 item left** (singular), not "1 items left".

---

### TC-020 — Active items left counter uses plural grammar for multiple items

**Preconditions:** Todo list contains two active todos: `Buy groceries`, `Walk the dog`  
**Steps:**
1. Observe the footer counter text.

**Expected result:** Footer displays **2 items left** (plural).

---

### TC-021 — Todo list persists after page reload via local storage

**Preconditions:** Todo list contains `Buy groceries` (active) and `Walk the dog` (completed)  
**Steps:**
1. Reload the page (`F5` or browser refresh).

**Expected result:** Both todos reappear with the same text and completion state. Footer shows **1 item left**.

---

### TC-022 — Filter Active shows only incomplete todos

**Preconditions:** Todo list contains completed `Buy groceries` and active `Walk the dog`  
**Steps:**
1. Click the **Active** filter link in the footer.

**Expected result:** Only `Walk the dog` is visible. `Buy groceries` is hidden.

---

### TC-023 — Filter Completed shows only completed todos

**Preconditions:** Same as TC-022  
**Steps:**
1. Click the **Completed** filter link in the footer.

**Expected result:** Only `Buy groceries` is visible. `Walk the dog` is hidden.

---

### TC-024 — Filter All restores the full list

**Preconditions:** User is viewing the **Active** or **Completed** filter with mixed-state todos present  
**Steps:**
1. Click the **All** filter link.

**Expected result:** Both active and completed todos are visible again.

---

## Ambiguities and Gaps in the Acceptance Criteria

1. **Add behavior not specified:** AC only says "add a todo item." It does not define whether empty/whitespace input should be rejected, whether duplicate titles are allowed, or whether text is trimmed—TC-009, TC-010, TC-015, and TC-018 depend on undocumented product rules.

2. **Complete vs. delete not distinguished:** AC treats "complete" and "delete" separately, but does not state whether completing removes an item from the active count only or from certain views. Counter and filter behavior (TC-003, TC-022–TC-024) is implied by standard TodoMVC but not in the ACs.

3. **Delete method not specified:** AC says "delete item" but does not say whether deletion is via row **Delete**, **Clear completed**, both, or keyboard. TC-005 vs. TC-007 cover different paths not mentioned in ACs.

4. **Persistence not in scope:** Local storage reload behavior (TC-021) is a common expectation for this demo but absent from ACs.

5. **Bulk complete / toggle all not in ACs:** **Mark all as complete** (TC-008) and **Clear completed** (TC-007) are standard features on this app but not listed as acceptance criteria.

6. **Filters not in ACs:** **All**, **Active**, and **Completed** filters (TC-022–TC-024) are available on the page but not covered by the three ACs.

7. **Max length undefined:** No AC or requirement states a maximum todo length; TC-016 assumes acceptance of long strings without a documented limit.

8. **Edit-in-place not mentioned:** TodoMVC supports double-click to edit an item; edit behavior is out of scope for the given ACs and untested here.
