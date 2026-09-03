const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(cors({ origin: '*' }));

let latestCaptchaData = null;

app.post('/api/receive-captcha', (req, res) => {
    latestCaptchaData = req.body;
    res.json({ status: 'success', message: 'Đã nhận dữ liệu!' });
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
        <!-- Nạp SDK qCaptcha trực tiếp trên Host -->
        <script src="https://api.103-141-140-153.sslip.io/api.js" async defer></script>
        <style>
            body { font-family: Arial, sans-serif; background: #121212; color: #fff; margin: 0; padding: 20px; display: flex; flex-direction: column; align-items: center; }
            .card { background: #1e1e1e; border-radius: 12px; padding: 20px; text-align: center; max-width: 450px; width: 100%; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
            #render-area { margin-top: 15px; }
        </style>
    </head>
    <body>
        <div class="card">
            <h2>Giao diện qCaptcha Real-time</h2>
            <p id="info">Đang chờ dữ liệu từ trang gốc...</p>
            <div id="render-area">Đang tải khung xác thực...</div>
        </div>

        <script>
            const SITEKEY = 'd0c97bcc-d88c-42d1-8a0c-1180bf53e2a1';
            let lastTimestamp = '';

            async function syncCaptchaUI() {
                try {
                    const res = await fetch('/api/get-latest');
                    const data = await res.json();

                    if (data && data.htmlContent && data.timestamp !== lastTimestamp) {
                        lastTimestamp = data.timestamp;
                        document.getElementById('info').innerText = 'Nguồn: ' + data.siteUrl;

                        const renderArea = document.getElementById('render-area');
                        renderArea.innerHTML = data.htmlContent;

                        // Đợi SDK qCaptcha sẵn sàng rồi render vào container
                        let checkInterval = setInterval(() => {
                            const api = window.hcaptcha || window.qcaptcha;
                            const container = document.getElementById('qcaptcha-container');
                            
                            if (api && typeof api.render === 'function' && container) {
                                clearInterval(checkInterval);
                                try {
                                    container.innerHTML = ''; // Xóa sạch lỗi cũ nếu có
                                    api.render(container, {
                                        sitekey: SITEKEY,
                                        callback: function(token) {
                                            console.log('Token thành công:', token);
                                            const tokenArea = document.getElementById('qcaptcha-token');
                                            if(tokenArea) {
                                                tokenArea.value = '/qcaptcha ' + token;
                                                tokenArea.style.display = 'block';
                                            }
                                        }
                                    });
                                } catch (err) {
                                    console.error('Lỗi khi gọi api.render:', err);
                                }
                            }
                        }, 300);
                    }
                } catch (e) {
                    console.error('Lỗi đồng bộ:', e);
                }
            }

            setInterval(syncCaptchaUI, 1500);
            syncCaptchaUI();
        </script>
    </body>
    </html>
    `);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
