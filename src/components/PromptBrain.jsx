import React, { useState } from 'react'

export default function PromptBrain({ prompts, setPrompts, onReset }){
  const [open, setOpen] = useState(false)
  const [local, setLocal] = useState(prompts)

  const apply = ()=>{ setPrompts(local); setOpen(false) }

  return (
    <>
      <button className="btn" onClick={()=>{ setLocal(prompts); setOpen(o=>!o) }}>Prompts</button>
      {open && (
        <div className="section" style={{borderTop:'1px solid var(--border)'}}>
          <div className="prompt-card">
            <div className="small">Categorization Prompt</div>
            <textarea rows={5} value={local.categorization_prompt} onChange={e=>setLocal({...local, categorization_prompt:e.target.value})} />
          </div>
          <div className="prompt-card">
            <div className="small">Action Item Prompt</div>
            <textarea rows={5} value={local.action_prompt} onChange={e=>setLocal({...local, action_prompt:e.target.value})} />
          </div>
          <div className="prompt-card">
            <div className="small">Auto-Reply Draft Prompt</div>
            <textarea rows={5} value={local.autoreply_prompt} onChange={e=>setLocal({...local, autoreply_prompt:e.target.value})} />
          </div>
          <div className="row">
            <button className="btn" onClick={onReset}>Reset to defaults</button>
            <button className="btn primary" onClick={apply}>Save</button>
          </div>
        </div>
      )}
    </>
  )
}
