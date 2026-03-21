import { useState, useRef, useEffect } from 'react'
import './App.css'
import { AIManager, AISettings } from './services/aiManager'
import { Disclaimer } from './components/Disclaimer'

const defaultConfig: AISettings = {
  provider: 'openai',
  apiKey: localStorage.getItem('of_api_key') || '',
  model: 'gpt-4o'
};

// Ataç / Paperclip ikonu
const PaperclipIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
  </svg>
)

function App() {
  const [input, setInput]       = useState('')
  const [messages, setMessages] = useState<{role: string, content: string}[]>([])
  const [isLoading, setIsLoading]     = useState(false)
  const [isClosing, setIsClosing]     = useState(false)
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(
    localStorage.getItem('of_disclaimer_accepted') === 'true'
  )
  const [aiManager] = useState(() => new AIManager(defaultConfig))
  const inputRef     = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Focus on open
  useEffect(() => {
    if (disclaimerAccepted) inputRef.current?.focus()
  }, [disclaimerAccepted])

  // Otomatik scroll — her yeni mesajda en alta in
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Pencere boyutunu ayarla
  useEffect(() => {
    const h = messages.length > 0 ? 520 : 72
    window.ipcRenderer.resizeWindow(660, h)
  }, [messages])

  // Kapanma animasyonu — main process'ten 'trigger-hide' gelince
  useEffect(() => {
    const handleTriggerHide = () => {
      setIsClosing(true)
      setTimeout(() => {
        window.ipcRenderer.invoke('hide-window')
        setIsClosing(false)
      }, 260)
    }
    window.ipcRenderer.on('trigger-hide', handleTriggerHide)
    return () => { window.ipcRenderer.off('trigger-hide', handleTriggerHide) }
  }, [])

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

          setMessages(prev => [...prev, { role: 'assistant', content: `🔧 Araç kullanılıyor: ${name}` }])

          if (name === 'run_command' || name === 'open_app') {
            const cmd = name === 'open_app' ? `start ${args.app_name}` : args.command
            result = await window.ipcRenderer.executeCommand(cmd)
          } else if (name === 'read_file') {
            result = await window.ipcRenderer.readFile(args.path)
          } else if (name === 'write_file') {
            result = await window.ipcRenderer.writeFile(args.path, args.content)
          }

          if (result?.success) {
            const content = result.content || result.stdout || 'Tamamlandı.'
            setMessages(prev => [...prev, { role: 'assistant', content: `✅ ${content}` }])
          } else {
            setMessages(prev => [...prev, { role: 'assistant', content: `❌ Hata: ${result?.error}` }])
          }
        }
      } else if (response.content) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.content }])
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Hata: ${error.message}` }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      processAIResponse(input)
      setInput('')
    }
  }

  if (!disclaimerAccepted) {
    return <Disclaimer onAccept={() => setDisclaimerAccepted(true)} />
  }

  return (
    <div className={`container${isClosing ? ' closing' : ''}`}>
      {messages.length > 0 && (
        <>
          <div className="messages-area">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                <div className="message-content">{msg.content}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="messages-divider" />
        </>
      )}
      <div className="input-area">
        <button className="attach-btn" tabIndex={-1} title="Dosya ekle">
          <PaperclipIcon />
        </button>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ne yapmamı istersin?"
          className="main-input"
        />
        {isLoading && <div className="loader" />}
      </div>
    </div>
  )
}

export default App
