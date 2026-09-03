const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(cors({ origin: '*' }));

let latestCaptchaData = null;

app.post('/api/receive-captcha', (req, res) => {
    latestCaptchaData = req.body;
    res.json({ status: 'success', message: 'Đã nhận URL iframe!' });
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
            body { font-family: Arial, sans-serif; background: #121212; color: #fff; margin: 0; padding: 20px; display: flex; flex-direction: column; align-items: center; }
            .card { background: #1e1e1e; border-radius: 12px; padding: 20px; text-align: center; max-width: 450px; width: 100%; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
            .modal-box { background: #fff; border-radius: 8px; padding: 15px; color: #000; margin-top: 15px; }
            iframe { border: none; width: 100%; height: 100px; }
            button { width: 100%; padding: 10px; margin-top: 8px; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; color: #fff; }
            .btn-verify { background: #ffc107; color: #000; }
            .btn-copy { background: #28a745; }
            .btn-reload { background: #007bff; }
            .btn-close { background: #6c757d; }
        </style>
    </head>
    <body>
        <div class="card">
            <h2>Giao diện qCaptcha Real-time</h2>
            <p id="info">Đang chờ iframe từ trang gốc...</p>
            
            <div class="modal-box">
                <h3>Xác thực qCaptcha</h3>
                <div id="iframe-container">Đang tải widget...</div>
                <button class="btn-verify">XÁC NHẬN</button>
                <button class="btn-copy">COPY TOKEN</button>
                <button class="btn-reload">RELOAD QCAPTCHA</button>
                <button class="btn-close">ĐÓNG</button>
            </div>
        </div>

        <script>
            let lastIframeUrl = '';

            async function fetchIframe() {
                try {
                    const res = await fetch('/api/get-latest');
                    const data = await res.json();

                    if (data && data.iframeUrl && data.iframeUrl !== lastIframeUrl) {
                        lastIframeUrl = data.iframeUrl;
                        document.getElementById('info').innerText = 'Nguồn: ' + data.siteUrl;
                        
                        const container = document.getElementById('iframe-container');
                        container.innerHTML = '<iframe src="' + data.iframeUrl + '" scrolling="no"></iframe>';
                    }
                } catch (e) {
                    console.error('Lỗi nạp iframe:', e);
                }
            }

            setInterval(fetchIframe, 1000);
            fetchIframe();
        </script>
    </body>
    </html>
    `);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
