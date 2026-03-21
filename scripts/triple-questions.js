#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/question-bank.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// Function to generate seed variations
function generateVariations(seeds) {
  const variations = [];
  const seedList = seeds.trim().split('\n').filter(line => line.includes('['));

  for (let i = 0; i < 20; i++) {
    const seedIdx = i % seedList.length;
    const seed = seedList[seedIdx].trim().slice(0, -1); // Remove comma

    // Check if seed has operator (for fraction operations)
    const hasOperator = seed.includes('"');

    // Extract numbers and operator
    const numbers = seed.match(/\d+/g).map(Number);
    const operator = seed.match(/"[+\-]"/)?.[0];

    if (numbers.length === 2) {
      // [a, b, factor]
      const [a, b] = numbers;
      const newA = (a + (i % 3)) % 9 + 1;
      const newB = (b + (i % 4)) % 9 + 2;
      const factor = newA + newB;
      variations.push(`    [${newA}, ${newB}, ${factor}],`);
    } else if (numbers.length === 3) {
      // [a, b, denom]
      const [a, b, c] = numbers;
      const offset = (i * 2) % 8;
      variations.push(`    [${a}, ${b}, ${c + offset}],`);
    } else if (numbers.length >= 4) {
      // [a, b, c, d] or [a, b, c, d, operator]
      const [a, b, c, d] = numbers;
      const offset = i % 3;

      if (operator) {
        // Has operator - alternate between + and -
        const opChoice = i % 2 === 0 ? '"+\"' : '"-\"';
        variations.push(`    [${a + offset}, ${b + offset}, ${c + offset}, ${d + offset}, ${opChoice}],`);
      } else {
        // No operator
        variations.push(`    [${a + offset}, ${b + offset}, ${c + offset}, ${d + offset}],`);
      }
    }
  }

  return variations;
}

// Replace seed arrays that have exactly 10 entries
const seedArrayPattern = /(const\s+\w+Seeds\s*=\s*\[\s*[\s\S]*?\]\s*as const;)/g;
let matchCount = 0;

content = content.replace(seedArrayPattern, (match) => {
  // Count if this array has 10 entries
  const entries = match.match(/\[\d[^\]]*\]/g) || [];

  // Check if it's a 10-item array (not tripled yet)
  if (entries.length === 10) {
    matchCount++;
    console.log(`Processing seed array #${matchCount} with ${entries.length} entries...`);

    // Extract the seed lines
    const seedsMatch = match.match(/(\s*\[\d[^\]]*\],?)/g) || [];
    const seedLines = seedsMatch.slice(0, 10).join('\n');

    // Generate variations
    const variations = generateVariations(seedLines);
    const variationComment = '    // Additional variations for tripling\n';
    const variationText = variationComment + variations.join('\n');

    // Insert variations before the closing bracket
    const closing = '  ] as const;';
    return match.replace(closing, `${variationText}\n${closing}`);
  }

  return match;
});

// Update validation counts
content = content.replace(
  /assert\(questions\.length === 300,/,
  'assert(questions.length === 900,'
);

content = content.replace(
  /assert\(difficultyCount\.get\(difficulty\) === 100,/,
  'assert(difficultyCount.get(difficulty) === 300,'
);

content = content.replace(
  /assert\(\s*topicDifficultyCount\.get\(compositeKey\) === 10,/,
  'assert(\n        topicDifficultyCount.get(compositeKey) === 30,'
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log(`\n✅ Updated question bank: ${matchCount} seed arrays tripled`);
console.log('Total questions should now be 900');
