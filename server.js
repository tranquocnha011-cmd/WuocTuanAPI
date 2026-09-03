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
        <title>Host Hiển Thị UI qCaptcha Realtime</title>
        <style>
            body { font-family: Arial, sans-serif; background: #121212; color: #fff; margin: 0; padding: 20px; display: flex; flex-direction: column; align-items: center; }
            .card { background: #1e1e1e; border-radius: 12px; padding: 20px; text-align: center; max-width: 450px; width: 100%; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
            #display-area { margin-top: 15px; display: flex; justify-content: center; }
        </style>
    </head>
    <body>
        <div class="card">
            <h2>Giao diện qCaptcha Real-time</h2>
            <p id="info">Đang chờ dữ liệu từ trang gốc...</p>
            <div id="display-area">Chưa có dữ liệu</div>
        </div>

        <script>
            let lastTimestamp = '';

            async function fetchUI() {
                try {
                    const res = await fetch('/api/get-latest');
                    const data = await res.json();

                    if (data && data.htmlContent && data.timestamp !== lastTimestamp) {
                        lastTimestamp = data.timestamp;
                        document.getElementById('info').innerText = 'Nguồn: ' + data.siteUrl;
                        
                        const displayArea = document.getElementById('display-area');
                        
                        // Parse HTML nhận được
                        let parser = new DOMParser();
                        let doc = parser.parseFromString(data.htmlContent, 'text/html');
                        
                        // Tự động sửa lại domain trong iframe sang domain của Host hiện tại
                        let iframe = doc.querySelector('iframe');
                        if (iframe && iframe.src) {
                            try {
                                let urlObj = new URL(iframe.src);
                                let hashContent = decodeURIComponent(urlObj.hash);
                                if (hashContent.includes('sunwinvv.com')) {
                                    // Thay thế host trong JSON ngầm của iframe thành host hiện tại
                                    hashContent = hashContent.replace('https://sunwinvv.com', window.location.origin);
                                    urlObj.hash = encodeURIComponent(hashContent).replace(/%2C/g, ',');
                                    iframe.src = urlObj.toString();
                                }
                            } catch (err) {
                                console.error('Lỗi xử lý iframe src:', err);
                            }
                        }

                        // Hiển thị nội dung đã được vá lỗi lên Host
                        displayArea.innerHTML = '';
                        displayArea.appendChild(doc.body.firstChild);
                    }
                } catch (e) {
                    console.error('Lỗi cập nhật giao diện:', e);
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
