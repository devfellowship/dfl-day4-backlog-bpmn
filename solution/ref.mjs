// Reference implementation (lives outside the agent workspace).
// Usage: node solution/ref.mjs environment/casos  -> prints { <caso>: <saida> }
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const OPS = { 'acima de': '>', 'a partir de': '>=', 'abaixo de': '<', 'até': '<=' };
const NEG = { '>': '<=', '>=': '<', '<': '>=', '<=': '>' };
const num = (id) => (id === 'INICIO' ? -1 : id === 'FIM' ? Infinity : Number(id.slice(1)));
const byId = (a, b) => num(a) - num(b);
const cmpSeq = (a, b) => {
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    const d = typeof a[i] === 'string' && /^H\d+$|^INICIO$|^FIM$/.test(a[i]) ? byId(a[i], b[i]) : a[i] < b[i] ? -1 : a[i] > b[i] ? 1 : 0;
    if (d !== 0) return d;
  }
  return a.length - b.length;
};
const list = (s) => s.split(',').map((x) => x.trim()).filter(Boolean);
const norm = (s) => s.trim().toLowerCase();

function parse(text) {
  const tasks = new Map();
  const ajustes = [];
  let cur = null;
  let inAjustes = false;
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    const h = line.match(/^##\s+(\S+)/);
    if (h) {
      if (h[1] === 'Ajustes') { inAjustes = true; cur = null; continue; }
      inAjustes = false;
      cur = { id: h[1], papel: null, duracao: 0, deps: [], usa: [], gera: [], aprova: null, decisao: null, volta: null };
      tasks.set(cur.id, cur); // a later block with the same id replaces the earlier one entirely
      continue;
    }
    if (!line.startsWith('- ')) continue;
    const item = line.slice(2).trim();
    if (inAjustes) { ajustes.push(item); continue; }
    if (!cur) continue;
    let m;
    if ((m = item.match(/^papel:\s*(.+)$/))) cur.papel = m[1].trim();
    else if ((m = item.match(/^duracao:\s*(\d+)$/))) cur.duracao = Number(m[1]);
    else if ((m = item.match(/^depois de:\s*(.+)$/))) cur.deps = list(m[1]);
    else if ((m = item.match(/^usa:\s*(.+)$/))) cur.usa = list(m[1]).map(norm);
    else if ((m = item.match(/^gera:\s*(.+)$/))) cur.gera = list(m[1]).map(norm);
    else if ((m = item.match(/^aprova:\s*(.+)$/))) cur.aprova = norm(m[1]);
    else if ((m = item.match(/^se (\w+) (acima de|a partir de|abaixo de|até) (\d+) então (H\d+) senão (H\d+)$/))) {
      const op = OPS[m[2]];
      cur.decisao = { sim: m[4], nao: m[5], condSim: `${m[1]} ${op} ${m[3]}`, condNao: `${m[1]} ${NEG[op]} ${m[3]}` };
    } else if ((m = item.match(/^volta para:\s*(H\d+)( no máximo (\d+) vezes)?$/))) cur.volta = { para: m[1], limite: m[3] ? Number(m[3]) : null };
    else throw new Error(`unknown line in ${cur.id}: ${item}`);
  }
  for (const a of ajustes) {
    let m;
    if ((m = a.match(/^(H\d+) não depende mais de (H\d+)$/))) {
      const t = tasks.get(m[1]); t.deps = t.deps.filter((d) => d !== m[2]);
    } else if ((m = a.match(/^(H\d+) passa a depender de (H\d+)$/))) {
      const t = tasks.get(m[1]); if (!t.deps.includes(m[2])) t.deps.push(m[2]);
    } else if ((m = a.match(/^(H\d+) foi cancelada$/))) {
      const gone = tasks.get(m[1]);
      tasks.delete(m[1]);
      for (const t of tasks.values()) {
        if (!t.deps.includes(m[1])) continue;
        const nd = [];
        for (const d of t.deps) for (const x of d === m[1] ? gone.deps : [d]) if (!nd.includes(x)) nd.push(x);
        t.deps = nd;
      }
    } else throw new Error(`unknown adjustment: ${a}`);
  }
  return tasks;
}

export function resolver(dir) {
  const papeis = JSON.parse(readFileSync(join(dir, 'papeis.json'), 'utf8'));
  const tasks = parse(readFileSync(join(dir, 'backlog.md'), 'utf8'));
  const lane = (p) => {
    for (const [k, aliases] of Object.entries(papeis)) if ([k, ...aliases].some((x) => norm(x) === norm(p))) return k;
    throw new Error(`unknown role ${p}`);
  };
  const ids = [...tasks.keys()].sort(byId);
  for (const t of tasks.values()) t.raia = lane(t.papel);

  const raias = Object.fromEntries(Object.keys(papeis).sort().map((k) => [k, ids.filter((id) => tasks.get(id).raia === k)]));

  // flows: key "de|para" -> condicao
  const flows = new Map();
  const insights = [];
  for (const id of ids) {
    const t = tasks.get(id);
    if (t.decisao) {
      flows.set(`${id}|${t.decisao.sim}`, t.decisao.condSim);
      flows.set(`${id}|${t.decisao.nao}`, t.decisao.condNao);
    }
  }
  for (const id of ids) {
    const t = tasks.get(id);
    let broken = false;
    for (const d of t.deps) {
      if (!tasks.has(d)) { broken = true; continue; }
      const k = `${d}|${id}`;
      if (!flows.has(k)) flows.set(k, null);
    }
    if (broken) insights.push({ tipo: 'dependencia_quebrada', alvo: [id] });
  }
  const fwd = [...flows.entries()].map(([k, c]) => { const [de, para] = k.split('|'); return { de, para, condicao: c }; });
  const inc = (id) => fwd.filter((f) => f.para === id);
  const out = (id) => fwd.filter((f) => f.de === id);
  const starts = ids.filter((id) => inc(id).length === 0);
  const ends = ids.filter((id) => out(id).length === 0);
  for (const s of starts) fwd.push({ de: 'INICIO', para: s, condicao: null });
  for (const e of ends) fwd.push({ de: e, para: 'FIM', condicao: null });
  const back = [];
  for (const id of ids) {
    const t = tasks.get(id);
    if (t.volta) {
      back.push({ de: id, para: t.volta.para, condicao: 'retrabalho' });
      if (t.volta.limite === null) insights.push({ tipo: 'loop_sem_limite', alvo: [id, t.volta.para].sort(byId) });
    }
  }
  const fluxos = [...fwd, ...back].sort((a, b) => byId(a.de, b.de) || byId(a.para, b.para));

  // gateways (retrabalho flows never count)
  const gateways = [];
  for (const n of ['INICIO', ...ids, 'FIM']) {
    if (n !== 'INICIO' && n !== 'FIM' && tasks.get(n).decisao) gateways.push({ tipo: 'exclusivo', no: n });
    if (fwd.filter((f) => f.de === n && f.condicao === null).length >= 2) gateways.push({ tipo: 'paralelo', no: n });
    if (fwd.filter((f) => f.para === n).length >= 2) gateways.push({ tipo: 'juncao', no: n });
  }
  gateways.sort((a, b) => byId(a.no, b.no) || (a.tipo < b.tipo ? -1 : a.tipo > b.tipo ? 1 : 0));

  // critical path: longest INICIO->FIM path over forward flows, tie -> smaller id sequence
  let best = null;
  const walk = (n, path, mins) => {
    if (n === 'FIM') {
      if (!best || mins > best.minutos || (mins === best.minutos && cmpSeq(path, best.tarefas) < 0)) best = { tarefas: [...path], minutos: mins };
      return;
    }
    for (const f of fwd.filter((x) => x.de === n)) {
      if (f.para === 'FIM') walk('FIM', path, mins);
      else { path.push(f.para); walk(f.para, path, mins + tasks.get(f.para).duracao); path.pop(); }
    }
  };
  walk('INICIO', [], 0);
  const caminho_critico = best;

  // descendants via forward flows (without INICIO/FIM)
  const desc = (a) => {
    const seen = new Set(); const st = [a];
    while (st.length) { const n = st.pop(); for (const f of fwd) if (f.de === n && f.para !== 'FIM' && !seen.has(f.para)) { seen.add(f.para); st.push(f.para); } }
    return seen;
  };

  // paralelizar: dependency flow (condicao null, between tasks) where nothing the source gera is used by the target
  for (const f of fwd) {
    if (f.condicao !== null || f.de === 'INICIO' || f.para === 'FIM') continue;
    const a = tasks.get(f.de); const b = tasks.get(f.para);
    if (!a.gera.some((g) => b.usa.includes(g))) insights.push({ tipo: 'paralelizar', alvo: [f.de, f.para].sort(byId) });
  }
  // aprovacao_redundante
  for (const a of ids) for (const b of ids) {
    const ta = tasks.get(a); const tb = tasks.get(b);
    if (a === b || !ta.aprova || ta.aprova !== tb.aprova || ta.raia !== tb.raia) continue;
    if (desc(a).has(b)) insights.push({ tipo: 'aprovacao_redundante', alvo: [a, b].sort(byId) });
  }
  // gargalo: lane with > 50% of critical path minutes
  const porRaia = {};
  for (const id of caminho_critico.tarefas) porRaia[tasks.get(id).raia] = (porRaia[tasks.get(id).raia] ?? 0) + tasks.get(id).duracao;
  for (const [r, m] of Object.entries(porRaia)) if (m * 2 > caminho_critico.minutos) insights.push({ tipo: 'gargalo', alvo: [r] });
  // handoff_excessivo: 3+ lane changes along the critical path
  const recebe = [];
  const cp = caminho_critico.tarefas;
  for (let i = 1; i < cp.length; i++) if (tasks.get(cp[i]).raia !== tasks.get(cp[i - 1]).raia) recebe.push(cp[i]);
  if (recebe.length >= 3) insights.push({ tipo: 'handoff_excessivo', alvo: recebe.sort(byId) });

  insights.sort((x, y) => (x.tipo < y.tipo ? -1 : x.tipo > y.tipo ? 1 : 0) || cmpSeq(x.alvo, y.alvo));
  return { raias, fluxos, gateways, caminho_critico, insights };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const base = process.argv[2];
  const all = {};
  for (const c of readdirSync(base).sort()) all[c] = resolver(join(base, c));
  console.log(JSON.stringify(all, null, 2));
}
