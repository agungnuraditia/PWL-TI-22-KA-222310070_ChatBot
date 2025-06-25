const TelegramBot = require('node-telegram-bot-api');
const Sentiment = require('sentiment');
const express = require('express');
const cors = require('cors');

// Konfigurasi bot dan server
const app = express();
const sentiment = new Sentiment();
const token = '7919715969:AAEL6YxFPysmh4jngTgMwIAfO_YoPZCDV-0'; // <- GANTI dengan token bot kamu dari @BotFather
const bot = new TelegramBot(token, { polling: true });

app.use(cors());
app.use(express.json());

let chatLogs = [];

// ✅ 1. Bot merespons pesan dari Telegram
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  console.log('💬 Pesan diterima dari chat_id:', chatId);

  const result = sentiment.analyze(text);
  let classification = 'Netral';
  if (result.score > 0) classification = 'Positif';
  else if (result.score < 0) classification = 'Negatif';

  const reply = `Pesan Anda diklasifikasikan sebagai: ${classification}`;

  // Simpan log chat dari Telegram
  chatLogs.push({
    user: msg.from.username || msg.from.first_name || 'Pengguna',
    from: 'telegram',
    text,
    classification,
    date: new Date()
  });

  // Simpan balasan bot ke Telegram
  chatLogs.push({
    user: 'Bot',
    from: 'bot',
    text: reply,
    classification,
    date: new Date()
  });

  bot.sendMessage(chatId, reply, { parse_mode: 'Markdown' });
});

// ✅ 2. Endpoint untuk frontend mengirim pesan
app.post('/send-message', (req, res) => {
  const { text } = req.body;
  const targetChatId = 6447173930; // <- Ganti dengan chat ID milikmu

  if (!text) return res.status(400).json({ error: 'Text kosong' });

  const result = sentiment.analyze(text);
  let classification = 'Netral';
  if (result.score > 0) classification = 'Positif';
  else if (result.score < 0) classification = 'Negatif';

  const reply = `Pesan Anda diklasifikasikan sebagai: ${classification}`;

  // Simpan pesan dari web user
  chatLogs.push({
    user: 'Irfan',
    from: 'sender',
    text,
    classification: null, // Pesan awal tidak diklasifikasi
    date: new Date()
  });

  // Simpan balasan bot
  chatLogs.push({
    user: 'Bot',
    from: 'bot',
    text: reply,
    date: new Date()
  });

  // Kirim ke Telegram juga
  bot.sendMessage(targetChatId, reply)
    .then(() => res.status(200).json({ message: 'Terkirim dan dianalisis' }))
    .catch(err => res.status(500).json({ error: err.message }));
});

// ✅ 3. Endpoint ambil semua chat logs
app.get('/chats', (req, res) => {
  // Optional: sortir berdasarkan waktu
  chatLogs.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Optional: batasi jika terlalu panjang
  if (chatLogs.length > 200) {
    chatLogs = chatLogs.slice(-100); // Simpan 100 terakhir
  }

  res.json(chatLogs);
});

// ✅ 4. Jalankan server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
});
