import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL
const ChatInterface = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            simulateTyping("Hi there! 👋 I'm your Scanify assistant. How can I help you today?");
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const simulateTyping = async (message) => {
        setIsTyping(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setMessages(prev => [...prev, { text: message, sender: 'bot' }]);
        setIsTyping(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userMessage = inputMessage.trim();
        if (!userMessage) return;

        setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
        setInputMessage('');

        try {
            setIsTyping(true);
            console.log("Sending user message:", userMessage);
            const res = await axios.post(`${API}/chat/query`, { query: userMessage });
            console.log("Received AI response:", res.data);
            const reply = res.data?.message || "Sorry, I didn't understand that.";
            await simulateTyping(reply);
        } catch (error) {
            console.error("Chat error:", error);
            await simulateTyping("Oops! Something went wrong. Please try again.");
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            {/* Floating Chat Button */}
            {!isOpen && (
                <button
                    className="btn btn-primary rounded-circle position-fixed"
                    style={{ bottom: '20px', right: '20px', width: '60px', height: '60px', zIndex: 1050 }}
                    onClick={() => setIsOpen(true)}
                >
                    💬
                </button>
            )}

            {/* Chat Modal */}
            {isOpen && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1040 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            {/* Header */}
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">Scanify Assistant</h5>
                                <button
                                    type="button"
                                    className="close text-white"
                                    onClick={() => setIsOpen(false)}
                                    style={{ background: 'none', border: 'none', fontSize: '1.5rem' }}
                                >
                                    &times;
                                </button>
                            </div>

                            {/* Body */}
                            <div className="modal-body" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {messages.map((msg, index) => (
                                    <div key={index} className={`d-flex mb-2 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                                        <div className={`p-2 rounded ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-light text-dark'}`} style={{ maxWidth: '75%' }}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className="text-muted small">Typing...</div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Footer */}
                            <form onSubmit={handleSubmit}>
                                <div className="modal-footer">
                                    <input
                                        type="text"
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        className="form-control"
                                        placeholder="Type your message..."
                                    />
                                    <button type="submit" className="btn btn-primary" disabled={isTyping || !inputMessage.trim()}>
                                        ➤
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatInterface;
