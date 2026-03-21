import { useState, useRef, useEffect } from 'react'
import './App.css'
import { AIManager, AISettings } from './services/aiManager'
import { Disclaimer } from './components/Disclaimer'

/* ── Provider tanımları ── */
const PROVIDERS = [
  { id: 'openai',      label: 'OpenAI',       baseUrl: '',                              models: ['gpt-4o','gpt-4o-mini','gpt-4-turbo','gpt-3.5-turbo'] },
  { id: 'anthropic',   label: 'Anthropic',    baseUrl: 'https://openrouter.ai/api/v1', models: ['claude-opus-4-5','claude-sonnet-4-5','claude-3-5-haiku'] },
  { id: 'openrouter',  label: 'OpenRouter',   baseUrl: 'https://openrouter.ai/api/v1', models: ['openai/gpt-4o','anthropic/claude-3.5-sonnet','google/gemini-pro-1.5','meta-llama/llama-3.1-70b-instruct','mistralai/mistral-large'] },
  { id: 'groq',        label: 'Groq',         baseUrl: 'https://api.groq.com/openai/v1',models: ['llama-3.3-70b-versatile','llama-3.1-8b-instant','mixtral-8x7b-32768','gemma2-9b-it'] },
  { id: 'gemini',      label: 'Gemini',       baseUrl: 'https://openrouter.ai/api/v1', models: ['google/gemini-pro-1.5','google/gemini-flash-1.5','google/gemini-2.0-flash'] },
  { id: 'mistral',     label: 'Mistral',      baseUrl: 'https://api.mistral.ai/v1',    models: ['mistral-large-latest','mistral-medium-latest','codestral-latest'] },
  { id: 'perplexity',  label: 'Perplexity',   baseUrl: 'https://api.perplexity.ai',    models: ['llama-3.1-sonar-large-128k-online','llama-3.1-sonar-small-128k-online'] },
  { id: 'together',    label: 'Together',     baseUrl: 'https://api.together.xyz/v1',  models: ['meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo','mistralai/Mixtral-8x7B-Instruct-v0.1'] },
  { id: 'local',       label: 'Local (Ollama)',baseUrl: 'http://localhost:11434/v1',    models: ['llama3','mistral','codellama','phi3'] },
] as const

type ProviderId = typeof PROVIDERS[number]['id']

function loadSettings(): AISettings {
  return {
    provider: (localStorage.getItem('of_provider') || 'openai') as any,
    apiKey:   localStorage.getItem('of_api_key') || '',
    baseUrl:  localStorage.getItem('of_base_url') || '',
    model:    localStorage.getItem('of_model')   || 'gpt-4o',
  }
}

/* ── SVG İkonlar ── */
const PaperclipIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
  </svg>
)
const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)

function App() {
  const [input, setInput]         = useState('')
  const [messages, setMessages]   = useState<{role: string, content: string}[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [savedBadge, setSavedBadge]     = useState(false)
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(
    localStorage.getItem('of_disclaimer_accepted') === 'true'
  )

  const [settings, setSettings] = useState<AISettings>(loadSettings)
  const [aiManager, setAiManager] = useState(() => new AIManager(loadSettings()))

  const inputRef      = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentProvider = PROVIDERS.find(p => p.id === settings.provider) ?? PROVIDERS[0]

  /* focus */
  useEffect(() => { if (disclaimerAccepted) inputRef.current?.focus() }, [disclaimerAccepted])

  /* auto scroll */
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  /* Pencere boyutu — duruma göre dinamik:
     boş + ayar kapalı → ince çubuk (66px)
     ayar açık         → + ~300px
     mesaj var         → max 480px               */
  useEffect(() => {
    const INPUT_H    = 66
    const SETTINGS_H = showSettings ? 310 : 0
    const MSGS_H     = messages.length > 0 ? 400 : 0
    const total = INPUT_H + SETTINGS_H + MSGS_H
    const h = Math.min(total, 560)
    window.ipcRenderer.resizeWindow(660, h)
  }, [messages.length, showSettings])

  /* kapanma animasyonu */
  useEffect(() => {
    const handler = () => {
      setIsClosing(true)
      setTimeout(() => { window.ipcRenderer.invoke('hide-window'); setIsClosing(false) }, 260)
    }
    window.ipcRenderer.on('trigger-hide', handler)
    return () => { window.ipcRenderer.off('trigger-hide', handler) }
  }, [])

  /* Ayarları kaydet */
  const saveSettings = () => {
    localStorage.setItem('of_provider', settings.provider)
    localStorage.setItem('of_api_key',  settings.apiKey)
    localStorage.setItem('of_base_url', settings.baseUrl || '')
    localStorage.setItem('of_model',    settings.model)
    const newMgr = new AIManager(settings)
    setAiManager(newMgr)
    setSavedBadge(true)
    setTimeout(() => setSavedBadge(false), 2000)
  }

  const handleProviderChange = (pid: string) => {
    const prov = PROVIDERS.find(p => p.id === pid)!
    setSettings(s => ({ ...s, provider: pid as any, baseUrl: prov.baseUrl, model: prov.models[0] }))
  }

  const processAIResponse = async (userInput: string) => {
    const updatedMessages = [...messages, { role: 'user', content: userInput }]
    setMessages(updatedMessages)
    setIsLoading(true)
    try {
      const response = await aiManager.generateResponse(updatedMessages)
      if (response.tool_calls) {
        for (const toolCall of response.tool_calls as any[]) {
          const { name, arguments: argsJson } = toolCall.function
          const args = JSON.parse(argsJson)
          let result: any
          setMessages(prev => [...prev, { role: 'assistant', content: `🔧 ${name}` }])
          if (name === 'run_command' || name === 'open_app') {
            const cmd = name === 'open_app' ? `start ${args.app_name}` : args.command
            result = await window.ipcRenderer.executeCommand(cmd)
          } else if (name === 'read_file')  { result = await window.ipcRenderer.readFile(args.path) }
          else if (name === 'write_file') { result = await window.ipcRenderer.writeFile(args.path, args.content) }
          const txt = result?.success
            ? `✅ ${result.content || result.stdout || 'Tamamlandı.'}`
            : `❌ ${result?.error}`
          setMessages(prev => [...prev, { role: 'assistant', content: txt }])
        }
      } else if (response.content) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.content }])
      }
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Hata: ${e.message}` }])
    } finally { setIsLoading(false) }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) { processAIResponse(input); setInput('') }
    if (e.key === 'Escape') setShowSettings(false)
  }

  if (!disclaimerAccepted) return <Disclaimer onAccept={() => setDisclaimerAccepted(true)} />

  return (
    <div className={`container${isClosing ? ' closing' : ''}${messages.length === 0 && !showSettings ? ' empty' : ''}`}>

      {/* ── Mesajlar ── */}
      {messages.length > 0 && (
        <div className="messages-area">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              <div className="message-content">{msg.content}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      {messages.length > 0 && <div className="messages-divider" />}

      {/* ── Ayarlar Paneli ── */}
      {showSettings && (
        <div className="settings-panel">
          <div className="settings-title">AI Bağlantısı</div>

          <div className="settings-row">
            <div className="settings-label">Provider</div>
            <div className="provider-grid">
              {PROVIDERS.map(p => (
                <div key={p.id}
                  className={`provider-chip${settings.provider === p.id ? ' selected' : ''}`}
                  onClick={() => handleProviderChange(p.id)}>
                  {p.label}
                </div>
              ))}
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-label">Model</div>
            <select className="settings-select" value={settings.model}
              onChange={e => setSettings(s => ({...s, model: e.target.value}))}>
              {currentProvider.models.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="settings-row">
            <div className="settings-label">API Key</div>
            <div className="settings-key-row">
              <input className="settings-input" type="password"
                placeholder={`${currentProvider.label} API Key...`}
                value={settings.apiKey}
                onChange={e => setSettings(s => ({...s, apiKey: e.target.value}))} />
              <button className="settings-save-btn" onClick={saveSettings}>Kaydet</button>
            </div>
          </div>

          {settings.provider === 'local' && (
            <div className="settings-row">
              <div className="settings-label">Base URL</div>
              <input className="settings-input" type="text"
                placeholder="http://localhost:11434/v1"
                value={settings.baseUrl || ''}
                onChange={e => setSettings(s => ({...s, baseUrl: e.target.value}))} />
            </div>
          )}

          {savedBadge && <div className="settings-saved-badge">✓ Ayarlar kaydedildi</div>}
        </div>
      )}

      {/* ── Girdi ── */}
      <div className="input-area">
        <button className="icon-btn" tabIndex={-1} title="Dosya ekle"><PaperclipIcon /></button>
        <input ref={inputRef} type="text" value={input} className="main-input"
          onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
          placeholder={settings.apiKey ? 'Ne yapmamı istersin?' : 'Önce ⚙ ayarlardan API key gir…'} />
        {isLoading && <div className="loader" />}
        <button className={`icon-btn${showSettings ? ' active' : ''}`}
          onClick={() => setShowSettings(s => !s)} title="Ayarlar"><SettingsIcon /></button>
      </div>
    </div>
  )
}

export default App
