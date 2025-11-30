const KEYS = {
  inbox: 'ep_inbox',
  prompts: 'ep_prompts',
  processed: 'ep_processed',
  drafts: 'ep_drafts'
}

const defaultPrompts = {
  categorization_prompt: "Categorize emails into: Important, Newsletter, Spam, To-Do. To-Do emails must include a direct request requiring user action. Return JSON: {\"category\": one of ['Important','Newsletter','Spam','To-Do'], \"tags\": [string], \"reason\": string }",
  action_prompt: "Extract tasks from the email. Respond in JSON array of objects: [{ \"task\": string, \"deadline\": string|null, \"owner\": string|null }]. If none, return [].",
  autoreply_prompt: "If an email is a meeting request, draft a polite reply asking for an agenda. Otherwise draft a concise, helpful reply. Be professional and friendly."
}

function read(key, fallback){
  try{ const v = localStorage.getItem(key); return v? JSON.parse(v) : fallback }catch{ return fallback }
}
function write(key, value){ localStorage.setItem(key, JSON.stringify(value)) }

export function getPrompts(){ return read(KEYS.prompts, defaultPrompts) }
export function savePrompts(p){ write(KEYS.prompts, p) }

export function loadInbox(){ return read(KEYS.inbox, []) }
export function saveInbox(items){ write(KEYS.inbox, items) }

export function getProcessed(){ return read(KEYS.processed, {}) }
export function saveProcessed(obj){ write(KEYS.processed, obj) }

export function getDrafts(){ return read(KEYS.drafts, {}) }
export function saveDraft(emailId, draft){
  const all = getDrafts()
  if(!all[emailId]) all[emailId] = []
  all[emailId].push({ ...draft, saved_at: new Date().toISOString() })
  write(KEYS.drafts, all)
}
