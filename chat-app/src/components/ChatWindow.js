import React, { useEffect, useState } from 'react';
import './ChatWindow.css';
import axios from 'axios';

const ChatWindow = () => {
  const [telegramChats, setTelegramChats] = useState([]);
  const [inputMessage, setInputMessage] = useState("");

  // Ambil data chat setiap 1 detik
  useEffect(() => {
    const interval = setInterval(() => {
      fetch('http://localhost:5000/chats')
        .then(res => res.json())
        .then(data => setTelegramChats(data))
        .catch(err => console.error("Gagal fetch:", err));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fungsi kirim pesan
  const handleSend = () => {
    if (!inputMessage.trim()) return;

    const messageToSend = inputMessage;
    setInputMessage("");

    axios.post('http://localhost:5000/send-message', { text: messageToSend })
      .catch(err => console.error("Gagal kirim:", err));
  };

  // Format tanggal
  const formatDate = (dateStr) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('id-ID', options);
  };

  let lastDate = null;

  return (
    <div className="chat-window">
      {/* HEADER */}
      <div className="chat-header">
        <div className="user-info">
          <img src="/avatars/irfan.jpg" alt="Irfan" className="avatar-header" />
          <h3>ChatBot - Irfan</h3>
        </div>
        <div className="chat-actions">
          <img src="/icons/phone.png" alt="Call" className="icon" />
          <img src="/icons/video.png" alt="Video Call" className="icon" />
          <img src="/icons/info.png" alt="Info" className="icon" />
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="messages">
        {telegramChats.map((msg, index) => {
          if (!msg) return null;

          const isSender = msg.from === 'sender';
          const isFromBot = msg.from === 'bot';
          const senderName = msg.user || (isSender ? "Irfan" : isFromBot ? "BOT" : "Pengguna");
          const classification = msg.classification;

          const chatDate = msg.date ? new Date(msg.date) : null;
          const dateStr = chatDate ? formatDate(chatDate) : '';
          const showDate = dateStr !== lastDate && dateStr !== '';
          if (dateStr) lastDate = dateStr;

          return (
            <div key={index}>
              {/* Tanggal */}
              {showDate && <div className="date-label">{dateStr}</div>}

              {/* Bubble */}
              <div className={`message-wrapper ${isSender ? 'sent' : 'received'}`}>
                {/* Avatar kiri */}
                {!isSender && (
                  <div className="left-avatar">
                    <div className="circle-avatar">
                      {isFromBot ? 'BOT' : senderName.charAt(0).toUpperCase()}
                    </div>
                  </div>
                )}

                {/* Bubble chat dan label */}
                <div className="message-bubble-wrapper">
                  <div className={`message-bubble ${classification?.toLowerCase()}`}>
                    <span className="message-text">{msg.text}</span>
                    {classification && (
                      <span className={`label ${classification.toLowerCase()}`}>
                        {classification}
                      </span>
                    )}
                  </div>
                </div>

                {/* Avatar kanan untuk pengirim */}
                {isSender && (
                  <img
                    src="/avatars/irfan.jpg"
                    alt="Irfan"
                    className="avatars"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* INPUT */}
      <div className="chat-input">
        <input
          type="text"
          placeholder="Tulis pesan..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend} className="kirim-button">Kirim</button>
      </div>
    </div>
  );
};

export default ChatWindow;
