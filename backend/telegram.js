const { Telegraf } = require('telegraf');
const Sentiment = require('sentiment');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const sentiment = new Sentiment();
const token = '7919715969:AAEL6YxFPysmh4jngTgMwIAfO_YoPZCDV-0'; // ← ganti dengan token asli
const bot = new Telegraf(token);

let chatLogs = [];

const autoReplies = [
  { pattern: /apa kabar/i, response: "Kabar baik, ada yang bisa saya bantu?" },
  { pattern: /siapa kamu/i, response: "Saya chatbot pintar yang dibuat untuk membantu Irfan." },
  { pattern: /bisa bantu apa/i, response: "Saya bisa bantu menjawab pertanyaan dan klasifikasi sentimen pesan kamu." },
  { pattern: /terima kasih/i, response: "Sama-sama 😊" }
];

function simpanLog(user, textIn, textOut, classification) {
  const now = new Date();
  chatLogs.push(
    { user, from: 'telegram', text: textIn, classification, date: now },
    { user: 'Bot', from: 'bot', text: textOut, classification, date: now }
  );
}

bot.on('text', (ctx) => {
  const text = ctx.message.text;
  const username = ctx.from.username || ctx.from.first_name || 'Pengguna';
  const result = sentiment.analyze(text);
  let classification = 'Netral';
  if (result.score > 0) classification = 'Positif';
  else if (result.score < 0) classification = 'Negatif';

  const matched = autoReplies.find(rule => rule.pattern.test(text));
  const reply = matched
    ? `${matched.response}\n\n(Pesan Anda diklasifikasikan sebagai: ${classification})`
    : `Pesan Anda diklasifikasikan sebagai: ${classification}`;

  ctx.reply(reply);
  simpanLog(username, text, reply, classification);
});

// Endpoint dari React
app.post('/send-message', (req, res) => {
  const { text } = req.body;
  const targetChatId = 6447173930;

  const result = sentiment.analyze(text);
  let classification = 'Netral';
  if (result.score > 0) classification = 'Positif';
  else if (result.score < 0) classification = 'Negatif';

  const matched = autoReplies.find(rule => rule.pattern.test(text));
  const reply = matched
    ? `${matched.response}\n\n(Pesan Anda diklasifikasikan sebagai: ${classification})`
    : `Pesan Anda diklasifikasikan sebagai: ${classification}`;

  // Tambahkan log Irfan (pengirim dari React)
  chatLogs.push(
    { user: 'Irfan', from: 'sender', text, classification: null, date: new Date() },
    { user: 'Bot', from: 'bot', text: reply, classification, date: new Date() }
  );

  bot.telegram.sendMessage(targetChatId, reply)
    .then(() => res.status(200).json({ message: 'Terkirim dan dianalisis' }))
    .catch(err => res.status(500).json({ error: err.message }));
});

app.get('/chats', (req, res) => {
  chatLogs.sort((a, b) => new Date(a.date) - new Date(b.date));
  if (chatLogs.length > 200) chatLogs = chatLogs.slice(-100);
  res.json(chatLogs);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
});
bot.launch();
