import React from 'react'

export default function InboxList({ emails, processed, selectedId, onSelect }){
  return (
    <div className="list">
      {emails.map(e => {
        const p = processed[e.id] || {}
        return (
          <div key={e.id} className={`email-item ${selectedId===e.id?'active':''}`} onClick={()=>onSelect(e.id)}>
            <div style={{display:'flex',justifyContent:'space-between',gap:8}}>
              <div style={{minWidth:0}}>
                <div style={{fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{e.subject}</div>
                <div className="small mono">{e.from}</div>
              </div>
              <div className="small mono">{new Date(e.timestamp).toLocaleString()}</div>
            </div>
            <div className="tags" style={{marginTop:6}}>
              {p.category && <span className="tag">{p.category}</span>}
              {Array.isArray(p.tags) && p.tags.slice(0,3).map((t,i)=>(<span key={i} className="tag">{t}</span>))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
