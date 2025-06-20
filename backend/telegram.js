const TelegramBot = require('node-telegram-bot-api');
const Sentiment = require('sentiment');
const express = require('express');
const cors = require('cors');

const app = express();
const token = '7919715969:AAEL6YxFPysmh4jngTgMwIAfO_YoPZCDV-0'; // token dari BotFather
const bot = new TelegramBot(token, { polling: true });
const sentiment = new Sentiment();

app.use(cors());
app.use(express.json());

let chatLogs = [];

// ✅ Handler untuk pesan dari Telegram
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  const result = sentiment.analyze(messageText);
  let classification = 'Netral';
  if (result.score > 0) classification = 'Positif';
  else if (result.score < 0) classification = 'Negatif';

  const response = `Pesan Anda diklasifikasikan sebagai: *${classification}*`;

  chatLogs.push({
    user: msg.from.username || 'Pengguna',
    text: messageText,
    classification,
    date: new Date()
  });

  bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
});

// ✅ Endpoint untuk frontend React mengambil semua chat
app.get('/chats', (req, res) => {
  res.json(chatLogs);
});

// ✅ Endpoint frontend mengirim pesan → dianalisis → dikirim ke Telegram
app.post('/send-message', (req, res) => {
  const { text } = req.body;
  const targetChatId = 6447173930; // Ganti dengan chat ID kamu

  if (!text) return res.status(400).json({ error: 'Text kosong' });

  // 🔍 Analisis sentimen secara langsung di backend
  const result = sentiment.analyze(text);
  let classification = 'Netral';
  if (result.score > 0) classification = 'Positif';
  else if (result.score < 0) classification = 'Negatif';

  // 💾 Simpan ke chatLogs agar muncul di frontend
  chatLogs.push({
    user: 'Irfan', // atau bisa 'Frontend'
    text,
    classification,
    date: new Date()
  });

  // 📤 Kirim ke Telegram (termasuk klasifikasi)
  const response = `${text} \n(Klasifikasi: ${classification})`;

  bot.sendMessage(targetChatId, response)
    .then(() => res.status(200).json({ message: 'Terkirim dan dianalisis' }))
    .catch(err => res.status(500).json({ error: err.message }));
});

// ✅ Jalankan server
app.listen(5000, () => {
  console.log('✅ Backend berjalan di http://localhost:5000');
});
