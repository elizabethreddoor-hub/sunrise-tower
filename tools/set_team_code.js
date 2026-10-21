// Set / rotate the 團隊觀看碼. Reads P007_TEAM_VIEW_CODE from env, writes ONLY its SHA-256 (+ a new epoch, which revokes all old device tokens)
// to gas/TeamView.gs (gitignored). Never prints the code. Then: cd gas && HOME=/home/box/p007home clasp push -f && clasp deploy -i <id>.
const fs = require('fs'), crypto = require('crypto');
const raw = process.env.P007_TEAM_VIEW_CODE || '', c = raw.replace(/\s+/g, '').toLowerCase();
if (c.length < 4 || c.length > 64) { console.error('P007_TEAM_VIEW_CODE missing or bad length (4..64 after removing spaces)'); process.exit(1); }
const h = crypto.createHash('sha256').update('tv:' + c, 'utf8').digest('hex'), epoch = Date.now();
fs.writeFileSync(__dirname + '/../gas/TeamView.gs', '// PRIVATE (gitignored). Hash of the team view code; new epoch = all old tokens revoked.\nvar P007_TV = ' + JSON.stringify({ hash: h, epoch }) + ';\n', { mode: 0o600 });
console.log('team view code hash written, epoch ' + epoch + ' (old tokens revoked after deploy)');
