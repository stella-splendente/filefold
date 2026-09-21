import type { Suite } from "@filekit/license";
import { PDF_TOOLS } from "./pdf";
import { IMAGE_TOOLS } from "./image";
import type { ToolDefinition } from "./types";

export * from "./types";

export const TOOLS: ToolDefinition[] = [...PDF_TOOLS, ...IMAGE_TOOLS];

export function toolsBySuite(suite: Suite): ToolDefinition[] {
  return TOOLS.filter((t) => t.suite === suite);
}

export function toolById(id: string): ToolDefinition | undefined {
  return TOOLS.find((t) => t.id === id);
}
