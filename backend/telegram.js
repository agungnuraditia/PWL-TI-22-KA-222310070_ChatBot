require('dotenv').config();
const { Telegraf } = require('telegraf');
const Sentiment = require('sentiment');
const express = require('express');
const cors = require('cors');
const db = require('./db');

// === KONFIGURASI ===
const app = express();
app.use(cors());
app.use(express.json());

const sentiment = new Sentiment();
const token = process.env.BOT_TOKEN || '7919715969:AAEL6YxFPysmh4jngTgMwIAfO_YoPZCDV-0';
const bot = new Telegraf(token);

// === BALASAN OTOMATIS ===
const autoReplies = [
    { pattern: /apa kabar/i, response: "Kabar baik, ada yang bisa saya bantu?" },
    { pattern: /hallo/i, response: "Hallo, ada yang bisa saya bantu?" },
    { pattern: /siapa kamu/i, response: "Saya chatbot pintar yang dibuat untuk membantu Irfan." },
    { pattern: /siapa anda/i, response: "Saya chatbot pintar yang dibuat untuk membantu Irfan." },
    { pattern: /bisa bantu apa/i, response: "Saya bisa bantu menjawab pertanyaan dan klasifikasi sentimen pesan kamu." },
    { pattern: /terima kasih|terimakasih/i, response: "Sama-sama 😊" },
    { pattern: /bad|jelek|buruk|kau|anjing/i, response: "Mohon maaf jika ada yang kurang berkenan 😔" },
    { pattern: /nice|bagus|baik|maaf|sorry/i, response: "Terima kasih! Senang bisa membantu 😊" }
];

// === FUNGSI SIMPAN CHAT KE DATABASE ===
function simpanLog(user, platform, text, classification) {
    db.query(
        'INSERT INTO chat_logs (user, platform, text, classification) VALUES (?, ?, ?, ?)',
        [user, platform, text, classification],
        (err, results) => {
            if (err) {
                console.error('❌ Error inserting to DB:', err);
            } else {
                console.log(`✅ Log inserted with ID: ${results.insertId}`);
            }
        }
    );
}

// === BOT MENERIMA PESAN DARI TELEGRAM ===
bot.on('text', (ctx) => {
    const text = ctx.message.text;
    const username = ctx.from.username || ctx.from.first_name || 'Pengguna';
    const result = sentiment.analyze(text);

    let userClassification = 'Netral';
    if (result.score > 0) userClassification = 'Positif';
    else if (result.score < 0) userClassification = 'Negatif';

    const matched = autoReplies.find(rule => rule.pattern.test(text));
    const reply = matched
        ? matched.response
        : "Maaf, saya belum paham maksud Anda.";

    const botSentiment = sentiment.analyze(reply);
    let botClassification = 'Netral';
    if (botSentiment.score > 0) botClassification = 'Positif';
    else if (botSentiment.score < 0) botClassification = 'Negatif';

    // Simpan log user dan bot ke database
    simpanLog(username, 'telegram', text, userClassification);
    simpanLog('Bot', 'bot', reply, botClassification);

    ctx.reply(reply);
});

// === ENDPOINT FRONTEND UNTUK KIRIM PESAN SECARA MANUAL DARI FRONTEND ===
app.post('/send-message', (req, res) => {
    const { text } = req.body;
    const targetChatId = 6447173930; // Ubah sesuai chat ID tujuan

    const userResult = sentiment.analyze(text);
    let userClassification = 'Netral';
    if (userResult.score > 0) userClassification = 'Positif';
    else if (userResult.score < 0) userClassification = 'Negatif';

    const matched = autoReplies.find(rule => rule.pattern.test(text));
    const reply = matched
        ? matched.response
        : "Maaf, saya belum paham maksud Anda.";

    const botResult = sentiment.analyze(reply);
    let botClassification = 'Netral';
    if (botResult.score > 0) botClassification = 'Positif';
    else if (botResult.score < 0) botClassification = 'Negatif';

    // Simpan ke database
    simpanLog('Irfan', 'sender', text, userClassification);
    simpanLog('Bot', 'bot', reply, botClassification);

    bot.telegram.sendMessage(targetChatId, reply)
        .then(() => res.status(200).json({ message: 'Terkirim dan dianalisis' }))
        .catch(err => res.status(500).json({ error: err.message }));
});

// === ENDPOINT UNTUK FRONTEND MENAMPILKAN HISTORI CHAT ===
app.get('/chats', (req, res) => {
    db.query('SELECT * FROM chat_logs ORDER BY date ASC LIMIT 100', (err, results) => {
        if (err) {
            console.error('❌ Error fetching chats:', err);
            res.status(500).json({ error: 'Database error' });
        } else {
            res.json(results);
        }
    });
});

// === ENDPOINT UNTUK MENGHAPUS SEMUA HISTORI CHAT ===
app.delete('/chats', (req, res) => {
    db.query('DELETE FROM chat_logs', (err, results) => {
        if (err) {
            console.error('❌ Error deleting chats:', err);
            res.status(500).json({ error: 'Database error' });
        } else {
            res.json({ message: 'Semua chat berhasil dihapus dari database' });
        }
    });
});

// === JALANKAN SERVER ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server berjalan di http://localhost:${PORT}`);
});

bot.launch();