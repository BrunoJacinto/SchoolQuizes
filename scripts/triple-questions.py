#!/usr/bin/env python3
"""Script to triple the number of questions by duplicating seeds"""

import re

def triple_seeds_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Pattern to find seed arrays
    # Matches: const xxxSeeds = [
    seed_pattern = r'(const\s+\w+Seeds\s*=\s*\[\s*)'

    def replace_seeds(match):
        start = match.group(0)
        # Find the closing ] after the seeds
        start_pos = match.end()
        bracket_count = 1
        end_pos = start_pos

        while bracket_count > 0 and end_pos < len(content):
            if content[end_pos] == '[':
                bracket_count += 1
            elif content[end_pos] == ']':
                bracket_count -= 1
            end_pos += 1

        # Extract the seed values
        seeds_section = content[start_pos:end_pos-1]

        # Find individual seed entries (lines with numbers)
        # Pattern: [number, number, ...] or [number, number, number, number]
        seed_entries = re.findall(r'\[[\d\s,]+\]', seeds_section)

        if len(seed_entries) < 10:
            return match.group(0)  # Not a seed array we want to triple

        # Generate variations of existing seeds
        variations = []
        for entry in seed_entries:
            # Parse numbers from entry
            numbers = re.findall(r'\d+', entry)
            if len(numbers) >= 2:
                # Add slight variations (shift numbers around)
                if len(numbers) == 2:  # [num, num, factor]
                    a, b = int(numbers[0]), int(numbers[1])
                    # Create variations by swapping or shifting
                    if a > 1:
                        variations.append(f"[{a-1}, {b}, {b}]")
                    if b > 1:
                        variations.append(f"[{a}, {b-1}, {a}]")
                elif len(numbers) == 3:  # [num, num, factor]
                    a, b, c = int(numbers[0]), int(numbers[1]), int(numbers[2])
                    if a > 1 and b > 1:
                        variations.append(f"[{a}, {b}, {(a+b)*2}]")
                        variations.append(f"[{a}, {b}, {c+6}]")
                elif len(numbers) == 4:  # [num, num, num, num]
                    # For 4-element entries, create permutations
                    nums = [int(x) for x in numbers]
                    variations.append(f"[{nums[1]}, {nums[0]}, {nums[3]}, {nums[2]}]")
                    variations.append(f"[{nums[2]}, {nums[3]}, {nums[0]}, {nums[1]}]")

        # If we don't have enough variations, pad with slight mutations
        while len(variations) < 20:
            # Just duplicate and add small variation
            base = seed_entries[len(variations) % len(seed_entries)]
            nums = re.findall(r'\d+', base)
            if nums:
                first = int(nums[0])
                if first < 8:
                    new_entry = base.replace(str(first), str(first + 1), 1)
                    variations.append(new_entry)
                else:
                    variations.append(base)

        # Format the variation comments
        variation_str = "// Additional variations for tripling\n    " + ",\n    ".join(variations[:20])

        return start + variation_str

    # This approach is getting complex. Let's use a simpler method:
    # Just add a fixed set of variations for each seed type

    # Better approach: manually add the variations using simple text replacement
    print("This script needs manual review. The question bank has complex seed patterns.")
    print("Implementing simpler automated tripling...")

    # Instead, let's just duplicate the seeds and adjust them
    lines = content.split('\n')
    result_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        result_lines.append(line)

        # Check if this is a seed array start
        if re.search(r'const\s+\w+Seeds\s*=\s*\[', line):
            # Find all seed entries until we hit the closing bracket
            seed_lines = []
            i += 1
            original_seed_count = 0

            while i < len(lines) and '] as const;' not in lines[i]:
                seed_lines.append(lines[i])
                if re.match(r'\s*\[\d', lines[i]):
                    original_seed_count += 1
                i += 1

            # If we have 10 original seeds, add 20 variations
            if original_seed_count == 10:
                result_lines.extend(seed_lines)
                result_lines.append('    // Additional variations for tripling')
                # Generate smart variations
                for j in range(20):
                    # Add variations based on pattern
                    if j < len(seed_lines):
                        seed_line = seed_lines[j % len(seed_lines)].strip()
                        numbers = re.findall(r'\d+', seed_line)
                        if len(numbers) == 2:
                            a, b = int(numbers[0]), int(numbers[1])
                            result_lines.append(f'    [{a + (j % 3)}, {b + (j % 2)}, {(a+b) * (j % 3 + 1)}],')
                        elif len(numbers) == 3:
                            a, b, c = int(numbers[0]), int(numbers[1]), int(numbers[2])
                            result_lines.append(f'    [{a}, {b}, {c + (j % 12)}],')
                        elif len(numbers) == 4:
                            a, b, c, d = [int(x) for x in numbers]
                            offset = j % 4
                            result_lines.append(f'    [{a+offset}, {b+offset}, {c+offset}, {d+offset}],')
                result_lines.append(lines[i])  # Add the closing ] as const;
            else:
                result_lines.extend(seed_lines)
                result_lines.append(lines[i])

        i += 1

    return '\n'.join(result_lines)

if __name__ == '__main__':
    filepath = 'src/data/question-bank.ts'
    result = triple_seeds_in_file(filepath)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(result)

    print(f"✅ Question bank updated with seed variations")
