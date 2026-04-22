import { readFileSync } from "fs";
import { join } from "path";

export interface ScreenConfig {
  key: string;
  name: string;
  path?: string;
}

interface ScreensFile {
  screens: ScreenConfig[];
}

export function loadScreensConfig(): ScreenConfig[] {
  const filePath = join(process.cwd(), "screens.json");
  const content = readFileSync(filePath, "utf-8");
  const data: ScreensFile = JSON.parse(content);
  return data.screens;
}
