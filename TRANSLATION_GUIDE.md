# Translating Questions to English

This guide explains how to automatically translate all 300 Portuguese quiz questions to English using the Claude API.

## Prerequisites

1. **Anthropic API Key**: You need a valid API key from [Anthropic Console](https://console.anthropic.com)
   - Sign up or log in
   - Navigate to API Keys
   - Create a new API key

2. **Environment Setup**: Add your API key to your environment:
   ```bash
   export ANTHROPIC_API_KEY=sk-ant-...your-key-here...
   ```

   Or add to `.env.local` (it won't be committed):
   ```bash
   ANTHROPIC_API_KEY=sk-ant-...your-key-here...
   ```

## Running the Translation

```bash
npm run translate
```

This command will:

1. **Parse** all 300 questions from `src/data/question-bank.ts`
2. **Translate** each question's prompt, options, and explanation to English using Claude Opus 4.6
3. **Add** English translations to the question definitions as:
   - `promptEN`: English version of the prompt
   - `optionsEN`: English versions of the 4 answer options
   - `explanationEN`: English version of the explanation

4. **Update** `src/data/question-bank.ts` with the new fields

## Translation Details

- **Model**: Claude Opus 4.6 (best quality for education content)
- **Batch Size**: 10 questions at a time to stay within rate limits
- **Language**: European Portuguese → American English
- **Domain**: 5th-grade mathematics (fractions, decimals, percentages, etc.)

## After Translation

Once translations are complete:

1. **Build** the updated project:
   ```bash
   npm run build
   ```

2. **Test** locally:
   ```bash
   npm run dev
   ```
   - Click the language toggle to switch between PT and EN
   - Verify questions display correctly in both languages

3. **Deploy** to Vercel:
   ```bash
   git add src/data/question-bank.ts
   git commit -m "Add English translations for all questions"
   git push
   ```

## Cost Estimate

- ~300 questions × ~200 tokens average = ~60,000 tokens
- Claude Opus 4.6: $0.003 per 1K input tokens = ~$0.18 estimated cost
- (Actual cost depends on translation length and number of retries)

## Troubleshooting

**"ANTHROPIC_API_KEY not set"**
- Make sure you've exported the key: `export ANTHROPIC_API_KEY=your-key`
- Or add it to `.env.local` file

**"Could not parse any questions"**
- The TypeScript source format may have changed
- Check if `src/data/question-bank.ts` follows the expected structure

**Translation fails partway through**
- Check your API rate limits at [Anthropic Console](https://console.anthropic.com)
- The script will continue with the next question, so you can re-run to finish

## Language Toggle

After translation, users can toggle between Portuguese and English using:

- **App**: Language toggle button in the top right
- **Context**: Uses React Context API (`LanguageContext`)
- **Fallback**: If English translation missing, shows Portuguese

## Notes

- Each question must have both Portuguese and English versions
- The correct answer index (`correctIndex`) is the same in both languages
- Topics remain in Portuguese (these are specific to the Portuguese curriculum)
