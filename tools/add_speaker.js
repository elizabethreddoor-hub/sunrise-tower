// 新增發言者：node tools/add_speaker.js "張總" P007_SPEAK_CODE_ZHANG
// 第二個參數是「環境變數的名字」，密碼從那個環境變數讀，不會印出。完成後要 clasp push + 部署才生效。
const S = require('./speakers_lib'); const [name, envName] = process.argv.slice(2);
if (!name || !envName || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(envName)) { console.error('用法：node tools/add_speaker.js "<名字>" <環境變數名稱>'); process.exit(1); }
const code = process.env[envName]; if (!code) { console.error('環境變數 ' + envName + ' 沒有設定'); process.exit(1); }
const L = S.load(), r = S.add(L, name, code); if (!r.ok) { console.error('沒有新增：' + r.error); process.exit(2); }
S.save(L); console.log('已新增發言者「' + name + '」（' + r.speaker_id + '），只存雜湊。接著 clasp push 並部署才會生效。');
