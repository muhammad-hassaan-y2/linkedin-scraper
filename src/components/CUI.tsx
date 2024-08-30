"use client";
import React, { useState } from 'react';

const CUI: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'bot' }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSendMessage = async () => {
    if (input.trim() === '') {
      setMessages((prev) => [...prev, { text: 'Please enter a keyword.', sender: 'bot' }]);
      return;
    }

    setMessages((prev) => [...prev, { text: input, sender: 'user' }]);
    setLoading(true);

    try {
      const response = await fetch('/api/linkedin-scraper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword: input }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          { text: input, sender: 'user' },
          { text: `Scraped data: ${JSON.stringify(result, null, 2)}`, sender: 'bot' },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { text: input, sender: 'user' },
          { text: `Error: ${result.error}`, sender: 'bot' },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { text: input, sender: 'user' },
        { text: 'An error occurred while scraping data.', sender: 'bot' },
      ]);
    } finally {
      setLoading(false);
    }

    setInput('');
  };

  return (
    <div className="w-full max-w-md mx-auto bg-rose-300 rounded-lg shadow-md p-4">
      <div className="h-64 overflow-y-auto mb-4 border-b">
        {messages.map((message, index) => (
          <div key={index} className={`p-2 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded-lg ${message.sender === 'user' ? 'bg-blue-500 text-lime-500' : 'bg-gray-300 text-black'}`}>
              {message.text}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          className="flex-1 border rounded-l-lg px-4 py-2 text-black"
          placeholder="Enter keyword to scrape..."
        />
        <button onClick={handleSendMessage} className="bg-blue-500 text-white px-4 py-2 rounded-r-lg" disabled={loading}>
          {loading ? 'Loading...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default CUI;
