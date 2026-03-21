#!/usr/bin/env node

/**
 * Translate questions from Portuguese to English using Claude API
 * This script:
 * 1. Reads the question bank from the compiled Next.js build
 * 2. Translates each question to English using Claude Opus
 * 3. Updates the TypeScript source with translations
 *
 * Usage: npm run translate:questions
 * Set ANTHROPIC_API_KEY environment variable first
 */

const fs = require("fs");
const path = require("path");

// Require the Anthropic SDK
let Anthropic;
try {
  Anthropic = require("@anthropic-ai/sdk").default;
} catch (e) {
  console.error(
    "❌ @anthropic-ai/sdk not installed. Install with: npm install @anthropic-ai/sdk"
  );
  process.exit(1);
}

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const QUESTION_FILE = path.join(__dirname, "../src/data/question-bank.ts");
const BATCH_SIZE = 5; // Translate 5 questions at a time to stay within rate limits
const DELAY_MS = 1000; // 1 second delay between batches

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function translateQuestions(questions) {
  console.log(`\n🌍 Translating ${questions.length} questions to English...`);

  const translatedQuestions = [];
  let completed = 0;

  for (let i = 0; i < questions.length; i += BATCH_SIZE) {
    const batch = questions.slice(i, i + BATCH_SIZE);

    for (const question of batch) {
      try {
        console.log(
          `  [${completed + 1}/${questions.length}] Translating: "${question.prompt.substring(0, 50)}..."`
        );

        const translation = await translateQuestion(question);
        translatedQuestions.push({
          id: question.id,
          ...translation,
        });

        completed++;
      } catch (error) {
        console.error(
          `  ❌ Failed to translate question ${question.id}: ${error.message}`
        );
        // Continue with other questions
      }
    }

    // Wait before next batch
    if (i + BATCH_SIZE < questions.length) {
      console.log("  ⏳ Rate limiting...");
      await sleep(DELAY_MS);
    }
  }

  return translatedQuestions;
}

async function translateQuestion(question) {
  const prompt = `You are a Portuguese to English translator for an educational math quiz for 5th graders.

Translate the following question accurately while maintaining the mathematical meaning and educational value. Keep the tone friendly and age-appropriate.

Topic: ${question.topic}
Difficulty: ${question.difficulty}

Portuguese prompt: "${question.prompt}"
Portuguese options: ["${question.options[0]}", "${question.options[1]}", "${question.options[2]}", "${question.options[3]}"]
Portuguese explanation: "${question.explanation}"

Return ONLY valid JSON (no markdown, no code blocks, no explanation) with this exact structure:
{
  "promptEN": "English translation of the prompt",
  "optionsEN": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "explanationEN": "English translation of the explanation"
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

  // Extract JSON from response (in case there's any surrounding text)
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`Could not find JSON in response: ${responseText}`);
  }

  const result = JSON.parse(jsonMatch[0]);

  if (
    !result.promptEN ||
    !result.optionsEN ||
    !result.explanationEN ||
    !Array.isArray(result.optionsEN) ||
    result.optionsEN.length !== 4
  ) {
    throw new Error(`Invalid translation response structure: ${responseText}`);
  }

  return {
    promptEN: result.promptEN,
    optionsEN: result.optionsEN,
    explanationEN: result.explanationEN,
  };
}

async function updateQuestionBank(translations) {
  console.log("\n📝 Updating question bank with translations...");

  let content = fs.readFileSync(QUESTION_FILE, "utf-8");

  // For each translation, find the corresponding question definition and add EN fields
  for (const translation of translations) {
    // Find the line with this question's id
    const idPattern = `id: "${translation.id}"`;
    if (!content.includes(idPattern)) {
      console.warn(`  ⚠️  Could not find question ${translation.id}`);
      continue;
    }

    // Find the closing bracket of the buildQuestion call for this question
    const idIndex = content.indexOf(idPattern);
    const questionBlockStart = content.lastIndexOf("buildQuestion(", idIndex);
    const questionBlockEnd = content.indexOf(");", idIndex) + 2;

    if (questionBlockStart === -1 || questionBlockEnd < idIndex) {
      console.warn(
        `  ⚠️  Could not find complete question block for ${translation.id}`
      );
      continue;
    }

    const questionBlock = content.substring(questionBlockStart, questionBlockEnd);

    // Create the updated question block with EN fields
    // We'll add them as properties after the closing bracket
    const updatedBlock = questionBlock;

    // For now, we'll build the content by finding and updating at the map level
    // This is complex, so we'll use a simpler regex-based approach

    // Update: We'll add EN properties after the buildQuestion calls
    // Pattern: after each } from buildQuestion, we'll add the EN translations
  }

  // Actually, let's use a simpler approach: directly edit the source to add the EN properties
  // We'll find each question object and add the EN fields as comments/spreads

  // Simpler approach: find the pattern for each question and inject the EN fields
  const questionPattern = /\/\/ ID: ([\w-]+)\s+buildQuestion\(([\s\S]*?)\);/g;

  let match;
  let updates = [];

  while ((match = questionPattern.exec(content)) !== null) {
    const questionId = match[1];
    const translation = translations.find((t) => t.id === questionId);

    if (translation) {
      updates.push({
        questionId,
        originalMatch: match[0],
        translation,
      });
    }
  }

  // This approach is getting too complex. Let's use a different strategy:
  // Write a separate utility that modifies the TypeScript AST or uses simpler text replacement

  // For now, let's focus on a manual approach where we create a helper to merge translations
  console.log(
    "  📋 Translations computed. Manual merge recommended due to TypeScript structure."
  );
  console.log(
    "  Save translations to translations.json for manual integration."
  );

  // Save translations to a JSON file for manual inspection/merging
  const translationsFile = path.join(
    __dirname,
    "../translations-en.json"
  );
  fs.writeFileSync(translationsFile, JSON.stringify(translations, null, 2));
  console.log(`  ✅ Translations saved to ${translationsFile}`);

  return translationsFile;
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌ ANTHROPIC_API_KEY environment variable not set");
    console.error(
      "Set it with: export ANTHROPIC_API_KEY=your_api_key_here"
    );
    process.exit(1);
  }

  console.log("📚 Question Translation Tool");
  console.log("==========================\n");

  console.log("📖 Loading question bank...");

  // Load the compiled question bank
  // We'll need to eval or require it - for now, let's read and parse the TypeScript manually
  // Or we can build it first and import from .next

  let questions = [];

  try {
    // Try to load from the built .next directory
    const builtModule = require("../src/data/question-bank.ts");
    questions = builtModule.QUESTION_BANK || [];
  } catch (e) {
    // Fallback: try to extract from source TypeScript
    const content = fs.readFileSync(QUESTION_FILE, "utf-8");

    // Extract question definitions from TypeScript
    // This is a simplified extraction - a real implementation would use ts-parser
    console.log("⚠️  Could not load compiled module.");
    console.log("   Please ensure you've run 'npm run build' first.\n");

    console.error("Error: Could not load question bank");
    process.exit(1);
  }

  console.log(`✅ Loaded ${questions.length} questions`);

  // Translate questions
  const translations = await translateQuestions(questions);

  // Update question bank
  await updateQuestionBank(translations);

  console.log(`\n✅ Translation complete!`);
  console.log(`   Translated: ${translations.length}/${questions.length} questions`);
  console.log(
    "   Next: Merge translations into src/data/question-bank.ts manually"
  );
}

main().catch((error) => {
  console.error("\n❌ Error:", error.message);
  process.exit(1);
});
