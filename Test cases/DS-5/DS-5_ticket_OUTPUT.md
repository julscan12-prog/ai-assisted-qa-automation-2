# DS-5 — Program List Filtering and Display (Test Plan Output)

**Feature:** Program list filtering and display  
**Scope:** Admin user — Programs page (`/programs`) — list view, empty state, findability  
**App:** Didaxis Studio  
**Source:** DS-5_ticket_INPUT  
**Known UI:** Program rows with **Program Name**, **Description**, row actions (e.g. **Edit {Program Name}**), **+ New Program**

> Note: The feature title mentions **filtering**, but the ACs only cover list display and empty state. Filtering scenarios below are extended coverage and call out AC gaps at the end.

---

## Positive Flows

---

### TC-001 — Programs page lists each program’s name and description

**Preconditions:** User is logged in as admin; programs **Web Development 2026** (Description: **Full-stack web development program**) and **Data Science Fundamentals** (Description: **Introductory data science track**) exist  
**Priority:** High

**Steps:**
1. Navigate to the **Programs** page.

**Expected result:** The list shows **Web Development 2026** with description **Full-stack web development program**, and **Data Science Fundamentals** with description **Introductory data science track**.

**Gherkin:**
```gherkin
Scenario: Display program list with key details
  Given programs exist in the system
  And I am logged in as admin
  When I navigate to the Programs page
  Then I see a list showing each program's name and description
  And the list shows "Web Development 2026" with description "Full-stack web development program"
  And the list shows "Data Science Fundamentals" with description "Introductory data science track"
```

---

### TC-002 — Empty state shows no-programs message and create prompt

**Preconditions:** User is logged in as admin; no programs exist in the system  
**Priority:** High

**Steps:**
1. Navigate to the **Programs** page.

**Expected result:** A message indicates no programs have been created. A prompt/CTA to create the first program is visible (e.g. **+ New Program** or equivalent empty-state action). No program rows are shown.

**Gherkin:**
```gherkin
Scenario: Empty state when no programs exist
  Given no programs exist
  And I am logged in as admin
  When I navigate to the Programs page
  Then I see a message indicating no programs have been created
  And I see a prompt to create the first program
  And I do not see any program rows
```

---

### TC-003 — Empty-state create prompt opens New Program form

**Preconditions:** No programs exist; user is on the Programs page empty state  
**Priority:** High

**Steps:**
1. Click the empty-state create prompt / **+ New Program**.

**Expected result:** The **New Program** modal opens with **Program Name** and **Description** fields.

**Gherkin:**
```gherkin
Scenario: Empty state prompt opens program creation
  Given no programs exist
  And I am on the Programs page
  When I click the prompt to create the first program
  Then I see the New Program form with fields Program Name and Description
```

---

### TC-004 — List refreshes to show a newly created program

**Preconditions:** User is logged in as admin; Programs page is open  
**Priority:** High

**Steps:**
1. Click **+ New Program**.
2. Enter `Cybersecurity 2026` in **Program Name**.
3. Enter `Security fundamentals and labs` in **Description**.
4. Click **Create**.

**Expected result:** Modal closes. List shows **Cybersecurity 2026** with description **Security fundamentals and labs**. Empty state (if previously shown) is gone.

**Gherkin:**
```gherkin
Scenario: Newly created program appears in the list with name and description
  Given I am on the Programs page
  When I create a program with Program Name "Cybersecurity 2026" and Description "Security fundamentals and labs"
  Then the program list shows "Cybersecurity 2026"
  And the program list shows description "Security fundamentals and labs"
```

---

### TC-005 — Multiple programs are all visible in the list

**Preconditions:** Programs **Web Development 2026**, **Data Science Fundamentals**, and **Mobile Development 2026** exist  
**Priority:** Medium

**Steps:**
1. Navigate to the **Programs** page.
2. Scan the full program list (scroll if needed).

**Expected result:** All three programs appear with their names (and descriptions where present). No program is silently omitted.

**Gherkin:**
```gherkin
Scenario: All existing programs are displayed
  Given programs "Web Development 2026", "Data Science Fundamentals", and "Mobile Development 2026" exist
  When I navigate to the Programs page
  Then the program list shows "Web Development 2026"
  And the program list shows "Data Science Fundamentals"
  And the program list shows "Mobile Development 2026"
```

---

### TC-006 — Program with empty Description still appears with its Program Name

**Preconditions:** Program **Minimal Program** exists with empty **Description**  
**Priority:** Medium

**Steps:**
1. Navigate to the **Programs** page.
2. Locate **Minimal Program**.

**Expected result:** **Minimal Program** is listed. Description cell/area is empty or shows a neutral placeholder (not an error). Row remains usable (e.g. **Edit Minimal Program** visible).

**Gherkin:**
```gherkin
Scenario: Program with empty Description is still listed
  Given a program "Minimal Program" exists with an empty Description
  When I navigate to the Programs page
  Then the program list shows "Minimal Program"
  And the description for "Minimal Program" is empty or shows a placeholder
```

---

## Negative Flows

---

### TC-007 — Empty state is not shown when programs exist

**Preconditions:** At least one program exists (e.g. **Test Program**)  
**Priority:** High

**Steps:**
1. Navigate to the **Programs** page.

**Expected result:** Program list is shown. Empty-state “no programs have been created” message is not visible.

**Gherkin:**
```gherkin
Scenario: Empty state does not appear when programs exist
  Given a program "Test Program" exists
  When I navigate to the Programs page
  Then I see "Test Program" in the program list
  And I do not see a message indicating no programs have been created
```

---

### TC-008 — Non-admin users cannot view the admin program list (or see only allowed data)

**Preconditions:** User is logged in as a non-admin role  
**Priority:** High

**Steps:**
1. Attempt to navigate to the **Programs** page.

**Expected result:** Access is denied, page is hidden, or only authorized content is shown — not the full admin manage list with create/edit/delete controls.

**Gherkin:**
```gherkin
Scenario: Non-admin cannot use admin program list management
  Given I am logged in as a non-admin user
  When I navigate to the Programs page
  Then I do not see the full admin program management list
  Or I am denied access
```

---

### TC-009 — Unauthenticated users cannot view the program list

**Preconditions:** User is not logged in  
**Priority:** High

**Steps:**
1. Navigate to `/programs` (or the Programs URL).

**Expected result:** Redirect to login (or unauthorized). Program names/descriptions are not exposed.

**Gherkin:**
```gherkin
Scenario: Unauthenticated user cannot view program list
  Given I am not logged in
  When I attempt to navigate to the Programs page
  Then I am redirected to the login page
  And I do not see any program names or descriptions
```

---

### TC-010 — Deleted program no longer appears in the list

**Preconditions:** Program **Test Program** exists  
**Priority:** Medium

**Steps:**
1. Delete **Test Program** with confirmation.
2. Remain on / refresh the **Programs** page.

**Expected result:** **Test Program** is not in the list. If it was the last program, empty state appears.

**Gherkin:**
```gherkin
Scenario: Deleted program is removed from the list display
  Given a program "Test Program" exists
  When I delete "Test Program" with confirmation
  Then the program list does not show "Test Program"
```

---

### TC-011 — Stale or phantom rows do not appear after failed create

**Preconditions:** User is on Programs page; create will fail or is cancelled  
**Priority:** Medium

**Steps:**
1. Click **+ New Program**.
2. Enter `Should Not Appear` in **Program Name**.
3. Dismiss without **Create** (or force create failure).
4. Review the list.

**Expected result:** **Should Not Appear** is not shown. List matches server state.

**Gherkin:**
```gherkin
Scenario: Unsaved program does not appear in the list
  Given I am on the Programs page
  When I open New Program
  And I fill in Program Name with "Should Not Appear"
  And I dismiss the form without creating
  Then the program list does not show "Should Not Appear"
```

---

### TC-012 — List load failure does not show a false empty state as success

**Preconditions:** Programs exist; Programs list API is forced to fail  
**Priority:** Medium

**Steps:**
1. Navigate to the **Programs** page while list fetch fails.

**Expected result:** An error state is shown (retry/message). The “no programs have been created” empty state is not shown as if the catalog were legitimately empty.

**Gherkin:**
```gherkin
Scenario: Failed list load does not pretend there are zero programs
  Given programs exist in the system
  And the program list request will fail
  When I navigate to the Programs page
  Then I see an error or retry state
  And I do not see the empty-state message as a successful empty catalog
```

---

## Edge Cases

---

### TC-013 — Special characters in Program Name and Description render safely in the list

**Preconditions:** Program **QA &lt;Test&gt; &amp; "Prog"** exists with Description `Line1 <script>alert(1)</script> & more`  
**Priority:** High

**Steps:**
1. Navigate to the **Programs** page.
2. Locate the program row.

**Expected result:** Name and description display as text (escaped/sanitized). No script execution or broken layout/markup.

**Gherkin:**
```gherkin
Scenario: Special characters render safely in the program list
  Given a program "QA <Test> & \"Prog\"" exists with Description containing HTML-like text
  When I navigate to the Programs page
  Then the program name and description are displayed as text
  And no script executes in the list
```

---

### TC-014 — Maximum-length Program Name (255) displays in the list without breaking the row

**Preconditions:** A program exists with **Program Name** of exactly 255 characters  
**Priority:** Medium

**Steps:**
1. Navigate to the **Programs** page.
2. Locate that program’s row.

**Expected result:** Name is visible (full text, truncation with tooltip, or wrap — per product rules). Row actions (e.g. **Edit**) remain usable; layout does not overflow off-screen unusably.

**Gherkin:**
```gherkin
Scenario: Max-length Program Name displays in the list
  Given a program exists with Program Name of 255 characters
  When I navigate to the Programs page
  Then that program appears in the list
  And the program row remains usable
```

---

### TC-015 — Maximum-length Description (1000) displays without breaking the list

**Preconditions:** Program **Long Description Program** exists with **Description** of 1000 characters  
**Priority:** Medium

**Steps:**
1. Navigate to the **Programs** page.
2. Inspect the description display for that program.

**Expected result:** Description is shown fully, truncated with expand/tooltip, or clamped consistently. List remains scrollable and readable.

**Gherkin:**
```gherkin
Scenario: Max-length Description displays in the list
  Given a program "Long Description Program" exists with a 1000-character Description
  When I navigate to the Programs page
  Then the list shows "Long Description Program"
  And the description is displayed or truncated in a usable way
```

---

### TC-016 — Unicode / accented Program Name and Description display correctly

**Preconditions:** Program **Développement Web 日本語** exists with Description **Cours avancés — été 2026**  
**Priority:** Medium

**Steps:**
1. Navigate to the **Programs** page.

**Expected result:** Name and description render correctly (no mojibake or missing glyphs).

**Gherkin:**
```gherkin
Scenario: Unicode program details display correctly
  Given a program "Développement Web 日本語" exists with Description "Cours avancés — été 2026"
  When I navigate to the Programs page
  Then the program list shows "Développement Web 日本語"
  And the program list shows description "Cours avancés — été 2026"
```

---

### TC-017 — Very large catalog remains usable (scroll / pagination / performance)

**Preconditions:** A large number of programs exist (e.g. 100+, matching Dashboard-scale catalogs if applicable)  
**Priority:** Medium

**Steps:**
1. Navigate to the **Programs** page.
2. Scroll or page through the list.
3. Locate a known program near the end (e.g. last created).

**Expected result:** Page loads in a reasonable time. User can reach all programs via scroll or pagination. UI does not freeze or omit rows silently.

**Gherkin:**
```gherkin
Scenario: Large program list remains navigable
  Given many programs exist in the system
  When I navigate to the Programs page
  And I scroll or paginate through the list
  Then I can find programs throughout the catalog
  And the page remains responsive
```

---

### TC-018 — Filter/search by Program Name shows matching programs only (if filter exists)

**Preconditions:** Programs **Web Development 2026**, **Data Science Fundamentals**, and **Mobile Development 2026** exist; a search/filter control is available on Programs  
**Priority:** High *(if filtering is in scope)*

**Steps:**
1. Navigate to the **Programs** page.
2. Enter `Web Development` in the filter/search field (use actual control label once known).
3. Observe the list.

**Expected result:** **Web Development 2026** remains visible. Non-matching programs are hidden. Clearing the filter restores the full list.

**Gherkin:**
```gherkin
Scenario: Filter by Program Name shows matching results
  Given programs "Web Development 2026", "Data Science Fundamentals", and "Mobile Development 2026" exist
  And a list filter or search control is available
  When I filter the program list by "Web Development"
  Then the program list shows "Web Development 2026"
  And the program list does not show "Data Science Fundamentals"
  And the program list does not show "Mobile Development 2026"
```

---

### TC-019 — Filter with no matches shows an appropriate empty-filter state

**Preconditions:** Programs exist; filter/search is available  
**Priority:** Medium *(if filtering is in scope)*

**Steps:**
1. Enter a query with no matches, e.g. `ZZZ-No-Match-999`.
2. Observe the list.

**Expected result:** No program rows for that query. Message indicates no matches (distinct from “no programs have been created”). Clearing filter restores programs.

**Gherkin:**
```gherkin
Scenario: Filter with no matches does not use create-first empty state
  Given programs exist in the system
  When I filter the program list by "ZZZ-No-Match-999"
  Then I see a no-matching-results message or empty filtered list
  And I do not see the "no programs have been created" empty state as if the catalog were empty
```

---

### TC-020 — Filter by Description finds programs when supported

**Preconditions:** **Web Development 2026** has Description **Full-stack web development program**; other programs have different descriptions  
**Priority:** Low *(if filtering is in scope)*

**Steps:**
1. Filter/search by `full-stack`.
2. Observe results.

**Expected result:** Either **Web Development 2026** appears (description search supported), or only name search applies — behavior is consistent and documented. No crash.

**Gherkin:**
```gherkin
Scenario: Filter may match Description text when supported
  Given a program "Web Development 2026" exists with Description "Full-stack web development program"
  When I filter the program list by "full-stack"
  Then either "Web Development 2026" is shown
  Or description search is not supported and results follow the defined name-only rule
```

---

### TC-021 — Whitespace-only filter does not hide all programs incorrectly

**Preconditions:** Programs exist; filter control is available  
**Priority:** Low *(if filtering is in scope)*

**Steps:**
1. Enter `   ` (spaces only) in the filter field.
2. Observe the list.

**Expected result:** Treated as empty filter (full list) or clear validation — not an accidental “no results” for all programs.

**Gherkin:**
```gherkin
Scenario: Whitespace-only filter does not empty the list incorrectly
  Given programs exist in the system
  When I enter only spaces in the program list filter
  Then the full program list remains visible
  Or the filter is treated as cleared
```

---

### TC-022 — Case-insensitive filter matching (if filter exists)

**Preconditions:** Program **Web Development 2026** exists  
**Priority:** Low *(if filtering is in scope)*

**Steps:**
1. Filter by `web development`.
2. Filter by `WEB DEVELOPMENT`.

**Expected result:** **Web Development 2026** appears for both (unless product documents case-sensitive search).

**Gherkin:**
```gherkin
Scenario: Filter matching is case-insensitive
  Given a program "Web Development 2026" exists
  When I filter the program list by "web development"
  Then the program list shows "Web Development 2026"
  When I filter the program list by "WEB DEVELOPMENT"
  Then the program list shows "Web Development 2026"
```

---

### TC-023 — List column headers or structure clearly present name and description

**Preconditions:** At least one program exists  
**Priority:** Low

**Steps:**
1. Navigate to the **Programs** page.
2. Inspect list structure (table headers, cards, or labels).

**Expected result:** User can tell which value is **Program Name** vs **Description** (headers, labels, or clear visual hierarchy).

**Gherkin:**
```gherkin
Scenario: List presentation distinguishes name and description
  Given programs exist in the system
  When I navigate to the Programs page
  Then each program row presents a Program Name and a Description
  And name and description are visually distinguishable
```

---

## Traceability Matrix (AC → Test Cases)

| Acceptance criteria | Test case(s) |
|---------------------|--------------|
| List shows each program’s name and description | TC-001, TC-004, TC-005, TC-006, TC-023 |
| Empty state message when no programs | TC-002, TC-007 |
| Prompt to create the first program | TC-002, TC-003 |
| *(Extended: permissions, errors, filter, boundaries)* | TC-008–TC-022 |

---

## Ambiguities and Gaps in the Acceptance Criteria

1. **Filtering not specified** — Feature title includes “filtering,” but ACs have no search/filter rules (fields, operators, clear, no-results). TC-018–TC-022 assume a control that may not exist yet.
2. **Exact empty-state copy** — Message text and CTA wording (“create the first program” vs only **+ New Program**) are not defined.
3. **List layout** — Table vs cards, column headers, sort order (alpha, created date, updated date) are unspecified.
4. **Empty Description display** — Whether blank, “—”, or hidden is not defined (TC-006).
5. **Pagination / virtualization** — Behavior for large catalogs is not in ACs (TC-017).
6. **Truncation** — Max-length name/description display rules (truncate, wrap, tooltip) are undefined (TC-014, TC-015).
7. **Permissions** — Only admin story; non-admin and unauthenticated access not covered (TC-008, TC-009).
8. **Error vs empty** — Distinguishing load failure from true empty catalog is not in ACs (TC-012).
9. **Refresh after create/edit/delete** — Immediate list update is implied by related features but not stated here.
10. **Additional columns** — Status, dates, course counts, actions — not mentioned beyond name and description.
11. **Duplicates** — Display of duplicate names (if ever allowed historically) is not addressed; create ACs typically forbid duplicates.
12. **Localization / RTL** — Unicode covered as edge case; i18n of empty-state strings not specified.
13. **Dashboard consistency** — Whether Programs page count/list must match Dashboard Programs tile is not stated.
