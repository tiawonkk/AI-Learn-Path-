import type { TrackSpec } from '@/types/curriculum';

export const TRACK_01: TrackSpec = {
  id: 'track-01',
  number: 1,
  shortLabel: '01',
  name: 'Python Fundamentals',
  categoryLabel: 'Python',
  subtitle: '0 to Hero: I/O, Data Types, Variables, Operators, Conditionals, Loops, Lists, Dicts & Sets, Functions & OOP',
  badgeHex: '#FACF4E',
  pdfSourceLabel: 'Module 01 PDF — Python 0 to Hero (Pages 1–9)',
  libraries: ['Python 3 Standard Library', 'Built-in Types', 'OOP'],
  module_wrapup: {
    certificate_title: 'Python AI Engineering Foundations',
    certificate_subtitle: 'Mastered core Python syntax, control flow, data structures, functions, and OOP architecture.',
    key_takeaways: [
      'print(...) outputs text/numbers to the screen, while input(...) always returns a str (cast with int() or float() before math).',
      'Core primitive types are str, int, float, and bool; inspect any value anytime with type(value).',
      'Variables are named memory boxes written in snake_case; = stores the value on the right into the label on the left.',
      'Math operators (+ - * / // % **) and comparisons (== != > < >= <=) power everyday AI logic.',
      'if-elif-else branches require a trailing colon (:) and clean 4-space indentation.',
      'Use for ... in range(...) when you know the step count, and while when looping until a condition changes.',
      'Python lists [...] start at index 0 (with -1 for the last item) and grow/shrink with .append() and .remove().',
      'Functions (def ... return ...) package reusable logic; classes (class, __init__, self) create independent objects.',
    ],
    quick_reference_headers: ['Stage', 'Core Syntax & Concepts'],
    quick_reference_rows: [
      ['1. Input & Output', 'print(...) shows output; input(...) reads user text (always str); # writes a comment; f"..." formats variables.'],
      ['2. Data Types & Vars', 'str, int, float, bool; type(x); int(x), float(x); snake_case naming (no leading digits or spaces).'],
      ['3. Operators, If & Loop', '+ - * / // % ** for math; == != < <= > >= for logic; if-elif-else; for i in range(a, b); while cond:.'],
      ['4. List, Function & OOP', 'list [...] (index 0, -1, .append(), .remove()); def fn(x): return y; class Blueprint: def __init__(self): ...'],
    ],
  },
  subModules: [
    {
      id: '1.1',
      trackId: 'track-01',
      order: 1,
      code: '1.1',
      title: 'Intro & Input / Output Streams',
      subtitle: 'Communicating with Python using print(), input(), f-strings, and comments.',
      categoryLabel: 'Python',
      difficulty: 'Easy',
      estMinutes: 15,
      theory: {
        intro:
          'Computers fundamentally understand binary 0s and 1s. Python acts as a friendly translator so every line you write in Google Colab or right here runs immediately.',
        why_it_matters:
          'Before analyzing datasets or building AI agents, engineers display messages with print(), read user prompts via input(), and leave notes with # comments.',
        history_brief:
          'Guido van Rossum began Python in the late 1980s and released v0.9.0 in 1991—naming it after Monty Python’s Flying Circus so coding felt relaxed and fun.',
        visual_diagram_id: 'py-io-stream',
        key_rule: 'input(...) ALWAYS gives back text (str)—even if the user types digits like "2026".',
        syntax_breakdown: [
          { token: 'print(...)', syntax: 'print("Hello AI", 2026)', description: 'Prints text (in quotes) or numbers directly to the screen.' },
          { token: 'input(...)', syntax: 'name = input("Your name? ")', description: 'Asks the user to type something and saves it as a str.' },
          { token: 'f-string', syntax: 'f"Welcome, {name}!"', description: 'Drops variable values straight inside a string cleanly.' },
          { token: '# Comment', syntax: '# Human note ignored by Python', description: 'Helpful note for humans; Python skips it.' },
        ],
      },
      syntaxCheck: {
        prompt: 'Complete the snippet to ask for a learner’s name and print a warm f-string greeting.',
        codeTemplate: `name = ___0___("Your name: ")\n___1___(___2___"Welcome, {name}!")`,
        blanks: [
          { id: 'b0', answer: 'input', placeholder: 'read' },
          { id: 'b1', answer: 'print', placeholder: 'show' },
          { id: 'b2', answer: 'f', placeholder: 'prefix' },
        ],
        wordBank: ['print', 'f', 'input', 'str', 'read'],
        hint: 'Use input() to read from the keyboard, print() to display it, and f before the quotes.',
        explanation: 'input() captures the name as text, and print(f"...") inserts {name} right inside the greeting.',
      },
      challenge: {
        id: 'chal-1-1',
        difficulty_kyu: '8 Kyu',
        xp_reward: 100,
        title: 'Friendly Welcome Banner',
        instructions:
          'Write a simple script that reads a name with input(), then prints a welcome greeting using an f-string.',
        requirements: [
          'Keep `name = input("What is your name? ")` at the top.',
          'Update the `print(...)` line to output: `Welcome to AI Engineering, {name}!`',
        ],
        starter_file_url: '/starters/track01_01_io.py',
        colab_notebook_url: 'https://colab.research.google.com/',
        validation_mode: 'py_unit_test',
        passing_threshold: 100,
        passing_label: 'All 3 Checks Pass',
        default_tasks: [
          'Notice how input() stores the typed text inside `name`.',
          'Use an f-string inside print() to greet the learner.',
        ],
        starter_code: `# Ask for the learner's name
name = input("What is your name? ")

# Print: Welcome to AI Engineering, <name>!
print("")
`,
        test_suite: {
          pyTests: [
            {
              id: '1.1-s1',
              name: 'Greets "Rina" using f-string',
              visibility: 'sample',
              rerunUserCode: true,
              stdinInputs: ['Rina'],
              testCode: `
assert "Welcome to AI Engineering, Rina!" in _captured_stdout, f"Expected 'Welcome to AI Engineering, Rina!', got {_captured_stdout!r}"
`,
            },
            {
              id: '1.1-s2',
              name: 'Works dynamically for "Budi"',
              visibility: 'sample',
              rerunUserCode: true,
              stdinInputs: ['Budi'],
              testCode: `
assert "Welcome to AI Engineering, Budi!" in _captured_stdout, f"Make sure you use {{name}} inside an f-string, got {_captured_stdout!r}"
`,
            },
            {
              id: '1.1-h1',
              name: 'Works dynamically for any name ("Ada")',
              visibility: 'hidden',
              rerunUserCode: true,
              stdinInputs: ['Ada'],
              testCode: `
assert "Welcome to AI Engineering, Ada!" in _captured_stdout
`,
            },
          ],
        },
      },
      summary: {
        key_takeaways: [
          'input() reads user text and always returns a str.',
          'f-strings (f"Hello, {name}!") make formatting clean and readable.',
        ],
        reflection_prompt: 'Note how adding `f` right before quotes turns `{name}` into the live value.',
      },
    },
    {
      id: '1.2',
      trackId: 'track-01',
      order: 2,
      code: '1.2',
      title: 'Data Types & Type Casting',
      subtitle: 'Distinguishing str, int, float, and bool using type() and simple conversions.',
      categoryLabel: 'Python',
      difficulty: 'Easy',
      estMinutes: 15,
      theory: {
        intro:
          'Python labels every value with a data type so it knows whether two things can be added mathematically or joined together as text.',
        why_it_matters:
          'When CSV files or input() prompts return numbers as strings ("25"), adding 5 raises an error unless you convert them with int() or float().',
        history_brief:
          'Python uses dynamic strong typing: you don’t declare types upfront, yet Python refuses unsafe guesses like "25" + 5.',
        visual_diagram_id: 'py-datatype-boxes',
        key_rule: 'Use type(x) to inspect any value, and int(x) / float(x) to turn numeric text into real math numbers.',
        syntax_breakdown: [
          { token: 'str', syntax: '"Hello AI"', description: 'Text wrapped in quotes.' },
          { token: 'int', syntax: '25, -5', description: 'Whole numbers without decimals.' },
          { token: 'float', syntax: '0.85, 3.14', description: 'Decimal numbers.' },
          { token: 'bool', syntax: 'True / False', description: 'Simple yes/no truth values.' },
        ],
      },
      syntaxCheck: {
        prompt: 'Turn the string "50" into a whole integer and check its type.',
        codeTemplate: `raw_count = "50"\nepochs = ___0___(raw_count)\nprint(___1___(epochs))`,
        blanks: [
          { id: 'b0', answer: 'int', placeholder: 'convert' },
          { id: 'b1', answer: 'type', placeholder: 'inspect' },
        ],
        wordBank: ['type', 'int', 'float', 'str', 'bool'],
        hint: 'Use int() to convert text into a whole number and type() to check its class.',
        explanation: 'int("50") produces the integer 50 so math works, and type(epochs) confirms <class \'int\'>.',
      },
      challenge: {
        id: 'chal-1-2',
        difficulty_kyu: '8 Kyu',
        xp_reward: 100,
        title: 'Convert Text Numbers for Math',
        instructions:
          'Convert the string variables `raw_epochs` and `raw_accuracy` into real numbers (`int` and `float`) so Python can add and multiply them.',
        requirements: [
          'Set `epochs = int(raw_epochs)` instead of `0`.',
          'Set `accuracy = float(raw_accuracy)` instead of `0.0`.',
        ],
        starter_file_url: '/starters/track01_02_types.py',
        colab_notebook_url: 'https://colab.research.google.com/',
        validation_mode: 'py_unit_test',
        passing_threshold: 100,
        passing_label: 'All 3 Checks Pass',
        default_tasks: [
          'Convert raw_epochs using int(raw_epochs).',
          'Convert raw_accuracy using float(raw_accuracy).',
        ],
        starter_code: `# These values start as text (str)
raw_epochs = "25"
raw_accuracy = "0.85"

# Replace 0 and 0.0 using int(...) and float(...)
epochs = 0
accuracy = 0.0

print("Next epochs:", epochs + 5)
print("Double accuracy:", accuracy * 2)
`,
        test_suite: {
          pyTests: [
            {
              id: '1.2-s1',
              name: 'Converts epochs to int (25) and accuracy to float (0.85)',
              visibility: 'sample',
              rerunUserCode: true,
              testCode: `
assert type(epochs) is int and epochs == 25, f"Expected int 25, got {epochs!r}"
assert type(accuracy) is float and abs(accuracy - 0.85) < 1e-6, f"Expected float 0.85, got {accuracy!r}"
`,
            },
            {
              id: '1.2-s2',
              name: 'Prints updated math results',
              visibility: 'sample',
              rerunUserCode: true,
              testCode: `
assert "30" in _captured_stdout, "Expected 'Next epochs: 30' in output"
assert "1.7" in _captured_stdout, "Expected 'Double accuracy: 1.7' in output"
`,
            },
            {
              id: '1.2-h1',
              name: 'Uses raw_epochs and raw_accuracy dynamically',
              visibility: 'hidden',
              rerunUserCode: true,
              overrideVars: { raw_epochs: '40', raw_accuracy: '0.9' },
              testCode: `
assert type(epochs) is int and epochs == 40, "Convert raw_epochs instead of hardcoding 25"
assert type(accuracy) is float and abs(accuracy - 0.9) < 1e-6, "Convert raw_accuracy instead of hardcoding 0.85"
`,
            },
          ],
        },
      },
      summary: {
        key_takeaways: [
          'str, int, float, and bool are Python’s 4 core primitive types.',
          'Always cast strings with int() or float() before doing math.',
        ],
        reflection_prompt: 'Write a quick reminder about when to use int() vs float().',
      },
    },
    {
      id: '1.3',
      trackId: 'track-01',
      order: 3,
      code: '1.3',
      title: 'Variables & Memory State',
      subtitle: 'Naming rules, assigning values in memory, and updating variables cleanly.',
      categoryLabel: 'Python',
      difficulty: 'Easy',
      estMinutes: 15,
      theory: {
        intro:
          'Think of a variable as a labeled box in memory where you can store a value and update it later. In Python, `=` means "put the value on the right inside the variable on the left".',
        why_it_matters:
          'Training scripts update running totals like `hours`, `epoch`, and `best_score` step by step as data flows through.',
        history_brief:
          'PEP 8 (2001) popularized `snake_case` naming across Python so variable names read clearly like English.',
        visual_diagram_id: 'py-memory-vars',
        key_rule: 'Names can use letters, digits, and underscores (_), cannot start with a digit, and have no spaces.',
        syntax_breakdown: [
          { token: 'Assign', syntax: 'hours = 2', description: 'Stores 2 inside `hours`.' },
          { token: 'Update', syntax: 'hours = hours + 3', description: 'Reads old value (2), adds 3, saves 5.' },
          { token: 'snake_case', syntax: 'study_hours, topic_2', description: 'Valid clean Python variable style.' },
        ],
      },
      syntaxCheck: {
        prompt: 'Update `study_hours` by adding 1 to its current value using valid snake_case.',
        codeTemplate: `___0___ = 2\nstudy_hours = ___1___ + 1`,
        blanks: [
          { id: 'b0', answer: 'study_hours', placeholder: 'var' },
          { id: 'b1', answer: 'study_hours', placeholder: 'var' },
        ],
        wordBank: ['study_hours', '1study', 'study hours', 'hours'],
        hint: 'Variable names cannot start with digits or contain spaces.',
        explanation: 'Python calculates the right side (2 + 1) first, then updates `study_hours` to 3.',
      },
      challenge: {
        id: 'chal-1-3',
        difficulty_kyu: '8 Kyu',
        xp_reward: 100,
        title: 'Update Your Study Tracker',
        instructions:
          'Update `topic` to `"Variables"` and add `3` more hours to `hours` so the printed summary shows 5 total hours.',
        requirements: [
          'Reassign `topic = "Variables"`.',
          'Update `hours = hours + 3` (so `hours` becomes 5).',
        ],
        starter_file_url: '/starters/track01_03_variables.py',
        colab_notebook_url: 'https://colab.research.google.com/',
        validation_mode: 'py_unit_test',
        passing_threshold: 100,
        passing_label: 'All 3 Checks Pass',
        default_tasks: [
          'Reassign topic to "Variables".',
          'Update hours using hours + 3.',
        ],
        starter_code: `# Starting study profile
topic = "Python Basics"
hours = 2

# 1. Update topic to "Variables"
# 2. Add 3 hours to hours (so it becomes 5)
topic = topic
hours = hours + 0

print(f"Studying {topic} for {hours} hours")
`,
        test_suite: {
          pyTests: [
            {
              id: '1.3-s1',
              name: 'Updates topic to "Variables"',
              visibility: 'sample',
              rerunUserCode: true,
              testCode: `
assert topic == "Variables", f"Expected topic == 'Variables', got {topic!r}"
`,
            },
            {
              id: '1.3-s2',
              name: 'Increases hours from 2 to 5',
              visibility: 'sample',
              rerunUserCode: true,
              testCode: `
assert hours == 5, f"Expected hours == 5, got {hours!r}"
assert "Studying Variables for 5 hours" in _captured_stdout
`,
            },
            {
              id: '1.3-h1',
              name: 'Adds 3 dynamically to whatever starting hours value exists',
              visibility: 'hidden',
              rerunUserCode: true,
              overrideVars: { hours: 10 },
              testCode: `
assert hours == 13, "Write 'hours = hours + 3' instead of hardcoding 'hours = 5'"
`,
            },
          ],
        },
      },
      summary: {
        key_takeaways: [
          'The `=` sign assigns or overwrites a variable’s value.',
          'Expressions like `hours = hours + 3` read the existing value before saving the new one.',
        ],
        reflection_prompt: 'Jot down the 3 rules for legal Python variable names.',
      },
    },
    {
      id: '1.4',
      trackId: 'track-01',
      order: 4,
      code: '1.4',
      title: 'Math & Comparison Operators',
      subtitle: 'Arithmetic (+, -, *, /, //, %, **) and comparisons (==, !=, <, <=, >, >=).',
      categoryLabel: 'Python',
      difficulty: 'Easy',
      estMinutes: 18,
      theory: {
        intro:
          'At its heart, AI runs millions of math operations and comparisons every second. Knowing how Python handles division (`/` vs `//`) and percentages makes formulas effortless.',
        why_it_matters:
          'Splitting data into batches (`//` and `%`), computing powers (`**`), and checking thresholds (`<=`, `>=`) appear in almost every script.',
        history_brief:
          'Python 3 made single slash `/` always produce a clean decimal (10 / 4 == 2.5) while keeping `//` for whole-number floor division.',
        visual_diagram_id: 'py-operators-alu',
        key_rule: 'Single slash `/` always gives a decimal float; `//` drops decimals; `%` gives the remainder.',
        syntax_breakdown: [
          { token: '+ - * /', syntax: '10 / 4 -> 2.5', description: 'Standard arithmetic.' },
          { token: '// and %', syntax: '10 // 3 -> 3, 10 % 3 -> 1', description: 'Floor division and remainder.' },
          { token: '**', syntax: '2 ** 3 -> 8', description: 'Power / exponent.' },
          { token: 'Compare', syntax: '==, !=, <, <=, >, >=', description: 'Produces True or False.' },
        ],
      },
      syntaxCheck: {
        prompt: 'Find how many full batches of 32 fit into 100 samples, and how many samples remain.',
        codeTemplate: `full_batches = 100 ___0___ 32\nleftover = 100 ___1___ 32`,
        blanks: [
          { id: 'b0', answer: '//', placeholder: 'floor' },
          { id: 'b1', answer: '%', placeholder: 'mod' },
        ],
        wordBank: ['//', '%', '/', '**', '=='],
        hint: 'Floor division uses double slashes (//), and remainder uses percent (%).',
        explanation: '100 // 32 is 3 full batches, and 100 % 32 is the 4 leftover samples.',
      },
      challenge: {
        id: 'chal-1-4',
        difficulty_kyu: '7 Kyu',
        xp_reward: 120,
        title: 'Quick Discount Calculator',
        instructions:
          'Calculate `discount`, `final_price`, and check if `final_price <= 85000` using Python math and comparison operators.',
        requirements: [
          'Set `discount = price * (discount_pct / 100)`.',
          'Set `final_price = price - discount`.',
          'Keep `is_affordable = final_price <= 85000`.',
        ],
        starter_file_url: '/starters/track01_04_operators.py',
        colab_notebook_url: 'https://colab.research.google.com/',
        validation_mode: 'py_unit_test',
        passing_threshold: 100,
        passing_label: 'All 3 Checks Pass',
        default_tasks: [
          'Calculate discount using price * (discount_pct / 100).',
          'Subtract discount from price to get final_price.',
        ],
        starter_code: `price = 100000
discount_pct = 20

# Calculate the discount amount and final price
discount = 0
final_price = 0
is_affordable = final_price <= 85000

print("Final price:", final_price)
print("Affordable?", is_affordable)
`,
        test_suite: {
          pyTests: [
            {
              id: '1.4-s1',
              name: 'Computes 20% discount on 100,000 -> 80,000',
              visibility: 'sample',
              rerunUserCode: true,
              testCode: `
assert discount == 20000, f"Expected discount 20000, got {discount}"
assert final_price == 80000, f"Expected final_price 80000, got {final_price}"
assert is_affordable is True
`,
            },
            {
              id: '1.4-s2',
              name: 'Prints Final price and Affordable status',
              visibility: 'sample',
              rerunUserCode: true,
              testCode: `
assert "80000" in _captured_stdout
`,
            },
            {
              id: '1.4-h1',
              name: 'Works dynamically when price and discount_pct change',
              visibility: 'hidden',
              rerunUserCode: true,
              overrideVars: { price: 200000, discount_pct: 10 },
              testCode: `
assert discount == 20000
assert final_price == 180000
assert is_affordable is False
`,
            },
          ],
        },
      },
      summary: {
        key_takeaways: [
          'Use parentheses `(discount_pct / 100)` when combining percentages with multiplication.',
          'Comparison operators like `<=` automatically return a boolean `True` or `False`.',
        ],
        reflection_prompt: 'Note the difference between `10 / 4` (2.5) and `10 // 4` (2).',
      },
    },
    {
      id: '1.5',
      trackId: 'track-01',
      order: 5,
      code: '1.5',
      title: 'Conditionals (if / elif / else)',
      subtitle: 'Making decisions with if, elif, else, colons, and clean indentation.',
      categoryLabel: 'Python',
      difficulty: 'Easy',
      estMinutes: 18,
      theory: {
        intro:
          'Conditionals let your code choose different paths depending on a value—just like deciding whether a model score earns an A, B, or C.',
        why_it_matters:
          'Every guardrail, threshold check, and classification rule in software relies on clean `if / elif / else` branching.',
        history_brief:
          'Instead of curly braces `{}`, Python uses indentation (4 spaces) so readable formatting and program blocks are one and the same.',
        visual_diagram_id: 'py-branch-flow',
        key_rule: 'End every `if`, `elif`, and `else` line with a colon `:` and indent the code inside by 4 spaces.',
        syntax_breakdown: [
          { token: 'if ...:', syntax: 'if score >= 90:', description: 'Runs first if condition is True.' },
          { token: 'elif ...:', syntax: 'elif score >= 75:', description: 'Checked only if previous branch was False.' },
          { token: 'else:', syntax: 'else:', description: 'Runs if all checks above were False.' },
        ],
      },
      syntaxCheck: {
        prompt: 'Complete the grade branches: A (>=90), B (>=75), and fallback C.',
        codeTemplate: `if score >= 90___0___\n    grade = "A"\n___1___ score >= 75:\n    grade = "B"\n___2___:\n    grade = "C"`,
        blanks: [
          { id: 'b0', answer: ':', placeholder: 'punct' },
          { id: 'b1', answer: 'elif', placeholder: 'branch' },
          { id: 'b2', answer: 'else', placeholder: 'fallback' },
        ],
        wordBank: ['elif', ':', 'else', 'else if', ';'],
        hint: 'Python uses `elif` (not `else if`) and requires a colon `:` at the end of every branch line.',
        explanation: 'Only the first matching branch runs—making top-down threshold ordering super clean.',
      },
      challenge: {
        id: 'chal-1-5',
        difficulty_kyu: '7 Kyu',
        xp_reward: 120,
        title: 'Score to Grade Converter',
        instructions:
          'Complete the `if / elif / else` block so `grade` becomes `"A"` (90+), `"B"` (75–89), or `"C"` (below 75).',
        requirements: [
          'If `score >= 90`, set `grade = "A"`.',
          'Add `elif score >= 75:` to set `grade = "B"`.',
          'In `else:`, set `grade = "C"`.',
        ],
        starter_file_url: '/starters/track01_05_conditionals.py',
        colab_notebook_url: 'https://colab.research.google.com/',
        validation_mode: 'py_unit_test',
        passing_threshold: 100,
        passing_label: 'All 4 Checks Pass',
        default_tasks: [
          'Add an elif branch for score >= 75.',
          'Update else branch to set grade = "C".',
        ],
        starter_code: `score = 82

# Set grade based on score:
# 90 or above -> "A"
# 75 to 89    -> "B"
# below 75    -> "C"
if score >= 90:
    grade = "A"
else:
    grade = "?"

print("Grade:", grade)
`,
        test_suite: {
          pyTests: [
            {
              id: '1.5-s1',
              name: 'Score 82 gives Grade "B"',
              visibility: 'sample',
              rerunUserCode: true,
              testCode: `
assert grade == "B", f"Expected 'B' for score 82, got {grade!r}"
`,
            },
            {
              id: '1.5-s2',
              name: 'Score 95 gives Grade "A"',
              visibility: 'sample',
              rerunUserCode: true,
              overrideVars: { score: 95 },
              testCode: `
assert grade == "A", f"Expected 'A' for score 95, got {grade!r}"
`,
            },
            {
              id: '1.5-h1',
              name: 'Score 60 gives Grade "C"',
              visibility: 'hidden',
              rerunUserCode: true,
              overrideVars: { score: 60 },
              testCode: `
assert grade == "C", f"Expected 'C' for score 60, got {grade!r}"
`,
            },
            {
              id: '1.5-h2',
              name: 'Exact boundaries 90 ("A") and 75 ("B")',
              visibility: 'hidden',
              rerunUserCode: true,
              overrideVars: { score: 75 },
              testCode: `
assert grade == "B", f"Score 75 should be 'B', got {grade!r}"
`,
            },
          ],
        },
      },
      summary: {
        key_takeaways: [
          'Order numeric checks from highest threshold down so `elif` handles middle ranges cleanly.',
          'Always end `if`, `elif`, and `else` lines with `:` and indent 4 spaces.',
        ],
        reflection_prompt: 'Why should `>= 90` come before `>= 75`?',
      },
    },
    {
      id: '1.6',
      trackId: 'track-01',
      order: 6,
      code: '1.6',
      title: 'Loops (for & while)',
      subtitle: 'Repeating steps cleanly across epoch ranges and while conditions.',
      categoryLabel: 'Python',
      difficulty: 'Easy',
      estMinutes: 20,
      theory: {
        intro:
          'Loops save you from writing repetitive lines by automatically repeating an indented block over a sequence (`for`) or while a condition stays True (`while`).',
        why_it_matters:
          'Model training repeats over N epochs using `for`, while AI agents keep acting until a task finishes using `while`.',
        history_brief:
          'Python’s `for` loop reads cleanly like English (`for item in sequence:`), paired with lazy `range()` sequences.',
        visual_diagram_id: 'py-loop-stepper',
        key_rule: '`range(1, 4)` generates `1, 2, 3`—the final stop number (`4`) is not included.',
        syntax_breakdown: [
          { token: 'for + range', syntax: 'for i in range(1, 4):', description: 'Loops through 1, 2, 3.' },
          { token: 'while loop', syntax: 'while battery < 100:', description: 'Repeats as long as condition is True.' },
        ],
      },
      syntaxCheck: {
        prompt: 'Loop over epochs 1 to 3 with range(), and keep charging while battery < 100.',
        codeTemplate: `for epoch in ___0___(1, 4):\n    print(epoch)\n\n___1___ battery < 100:\n    battery += 10`,
        blanks: [
          { id: 'b0', answer: 'range', placeholder: 'seq' },
          { id: 'b1', answer: 'while', placeholder: 'loop' },
        ],
        wordBank: ['while', 'range', 'for', 'until', 'loop'],
        hint: 'Use range(1, 4) for 1..3 and while to keep looping while battery < 100.',
        explanation: 'range(1, 4) yields 1, 2, 3; while checks battery < 100 before each step.',
      },
      challenge: {
        id: 'chal-1-6',
        difficulty_kyu: '7 Kyu',
        xp_reward: 130,
        title: 'Epoch Logger & Battery Charger',
        instructions:
          'Fill the `epochs` list with `"Epoch 1"`, `"Epoch 2"`, `"Epoch 3"` using the `for` loop, and charge `battery` from 70 to 100 using the `while` loop.',
        requirements: [
          'Inside the `for` loop, append `f"Epoch {i}"` to `epochs`.',
          'Inside the `while` loop, replace `break` with `battery = battery + 10`.',
        ],
        starter_file_url: '/starters/track01_06_loops.py',
        colab_notebook_url: 'https://colab.research.google.com/',
        validation_mode: 'py_unit_test',
        passing_threshold: 100,
        passing_label: 'All 3 Checks Pass',
        default_tasks: [
          'Replace pass with epochs.append(f"Epoch {i}").',
          'Replace break with battery = battery + 10.',
        ],
        starter_code: `# 1. Fill epochs with ["Epoch 1", "Epoch 2", "Epoch 3"]
epochs = []
for i in range(1, 4):
    pass  # replace pass with: epochs.append(f"Epoch {i}")

# 2. Charge battery from 70 up to 100 (+10 each step)
battery = 70
while battery < 100:
    break  # replace break with: battery = battery + 10

print("Epochs:", epochs)
print("Battery:", battery)
`,
        test_suite: {
          pyTests: [
            {
              id: '1.6-s1',
              name: 'Collects Epoch 1 through Epoch 3',
              visibility: 'sample',
              rerunUserCode: true,
              testCode: `
assert epochs == ["Epoch 1", "Epoch 2", "Epoch 3"], f"Got {epochs!r}"
`,
            },
            {
              id: '1.6-s2',
              name: 'Charges battery up to 100',
              visibility: 'sample',
              rerunUserCode: true,
              testCode: `
assert battery == 100, f"Expected battery == 100, got {battery!r}"
`,
            },
            {
              id: '1.6-h1',
              name: 'Works if battery starts at 80',
              visibility: 'hidden',
              rerunUserCode: true,
              overrideVars: { battery: 80 },
              testCode: `
assert battery == 100, "Use a while loop instead of hardcoding battery = 100"
`,
            },
          ],
        },
      },
      summary: {
        key_takeaways: [
          '`range(1, 4)` stops right before `4`.',
          'Always change the condition variable inside a `while` loop so it finishes cleanly.',
        ],
        reflection_prompt: 'When does a `while` loop feel more natural than a `for` loop?',
      },
    },
    {
      id: '1.7',
      trackId: 'track-01',
      order: 7,
      code: '1.7',
      title: 'Lists & Sequence Mutation',
      subtitle: 'Storing ordered items inside [...], indexing from 0, .append(), and .remove().',
      categoryLabel: 'Python',
      difficulty: 'Medium',
      estMinutes: 20,
      theory: {
        intro:
          'A Python `list` holds many ordered values inside square brackets `[ ... ]`. It is the everyday collection you use before moving up to NumPy arrays.',
        why_it_matters:
          'Model lists, prediction results, and text chunks are all stored and updated in Python lists.',
        history_brief:
          'Python starts counting list positions at index `0` and supports `-1` as a handy shortcut for the very last item.',
        visual_diagram_id: 'py-list-indexer',
        key_rule: 'Index `0` is the first item, `-1` is the last item, `.append(x)` adds at the end, and `.remove(x)` deletes by value.',
        syntax_breakdown: [
          { token: 'Indexing', syntax: 'models[0], models[-1]', description: 'Reads the first and last element.' },
          { token: '.append(x)', syntax: 'models.append("Random Forest")', description: 'Adds an item to the end.' },
          { token: '.remove(x)', syntax: 'models.remove("SVM")', description: 'Removes the matching value.' },
        ],
      },
      syntaxCheck: {
        prompt: 'Grab the last item from `models`, then add `"XGBoost"` to the end.',
        codeTemplate: `models = ["Linear", "SVM"]\nlast_item = models[___0___]\nmodels.___1___("XGBoost")`,
        blanks: [
          { id: 'b0', answer: '-1', placeholder: 'idx' },
          { id: 'b1', answer: 'append', placeholder: 'method' },
        ],
        wordBank: ['append', '-1', '0', 'add', 'push'],
        hint: 'Index -1 grabs the tail item, and .append() adds a new item to the end.',
        explanation: 'models[-1] gets "SVM", and models.append("XGBoost") grows the list cleanly.',
      },
      challenge: {
        id: 'chal-1-7',
        difficulty_kyu: '6 Kyu',
        xp_reward: 150,
        title: 'Update the ML Model List',
        instructions:
          'Read the first item from `models` into `first_model`, add `"Random Forest"` to `models`, and remove `"SVM"`.',
        requirements: [
          'Set `first_model = models[0]`.',
          'Call `models.append("Random Forest")`.',
          'Call `models.remove("SVM")`.',
        ],
        starter_file_url: '/starters/track01_07_lists.py',
        colab_notebook_url: 'https://colab.research.google.com/',
        validation_mode: 'py_unit_test',
        passing_threshold: 100,
        passing_label: 'All 3 Checks Pass',
        default_tasks: [
          'Grab index 0 into first_model.',
          'Append "Random Forest" and remove "SVM".',
        ],
        starter_code: `models = ["Linear Regression", "Decision Tree", "SVM"]

# 1. Grab the first item using index 0
first_model = ""

# 2. Add "Random Forest" to models using .append(...)
# 3. Remove "SVM" from models using .remove(...)

print("First:", first_model)
print("Models:", models)
`,
        test_suite: {
          pyTests: [
            {
              id: '1.7-s1',
              name: 'Reads first_model as "Linear Regression"',
              visibility: 'sample',
              rerunUserCode: true,
              testCode: `
assert first_model == "Linear Regression", f"Expected 'Linear Regression', got {first_model!r}"
`,
            },
            {
              id: '1.7-s2',
              name: 'Appends "Random Forest" and removes "SVM"',
              visibility: 'sample',
              rerunUserCode: true,
              testCode: `
assert models == ["Linear Regression", "Decision Tree", "Random Forest"], f"Got {models!r}"
`,
            },
            {
              id: '1.7-h1',
              name: 'Maintains exact list length of 3',
              visibility: 'hidden',
              rerunUserCode: true,
              testCode: `
assert len(models) == 3 and "SVM" not in models
`,
            },
          ],
        },
      },
      summary: {
        key_takeaways: [
          'List indices always start at `0`, and `-1` refers to the final element.',
          '`.append()` adds to the end while `.remove()` deletes a specific item.',
        ],
        reflection_prompt: 'Note what index `models[1]` gives in a 3-item list.',
      },
    },
    {
      id: '1.8',
      trackId: 'track-01',
      order: 8,
      code: '1.8',
      title: 'Dictionaries & Sets',
      subtitle: 'Fast key-value lookup with dicts, safe .get() access, and deduplication with sets.',
      categoryLabel: 'Python',
      difficulty: 'Easy',
      estMinutes: 15,
      theory: {
        intro:
          'While a list stores items by position (`0, 1, 2`), a **dictionary** (`{key: value}`) stores items by meaningful labels—just like a real JSON record or config file. A **set** (`{a, b}`) stores only unique values with zero duplicates.',
        why_it_matters:
          'Every AI API payload, model hyperparameter config, and vocabulary lookup table in Python is built on dictionaries and sets.',
        history_brief:
          'Python dictionaries use fast hash tables under the hood, making key lookup nearly instant (`O(1)`) even with millions of entries.',
        visual_diagram_id: 'py-dict-set-map',
        key_rule: 'Use `my_dict.get("key", default)` to read safely without crashing if a key is missing, and `set(items)` to remove duplicates.',
        syntax_breakdown: [
          { token: 'dict {k: v}', syntax: 'config = {"lr": 0.01, "epochs": 10}', description: 'Maps named keys to values.' },
          { token: '.get()', syntax: 'config.get("batch", 32)', description: 'Reads a key safely with a fallback default.' },
          { token: 'set()', syntax: 'unique_tags = set(raw_tags)', description: 'Automatically removes duplicate entries.' },
        ],
      },
      syntaxCheck: {
        prompt: 'Safely read `"batch_size"` with default `32`, and deduplicate `tags` with `set()`.',
        codeTemplate: `batch = config.___0___("batch_size", 32)\nunique_tags = ___1___(tags)`,
        blanks: [
          { id: 'b0', answer: 'get', placeholder: 'method' },
          { id: 'b1', answer: 'set', placeholder: 'type' },
        ],
        wordBank: ['get', 'set', 'list', 'find', 'dict'],
        hint: 'Use `.get()` on dictionaries and `set()` to deduplicate.',
        explanation: '`.get()` prevents `KeyError` crashes, while `set()` keeps only unique elements.',
      },
      challenge: {
        id: 'chal-1-8',
        difficulty_kyu: '6 Kyu',
        xp_reward: 130,
        title: 'Model Config & Unique Tags',
        instructions:
          'Given `model_config` and `raw_tags`, safely read the `"optimizer"` key (defaulting to `"adam"`), add `"epochs": 20` to `model_config`, and store the deduplicated tags in `unique_tags`.',
        requirements: [
          'Set `optimizer = model_config.get("optimizer", "adam")`.',
          'Add `"epochs"` with value `20` into `model_config`.',
          'Create `unique_tags = set(raw_tags)`.',
        ],
        starter_file_url: '/starters/track01_08_dicts_sets.py',
        colab_notebook_url: 'https://colab.research.google.com/',
        validation_mode: 'py_unit_test',
        passing_threshold: 100,
        passing_label: 'All 3 Checks Pass',
        default_tasks: [
          'Use .get() to safely read optimizer with default "adam".',
          'Add model_config["epochs"] = 20 and convert raw_tags to a set.',
        ],
        starter_code: `# Starting dictionary and list with duplicates
model_config = {"model": "RandomForest", "lr": 0.01}
raw_tags = ["ml", "python", "ml", "ai", "python"]

# 1. Read "optimizer" safely (default to "adam")
optimizer = ""

# 2. Add "epochs": 20 to model_config

# 3. Remove duplicates from raw_tags using set()
unique_tags = set()
`,
        test_suite: {
          pyTests: [
            {
              id: '1.8-s1',
              name: 'Safely defaults missing optimizer to "adam"',
              visibility: 'sample',
              rerunUserCode: true,
              testCode: `
assert optimizer == "adam", f"Expected 'adam', got {optimizer!r}"
`,
            },
            {
              id: '1.8-s2',
              name: 'Adds epochs=20 and deduplicates raw_tags',
              visibility: 'sample',
              rerunUserCode: true,
              testCode: `
assert model_config.get("epochs") == 20, f"Expected epochs=20, got {model_config}"
assert unique_tags == {"ml", "python", "ai"}, f"Expected 3 unique tags, got {unique_tags}"
`,
            },
            {
              id: '1.8-h1',
              name: 'Preserves existing keys in model_config',
              visibility: 'hidden',
              rerunUserCode: true,
              testCode: `
assert model_config["model"] == "RandomForest" and len(unique_tags) == 3
`,
            },
          ],
        },
      },
      summary: {
        key_takeaways: [
          'Dictionaries map readable keys to values (`{k: v}`) and `.get(k, default)` avoids missing-key crashes.',
          'Sets (`set(...)`) automatically keep only unique items.',
        ],
        reflection_prompt: 'When would you choose a dictionary over a list in an AI project?',
      },
    },
    {
      id: '1.9',
      trackId: 'track-01',
      order: 9,
      code: '1.9',
      title: 'Functions (def & return)',
      subtitle: 'Wrapping reusable code inside def functions with parameters and return.',
      categoryLabel: 'Python',
      difficulty: 'Medium',
      estMinutes: 20,
      theory: {
        intro:
          'Now that you know variables, conditionals, loops, and lists, a **function** (`def`) lets you bundle any logic under a clean name so you can call it over and over with different inputs.',
        why_it_matters:
          'Without functions, you would have to copy-paste formulas everywhere instead of calling one tidy helper.',
        history_brief:
          'Functions allow Python code to act as clean building blocks wrapping complex math and AI engines.',
        visual_diagram_id: 'py-function-machine',
        key_rule: '`print()` displays text on screen; `return` sends the computed answer back to the caller.',
        syntax_breakdown: [
          { token: 'def', syntax: 'def discount_price(price, pct):', description: 'Creates a reusable function with parameters.' },
          { token: 'return', syntax: 'return final_price', description: 'Hands the result back to calling code.' },
        ],
      },
      syntaxCheck: {
        prompt: 'Define `compute_discount` and return `final_price` back to the caller.',
        codeTemplate: `___0___ compute_discount(price, pct):\n    final_price = price * (1 - pct / 100)\n    ___1___ final_price`,
        blanks: [
          { id: 'b0', answer: 'def', placeholder: 'keyword' },
          { id: 'b1', answer: 'return', placeholder: 'keyword' },
        ],
        wordBank: ['return', 'def', 'function', 'print', 'yield'],
        hint: 'Functions begin with `def` and hand back answers with `return`.',
        explanation: '`def` declares the function, and `return` lets you save or reuse the answer.',
      },
      challenge: {
        id: 'chal-1-8',
        difficulty_kyu: '6 Kyu',
        xp_reward: 150,
        title: 'Build a Reusable Discount Function',
        instructions:
          'Complete `discount_price(price, discount_pct)` so it calculates the price after discount and returns it.',
        requirements: [
          'Calculate `cut = price * (discount_pct / 100)`.',
          'Return `price - cut`.',
        ],
        starter_file_url: '/starters/track01_08_functions.py',
        colab_notebook_url: 'https://colab.research.google.com/',
        validation_mode: 'py_unit_test',
        passing_threshold: 100,
        passing_label: 'All 3 Checks Pass',
        default_tasks: [
          'Compute the discount cut inside discount_price.',
          'Return the final price.',
        ],
        starter_code: `# Complete this reusable function
def discount_price(price, discount_pct):
    # Calculate final price after discount
    final = price
    return final

print("Sale price:", discount_price(200000, 10))
`,
        test_suite: {
          pyTests: [
            {
              id: '1.8-s1',
              name: '10% off 200,000 returns 180,000',
              visibility: 'sample',
              testCode: `
assert discount_price(200000, 10) == 180000
`,
            },
            {
              id: '1.8-s2',
              name: '25% off 500,000 returns 375,000',
              visibility: 'sample',
              testCode: `
assert discount_price(500000, 25) == 375000
`,
            },
            {
              id: '1.8-h1',
              name: '0% discount leaves price unchanged',
              visibility: 'hidden',
              testCode: `
assert discount_price(1000, 0) == 1000
assert discount_price(1000, 50) == 500
`,
            },
          ],
        },
      },
      summary: {
        key_takeaways: [
          'Functions turn repeated formulas into clean, parameterized one-liners.',
          'Always use `return` when other code needs to store or use the result.',
        ],
        reflection_prompt: 'Note how calling `discount_price(500000, 25)` reuses your formula with zero duplication.',
      },
    },
    {
      id: '1.10',
      trackId: 'track-01',
      order: 10,
      code: '1.10',
      title: 'OOP: Class, Object, __init__ & self',
      subtitle: 'Creating reusable object blueprints with class, __init__, and self.',
      categoryLabel: 'Python',
      difficulty: 'Medium',
      estMinutes: 25,
      theory: {
        intro:
          'Object-Oriented Programming (OOP) bundles data (variables) and actions (functions) into one neat blueprint called a `class`. From one blueprint, you can create many independent objects.',
        why_it_matters:
          'Scikit-Learn models, PyTorch `nn.Module` networks, and AI agents are all Python classes.',
        history_brief:
          'Python makes OOP clear by passing `self` explicitly so every object keeps its own private state.',
        visual_diagram_id: 'py-oop-blueprint',
        key_rule: '`__init__` runs automatically when an object is created; `self` keeps each object’s data separate.',
        syntax_breakdown: [
          { token: 'class', syntax: 'class AILearner:', description: 'Defines the blueprint.' },
          { token: '__init__', syntax: 'def __init__(self, name):', description: 'Sets starting fields when created.' },
          { token: 'self', syntax: 'self.modules_done = 0', description: 'Refers to this specific object instance.' },
        ],
      },
      syntaxCheck: {
        prompt: 'Complete the constructor and store `name` on the object using `self`.',
        codeTemplate: `class AILearner:\n    def ___0___(self, name):\n        ___1___.name = name`,
        blanks: [
          { id: 'b0', answer: '__init__', placeholder: 'dunder' },
          { id: 'b1', answer: 'self', placeholder: 'instance' },
        ],
        wordBank: ['self', '__init__', 'this', 'init', 'class'],
        hint: 'Python constructors use double underscores (`__init__`) and `self`.',
        explanation: '`__init__` sets up each new learner object, and `self.name` keeps Rina separate from Budi.',
      },
      challenge: {
        id: 'chal-1-9',
        difficulty_kyu: '5 Kyu',
        xp_reward: 180,
        title: 'Create an AILearner Class',
        instructions:
          'Complete `finish_module()` and `info()` on `AILearner` so each learner object tracks its own completed modules.',
        requirements: [
          '`finish_module(self)` adds `1` to `self.modules_done`.',
          '`info(self)` returns `f"{self.name} - {self.modules_done} modules done"`.',
        ],
        starter_file_url: '/starters/track01_09_oop.py',
        colab_notebook_url: 'https://colab.research.google.com/',
        validation_mode: 'py_unit_test',
        passing_threshold: 100,
        passing_label: 'All 3 Checks Pass',
        default_tasks: [
          'Increment self.modules_done inside finish_module().',
          'Return the formatted f-string inside info().',
        ],
        starter_code: `class AILearner:
    def __init__(self, name):
        self.name = name
        self.modules_done = 0

    def finish_module(self):
        # Add 1 to self.modules_done
        pass

    def info(self):
        # Return e.g. "Rina - 2 modules done"
        return ""
`,
        test_suite: {
          pyTests: [
            {
              id: '1.9-s1',
              name: 'Tracks Rina and Budi independently',
              visibility: 'sample',
              testCode: `
rina = AILearner("Rina")
budi = AILearner("Budi")
rina.finish_module()
rina.finish_module()
budi.finish_module()
assert rina.info() == "Rina - 2 modules done", f"Got {rina.info()!r}"
assert budi.info() == "Budi - 1 modules done", f"Got {budi.info()!r}"
`,
            },
            {
              id: '1.9-s2',
              name: 'Starts fresh at 0 modules done',
              visibility: 'sample',
              testCode: `
ada = AILearner("Ada")
assert ada.info() == "Ada - 0 modules done"
`,
            },
            {
              id: '1.9-h1',
              name: 'Increments modules_done correctly over multiple calls',
              visibility: 'hidden',
              testCode: `
x = AILearner("Kai")
for _ in range(5):
    x.finish_module()
assert x.modules_done == 5
`,
            },
          ],
        },
      },
      summary: {
        key_takeaways: [
          'One `class` blueprint can create any number of independent objects.',
          'Always attach per-object attributes to `self` inside `__init__`.',
        ],
        reflection_prompt: 'How does `self` keep Rina’s progress separate from Budi’s?',
      },
    },
    {
      id: '1.11',
      trackId: 'track-01',
      order: 11,
      code: '1.11',
      title: 'Python Final Exam: Shopping Cart Class',
      subtitle: 'Capstone Assessment combining lists, loops, conditionals, functions, and OOP.',
      categoryLabel: 'Python',
      difficulty: 'Hard',
      estMinutes: 30,
      theory: {
        intro:
          'This Final Exam puts everything from Track 01 together into the `ShoppingCart` (`KalkulatorBelanja`) mini-project from Module 01 PDF!',
        why_it_matters:
          'Building a clean class with a list, loop, and discount condition proves you are ready for NumPy, Pandas, and Machine Learning.',
        history_brief:
          'Combining simple building blocks into clean classes is how all real Python software grows.',
        visual_diagram_id: 'py-capstone-arch',
        key_rule: 'Use a `for` loop to sum `self.prices`, then apply a 10% discount ONLY if `subtotal > 100000`.',
        syntax_breakdown: [
          { token: 'add_item', syntax: 'self.prices.append(price)', description: 'Stores item prices inside the cart list.' },
          { token: 'calculate_total', syntax: 'if subtotal > 100000: subtotal = subtotal * 0.9', description: 'Sums items and applies 10% off above 100k.' },
        ],
      },
      syntaxCheck: {
        prompt: 'Check the inline 10% discount rule when `subtotal > 100000`.',
        codeTemplate: `discount = subtotal * 0.1 ___0___ subtotal > 100000 ___1___ 0`,
        blanks: [
          { id: 'b0', answer: 'if', placeholder: 'cond' },
          { id: 'b1', answer: 'else', placeholder: 'alt' },
        ],
        wordBank: ['else', 'if', 'elif', 'when', 'then'],
        hint: 'Inline Python conditions follow `value_if_true if condition else value_if_false`.',
        explanation: 'This applies the 10% discount strictly when subtotal is over 100,000.',
      },
      challenge: {
        id: 'chal-1-10',
        difficulty_kyu: '4 Kyu',
        xp_reward: 350,
        is_final_exam: true,
        title: 'Python Final Exam: ShoppingCart Calculator',
        instructions:
          'Complete `ShoppingCart` with `add_item(price)` and `calculate_total()`—using a `for` loop to sum prices and giving 10% off when total exceeds 100,000.',
        requirements: [
          '`add_item(self, price)` appends `price` into `self.prices`.',
          '`calculate_total(self)` uses a `for` loop to sum all items in `self.prices`.',
          'If `subtotal > 100000`, apply a 10% discount (`subtotal * 0.9`) and return the final total.',
        ],
        starter_file_url: '/starters/track01_10_capstone.py',
        colab_notebook_url: 'https://colab.research.google.com/',
        validation_mode: 'py_unit_test',
        passing_threshold: 100,
        passing_label: 'All 4 Capstone Checks Pass',
        default_tasks: [
          'Append prices into self.prices in add_item().',
          'Sum self.prices using a for loop in calculate_total().',
          'Apply 10% discount if subtotal > 100000.',
        ],
        starter_code: `class ShoppingCart:
    def __init__(self):
        self.prices = []

    def add_item(self, price):
        # Add price into self.prices
        pass

    def calculate_total(self):
        # Sum self.prices with a for loop
        # If subtotal > 100000, apply a 10% discount!
        subtotal = 0
        return subtotal
`,
        test_suite: {
          pyTests: [
            {
              id: '1.10-s1',
              name: 'Applies 10% discount when subtotal > 100,000',
              visibility: 'sample',
              testCode: `
cart = ShoppingCart()
cart.add_item(60000)
cart.add_item(60000)
assert cart.calculate_total() == 108000, f"Expected 108000, got {cart.calculate_total()}"
`,
            },
            {
              id: '1.10-s2',
              name: 'No discount at or below 100,000',
              visibility: 'sample',
              testCode: `
cart = ShoppingCart()
cart.add_item(50000)
cart.add_item(50000)
assert cart.calculate_total() == 100000, f"Expected 100000, got {cart.calculate_total()}"
`,
            },
            {
              id: '1.10-h1',
              name: 'Empty cart returns 0',
              visibility: 'hidden',
              testCode: `
empty = ShoppingCart()
assert empty.calculate_total() == 0
`,
            },
            {
              id: '1.10-h2',
              name: 'Two carts stay completely separate',
              visibility: 'hidden',
              testCode: `
c1 = ShoppingCart()
c2 = ShoppingCart()
c1.add_item(150000)
c2.add_item(30000)
assert c1.calculate_total() == 135000
assert c2.calculate_total() == 30000
`,
            },
          ],
        },
      },
      summary: {
        key_takeaways: [
          'You combined lists, loops, conditionals, functions, and classes into one working Python program.',
          'You are ready to move on to Track 02: NumPy & Pandas!',
        ],
        reflection_prompt: 'Download your Track 01 Completion Summary and celebrate finishing Python Fundamentals!',
      },
    },
  ],
};
