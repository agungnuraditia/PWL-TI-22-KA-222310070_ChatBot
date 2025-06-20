import React, { useEffect, useState } from 'react';
import './ChatWindow.css';
import axios from 'axios';

const ChatWindow = () => {
  const [telegramChats, setTelegramChats] = useState([]);
  const [inputMessage, setInputMessage] = useState("");

  // Pesan awal dummy
  const messages = [
    { text: "Halo Agung, bisakah kamu bantu saya mengerjakan tugas bahasa indonesia?", sender: "Irfan" },
    { text: "Ya, Tentu saja bisa", sender: "Agung" },
    { text: "Bisakah kita bertemu esok hari jam 09.00 am?", sender: "Irfan" },
  ];

  // Ambil pesan dari backend setiap 2 detik
  useEffect(() => {
    const interval = setInterval(() => {
      axios.get('http://localhost:5000/chats')
        .then((res) => setTelegramChats(res.data))
        .catch((err) => console.error(err));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Fungsi kirim pesan ke backend (dan diteruskan ke Telegram bot)
  const handleSend = () => {
    if (!inputMessage.trim()) return;

    axios.post('http://localhost:5000/send-message', { text: inputMessage })
      .then(() => {
        setInputMessage(""); // Kosongkan input setelah terkirim
      })
      .catch(err => console.error("Gagal kirim:", err));
  };

  // Gabungkan semua pesan: lokal + dari Telegram
  const allMessages = [
    ...messages,
    ...telegramChats.map(chat => ({
      text: `${chat.text} \n(Klasifikasi: ${chat.classification})`,
      sender: chat.user || "TelegramUser"
    }))
  ];

  return (
    <div className="chat-window">
      {/* HEADER */}
      <div className="chat-header">
        <div className="user-info">
          <img src="/avatars/irfan.jpg" alt="Irfan" className="avatar-header" />
          <h3>Irfan</h3>
        </div>
        <div className="chat-actions">
          <img src="/icons/phone.png" alt="Call" className="icon" />
          <img src="/icons/video.png" alt="Video Call" className="icon" />
          <img src="/icons/info.png" alt="Info" className="icon" />
        </div>
      </div>

      {/* CHAT MESSAGES */}
      <div className="messages">
        {allMessages.map((msg, index) => (
          <div
            key={index}
            className={`message-wrapper ${msg.sender === "Irfan" ? 'sent' : 'received'}`}
          >
            {/* Avatar kiri (untuk Agung/Bot) */}
            {msg.sender !== "Irfan" && (
              <img
                src={`/avatars/${msg.sender.toLowerCase()}.jpg`}
                alt={msg.sender}
                className="avatars"
                onError={(e) => { e.target.style.display = 'none' }}
              />
            )}

            <div className={`message ${msg.sender === "Irfan" ? 'sent' : 'received'}`}>
              {msg.text}
            </div>

            {/* Avatar kanan (untuk Irfan) */}
            {msg.sender === "Irfan" && (
              <img
                src={`/avatars/${msg.sender.toLowerCase()}.jpg`}
                alt={msg.sender}
                className="avatars"
              />
            )}
          </div>
        ))}
      </div>

      {/* INPUT & BUTTON */}
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
