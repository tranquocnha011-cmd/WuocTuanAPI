const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(cors({ origin: '*' }));

let latestData = null;

app.post('/api/receive-captcha', (req, res) => {
    latestData = req.body;
    res.json({ status: 'success' });
});

app.get('/api/get-latest', (req, res) => {
    res.json(latestData || { message: 'Chưa có dữ liệu token' });
});

app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <title>Nhận Token qCaptcha</title>
        <style>
            body { font-family: Arial; background: #121212; color: #fff; padding: 20px; text-align: center; }
            .box { background: #1e1e1e; padding: 20px; border-radius: 8px; max-width: 400px; margin: 0 auto; }
            textarea { width: 100%; height: 80px; background: #2d2d2d; color: #0f0; border: 1px solid #444; padding: 8px; border-radius: 4px; }
        </style>
    </head>
    <body>
        <div class="box">
            <h2>Trạm Nhận Token qCaptcha</h2>
            <p id="status">Đang chờ bạn giải captcha bên trang gốc...</p>
            <textarea id="token-box" readonly placeholder="Token sẽ xuất hiện ở đây..."></textarea>
        </div>
        <script>
            async function checkToken() {
                try {
                    let res = await fetch('/api/get-latest');
                    let data = await res.json();
                    if(data && data.token) {
                        document.getElementById('token-box').value = data.token;
                        document.getElementById('status').innerText = 'Đã nhận Token thành công lúc: ' + new Date(data.timestamp).toLocaleTimeString();
                    }
                } catch(e) {}
            }
            setInterval(checkToken, 1000);
        </script>
    </body>
    </html>
    `);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT);
