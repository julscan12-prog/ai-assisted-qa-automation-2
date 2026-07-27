# DS-2 — Edit Existing Program Details (Test Plan Output)

**Jira:** [DS-2](https://legionqaschool.atlassian.net/browse/DS-2) — *Edit existing program details*  
**Feature:** Edit existing program details  
**Scope:** Admin user — Programs page (`/programs`) → `Edit {name}` icon → **Edit Program** modal  
**Sources:** DS-2 Jira ACs, Confluence (Program Setup & Architecture Overview), live app exploration (Playwright / headless)

---

## Jira Acceptance Criteria (Source)

```gherkin
Scenario: Open program for editing
  Given I am on the Programs page
  And a program "Web Development 2026" exists
  When I click the edit icon on "Web Development 2026"
  Then I see the edit form pre-populated with the program's current data

Scenario: Successfully edit a program name
  Given I am editing "Web Development 2026"
  When I change the Name to "Web Development 2026 - Updated"
  And I click Save
  Then the modal closes
  And the program list immediately shows "Web Development 2026 - Updated"

Scenario: Edit preserves unchanged fields
  Given I am editing a program
  When I only change the Description
  And I click Save
  Then the Name and other fields remain unchanged
```

---

## Observed App Behavior (Live Exploration)

| Area | Confluence / Jira expectation | Observed on https://test.didaxis.studio |
|------|------------------------------|----------------------------------------|
| Login | Admin access required | `Email`, `Password`, `Sign In` on `/login`; dotenv `DIDAXIS_EMAIL` / `DIDAXIS_PASSWORD` |
| Programs page | Header + program table | `/programs` after login; **+ New Program** button visible for admin |
| Edit control | ✏️ icon on program row | `Edit {program name}` button (exact accessible name) per row |
| Edit modal | **Edit Program** heading, pre-populated fields | Dialog heading **Edit Program**; **Program Name**, **Description** textboxes; **Save**, **Cancel**, X close |
| AI config | Collapsible section in create/edit modals | **AI Generation Config** section present in edit modal |
| Save disabled | Save disabled when Program Name empty | Confirmed after clearing name; **Save** enabled when form opens with valid name (even without edits) |
| Description | Optional | Can be cleared on edit; empty description row shows no description preview |
| Name trim | Trim on submit | `"  Mobile Development 2026  "` stored as trimmed name in list |
| Max length | Name max 100, Description max 500 (Confluence) | **Bug [DS-193](https://legionqaschool.atlassian.net/browse/DS-193)** — 101+ char names accepted on edit (TC-019); 501+ description rejected (TC-029 passes) |
| Duplicate name | 400/409 + error (Confluence) | **Bug [DS-192](https://legionqaschool.atlassian.net/browse/DS-192)** — rename to existing name creates duplicate rows (TC-013) |
| Double submit | Should update one program | Observed: double Save does not corrupt data (TC-015 passes) |
| Case sensitivity | Unique per organization | **Bug [DS-194](https://legionqaschool.atlassian.net/browse/DS-194)** — case-variant renames allowed as distinct names (TC-024) |
| Modal dismiss | X, Cancel, Escape, outside click | Cancel and Escape close edit modal without saving |
| List refresh | Immediate update after mutation | List reflects name/description changes without manual refresh |
| Unauthenticated | Redirect to login | Direct `/programs` navigates to `/login` |
| API failure | Error shown, modal stays open | Simulated 500 on PUT/PATCH keeps modal open with entered name retained |
| Permissions | Admin full CRUD; Editor can edit; Viewer read-only | Only admin credentials available — TC-011 requires viewer/editor accounts |

---

## Positive Flows

---

### TC-001 — Edit form opens pre-populated with the program's current data

**Preconditions:** User is logged in as admin; program **Web Development 2026** exists with Description **Full-stack web development program**  
**Priority:** High

**Steps:**
1. Navigate to the **Programs** page.
2. Locate **Web Development 2026** in the program list.
3. Click the **edit icon** on **Web Development 2026**.

**Expected result:** **Edit Program** modal opens. **Program Name** shows `Web Development 2026`. **Description** shows `Full-stack web development program`.

**Gherkin:**
```gherkin
Scenario: Open program for editing
  Given I am logged in as admin
  And I am on the Programs page
  And a program "Web Development 2026" exists with Description "Full-stack web development program"
  When I click the edit icon on "Web Development 2026"
  Then I see the edit form pre-populated with Program Name "Web Development 2026"
  And I see Description "Full-stack web development program"
```

---

### TC-002 — Valid Program Name change is saved and reflected in the list

**Preconditions:** User is logged in as admin; **Web Development 2026** exists; user has opened the edit form for that program  
**Priority:** High

**Steps:**
1. Change **Program Name** to `Web Development 2026 - Updated`.
2. Click **Save**.

**Expected result:** Modal closes. Programs list shows **Web Development 2026 - Updated** (and no longer shows **Web Development 2026**).

**Gherkin:**
```gherkin
Scenario: Successfully edit a program name
  Given I am logged in as admin
  And I am editing "Web Development 2026"
  When I change Program Name to "Web Development 2026 - Updated"
  And I click Save
  Then the modal closes
  And the program list immediately shows "Web Development 2026 - Updated"
  And the program list does not show "Web Development 2026"
```

---

### TC-003 — Saving after changing only Description leaves Program Name unchanged

**Preconditions:** User is logged in as admin; program **Web Development 2026** exists with Description **Full-stack web development program**  
**Priority:** High

**Steps:**
1. Open edit form for **Web Development 2026**.
2. Change **Description** to `Updated full-stack curriculum for 2026`.
3. Leave **Program Name** unchanged.
4. Click **Save**.

**Expected result:** Modal closes. List still shows **Web Development 2026**. Description is updated to **Updated full-stack curriculum for 2026**.

**Gherkin:**
```gherkin
Scenario: Edit preserves unchanged fields
  Given I am logged in as admin
  And I am editing "Web Development 2026" with Description "Full-stack web development program"
  When I change Description to "Updated full-stack curriculum for 2026"
  And I leave Program Name as "Web Development 2026"
  And I click Save
  Then the modal closes
  And the program list shows "Web Development 2026"
  And the program description is "Updated full-stack curriculum for 2026"
```

---

### TC-004 — Both Program Name and Description can be updated in one save

**Preconditions:** User is logged in as admin; program **Data Science Fundamentals** exists with Description **Introductory data science track**  
**Priority:** Medium

**Steps:**
1. Open edit form for **Data Science Fundamentals**.
2. Change **Program Name** to `Data Science Fundamentals - Advanced`.
3. Change **Description** to `Advanced statistics and machine learning track`.
4. Click **Save**.

**Expected result:** Modal closes. List shows **Data Science Fundamentals - Advanced** with the new description.

**Gherkin:**
```gherkin
Scenario: Edit both Program Name and Description in one save
  Given I am logged in as admin
  And I am editing "Data Science Fundamentals" with Description "Introductory data science track"
  When I change Program Name to "Data Science Fundamentals - Advanced"
  And I change Description to "Advanced statistics and machine learning track"
  And I click Save
  Then the modal closes
  And the program list shows "Data Science Fundamentals - Advanced"
  And the program description is "Advanced statistics and machine learning track"
```

---

### TC-005 — Description can be cleared when Program Name remains valid

**Preconditions:** User is logged in as admin; program **Cybersecurity 2026** exists with a non-empty Description  
**Priority:** Medium

**Steps:**
1. Open edit form for **Cybersecurity 2026**.
2. Clear **Description** completely.
3. Leave **Program Name** as `Cybersecurity 2026`.
4. Click **Save**.

**Expected result:** Modal closes. **Cybersecurity 2026** remains in the list with an empty Description (or no description shown, per UI rules).

**Gherkin:**
```gherkin
Scenario: Description can be cleared during edit
  Given I am logged in as admin
  And I am editing "Cybersecurity 2026" with Description "Security fundamentals and labs"
  When I clear the Description field
  And I click Save
  Then the modal closes
  And the program list shows "Cybersecurity 2026"
  And the program has no description
```

---

### TC-006 — Save button is enabled when valid changes are made

**Preconditions:** User is editing **Web Development 2026** with a valid **Program Name**  
**Priority:** Medium

**Steps:**
1. Open edit form for **Web Development 2026**.
2. Observe **Save** button state with no changes (if applicable).
3. Change **Description** to `Minor wording update`.
4. Observe **Save** button state.

**Expected result:** **Save** is enabled once a valid change is present (or remains enabled per product rules). Save succeeds when clicked.

**Gherkin:**
```gherkin
Scenario: Save button enables when valid edit is made
  Given I am editing "Web Development 2026"
  When I change Description to "Minor wording update"
  Then the Save button is enabled
  When I click Save
  Then the modal closes
  And the program list shows "Web Development 2026"
```

---

### TC-007 — Dismissing the edit form without saving leaves program data unchanged

**Preconditions:** User is editing **Web Development 2026** with original Description **Full-stack web development program**  
**Priority:** Medium

**Steps:**
1. Open edit form for **Web Development 2026**.
2. Change **Program Name** to `Should Not Be Saved`.
3. Close the modal without clicking **Save** (Cancel, X, Escape, or click outside — per product convention).
4. Review the Programs list.

**Expected result:** Modal closes. List still shows **Web Development 2026** with original description. **Should Not Be Saved** does not appear.

**Gherkin:**
```gherkin
Scenario: Dismiss edit form without saving preserves original data
  Given I am logged in as admin
  And I am editing "Web Development 2026" with Description "Full-stack web development program"
  When I change Program Name to "Should Not Be Saved"
  And I dismiss the edit form without clicking Save
  Then the modal closes
  And the program list shows "Web Development 2026"
  And the program list does not show "Should Not Be Saved"
```

---

### TC-008 — Saving with no field changes does not corrupt program data

**Preconditions:** User is editing **Web Development 2026** with Description **Full-stack web development program**  
**Priority:** Low

**Steps:**
1. Open edit form for **Web Development 2026**.
2. Do not modify any field.
3. Click **Save** (if enabled) or observe that **Save** is disabled.

**Expected result:** Program data remains **Web Development 2026** / **Full-stack web development program**. No duplicate row, no data loss, no erroneous error.

**Gherkin:**
```gherkin
Scenario: Save with no changes keeps program data intact
  Given I am editing "Web Development 2026" with Description "Full-stack web development program"
  When I click Save without changing any field
  Then the program list still shows "Web Development 2026"
  And the program description remains "Full-stack web development program"
```

---

## Negative Flows

---

### TC-009 — Empty Program Name prevents save

**Preconditions:** User is editing **Web Development 2026**  
**Priority:** High

**Steps:**
1. Open edit form for **Web Development 2026**.
2. Clear **Program Name** completely.
3. Attempt to click **Save**.

**Expected result:** **Save** is disabled or validation blocks submit. Program **Web Development 2026** remains unchanged in the list.

**Gherkin:**
```gherkin
Scenario: Empty Program Name prevents save on edit
  Given I am editing "Web Development 2026"
  When I clear the Program Name field
  Then the Save button is disabled
  And the program list still shows "Web Development 2026"
```

---

### TC-010 — Whitespace-only Program Name is rejected on save

**Preconditions:** User is editing **Web Development 2026**  
**Priority:** High

**Steps:**
1. Open edit form for **Web Development 2026**.
2. Replace **Program Name** with `   ` (spaces only).
3. Attempt to click **Save**.

**Expected result:** **Save** stays disabled or trim validation blocks submit. Original name **Web Development 2026** is preserved.

**Gherkin:**
```gherkin
Scenario: Whitespace-only Program Name is rejected on edit
  Given I am editing "Web Development 2026"
  When I change Program Name to "   "
  Then the Save button is disabled
  And the program list still shows "Web Development 2026"
```

---

### TC-011 — Non-admin users cannot edit program details

**Preconditions:** User is logged in as a non-admin role (e.g. instructor, student); **Web Development 2026** exists  
**Priority:** High

**Steps:**
1. Navigate to the **Programs** page.
2. Locate **Web Development 2026**.
3. Attempt to use the edit control.

**Expected result:** Edit icon is hidden or disabled, or access is denied. Edit form is not usable.

**Gherkin:**
```gherkin
Scenario: Non-admin cannot edit a program
  Given I am logged in as a non-admin user
  And I am on the Programs page
  And a program "Web Development 2026" exists
  Then I do not see an actionable edit icon for "Web Development 2026"
  And I cannot open the program edit form
```

---

### TC-012 — Unauthenticated users are blocked from editing programs

**Preconditions:** User is not logged in  
**Priority:** High

**Steps:**
1. Attempt to navigate to the **Programs** page or a direct edit URL (if known).

**Expected result:** User is redirected to login or receives unauthorized response. Edit form is not available.

**Gherkin:**
```gherkin
Scenario: Unauthenticated user cannot edit programs
  Given I am not logged in
  When I attempt to navigate to the Programs page
  Then I am redirected to the login page
  And I do not see the program edit form
```

---

### TC-013 — Renaming a program to an existing program name is rejected

**Preconditions:** Programs **Web Development 2026** and **Mobile Development 2026** both exist  
**Priority:** High  
**Jira bug:** [DS-192](https://legionqaschool.atlassian.net/browse/DS-192)

**Steps:**
1. Open edit form for **Mobile Development 2026**.
2. Change **Program Name** to `Web Development 2026`.
3. Click **Save**.

**Expected result:** Save fails with a clear error (e.g. "Program name already exists"). Modal stays open or error toast shown. List still has exactly one **Web Development 2026** and **Mobile Development 2026** unchanged.

**Gherkin:**
```gherkin
Scenario: Duplicate program name on edit is not allowed
  Given I am logged in as admin
  And the program list shows "Web Development 2026"
  And the program list shows "Mobile Development 2026"
  And I am editing "Mobile Development 2026"
  When I change Program Name to "Web Development 2026"
  And I click Save
  Then the program is not renamed
  And I see an error indicating the program name already exists
  And the program list shows "Mobile Development 2026"
  And the program list contains only one "Web Development 2026"
```

---

### TC-014 — Renaming a program to its own current name does not create a duplicate

**Preconditions:** Program **Web Development 2026** exists  
**Priority:** Medium

**Steps:**
1. Open edit form for **Web Development 2026**.
2. Leave **Program Name** as `Web Development 2026`.
3. Change **Description** to `Description-only update`.
4. Click **Save**.

**Expected result:** Save succeeds. List contains exactly one **Web Development 2026**. No duplicate-name error for self-match.

**Gherkin:**
```gherkin
Scenario: Editing without renaming does not trigger duplicate-name error
  Given I am editing "Web Development 2026"
  When I leave Program Name as "Web Development 2026"
  And I change Description to "Description-only update"
  And I click Save
  Then the modal closes
  And the program list contains exactly one "Web Development 2026"
```

---

### TC-015 — Repeated Save clicks do not create duplicate programs or corrupt data

**Preconditions:** User is editing **Web Development 2026**  
**Priority:** Medium

**Steps:**
1. Change **Program Name** to `Web Development 2026 - Revised`.
2. Click **Save** twice in quick succession.

**Expected result:** Exactly one program **Web Development 2026 - Revised** exists. No duplicate rows or partial saves.

**Gherkin:**
```gherkin
Scenario: Double Save on edit does not corrupt program data
  Given I am editing "Web Development 2026"
  When I change Program Name to "Web Development 2026 - Revised"
  And I click Save twice in quick succession
  Then the modal closes
  And the program list shows exactly one "Web Development 2026 - Revised"
```

---

### TC-016 — Failed save shows error and does not falsely update the list

**Preconditions:** Simulate or trigger API failure (500, network offline) during save  
**Priority:** Medium

**Steps:**
1. Open edit form for **Web Development 2026**.
2. Change **Program Name** to `Network Failure Test`.
3. Click **Save** while backend is unavailable.

**Expected result:** Error message is shown. List still shows **Web Development 2026**. Entered values remain in the form if modal stays open.

**Gherkin:**
```gherkin
Scenario: API failure during edit shows error
  Given I am editing "Web Development 2026"
  And the update program API will fail
  When I change Program Name to "Network Failure Test"
  And I click Save
  Then I see an error message that the program could not be updated
  And the program list still shows "Web Development 2026"
  And the program list does not show "Network Failure Test"
```

---

## Edge Cases

---

### TC-017 — Single-character Program Name is accepted on edit

**Preconditions:** Program **QA Boundary Test Program** exists  
**Priority:** Medium

**Steps:**
1. Open edit form for **QA Boundary Test Program**.
2. Change **Program Name** to `A`.
3. Click **Save**.

**Expected result:** List shows **A** (unless product defines a higher minimum length).

**Gherkin:**
```gherkin
Scenario: Minimum length Program Name is accepted on edit
  Given I am editing "QA Boundary Test Program"
  When I change Program Name to "A"
  And I click Save
  Then the modal closes
  And the program list shows "A"
```

---

### TC-018 — Program Name at max length (100) is saved correctly on edit

**Preconditions:** Max length per Confluence is 100 characters; program **Max Length Source Program** exists  
**Priority:** Medium

**Steps:**
1. Open edit form for **Max Length Source Program**.
2. Change **Program Name** to a string of exactly 100 characters.
3. Click **Save**.

**Expected result:** Program is updated with the full 100-character name. No silent truncation without indication.

**Gherkin:**
```gherkin
Scenario: Program Name at maximum length is accepted on edit
  Given I am editing "Max Length Source Program"
  And the maximum Program Name length is 100 characters
  When I change Program Name to a 100-character string
  And I click Save
  Then the modal closes
  And the program list shows the program with the full 100-character name
```

---

### TC-019 — Over-max Program Name cannot be saved on edit

**Preconditions:** Max length per Confluence is 100 characters; user is editing **Web Development 2026**  
**Priority:** Medium  
**Jira bug:** [DS-193](https://legionqaschool.atlassian.net/browse/DS-193)

**Steps:**
1. Open edit form for **Web Development 2026**.
2. Enter 101 characters in **Program Name**.
3. Attempt to click **Save**.

**Expected result (Confluence):** Input is prevented or validation error shown; **Save** disabled or submit rejected. Original program unchanged. **Observed:** 101+ char names accepted — document as product gap.

**Gherkin:**
```gherkin
Scenario: Program Name over maximum length is rejected on edit
  Given I am editing "Web Development 2026"
  And the maximum Program Name length is 100 characters
  When I change Program Name to a 101-character string
  Then the Save button is disabled or I see a validation error
  And the program list still shows "Web Development 2026"
```

---

### TC-020 — Description at max length (500) is saved correctly on edit

**Preconditions:** Max length per Confluence is 500 characters; program **Web Development 2026** exists  
**Priority:** Low

**Steps:**
1. Open edit form for **Web Development 2026**.
2. Change **Description** to a 500-character string.
3. Click **Save**.

**Expected result:** Description is stored and displayed per UI rules.

**Gherkin:**
```gherkin
Scenario: Description at maximum length is accepted on edit
  Given I am editing "Web Development 2026"
  And the maximum Description length is 500 characters
  When I change Description to a 500-character string
  And I click Save
  Then the modal closes
  And the program description is stored with the full 500-character text
```

---

### TC-021 — Program Name with special characters is saved correctly on edit

**Preconditions:** Program **Web Development 2026** exists  
**Priority:** Medium

**Steps:**
1. Open edit form for **Web Development 2026**.
2. Change **Program Name** to `Web Dev & Design (2026) – Cohort #1`.
3. Click **Save**.

**Expected result:** List displays the exact name with correct encoding.

**Gherkin:**
```gherkin
Scenario: Program Name with special characters is accepted on edit
  Given I am editing "Web Development 2026"
  When I change Program Name to "Web Dev & Design (2026) – Cohort #1"
  And I click Save
  Then the modal closes
  And the program list shows "Web Dev & Design (2026) – Cohort #1"
```

---

### TC-022 — Unicode and emoji in fields are preserved on edit

**Preconditions:** Program **Web Development 2026** exists  
**Priority:** Low

**Steps:**
1. Open edit form for **Web Development 2026**.
2. Change **Program Name** to `Програма розробки 🎓 2026`.
3. Change **Description** to `Опис програми — full-stack 🚀`.
4. Click **Save**.

**Expected result:** List shows correct Unicode/emoji without corruption (no mojibake).

**Gherkin:**
```gherkin
Scenario: Unicode and emoji in fields are preserved on edit
  Given I am editing "Web Development 2026"
  When I change Program Name to "Програма розробки 🎓 2026"
  And I change Description to "Опис програми — full-stack 🚀"
  And I click Save
  Then the modal closes
  And the program list shows "Програма розробки 🎓 2026"
```

---

### TC-023 — Leading and trailing spaces in Program Name are trimmed on save

**Preconditions:** Program **Web Development 2026** exists  
**Priority:** Medium

**Steps:**
1. Open edit form for **Web Development 2026**.
2. Change **Program Name** to `  Mobile Development 2026  `.
3. Click **Save**.

**Expected result:** List shows **Mobile Development 2026** (trimmed), not the padded version.

**Gherkin:**
```gherkin
Scenario: Leading and trailing spaces in Program Name are trimmed on edit
  Given I am editing "Web Development 2026"
  When I change Program Name to "  Mobile Development 2026  "
  And I click Save
  Then the modal closes
  And the program list shows "Mobile Development 2026"
  And the program list does not show "  Mobile Development 2026  "
```

---

### TC-024 — Case-variant duplicate name policy is applied consistently on edit

**Preconditions:** Program **Web Development 2026** exists; user is editing **Mobile Development 2026**  
**Priority:** Medium  
**Jira bug:** [DS-194](https://legionqaschool.atlassian.net/browse/DS-194)

**Steps:**
1. Open edit form for **Mobile Development 2026**.
2. Change **Program Name** to `web development 2026` (case variant of existing name).
3. Click **Save**.

**Expected result (Confluence):** Rejected as duplicate. **Observed:** Allowed as separate program — document as product gap.

**Gherkin:**
```gherkin
Scenario: Case-variant program name duplicate policy on edit
  Given I am logged in as admin
  And the program list shows "Web Development 2026"
  And I am editing "Mobile Development 2026"
  When I change Program Name to "web development 2026"
  And I click Save
  Then the system applies the defined duplicate-name policy consistently
```

---

### TC-025 — HTML and script content in fields is safely handled on edit

**Preconditions:** Program **Web Development 2026** exists  
**Priority:** High

**Steps:**
1. Open edit form for **Web Development 2026**.
2. Change **Program Name** to `<script>alert('xss')</script>`.
3. Change **Description** to `<img src=x onerror=alert(1)>`.
4. Click **Save**.
5. View the program in the list.

**Expected result:** No script execution. Values are escaped or sanitized; UI remains stable.

**Gherkin:**
```gherkin
Scenario: HTML and script content in fields is safely handled on edit
  Given I am editing "Web Development 2026"
  When I change Program Name to "<script>alert('xss')</script>"
  And I change Description to "<img src=x onerror=alert(1)>"
  And I click Save
  Then no script is executed in the browser
  And the program list displays the values safely without breaking the page
```

---

### TC-026 — Edit succeeds when Description is empty and Program Name is long

**Preconditions:** Program **Long Name Source Program** exists with a short Description  
**Priority:** Low

**Steps:**
1. Open edit form for **Long Name Source Program**.
2. Change **Program Name** to a 99-character string (under 100 max).
3. Clear **Description**.
4. Click **Save**.

**Expected result:** Program updated successfully; long name displays correctly in the list.

**Gherkin:**
```gherkin
Scenario: Long Program Name with empty Description succeeds on edit
  Given I am editing "Long Name Source Program"
  When I change Program Name to a 99-character string
  And I clear the Description field
  And I click Save
  Then the modal closes
  And the program list shows the program with the 99-character name
```

---

### TC-027 — Program with empty Description opens edit form with empty Description field

**Preconditions:** Program **Minimal Program** exists with no Description  
**Priority:** Medium

**Steps:**
1. Navigate to **Programs** page.
2. Click edit icon on **Minimal Program**.

**Expected result:** Edit form opens with **Program Name** = `Minimal Program` and **Description** empty (not stale data from another program).

**Gherkin:**
```gherkin
Scenario: Edit form correctly pre-populates empty Description
  Given I am logged in as admin
  And I am on the Programs page
  And a program "Minimal Program" exists with no description
  When I click the edit icon on "Minimal Program"
  Then I see Program Name "Minimal Program"
  And the Description field is empty
```

---

### TC-028 — Edit modal exposes AI Generation Config section

**Preconditions:** User has opened the edit form for an existing program  
**Priority:** Low

**Steps:**
1. Open edit form for any program.
2. Observe fields below **Description**.
3. Expand **AI Generation Config**.

**Expected result:** Collapsible section shows optional fields: Total Program Hours, Default Session Hours, Default Exam Hours, Target Audience, Focus Areas, Sync/Async Ratio. Program can still be saved without modifying them.

**Gherkin:**
```gherkin
Scenario: Edit modal exposes optional AI Generation Config
  Given I am editing an existing program
  When I expand "AI Generation Config"
  Then I see fields for Total Program Hours, Default Session Hours, and Default Exam Hours
  And I can save the program without changing AI config fields
```

---

### TC-029 — Description over max length (501) is rejected on edit

**Preconditions:** Max length per Confluence is 500 characters; user is editing **Web Development 2026**  
**Priority:** Medium

**Steps:**
1. Open edit form for **Web Development 2026**.
2. Change **Description** to a 501-character string.
3. Click **Save**.

**Expected result:** Save fails or validation blocks submit. Modal stays open. Program description unchanged in list.

**Gherkin:**
```gherkin
Scenario: Description over maximum length is rejected on edit
  Given I am editing "Web Development 2026"
  And the maximum Description length is 500 characters
  When I change Description to a 501-character string
  And I click Save
  Then the program description is not updated
  And the edit modal remains open or I see a validation error
```

---

## Traceability Matrix (AC → Test Cases)

| Acceptance criteria | Test case(s) |
|---------------------|--------------|
| Open program for editing; form pre-populated | TC-001, TC-027 |
| Successfully edit program name | TC-002 |
| Edit preserves unchanged fields | TC-003, TC-014 |
| *(Extended coverage)* | TC-004–TC-029 |

---

## Ambiguities and Gaps in the Acceptance Criteria

1. **Field label vs AC wording** — Jira AC uses "Name"; UI label is **Program Name** (Confluence Field Definitions).

2. **Edit control UX** — Confluence documents ✏️ icon; live app exposes `Edit {name}` accessible button name (TC-001).

3. **Description optional on edit** — Not in ACs; confirmed optional — can be cleared (TC-005, TC-027).

4. **Save button with no changes** — Not in ACs; **Save** is enabled when form opens with valid name (TC-008).

5. **Max length** — Confluence specifies Name **100**, Description **500**; client-side not enforced for name (TC-018–TC-020, TC-029).

6. **Duplicate names on rename** — Confluence requires server rejection; **app bug** [DS-192](https://legionqaschool.atlassian.net/browse/DS-192) (TC-013).

7. **Case sensitivity** — Confluence implies unique per organization; **app bug** [DS-194](https://legionqaschool.atlassian.net/browse/DS-194) (TC-024).

8. **AI Generation Config** — Not in Jira ACs but present in edit modal (TC-028).

9. **Editor / Viewer roles** — Confluence: Editor can edit, Viewer read-only; Jira ACs mention admin only (TC-011).

10. **List refresh** — Confluence requires immediate list update after mutation; observed after successful edit (TC-002, TC-003).

11. **Modal dismiss** — Cancel, X, Escape documented in Confluence UI Behavior (TC-007).

12. **Programs as top-level container** — Per Architecture Overview, programs hold semesters, courses, and session templates (Layer 1 curriculum structure).

13. **Downstream impact of rename** — Whether renaming affects enrollments, reports, or linked courses is not specified.

14. **Concurrent edits** — Two admins editing the same program simultaneously is not addressed.
