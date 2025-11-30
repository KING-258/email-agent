import React, { useEffect, useRef, useState } from 'react'
import { initLLM, promptOnce } from '../services/llm.js'

export default function AgentChat({ email, prompts, onSaveDraft }){
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const logRef = useRef(null)

  useEffect(()=>{ if(logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight }, [messages])

  const ask = async (userText) => {
    if(!email) return
    setBusy(true)
    setMessages(m=>[...m, {role:'user', content:userText}])
    try {
      await initLLM()
      const system = `You are the Email Productivity Agent. Use the user's stored prompts as policies.\n\nCategorization Prompt:\n${prompts.categorization_prompt}\n\nAction Item Prompt:\n${prompts.action_prompt}\n\nAuto-Reply Prompt:\n${prompts.autoreply_prompt}\n\nRespond concisely. When the user asks for JSON, return strict JSON only.`
      const content = `Selected email (subject: ${email.subject}, from: ${email.from}, time: ${email.timestamp}). Body:\n---\n${email.body}\n---\nUser request: ${userText}`
      const reply = await promptOnce({ system, user: content, temperature: 0.2, max_tokens: 600 })
      setMessages(m=>[...m, {role:'assistant', content: reply}])
    } catch (e){
      setMessages(m=>[...m, {role:'assistant', content: `Error: ${e.message}` }])
    } finally { setBusy(false) }
  }

  const draftReply = async () => {
    if(!email) return
    setBusy(true)
    try{
      await initLLM()
      const system = `You draft email replies using the user's auto-reply prompt. Never send emails automatically. Return strict JSON with keys: subject, body, follow_ups (array of strings), metadata (object).`;
      const user = `Auto-reply Prompt:\n${prompts.autoreply_prompt}\n\nThread context (latest message below):\nSubject: ${email.subject}\nFrom: ${email.from}\nBody:\n${email.body}\n\nReturn JSON only.`
      const result = await promptOnce({ system, user, temperature: 0.3, max_tokens: 700 })
      let parsed = null
      try{ parsed = JSON.parse(result) } catch{ parsed = { subject:'Draft', body: result, follow_ups:[], metadata:{} } }
      onSaveDraft?.(parsed)
      setMessages(m=>[...m, {role:'assistant', content: `Draft created and saved.\n\n${JSON.stringify(parsed, null, 2)}` }])
    }catch(e){
      setMessages(m=>[...m, {role:'assistant', content: `Error: ${e.message}` }])
    } finally { setBusy(false) }
  }

  return (
    <div className="chat">
      <div className="chat-log" ref={logRef}>
        {!email && <div className="status">Select an email to begin.</div>}
        {messages.map((m,i)=> (
          <div key={i} className={`msg ${m.role==='user'?'user':'bot'}`}>
            <div className="small">{m.role}</div>
            <div style={{whiteSpace:'pre-wrap'}}>{m.content}</div>
          </div>
        ))}
      </div>
      <div className="footer">
        <input className="input" disabled={!email || busy} placeholder={email?'Ask, e.g. "Summarize" or "What tasks do I need?"':'Select an email first'} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'){ ask(input); setInput('') } }} />
        <button className="btn" disabled={!email || busy || !input.trim()} onClick={()=>{ ask(input); setInput('') }}>Send</button>
        <button className="btn" disabled={!email || busy} onClick={draftReply}>Draft Reply</button>
      </div>
    </div>
  )
}
