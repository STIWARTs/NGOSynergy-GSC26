import { useState, useEffect, useRef } from 'react';
import {
  Send, Paperclip, AlertTriangle, Search,
  User, Hash, Radio, Phone, Video, MoreVertical, CheckCircle2,
  MapPin, Clock
} from 'lucide-react';
import clsx from 'clsx';

type Message = {
  id: string;
  text: string;
  timestamp: string;
  isAdmin: boolean;
  priority?: 'normal' | 'urgent' | 'info';
  attachment?: { type: 'image' | 'location'; url: string; name: string };
};

type Conversation = {
  id: string;
  type: 'volunteer' | 'incident' | 'broadcast';
  name: string;
  subtitle?: string;
  status: 'active' | 'offline' | 'busy' | 'deployed';
  unreadCount: number;
  messages: Message[];
};

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'v1',
    type: 'volunteer',
    name: 'Alex Chen',
    subtitle: 'Deployed: Downtown Fire',
    status: 'deployed',
    unreadCount: 2,
    messages: [
      { id: 'm1', text: 'Arrived at the staging area.', timestamp: '10:42 AM', isAdmin: false },
      { id: 'm2', text: 'Copy that. Await further instructions from Incident Command.', timestamp: '10:45 AM', isAdmin: true },
      { id: 'm3', text: 'Admin, I am seeing an issue here. The fire is spreading towards the east block. We might need to evacuate the apartment complex.', timestamp: '11:05 AM', isAdmin: false, priority: 'urgent' },
      { id: 'm4', text: 'Need backup and extra masks ASAP.', timestamp: '11:06 AM', isAdmin: false, priority: 'urgent' },
    ]
  },
  {
    id: 'v2',
    type: 'volunteer',
    name: 'Sarah Smith',
    subtitle: 'Logistics Team',
    status: 'active',
    unreadCount: 0,
    messages: [
      { id: 'm1', text: 'Delivered 50 blankets to Shelter A.', timestamp: '09:15 AM', isAdmin: false },
      { id: 'm2', text: 'Excellent work. Head back to the warehouse.', timestamp: '09:18 AM', isAdmin: true },
    ]
  },
  {
    id: 'i1',
    type: 'incident',
    name: '#fire-downtown',
    subtitle: '34 Active Responders',
    status: 'active',
    unreadCount: 5,
    messages: [
      { id: 'm1', text: 'All units, maintain 500ft perimeter.', timestamp: '10:00 AM', isAdmin: true, priority: 'info' },
      { id: 'm2', text: 'Unit 4 holding the line at 5th Ave.', timestamp: '10:12 AM', isAdmin: false },
    ]
  },
  {
    id: 'b1',
    type: 'broadcast',
    name: 'All Personnel',
    subtitle: 'Global Announcement',
    status: 'active',
    unreadCount: 0,
    messages: [
      { id: 'm1', text: 'Severe weather warning issued for the next 4 hours. All non-essential ops suspended.', timestamp: '08:00 AM', isAdmin: true, priority: 'urgent' },
    ]
  }
];

export default function CommunicationHub() {
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [activeId, setActiveId] = useState<string>('v1');
  const [inputText, setInputText] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'volunteer' | 'incident' | 'broadcast'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find(c => c.id === activeId);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  // Mark as read when opened
  useEffect(() => {
    if (activeConversation && activeConversation.unreadCount > 0) {
      setConversations(prev => prev.map(c => 
        c.id === activeId ? { ...c, unreadCount: 0 } : c
      ));
    }
  }, [activeId, activeConversation]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !activeConversation) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAdmin: true,
    };

    setConversations(prev => prev.map(c => {
      if (c.id === activeId) {
        return { ...c, messages: [...c.messages, newMessage] };
      }
      return c;
    }));

    setInputText('');

    // Simulate a reply if talking to a volunteer
    if (activeConversation.type === 'volunteer') {
      setTimeout(() => {
        const replyMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Copy that. Understood.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isAdmin: false,
        };
        setConversations(prev => prev.map(c => {
          if (c.id === activeId) {
            return { ...c, messages: [...c.messages, replyMessage], unreadCount: activeId === c.id ? 0 : c.unreadCount + 1 };
          }
          return c;
        }));
      }, 2000);
    }
  };

  const filteredConversations = conversations.filter(c => filterType === 'all' || c.type === filterType);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500';
      case 'deployed': return 'bg-amber-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'volunteer': return <User size={18} />;
      case 'incident': return <Hash size={18} />;
      case 'broadcast': return <Radio size={18} />;
      default: return <User size={18} />;
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-base text-text-primary rounded-xl overflow-hidden border border-border shadow-2xl">
      
      {/* Left Sidebar - Chat List */}
      <div className="w-80 flex flex-col border-r border-border bg-surface/50 backdrop-blur-sm">
        <div className="p-4 border-b border-border space-y-4">
          <h2 className="text-xl font-bold font-mono text-text-primary tracking-tight">Comms Hub</h2>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
            <input 
              type="text" 
              placeholder="Search messages..." 
              className="w-full bg-base border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-text-primary"
            />
          </div>

          <div className="flex gap-2 text-xs font-medium">
            {(['all', 'volunteer', 'incident', 'broadcast'] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={clsx(
                  "px-3 py-1.5 rounded-full capitalize transition-colors",
                  filterType === type 
                    ? "bg-primary text-primary-content" 
                    : "bg-base text-text-secondary hover:text-text-primary border border-border"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map(conv => (
            <div 
              key={conv.id}
              onClick={() => setActiveId(conv.id)}
              className={clsx(
                "flex items-center gap-3 p-4 border-b border-border/50 cursor-pointer transition-colors relative group",
                activeId === conv.id ? "bg-primary/10 border-l-2 border-l-primary" : "hover:bg-base"
              )}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-base border border-border flex items-center justify-center text-text-secondary group-hover:text-primary transition-colors">
                  {getIcon(conv.type)}
                </div>
                <div className={clsx("absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-surface", getStatusColor(conv.status))} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-semibold text-sm truncate">{conv.name}</h3>
                  <span className="text-[10px] text-text-secondary whitespace-nowrap">
                    {conv.messages[conv.messages.length - 1]?.timestamp}
                  </span>
                </div>
                <p className="text-xs text-text-secondary truncate">
                  {conv.type === 'volunteer' && <span className="text-primary/80 mr-1">{conv.subtitle}</span>}
                  {conv.messages[conv.messages.length - 1]?.text}
                </p>
              </div>

              {conv.unreadCount > 0 && (
                <div className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center absolute right-4">
                  {conv.unreadCount}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right Pane - Active Chat */}
      {activeConversation ? (
        <div className="flex-1 flex flex-col bg-surface/30">
          {/* Chat Header */}
          <div className="h-16 px-6 border-b border-border flex items-center justify-between bg-surface/80 backdrop-blur-md z-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-base border border-border flex items-center justify-center text-primary">
                {getIcon(activeConversation.type)}
              </div>
              <div>
                <h2 className="font-bold text-lg leading-tight flex items-center gap-2">
                  {activeConversation.name}
                  {activeConversation.type === 'incident' && <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-xs font-medium border border-red-500/20">Critical</span>}
                </h2>
                <p className="text-xs text-text-secondary flex items-center gap-1">
                  <span className={clsx("w-2 h-2 rounded-full inline-block", getStatusColor(activeConversation.status))} />
                  {activeConversation.status} • {activeConversation.subtitle}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-text-secondary">
              <button className="p-2 hover:bg-base rounded-lg transition-colors hover:text-primary"><Phone size={18} /></button>
              <button className="p-2 hover:bg-base rounded-lg transition-colors hover:text-primary"><Video size={18} /></button>
              <div className="w-px h-6 bg-border mx-1"></div>
              <button className="p-2 hover:bg-base rounded-lg transition-colors"><MoreVertical size={18} /></button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Date Separator */}
            <div className="flex justify-center">
              <span className="text-[10px] font-medium bg-base px-3 py-1 rounded-full text-text-secondary border border-border/50">
                Today
              </span>
            </div>

            {activeConversation.messages.map((msg) => (
              <div 
                key={msg.id} 
                className={clsx(
                  "flex flex-col max-w-[80%]",
                  msg.isAdmin ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div className="flex items-end gap-2">
                  {!msg.isAdmin && (
                    <div className="w-6 h-6 rounded-full bg-base border border-border flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-text-secondary mb-1">
                      {activeConversation.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  
                  <div className={clsx(
                    "px-4 py-2.5 rounded-2xl relative shadow-sm",
                    msg.isAdmin 
                      ? "bg-primary text-primary-content rounded-br-sm" 
                      : msg.priority === 'urgent'
                        ? "bg-red-500/10 text-red-500 border border-red-500/20 rounded-bl-sm"
                        : "bg-surface border border-border text-text-primary rounded-bl-sm"
                  )}>
                    {msg.priority === 'urgent' && !msg.isAdmin && (
                      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider mb-1 text-red-500">
                        <AlertTriangle size={12} /> Priority Alert
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 mt-1 px-1">
                  <span className="text-[10px] text-text-secondary">{msg.timestamp}</span>
                  {msg.isAdmin && <CheckCircle2 size={10} className="text-primary" />}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-surface border-t border-border">
            <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
              <button type="button" className="p-3 text-text-secondary hover:text-primary transition-colors rounded-lg hover:bg-base">
                <Paperclip size={20} />
              </button>
              
              <div className="flex-1 relative">
                <textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={`Message ${activeConversation.name}...`}
                  className="w-full bg-base border border-border rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-text-primary resize-none min-h-[44px] max-h-32"
                  rows={1}
                />
                <button 
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-red-500 transition-colors"
                  title="Mark as Urgent"
                >
                  <AlertTriangle size={18} />
                </button>
              </div>

              <button 
                type="submit" 
                disabled={!inputText.trim()}
                className="p-3 bg-primary text-primary-content rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
              >
                <Send size={20} />
              </button>
            </form>
            <div className="flex justify-between items-center px-2 mt-2">
              <span className="text-[10px] text-text-secondary">Press Enter to send, Shift + Enter for new line</span>
              <div className="flex gap-3 text-[10px] text-text-secondary">
                <span className="flex items-center gap-1"><MapPin size={12}/> Request Location</span>
                <span className="flex items-center gap-1"><Clock size={12}/> Set Reminder</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-text-secondary bg-surface/30">
          <div className="w-16 h-16 rounded-full bg-base border border-border flex items-center justify-center mb-4">
            <Radio size={24} className="text-primary/50" />
          </div>
          <h3 className="text-lg font-medium text-text-primary">No Conversation Selected</h3>
          <p className="text-sm">Select a volunteer, incident, or broadcast to view communications.</p>
        </div>
      )}
    </div>
  );
}
