const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
// Bật CORS để nhận dữ liệu từ mọi web khác
app.use(cors({ origin: '*' }));

app.get('/', (req, res) => {
  res.send('Server WuocTuanAPI đang hoạt động!');
});

// API nhận Captcha/UI
app.post('/api/receive-captcha', (req, res) => {
  console.log('Dữ liệu nhận được:', req.body);
  res.json({ status: 'success', message: 'Đã nhận thành công!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
