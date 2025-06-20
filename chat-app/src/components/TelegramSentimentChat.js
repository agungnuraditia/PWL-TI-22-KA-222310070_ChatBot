import React, { useEffect, useState } from 'react';
import axios from 'axios';

function TelegramSentimentChat() {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      axios.get('http://localhost:5000/chats')
        .then(res => setChats(res.data))
        .catch(err => console.error(err));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="chat-sentiment">
      <h2>Analisis Sentimen Telegram Bot</h2>
      <ul>
        {chats.map((chat, idx) => (
          <li key={idx}>
            <strong>{chat.user}</strong>: {chat.text} <br />
            <em>Klasifikasi: {chat.classification}</em>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TelegramSentimentChat;
