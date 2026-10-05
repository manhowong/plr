/** Lightweight Markdown -> HTML renderer (zero-dep, XSS-safe). */

function escapeHtml(v: string): string {
  return v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function isSafeUrl(url: string): boolean {
  const u = url.trim().toLowerCase();
  return u.startsWith('http://') || u.startsWith('https://') || u.startsWith('mailto:') || u.startsWith('#') || u.startsWith('/') || u.startsWith('./') || u.startsWith('../');
}

function renderInline(src: string): string {
  let out = escapeHtml(src);
  out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;[^&]*?&quot;)?\)/g, (_m, alt: string, url: string) => {
    const raw = url.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    if (!isSafeUrl(raw)) return alt;
    return `<img src="${escapeHtml(raw)}" alt="${alt}" loading="lazy" />`;
  });
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+&quot;[^&]*?&quot;)?\)/g, (_m, text: string, url: string) => {
    const raw = url.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    if (!isSafeUrl(raw)) return text;
    return `<a href="${escapeHtml(raw)}" target="_blank" rel="noopener noreferrer">${text}</a>`;
  });
  out = out.replace(/`([^`\n]+?)`/g, '<code>$1</code>');
  out = out.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/__([^_]+?)__/g, '<strong>$1</strong>');
  out = out.replace(/~~([^~]+?)~~/g, '<del>$1</del>');
  out = out.replace(/\*([^*\n]+?)\*/g, '<em>$1</em>');
  out = out.replace(/(^|\W)_([^_\n]+?)_(?=\W|$)/g, '$1<em>$2</em>');
  return out;
}

interface CodeBlock { lang: string; code: string; }

export function renderMarkdown(source: string): string {
  if (!source || !source.trim()) return '';
  const blocks: CodeBlock[] = [];
  const src = source.replace(/```(\w*)\n?([\s\S]*?)(?:```|$)/g, (_m, lang: string, code: string) => {
    const i = blocks.length;
    blocks.push({ lang: (lang || '').trim(), code: code.replace(/\n$/, '') });
    return `\u0000CB${i}\u0000`;
  });
  const lines = src.split('\n');
  const html: string[] = [];
  let para: string[] = [];
  let quote: string[] = [];
  let list: Array<'ul' | 'ol'> = [];
  let inTable = false;
  let aligns: Array<'left' | 'center' | 'right' | null> = [];
  const flushP = () => { if (para.length) { html.push(`<p>${renderInline(para.join(' '))}</p>`); para = []; } };
  const flushQ = () => { if (quote.length) { html.push(`<blockquote>${quote.map((l) => renderInline(l)).join('<br />')}</blockquote>`); quote = []; } };
  const closeLists = () => { while (list.length) html.push(`</${list.pop()}>`); };
  const closeTable = () => { if (inTable) { html.push('</tbody></table>'); inTable = false; aligns = []; } };
  const isDelim = (l: string) => { const c = l.trim().replace(/^\||\|$/g, '').split('|'); return c.length > 0 && c.every((x) => /^\s*:?-+:?\s*$/.test(x)); };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]; const t = line.trim();
    const cb = t.match(/^\u0000CB(\d+)\u0000$/);
    if (cb) {
      flushP(); flushQ(); closeLists(); closeTable();
      const b = blocks[Number(cb[1])];
      const badge = b.lang ? `<span class="md-code-lang">${escapeHtml(b.lang)}</span>` : '';
      html.push(`<pre>${badge}<code>${escapeHtml(b.code) || ' '}</code></pre>`);
      continue;
    }
    if (!t) {
      flushP(); flushQ(); closeTable();
      const nx = (lines[i + 1] || '').trim();
      if (!/^([-*+]\s+\S|\d+[.)]\s+\S)/.test(nx)) closeLists();
      continue;
    }
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(t)) { flushP(); flushQ(); closeLists(); closeTable(); html.push('<hr />'); continue; }
    const h = t.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (h) { flushP(); flushQ(); closeLists(); closeTable(); html.push(`<h${h[1].length}>${renderInline(h[2])}</h${h[1].length}>`); continue; }
    const q = line.match(/^\s*>\s?(.*)$/);
    if (q) { flushP(); closeLists(); closeTable(); quote.push(q[1]); if (!/^\s*>\s?/.test(lines[i + 1] || '')) flushQ(); continue; }
    flushQ();
    if (t.includes('|') && i + 1 < lines.length && isDelim(lines[i + 1])) {
      flushP(); closeLists();
      const heads = t.replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      aligns = lines[i + 1].trim().replace(/^\||\|$/g, '').split('|').map((d) => {
        const s = d.trim(); if (/^:-+:$/.test(s)) return 'center'; if (/-+:$/.test(s)) return 'right'; if (/^:-+/.test(s)) return 'left'; return null;
      });
      html.push(`<table><thead><tr>${heads.map((x, k) => `<th${aligns[k] ? ` style="text-align:${aligns[k]}"` : ''}>${renderInline(x)}</th>`).join('')}</tr></thead><tbody>`);
      inTable = true; i++; continue;
    }
    if (inTable && t.includes('|')) {
      const cells = t.replace(/^\||\|$/g, '').split('|');
      html.push(`<tr>${cells.map((c, k) => `<td${aligns[k] ? ` style="text-align:${aligns[k]}"` : ''}>${renderInline(c.trim())}</td>`).join('')}</tr>`);
      if (!(lines[i + 1] || '').trim().includes('|')) closeTable();
      continue;
    }
    closeTable();
    const ul = line.match(/^\s*[-*+]\s+(.+)$/);
    const ol = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (ul || ol) {
      flushP();
      const want: 'ul' | 'ol' = ul ? 'ul' : 'ol';
      if (list[list.length - 1] !== want) { closeLists(); html.push(`<${want}>`); list.push(want); }
      const content = ul ? ul[1] : (ol as RegExpMatchArray)[1];
      const task = content.match(/^\[( |x|X)\]\s+(.+)$/);
      if (task) html.push(`<li class="md-task"><input type="checkbox"${task[1].toLowerCase() === 'x' ? ' checked' : ''} disabled /> <span>${renderInline(task[2])}</span></li>`);
      else html.push(`<li>${renderInline(content)}</li>`);
      continue;
    }
    para.push(t + (/  $/.test(line) ? '<br />' : ''));
  }
  flushP(); flushQ(); closeLists(); closeTable();
  let out = html.join('\n');
  blocks.forEach((b, k) => { out = out.replace(`\u0000CB${k}\u0000`, `<pre><code>${escapeHtml(b.code) || ' '}</code></pre>`); });
  return out;
}

