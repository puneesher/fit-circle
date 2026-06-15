import fs from "fs";
import path from "path";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, "utf-8");

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] == null) {
      process.env[key] = value;
    }
  }
}

export function loadEnv() {
  const roots = [process.cwd(), path.join(process.cwd(), "..")];

  for (const root of roots) {
    loadEnvFile(path.join(root, ".env.local"));
    loadEnvFile(path.join(root, ".env"));
  }
}
