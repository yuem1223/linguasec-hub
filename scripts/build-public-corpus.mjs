import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve(import.meta.dirname, '..');
const sourceRoot = path.resolve(projectRoot, '..', '03_JSONL标注_V3');
const jsonlRoot = path.join(projectRoot, 'downloads', 'jsonl');
const assetRoot = path.join(projectRoot, 'assets');
fs.mkdirSync(jsonlRoot, { recursive: true });

const files = fs.readdirSync(sourceRoot).filter((name) => name.endsWith('.jsonl')).sort((a, b) => a.localeCompare(b, 'zh-CN'));
const records = [];
const domains = [];
const labels = new Map();

function extractNotes(notes = '') {
  const source = notes.match(/来源=([^;；]+)/)?.[1] || '未标注';
  const url = notes.match(/链接=(https?:\/\/[^;；]+)/)?.[1] || '';
  const published = notes.match(/发布时间=([^;；]+)/)?.[1] || '未知';
  return { source, url, published };
}

for (const file of files) {
  const domain = file.replace(/\.jsonl$/, '');
  const raw = fs.readFileSync(path.join(sourceRoot, file), 'utf8');
  fs.copyFileSync(path.join(sourceRoot, file), path.join(jsonlRoot, file));
  const rows = raw.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
  const risks = { R2: 0, R3: 0 };
  const languages = new Set();
  for (const row of rows) {
    const note = extractNotes(row.notes);
    risks[row.risk_level] = (risks[row.risk_level] || 0) + 1;
    languages.add(row.source_language);
    labels.set(row.primary_label, (labels.get(row.primary_label) || 0) + 1);
    records.push({
      id: row.record_id,
      domain,
      text: row.span_text,
      before: row.context_before,
      after: row.context_after,
      sourceLanguage: row.source_language,
      targetCountry: row.target_country,
      label: row.primary_label,
      risk: row.risk_level,
      evidence: row.evidence_grade,
      confidence: row.confidence,
      trigger: row.trigger_condition,
      source: note.source,
      url: note.url,
      published: note.published
    });
  }
  domains.push({ name: domain, count: rows.length, risks, languages: [...languages], file: `downloads/jsonl/${file}` });
}

const publicData = {
  meta: {
    title: '多国别应急语言禁忌标注·国家安全 20 领域',
    version: 'V3',
    generated: '2026-08-14',
    records: records.length,
    domains: domains.length,
    notice: '全部为 P0 候选敏感项，证据等级 C，置信度低，需专家复核。'
  },
  domains,
  labels: [...labels].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
  records
};

fs.writeFileSync(path.join(assetRoot, 'corpus-records.json'), JSON.stringify(publicData));
fs.writeFileSync(path.join(projectRoot, 'downloads', 'schema.json'), JSON.stringify({
  format: 'JSON Lines',
  encoding: 'UTF-8',
  recordCount: records.length,
  fields: {
    record_id: '记录唯一编号', document_id: '原始文档定位编号', span_text: '候选表达片段',
    context_before: '前文语境', context_after: '后文语境', source_language: '源语言', primary_label: '主标签',
    risk_level: '风险级别', trigger_condition: '触发条件', evidence_grade: '证据等级', confidence: '置信度', notes: '来源与备注'
  }
}, null, 2));

console.log(JSON.stringify({ records: records.length, domains: domains.length, labels: labels.size }));
