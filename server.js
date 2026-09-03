const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(cors({ origin: '*' }));

let latestCaptchaData = null;

app.post('/api/receive-captcha', (req, res) => {
    latestCaptchaData = req.body;
    res.json({ status: 'success', message: 'Đã nhận dữ liệu thành công!' });
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
        <!-- Nạp thư viện qCaptcha trên Host -->
        <script src="https://api.103-141-140-153.sslip.io/api.js" async defer></script>
        <style>
            body { font-family: Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 20px; text-align: center; }
            .card { background: #fff; max-width: 500px; margin: 0 auto; padding: 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            #captcha-display { margin-top: 15px; border: 2px dashed #007bff; min-height: 250px; display: flex; justify-content: center; align-items: center; border-radius: 6px; }
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
            let currentHtml = '';
            let widgetId = null;

            async function fetchUI() {
                try {
                    const res = await fetch('/api/get-latest');
                    const data = await res.json();

                    if (data && data.htmlContent && data.htmlContent !== currentHtml) {
                        currentHtml = data.htmlContent;
                        document.getElementById('source-info').innerText = 'Đang hiển thị Captcha từ: ' + data.siteUrl;
                        
                        const displayArea = document.getElementById('captcha-display');
                        displayArea.innerHTML = data.htmlContent;

                        // Tìm container captcha trong HTML vừa nhận để render widget
                        setTimeout(() => {
                            const container = displayArea.querySelector('#qcaptcha-container') || displayArea;
                            const api = window.hcaptcha || window.qcaptcha;
                            
                            if (api && typeof api.render === 'function') {
                                try {
                                    container.innerHTML = ''; // Làm sạch container trước khi render
                                    widgetId = api.render(container, {
                                        sitekey: SITEKEY,
                                        callback: function(token) {
                                            console.log('Token thu được:', token);
                                        }
                                    });
                                } catch (err) {
                                    console.error('Lỗi render captcha:', err);
                                }
                            }
                        }, 500);
                    }
                } catch (e) {
                    console.error('Lỗi khi tải UI:', e);
                }
            }

            setInterval(fetchUI, 2000);
            fetchUI();
        </script>
    </body>
    </html>
    `);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server đang chạy trên port ${PORT}`));
