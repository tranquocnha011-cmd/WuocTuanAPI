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
        <title>Host Hiển Thị UI qCaptcha</title>
        <style>
            body { font-family: Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 20px; text-align: center; }
            .card { background: #fff; max-width: 500px; margin: 0 auto; padding: 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            #captcha-display { margin-top: 15px; border: 2px dashed #007bff; min-height: 350px; display: flex; justify-content: center; align-items: center; border-radius: 6px; }
        </style>
    </head>
    <body>
        <div class="card">
            <h2>Giao diện qCaptcha Real-time</h2>
            <p id="source-info">Đang tải dữ liệu từ trang gốc...</p>
            <div id="captcha-display">Chưa có dữ liệu</div>
        </div>

        <script>
            const SITEKEY = 'd0c97bcc-d88c-42d1-8a0c-1180bf53e2a1';
            const SCRIPT_URL = 'https://api.103-141-140-153.sslip.io/api.js';
            let currentHtml = '';
            let isScriptLoaded = false;

            // Hàm chủ động nạp Script Captcha
            function loadCaptchaScript(callback) {
                if (window.hcaptcha || window.qcaptcha) {
                    isScriptLoaded = true;
                    callback();
                    return;
                }
                const script = document.createElement('script');
                script.src = SCRIPT_URL;
                script.async = true;
                script.defer = true;
                script.onload = () => {
                    isScriptLoaded = true;
                    callback();
                };
                document.head.appendChild(script);
            }

            function renderCaptchaInsideContainer(container) {
                const api = window.hcaptcha || window.qcaptcha;
                if (api && typeof api.render === 'function') {
                    try {
                        container.innerHTML = ''; // Làm sạch ô trống
                        api.render(container, {
                            sitekey: SITEKEY,
                            callback: function(token) {
                                console.log('Token thu được:', token);
                            }
                        });
                    } catch (e) {
                        console.error('Lỗi khi render qCaptcha:', e);
                    }
                }
            }

            async function fetchUI() {
                try {
                    const res = await fetch('/api/get-latest');
                    const data = await res.json();

                    if (data && data.htmlContent && data.htmlContent !== currentHtml) {
                        currentHtml = data.htmlContent;
                        document.getElementById('source-info').innerText = 'Đang hiển thị Captcha từ: ' + data.siteUrl;
                        
                        const displayArea = document.getElementById('captcha-display');
                        displayArea.innerHTML = data.htmlContent;

                        // Tìm đúng vùng chứa captcha để nạp widget
                        const container = displayArea.querySelector('#qcaptcha-container');
                        if (container) {
                            loadCaptchaScript(() => {
                                setTimeout(() => renderCaptchaInsideContainer(container), 300);
                            });
                        }
                    }
                } catch (e) {
                    console.error('Lỗi khi tải UI:', e);
                }
            }

            setInterval(fetchUI, 1500);
            fetchUI();
        </script>
    </body>
    </html>
    `);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server đang chạy trên port ${PORT}`));
