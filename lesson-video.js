/* ============================================================
   iLearn — Confident Computing lesson video engine
   Builds a long-form, narration-timed walkthrough per lesson.
   Timing is narration-driven: each beat lasts as long as it takes
   to say the line (est. ~150 wpm, with a floor), plus any practice
   "hold". With real ElevenLabs MP3s (audioUrl per beat) the runtime
   extends naturally to a full ~15-minute supported lesson.
   ============================================================ */
import { course } from './course-data.js';

/* ---------- inline-styled scene builders ---------- */
const cur = '<span style="display:inline-block;width:3px;height:1.05em;background:#1f2d3a;margin-left:2px;vertical-align:-3px;animation:azblink 1.05s steps(1) infinite"></span>';
const tb = (bg, name) => `<div class="az-tb" style="display:flex;align-items:center;justify-content:space-between;background:${bg};color:#fff;font:600 15px/1 Inter,sans-serif;padding:11px 16px">${name}<span class="x" style="letter-spacing:4px;opacity:.92;font-size:14px">&#8211;&nbsp;&#9633;&nbsp;&#10005;</span></div>`;
const fbtn = (l, k, hot, extra) => `<div data-k="${k}" style="width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;font:700 17px Georgia,serif;background:${hot ? '#cfe6ff' : '#fff'};border:1.5px solid ${hot ? '#3f8efc' : '#dce3ec'};color:#2a3b4d;${extra || ''}">${l}</div>`;
const fbtns = (hot) => { hot = hot || ''; return fbtn('B', 'B', hot.includes('B')) + fbtn('I', 'I', hot.includes('I'), 'font-style:italic') + fbtn('U', 'U', hot.includes('U'), 'text-decoration:underline') + fbtn('A', 'C', hot.includes('C'), 'color:#c0392b'); };
/* Full Home-tab ribbon with real, targetable buttons.
   opts: { size:'11', hot:'BIU C', align:'left|centre|right', bullets:bool } */
const ribbon = (o) => {
  o = o || {}; const hot = o.hot || ''; const grp = (inner) => `<div style="display:flex;align-items:center;gap:5px;padding:0 10px;border-right:1px solid #e2e8f1">${inner}</div>`;
  const rb = (l, k, on, extra) => `<div data-k="${k}" style="min-width:30px;height:30px;padding:0 6px;border-radius:7px;display:flex;align-items:center;justify-content:center;font:700 15px Georgia,serif;background:${on ? '#cfe6ff' : 'transparent'};border:1.5px solid ${on ? '#3f8efc' : 'transparent'};color:#2a3b4d;${extra || ''}">${l}</div>`;
  const sizeBox = `<div data-k="size" style="display:flex;align-items:center;gap:4px;height:30px;padding:0 8px;border:1.5px solid ${o.sizeHot ? '#3f8efc' : '#dce3ec'};border-radius:7px;background:${o.sizeHot ? '#cfe6ff' : '#fff'};font:600 14px Inter,sans-serif;color:#2a3b4d">${o.size || '11'}<span style="font-size:9px;color:#7a8a99">▾</span></div>`;
  const al = (dir, lines) => `<div data-k="al-${dir}" style="width:30px;height:30px;border-radius:7px;display:flex;flex-direction:column;justify-content:center;gap:2px;padding:0 5px;background:${o.align === dir ? '#cfe6ff' : 'transparent'};border:1.5px solid ${o.align === dir ? '#3f8efc' : 'transparent'};align-items:${dir === 'centre' ? 'center' : dir === 'right' ? 'flex-end' : 'flex-start'}">${lines.map((w) => `<span style="display:block;height:2px;width:${w}px;background:#4a5765;border-radius:2px"></span>`).join('')}</div>`;
  return `<div style="display:flex;align-items:center;padding:8px 6px;background:#f6f8fb;border-bottom:1px solid #e2e8f1">
    ${grp(sizeBox)}
    ${grp(rb('B', 'B', hot.includes('B')) + rb('I', 'I', hot.includes('I'), 'font-style:italic') + rb('U', 'U', hot.includes('U'), 'text-decoration:underline') + rb('A', 'C', hot.includes('C'), 'color:#c0392b;border-bottom:3px solid #c0392b'))}
    ${grp(`<div data-k="bullets" style="display:flex;align-items:center;gap:5px;height:30px;padding:0 7px;border-radius:7px;background:${o.bullets ? '#cfe6ff' : 'transparent'};border:1.5px solid ${o.bullets ? '#3f8efc' : 'transparent'}"><span style="display:flex;flex-direction:column;gap:3px">${[0, 1, 2].map(() => '<span style="display:flex;align-items:center;gap:4px"><span style="width:4px;height:4px;border-radius:50%;background:#4a5765"></span><span style="width:16px;height:2px;background:#8a97a4;border-radius:2px"></span></span>').join('')}</span></div>`)}
    <div style="display:flex;align-items:center;gap:3px;padding:0 8px">${al('left', [16, 12, 16, 10])}${al('centre', [16, 12, 16, 10])}${al('right', [16, 12, 16, 10])}</div>
  </div>`;
};
/* Word window that uses the full ribbon. */
const wordR = (o, page) => `<div style="width:82%;max-width:600px;background:#fff;border-radius:14px;box-shadow:0 30px 70px rgba(8,30,55,.4);overflow:hidden">${tb('#185abd', 'Document — Word')}<div style="display:flex;gap:6px;padding:7px 14px;background:#185abd;font:600 12px Inter,sans-serif"><span style="color:#fff;opacity:.75">File</span><span style="color:#fff;background:rgba(255,255,255,.2);border-radius:5px 5px 0 0;padding:2px 8px">Home</span><span style="color:#fff;opacity:.75">Insert</span><span style="color:#fff;opacity:.75">Layout</span></div>${ribbon(o)}<div style="background:#e9edf3;padding:20px;display:flex;justify-content:center"><div style="width:88%;min-height:150px;background:#fff;box-shadow:0 3px 14px rgba(0,0,0,.08);padding:24px;font:400 22px/1.5 Georgia,serif;color:#1f2d3a">${page}</div></div></div>`;
export const word = (ribbon, page) => `<div style="width:78%;max-width:560px;background:#fff;border-radius:14px;box-shadow:0 30px 70px rgba(8,30,55,.4);overflow:hidden">${tb('#185abd', 'Document — Word')}<div style="display:flex;gap:9px;padding:9px 16px;background:#f2f5f9;border-bottom:1px solid #e2e8f1">${ribbon}</div><div style="background:#e9edf3;padding:20px;display:flex;justify-content:center"><div style="width:88%;min-height:140px;background:#fff;box-shadow:0 3px 14px rgba(0,0,0,.08);padding:24px;font:400 22px/1.5 Georgia,serif;color:#1f2d3a">${page}</div></div></div>`;
/* Excel Home + Formulas ribbon with targetable buttons: Bold, £ currency, Σ AutoSum. */
const xribbon = (o) => {
  o = o || {}; const grp = (inner) => `<div style="display:flex;align-items:center;gap:5px;padding:0 10px;border-right:1px solid #e2e8f1">${inner}</div>`;
  const b = (l, k, on, extra) => `<div data-k="${k}" style="min-width:30px;height:30px;padding:0 7px;border-radius:7px;display:flex;align-items:center;gap:5px;justify-content:center;font:700 14px Inter,sans-serif;background:${on ? '#c9ecdd' : 'transparent'};border:1.5px solid ${on ? '#12a06a' : 'transparent'};color:#2a3b4d;${extra || ''}">${l}</div>`;
  const tab = (t, on) => `<span style="color:#fff;${on ? 'background:rgba(255,255,255,.22);border-radius:5px 5px 0 0' : 'opacity:.75'};padding:2px 8px">${t}</span>`;
  return `<div style="display:flex;gap:6px;padding:7px 14px;background:#107c41;font:600 12px Inter,sans-serif">${tab('File')}${tab('Home', o.tab !== 'formulas')}${tab('Insert')}${tab('Formulas', o.tab === 'formulas')}</div>
  <div style="display:flex;align-items:center;padding:8px 6px;background:#f2f7f4;border-bottom:1px solid #dce8e0">
    ${grp(b('<span style="font-family:Georgia,serif">B</span>', 'B', o.hot === 'B') + b('<span style="font-family:Georgia,serif;font-style:italic">I</span>', 'I', o.hot === 'I') + b('<span style="font-family:Georgia,serif;text-decoration:underline">U</span>', 'U'))}
    ${grp(b('£', 'money', o.hot === 'money') + b('%', 'pct'))}
    ${grp(b('&#931; AutoSum', 'autosum', o.hot === 'autosum', 'color:' + (o.hot === 'autosum' ? '#0d6a65' : '#107c41')))}
  </div>`;
};
const excelHead = (sel, formula) => `<div style="display:flex;align-items:center;gap:12px;padding:8px 16px;background:#f4f7fa;border-bottom:1px solid #e2e8f1"><div style="min-width:50px;text-align:center;font:600 14px Inter,sans-serif;color:#5b6b7d;background:#fff;border:1px solid #dbe3ec;border-radius:6px;padding:6px 8px">${sel || 'A1'}</div><div style="color:#a7b4c0;font:700 15px Inter,sans-serif">fx</div><div data-fx style="flex:1;font:400 15px Inter,sans-serif;color:#23303d">${formula || ''}</div></div>`;
const excel = (cells, sel, cls, rib) => {
  cls = cls || {}; const cols = ['A', 'B', 'C'];
  const head = '<div style="background:#eef2f7;border:1px solid #dbe3ec"></div>' + cols.map((c) => `<div style="background:#eef2f7;border:1px solid #dbe3ec;display:flex;align-items:center;justify-content:center;font:600 14px Inter,sans-serif;color:#5b6b7d;padding:7px 0">${c}</div>`).join('');
  let body = '';
  for (let r = 1; r <= 5; r++) {
    body += `<div style="background:#eef2f7;border:1px solid #dbe3ec;display:flex;align-items:center;justify-content:center;font:600 14px Inter,sans-serif;color:#5b6b7d">${r}</div>` + cols.map((c) => {
      const k = c + r, v = cells[k] || '', sl = sel === k, ex = cls[k] || '';
      const bold = r === 1 ? 'font-weight:700;' : '';
      const bg = sl ? '#e6f4f1' : ex === 'tot' ? '#fff7e6' : ex === 'sum' ? '#eaf6ff' : '#fff';
      const bd = sl ? '2px solid #1b8f8a' : '1px solid #e3e9f1';
      return `<div data-cell="${k}" style="border:${bd};background:${bg};${bold}display:flex;align-items:center;padding:7px 10px;font:400 15px Inter,sans-serif;color:#23303d;min-height:32px">${v}</div>`;
    }).join('');
  }
  return `<div style="width:78%;max-width:560px;background:#fff;border-radius:14px;box-shadow:0 30px 70px rgba(8,30,55,.4);overflow:hidden">${tb('#107c41', 'Book1 — Excel')}${xribbon(rib || {})}${excelHead(sel, (cells[sel] || ''))}<div style="display:grid;grid-template-columns:42px repeat(3,1fr);padding:13px;background:#fbfcfe">${head}${body}</div></div>`;
};
/* Excel with a NARROW column A whose data is cut off, plus a draggable column edge handle.
   phase: 'narrow' (cut off) | 'drag' (handle highlighted) | 'wide' (fixed) */
const excelWidth = (phase) => {
  const narrow = phase !== 'wide';
  const colA = narrow ? '58px' : '150px';
  const clip = narrow ? 'overflow:hidden;white-space:nowrap;text-overflow:ellipsis;' : '';
  const rows = [['bread rolls', '£2'], ['orange juice', '£3'], ['tea bags', '£4']];
  const hcell = (t, first) => `<div style="background:#eef2f7;border:1px solid #dbe3ec;position:relative;display:flex;align-items:center;justify-content:center;font:600 14px Inter,sans-serif;color:#5b6b7d;padding:7px 0">${t}${first ? `<span data-k="edge" style="position:absolute;right:-4px;top:0;bottom:0;width:8px;cursor:col-resize;display:flex;align-items:center;justify-content:center">${phase === 'drag' ? '<span style="width:3px;height:120%;background:#12857f;box-shadow:0 0 0 3px rgba(19,133,140,.25)"></span>' : '<span style="width:1px;height:100%;background:#c3cdd8"></span>'}</span>` : ''}</div>`;
  let body = '';
  rows.forEach((r, i) => {
    body += `<div style="background:#eef2f7;border:1px solid #dbe3ec;display:flex;align-items:center;justify-content:center;font:600 14px Inter,sans-serif;color:#5b6b7d">${i + 2}</div>`;
    body += `<div style="border:1px solid #e3e9f1;background:#fff;${clip}display:flex;align-items:center;padding:7px 9px;font:400 15px Inter,sans-serif;color:#23303d;min-height:32px">${r[0]}</div>`;
    body += `<div style="border:1px solid #e3e9f1;background:#fff;display:flex;align-items:center;padding:7px 9px;font:400 15px Inter,sans-serif;color:#23303d">${r[1]}</div>`;
  });
  return `<div style="width:78%;max-width:560px;background:#fff;border-radius:14px;box-shadow:0 30px 70px rgba(8,30,55,.4);overflow:hidden">${tb('#107c41', 'Book1 — Excel')}${xribbon({})}<div style="display:grid;grid-template-columns:38px ${colA} 90px;padding:14px;background:#fbfcfe;transition:grid-template-columns .5s ease">
    <div style="background:#eef2f7;border:1px solid #dbe3ec"></div>${hcell('A', true)}${hcell('B')}
    <div style="background:#eef2f7;border:1px solid #dbe3ec;display:flex;align-items:center;justify-content:center;font:600 14px Inter,sans-serif;color:#5b6b7d">1</div><div style="border:1px solid #e3e9f1;background:#fff;font-weight:700;${clip}display:flex;align-items:center;padding:7px 9px;font:700 15px Inter,sans-serif;color:#23303d">Item</div><div style="border:1px solid #e3e9f1;background:#fff;font-weight:700;display:flex;align-items:center;padding:7px 9px;font:700 15px Inter,sans-serif;color:#23303d">Cost</div>
    ${body}
  </div></div>`;
};
const deskIc = (bg, glyph, lab, key, sel) => `<div data-ic="${key}" style="width:92px;text-align:center;${sel === key ? 'background:rgba(255,255,255,.18);border-radius:10px;' : ''}padding:8px 4px"><div style="width:56px;height:56px;margin:0 auto;border-radius:12px;background:${bg};display:flex;align-items:center;justify-content:center;font:700 25px Inter,sans-serif;color:#fff;box-shadow:0 6px 16px rgba(0,0,0,.25)">${glyph}</div><div style="margin-top:7px;font:500 13px Inter,sans-serif;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.5)">${lab}</div></div>`;
const desk = (sel) => `<div style="width:88%;height:78%;border-radius:16px;background:linear-gradient(150deg,#1d5e7e,#2f8f7e);box-shadow:inset 0 0 0 1px rgba(255,255,255,.08),0 30px 70px rgba(8,30,55,.4);display:flex;gap:22px;align-items:flex-start;padding:28px">${deskIc('#5b6b7b', '&#128465;', 'Recycle', 'bin', sel)}${deskIc('#185abd', 'W', 'Word', 'w', sel)}${deskIc('#107c41', 'X', 'Excel', 'x', sel)}${deskIc('#e8a13a', '&#128193;', 'Documents', 'docs', sel)}</div>`;
const kkey = (t, flex, hot) => `<div style="flex:${flex || '0 0 auto'};min-width:38px;height:42px;display:flex;align-items:center;justify-content:center;background:${hot && hot.includes(t) ? '#1b8f8a' : '#fff'};color:${hot && hot.includes(t) ? '#fff' : '#28323d'};border-radius:8px;border:1.5px solid #dce3ec;font:600 14px Inter,sans-serif;box-shadow:0 2px 0 #d3dae3">${t}</div>`;
const krow = (inner) => `<div style="display:flex;gap:6px;justify-content:center;margin-bottom:6px">${inner}</div>`;
const keys = (hot) => `<div style="background:#eef2f6;border-radius:16px;padding:16px;box-shadow:0 30px 70px rgba(8,30,55,.4)">${krow(['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map((x) => kkey(x, 0, hot)).join('') + kkey('&#9003;', '1 1 0', hot))}${krow(['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'].map((x) => kkey(x, 0, hot)).join('') + kkey('&#9166; Enter', '1 1 0', hot))}${krow(kkey('&#8679; Shift', '1 1 0', hot) + ['Z', 'X', 'C', 'V', 'B', 'N', 'M'].map((x) => kkey(x, 0, hot)).join(''))}${krow(kkey('space', '1 1 0', hot))}</div>`;
const combo = (a, b, label) => `<div style="background:#fff;border-radius:18px;box-shadow:0 30px 70px rgba(8,30,55,.4);padding:32px 42px;text-align:center"><div style="display:flex;gap:15px;align-items:center;justify-content:center"><div style="min-width:92px;height:60px;display:flex;align-items:center;justify-content:center;background:#12395f;color:#fff;border-radius:12px;font:700 19px Inter,sans-serif">${a}</div><div style="font:300 36px Inter,sans-serif;color:#1b8f8a">+</div><div style="min-width:60px;height:60px;display:flex;align-items:center;justify-content:center;background:#12395f;color:#fff;border-radius:12px;font:700 24px Inter,sans-serif">${b}</div></div><div style="margin-top:16px;font:600 23px Lexend,Inter,sans-serif;color:#12395f">${label}</div></div>`;
const con = (icon, title, pill) => `<div style="background:#fff;border-radius:18px;box-shadow:0 30px 70px rgba(8,30,55,.4);padding:34px 42px;max-width:460px;text-align:center"><div style="font-size:52px;line-height:1">${icon}</div><div style="margin-top:12px;font:600 24px/1.3 Lexend,Inter,sans-serif;color:#12395f">${title}</div>${pill ? `<div style="display:inline-block;margin-top:13px;background:#e6f4f1;color:#15706b;border-radius:999px;padding:8px 18px;font:600 14px Inter,sans-serif">${pill}</div>` : ''}</div>`;
const folder = () => `<div style="width:72%;max-width:520px;background:#fff;border-radius:14px;box-shadow:0 30px 70px rgba(8,30,55,.4);overflow:hidden">${tb('#5b6b7b', '&#128193; Documents')}<div style="background:#fbfcfd;padding:28px;min-height:150px"><div data-ic="file" style="width:120px;text-align:center"><div style="font-size:54px;color:#185abd">&#128462;</div><div style="margin-top:6px;font:500 14px Inter,sans-serif;color:#2a3b4d">my first note</div></div></div></div>`;
const save = (name) => `<div style="width:74%;max-width:540px;background:#fff;border-radius:14px;box-shadow:0 30px 70px rgba(8,30,55,.4);overflow:hidden">${tb('#185abd', 'Save As')}<div style="background:#eceef1;padding:28px;display:flex;justify-content:center"><div style="background:#fff;border-radius:12px;box-shadow:0 14px 34px rgba(0,0,0,.18);padding:22px;width:90%"><div style="margin-bottom:15px;color:#52606e;font:500 15px Inter,sans-serif">&#128193; Documents</div><div style="display:flex;gap:11px;align-items:center"><span style="color:#3c4854;font:500 15px Inter,sans-serif">File name:</span><div data-fx style="flex:1;border:2px solid #185abd;border-radius:7px;padding:9px 12px;min-height:22px;font:400 16px Inter,sans-serif;color:#1f2d3a">${name || ''}</div></div><div style="text-align:right;margin-top:16px"><span data-k="save" style="display:inline-block;background:#185abd;color:#fff;padding:9px 24px;border-radius:8px;font:600 15px Inter,sans-serif">Save</span></div></div></div></div>`;
/* Save-as-PDF dialog with the file-type dropdown highlighted. */
const savePdf = (open) => `<div style="width:74%;max-width:540px;background:#fff;border-radius:14px;box-shadow:0 30px 70px rgba(8,30,55,.4);overflow:hidden">${tb('#185abd', 'Save As')}<div style="background:#eceef1;padding:26px;display:flex;justify-content:center"><div style="background:#fff;border-radius:12px;box-shadow:0 14px 34px rgba(0,0,0,.18);padding:22px;width:92%"><div style="margin-bottom:13px;color:#52606e;font:500 15px Inter,sans-serif">&#128193; Documents</div><div style="display:flex;gap:11px;align-items:center;margin-bottom:14px"><span style="color:#3c4854;font:500 14px Inter,sans-serif">File name:</span><div style="flex:1;border:1.5px solid #dce3ec;border-radius:7px;padding:8px 11px;font:400 15px Inter,sans-serif;color:#1f2d3a">my shopping list</div></div><div style="display:flex;gap:11px;align-items:center"><span style="color:#3c4854;font:500 14px Inter,sans-serif">Save as type:</span><div data-k="ftype" style="flex:1;position:relative;border:2px solid ${open ? '#c0392b' : '#185abd'};border-radius:7px;padding:8px 11px;font:600 15px Inter,sans-serif;color:${open ? '#c0392b' : '#1f2d3a'};background:#fff">${open ? 'PDF (*.pdf)' : 'Word Document (*.docx)'}<span style="position:absolute;right:10px;color:#7a8a99">▾</span></div></div>${open ? '<div style="margin-top:8px;background:#fff;border:1px solid #dce3ec;border-radius:8px;box-shadow:0 10px 24px rgba(0,0,0,.12);overflow:hidden"><div style="padding:8px 12px;font:400 14px Inter,sans-serif;color:#52606e">Word Document (*.docx)</div><div data-k="pdfopt" style="padding:8px 12px;font:600 14px Inter,sans-serif;color:#fff;background:#185abd">PDF (*.pdf)</div></div>' : ''}</div></div></div>`;
const signin = () => `<div style="width:78%;max-width:500px;border-radius:18px;background:linear-gradient(160deg,#123a63,#2f8f7e);box-shadow:0 30px 70px rgba(8,30,55,.4);padding:40px;text-align:center;color:#fff"><div style="width:88px;height:88px;border-radius:50%;background:rgba(255,255,255,.85);margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:44px">&#128100;</div><div style="margin-top:14px;font:600 22px Lexend,Inter,sans-serif">Signing in…</div><div data-fx style="margin:16px auto 0;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.5);border-radius:8px;padding:11px 0;max-width:230px;letter-spacing:6px;font-size:20px;min-height:22px"></div></div>`;
const power = (on) => `<div style="text-align:center"><div style="width:130px;height:130px;border-radius:50%;background:${on ? '#1b8f8a' : '#12395f'};display:flex;align-items:center;justify-content:center;margin:0 auto;box-shadow:0 18px 44px rgba(12,39,77,.5);${on ? 'animation:azpulse 2s ease-in-out infinite' : ''}"><svg viewBox="0 0 24 24" width="62" height="62" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"><path d="M12 3v9"></path><path d="M6.5 7a8 8 0 1 0 11 0"></path></svg></div><div style="margin-top:18px;font:600 22px Lexend,Inter,sans-serif;color:#fff">${on ? 'Starting up…' : 'The power button'}</div></div>`;
const titleCard = (n, t, outcome) => `<div style="text-align:center;color:#fff;max-width:640px"><div style="font:600 15px Inter,sans-serif;letter-spacing:3px;text-transform:uppercase;color:#7fd6cf">Lesson ${n}</div><div style="margin-top:11px;font:600 38px/1.2 Lexend,Inter,sans-serif">${t}</div>${outcome ? `<div style="margin-top:18px;font:400 19px/1.5 Inter,sans-serif;color:#cfe0ee">${outcome}</div>` : ''}</div>`;
const outcomeCard = (o) => `<div style="text-align:center;color:#fff;max-width:600px"><div style="font:600 14px Inter,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#7fd6cf">By the end of this lesson</div><div style="margin-top:16px;font:600 30px/1.35 Lexend,Inter,sans-serif">“${o}”</div></div>`;
const mistakeCard = (t) => `<div style="text-align:center;color:#fff;max-width:600px"><div style="width:74px;height:74px;border-radius:50%;background:#f4b740;color:#5a3d00;display:flex;align-items:center;justify-content:center;font-size:40px;margin:0 auto;box-shadow:0 12px 30px rgba(244,183,64,.4)">!</div><div style="margin-top:16px;font:600 15px Inter,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#f4d58a">A common mix-up</div><div style="margin-top:10px;font:500 24px/1.4 Lexend,Inter,sans-serif">${t}</div></div>`;
const tryCard = (t) => `<div style="text-align:center;color:#fff;max-width:620px"><div style="width:78px;height:78px;border-radius:50%;background:#1b8f8a;display:flex;align-items:center;justify-content:center;margin:0 auto;box-shadow:0 12px 30px rgba(27,143,138,.5)"><svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg></div><div style="margin-top:16px;font:600 14px Inter,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#7fd6cf">Now you try — practice time</div><div style="margin-top:10px;font:500 24px/1.4 Lexend,Inter,sans-serif">${t}</div><div data-count style="margin-top:16px;font:700 40px/1 Lexend,Inter,sans-serif;color:#7fd6cf;font-variant-numeric:tabular-nums"></div><div style="margin-top:12px;font:400 15px Inter,sans-serif;color:#bcd3e8">Try it on your computer while the timer runs. Pause any time; play again when you are ready.</div></div>`;
const doneCard = (msg) => `<div style="text-align:center;color:#fff;max-width:580px"><div style="width:92px;height:92px;border-radius:50%;background:#1b8f8a;margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:48px;box-shadow:0 12px 30px rgba(27,143,138,.5)">&#10003;</div><div style="margin-top:16px;font:600 30px/1.25 Lexend,Inter,sans-serif">${msg}</div><div style="margin-top:12px;font:400 17px/1.5 Inter,sans-serif;color:#bcd3e8">That is the end of the lesson. Now scroll down and complete the activities we have just explained, with your tutor.</div></div>`;
const esc = (v) => String(v || '').replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const cleanTask = (t) => String(t || '')
  .replace(/Staff setup:\s*/i, 'Staff will first help you prepare: ')
  .replace(/Warm-up:\s*/i, '')
  .replace(/Guided\s+/i, '')
  .replace(/Stretch:\s*/i, '')
  .replace(/Reflection:\s*/i, '')
  .replace(/Ask the learner to/gi, 'Staff will ask you to')
  .replace(/Ask the learner/gi, 'Staff will ask you')
  .replace(/Learner practises/gi, 'You practise')
  .replace(/Learner opens/gi, 'You open')
  .replace(/Learner selects/gi, 'You select')
  .replace(/Learner points/gi, 'You point')
  .replace(/Learner decides/gi, 'You decide')
  .replace(/learner’s/gi, 'your')
  .replace(/the learner/gi, 'you')
  .replace(/Learner/gi, 'You')
  .replace(/Staff names/gi, 'Staff will name')
  .replace(/Staff says/gi, 'Staff will say')
  .replace(/Staff signs/gi, 'Staff will sign')
  .replace(/what they are most proud of/gi, 'what you are most proud of')
  .replace(/[“”"]/g, '')
  .replace(/\s+/g, ' ')
  .replace(/[.:]+$/, '')
  .trim();
const shortTask = (t) => esc(cleanTask(t));
const activityCard = (guide) => `<div style="color:#fff;max-width:720px;width:min(88%,720px)"><div style="font:600 14px Inter,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#7fd6cf;text-align:center">Your activities will match this lesson</div><div style="margin:14px auto 0;display:grid;gap:10px">${guide.items.map((item, idx) => `<div style="display:flex;gap:12px;align-items:flex-start;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);border-radius:14px;padding:12px 14px;text-align:left"><div style="flex:0 0 30px;height:30px;border-radius:50%;background:#1b8f8a;color:#fff;display:flex;align-items:center;justify-content:center;font:700 14px Inter,sans-serif">${idx + 1}</div><div><div style="font:700 15px/1.25 Inter,sans-serif;color:#fff">${esc(item.head)}</div><div style="margin-top:3px;font:400 15px/1.45 Inter,sans-serif;color:#cfe0ee">${esc(item.text)}</div></div></div>`).join('')}</div><div style="margin-top:13px;text-align:center;font:400 15px/1.5 Inter,sans-serif;color:#bcd3e8">Take them in order. The quiz questions check the words, and the practice tasks check the real skill.</div></div>`;
function activityGuide(L) {
  const practice = L.tasks.filter((t) => t.type === 'practice');
  const picks = L.tasks.filter((t) => t.type === 'pick');
  const types = L.tasks.filter((t) => t.type === 'type');
  const firstPractice = practice[0]?.detail || practice[0]?.q || L.steps?.[0] || 'Start with a calm warm-up.';
  const guided = practice[1]?.detail || practice[1]?.q || L.steps?.slice(0, 2).join(', ') || 'Practise the skill with staff support.';
  const typing = types[0]?.q || picks[0]?.q || 'Answer the short checks carefully.';
  const finish = practice[practice.length - 1]?.detail || types[types.length - 1]?.q || picks[picks.length - 1]?.q || 'Finish by showing the skill again.';
  const say = `When you start the activities, they will follow the same order as this lesson. First, you do a warm-up: ${cleanTask(firstPractice)}. Then you answer quick checks, so we know the key words make sense. Next, you practise the real computer skill: ${cleanTask(guided)}. You may also type a short answer, for example: ${cleanTask(typing)}. At the end, you finish with a stretch or reflection: ${cleanTask(finish)}. Take one activity at a time. If you need help, ask staff, then try the next step yourself.`;
  return {
    say,
    items: [
      { head: 'Warm up first', text: shortTask(firstPractice) },
      { head: 'Check the key words', text: picks[0] ? shortTask(picks[0].q) : 'Answer the quick check questions carefully.' },
      { head: 'Practise on the real computer', text: shortTask(guided) },
      { head: 'Type or reflect', text: shortTask(typing) },
      { head: 'Finish with confidence', text: shortTask(finish) },
    ],
  };
}

/* ---------- per-lesson demonstration frames (authored) ----------
   Each frame: { say, html, focus?, type? }  */
const F = [
  // 1 — Turn on and sign in
  [
    { say: 'Look at the front or side of the computer for a small round button with a line through the top. That is the power button.', html: power(false) },
    { say: 'We press the power button once. Just once — a single, gentle press. Then we take our hand away and wait.', html: power(true) },
    { say: 'Waiting is part of using a computer well. The screen may be dark for a moment. That is completely normal. We stay calm and let it wake up.', html: power(true) },
    { say: 'Now the computer asks who we are. We type our password carefully, letter by letter. The dots hide it so it stays private.', html: signin(), type: { sel: '[data-fx]', txt: '••••••' } },
    { say: 'And there it is. This screen is called the desktop. It is our starting place, with our folders and programs ready to use.', html: desk() },
  ],
  // 2 — mouse & click
  [
    { say: 'Rest your hand gently on the mouse. As you slide it, watch the little arrow on screen move with you — that arrow is the pointer.', html: desk() },
    { say: 'The pointer is like our finger, reaching into the screen. We move slowly, and we stop right on the thing we want.', html: desk(), focus: '[data-ic="bin"]' },
    { say: 'To choose something, we rest the pointer on it and press the left button once. Let us choose the blue W for Word.', html: desk(), focus: '[data-ic="w"]' },
    { say: 'One click chooses it. See how it lights up? We have not opened it yet — one click simply chooses.', html: desk('w') },
  ],
  // 3 — double-click
  [
    { say: 'Point the arrow at the Documents folder. To open it, we will use two quick clicks, one after the other.', html: desk(), focus: '[data-ic="docs"]' },
    { say: 'The secret is this: keep the mouse perfectly still, and click twice quickly. Click, click. The stillness is what matters most.', html: desk(), focus: '[data-ic="docs"]' },
    { say: 'And it opens. Well done. That is a double-click. The Documents folder is now open in front of us.', html: folder() },
  ],
  // 4 — keyboard
  [
    { say: 'The keyboard has lots of keys, but three do most of the work: Space, Enter, and Backspace. Let us find them together.', html: keys(['space', '&#9166; Enter', '&#9003;']) },
    { say: 'We click where the line is flashing, and then we type, slowly. Let us type the word cat, one letter at a time.', html: word(fbtns(), '<span data-fx></span>' + cur), type: { sel: '[data-fx]', txt: 'cat' } },
    { say: 'The Space bar makes a gap between words. And if we make a mistake, the Backspace key removes the last letter. Mistakes are completely fine.', html: word(fbtns(), 'cat' + cur) },
  ],
  // 5 — open, minimise, close
  [
    { say: 'Double-click the blue W to open Word. Watch how it opens up in its own window on the screen.', html: desk(), focus: '[data-ic="w"]' },
    { say: 'Here it is, open in its own window. At the top corner are three small buttons that control the window.', html: word(fbtns(), cur) },
    { say: 'When we are finished, we find the X in the very top corner. The X means: I am done with this window.', html: word(fbtns(), cur), focus: '.az-tb .x' },
  ],
  // 6 — save
  [
    { say: 'We have written a short note. To keep it, we click the File menu at the top, and then choose Save.', html: word(fbtns(), 'My note' + cur) },
    { say: 'The computer asks for a name. We give it a simple, clear name, so we can find it again later.', html: save(''), type: { sel: '[data-fx]', txt: 'my first note' } },
    { say: 'And we always save to the same place: the Documents folder. Then we press Save.', html: save('my first note'), focus: '[data-k="save"]' },
    { say: 'Later, we open Documents, and our work is waiting for us. The same drawer, every time.', html: folder(), focus: '[data-ic="file"]' },
  ],
  // 7 — files & folders
  [
    { say: 'Here is one file. Think of a file as a single piece of work — one note, one letter, one list.', html: folder(), focus: '[data-ic="file"]' },
    { say: 'A folder is like a box that holds many files together, and keeps them tidy. Documents is the folder we use most.', html: con('&#128193;', 'A folder holds your files', 'It keeps them tidy and easy to find') },
    { say: 'So when we look for our work, we open Documents, and there it is, kept safely inside.', html: folder(), focus: '[data-ic="file"]' },
  ],
  // 8 — practice save & find
  [
    { say: 'Watch closely just once. In a moment you will try the whole thing yourself, so notice each step as I go.', html: desk(), focus: '[data-ic="w"]' },
    { say: 'First we type our note.', html: word(fbtns(), '<span data-fx></span>' + cur), type: { sel: '[data-fx]', txt: 'Hello' } },
    { say: 'Then we save it, with a name, in Documents.', html: save('my note'), focus: '[data-k="save"]' },
    { say: 'And finally we find it again in the Documents folder. This whole routine is where independence begins to show.', html: folder(), focus: '[data-ic="file"]' },
  ],
  // 9 — Word sentence
  [
    { say: 'Open Word by double-clicking the blue W, and click onto the blank white page so the cursor is ready.', html: desk(), focus: '[data-ic="w"]' },
    { say: 'A good sentence starts with a capital letter. We hold the Shift key to make that first capital.', html: word(fbtns(), '<span data-fx></span>' + cur), type: { sel: '[data-fx]', txt: 'I am learning to use a computer.' } },
    { say: 'We put a space between each word, and we finish with a full stop. There — a clear, complete sentence.', html: word(fbtns(), 'I am learning to use a computer.' + cur) },
  ],
  // 10 — copy paste undo
  [
    { say: 'First we choose the text. Put the pointer just before the word, hold the left mouse button down, and slide across it. The word turns blue — that means it is selected.', html: wordR({}, '<span style="background:#cfe2ff">Hello</span>' + cur) },
    { say: 'Now copy it. Find the Control key at the bottom-left of the keyboard. Hold it down, and while still holding, tap the letter C. Control and C together means copy.', html: combo('Ctrl', 'C', 'Hold both together = Copy') },
    { say: 'Click where you want the word to go. Then hold Control down again and, while holding, tap the letter V. Control and V together pastes your copy in.', html: combo('Ctrl', 'V', 'Hold both together = Paste') },
    { say: 'Made a mistake? Do not worry. Hold Control down and tap the letter Z. Control and Z together is Undo — it steps you back, one change at a time. Nothing here can break.', html: combo('Ctrl', 'Z', 'Hold both together = Undo') },
  ],
  // 11 — format text
  [
    { say: 'Always choose the word first. Slide the mouse across it so it turns blue. Up in the toolbar at the top is a row of buttons — that is where we change how the word looks.', html: wordR({}, '<span style="background:#cfe2ff">David</span>' + cur) },
    { say: 'Find the button with a bold letter B. Click it once. Your word becomes bold — darker and stronger, so it stands out.', html: wordR({ hot: 'B' }, '<b>David</b>' + cur), focus: '[data-k="B"]' },
    { say: 'Next to it is the slanted letter I, for italic. Click it and the letters lean over, like this.', html: wordR({ hot: 'I' }, '<b><i>David</i></b>' + cur), focus: '[data-k="I"]' },
    { say: 'Now the underlined letter U. Click the U button and a line appears under your word — that is underline, useful for something important.', html: wordR({ hot: 'U' }, '<b><i><u>David</u></i></b>' + cur), focus: '[data-k="U"]' },
    { say: 'Last is the letter A with a coloured bar under it. Click it to change the colour of your word. Remember the rule: choose the word first, then change it.', html: wordR({ hot: 'C' }, '<b><i><u style="color:#c0392b">David</u></i></b>' + cur), focus: '[data-k="C"]' },
  ],
  // 12 — title & alignment
  [
    { say: 'Type a short title at the top, then slide the mouse across it so it turns blue. In the toolbar, that little box with a number in it is the text size.', html: wordR({ size: '11' }, '<span style="font-size:22px;background:#cfe2ff">My List</span>' + cur), focus: '[data-k="size"]' },
    { say: 'Click the size box and choose a bigger number, like twenty-eight. Watch — as the number goes up, your title grows bigger on the page.', html: wordR({ size: '28', sizeHot: true }, '<span style="font-size:34px;background:#cfe2ff">My List</span>'), focus: '[data-k="size"]' },
    { say: 'Now click the bold button, the letter B, so the title is nice and strong.', html: wordR({ size: '28', hot: 'B' }, '<span style="font-size:34px;font-weight:700">My List</span>'), focus: '[data-k="B"]' },
    { say: 'To move it to the middle, look for the align buttons — small rows of lines. Click the centre one, and your title jumps neatly into the middle of the page.', html: wordR({ size: '28', hot: 'B', align: 'centre' }, '<div style="text-align:center;font-size:34px;font-weight:700">My List</div>'), focus: '[data-k="al-centre"]' },
  ],
  // 13 — lists, spell, PDF
  [
    { say: 'In the toolbar, look for the bullets button — three little dots stacked with lines beside them. Click it, and a dot appears, ready for your first list item. Type milk.', html: wordR({ bullets: true }, '<div>&#8226; milk</div>' + cur), focus: '[data-k="bullets"]' },
    { say: 'Press Enter after each item and a new dot appears on the next line for you. Milk, bread, eggs — one under the other, tidy and clear.', html: wordR({ bullets: true }, '<div>&#8226; milk</div><div>&#8226; bread</div><div>&#8226; eggs</div>' + cur) },
    { say: 'If a word gets a red wavy line under it, that is Word saying: please check the spelling. Right-click the word to see suggested corrections. It is helping you, not telling you off.', html: wordR({ bullets: true }, '<div>&#8226; milk</div><div>&#8226; <span style="text-decoration:underline wavy #d33">bred</span></div>') },
    { say: 'To share it safely, click File, then Save As. In the box that says "Save as type", click the little arrow to open the list.', html: savePdf(false), focus: '[data-k="ftype"]' },
    { say: 'From that list, choose PDF. A PDF looks exactly the same on every computer, phone or printer. Click Save, and your list is ready to send.', html: savePdf(true), focus: '[data-k="pdfopt"]' },
  ],
  // 14 — Excel cells
  [
    { say: 'Open Excel and look at the screen. Instead of a blank page, you see a grid of little boxes, like squared paper.', html: con('&#129003;', 'Excel is a grid', 'Each little box is a cell') },
    { say: 'Each little box in the grid is called a cell. The columns use letters across the top, and the rows use numbers down the side.', html: excel({}, 'A1') },
    { say: 'So the box in the very top-left corner is called A1 — column A, row 1. Every cell has a name like this.', html: excel({}, 'A1'), focus: '[data-cell="A1"]' },
  ],
  // 15 — Excel table
  [
    { say: 'Click cell A1, at the very top-left. Type your first heading, Item, then press Enter to drop down to the cell below.', html: excel({ A1: 'Item', B1: 'Cost' }, 'A1') },
    { say: 'Type your list down the column — bread rolls, orange juice, tea bags. Notice the long words get cut off, because column A is too narrow.', html: excelWidth('narrow') },
    { say: 'To make it wider, move the mouse up to the line between the A and the B, at the top. The pointer changes to a double arrow. Hold the left button down on that line.', html: excelWidth('drag'), focus: '[data-k="edge"]' },
    { say: 'Now drag to the right, and let go. The column stretches wider, and every word fits. That is how we widen a column whenever text is cut off.', html: excelWidth('wide') },
  ],
  // 16 — Excel formulas
  [
    { say: 'We have a short list of prices. Click cell B5, just under the numbers — this is where the total will go.', html: excel({ A1: 'Item', B1: 'Cost', A2: 'milk', B2: '1', A3: 'bread', B3: '2', A4: 'eggs', B4: '3', A5: 'Total' }, 'B5'), focus: '[data-cell="B5"]' },
    { say: 'Every formula begins with an equals sign. We type equals, S U M, then the cells to add, in brackets.', html: excel({ A1: 'Item', B1: 'Cost', A2: 'milk', B2: '1', A3: 'bread', B3: '2', A4: 'eggs', B4: '3', A5: 'Total' }, 'B5'), type: { sel: '[data-fx]', txt: '=SUM(B2:B4)' } },
    { say: 'We press Enter, and Excel adds it all up for us. The total is six. It did the maths, instantly.', html: excel({ A1: 'Item', B1: 'Cost', A2: 'milk', B2: '1', A3: 'bread', B3: '2', A4: 'eggs', B4: '3', A5: 'Total', B5: '6' }, 'B5', { B2: 'sum', B3: 'sum', B4: 'sum', B5: 'tot' }) },
    { say: 'The AutoSum button, marked with the Greek letter sigma, does this in a single click. A wonderful way to finish the course.', html: con('&#931;', 'AutoSum', 'One click totals a whole column') },
  ],
];

/* per-lesson closing message (headline + spoken line) — unique to each skill */
const CLOSINGS = [
  { head: 'You can start a computer!', say: 'Brilliant. You now know how to turn a computer on, wait calmly, and sign in safely — the very first step to being confident.' },
  { head: 'You can use the mouse!', say: 'Lovely work. You can move the pointer and click once to choose — the mouse is your tool now.' },
  { head: 'You can open things!', say: 'Well done. Two quick clicks, mouse held still — you have the double-click, and you know to stay calm and try again.' },
  { head: 'You can use the keyboard!', say: 'Great effort. You can type words, use Space and Enter, and fix mistakes with Backspace. Mistakes are always fine.' },
  { head: 'You can manage windows!', say: 'Nicely done. You can open a program, tuck it away, bring it back, and close it with the X when you are finished.' },
  { head: 'Your work is safe!', say: 'Wonderful. You can save your work with a clear name in Documents — and that means it will never be lost.' },
  { head: 'You can find your files!', say: 'Good work. You know a file is one piece of work and a folder holds them together — and you can find your work in Documents.' },
  { head: 'You did the whole routine!', say: 'That was excellent. Create, save, close, and find again — you put the whole routine together. This is real independence.' },
  { head: 'You can write in Word!', say: 'Beautiful writing. A capital to start, spaces between words, a full stop at the end — you wrote a proper sentence.' },
  { head: 'You can edit like a pro!', say: 'Really well done. Copy, paste and undo — three powerful tools, and undo means nothing can ever break.' },
  { head: 'You can make text stand out!', say: 'Lovely. Bold, italic, underline and colour — and you remembered the golden rule: choose first, then change.' },
  { head: 'You can design a page!', say: 'That looks smart. A big, bold, centred title with your writing underneath — your documents look professional now.' },
  { head: 'You can share your work!', say: 'Great job. Tidy lists, a spell-check to help you, and a PDF that looks the same everywhere — ready to share.' },
  { head: 'You know your way around Excel!', say: 'Well done. Cells, columns of letters, rows of numbers, and A1 in the corner — Excel is not a mystery any more.' },
  { head: 'You built a tidy table!', say: 'Excellent. Headings, data underneath, and prices shown as money — a clear table anyone can read.' },
  { head: 'You can make Excel do the maths!', say: 'What a finish. Formulas that start with equals, and AutoSum to total a column. You started at the power button and now you write formulas — be proud.' },
];

/* per-lesson "common mistake" tips */
const MISTAKES = [
  'Pressing the power button many times does not make it faster. One press, then wait.',
  'Do not press hard or click many times. A light, single click is all it takes.',
  'If it does not open, the mouse probably moved. Keep it still, and try the two clicks again.',
  'Holding a key down types the same letter over and over. A quick tap gives one letter.',
  'The X closes the window. The minus only tucks it away. Look carefully before you click.',
  'Closing without saving can lose new work. Always save first, then close.',
  'A file is one piece of work; a folder is the box. Do not mix the two up.',
  'Try not to rush. Saying each step out loud first makes the whole routine easier.',
  'A sentence needs a capital at the start and a full stop at the end — it is easy to forget the full stop.',
  'Copy does not remove the text; it leaves it where it is. Only Cut takes it away.',
  'If nothing changes when you press B, you probably forgot to select the word first.',
  'Make the title bigger than the writing below, or it will not look like a title.',
  'A red wavy line is a helpful hint, not a mistake to feel bad about.',
  'Columns are letters, rows are numbers. A cell name is always a letter and then a number.',
  'If a word looks cut off, the column is just too narrow — widen it, do not delete the word.',
  'Forgetting the equals sign is the most common slip. Every formula must start with =.',
];

/* estimate ms to speak a line at ~150 wpm, floor 2.6s */
const sayMs = (t) => Math.max(3200, Math.round((String(t).split(/\s+/).length / 128) * 60000) + 1300);

/**
 * Build the full narrated timeline for lesson index i.
 * Returns [{ say, html, focus?, type?, dur, hold?, kind }]
 * kind: 'title'|'outcome'|'demo'|'mistake'|'try'|'done'
 */
/* Optional recorded-narration manifest. To use real voices (e.g. ElevenLabs
   exports of a chosen voice), set:
     import { setNarration } from './lesson-video.js';
     setNarration({ base: 'audio', ext: 'mp3' });   // plays audio/lesson-1-01.mp3 ...
   or pass explicit per-beat URLs: setNarration({ urls: { 1: ['a.mp3', ...] } });
   Any beat without a matching file falls back to the browser voice automatically. */
let NARR = null;
/* The exact script spoken by each recorded lesson MP3 (audio/lesson-NN.mp3).
   Captions are derived from this so the on-screen words match the voice. */
const NARRATION = [
  'Today we are learning the full start-up routine. <break /> We will turn the computer on, wait calmly, sign in carefully, and check that the desktop is ready. <break /> We are not rushing. Waiting is part of using a computer well.',
  'The mouse moves the pointer. The pointer is how we reach things on the screen. <break /> Today we will move slowly, stop on the target, and click once to choose.',
  'A double-click opens things. The trick is two quick clicks while the mouse stays still. <break /> If it does not open the first time, that is okay. We calmly try again.',
  'Today the keyboard becomes a tool for messages. <break /> We will type slowly, use Space between words, Enter for a new line, and Backspace to fix mistakes.',
  'A program opens inside a window. <break /> The buttons at the top help us manage the window. X means we are finished with it.',
  'Saving means keeping our work. A good file name helps us find it later. <break /> Today we will make a real note, save it in Documents, close it, and find it again.',
  'A file is one piece of work. A folder holds files together. <break /> Today we will open Documents, create a practice folder, and place work where it belongs.',
  'Today we put the whole routine together. <break /> Open Word, type a note, save it, close it, then find it again. This is where independence starts to show.',
  'Now we use Word for real writing. <break /> A strong sentence starts with a capital letter, uses spaces between words, and ends with a full stop.',
  'Editing means changing work without starting again. <break /> Copy, paste and undo are three powerful tools. Nothing breaks today; undo can take us back.',
  'Formatting helps readers notice important words. <break /> The rule is choose first, then change. We select text before pressing B, I, U or colour.',
  'A good title tells the reader what the page is about. <break /> We will make the title bigger, bold and centred, then write normal text underneath.',
  'Lists make information easier to read. <break /> Spell check helps us improve work, and a PDF is useful because it looks the same when shared or printed.',
  'Excel is a grid. Each box is a cell. <break /> Columns use letters across the top, rows use numbers down the side, and the first cell is A1.',
  'A table keeps information tidy. <break /> Today we will make headings, enter real data, make headers bold, widen columns and format prices as money.',
  'Excel can do maths for us. A formula starts with equals. <break /> We can type a simple sum, use cell names, and use AutoSum to total a whole column.',
];
export function setNarration(cfg) { NARR = cfg || null; }
export function cleanNarrationText(text) {
  return String(text || '')
    .replace(/<\s*break\s*\/?\s*>/gi, '. ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+([,.!?;:])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}
function audioFor(lessonNo, beatIdx) {
  if (!NARR) return null;
  if (NARR.urls && NARR.urls[lessonNo] && NARR.urls[lessonNo][beatIdx]) return NARR.urls[lessonNo][beatIdx];
  if (NARR.base) return `${NARR.base}/lesson-${String(lessonNo).padStart(2, '0')}-${String(beatIdx + 1).padStart(2, '0')}.${NARR.ext || 'mp3'}`;
  return null;
}

export function buildTimeline(i) {
  const L = course.lessons[i];
  const n = i + 1;
  const beats = [];
  const push = (b) => {
    b.say = cleanNarrationText(b.say);
    b.dur = b.dur || sayMs(b.say);
    const au = audioFor(n, beats.length);
    if (au) b.audioUrl = au;
    beats.push(b);
  };

  push({ kind: 'title', say: `Lesson ${n}: ${L.title}. I will guide you through it one step at a time.`, html: titleCard(n, L.title), dur: 5200 });
  push({ kind: 'intro', say: L.tutor, html: outcomeCard(L.outcome), dur: sayMs(L.tutor) });

  // teaching demonstration frames — the detailed step-by-step explanation
  F[i].forEach((fr) => push({ kind: 'demo', say: fr.say, html: fr.html, focus: fr.focus, type: fr.type }));

  // activity guide — makes the narration line up with the real tasks below the video
  const G = activityGuide(L);
  push({ kind: 'activity-guide', say: G.say, html: activityCard(G) });

  // common mistake
  push({ kind: 'mistake', say: `Here is one useful thing to watch for. ${MISTAKES[i]} If it happens, pause, reset, and try again calmly.`, html: mistakeCard(MISTAKES[i]) });

  // closing — a message specific to this lesson, then send them to the activities
  const C = CLOSINGS[i];
  push({ kind: 'done', say: `${C.say} Now it is your turn. Scroll down to the activities and do one step at a time. Ask staff for help if you need it — that is part of learning.`, html: doneCard(C.head) });

  return beats;
}

/** total estimated runtime (ms) for a lesson video */
export function timelineDuration(i) {
  return buildTimeline(i).reduce((a, b) => a + b.dur + (b.hold || 0), 0);
}
