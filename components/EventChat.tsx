import React, { useState, useEffect, useRef } from 'react';
import { User, ChatMessage } from '../types';
import { Send, X, MessageSquare } from 'lucide-react';
import { MockService } from '../services/mockService';
import { SupabaseService } from '../services/supabaseService';

interface EventChatProps {
    user: User;
    eventId: string;
    eventTitle: string;
    useSupabase: boolean;
    onClose: () => void;
}

export const EventChat: React.FC<EventChatProps> = ({ user, eventId, eventTitle, useSupabase, onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const service = useSupabase ? SupabaseService : MockService;

    useEffect(() => {
        loadMessages();
        // Polling for demo purposes (Realtime subscription would be better for Supabase)
        const interval = setInterval(loadMessages, 5000);
        return () => clearInterval(interval);
    }, [eventId]);

    const loadMessages = async () => {
        try {
            const msgs = await service.getEventMessages(eventId);
            setMessages(msgs);
        } catch (error) {
            console.error("Error loading messages");
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setLoading(true);
        try {
            await service.sendEventMessage(eventId, user.id, newMessage);
            setNewMessage('');
            loadMessages();
        } catch (error) {
            console.error("Error sending message");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4">
            <div className="bg-white w-full sm:max-w-md h-[80vh] sm:h-[600px] sm:rounded-2xl flex flex-col shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-clown-red text-white sm:rounded-t-2xl">
                    <div className="flex items-center space-x-2">
                        <MessageSquare size={20} />
                        <div>
                            <h3 className="font-bold text-sm">Chat de Actividad</h3>
                            <p className="text-xs opacity-90 truncate max-w-[200px]">{eventTitle}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
                            <MessageSquare size={32} className="mb-2 opacity-50" />
                            <p>¡Inicia la conversación!</p>
                            <p className="text-xs">Chat temporal del evento.</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMe = msg.userId === user.id;
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
                                        {!isMe && (
                                            <img src={msg.userPhoto} alt="" className="w-6 h-6 rounded-full bg-gray-200 mb-1" />
                                        )}
                                        <div>
                                            <div className={`p-3 rounded-2xl text-sm ${
                                                isMe ? 'bg-clown-blue text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                                            }`}>
                                                {!isMe && <p className="text-[10px] font-bold text-clown-red mb-1">{msg.userName}</p>}
                                                {msg.text}
                                            </div>
                                            <p className={`text-[10px] text-gray-400 mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 border-t border-gray-100 bg-white sm:rounded-b-2xl">
                    <form onSubmit={handleSend} className="flex space-x-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Escribe un mensaje..."
                            className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-clown-blue focus:outline-none"
                        />
                        <button 
                            type="submit" 
                            disabled={loading || !newMessage.trim()}
                            className="bg-clown-red text-white p-2 rounded-full hover:bg-red-600 disabled:opacity-50 transition-colors"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};