// src/components/ChatList.js
import React from 'react';
const ChatList = () => {
    const chats = [
    { name: "Irfan", unread: true, avatar: "/avatars/irfan.jpg" },
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

