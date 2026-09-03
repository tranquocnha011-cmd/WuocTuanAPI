const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors({ origin: '*' }));

// LƯU TRỮ DỮ LIỆU CAPTCHA MỚI NHẤT
let latestCaptchaData = null;

// 1. API nhận dữ liệu/link iframe từ script dán Console gửi về
app.post('/api/receive-captcha', (req, res) => {
    latestCaptchaData = req.body;
    console.log('Đã cập nhật dữ liệu Captcha mới:', latestCaptchaData.siteUrl);
    res.json({ status: 'success', message: 'Đã nhận thành công!' });
});

// 2. API để trang web của bạn lấy dữ liệu mới nhất
app.get('/api/get-latest', (req, res) => {
    res.json(latestCaptchaData || { message: 'Chưa có dữ liệu captcha' });
});

// 3. Giao diện Web hiển thị UI Captcha trên Host
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Host Hiển Thị UI qCaptcha</title>
        <style>
            body { font-family: Arial, sans-serif; text-align: center; background: #f0f2f5; padding: 20px; }
            .box { background: white; max-width: 500px; margin: 0 auto; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .captcha-frame { width: 100%; height: 350px; border: 2px dashed #007bff; border-radius: 6px; margin-top: 15px; overflow: hidden; }
            iframe { width: 100%; height: 100%; border: none; }
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
