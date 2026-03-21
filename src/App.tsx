<<<<<<< HEAD
import { useState, useRef, useEffect } from 'react'
import './App.css'
import { AIManager, AISettings } from './services/aiManager'
import { Disclaimer } from './components/Disclaimer'

const defaultConfig: AISettings = {
  provider: 'openai',
  apiKey: localStorage.getItem('of_api_key') || '', 
  model: 'gpt-4o'
};

function App() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<{role: string, content: string}[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [aiManager] = useState(() => new AIManager(defaultConfig))
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(localStorage.getItem('of_disclaimer_accepted') === 'true')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (disclaimerAccepted) {
        inputRef.current?.focus()
    }
  }, [disclaimerAccepted])

  useEffect(() => {
    const height = messages.length > 0 ? 550 : 80
    window.ipcRenderer.resizeWindow(600, height)
  }, [messages])

  const processAIResponse = async (userInput: string) => {
    const updatedMessages = [...messages, { role: 'user', content: userInput }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await aiManager.generateResponse(updatedMessages);

      if (response.tool_calls) {
        for (const toolCall of response.tool_calls as any[]) {
           const { name, arguments: argsJson } = toolCall.function;
           const args = JSON.parse(argsJson);
           let result: any;

           setMessages(prev => [...prev, { role: 'assistant', content: `🔧 Using Tool: ${name}` }]);

           if (name === 'run_command' || name === 'open_app') {
             const cmd = name === 'open_app' ? `start ${args.app_name}` : args.command;
             result = await window.ipcRenderer.executeCommand(cmd);
           } else if (name === 'read_file') {
             result = await window.ipcRenderer.readFile(args.path);
           } else if (name === 'write_file') {
             result = await window.ipcRenderer.writeFile(args.path, args.content);
           }

           if (result.success) {
               const content = result.content || result.stdout || "Action completed successfully.";
               setMessages(prev => [...prev, { role: 'assistant', content: `✅ ${content}` }]);
           } else {
               setMessages(prev => [...prev, { role: 'assistant', content: `❌ Error: ${result.error}` }]);
           }
        }
      } else if (response.content) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.content }]);
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      processAIResponse(input);
      setInput('');
    }
  }

  if (!disclaimerAccepted) {
      return <Disclaimer onAccept={() => setDisclaimerAccepted(true)} />
  }

  return (
    <div className="container">
      <div className="glow-ring"></div>
      <div className="search-bar">
        <input 
          ref={inputRef}
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What can I do for you, Sir?"
          className="main-input"
        />
        {isLoading && <div className="loader"></div>}
      </div>

      {messages.length > 0 && (
        <div className="messages-area">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              <div className="message-content">{msg.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App
=======
import { useState, useRef, useEffect } from 'react'
import './App.css'
import { AIManager, AISettings } from './services/aiManager'
import { Disclaimer } from './components/Disclaimer'

const defaultConfig: AISettings = {
  provider: 'openai',
  apiKey: localStorage.getItem('of_api_key') || '', 
  model: 'gpt-4o'
};

function App() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<{role: string, content: string}[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [aiManager] = useState(() => new AIManager(defaultConfig))
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(localStorage.getItem('of_disclaimer_accepted') === 'true')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (disclaimerAccepted) {
        inputRef.current?.focus()
    }
  }, [disclaimerAccepted])

  useEffect(() => {
    const height = messages.length > 0 ? 550 : 80
    window.ipcRenderer.resizeWindow(600, height)
  }, [messages])

  const processAIResponse = async (userInput: string) => {
    const updatedMessages = [...messages, { role: 'user', content: userInput }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await aiManager.generateResponse(updatedMessages);

      if (response.tool_calls) {
        for (const toolCall of response.tool_calls as any[]) {
           const { name, arguments: argsJson } = toolCall.function;
           const args = JSON.parse(argsJson);
           let result: any;

           setMessages(prev => [...prev, { role: 'assistant', content: `🔧 Using Tool: ${name}` }]);

           if (name === 'run_command' || name === 'open_app') {
             const cmd = name === 'open_app' ? `start ${args.app_name}` : args.command;
             result = await window.ipcRenderer.executeCommand(cmd);
           } else if (name === 'read_file') {
             result = await window.ipcRenderer.readFile(args.path);
           } else if (name === 'write_file') {
             result = await window.ipcRenderer.writeFile(args.path, args.content);
           }

           if (result.success) {
               const content = result.content || result.stdout || "Action completed successfully.";
               setMessages(prev => [...prev, { role: 'assistant', content: `✅ ${content}` }]);
           } else {
               setMessages(prev => [...prev, { role: 'assistant', content: `❌ Error: ${result.error}` }]);
           }
        }
      } else if (response.content) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.content }]);
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      processAIResponse(input);
      setInput('');
    }
  }

  if (!disclaimerAccepted) {
      return <Disclaimer onAccept={() => setDisclaimerAccepted(true)} />
  }

  return (
    <div className="container">
      <div className="glow-ring"></div>
      <div className="search-bar">
        <input 
          ref={inputRef}
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What can I do for you, Sir?"
          className="main-input"
        />
        {isLoading && <div className="loader"></div>}
      </div>

      {messages.length > 0 && (
        <div className="messages-area">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              <div className="message-content">{msg.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App
>>>>>>> 6a986b7 (new version)
