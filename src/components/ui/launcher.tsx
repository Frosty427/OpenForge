import React, { useState, useEffect, useRef } from 'react';
import { Search, Terminal, Calculator, FileText, Settings, X } from 'lucide-react';

interface CommandItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  action: string;
  category: string;
}

const commands: CommandItem[] = [
  { id: 'gateway', name: 'Start Gateway', icon: <Terminal size={18} />, action: 'gateway', category: 'System' },
  { id: 'node', name: 'Start Node', icon: <Terminal size={18} />, action: 'node', category: 'System' },
  { id: 'tui', name: 'Terminal UI', icon: <Terminal size={18} />, action: 'tui', category: 'System' },
  { id: 'calc', name: 'Calculator', icon: <Calculator size={18} />, action: 'calc', category: 'Apps' },
  { id: 'notepad', name: 'Notepad', icon: <FileText size={18} />, action: 'notepad', category: 'Apps' },
  { id: 'settings', name: 'Settings', icon: <Settings size={18} />, action: 'settings', category: 'System' },
  { id: 'config', name: 'Configure AI', icon: <Settings size={18} />, action: 'config', category: 'System' },
  { id: 'doctor', name: 'Health Check', icon: <Terminal size={18} />, action: 'doctor', category: 'System' },
];

interface LauncherProps {
  onClose: () => void;
}

export function Launcher({ onClose }: LauncherProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [results, setResults] = useState<CommandItem[]>(commands);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (query.trim() === '') {
      setResults(commands);
    } else {
      const filtered = commands.filter(cmd => 
        cmd.name.toLowerCase().includes(query.toLowerCase()) ||
        cmd.category.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
    }
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const executeCommand = async (cmd: CommandItem) => {
    try {
      const response = await fetch('/api/commands/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd.action })
      });
      const data = await response.json();
      console.log('Command executed:', data);
      onClose();
    } catch (error) {
      console.error('Failed to execute command:', error);
    }
  };

  const groupedCommands = results.reduce((acc, cmd) => {
    if (!acc[cmd.category]) {
      acc[cmd.category] = [];
    }
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20 z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center px-4 py-3 border-b border-gray-700">
          <Search className="text-gray-400 mr-3" size={20} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command..."
            className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-lg"
          />
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="max-h-96 overflow-y-auto p-2">
          {Object.entries(groupedCommands).map(([category, cmds]) => (
            <div key={category} className="mb-2">
              <div className="text-xs text-gray-500 px-3 py-1 uppercase tracking-wider">
                {category}
              </div>
              {cmds.map((cmd) => {
                const globalIdx = results.indexOf(cmd);
                return (
                  <button
                    key={cmd.id}
                    onClick={() => executeCommand(cmd)}
                    className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                      selectedIndex === globalIdx 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <span className="mr-3">{cmd.icon}</span>
                    <span>{cmd.name}</span>
                  </button>
                );
              })}
            </div>
          ))}
          
          {results.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No commands found for "{query}"
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-700 px-4 py-2 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span><kbd className="bg-gray-800 px-1 rounded">↑↓</kbd> Navigate</span>
            <span><kbd className="bg-gray-800 px-1 rounded">Enter</kbd> Execute</span>
            <span><kbd className="bg-gray-800 px-1 rounded">Esc</kbd> Close</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LauncherTrigger() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.code === 'Space') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  return <Launcher onClose={() => setIsOpen(false)} />;
}
