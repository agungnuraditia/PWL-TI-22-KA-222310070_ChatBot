
require('dotenv').config();
const { Telegraf } = require('telegraf');
const Sentiment = require('sentiment');
const express = require('express');
const cors = require('cors');
const db = require('./db');

// === KONFIGURASI EXPRESS ===
const app = express();
app.use(cors());
app.use(express.json());

const sentiment = new Sentiment();
const token = process.env.TELEGRAM_BOT_TOKEN;
const PORT = process.env.PORT || 5000;

if (!token) {
    console.error("❌ BOT TOKEN tidak ditemukan! Cek .env dan variabel TELEGRAM_BOT_TOKEN");
    process.exit(1);
}

const bot = new Telegraf(token);

// === AUTO REPLIES ===
const autoReplies = [
    { pattern: /apa kabar/i, response: "Kabar baik, ada yang bisa saya bantu?" },
    { pattern: /hallo/i, response: "Hallo, ada yang bisa saya bantu?" },
    { pattern: /siapa kamu|siapa anda/i, response: "Saya chatbot pintar yang dibuat untuk membantu Irfan." },
    { pattern: /bisa bantu apa/i, response: "Saya bisa bantu menjawab pertanyaan dan klasifikasi sentimen pesan kamu." },
    { pattern: /terima kasih|terimakasih/i, response: "Sama-sama 😊" },
    { pattern: /bad|jelek|buruk|kau|anjing/i, response: "Mohon maaf jika ada yang kurang berkenan 😔" },
    { pattern: /nice|bagus|baik|maaf|sorry/i, response: "Terima kasih! Senang bisa membantu 😊" }
];

// === SIMPAN LOG KE DATABASE ===
function simpanLog(user, platform, text, classification) {
    db.query(
        'INSERT INTO chat_logs (user, platform, text, classification) VALUES (?, ?, ?, ?)',
        [user, platform, text, classification],
        (err) => {
            if (err) console.error('❌ Error insert chat_logs:', err);
        }
    );
}

function simpanHistory(user, platform, text, classification) {
    db.query(
        'INSERT INTO chat_history (user, platform, text, classification) VALUES (?, ?, ?, ?)',
        [user, platform, text, classification],
        (err) => {
            if (err) console.error('❌ Error insert chat_history:', err);
        }
    );
}

// === HANDLE PESAN MASUK DARI TELEGRAM ===
bot.on('text', (ctx) => {
    const text = ctx.message.text;
    const username = ctx.from.username || ctx.from.first_name || 'Pengguna';

    const userSentiment = sentiment.analyze(text);
    const userClassification = userSentiment.score > 0 ? 'Positif' :
                            userSentiment.score < 0 ? 'Negatif' : 'Netral';

    const matched = autoReplies.find(rule => rule.pattern.test(text));
    const reply = matched ? matched.response : "Maaf, saya belum paham maksud Anda.";

    const botSentiment = sentiment.analyze(reply);
    const botClassification = botSentiment.score > 0 ? 'Positif' :
                            botSentiment.score < 0 ? 'Negatif' : 'Netral';

    // Simpan percakapan ke DB
    simpanLog(username, 'telegram', text, userClassification);
    simpanLog('Bot', 'bot', reply, botClassification);
    simpanHistory(username, 'telegram', text, userClassification);
    simpanHistory('Bot', 'bot', reply, botClassification);

    ctx.reply(reply);
});

// === API POST /send-message ===
app.post('/send-message', (req, res) => {
    const { text } = req.body;
    const targetChatId = 6447173930; // GANTI ke chat_id tujuan

    const userSentiment = sentiment.analyze(text);
    const userClassification = userSentiment.score > 0 ? 'Positif' :
                            userSentiment.score < 0 ? 'Negatif' : 'Netral';

    const matched = autoReplies.find(rule => rule.pattern.test(text));
    const reply = matched ? matched.response : "Maaf, saya belum paham maksud Anda.";

    const botSentiment = sentiment.analyze(reply);
    const botClassification = botSentiment.score > 0 ? 'Positif' :
                            botSentiment.score < 0 ? 'Negatif' : 'Netral';

    simpanLog('Irfan', 'sender', text, userClassification);
    simpanLog('Bot', 'bot', reply, botClassification);
    simpanHistory('Irfan', 'sender', text, userClassification);
    simpanHistory('Bot', 'bot', reply, botClassification);

    bot.telegram.sendMessage(targetChatId, reply)
        .then(() => res.status(200).json({ message: 'Terkirim dan dianalisis' }))
        .catch(err => res.status(500).json({ error: err.message }));
});

// === API GET /chats ===
app.get('/chats', (req, res) => {
    db.query('SELECT * FROM chat_logs ORDER BY date ASC LIMIT 100', (err, results) => {
        if (err) {
            console.error('❌ Error fetch chats:', err);
            res.status(500).json({ error: 'Database error' });
        } else {
            res.json(results);
        }
    });
});

// === API DELETE /chats ===
app.delete('/chats', (req, res) => {
    db.query('DELETE FROM chat_logs', (err) => {
        if (err) {
            console.error('❌ Error delete chats:', err);
            res.status(500).json({ error: 'Database error' });
        } else {
            res.json({ message: 'Semua chat berhasil dihapus' });
        }
    });
});

// === JALANKAN SERVER EXPRESS ===
app.listen(PORT, () => {
    console.log(`✅ Server berjalan di http://localhost:${PORT}`);
});

// === JALANKAN BOT TELEGRAM ===
bot.launch();
console.log("🤖 Bot Telegram aktif...");