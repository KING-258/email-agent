let engine = null

export async function initLLM(onStatus){
  if(engine) return engine
  const { CreateMLCEngine, prebuiltAppConfig } = await import('@mlc-ai/web-llm')
  const model = 'qwen2-0.5b-instruct-q4f16_1-MLC' // small, downloads in browser; no API key
  engine = await CreateMLCEngine({ model }, {
    appConfig: prebuiltAppConfig,
    initProgressCallback: (report)=>{
      if(onStatus){
        const msg = report?.text || report?.progress || ''
        onStatus(msg)
      }
    }
  })
  return engine
}

export async function promptOnce({ system, user, temperature=0.2, max_tokens=512 }){
  const eng = await initLLM()
  const messages = []
  if(system) messages.push({ role: 'system', content: system })
  messages.push({ role: 'user', content: user })
  const res = await eng.chat.completions.create({ messages, temperature, max_tokens })
  return res?.choices?.[0]?.message?.content || ''
}
