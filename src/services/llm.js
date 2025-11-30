let engine = null

export async function initLLM(onStatus){
  if(engine) return engine
  const { CreateMLCEngine, prebuiltAppConfig } = await import('@mlc-ai/web-llm')
  // Use a small prebuilt model that runs fully in-browser. The ID must match
  // one in prebuiltAppConfig.model_list.
  const modelId = 'Qwen2-0.5B-Instruct-q4f16_1-MLC'
  engine = await CreateMLCEngine(modelId, {
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
