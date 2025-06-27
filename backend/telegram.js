require('dotenv').config();
const { Telegraf } = require('telegraf');
const Sentiment = require('sentiment');
const express = require('express');
const cors = require('cors');

// === KONFIGURASI ===
const app = express();
app.use(cors());
app.use(express.json());

const sentiment = new Sentiment();
const token = process.env.BOT_TOKEN || '7919715969:AAEL6YxFPysmh4jngTgMwIAfO_YoPZCDV-0'; // amanin token dari env
const bot = new Telegraf(token);

let chatLogs = [];

// === BALASAN OTOMATIS ===
const autoReplies = [
  { pattern: /apa kabar/i, response: "Kabar baik, ada yang bisa saya bantu?" },
  { pattern: /hallo/i, response: "Hallo, ada yang bisa saya bantu?" },
  { pattern: /siapa kamu/i, response: "Saya chatbot pintar yang dibuat untuk membantu Irfan." },
  { pattern: /siapa anda/i, response: "Saya chatbot pintar yang dibuat untuk membantu Irfan." },
  { pattern: /bisa bantu apa/i, response: "Saya bisa bantu menjawab pertanyaan dan klasifikasi sentimen pesan kamu." },
  { pattern: /terima kasih|terimakasih/i, response: "Sama-sama 😊" },

  // Tambahan untuk kata positif & negatif
  { pattern: /bad|jelek|buruk|kau anjing/i, response: "Mohon maaf jika ada yang kurang berkenan 😔" },
  { pattern: /nice|bagus|baik/i, response: "Terima kasih! Senang bisa membantu 😊" }
];

// === FUNGSI SIMPAN CHAT ===
function simpanLog(user, from, text, classification) {
  chatLogs.push({
    user,
    from,
    text,
    classification,
    date: new Date()
  });
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

  // Simpan log user dan bot
  simpanLog(username, 'telegram', text, userClassification);
  simpanLog('Bot', 'bot', reply, botClassification);

  ctx.reply(reply);
});

// === ENDPOINT FRONTEND UNTUK KIRIM PESAN ===
app.post('/send-message', (req, res) => {
  const { text } = req.body;
  const targetChatId = 6447173930; // Ubah sesuai chat ID tujuan

  // Sentimen pesan dari user
  const userResult = sentiment.analyze(text);
  let userClassification = 'Netral';
  if (userResult.score > 0) userClassification = 'Positif';
  else if (userResult.score < 0) userClassification = 'Negatif';

  // Cari balasan otomatis
  const matched = autoReplies.find(rule => rule.pattern.test(text));
  const reply = matched
    ? matched.response
    : "Maaf, saya belum paham maksud Anda.";

  // Sentimen balasan dari bot
  const botResult = sentiment.analyze(reply);
  let botClassification = 'Netral';
  if (botResult.score > 0) botClassification = 'Positif';
  else if (botResult.score < 0) botClassification = 'Negatif';

  // Simpan ke log
  simpanLog('Irfan', 'sender', text, userClassification);
  simpanLog('Bot', 'bot', reply, botClassification);

  // Kirim ke Telegram
  bot.telegram.sendMessage(targetChatId, reply)
    .then(() => res.status(200).json({ message: 'Terkirim dan dianalisis' }))
    .catch(err => res.status(500).json({ error: err.message }));
});

// === ENDPOINT UNTUK FRONTEND MENGAMBIL CHAT ===
app.get('/chats', (req, res) => {
  chatLogs.sort((a, b) => new Date(a.date) - new Date(b.date));
  if (chatLogs.length > 200) {
    chatLogs = chatLogs.slice(-100); // Batasi hanya 100 terakhir
  }
  res.json(chatLogs);
});
// Hapus semua chat
app.delete('/chats', (req, res) => {
  chatLogs = [];
  res.json({ message: 'Semua chat berhasil dihapus' });
});

// === JALANKAN SERVER ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
});

bot.launch();
