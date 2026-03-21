#!/usr/bin/env node

/**
 * Translate questions using Claude API and output as TypeScript
 * This script generates the translated question definitions that can be merged back
 */

import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const BATCH_SIZE = 10;
const DELAY_MS = 500;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function translateQuestion(question) {
  const prompt = `You are a Portuguese to English translator for an educational math quiz for 5th graders.

Translate ONLY the fields shown below, keeping mathematical accuracy and age-appropriate language.

**Portuguese Input:**
- prompt: "${question.prompt}"
- options: ["${question.options[0]}", "${question.options[1]}", "${question.options[2]}", "${question.options[3]}"]
- explanation: "${question.explanation}"

**English Output Format (return ONLY valid JSON, no other text):**
{
  "promptEN": "...",
  "optionsEN": ["...", "...", "...", "..."],
  "explanationEN": "..."
}`;

  const message = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error(
      `Failed to extract JSON from response for ${question.id}`
    );
  }

  const result = JSON.parse(jsonMatch[0]);
  return {
    id: question.id,
    promptEN: result.promptEN,
    optionsEN: result.optionsEN,
    explanationEN: result.explanationEN,
  };
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌ ANTHROPIC_API_KEY not set");
    process.exit(1);
  }

  console.log("Reading question bank...");

  // Read the question bank TypeScript file and extract questions
  const qbContent = fs.readFileSync("src/data/question-bank.ts", "utf-8");

  // Parse questions using regex to extract the data
  const questions = [];

  // Match buildQuestion function calls and extract the data
  // This is a complex regex - let's instead parse out the essential info differently

  // Simpler approach: Extract the questions from the QUESTION_BANK export
  // by reading the return statements

  console.log("Parsing questions from TypeScript source...");

  // Look for pattern: id: "xxx", topic: "xxx", difficulty: "xxx", prompt: "xxx"
  const questionMatches = qbContent.matchAll(
    /id:\s*"([\w-]+)"[\s\S]*?topic:\s*"([^"]+)"[\s\S]*?difficulty:\s*"([^"]+)"[\s\S]*?prompt:\s*"([^"]*)"[\s\S]*?options:\s*\[\s*"([^"]*)"\s*,\s*"([^"]*)"\s*,\s*"([^"]*)"\s*,\s*"([^"]*)"\s*\][\s\S]*?explanation:\s*"([^"]*)"(?=[\s\S]*?(?:,|\};))/g
  );

  for (const match of questionMatches) {
    questions.push({
      id: match[1],
      topic: match[2],
      difficulty: match[3],
      prompt: match[4],
      options: [match[5], match[6], match[7], match[8]],
      explanation: match[9],
    });
  }

  console.log(`✅ Parsed ${questions.length} questions\n`);

  if (questions.length === 0) {
    console.error(
      "❌ Could not parse any questions. The regex pattern may need adjustment."
    );
    console.log(
      "Sample of question bank content (first 2000 chars):\n",
      qbContent.substring(0, 2000)
    );
    process.exit(1);
  }

  // Translate questions in batches
  console.log(`🌍 Translating ${questions.length} questions...\n`);

  const translations = [];
  let completed = 0;

  for (let i = 0; i < questions.length; i += BATCH_SIZE) {
    const batch = questions.slice(i, i + BATCH_SIZE);

    for (const question of batch) {
      try {
        process.stdout.write(
          `  [${completed + 1}/${questions.length}] ${question.id}: `
        );

        const translation = await translateQuestion(question);
        translations.push(translation);

        console.log("✅");
        completed++;
      } catch (error) {
        console.log(`❌ ${error.message}`);
      }
    }

    if (i + BATCH_SIZE < questions.length) {
      console.log("  Waiting before next batch...");
      await sleep(DELAY_MS);
    }
  }

  // Generate TypeScript code for merged questions
  console.log(`\n📝 Generating TypeScript updates for ${translations.length} questions...\n`);

  // Create a mapping of id to translation
  const translationMap = {};
  for (const t of translations) {
    translationMap[t.id] = t;
  }

  // Read the current question bank and update it
  let updatedContent = qbContent;

  // For each translated question, we'll add the EN fields
  for (const translation of translations) {
    // Find the question definition for this ID and add the EN fields
    // Pattern: find the line with this ID, then find the closing } of that question

    // Simpler approach: find the last } before the comma or };  after our ID
    const idPattern = `id: "${translation.id}"`;
    const idIndex = updatedContent.indexOf(idPattern);

    if (idIndex === -1) {
      console.warn(
        `  ⚠️  Could not find question ${translation.id} in source`
      );
      continue;
    }

    // Find the end of this question object (marked by }, or },)
    let braceCount = 0;
    let questionStart = idIndex;

    // Go backwards to find the opening {
    while (questionStart > 0) {
      if (updatedContent[questionStart] === "{") {
        braceCount++;
        if (braceCount === 1) break;
      }
      questionStart--;
    }

    // Go forwards to find the matching closing }
    let questionEnd = idIndex;
    braceCount = 0;
    let inQuote = false;
    let escapeNext = false;

    while (questionEnd < updatedContent.length) {
      const char = updatedContent[questionEnd];

      if (escapeNext) {
        escapeNext = false;
        questionEnd++;
        continue;
      }

      if (char === "\\") {
        escapeNext = true;
        questionEnd++;
        continue;
      }

      if (char === '"') {
        inQuote = !inQuote;
      }

      if (!inQuote) {
        if (char === "{") braceCount++;
        if (char === "}") {
          braceCount--;
          if (braceCount === 0) {
            // Found the closing brace
            break;
          }
        }
      }

      questionEnd++;
    }

    // Get the question object
    const questionObj = updatedContent.substring(questionStart, questionEnd + 1);

    // Check if it already has EN fields
    if (questionObj.includes("promptEN")) {
      console.log(`  ℹ️  ${translation.id} already has EN fields`);
      continue;
    }

    // Add EN fields before the closing }
    const enFieldsStr = `,
    promptEN: "${translation.promptEN.replace(/"/g, '\\"')}",
    optionsEN: ["${translation.optionsEN[0].replace(/"/g, '\\"')}", "${translation.optionsEN[1].replace(/"/g, '\\"')}", "${translation.optionsEN[2].replace(/"/g, '\\"')}", "${translation.optionsEN[3].replace(/"/g, '\\"')}"],
    explanationEN: "${translation.explanationEN.replace(/"/g, '\\"')}"`;

    const updatedQuestion =
      questionObj.substring(0, questionObj.length - 1) + enFieldsStr + "\n  }";

    updatedContent = updatedContent.replace(questionObj, updatedQuestion);
    console.log(`  ✅ Updated ${translation.id}`);
  }

  // Write the updated content
  console.log(`\n💾 Writing updated question bank...`);
  fs.writeFileSync("src/data/question-bank.ts", updatedContent, "utf-8");

  console.log(`✅ Successfully updated ${translations.length} questions`);
  console.log(
    `\nNext steps:\n  1. Run: npm run build\n  2. Test the app with language toggle`
  );
}

main().catch((error) => {
  console.error("❌ Error:", error.message);
  console.error(error);
  process.exit(1);
});
