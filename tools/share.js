#!/usr/bin/env node
// Shares the puzzles of this repo in the Trinity Community, the same way the Trinity Workbench does
// (community-vertrag: /auth/device, /me/links, /shares). Needs Node 18 or newer, nothing else.
//
//   node tools/share.js login        sign in as a device: shows a code, you confirm it in the browser
//   node tools/share.js link         links github.com/<owner> to your account (writes .trinity-community to commit)
//   node tools/share.js share [tag]  shares every puzzle of tools/covers/covers.json at the tag (default v1);
//                                    waits when the community says "too often" and goes on (20 an hour, 100 a day)
//   node tools/share.js status       who is signed in, which namespaces are linked
//
// The device key stays in ~/.config/trinity-community/key (only you can read it) and is never printed.
// COMMUNITY_URL changes the community (default https://community.trinity-universe.com).
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const repoDir = path.resolve(__dirname, '..');
const site = (process.env.COMMUNITY_URL || 'https://community.trinity-universe.com').replace(/\/+$/, '');
const api = site + '/api/v1';
const keyFile = path.join(os.homedir(), '.config', 'trinity-community', 'key');
const sleep = ms => new Promise(r => setTimeout(r, ms));

function remote() {
  const url = execFileSync('git', ['remote', 'get-url', 'origin'], { cwd: repoDir, encoding: 'utf8' }).trim();
  const m = /github\.com[:/]([^/]+)\/([^/.]+)(\.git)?$/.exec(url);
  if (!m) throw new Error(`origin is not a GitHub repo: ${url}`);
  return { url: `https://github.com/${m[1]}/${m[2]}`, namespace: `github.com/${m[1]}` };
}
function key() {
  try { return fs.readFileSync(keyFile, 'utf8').trim(); } catch { return ''; }
}
async function call(method, route, body, { auth = true } = {}) {
  const k = auth ? key() : '';
  if (auth && !k) throw new Error('not signed in: node tools/share.js login');
  const r = await fetch(api + route, {
    method,
    headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...(k ? { authorization: 'Bearer ' + k } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await r.json(); } catch { data = null; }
  return { status: r.status, body: data };
}

async function login() {
  const b = await call('POST', '/auth/device/begin', { name: 'community-puzzles (share script)' }, { auth: false });
  if (b.status !== 201) throw new Error(`begin: ${b.status} ${JSON.stringify(b.body)}`);
  console.log(`Open ${b.body.url} and confirm the code ${b.body.code} (valid ${b.body.minutes} minutes).`);
  const until = Date.now() + b.body.minutes * 60000;
  while (Date.now() < until) {
    await sleep(4000);
    const t = await call('POST', '/auth/device/take', { ticket: b.body.ticket }, { auth: false });
    if (t.status === 202) continue;
    if (t.status !== 200) throw new Error(`take: ${t.status} ${JSON.stringify(t.body)}`);
    fs.mkdirSync(path.dirname(keyFile), { recursive: true, mode: 0o700 });
    fs.writeFileSync(keyFile, t.body.key + '\n', { mode: 0o600 });
    console.log(`Signed in as @${t.body.me && t.body.me.handle}. Key kept in ${keyFile}.`);
    return;
  }
  throw new Error('the code was not confirmed in time');
}

async function status() {
  if (!key()) { console.log('Not signed in: node tools/share.js login'); return; }
  const me = await call('GET', '/me');
  if (me.status !== 200) { console.log('Not signed in.'); return; }
  console.log(`Signed in as @${me.body.handle}.`);
  const l = await call('GET', '/me/links');
  for (const x of (l.body && l.body.links) || []) console.log(`  ${x.namespace}: ${x.state}`);
}

async function link() {
  const { url, namespace } = remote();
  const mine = await call('GET', '/me/links');
  if (mine.status !== 200) throw new Error(`links: ${mine.status} ${JSON.stringify(mine.body)}`);
  let l = mine.body.links.find(x => x.namespace === namespace);
  if (!l) {
    const n = await call('POST', '/me/links', { url });
    if (n.status !== 201 && n.status !== 200) throw new Error(`link: ${n.status} ${JSON.stringify(n.body)}`);
    l = n.body;
  }
  if (l.state === 'verified') { console.log(`${namespace} is linked.`); return; }
  const proof = path.join(repoDir, l.proof.file);
  if (!fs.existsSync(proof) || fs.readFileSync(proof, 'utf8').trim() !== l.proof.content) {
    fs.writeFileSync(proof, l.proof.content + '\n');
    console.log(`Wrote ${l.proof.file}. Commit and push it, then run "node tools/share.js link" again.`);
    return;
  }
  const c = await call('POST', `/me/links/${l.id}/check`, { url });
  if (c.status === 200 && c.body.state === 'verified') console.log(`${namespace} is linked.`);
  else console.log(`Not yet: ${JSON.stringify(c.body && (c.body.problem || c.body.error || c.body.state))}. Is ${l.proof.file} pushed?`);
}

async function share(tag) {
  const { url } = remote();
  const list = JSON.parse(fs.readFileSync(path.join(__dirname, 'covers', 'covers.json'), 'utf8'));
  let done = 0;
  for (const p of list) {
    for (;;) {
      const r = await call('POST', '/shares', { url, path: p.path, tag });
      if (r.status === 201 || r.status === 200) { done++; console.log(`${r.status === 201 ? 'shared ' : 'known  '} ${p.path} -> ${site}/@${r.body.by}/${url.split('/').pop()}/${r.body.name}`); break; }
      if (r.status === 429) {
        const min = (r.body && r.body.minutes) || 10;
        console.log(`  the community says too often: waiting ${min} minutes (${done}/${list.length} done)`);
        await sleep((min + 1) * 60000);
        continue;
      }
      if (r.status === 503) { await sleep(30000); continue; }
      console.log(`failed  ${p.path}: ${r.status} ${JSON.stringify(r.body)}`);
      break;
    }
  }
  console.log(`${done}/${list.length} shared at ${tag}.`);
}

const [cmd, arg] = process.argv.slice(2);
const run = { login, link, status, share: () => share(arg || 'v1') }[cmd];
if (!run) { console.log('node tools/share.js login | link | share [tag] | status'); process.exit(1); }
run().catch(e => { console.error(e.message); process.exit(1); });
