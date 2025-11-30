const KEYS = {
  inbox: 'ep_inbox',
  prompts: 'ep_prompts',
  processed: 'ep_processed',
  drafts: 'ep_drafts'
}

const defaultPrompts = {
  categorization_prompt: "Categorize the email into exactly one of: Important, To-Do, Newsletter, Promotional, Social, Opportunity, Junk, Spam, Other. Return strict JSON: {\"category\": string, \"tags\": [string], \"action_tags\": [\"reply\"|\"schedule_meeting\"|\"read_later\"|\"archive\"|\"follow_up\"|\"delegate\"|\"investigate\"|\"approve\"|\"pay\"], \"reason\": string }. Choose action_tags that describe what the user should do (e.g. reply, schedule_meeting).",
  action_prompt: "Extract actionable tasks from the email for the user. Return a JSON array of objects: [{ \"task\": string, \"deadline\": string|null, \"owner\": string|null, \"action_tag\": one of ['reply','schedule_meeting','read_later','archive','follow_up','delegate','investigate','approve','pay'] }]. If none, return []. Be conservative and avoid hallucinations.",
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
