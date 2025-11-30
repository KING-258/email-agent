import { promptOnce } from './llm.js'
import { getProcessed } from './storage.js'

const safeParseJSON = (text) => {
  try{ return JSON.parse(text) }catch(e){
    // Try to salvage JSON block
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if(start>=0 && end>start){
      try{ return JSON.parse(text.substring(start, end+1)) }catch{}
    }
    try{
      // maybe array
      const aStart = text.indexOf('['); const aEnd = text.lastIndexOf(']')
      if(aStart>=0 && aEnd>aStart){ return JSON.parse(text.substring(aStart, aEnd+1)) }
    }catch{}
    return null
  }
}

export async function processInbox(emails, prompts, onStatus){
  const existing = getProcessed()
  const out = { ...existing }
  for(let i=0;i<emails.length;i++){
    const e = emails[i]
    onStatus?.(`Processing ${i+1}/${emails.length}: ${e.subject}`)

    // Categorization
    const catUser = `${prompts.categorization_prompt}\n\nReturn JSON only. Email:\nFrom: ${e.from}\nSubject: ${e.subject}\nBody:\n${e.body}`
    const catRaw = await promptOnce({ system: 'Email categorization.', user: catUser, temperature: 0 })
    let cat = safeParseJSON(catRaw) || { category: 'Uncertain', tags: [], reason: 'Parse error' }

    // Action extraction
    const actUser = `${prompts.action_prompt}\n\nEmail:\nFrom: ${e.from}\nSubject: ${e.subject}\nBody:\n${e.body}`
    const actRaw = await promptOnce({ system: 'Extract action items from email content.', user: actUser, temperature: 0 })
    let actions = safeParseJSON(actRaw)
    if(!Array.isArray(actions)) actions = []

    out[e.id] = { ...out[e.id], category: cat.category, tags: cat.tags || [], reason: cat.reason || '', actions }
  }
  onStatus?.('All emails processed')
  return out
}
