document.addEventListener('DOMContentLoaded', () => {
    // تبديل الوضع الداكن
    const modeToggle = document.getElementById('modeToggle');
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        modeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    modeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const icon = modeToggle.querySelector('i');
        
        if (document.body.classList.contains('dark-mode')) {
            icon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('darkMode', 'enabled');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('darkMode', 'disabled');
        }
    });
    
    // إنشاء الجلسة
    const generateBtn = document.getElementById('generateBtn');
    generateBtn.addEventListener('click', generateSession);
    
    // نسخ الكود
    document.getElementById('copyBtn').addEventListener('click', () => {
        const code = document.getElementById('sessionCode').textContent;
        navigator.clipboard.writeText(code).then(() => {
            alert('تم نسخ الكود بنجاح!');
        });
    });
    
    // تنزيل الكود
    document.getElementById('downloadBtn').addEventListener('click', () => {
        const code = document.getElementById('sessionCode').textContent;
        const sessionName = document.getElementById('sessionName').value || 'whatsapp-session';
        const blob = new Blob([code], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${sessionName}.js`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
});

function generateSession() {
    const sessionName = document.getElementById('sessionName').value || 'whatsapp-session';
    const apiType = document.getElementById('apiType').value;
    const qrType = document.getElementById('qrType').value;
    
    let sessionCode = '';
    
    if (apiType === 'baileys') {
        sessionCode = `const { default: makeWASocket, useSingleFileAuthState } = require('@adiwajshing/baileys');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

// تهيئة حالة المصادقة
const { state, saveState } = useSingleFileAuthState('./${sessionName}.json');

// إنشاء اتصال واتساب
const sock = makeWASocket({
    auth: state,
    printQRInTerminal: ${qrType === 'terminal'},
    logger: console
});

// حفظ حالة الجلسة عند التحديث
sock.ev.on('creds.update', saveState);

// معالجة رسائل QR
sock.ev.on('connection.update', (update) => {
    const { qr } = update;
    if (qr) {
        ${qrType === 'web' ? 'generateQR(qr);' : 'console.log("Scan the QR code above to connect");'}
    }
});

// معالجة الرسائل الواردة
sock.ev.on('messages.upsert', ({ messages }) => {
    console.log('Received message:', messages[0].message?.conversation);
});

${qrType === 'web' ? `
// توليد QR للويب
function generateQR(qr) {
    const qrContainer = document.getElementById('qrContainer');
    qrContainer.innerHTML = '<h3>Scan QR Code:</h3>';
    QRCode.toCanvas(qr, { width: 200 }, (err, canvas) => {
        if (err) throw err;
        qrContainer.appendChild(canvas);
    });
}` : ''}
`;
    } else {
        sessionCode = `const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// إنشاء عميل واتساب
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: '${sessionName}'
    }),
    puppeteer: {
        headless: true
    },
    ${qrType === 'terminal' ? 'puppeteer: { headless: true }' : ''}
});

// معالجة رسائل QR
client.on('qr', (qr) => {
    ${qrType === 'terminal' ? 'qrcode.generate(qr, { small: true });' : 'generateQR(qr);'}
});

// عند جاهزية العميل
client.on('ready', () => {
    console.log('Client is ready!');
});

// معالجة الرسائل الواردة
client.on('message', message => {
    console.log('Received message:', message.body);
});

${qrType === 'web' ? `
// توليد QR للويب
function generateQR(qr) {
    const qrContainer = document.getElementById('qrContainer');
    qrContainer.innerHTML = '<h3>Scan QR Code:</h3>';
    QRCode.toCanvas(qr, { width: 200 }, (err, canvas) => {
        if (err) throw err;
        qrContainer.appendChild(canvas);
    });
}` : ''}

// بدء العميل
client.initialize();
`;
    }
    
    // عرض النتيجة
    document.getElementById('sessionCode').textContent = sessionCode;
    document.getElementById('resultContainer').style.display = 'block';
    
    // إذا كان نوع QR هو الويب، قم بتوليد QR وهمي كمثال
    if (qrType === 'web') {
        QRCode.toCanvas('https://wa.me/qr/EXAMPLEQRCODE', { width: 200 }, (err, canvas) => {
            if (err) throw err;
            const qrContainer = document.getElementById('qrContainer');
            qrContainer.innerHTML = '<h3>Scan QR Code:</h3>';
            qrContainer.appendChild(canvas);
        });
    } else {
        document.getElementById('qrContainer').innerHTML = '';
    }
}
