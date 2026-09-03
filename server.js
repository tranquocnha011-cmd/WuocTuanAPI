const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(cors({ origin: '*' }));

let latestCaptchaData = null;

app.post('/api/receive-captcha', (req, res) => {
    latestCaptchaData = req.body;
    res.json({ status: 'success', message: 'Đã nhận ảnh!' });
});

app.get('/api/get-latest', (req, res) => {
    res.json(latestCaptchaData || { message: 'Chưa có dữ liệu' });
});

app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Host Hiển Thị UI qCaptcha Realtime</title>
        <style>
            body { font-family: Arial, sans-serif; background: #181818; color: #fff; margin: 0; padding: 20px; display: flex; flex-direction: column; align-items: center; }
            .card { background: #222; border-radius: 12px; padding: 20px; text-align: center; max-width: 450px; width: 100%; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
            #img-container { margin-top: 15px; border: 2px dashed #007bff; border-radius: 8px; min-height: 250px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
            #captcha-img { max-width: 100%; height: auto; display: none; border-radius: 6px; }
        </style>
    </head>
    <body>
        <div class="card">
            <h2>Giao diện qCaptcha Real-time</h2>
            <p id="info">Đang chờ dữ liệu...</p>
            <div id="img-container">
                <span id="loading-text">Chưa có ảnh Captcha</span>
                <img id="captcha-img" src="" alt="qCaptcha Live" />
            </div>
        </div>

        <script>
            let lastTimestamp = '';
            async function fetchCaptcha() {
                try {
                    const res = await fetch('/api/get-latest');
                    const data = await res.json();

                    if (data && data.image && data.timestamp !== lastTimestamp) {
                        lastTimestamp = data.timestamp;
                        document.getElementById('info').innerText = 'Nguồn: ' + data.siteUrl + ' (' + new Date(data.timestamp).toLocaleTimeString() + ')';
                        const img = document.getElementById('captcha-img');
                        img.src = data.image;
                        img.style.display = 'block';
                        document.getElementById('loading-text').style.display = 'none';
                    }
                } catch (e) {
                    console.error('Lỗi tải captcha:', e);
                }
            }

            setInterval(fetchCaptcha, 1000);
            fetchCaptcha();
        </script>
    </body>
    </html>
    `);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
