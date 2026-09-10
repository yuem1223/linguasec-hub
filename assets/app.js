const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const escapeHTML = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
const fullPackage = 'downloads/国家安全20领域语料_V3_JSONL.zip';

const state = { data: null, filtered: [], visible: 12, domain: '', language: '', risk: '', query: '' };

// Star field: layered drift, pointer parallax and occasional meteors.
const canvas = $('#starfield');
const context = canvas.getContext('2d');
let stars = [];
let meteors = [];
let pointer = { x: 0, y: 0 };
let lastMeteor = 0;

function resizeStars() {
  const ratio = Math.min(devicePixelRatio || 1, 2);
  canvas.width = innerWidth * ratio;
  canvas.height = innerHeight * ratio;
  canvas.style.width = `${innerWidth}px`;
  canvas.style.height = `${innerHeight}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  stars = Array.from({ length: Math.min(230, Math.floor(innerWidth * innerHeight / 5800)) }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    r: Math.random() * 1.4 + .2,
    depth: Math.random() * .8 + .2,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * .055 + .015
  }));
}

function drawSky(time) {
  context.clearRect(0, 0, innerWidth, innerHeight);
  for (const star of stars) {
    star.y -= star.speed * star.depth;
    if (star.y < -3) star.y = innerHeight + 3;
    const alpha = (.25 + star.depth * .58) * (.75 + Math.sin(time * .0014 + star.phase) * .25);
    context.beginPath();
    context.arc(star.x + pointer.x * star.depth * 13, star.y + pointer.y * star.depth * 13, star.r * star.depth, 0, Math.PI * 2);
    context.fillStyle = `rgba(183, 226, 255, ${alpha})`;
    context.fill();
  }
  if (time - lastMeteor > 6200 && Math.random() > .97) {
    meteors.push({ x: innerWidth * (.25 + Math.random() * .65), y: -20, life: 1, speed: 7 + Math.random() * 5 });
    lastMeteor = time;
  }
  meteors = meteors.filter((meteor) => meteor.life > 0);
  for (const meteor of meteors) {
    const gradient = context.createLinearGradient(meteor.x, meteor.y, meteor.x - 110, meteor.y - 55);
    gradient.addColorStop(0, `rgba(171,235,255,${meteor.life})`);
    gradient.addColorStop(1, 'rgba(112,216,255,0)');
    context.beginPath();
    context.moveTo(meteor.x, meteor.y);
    context.lineTo(meteor.x - 110, meteor.y - 55);
    context.strokeStyle = gradient;
    context.lineWidth = 1.4;
    context.stroke();
    meteor.x += meteor.speed;
    meteor.y += meteor.speed * .52;
    meteor.life -= .014;
  }
  requestAnimationFrame(drawSky);
}

addEventListener('resize', resizeStars);
addEventListener('pointermove', (event) => {
  pointer = { x: event.clientX / innerWidth - .5, y: event.clientY / innerHeight - .5 };
});
resizeStars();
requestAnimationFrame(drawSky);

// Global navigation and motion.
const menuButton = $('.menu-button');
const navigation = $('.main-nav');
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  navigation.classList.toggle('open', !open);
});
navigation.addEventListener('click', () => {
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
});

addEventListener('scroll', () => {
  const scrollMax = document.documentElement.scrollHeight - innerHeight;
  $('.reading-progress i').style.transform = `scaleX(${scrollMax > 0 ? scrollY / scrollMax : 0})`;
}, { passive: true });

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .12 });
$$('.reveal').forEach((element) => revealObserver.observe(element));

const sectionObserver = new IntersectionObserver((entries) => {
  const current = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!current) return;
  $$('.main-nav a').forEach((link) => link.classList.toggle('active', link.hash === `#${current.target.id}`));
}, { rootMargin: '-25% 0px -62% 0px', threshold: [0, .2] });
$$('main section[id]').forEach((section) => sectionObserver.observe(section));

function animateCounters() {
  $$('[data-count]').forEach((element) => {
    const target = Number(element.dataset.count);
    const started = performance.now();
    const run = (now) => {
      const progress = Math.min(1, (now - started) / 1200);
      element.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3))).toLocaleString('zh-CN');
      if (progress < 1) requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  });
}
setTimeout(animateCounters, 280);

$$('.tilt-card').forEach((card) => {
  card.addEventListener('pointermove', (event) => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    card.style.transform = `perspective(1100px) rotateX(${-y * 3.5}deg) rotateY(${x * 4.5}deg)`;
  });
  card.addEventListener('pointerleave', () => { card.style.transform = ''; });
});

function renderConstellation(domains) {
  const root = $('#constellation');
  root.innerHTML = domains.map((domain, index) => {
    const ring = index % 2 ? 39 : 47;
    const angle = (index / domains.length) * Math.PI * 2 - Math.PI / 2 + (index % 2 ? .1 : 0);
    const x = 50 + Math.cos(angle) * ring;
    const y = 50 + Math.sin(angle) * ring;
    const size = 5 + Math.sqrt(domain.count / 660) * 8;
    return `<button class="star-node" type="button" style="left:${x}%;top:${y}%;--size:${size}px" data-domain="${escapeHTML(domain.name)}" title="${escapeHTML(domain.name)}：${domain.count} 条">${escapeHTML(domain.name)}</button>`;
  }).join('');
  $$('.star-node', root).forEach((button) => button.addEventListener('click', () => {
    state.domain = button.dataset.domain;
    $('#domain-filter').value = state.domain;
    updateDownloadLink();
    filterRecords();
    $('#corpus').scrollIntoView({ behavior: 'smooth' });
  }));
}

function renderDownloads(domains) {
  $('#domain-download-grid').innerHTML = domains.map((domain) => `
    <a class="domain-download" href="${encodeURI(domain.file)}" download>
      <div><b>${escapeHTML(domain.name)}</b><small>${domain.count.toLocaleString('zh-CN')} 条 · JSONL</small></div><span>↓</span>
    </a>`).join('');
}

function populateFilters(domains) {
  $('#domain-filter').insertAdjacentHTML('beforeend', domains.map((domain) => `<option value="${escapeHTML(domain.name)}">${escapeHTML(domain.name)}（${domain.count}）</option>`).join(''));
}

function filterRecords() {
  if (!state.data) return;
  const query = state.query.toLowerCase();
  state.filtered = state.data.records.filter((record) => {
    const searchable = `${record.text} ${record.label} ${record.source} ${record.domain} ${record.id}`.toLowerCase();
    return (!state.domain || record.domain === state.domain)
      && (!state.language || record.sourceLanguage.startsWith(state.language))
      && (!state.risk || record.risk === state.risk)
      && (!query || searchable.includes(query));
  });
  state.visible = 12;
  renderRecords();
}

function renderRecords() {
  const list = $('#record-list');
  const rows = state.filtered.slice(0, state.visible);
  $('#result-count').textContent = state.filtered.length.toLocaleString('zh-CN');
  $('#results-title').textContent = state.domain || '全部语料';
  $('#load-state').textContent = `显示 ${Math.min(state.visible, state.filtered.length).toLocaleString('zh-CN')} / ${state.filtered.length.toLocaleString('zh-CN')} 条`;
  list.innerHTML = rows.map((record) => `
    <article class="record-card" tabindex="0" role="button" data-record="${escapeHTML(record.id)}" aria-label="查看语料 ${escapeHTML(record.id)} 详情">
      <div class="record-meta"><span>${escapeHTML(record.domain)}</span><span>${escapeHTML(record.label)}</span><span>${escapeHTML(record.risk)}</span><span>${escapeHTML(record.sourceLanguage)}</span></div>
      <blockquote>${escapeHTML(record.text)}</blockquote>
      <footer><span>${escapeHTML(record.source)} · ${escapeHTML(record.published)}</span><span>${escapeHTML(record.id)} ↗</span></footer>
    </article>`).join('');
  const empty = $('#empty-results');
  empty.hidden = state.filtered.length > 0;
  $('#load-more').hidden = state.visible >= state.filtered.length;
  $$('.record-card', list).forEach((card) => {
    const open = () => openRecord(card.dataset.record);
    card.addEventListener('click', open);
    card.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); } });
  });
}

function updateDownloadLink() {
  const selected = state.data?.domains.find((domain) => domain.name === state.domain);
  $('#domain-download').href = selected ? encodeURI(selected.file) : fullPackage;
  $('#download-label').textContent = selected ? `${selected.name} · ${selected.count} 条 JSONL` : '完整 JSONL 数据包';
}

function openRecord(id) {
  const record = state.data.records.find((item) => item.id === id);
  if (!record) return;
  $('#record-detail').innerHTML = `
    <span class="dialog-kicker">CORPUS RECORD · ${escapeHTML(record.id)}</span>
    <h2>${escapeHTML(record.text)}</h2>
    <div class="detail-meta"><span>${escapeHTML(record.domain)}</span><span>${escapeHTML(record.label)}</span><span>${escapeHTML(record.risk)}</span><span>${escapeHTML(record.sourceLanguage)}</span></div>
    <div class="detail-context"><p>${escapeHTML(record.before || '（无前文）')}</p><blockquote>${escapeHTML(record.text)}</blockquote><p>${escapeHTML(record.after || '（无后文）')}</p></div>
    <div class="detail-grid"><div><small>来源</small><b>${escapeHTML(record.source)}</b></div><div><small>发布时间</small><b>${escapeHTML(record.published)}</b></div><div><small>证据与置信度</small><b>${escapeHTML(record.evidence)} · ${escapeHTML(record.confidence)}</b></div><div><small>目标国别</small><b>${escapeHTML(record.targetCountry)}</b></div></div>
    ${record.url ? `<a class="button ghost source-button" href="${escapeHTML(record.url)}" target="_blank" rel="noopener">打开原始来源 <span>↗</span></a>` : ''}`;
  $('#record-dialog').showModal();
}

const searchInput = $('#record-search');
let searchTimer;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => { state.query = searchInput.value.trim(); filterRecords(); }, 180);
});
$('#domain-filter').addEventListener('change', (event) => { state.domain = event.target.value; updateDownloadLink(); filterRecords(); });
$('#language-filter').addEventListener('change', (event) => { state.language = event.target.value; filterRecords(); });
$('#risk-filter').addEventListener('change', (event) => { state.risk = event.target.value; filterRecords(); });
$('#reset-filters').addEventListener('click', () => {
  state.domain = ''; state.language = ''; state.risk = ''; state.query = '';
  searchInput.value = ''; $('#domain-filter').value = ''; $('#language-filter').value = ''; $('#risk-filter').value = '';
  updateDownloadLink(); filterRecords();
});
$('#load-more').addEventListener('click', () => { state.visible += 12; renderRecords(); });

$$('[data-open-note]').forEach((button) => button.addEventListener('click', () => $('#note-dialog').showModal()));
$$('dialog').forEach((dialog) => {
  $('.dialog-close', dialog).addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
});

// Four-language application demo.
const demoAnswers = {
  elevator: {
    zh: '火灾时不要乘坐普通电梯。请优先按疏散标志使用安全出口和楼梯撤离；如现场已有消防救援人员，请遵循指挥。',
    en: 'Do not use a regular elevator during a fire. Follow evacuation signs and use a safe stairway. If firefighters are present, follow their instructions.',
    ja: '火災時は通常のエレベーターを使用しないでください。避難標識に従い、安全な階段で避難してください。',
    ko: '화재 시 일반 엘리베이터를 사용하지 마세요. 피난 표지를 따라 안전한 계단으로 대피하세요.'
  },
  smoke: {
    zh: '先用手背试探门板与门把温度。如果发烫或楼道浓烟很大，不要贸然开门；退回室内封堵门缝，拨打 119 并在窗边发出求救信号。',
    en: 'Check the door and handle with the back of your hand. If they are hot or the hallway is heavily smoked, keep the door closed, seal gaps, call emergency services, and signal from a window.',
    ja: '手の甲でドアとドアノブの温度を確認してください。熱い場合や廊下に濃煙がある場合は開けず、雙間をふさぎ救助を要請します。',
    ko: '손등으로 문과 손잡이의 온도를 확인하세요. 뜨겁거나 복도에 연기가 많으면 문을 열지 말고 틈을 막은 후 구조를 요청하세요.'
  },
  trapped: {
    zh: '请尽量保持冷静，立即拨打 119，说清具体地址、楼层、房间与人数。关闭面向火势的门，用湿布封堵门缝，到窗边用明显物品发出求救信号。',
    en: 'Stay as calm as possible. Call emergency services and clearly state your address, floor, room, and number of people. Close doors toward the fire, seal gaps, and signal clearly from a window.',
    ja: 'できるだけ落ち着いて救急通報し、住所、階、部屋、人数を正確に伝えてください。火の方向のドアを閉め、窓から明確な救助信号を出します。',
    ko: '최대한 침착하게 긴급 신고를 하고 주소, 층, 방, 인원을 정확히 알리세요. 불이 있는 방향의 문을 닫고 창가에서 분명한 구조 신호를 보내세요.'
  }
};
let demoLanguage = 'zh';
let demoScenario = 'elevator';
function renderDemo() {
  $('#demo-answer').innerHTML = `<span>RAG RESPONSE / ${demoLanguage.toUpperCase()}</span><p>${escapeHTML(demoAnswers[demoScenario][demoLanguage])}</p><small>参考：逃生表达模板 · 安全沟通规则</small>`;
}
$$('.lang').forEach((button) => button.addEventListener('click', () => {
  demoLanguage = button.dataset.lang;
  $$('.lang').forEach((item) => { item.classList.toggle('active', item === button); item.setAttribute('aria-selected', String(item === button)); });
  renderDemo();
}));
$$('.scenario').forEach((button) => button.addEventListener('click', () => {
  demoScenario = button.dataset.scenario;
  $$('.scenario').forEach((item) => item.classList.toggle('active', item === button));
  renderDemo();
}));
renderDemo();

fetch('assets/corpus-records.json')
  .then((response) => { if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.json(); })
  .then((data) => {
    state.data = data;
    state.filtered = data.records;
    populateFilters(data.domains);
    renderConstellation(data.domains);
    renderDownloads(data.domains);
    updateDownloadLink();
    renderRecords();
  })
  .catch(() => {
    $('#load-state').textContent = '数据加载失败';
    $('#record-list').innerHTML = '<div class="empty-results"><h3>无法读取语料数据</h3><p>请使用本地网站服务或通过 GitHub Pages 访问。</p></div>';
  });
