# Prompt-Driven Email Productivity Agent (React + WebLLM, JSON storage)

This is a no-API-key implementation of the assignment using React (Vite) and client-side WebLLM. Data is stored in JSON/localStorage. Models run in the browser via WebGPU.

## Stack
- React + Vite
- @mlc-ai/web-llm (runs a small instruction model fully in-browser; downloads on first run)
- JSON assets + localStorage for prompts, processed results, and drafts

## Setup
1) Install Node 18+.
2) Install deps:
```bash
npm install
```
3) Start dev server:
```bash
npm run dev
```
4) Open the printed local URL in a modern Chromium browser (Chrome/Edge). WebGPU must be available; first run downloads the model files (a few hundred MB depending on the small model selected in `src/services/llm.js`).

## How to use
- Load Mock Inbox: Left panel → "Load Mock".
- Process Inbox: Left panel → "Process Inbox" (runs categorization + action extraction using your prompts).
- Configure Prompts: Right panel header → "Prompts" → edit and Save (or Reset to defaults).
- Chat with the Email Agent: Right panel input; examples:
  - "Summarize this email"
  - "What tasks do I need to do?"
  - "Show me urgent items"
- Draft Replies: Right panel → "Draft Reply". Drafts are saved locally (never sent).

## Mock Inbox
`public/mock_inbox.json` contains 12 realistic emails (meeting requests, newsletters, spam-like, tasks, updates). You can replace or edit it.

## Prompts
Default templates: `public/default_prompts.json`. Runtime edits are saved in `localStorage`.

## Notes
- No API keys required. The model runs fully client-side with WebLLM. The first load may take a while as weights are fetched and compiled.
- If your browser lacks WebGPU, use a recent Chrome/Edge and ensure hardware acceleration is enabled.

## Project Structure
- `src/components` – Inbox list, Prompt Brain, Agent Chat
- `src/services` – LLM wrapper, ingestion pipeline, storage helpers
- `public/mock_inbox.json` – sample emails
- `public/default_prompts.json` – default prompts

## Demo Video Outline (5–10 min)
1. Load inbox
2. Edit prompts (e.g., tweak categories)
3. Run processing → show categories and extracted actions
4. Use chat: summarize, list tasks, show urgent
5. Draft a reply → show saved JSON draft

## Safety
- All drafts are stored locally and never sent.
- Errors from the LLM are surfaced in the UI; processing continues for the next email when possible.
