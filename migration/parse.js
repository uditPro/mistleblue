const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const INPUT = path.join(__dirname, "backup.sql");
const OUTPUT = path.join(ROOT, "data", "products.json");
const ALLOWED_TYPES = new Set(["product", "post", "page"]);

function stripLeadingComments(statement) {
  let value = statement.trimStart();

  while (value) {
    if (value.startsWith("--") || value.startsWith("#")) {
      const newline = value.indexOf("\n");
      value = newline === -1 ? "" : value.slice(newline + 1).trimStart();
      continue;
    }

    if (value.startsWith("/*")) {
      const end = value.indexOf("*/", 2);
      value = end === -1 ? "" : value.slice(end + 2).trimStart();
      continue;
    }

    break;
  }

  return value;
}

function splitSqlStatements(sql) {
  const statements = [];
  let start = 0;
  let quote = null;
  let blockComment = false;
  let lineComment = false;

  for (let index = 0; index < sql.length; index += 1) {
    const character = sql[index];
    const next = sql[index + 1];

    if (lineComment) {
      if (character === "\n") lineComment = false;
      continue;
    }

    if (blockComment) {
      if (character === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }

    if (quote) {
      if (character === "\\") {
        index += 1;
      } else if (character === quote) {
        if (next === quote) {
          index += 1;
        } else {
          quote = null;
        }
      }
      continue;
    }

    if (character === "'" || character === '"' || character === "`") {
      quote = character;
    } else if (character === "-" && next === "-" && /\s/.test(sql[index + 2] || " ")) {
      lineComment = true;
      index += 1;
    } else if (character === "#") {
      lineComment = true;
    } else if (character === "/" && next === "*") {
      blockComment = true;
      index += 1;
    } else if (character === ";") {
      statements.push(sql.slice(start, index));
      start = index + 1;
    }
  }

  if (start < sql.length) statements.push(sql.slice(start));
  return statements;
}

function readQuotedValue(value, start) {
  const quote = value[start];
  let result = "";
  let index = start + 1;
  const escapes = {
    "0": "\0",
    b: "\b",
    n: "\n",
    r: "\r",
    t: "\t",
    Z: "\x1a",
    "\\": "\\",
    "'": "'",
    '"': '"',
  };

  while (index < value.length) {
    const character = value[index];

    if (character === "\\" && index + 1 < value.length) {
      const escaped = value[index + 1];
      result += Object.prototype.hasOwnProperty.call(escapes, escaped)
        ? escapes[escaped]
        : escaped;
      index += 2;
      continue;
    }

    if (character === quote) {
      if (value[index + 1] === quote) {
        result += quote;
        index += 2;
        continue;
      }
      return { value: result, next: index + 1 };
    }

    result += character;
    index += 1;
  }

  throw new Error("Unterminated quoted SQL value in wppk_posts INSERT.");
}

function decodeSqlValue(rawValue) {
  const value = rawValue.trim();
  if (/^NULL$/i.test(value)) return null;

  if (value.startsWith("'") || value.startsWith('"')) {
    const decoded = readQuotedValue(value, 0);
    if (value.slice(decoded.next).trim()) {
      throw new Error(`Unexpected SQL after quoted value: ${value.slice(decoded.next)}`);
    }
    return decoded.value;
  }

  return value;
}

function parseValuesTuples(valuesSql) {
  const rows = [];
  let index = 0;

  while (index < valuesSql.length) {
    while (index < valuesSql.length && /[\s,]/.test(valuesSql[index])) index += 1;
    if (index >= valuesSql.length || valuesSql[index] !== "(") break;

    index += 1;
    const fields = [];
    let fieldStart = index;
    let quote = null;
    let nested = 0;

    while (index < valuesSql.length) {
      const character = valuesSql[index];
      const next = valuesSql[index + 1];

      if (quote) {
        if (character === "\\") {
          index += 2;
          continue;
        }
        if (character === quote) {
          if (next === quote) {
            index += 2;
            continue;
          }
          quote = null;
        }
      } else if (character === "'" || character === '"') {
        quote = character;
      } else if (character === "(") {
        nested += 1;
      } else if (character === ")" && nested > 0) {
        nested -= 1;
      } else if ((character === "," || character === ")") && nested === 0) {
        fields.push(decodeSqlValue(valuesSql.slice(fieldStart, index)));
        index += 1;

        if (character === ")") {
          rows.push(fields);
          break;
        }
        fieldStart = index;
        continue;
      }

      index += 1;
    }

    if (quote) throw new Error("Unterminated SQL string in wppk_posts values.");
    if (index >= valuesSql.length && valuesSql[valuesSql.length - 1] !== ")") {
      throw new Error("Unterminated row in wppk_posts values.");
    }
  }

  return rows;
}

function parseInsertLegacy(statement, tableName = "wppk_posts") {
  const cleanStatement = stripLeadingComments(statement);
  const escapedTableName = tableName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const header = cleanStatement.match(new RegExp(
    `^INSERT\\s+(?:IGNORE\\s+)?INTO\\s+?${escapedTableName}?\\s*`.replace(/\u007f/g, "`"),
    "i",
  ));
  if (!header) return null;

  const rest = cleanStatement.slice(header[0].length);
  const valuesMatch = /\bVALUES\b/i.exec(rest);
  if (!valuesMatch) return null;

  const columnText = rest.slice(0, valuesMatch.index).trim();
  let columns = null;

  if (columnText.startsWith("(")) {
    const close = columnText.lastIndexOf(")");
    if (close === -1) throw new Error("Malformed wppk_posts INSERT column list.");
    columns = columnText
      .slice(1, close)
      .split(",")
      .map((column) => column.trim().replace(/^`|`$/g, "").toLowerCase());
  }

  return { columns, rows: parseValuesTuples(rest.slice(valuesMatch.index + valuesMatch[0].length)) };
}

function parseInsert(statement, tableName = "wppk_posts") {
  if (tableName.toLowerCase() === "wppk_posts") return parseInsertLegacy(statement);

  const cleanStatement = stripLeadingComments(statement);
  const header = cleanStatement.match(/^INSERT\s+(?:IGNORE\s+)?INTO\s+`?([a-z0-9_]+)`?\s*/i);
  if (!header || header[1].toLowerCase() !== tableName.toLowerCase()) return null;

  const rest = cleanStatement.slice(header[0].length);
  const valuesMatch = /\bVALUES\b/i.exec(rest);
  if (!valuesMatch) return null;

  const columnText = rest.slice(0, valuesMatch.index).trim();
  let columns = null;
  if (columnText.startsWith("(")) {
    const close = columnText.lastIndexOf(")");
    if (close === -1) throw new Error(`Malformed ${tableName} INSERT column list.`);
    columns = columnText
      .slice(1, close)
      .split(",")
      .map((column) => column.trim().replace(/^`|`$/g, "").toLowerCase());
  }

  return { columns, rows: parseValuesTuples(rest.slice(valuesMatch.index + valuesMatch[0].length)) };
}

function getInsertField(row, columns, standardColumns, fieldName) {
  const fieldIndex = (columns || standardColumns).indexOf(fieldName);
  return fieldIndex < 0 ? undefined : row[fieldIndex];
}

function parseCustomerCards(sql) {
  const userEmails = new Map();
  const emailsByUserSlug = new Map();
  const adminUserIds = new Set();
  const cards = [];
  const usersColumns = ["id", "user_login", "user_pass", "user_nicename", "user_email"];
  const usermetaColumns = ["umeta_id", "user_id", "meta_key", "meta_value"];
  const postsColumns = [
    "id", "post_author", "post_date", "post_date_gmt", "post_content",
    "post_title", "post_excerpt", "post_status", "comment_status",
    "ping_status", "post_password", "post_name", "to_ping", "pinged",
    "post_modified", "post_modified_gmt", "post_content_filtered",
    "post_parent", "guid", "menu_order", "post_type", "post_mime_type",
    "comment_count",
  ];

  for (const statement of splitSqlStatements(sql)) {
    const userInsert = parseInsert(statement, "wppk_users");
    if (userInsert) {
      for (const row of userInsert.rows) {
        const id = Number(getInsertField(row, userInsert.columns, usersColumns, "id"));
        const email = cleanText(getInsertField(row, userInsert.columns, usersColumns, "user_email"))
          .toLowerCase();
        const login = cleanText(getInsertField(row, userInsert.columns, usersColumns, "user_login"));
        const nicename = cleanText(getInsertField(row, userInsert.columns, usersColumns, "user_nicename"));
        if (Number.isSafeInteger(id) && email) {
          userEmails.set(id, email);
          for (const userSlug of new Set([login, nicename].map(makeSlug).filter(Boolean))) {
            const matchingEmails = emailsByUserSlug.get(userSlug) || new Set();
            matchingEmails.add(email);
            emailsByUserSlug.set(userSlug, matchingEmails);
          }
        }
      }
      continue;
    }

    const usermetaInsert = parseInsert(statement, "wppk_usermeta");
    if (usermetaInsert) {
      for (const row of usermetaInsert.rows) {
        const userId = Number(getInsertField(row, usermetaInsert.columns, usermetaColumns, "user_id"));
        const metaKey = cleanText(getInsertField(row, usermetaInsert.columns, usermetaColumns, "meta_key"));
        const metaValue = cleanText(getInsertField(row, usermetaInsert.columns, usermetaColumns, "meta_value"));
        if (/(?:^|_)capabilities$/i.test(metaKey) && metaValue.includes("administrator")) {
          adminUserIds.add(userId);
        }
      }
      continue;
    }

    const postInsert = parseInsert(statement, "wppk_posts");
    if (!postInsert) continue;

    for (const row of postInsert.rows) {
      const getPostField = (fieldName) => getInsertField(row, postInsert.columns, postsColumns, fieldName);
      const status = cleanText(getPostField("post_status")).toLowerCase();
      const type = cleanText(getPostField("post_type")).toLowerCase();
      const authorId = Number(getPostField("post_author"));
      const password = cleanText(getPostField("post_password"));
      if (status !== "publish" || type !== "page" || password) continue;

      const title = cleanText(getPostField("post_title"));
      const slug = cleanText(getPostField("post_name")) || makeSlug(title);
      const id = Number(getPostField("id"));
      if (!title || !slug || !Number.isSafeInteger(id)) continue;
      const ownerEmail = userEmails.get(authorId)
        || (emailsByUserSlug.get(makeSlug(slug))?.size === 1
          ? [...emailsByUserSlug.get(makeSlug(slug))][0]
          : undefined);
      if (!ownerEmail || (adminUserIds.has(authorId) && !emailsByUserSlug.has(makeSlug(slug)))) continue;

      cards.push({
        wordpress_post_id: id,
        owner_email: ownerEmail,
        title,
        slug,
        content: cleanText(getPostField("post_content")),
        created_at: cleanText(getPostField("post_date_gmt")) || cleanText(getPostField("post_date")),
      });
    }
  }

  return cards;
}

function cleanText(value) {
  return String(value ?? "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/\r\n?/g, "\n")
    .trim();
}

function makeSlug(value) {
  return cleanText(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function mapPost(row, columns) {
  const post = {};
  if (columns) {
    columns.forEach((column, index) => {
      post[column] = row[index];
    });
  } else {
    const standardColumns = [
      "id", "post_author", "post_date", "post_date_gmt", "post_content",
      "post_title", "post_excerpt", "post_status", "comment_status",
      "ping_status", "post_password", "post_name", "to_ping", "pinged",
      "post_modified", "post_modified_gmt", "post_content_filtered",
      "post_parent", "guid", "menu_order", "post_type", "post_mime_type",
      "comment_count",
    ];
    standardColumns.forEach((column, index) => {
      post[column] = row[index];
    });
  }

  const type = cleanText(post.post_type).toLowerCase();
  const status = cleanText(post.post_status).toLowerCase();
  if (!ALLOWED_TYPES.has(type) || status !== "publish") return null;

  const title = cleanText(post.post_title);
  const id = Number(post.id);
  if (!Number.isSafeInteger(id) || id < 0) {
    throw new Error(`Invalid WordPress post ID: ${post.id}`);
  }

  const slug = cleanText(post.post_name) || makeSlug(title);
  if (!slug) return null;

  return {
    id,
    title,
    slug,
    content: cleanText(post.post_content),
    date: cleanText(post.post_date_gmt) || cleanText(post.post_date),
    type,
  };
}

function parseDump(sql) {
  const entries = [];

  for (const statement of splitSqlStatements(sql)) {
    const insert = parseInsert(statement);
    if (!insert) continue;

    for (const row of insert.rows) {
      const entry = mapPost(row, insert.columns);
      if (entry) entries.push(entry);
    }
  }

  const seenSlugs = new Set();
  for (const entry of entries) {
    if (seenSlugs.has(entry.slug)) {
      throw new Error(`Duplicate published post slug "${entry.slug}" in SQL backup.`);
    }
    seenSlugs.add(entry.slug);
  }

  return entries;
}

function main(inputPath = process.argv[2] ? path.resolve(process.argv[2]) : INPUT) {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`SQL backup not found at ${inputPath}.`);
  }

  const entries = parseDump(fs.readFileSync(inputPath, "utf8"));
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, `${JSON.stringify(entries, null, 2)}\n`, "utf8");
  console.log(`Imported ${entries.length} published entries into ${OUTPUT}`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`WordPress import failed: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { parseCustomerCards, parseDump };
