<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>qCaptcha Tool</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            background: #1a1a2e;
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
        }
        #loading {
            color: white;
            text-align: center;
            padding: 40px;
        }
        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #007bff;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        #modal-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 999999;
            display: none;
            justify-content: center;
            align-items: center;
            background: rgba(0,0,0,0.8);
            padding: 20px;
        }
        .modal-box {
            background: white;
            border-radius: 16px;
            padding: 30px 25px;
            max-width: 500px;
            width: 100%;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            animation: fadeIn 0.3s ease;
            position: relative;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        .modal-box h2 {
            margin: 0 0 5px;
            color: #333;
        }
        .modal-box .sub-title {
            color: #888;
            font-size: 13px;
            margin-bottom: 15px;
            font-style: italic;
        }
        .modal-box .sub-title span {
            color: #007bff;
            font-weight: bold;
        }
        .modal-box p {
            color: #666;
            font-size: 14px;
            margin-bottom: 15px;
        }
        #captcha-container {
            min-height: 100px;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 10px 0;
        }
        #token-area {
            width: 100%;
            margin-top: 10px;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 6px;
            font-size: 13px;
            word-break: break-all;
            display: none;
            min-height: 60px;
            resize: vertical;
            background: #f9f9f9;
        }
        #status {
            margin: 10px 0;
            font-weight: bold;
            font-size: 14px;
            min-height: 24px;
            color: #333;
        }
        .btn-group {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            justify-content: center;
            margin-top: 15px;
        }
        .btn-group button {
            padding: 10px 18px;
            border: none;
            border-radius: 6px;
            font-weight: bold;
            cursor: pointer;
            flex: 1 0 100px;
            font-size: 14px;
        }
        .btn-yellow { background: #ffc107; color: #333; }
        .btn-green { background: #28a745; color: white; }
        .btn-blue { background: #007bff; color: white; }
        .btn-red { background: #dc3545; color: white; }
        .btn-yellow:hover { background: #e0a800; }
        .btn-green:hover { background: #1e7e34; }
        .btn-blue:hover { background: #0056b3; }
        .btn-red:hover { background: #b02a37; }
    </style>
</head>
<body>

    <div id="loading">
        <div class="spinner"></div>
        <p>Đang tải xác thực...</p>
        <p style="font-size:12px; color:#888; margin-top:10px;">by <strong style="color:#007bff;">userWuocTuan</strong></p>
    </div>

    <div id="modal-container">
        <div class="modal-box">
            <h2>Xác thực Qcaptcha</h2>
            <div class="sub-title">✨ by <span>@Botlaymachamnet_bot</span> ✨</div>
            <p>Hoàn thành captcha để lấy token</p>
            <div id="captcha-container"></div>
            <textarea id="token-area" readonly placeholder="Token sẽ hiện ở đây..."></textarea>
            <div id="status"></div>
            <div class="btn-group">
                <button class="btn-yellow" id="verifyBtn">✅ Xác nhận</button>
                <button class="btn-green" id="copyBtn">📋 Copy Mã</button>
                <button class="btn-blue" id="reloadBtn">🔄 Reload</button>
                <button class="btn-red" id="closeBtn">❌ Đóng</button>
            </div>
        </div>
    </div>

    <script>
        (function() {
            const SITEKEY = 'd0c97bcc-d88c-42d1-8a0c-1180bf53e2a1';
            const SCRIPT_URL = 'https://api.103-141-140-153.sslip.io/api.js';
            const COMMAND_PREFIX = '/qcaptcha'; // Đã sửa đúng lệnh

            let widgetId = null;
            let currentToken = '';

            const modal = document.getElementById('modal-container');
            const loading = document.getElementById('loading');
            const container = document.getElementById('captcha-container');
            const tokenArea = document.getElementById('token-area');
            const status = document.getElementById('status');

            function showModal() {
                loading.style.display = 'none';
                modal.style.display = 'flex';
            }

            function loadCaptcha() {
                const api = window.hcaptcha || window.qcaptcha;
                if (api && typeof api.render === 'function') {
                    renderWidget(api);
                    showModal();
                    return;
                }

                const script = document.createElement('script');
                script.src = SCRIPT_URL;
                script.async = true;
                script.defer = true;
                script.onload = function() {
                    setTimeout(() => {
                        const apiAfter = window.hcaptcha || window.qcaptcha;
                        if (apiAfter && typeof apiAfter.render === 'function') {
                            renderWidget(apiAfter);
                            showModal();
                        } else {
                            status.textContent = '❌ Không tải được captcha.';
                            showModal();
                        }
                    }, 500);
                };
                script.onerror = function() {
                    status.textContent = '❌ Lỗi kết nối captcha.';
                    showModal();
                };
                document.head.appendChild(script);
            }

            function renderWidget(api) {
                try {
                    container.innerHTML = '';
                    widgetId = api.render(container, {
                        sitekey: SITEKEY,
                        callback: function(token) {
                            handleAutoCopyAndReload(token);
                        },
                        'expired-callback': function() {
                            currentToken = '';
                            status.textContent = '⚠️ Mã hết hạn, đang tải lại...';
                            setTimeout(reloadCaptcha, 500);
                        },
                        'error-callback': function() {
                            currentToken = '';
                            status.textContent = '❌ Lỗi xác thực, đang tải lại...';
                            setTimeout(reloadCaptcha, 500);
                        }
                    });
                } catch (e) {
                    status.textContent = '❌ Lỗi: ' + e.message;
                }
            }

            function handleAutoCopyAndReload(token) {
                currentToken = token;
                const command = `${COMMAND_PREFIX} ${currentToken}`;

                tokenArea.value = command;
                tokenArea.style.display = 'block';
                status.textContent = '✅ Đã copy lệnh vào clipboard!';

                copyToClipboard(command)
                    .then(() => {
                        setTimeout(reloadCaptcha, 1000);
                    })
                    .catch(err => {
                        console.error('Copy thất bại:', err);
                        setTimeout(reloadCaptcha, 1000);
                    });
            }

            function reloadCaptcha() {
                currentToken = '';
                tokenArea.value = '';
                tokenArea.style.display = 'none';
                status.textContent = '🔄 Đang tải lại...';

                const api = window.hcaptcha || window.qcaptcha;
                if (api && widgetId != null && typeof api.reset === 'function') {
                    try {
                        api.reset(widgetId);
                        status.textContent = '✅ Đã tải lại, vui lòng xác thực.';
                    } catch (e) {
                        container.innerHTML = '';
                        renderWidget(api);
                        status.textContent = '✅ Đã tải lại, vui lòng xác thực.';
                    }
                } else {
                    container.innerHTML = '';
                    loadCaptcha();
                }
            }

            function copyToClipboard(text) {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    return navigator.clipboard.writeText(text);
                } else {
                    return new Promise((resolve, reject) => {
                        try {
                            const ta = document.createElement('textarea');
                            ta.value = text;
                            ta.style.position = 'fixed';
                            ta.style.top = '0';
                            ta.style.left = '0';
                            ta.style.opacity = '0';
                            document.body.appendChild(ta);
                            ta.focus();
                            ta.select();
                            const successful = document.execCommand('copy');
                            document.body.removeChild(ta);
                            if (successful) {
                                resolve();
                            } else {
                                reject(new Error('Fallback copy failed'));
                            }
                        } catch (err) {
                            reject(err);
                        }
                    });
                }
            }

            document.getElementById('verifyBtn').addEventListener('click', function() {
                const api = window.hcaptcha || window.qcaptcha;
                if (!currentToken && api && typeof api.getResponse === 'function' && widgetId != null) {
                    try {
                        currentToken = api.getResponse(widgetId);
                    } catch (e) {}
                }
                if (currentToken) {
                    const cmd = `${COMMAND_PREFIX} ${currentToken}`;
                    tokenArea.value = cmd;
                    tokenArea.style.display = 'block';
                    status.textContent = '✅ Đã copy lệnh vào clipboard!';
                    copyToClipboard(cmd);
                } else {
                    status.textContent = '❌ Chưa có mã, hoàn thành captcha trước.';
                }
            });

            document.getElementById('copyBtn').addEventListener('click', function() {
                if (currentToken) {
                    const cmd = `${COMMAND_PREFIX} ${currentToken}`;
                    copyToClipboard(cmd);
                    status.textContent = '✅ Đã copy lệnh vào clipboard!';
                } else {
                    status.textContent = '❌ Chưa có mã để copy.';
                }
            });

            document.getElementById('reloadBtn').addEventListener('click', function() {
                reloadCaptcha();
            });

            document.getElementById('closeBtn').addEventListener('click', function() {
                modal.style.display = 'none';
            });

            window.addEventListener('load', function() {
                loadCaptcha();
            });
        })();
    </script>
</body>
</html>                background: rgba(0, 0, 0, 0.8);
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
