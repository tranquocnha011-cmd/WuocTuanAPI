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
        <script src="https://api.103-141-140-153.sslip.io/api.js" async defer></script>
        <style>
            body { font-family: Arial, sans-serif; background: #1a1a1a; color: #fff; margin: 0; padding: 20px; display: flex; flex-direction: column; align-items: center; min-height: 100vh; }
            .status-bar { margin-bottom: 15px; text-align: center; font-size: 14px; color: #aaa; }
            #wrapper { position: relative; width: 100%; max-width: 450px; display: flex; justify-content: center; }
        </style>
    </head>
    <body>
        <div class="status-bar">
            <h2>Giao diện qCaptcha Real-time</h2>
            <p id="source-info">Đang chờ dữ liệu từ trang gốc...</p>
        </div>

        <div id="wrapper">Chưa có dữ liệu</div>

        <script>
            const SITEKEY = 'd0c97bcc-d88c-42d1-8a0c-1180bf53e2a1';
            let currentHtml = '';

            function renderWidgetIfPresent() {
                const api = window.hcaptcha || window.qcaptcha;
                const container = document.getElementById('qcaptcha-container');
                
                if (container && api && typeof api.render === 'function') {
                    // Kiểm tra nếu chưa render thì mới render
                    if (!container.hasChildNodes()) {
                        try {
                            api.render('qcaptcha-container', {
                                sitekey: SITEKEY,
                                callback: function(token) {
                                    console.log('Token thu được:', token);
                                    const tokenArea = document.getElementById('qcaptcha-token');
                                    if(tokenArea) tokenArea.value = '/qcaptcha ' + token;
                                }
                            });
                        } catch (e) {
                            console.warn('Render retry:', e);
                        }
                    }
                }
            }

            async function fetchUI() {
                try {
                    const res = await fetch('/api/get-latest');
                    const data = await res.json();

                    if (data && data.htmlContent && data.htmlContent !== currentHtml) {
                        currentHtml = data.htmlContent;
                        document.getElementById('source-info').innerText = 'Nguồn: ' + data.siteUrl;
                        
                        const wrapper = document.getElementById('wrapper');
                        wrapper.innerHTML = data.htmlContent;

                        // Đảm bảo modal hiển thị dạng tương đối trên Host
                        const modal = wrapper.querySelector('#qcaptcha-modal');
                        if (modal) {
                            modal.style.position = 'relative';
                            modal.style.top = '0';
                            modal.style.left = '0';
                            modal.style.width = '100%';
                            modal.style.height = 'auto';
                            modal.style.background = 'transparent';
                        }

                        // Gọi render captcha sau khi dán HTML
                        setTimeout(renderWidgetIfPresent, 300);
                        setTimeout(renderWidgetIfPresent, 1000);
                    }
                } catch (e) {
                    console.error('Lỗi khi tải UI:', e);
                }
            }

            setInterval(fetchUI, 1000);
            fetchUI();
        </script>
    </body>
    </html>
    `);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
