import React, { useEffect, useState } from 'react';
import './ChatWindow.css';
import axios from 'axios';

const ChatWindow = () => {
  const [telegramChats, setTelegramChats] = useState([]);
  const [inputMessage, setInputMessage] = useState("");

  // Ambil chat setiap 1.5 detik dari server
  useEffect(() => {
    const interval = setInterval(() => {
      axios.get('http://localhost:5000/chats')
        .then(res => setTelegramChats(res.data))
        .catch(err => console.error("❌ Error get chats:", err));
    }, 1500);

    return () => clearInterval(interval);
  }, []);

const handleSend = () => {
  if (!inputMessage.trim()) return;

  const messageToSend = inputMessage; // simpan isi
  setInputMessage(""); // langsung kosongkan input!

  axios.post('http://localhost:5000/send-message', { text: messageToSend })
    .catch(err => console.error("Gagal kirim:", err));
};

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

      {/* CHAT MESSAGES */}
      <div className="messages">
        {telegramChats.map((msg, index) => {
          const isSender = msg.from === 'sender';
          const senderName = msg.user || (isSender ? "Irfan" : "Bot");

          return (
            <div key={index} className={`message-wrapper ${isSender ? 'sent' : 'received'}`}>

              {!isSender && (
                <img
                  src="/avatars/agung.jpg"
                  alt="Bot"
                  className="avatars"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              )}

              <div>
                <p className="sender-name">{senderName}</p>
                <div className={`message ${isSender ? 'sent' : 'received'}`}>
  {msg.text.includes('Pesan Anda diklasifikasikan sebagai:') ? (
    <span>
      Pesan Anda diklasifikasikan sebagai: 
      <strong style={{ marginLeft: '5px' }}>
        {msg.text.split(':')[1]?.trim()}
      </strong>
    </span>
  ) : (
    msg.text
  )}
</div>
              </div>

              {/* Avatar kanan untuk Irfan */}
              {isSender && (
                <img
                  src="/avatars/irfan.jpg"
                  alt="Irfan"
                  className="avatars"
                />
              )}
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
        <button onClick={handleSend}>Kirim</button>
      </div>
    </div>
  );
};

export default ChatWindow;
