const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(cors({ origin: '*' }));

let latestCaptchaData = null;

// API nhận HTML Modal từ client
app.post('/api/receive-captcha', (req, res) => {
    latestCaptchaData = req.body;
    console.log('Đã cập nhật dữ liệu Captcha mới lúc:', new Date().toLocaleTimeString());
    res.json({ status: 'success', message: 'Đã nhận thành công!' });
});

// API lấy dữ liệu captcha mới nhất
app.get('/api/get-latest', (req, res) => {
    res.json(latestCaptchaData || { message: 'Chưa có dữ liệu' });
});

// Trang Dashboard hiển thị trực tiếp UI
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>qCaptcha Live Mirror</title>
        <style>
            body { font-family: Arial, sans-serif; background: #222; color: #fff; margin: 0; padding: 20px; display: flex; flex-direction: column; align-items: center; }
            .header { margin-bottom: 20px; text-align: center; }
            #captcha-display { background: #fff; color: #000; padding: 20px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); display: inline-block; min-width: 300px; text-align: center; }
        </style>
    </head>
    <body>
        <div class="header">
            <h2>Giao diện qCaptcha Live</h2>
            <p id="source-info">Đang chờ dữ liệu...</p>
        </div>

        <div id="captcha-display">
            <p>Chưa có dữ liệu Captcha</p>
        </div>

        <script>
            let currentHtml = '';
            async function fetchCaptchaUI() {
                try {
                    const response = await fetch('/api/get-latest');
                    const data = await response.json();

                    if (data && data.htmlContent && data.htmlContent !== currentHtml) {
                        currentHtml = data.htmlContent;
                        document.getElementById('source-info').innerText = 'Nguồn: ' + data.siteUrl + ' (' + new Date(data.timestamp).toLocaleTimeString() + ')';
                        document.getElementById('captcha-display').innerHTML = data.htmlContent;
                    }
                } catch (e) {
                    console.error('Lỗi cập nhật UI:', e);
                }
            }

            setInterval(fetchCaptchaUI, 1000);
            fetchCaptchaUI();
        </script>
    </body>
    </html>
    `);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
        </style>
    </head>
    <body>
        <div class="box">
            <h2>Giao diện qCaptcha Real-time</h2>
            <p id="status">Đang tải dữ liệu từ trang gốc...</p>
            <div class="captcha-frame" id="frame-container">
                <!-- Iframe hiển thị captcha sẽ được chèn vào đây -->
            </div>
        </div>

        <script>
            async function updateUI() {
                try {
                    const res = await fetch('/api/get-latest');
                    const data = await res.json();
                    
                    if (data && (data.iframeSrc || data.siteUrl)) {
                        document.getElementById('status').innerText = 'Đang hiển thị Captcha từ: ' + data.siteUrl;
                        
                        const container = document.getElementById('frame-container');
                        // Nếu có link iframe trực tiếp của qCaptcha thì nhúng link đó, nếu không thì nhúng trang web gốc
                        const targetUrl = data.iframeSrc || data.siteUrl;
                        
                        if (container.getAttribute('data-src') !== targetUrl) {
                            container.setAttribute('data-src', targetUrl);
                            container.innerHTML = '<iframe src="' + targetUrl + '"></iframe>';
                        }
                    }
                } catch (e) {
                    console.error('Lỗi tải UI:', e);
                }
            }

            // Cập nhật lại UI mỗi 2 giây
            setInterval(updateUI, 2000);
            updateUI();
        </script>
    </body>
    </html>
    `);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
