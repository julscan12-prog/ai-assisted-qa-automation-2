#!/usr/bin/env node
/**
 * Attach screenshot files to a Jira issue.
 *
 * Usage:
 *   node scripts/jira-attach-screenshots.mjs <ISSUE-KEY> <file> [file...]
 *
 * Requires .env:
 *   ATLASSIAN_EMAIL
 *   ATLASSIAN_API_TOKEN
 *   ATLASSIAN_BASE_URL
 */

const fs = require("fs");
const path = require("path");
const { Blob } = require("buffer");

require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

async function main() {
  const [issueKey, ...files] = process.argv.slice(2);

  if (!issueKey || files.length === 0) {
    console.error(
      "Usage: node scripts/jira-attach-screenshots.mjs <ISSUE-KEY> <file> [file...]"
    );
    process.exit(1);
  }

  const email = process.env.ATLASSIAN_EMAIL;
  const token = process.env.ATLASSIAN_API_TOKEN;
  const baseUrl = (process.env.ATLASSIAN_BASE_URL || "").replace(/\/$/, "");

  if (!email || !token || !baseUrl) {
    console.error(
      "Missing ATLASSIAN_EMAIL, ATLASSIAN_API_TOKEN, or ATLASSIAN_BASE_URL in .env"
    );
    process.exit(1);
  }

  const auth = Buffer.from(`${email}:${token}`).toString("base64");
  const url = `${baseUrl}/rest/api/3/issue/${encodeURIComponent(issueKey)}/attachments`;

  for (const filePath of files) {
    const resolved = path.resolve(filePath);
    if (!fs.existsSync(resolved)) {
      console.error(`File not found: ${resolved}`);
      process.exit(1);
    }

    const form = new FormData();
    const buffer = fs.readFileSync(resolved);
    const blob = new Blob([buffer]);
    form.append("file", blob, path.basename(resolved));

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "X-Atlassian-Token": "no-check",
      },
      body: form,
    });

    const text = await res.text();
    if (!res.ok) {
      console.error(`Failed to attach ${resolved} to ${issueKey}: ${res.status}`);
      console.error(text);
      process.exit(1);
    }

    console.log(`Attached ${path.basename(resolved)} → ${issueKey}`);
  }

  console.log("OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
