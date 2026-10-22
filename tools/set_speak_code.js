// 設定 / 更換「發言密碼」（團隊模式以庭彣身分發言用）。從環境變數 P007_SPEAK_CODE 讀取，只把 SHA-256 雜湊寫進 gas/Speak.gs（gitignored），不印出密碼。
// 之後：cd gas && HOME=/home/box/p007home clasp push -f，再更新部署版本。要停用發言，刪掉 gas/Speak.gs 再推一次。
const fs = require('fs'), crypto = require('crypto');
const c = (process.env.P007_SPEAK_CODE || '').replace(/\s+/g, '').toLowerCase();
if (c.length < 8 || c.length > 64) { console.error('P007_SPEAK_CODE 未設定或長度不對（去掉空白後 8～64 字）'); process.exit(1); }
const h = crypto.createHash('sha256').update('sp:' + c, 'utf8').digest('hex');
fs.writeFileSync(__dirname + '/../gas/Speak.gs', '// PRIVATE (gitignored). Hash of the 發言密碼 only.\nvar P007_SPEAK = ' + JSON.stringify({ hash: h }) + ';\n', { mode: 0o600 });
console.log('發言密碼的雜湊已寫入 gas/Speak.gs（未印出密碼）');
