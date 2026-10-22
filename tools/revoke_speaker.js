// 撤銷發言者：node tools/revoke_speaker.js "張總"（或 speaker_id）。該發言者所有裝置的發言權限一起失效。完成後要 clasp push + 部署才生效。
const S = require('./speakers_lib'); const who = process.argv[2];
if (!who) { console.error('用法：node tools/revoke_speaker.js "<名字或 speaker_id>"'); process.exit(1); }
const L = S.load(), n = S.revoke(L, who); if (!n) { console.error('找不到有效的發言者：' + who); process.exit(2); }
S.save(L); console.log('已撤銷「' + who + '」。接著 clasp push 並部署才會生效。');
