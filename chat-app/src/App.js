// src/App.js
import React from 'react';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';

import './App.css'; //

const App = () => {
    return (
        <div className="app">
            <ChatList />
            <ChatWindow />
        
        </div>
    );
};

export default App;

