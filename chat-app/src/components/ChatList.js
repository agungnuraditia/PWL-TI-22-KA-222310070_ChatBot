// src/components/ChatList.js
import React from 'react';
const ChatList = () => {
    const chats = [
    { name: "Irfan", unread: true, avatar: "/avatars/irfan.jpg" },
    { name: "Pak Anton", unread: false, avatar: "/avatars/anton.jpg" },
    { name: "Pak Jemy Arieswanto", unread: false, avatar: "/avatars/jemy.png" },
    { name: "Pak Septian Cahyadi", unread: false, avatar: "/avatars/septian.jpg" },
    { name: "Pak Edi Sekprod", unread: false, avatar: "/avatars/edi.png" },
    { name: "Pak Isnan MTK", unread: false, avatar: "/avatars/isnan.jpg" },
    { name: "Faisal", unread: false, avatar: "/avatars/faisal.jpg" },
    ];

    return (
        <div className="chat-list">
        <h3>Chat</h3>
        <input type="text" placeholder="Cari" />
        {chats.map((chat, index) => (
        <div key={index} className={`chat-item ${chat.unread ? 'unread' : ''}`}>
        <img src={chat.avatar} alt={chat.name} className="avatar" />
        <span>{chat.name}</span>
        </div>
        ))}
    </div>
    );
};

export default ChatList;

