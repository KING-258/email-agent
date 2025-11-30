import React, { useEffect, useMemo, useState } from 'react'
import InboxList from './components/InboxList.jsx'
import AgentChat from './components/AgentChat.jsx'
import PromptBrain from './components/PromptBrain.jsx'
import { loadInbox, saveInbox, getPrompts, savePrompts, getProcessed, saveProcessed, getDrafts, saveDraft } from './services/storage.js'
import { processInbox } from './services/pipeline.js'
import { initLLM } from './services/llm.js'

export default function App(){
  const [emails, setEmails] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [prompts, setPrompts] = useState(getPrompts())
  const [processing, setProcessing] = useState(false)
  const [status, setStatus] = useState('')
  const processed = getProcessed()

  useEffect(() => {
    // Load inbox from localStorage or public JSON
    (async () => {
      const local = loadInbox()
      if(local && local.length){
        setEmails(local)
        setSelectedId(local[0]?.id)
      } else {
        const res = await fetch('/mock_inbox.json')
        const data = await res.json()
        setEmails(data)
        saveInbox(data)
        setSelectedId(data[0]?.id)
      }
    })()
  }, [])

  useEffect(() => { savePrompts(prompts) }, [prompts])

  const selectedEmail = useMemo(() => emails.find(e => e.id === selectedId) || null, [emails, selectedId])

  const onProcess = async () => {
    setProcessing(true)
    setStatus('Initializing on-device AI (first run downloads a small model)...')
    try{
      await initLLM((p)=>setStatus(p))
      setStatus('Running categorization and action extraction...')
      const results = await processInbox(emails, prompts, (msg)=>setStatus(msg))
      saveProcessed(results)
      setStatus('Done.')
    }catch(err){
      console.error(err)
      setStatus('Error during processing: '+err.message)
    }finally{
      setProcessing(false)
    }
  }

  const onResetPrompts = async () => {
    const res = await fetch('/default_prompts.json')
    const data = await res.json()
    setPrompts(data)
  }

  return (
    <div className="app">
      <div className="left">
        <div className="header">
          <div>
            <strong>Inbox</strong>
          </div>
          <div className="row">
            <button className="btn" onClick={async ()=>{
              const res = await fetch('/mock_inbox.json');
              const data = await res.json();
              setEmails(data); saveInbox(data); setSelectedId(data[0]?.id)
            }}>Load Mock</button>
            <button className="btn primary" onClick={onProcess} disabled={processing}>Process Inbox</button>
          </div>
        </div>
        <InboxList emails={emails} processed={processed} selectedId={selectedId} onSelect={setSelectedId} />
      </div>

      <div className="center">
        <div className="header">
          <strong>Details</strong>
          <div className="small">{processing ? 'Working...' : ''} {status && <span className="mono">{status}</span>}</div>
        </div>
        <div className="section">
          {selectedEmail ? (
            <div>
              <div className="kv"><div>From</div><div className="mono">{selectedEmail.from}</div></div>
              <div className="kv"><div>Subject</div><div>{selectedEmail.subject}</div></div>
              <div className="kv"><div>Timestamp</div><div className="mono">{selectedEmail.timestamp}</div></div>
              <div className="prompt-card"><div className="small">Body</div><div style={{whiteSpace:'pre-wrap'}}>{selectedEmail.body}</div></div>
              <div className="prompt-card">
                <div className="small">Processed</div>
                <pre className="mono" style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(processed[selectedEmail.id]||{}, null, 2)}</pre>
              </div>
            </div>
          ):(<div className="status">Select an email</div>)}
        </div>
      </div>

      <div className="right">
        <div className="header">
          <strong>Email Agent</strong>
          <PromptBrain prompts={prompts} setPrompts={setPrompts} onReset={onResetPrompts} />
        </div>
        <AgentChat email={selectedEmail} prompts={prompts} onSaveDraft={(draft)=> saveDraft(selectedEmail?.id, draft)} />
      </div>
    </div>
  )
}
