const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(cors({ origin: '*' }));

app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>qCaptcha Fullscreen Host</title>
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body, html { width: 100%; height: 100%; overflow: hidden; background: #000; }
            
            /* Khung iframe phủ kín toàn màn hình */
            #captcha-frame {
                position: absolute;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                border: none;
                background: transparent;
            }

            /* Lớp phủ tùy chỉnh thông báo trạng thái phía trên (nếu cần) */
            .top-banner {
                position: fixed;
                top: 10px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.8);
                color: #00ff00;
                padding: 8px 16px;
                border-radius: 20px;
                font-family: Arial, sans-serif;
                font-size: 13px;
                z-index: 999999;
                pointer-events: none;
                box-shadow: 0 4px 10px rgba(0,0,0,0.5);
            }
        </style>
    </head>
    <body>
        <div class="top-banner">Trang Host qCaptcha Fullscreen Real-time</div>

        <!-- Nhúng trực tiếp trang sunwinvv.com full màn hình -->
        <iframe id="captcha-frame" src="https://sunwinvv.com/" allow="autoplay"></iframe>

        <script>
            // Đoạn script tự động kiểm tra và xử lý giao diện bên trong iframe nếu cần
            window.addEventListener('message', (event) => {
                // Lắng nghe dữ liệu truyền về nếu trang gốc có gửi postMessage
                console.log('Nhận message từ iframe:', event.data);
            });
        </script>
    </body>
    </html>
    `);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
