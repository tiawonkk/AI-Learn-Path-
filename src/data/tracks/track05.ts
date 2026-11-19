import type { TrackSpec } from '@/types/curriculum';

export const TRACK_05: TrackSpec = {
  id: 'track-05',
  number: 5,
  shortLabel: '05',
  name: 'Agentic AI',
  categoryLabel: 'Agentic AI',
  subtitle:
    'From Passive LLM to Autonomous Agents: Structured JSON, RAG & Memory, Tool Calling, ReAct Reasoning & Multi-Agent HITL Systems',
  badgeHex: '#DDA9FF',
  prerequisiteTrackId: 'track-04',
  pdfSourceLabel: 'Module 05 — Agentic AI, RAG, Tool Use & Multi-Agent Orchestration',
  libraries: ['json', 'numpy', 'pydantic', 'langgraph'],
  module_wrapup: {
    certificate_title: 'Agentic AI & Multi-Agent Systems',
    certificate_subtitle:
      'Mastered deterministic JSON contracts, RAG vector retrieval, safe tool calling, ReAct orchestration, and Multi-Agent Human-in-the-Loop workflows.',
    key_takeaways: [
      'Passive LLMs only return one-shot text; Agentic AI adds a goal-driven loop with structured JSON outputs, memory, and tools.',
      'RAG grounds LLM answers in private documents using overlapping chunks, embeddings, and cosine similarity Top-K retrieval.',
      'Safe Function Calling validates tool names and argument schemas before executing external APIs or database queries.',
      'ReAct (Thought -> Action -> Observation) with explicit max_steps guardrails prevents infinite loops and hallucinated actions.',
      'Production Multi-Agent systems split specialized roles (Researcher, Writer, Reviewer) and gate high-risk actions with Human-in-the-Loop approval.',
    ],
    quick_reference_headers: ['Agent Layer', 'Core Pattern & Safety Control'],
    quick_reference_rows: [
      ['1. Structured Output', 'System prompt + strict JSON schema validation before downstream parsing.'],
      ['2. RAG & Memory', 'Sliding-window chunking + cosine similarity Top-K retrieval + short/long-term state.'],
      ['3. Tool Calling', 'Explicit tool registry + argument type validation + safe fallback errors.'],
      ['4. ReAct & Routing', 'Thought -> Action -> Observation loop bounded by max_steps & error recovery.'],
      ['5. Multi-Agent & HITL', 'Supervisor/Handoff graph + human approval checkpoint for high-risk actions.'],
    ],
  },
  subModules: [
    {
      id: '5.1',
      trackId: 'track-05',
      order: 1,
      code: '5.1',
      title: 'From Passive LLM to Agentic AI',
      subtitle: 'Stateless prompt-response vs goal-driven cognitive loops, system prompts, and structured JSON.',
      categoryLabel: 'Agentic AI',
      difficulty: 'Easy',
      estMinutes: 18,
      theory: {
        intro:
          'A passive chatbot only answers one prompt at a time with free-form prose. **Agentic AI** wraps an LLM inside a goal-driven loop that plans, outputs **structured JSON**, calls tools, and verifies its own progress.',
        why_it_matters:
          'Downstream software cannot reliably parse chatty paragraphs—enforcing deterministic JSON contracts is the first step toward production AI agents.',
        history_brief:
          'Structured JSON mode and Pydantic schemas turned creative language models into dependable software components.',
        visual_diagram_id: 'ai-structured-json',
        key_rule: 'Always extract and validate required JSON keys and types before trusting any LLM response in code.',
        syntax_breakdown: [
          { token: 'json.loads()', syntax: 'data = json.loads(raw_json_str)', description: 'Parses JSON text into a Python dictionary.' },
          { token: 'Schema Check', syntax: 'required.issubset(data.keys())', description: 'Verifies every mandatory contract field is present.' },
        ],
      },
      syntaxCheck: {
        prompt: 'Parse a JSON string into a Python dict and verify `"action"` exists.',
        codeTemplate: `payload = json.___0___(raw_text)\nhas_action = "action" ___1___ payload`,
        blanks: [
          { id: 'b0', answer: 'loads', placeholder: 'parse' },
          { id: 'b1', answer: 'in', placeholder: 'check' },
        ],
        wordBank: ['loads', 'in', 'dumps', 'parse', 'has'],
        hint: 'Use `json.loads(...)` to parse a string, and `"action" in payload` to check keys.',
        explanation: '`json.loads` decodes text strings (`s` = string), while `in` checks dictionary keys cleanly.',
      },
      challenge: {
        id: 'chal-5-1',
        difficulty_kyu: '5 Kyu',
        xp_reward: 190,
        title: 'Agent JSON Contract Validator',
        instructions:
          'Implement `parse_agent_payload(raw_text)` that strips markdown ```json fences if present, parses JSON, verifies `"intent"` (str) and `"confidence"` (float/int between 0 and 1), and returns `{"valid": True, "data": ...}` or `{"valid": False, "error": ...}`.',
        requirements: [
          'Strip optional ```json ... ``` fences before calling `json.loads`.',
          'Validate `"intent"` is a non-empty string and `"confidence"` is a number in `[0, 1]`.',
          'Return `{"valid": True, "data": parsed}` on success, or `{"valid": False, "error": "..."}` on any parse/schema error.',
        ],
        starter_file_url: '/starters/track05_01_structured_json.py',
        colab_notebook_url: 'https://colab.research.google.com/',
        validation_mode: 'py_unit_test',
        passing_threshold: 100,
        passing_label: 'All 3 Contract Tests Pass',
        default_tasks: [
          'Strip optional markdown code fences cleanly.',
          'Parse JSON safely with try/except and validate intent & confidence.',
        ],
        starter_code: `import json

def parse_agent_payload(raw_text):
    # Strip optional \`\`\`json fences, parse JSON, validate intent & confidence
    pass
`,
        test_suite: {
          pyTests: [
            {
              id: '5.1-s1',
              name: 'Parses fenced JSON payload and validates schema',
              visibility: 'sample',
              testCode: `
raw = '\`\`\`json\\n{"intent": "search_docs", "confidence": 0.92}\\n\`\`\`'
out = parse_agent_payload(raw)
assert out["valid"] is True and out["data"]["intent"] == "search_docs"
`,
            },
            {
              id: '5.1-s2',
              name: 'Rejects out-of-range confidence or malformed JSON safely',
              visibility: 'sample',
              testCode: `
bad1 = parse_agent_payload('{"intent": "buy", "confidence": 1.8}')
bad2 = parse_agent_payload('not json at all')
assert bad1["valid"] is False and bad2["valid"] is False
`,
            },
            {
              id: '5.1-h1',
              name: 'Rejects empty intent string',
              visibility: 'hidden',
              testCode: `
out = parse_agent_payload('{"intent": "", "confidence": 0.5}')
assert out["valid"] is False
`,
            },
          ],
        },
      },
      summary: {
        key_takeaways: [
          'Structured JSON bridges probabilistic LLM text to deterministic software systems.',
          'Defensive fence stripping + schema validation prevents runtime crashes.',
        ],
        reflection_prompt: 'Why is a structured JSON output safer than asking an LLM to reply in free-form English?',
      },
    },
    {
      id: '5.2',
      trackId: 'track-05',
      order: 2,
      code: '5.2',
      title: 'Grounding & Memory: RAG, Embeddings & Vector Search',
      subtitle: 'Chunking with overlap, semantic embeddings, cosine similarity retrieval, and short/long-term memory.',
      categoryLabel: 'Agentic AI',
      difficulty: 'Medium',
      estMinutes: 24,
      theory: {
        intro:
          'LLMs freeze their knowledge at training time and hallucinate when asked about private company docs. **Retrieval-Augmented Generation (RAG)** chunks documents with overlap, embeds them into vectors, retrieves the **Top-K** most similar chunks via **Cosine Similarity**, and injects them into the prompt as grounded context.',
        why_it_matters:
          'RAG + vector memory gives agents up-to-date, auditable knowledge without expensive model retraining.',
        history_brief:
          'Lewis et al. (2020) formalized RAG, making it the #1 enterprise LLM architecture worldwide.',
        visual_diagram_id: 'ai-rag-pipeline',
        key_rule: 'Cosine similarity `dot(a, b) / (norm(a) * norm(b))` measures semantic direction regardless of vector length.',
        syntax_breakdown: [
          { token: 'Overlap Chunk', syntax: 'step = chunk_size - overlap', description: 'Prevents sentences from being sliced in half.' },
          { token: 'Cosine Sim', syntax: 'np.dot(q, d) / (np.linalg.norm(q) * np.linalg.norm(d))', description: 'Scores semantic closeness from -1 to +1.' },
        ],
      },
      syntaxCheck: {
        prompt: 'Compute cosine similarity between query vector `q` and document vector `d`.',
        codeTemplate: `sim = np.___0___(q, d) / (np.linalg.___1___(q) * np.linalg.norm(d))`,
        blanks: [
          { id: 'b0', answer: 'dot', placeholder: 'inner' },
          { id: 'b1', answer: 'norm', placeholder: 'len' },
        ],
        wordBank: ['dot', 'norm', 'sum', 'mean', 'abs'],
        hint: 'Divide `np.dot(q, d)` by the product of `np.linalg.norm` values.',
        explanation: 'Cosine similarity equals `1.0` for identical directions and `0.0` for orthogonal vectors.',
      },
      challenge: {
        id: 'chal-5-2',
        difficulty_kyu: '4 Kyu',
        xp_reward: 230,
        title: 'Overlapping Chunker & Cosine Top-K Retriever',
        instructions:
          'Implement `chunk_text(text, chunk_size=20, overlap=5)` and `retrieve_top_k(query_vec, doc_vecs, k=2)` returning the top `k` document indices sorted by highest cosine similarity.',
        requirements: [
          '`chunk_text` steps forward by `chunk_size - overlap` and stops once the end of `text` is covered.',
          '`retrieve_top_k` computes cosine similarity between `query_vec` and every vector in `doc_vecs`, returning the top `k` indices (highest similarity first).',
        ],
        starter_file_url: '/starters/track05_02_rag_engine.py',
        colab_notebook_url: 'https://colab.research.google.com/',
        validation_mode: 'py_unit_test',
        passing_threshold: 100,
        passing_label: 'All 3 RAG Retrieval Tests Pass',
        default_tasks: [
          'Implement sliding-window chunk_text with overlap.',
          'Compute cosine similarities and return Top-K indices descending.',
        ],
        starter_code: `import numpy as np

def chunk_text(text, chunk_size=20, overlap=5):
    # Return list of overlapping string chunks
    pass

def retrieve_top_k(query_vec, doc_vecs, k=2):
    # Return list of top-k doc indices sorted by descending cosine similarity
    pass
`,
        test_suite: {
          requiredPackages: ['numpy'],
          pyTests: [
            {
              id: '5.2-s1',
              name: 'Chunks text with exact overlap preserved',
              visibility: 'sample',
              testCode: `
chunks = chunk_text("ABCDEFGHIJKLMNOPQRST", chunk_size=10, overlap=4)
assert chunks[0] == "ABCDEFGHIJ"
assert chunks[1].startswith("GHIJ")
`,
            },
            {
              id: '5.2-s2',
              name: 'Retrieves Top-2 semantically closest document indices',
              visibility: 'sample',
              testCode: `
q = np.array([1.0, 0.0, 0.0])
docs = [np.array([0.0, 1.0, 0.0]), np.array([0.9, 0.1, 0.0]), np.array([0.5, 0.5, 0.0])]
top = retrieve_top_k(q, docs, k=2)
assert list(top) == [1, 2], f"Expected [1, 2], got {top}"
`,
            },
            {
              id: '5.2-h1',
              name: 'Handles short text shorter than chunk_size gracefully',
              visibility: 'hidden',
              testCode: `
assert chunk_text("Hello AI", chunk_size=50, overlap=10) == ["Hello AI"]
`,
            },
          ],
        },
      },
      summary: {
        key_takeaways: [
          'Overlapping chunks protect semantic continuity across document boundaries.',
          'Cosine similarity Top-K retrieval anchors LLM responses in real source text.',
        ],
        reflection_prompt: 'Why does adding overlap between chunks improve RAG answer accuracy?',
      },
    },
    {
      id: '5.3',
      trackId: 'track-05',
      order: 3,
      code: '5.3',
      title: 'Tool Use & Function Calling',
      subtitle: 'Defining tool schemas, validating arguments, and safely dispatching external APIs & calculators.',
      categoryLabel: 'Agentic AI',
      difficulty: 'Medium',
      estMinutes: 22,
      theory: {
        intro:
          'LLMs are notoriously weak at exact arithmetic, live weather, or SQL queries. **Tool Use (Function Calling)** gives the model a typed menu of Python functions; the model emits `{"tool": "calc", "args": {...}}`, and your **Tool Router** validates the schema before executing safely.',
        why_it_matters:
          'Never execute arbitrary untrusted model output with `eval()`—a strict allow-listed tool registry with argument validation is the backbone of secure AI agents.',
        history_brief:
          'OpenAI, Anthropic, and Google standardized JSON-Schema function calling (and later MCP) so models interact safely with real software.',
        visual_diagram_id: 'ai-tool-calling',
        key_rule: 'Allow-list tools in a dictionary registry, validate required arguments, and return structured error messages instead of crashing.',
        syntax_breakdown: [
          { token: 'Registry', syntax: 'TOOLS = {"add": add_fn, "lookup": lookup_fn}', description: 'Explicit allow-list of callable tools.' },
          { token: 'Dispatch', syntax: 'TOOLS[name](**args)', description: 'Executes validated tool with keyword arguments.' },
        ],
      },
      syntaxCheck: {
        prompt: 'Check if `tool_name` is in the allow-listed `registry` and unpack `args` with `**`.',
        codeTemplate: `if tool_name ___0___ registry:\n    return registry[tool_name](___1___args)`,
        blanks: [
          { id: 'b0', answer: 'in', placeholder: 'check' },
          { id: 'b1', answer: '**', placeholder: 'unpack' },
        ],
        wordBank: ['in', '**', '*', '==', 'get'],
        hint: 'Check membership with `in` and unpack a dictionary of keyword arguments with `**args`.',
        explanation: 'Checking `tool_name in registry` blocks hallucinated or unauthorized tool calls immediately.',
      },
      challenge: {
        id: 'chal-5-3',
        difficulty_kyu: '4 Kyu',
        xp_reward: 220,
        title: 'Safe Tool Registry & Argument Dispatcher',
        instructions:
          'Implement `dispatch_tool(call, registry, required_args)` where `call = {"tool": name, "args": dict}`. Reject unknown tools or missing required arguments cleanly; otherwise execute and return `{"ok": True, "result": ...}`.',
        requirements: [
          'If `call["tool"]` is not in `registry`, return `{"ok": False, "error": "unknown_tool"}`.',
          'Check that every key in `required_args[tool_name]` exists in `call["args"]`; if not, return `{"ok": False, "error": "missing_args"}`.',
          'Execute `registry[tool_name](**call["args"])` and return `{"ok": True, "result": value}`.',
        ],
        starter_file_url: '/starters/track05_03_tool_calling.py',
        colab_notebook_url: 'https://colab.research.google.com/',
        validation_mode: 'py_unit_test',
        passing_threshold: 100,
        passing_label: 'All 3 Tool Dispatch Tests Pass',
        default_tasks: [
          'Validate tool_name against registry allow-list.',
          'Validate required_args before invoking registry[tool_name](**args).',
        ],
        starter_code: `def dispatch_tool(call, registry, required_args):
    # Validate tool name and required arguments, then execute safely
    pass
`,
        test_suite: {
          pyTests: [
            {
              id: '5.3-s1',
              name: 'Executes valid allow-listed tool call cleanly',
              visibility: 'sample',
              testCode: `
reg = {"multiply": lambda a, b: a * b}
req = {"multiply": ["a", "b"]}
out = dispatch_tool({"tool": "multiply", "args": {"a": 6, "b": 7}}, reg, req)
assert out == {"ok": True, "result": 42}
`,
            },
            {
              id: '5.3-s2',
              name: 'Blocks unknown tools and missing arguments safely',
              visibility: 'sample',
              testCode: `
reg = {"multiply": lambda a, b: a * b}
req = {"multiply": ["a", "b"]}
e1 = dispatch_tool({"tool": "delete_db", "args": {}}, reg, req)
e2 = dispatch_tool({"tool": "multiply", "args": {"a": 5}}, reg, req)
assert e1["ok"] is False and e1["error"] == "unknown_tool"
assert e2["ok"] is False and e2["error"] == "missing_args"
`,
            },
            {
              id: '5.3-h1',
              name: 'Handles tool with zero required arguments',
              visibility: 'hidden',
              testCode: `
reg = {"ping": lambda: "pong"}
req = {"ping": []}
out = dispatch_tool({"tool": "ping", "args": {}}, reg, req)
assert out == {"ok": True, "result": "pong"}
`,
            },
          ],
        },
      },
      summary: {
        key_takeaways: [
          'Allow-listed tool registries + argument validation keep function calling deterministic and safe.',
          'Returning structured error payloads lets the agent self-correct on the next turn.',
        ],
        reflection_prompt: 'Why should an agent receive a structured error message instead of crashing on bad tool args?',
      },
    },
    {
      id: '5.4',
      trackId: 'track-05',
      order: 4,
      code: '5.4',
      title: 'Reasoning & Orchestration Patterns (ReAct)',
      subtitle: 'Thought -> Action -> Observation loops, planning/reflection, routing, and max_steps guardrails.',
      categoryLabel: 'Agentic AI',
      difficulty: 'Medium',
      estMinutes: 24,
      theory: {
        intro:
          'Single-turn tool calls aren’t enough for multi-step problems. The **ReAct** (*Reason + Act*) loop alternates **Thought -> Action -> Observation** until the agent reaches a verified final answer—bounded by a strict `max_steps` guardrail to stop runaway token spend.',
        why_it_matters:
          'Adding explicit reasoning traces, routing logic, and error recovery makes complex agents debuggable and reliable in production.',
        history_brief:
          'Yao et al. (2022) introduced ReAct, showing that interleaving reasoning with tool observations dramatically cuts hallucination.',
        visual_diagram_id: 'ai-react-langgraph',
        key_rule: 'Always enforce `max_steps` and log every `(thought, action, observation)` tuple for observability.',
        syntax_breakdown: [
          { token: 'Guardrail Loop', syntax: 'for step in range(max_steps):', description: 'Guarantees the agent terminates even if stuck.' },
          { token: 'Stop Signal', syntax: 'if action["type"] == "final": return action["answer"]', description: 'Exits immediately once a verified answer is ready.' },
        ],
      },
      syntaxCheck: {
        prompt: 'Bound the ReAct loop with `max_steps` and break when the agent emits `"final"`.',
        codeTemplate: `for step in range(___0___):\n    if decision["type"] == "___1___":\n        break`,
        blanks: [
          { id: 'b0', answer: 'max_steps', placeholder: 'limit' },
          { id: 'b1', answer: 'final', placeholder: 'done' },
        ],
        wordBank: ['max_steps', 'final', 'infinite', 'stop', 'error'],
        hint: 'Loop up to `max_steps` and exit on `"final"`.',
        explanation: 'Bounded loops protect latency and API budgets while keeping multi-step reasoning flexible.',
      },
      challenge: {
        id: 'chal-5-4',
        difficulty_kyu: '3 Kyu',
        xp_reward: 240,
        title: 'Bounded ReAct Loop Controller',
        instructions:
          'Implement `run_react_loop(policy_fn, tool_fn, max_steps=5)` that calls `policy_fn(history)` each step: if `type == "final"`, return `{"status": "completed", "answer": ..., "steps": step_count, "trace": history}`; if `type == "tool"`, execute `tool_fn(action)` and append observation to `history`. If `max_steps` is reached without finishing, return `{"status": "max_steps_reached", "answer": None, "steps": max_steps, "trace": history}`.',
        requirements: [
          'Start with `history = []` and iterate at most `max_steps` times.',
          'When `policy_fn(history)` returns `{"type": "final", "answer": ans}`, record it and return `status="completed"`.',
          'When it returns `{"type": "tool", "name": ..., "arg": ...}`, call `obs = tool_fn(decision)`, append `{"decision": decision, "observation": obs}` to `history`, and continue.',
          'Stop cleanly at `max_steps` with `status="max_steps_reached"`.',
        ],
        starter_file_url: '/starters/track05_04_react_loop.py',
        colab_notebook_url: 'https://colab.research.google.com/',
        validation_mode: 'py_unit_test',
        passing_threshold: 100,
        passing_label: 'All 3 ReAct Guardrail Tests Pass',
        default_tasks: [
          'Iterate up to max_steps calling policy_fn(history).',
          'Dispatch tool_fn on type=="tool" and terminate cleanly on type=="final".',
        ],
        starter_code: `def run_react_loop(policy_fn, tool_fn, max_steps=5):
    history = []
    # Implement Thought -> Action -> Observation loop with max_steps guardrail
    pass
`,
        test_suite: {
          pyTests: [
            {
              id: '5.4-s1',
              name: 'Completes 2-step tool + final answer ReAct sequence',
              visibility: 'sample',
              testCode: `
def policy(hist):
    if len(hist) == 0:
        return {"type": "tool", "name": "price", "arg": "GPU"}
    return {"type": "final", "answer": f"Cost is {hist[-1]['observation']}"}

out = run_react_loop(policy, lambda d: "$1200", max_steps=4)
assert out["status"] == "completed"
assert out["answer"] == "Cost is $1200"
assert out["steps"] == 2
`,
            },
            {
              id: '5.4-s2',
              name: 'Stops safely when max_steps guardrail is reached',
              visibility: 'sample',
              testCode: `
out = run_react_loop(lambda h: {"type": "tool", "name": "loop", "arg": 1}, lambda d: "again", max_steps=3)
assert out["status"] == "max_steps_reached" and out["steps"] == 3 and out["answer"] is None
`,
            },
            {
              id: '5.4-h1',
              name: 'Returns immediately in 1 step when no tool is needed',
              visibility: 'hidden',
              testCode: `
out = run_react_loop(lambda h: {"type": "final", "answer": "42"}, lambda d: "", max_steps=5)
assert out["status"] == "completed" and out["steps"] == 1 and out["answer"] == "42"
`,
            },
          ],
        },
      },
      summary: {
        key_takeaways: [
          'ReAct couples reasoning with grounded tool observations at every step.',
          'Explicit `max_steps` limits and structured traces make agents safe and debuggable.',
        ],
        reflection_prompt: 'What could go wrong if you deploy a ReAct agent using `while True:` with no step limit?',
      },
    },
    {
      id: '5.5',
      trackId: 'track-05',
      order: 5,
      code: '5.5',
      title: 'Multi-Agent Workflows & Human-in-the-Loop',
      subtitle: 'Specialized agents, supervisor/handoff coordination, approval checkpoints, and evaluation tracing.',
      categoryLabel: 'Agentic AI',
      difficulty: 'Medium',
      estMinutes: 24,
      theory: {
        intro:
          'One giant prompt trying to research, code, review, and deploy gets confused quickly. **Multi-Agent Workflows** split responsibilities across focused specialists (e.g. **Researcher -> Writer -> Reviewer**) coordinated by a **Supervisor**, while **Human-in-the-Loop (HITL)** pauses before high-risk actions (payments, deletions, external emails).',
        why_it_matters:
          'Specialization improves quality dramatically, and HITL checkpoints turn autonomous systems into trustworthy enterprise teammates.',
        history_brief:
          'Frameworks like LangGraph, CrewAI, and AutoGen popularized stateful multi-agent graphs with interruptible human approval gates.',
        visual_diagram_id: 'ai-multiagent-hitl',
        key_rule: 'Keep each agent’s role narrow, pass explicit shared state dicts, and require human approval whenever `risk_level == "high"`.',
        syntax_breakdown: [
          { token: 'Handoff State', syntax: 'state["draft"] = writer_agent(state["notes"])', description: 'Passes structured state between specialist nodes.' },
          { token: 'HITL Gate', syntax: 'if action["risk"] == "high" and not approved: return "awaiting_human"', description: 'Pauses high-risk execution until a human approves.' },
        ],
      },
      syntaxCheck: {
        prompt: 'Pause execution whenever a high-risk action has not been approved by a human.',
        codeTemplate: `if risk_level == "___0___" and not human_approved:\n    return "___1___"`,
        blanks: [
          { id: 'b0', answer: 'high', placeholder: 'risk' },
          { id: 'b1', answer: 'pending_approval', placeholder: 'state' },
        ],
        wordBank: ['high', 'pending_approval', 'low', 'executed', 'skip'],
        hint: 'Check `risk_level == "high"` and return `"pending_approval"`.',
        explanation: 'Explicit HITL states ensure irreversible actions never fire silently.',
      },
      challenge: {
        id: 'chal-5-5',
        difficulty_kyu: '3 Kyu',
        xp_reward: 240,
        title: 'Multi-Agent Handoff & HITL Approval Gate',
        instructions:
          'Implement `orchestrate_workflow(topic, risk_level, human_approved=False)` running a 3-stage Researcher -> Writer -> Reviewer handoff, pausing with `status="pending_approval"` if `risk_level == "high"` and `not human_approved`, otherwise returning `status="published"` with the full `trace` list `["researcher", "writer", "reviewer"]`.',
        requirements: [
          'Run `researcher` -> `writer` -> `reviewer` stages recording `trace = ["researcher", "writer", "reviewer"]`.',
          'Before publishing, if `risk_level == "high"` and `not human_approved`, return `{"status": "pending_approval", "trace": trace, "published": False}`.',
          'Otherwise return `{"status": "published", "trace": trace, "published": True, "summary": f"Approved report on {topic}"}`.',
        ],
        starter_file_url: '/starters/track05_05_multiagent_hitl.py',
        colab_notebook_url: 'https://colab.research.google.com/',
        validation_mode: 'py_unit_test',
        passing_threshold: 100,
        passing_label: 'All 3 Multi-Agent & HITL Tests Pass',
        default_tasks: [
          'Record the 3-agent handoff trace: researcher -> writer -> reviewer.',
          'Enforce the HITL approval gate for high-risk actions.',
        ],
        starter_code: `def orchestrate_workflow(topic, risk_level, human_approved=False):
    # Run researcher -> writer -> reviewer handoff with HITL gate for high risk
    pass
`,
        test_suite: {
          pyTests: [
            {
              id: '5.5-s1',
              name: 'Pauses high-risk workflow until human approves',
              visibility: 'sample',
              testCode: `
out = orchestrate_workflow("Q4 Pricing", risk_level="high", human_approved=False)
assert out["status"] == "pending_approval" and out["published"] is False
assert out["trace"] == ["researcher", "writer", "reviewer"]
`,
            },
            {
              id: '5.5-s2',
              name: 'Publishes low-risk workflow automatically after review',
              visibility: 'sample',
              testCode: `
out = orchestrate_workflow("AI Trends", risk_level="low", human_approved=False)
assert out["status"] == "published" and out["published"] is True
assert "AI Trends" in out["summary"]
`,
            },
            {
              id: '5.5-h1',
              name: 'Publishes high-risk workflow once human_approved=True',
              visibility: 'hidden',
              testCode: `
out = orchestrate_workflow("Refund Policy", risk_level="high", human_approved=True)
assert out["status"] == "published" and out["published"] is True
`,
            },
          ],
        },
      },
      summary: {
        key_takeaways: [
          'Multi-agent graphs decompose complex goals into clean, testable specialist nodes.',
          'Human-in-the-Loop gates protect high-stakes actions without slowing down low-risk automation.',
        ],
        reflection_prompt: 'Which real-world agent actions should ALWAYS require Human-in-the-Loop approval?',
      },
    },
    {
      id: '5.6',
      trackId: 'track-05',
      order: 6,
      code: '5.6',
      title: 'Agentic AI Final Exam: Stateful Multi-Agent Graph',
      subtitle: 'Capstone Assessment: architect a tool-using, RAG-grounded Multi-Agent workflow notebook (.ipynb).',
      categoryLabel: 'Agentic AI',
      difficulty: 'Hard',
      estMinutes: 40,
      theory: {
        intro:
          'Congratulations on reaching the final capstone of **AI Mastery Hub**! Build and run an end-to-end **Stateful Multi-Agent Graph** notebook in Google Colab combining a `Researcher`, `Writer`, and `Reviewer` with conditional routing, tool/RAG grounding, and non-empty execution trace outputs.',
        why_it_matters:
          'Passing this capstone proves you can design, execute, and verify complete Agentic AI systems—completing the full 0-to-Professional AI Engineering journey!',
        history_brief:
          'Stateful multi-agent orchestration represents the frontier of production AI engineering.',
        visual_diagram_id: 'ai-capstone-multiagent',
        key_rule: 'Define explicit shared `AgentState`, specialist node functions, a conditional review/approval router, and executed cells showing the final output.',
        syntax_breakdown: [
          { token: 'AgentState', syntax: 'class AgentState(TypedDict): topic: str; draft: str; approved: bool', description: 'Shared typed state passed across all agents.' },
          { token: 'Conditional Edge', syntax: 'graph.add_conditional_edges("reviewer", route_fn)', description: 'Loops back for revision or finishes cleanly.' },
        ],
      },
      syntaxCheck: {
        prompt: 'Route the workflow to `"end"` when approved, otherwise loop back to `"writer"`.',
        codeTemplate: `def route_review(state):\n    return "end" ___0___ state["approved"] ___1___ "writer"`,
        blanks: [
          { id: 'b0', answer: 'if', placeholder: 'cond' },
          { id: 'b1', answer: 'else', placeholder: 'alt' },
        ],
        wordBank: ['if', 'else', 'and', 'while', 'return'],
        hint: 'Python inline ternary: `"end" if state["approved"] else "writer"`.',
        explanation: 'Conditional routing gives multi-agent graphs self-correcting quality loops.',
      },
      challenge: {
        id: 'chal-5-6',
        difficulty_kyu: '1 Kyu',
        xp_reward: 600,
        is_final_exam: true,
        title: 'Agentic AI Final Exam: Stateful Multi-Agent Graph (.ipynb)',
        instructions:
          'Download the starter notebook, run it in Google Colab (implementing Researcher, Writer, Reviewer nodes + conditional router + executed trace), and upload the executed .ipynb file for automated structural & behavioral validation.',
        requirements: [
          'Define a shared state structure and at least 3 specialist roles (`researcher`, `writer`, `reviewer`).',
          'Include a conditional routing or guardrail step (`max_steps` / approval check).',
          'Run all cells in Colab so the notebook contains at least 2 executed code cells with non-empty output.',
        ],
        starter_file_url: '/starters/track05_04_multiagent_exam.ipynb',
        colab_notebook_url: 'https://colab.research.google.com/',
        validation_mode: 'ipynb_ast_check',
        passing_threshold: 100,
        passing_label: 'All 4 Notebook Checks Pass',
        default_tasks: [
          'Download the starter .ipynb and open in Google Colab.',
          'Implement Researcher, Writer, Reviewer nodes and conditional routing.',
          'Run all cells and upload the executed .ipynb file.',
        ],
        starter_code: `# Multi-Agent Graph Capstone (Run in Google Colab)
from typing import TypedDict

class AgentState(TypedDict):
    topic: str
    research_notes: str
    draft: str
    approved: bool
    steps: int

def researcher_node(state: AgentState) -> AgentState:
    state["research_notes"] = f"Verified facts for {state['topic']}"
    return state

def writer_node(state: AgentState) -> AgentState:
    state["draft"] = f"Executive Brief: {state['research_notes']}"
    return state

def reviewer_node(state: AgentState) -> AgentState:
    state["approved"] = len(state["draft"]) > 20
    state["steps"] += 1
    return state

state: AgentState = {"topic": "Agentic AI", "research_notes": "", "draft": "", "approved": False, "steps": 0}
state = researcher_node(state)
state = writer_node(state)
state = reviewer_node(state)
print("FINAL STATE:", state)
`,
        test_suite: {
          ipynbRules: [
            {
              id: '5.6-s1',
              name: 'Defines multi-agent roles (researcher, writer, reviewer)',
              visibility: 'sample',
              kind: 'regex',
              pattern: 'researcher|writer|reviewer',
              description: 'Notebook must define specialist agent functions.',
            },
            {
              id: '5.6-s2',
              name: 'Includes state/routing or guardrail logic',
              visibility: 'sample',
              kind: 'regex',
              pattern: 'AgentState|approved|max_steps|route',
              description: 'Notebook must manage shared agent state or routing.',
            },
            {
              id: '5.6-h1',
              name: 'Contains executed code cells',
              visibility: 'hidden',
              kind: 'executed_cells',
              minCount: 1,
              description: 'At least 1 code cell must be executed with output.',
            },
            {
              id: '5.6-h2',
              name: 'Prints verified workflow execution output',
              visibility: 'hidden',
              kind: 'output_contains',
              pattern: 'FINAL|approved|Brief|Agent',
              description: 'Cell outputs must show the completed workflow result.',
            },
          ],
        },
      },
      summary: {
        key_takeaways: [
          'You completed all 5 tracks (41 modules) of AI Mastery Hub—from Python print() to Multi-Agent AI!',
          'Export your full portfolio & notes in Study Tools to keep a permanent record of your mastery.',
        ],
        reflection_prompt: 'What real-world AI system do you want to build next using everything you learned?',
      },
    },
  ],
};
