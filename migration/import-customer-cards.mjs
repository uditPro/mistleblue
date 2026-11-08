import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import parser from "./parse.js";

const directory = path.dirname(fileURLToPath(import.meta.url));
const inputPath = path.join(directory, "backup.sql");
const endpoint = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const shouldApply = process.argv.includes("--apply");

async function main() {
  if (!fs.existsSync(inputPath)) {
    throw new Error("migration/backup.sql was not found. Keep the private SQL backup local.");
  }

  const cards = parser.parseCustomerCards(fs.readFileSync(inputPath, "utf8"));
  const ownerCount = new Set(cards.map((card) => card.owner_email)).size;
  console.log(`Found ${cards.length} eligible published card pages for ${ownerCount} non-admin email accounts.`);

  if (!shouldApply) {
    console.log("Dry run only. Add --apply to import these records into Supabase.");
    return;
  }

  if (!endpoint || !serviceRoleKey) {
    throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before importing.");
  }

  const url = `${endpoint}/rest/v1/customer_cards?on_conflict=wordpress_post_id`;
  for (let offset = 0; offset < cards.length; offset += 100) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "content-type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(cards.slice(offset, offset + 100)),
    });

    if (!response.ok) {
      throw new Error(`Supabase import failed with HTTP ${response.status}. Check the table schema and service key.`);
    }
  }

  console.log(`Imported ${cards.length} customer card records into Supabase.`);
}

main().catch((error) => {
  console.error(`Customer card import failed: ${error.message}`);
  process.exitCode = 1;
});