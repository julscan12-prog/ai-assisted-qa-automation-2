Feature: DS-1 — Create new academic program

  As an admin user, I want to create a new academic program from the Programs page,
  so that I can manage curriculum containers for semesters, courses, and templates.

  # Happy paths

  Scenario: TC-001 — Admin opens program creation modal with required fields
    Given I am logged in as admin
    When I navigate to the Programs page at "/programs"
    And I click "+ New Program"
    Then I see the "New Program" modal with fields: Program Name, Description
    And the Create button is disabled

  Scenario: TC-002 — Successfully create a program
    Given I am on the program creation modal
    When I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Full-stack web development program"
    And I click Create
    Then the modal closes
    And the program list shows "Web Development 2026"
    And the program list shows "Full-stack web development program"

  Scenario: TC-003 — Create program with only Program Name filled
    Given I am on the program creation modal
    When I fill in Program Name with "Data Science Fundamentals"
    And I leave Description empty
    And I click Create
    Then the modal closes
    And the program list shows "Data Science Fundamentals"

  Scenario: TC-004 — Create button enables when Program Name is provided
    Given I am on the program creation modal
    And the Create button is disabled
    When I fill in Program Name with "Cybersecurity 2026"
    Then the Create button is enabled

  Scenario: TC-005 — Dismiss program creation modal without saving
    Given I am on the program creation modal
    And the program list does not show "Draft Program XYZ"
    When I fill in Program Name with "Draft Program XYZ"
    And I dismiss the program creation modal without clicking Create
    Then the modal closes
    And the program list does not show "Draft Program XYZ"

  Scenario: TC-023 — Create modal exposes optional AI Generation Config
    Given I am on the program creation modal
    When I expand "AI Generation Config"
    Then I see fields for Total Program Hours, Default Session Hours, and Default Exam Hours
    And I can create a program without filling AI config fields

  Scenario: TC-024 — Created program appears in list with description and actions
    Given I created a program named "Web Development 2026" with description "Full-stack web development program"
    When I view the Programs list
    Then I see a row with "Web Development 2026"
    And I see "Full-stack web development program" in that row
    And I see an "Edit Web Development 2026" action
    And I see a "Delete Web Development 2026" action

  # Negative

  Scenario: TC-006 — Validation prevents empty program name
    Given I am on the program creation modal
    When I leave the Program Name field empty
    Then the Create button is disabled

  Scenario: TC-007 — Whitespace-only Program Name is rejected
    Given I am on the program creation modal
    When I fill in Program Name with "   "
    Then the Create button is disabled
    And no program is created

  Scenario: TC-008 — Viewer cannot create a program
    Given I am logged in as a viewer user
    When I navigate to the Programs page
    Then I do not see an actionable "+ New Program" control
    And I cannot open the program creation modal

  Scenario: TC-009 — Unauthenticated user cannot access program creation
    Given I am not logged in
    When I attempt to navigate to the Programs page
    Then I am redirected to the login page
    And I do not see the program creation modal

  Scenario: TC-010 — Duplicate program name is not allowed
    Given I am logged in as admin
    And the program list shows "Web Development 2026"
    And I am on the program creation modal
    When I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Duplicate attempt"
    And I click Create
    Then the program is not created
    And I see an error indicating the program name already exists
    And the program list contains only one "Web Development 2026"

  Scenario: TC-011 — Double submit does not create duplicate programs
    Given I am on the program creation modal
    And the program list does not show "Unique Program 2026"
    When I fill in Program Name with "Unique Program 2026"
    And I fill in Description with "Test double submit"
    And I click Create twice in quick succession
    Then the modal closes
    And the program list shows exactly one "Unique Program 2026"

  Scenario: TC-012 — API failure during create shows error
    Given I am on the program creation modal
    And the create program API will fail
    When I fill in Program Name with "Network Test Program"
    And I fill in Description with "Simulated failure"
    And I click Create
    Then I see an error message that the program could not be created
    And the program list does not show "Network Test Program"
    And the modal remains open with my entered values

  # Edge cases

  Scenario: TC-013 — Minimum length Program Name is accepted
    Given I am on the program creation modal
    When I fill in Program Name with "A"
    And I fill in Description with "Single letter name test"
    And I click Create
    Then the modal closes
    And the program list shows "A"

  Scenario: TC-014 — Program Name at maximum length is accepted
    Given I am on the program creation modal
    When I fill in Program Name with "WebDev2026ProCertFullStackBootcampAdvancedTrackEnterpriseEditionCohortAlphaNorthRegionUSA2026Q1XXXXX"
    And I fill in Description with "Max length boundary test"
    And I click Create
    Then the modal closes
    And the program list shows "WebDev2026ProCertFullStackBootcampAdvancedTrackEnterpriseEditionCohortAlphaNorthRegionUSA2026Q1XXXXX"

  Scenario: TC-015 — Program Name over maximum length is rejected
    Given I am on the program creation modal
    When I fill in Program Name with "WebDev2026ProCertFullStackBootcampAdvancedTrackEnterpriseEditionCohortAlphaNorthRegionUSA2026Q1XXXXXX"
    Then the Create button is disabled or I see a validation error
    And no program is created

  Scenario: TC-016 — Description at maximum length is accepted
    Given I am on the program creation modal
    When I fill in Program Name with "Long Description Program"
    And I fill in Description with "Full-stack web development curriculum module covering frontend, backend, and DevOps practices. Full-stack web development curriculum module covering frontend, backend, and DevOps practices. Full-stack web development curriculum module covering frontend, backend, and DevOps practices. Full-stack web development curriculum module covering frontend, backend, and DevOps practices. Full-stack web development curriculum module covering frontend, backend, and DevOps practices. Full-stack web developmen"
    And I click Create
    Then the modal closes
    And the program list shows "Long Description Program"

  Scenario: TC-025 — Description over maximum length is rejected
    Given I am on the program creation modal
    When I fill in Program Name with "Over Max Description Program"
    And I fill in Description with "Full-stack web development curriculum module covering frontend, backend, and DevOps practices. Full-stack web development curriculum module covering frontend, backend, and DevOps practices. Full-stack web development curriculum module covering frontend, backend, and DevOps practices. Full-stack web development curriculum module covering frontend, backend, and DevOps practices. Full-stack web development curriculum module covering frontend, backend, and DevOps practices. Full-stack web developmenX"
    And I click Create
    Then I see a validation error or the program is not created

  Scenario: TC-017 — Program Name with special characters is accepted
    Given I am on the program creation modal
    When I fill in Program Name with "Web Dev & Design (2026) – Cohort #1"
    And I fill in Description with "Special chars test"
    And I click Create
    Then the modal closes
    And the program list shows "Web Dev & Design (2026) – Cohort #1"

  Scenario: TC-018 — Unicode and emoji in fields are preserved
    Given I am on the program creation modal
    When I fill in Program Name with "Програма розробки 🎓 2026"
    And I fill in Description with "Опис програми — full-stack 🚀"
    And I click Create
    Then the modal closes
    And the program list shows "Програма розробки 🎓 2026"

  Scenario: TC-019 — Leading and trailing spaces in Program Name are trimmed
    Given I am on the program creation modal
    When I fill in Program Name with "  Mobile Development 2026  "
    And I click Create
    Then the modal closes
    And the program list shows "Mobile Development 2026"
    And the program list does not show "  Mobile Development 2026  "

  Scenario: TC-020 — Case-variant program name duplicate policy
    Given I am logged in as admin
    And the program list shows "Web Development 2026"
    And I am on the program creation modal
    When I fill in Program Name with "web development 2026"
    And I click Create
    Then the system applies the defined duplicate-name policy consistently

  Scenario: TC-021 — HTML and script content in fields is safely handled
    Given I am on the program creation modal
    When I fill in Program Name with "<script>alert('xss')</script>"
    And I fill in Description with "<img src=x onerror=alert(1)>"
    And I click Create
    Then no script is executed in the browser
    And the program list displays the values safely without breaking the page

  Scenario: TC-022 — Long Program Name with empty Description succeeds
    Given I am on the program creation modal
    When I fill in Program Name with "WebDev2026ProCertFullStackBootcampAdvancedTrackEnterpriseEditionCohortAlphaNorthRegionUSA2026Q1XXXX"
    And I leave Description empty
    And I click Create
    Then the modal closes
    And the program list shows "WebDev2026ProCertFullStackBootcampAdvancedTrackEnterpriseEditionCohortAlphaNorthRegionUSA2026Q1XXXX"

  #
  # Ambiguities and gaps in acceptance criteria
  #
  # - Description is optional (confirmed in Confluence and live app) but not stated in Jira ACs.
  # - Max length: Confluence specifies Program Name max 100 and Description max 500; Jira ACs silent.
  # - Duplicate names: Confluence requires server rejection (400/409); observed app bug DS-188 allows duplicates.
  # - Double submit: not in ACs; observed app bug DS-189 may create duplicate rows.
  # - Case sensitivity: Confluence implies unique per organization; observed app bug DS-190 allows case variants.
  # - AI Generation Config: present in create modal but not mentioned in Jira ACs.
  # - Editor role: Confluence allows EDITOR to create programs; Jira ACs mention admin only.
  # - Modal dismiss methods: ACs do not specify Cancel vs X vs Escape vs overlay click.
  # - Viewer permissions: not testable without viewer credentials in current environment.
  # - Programs as top-level container: Architecture Overview notes programs hold semesters/courses/templates (Layer 1).
