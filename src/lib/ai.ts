import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";

export function getChatModel() {
  if (process.env.ANTHROPIC_API_KEY) {
    return anthropic("claude-sonnet-5");
  }
  if (process.env.OPENAI_API_KEY) {
    return openai("gpt-4o-mini");
  }
  return null;
}

export const NO_API_KEY_MESSAGE =
  "دستیار هوشمند هنوز فعال نشده است. مدیر سایت باید یک کلید API (ANTHROPIC_API_KEY یا OPENAI_API_KEY) را در فایل .env تنظیم کند.";
