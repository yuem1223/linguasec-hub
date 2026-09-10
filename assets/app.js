const grid = document.querySelector('#domain-grid');
const search = document.querySelector('#domain-search');
const empty = document.querySelector('#empty-state');
let currentFilter = 'all';

function renderDomains() {
  const query = search.value.trim().toLowerCase();
  const rows = window.DOMAIN_DATA.filter((item) => {
    const matchesQuery = `${item.name}${item.desc}`.toLowerCase().includes(query);
    const matchesFilter = currentFilter === 'all' ||
      (currentFilter === 'dual' && item.lang === 'dual') ||
      (currentFilter === 'emerging' && item.group === 'emerging');
    return matchesQuery && matchesFilter;
  });
  grid.innerHTML = rows.map((item, index) => `
    <article class="domain-card" tabindex="0">
      <div class="card-top"><span>${String(index + 1).padStart(2, '0')}</span><span>${item.lang === 'dual' ? '中 / EN' : item.lang === 'zh' ? '中文' : 'EN'}</span></div>
      <h3>${item.name}</h3>
      <p>${item.desc}</p>
      <div class="card-foot"><span><strong>${item.count}</strong> 条候选标注</span><i style="--w:${Math.max(6, item.count / 660 * 100)}%"></i></div>
    </article>`).join('');
  empty.hidden = rows.length > 0;
}

document.querySelectorAll('.filter').forEach((button) => button.addEventListener('click', () => {
  currentFilter = button.dataset.filter;
  document.querySelectorAll('.filter').forEach((item) => item.classList.toggle('active', item === button));
  renderDomains();
}));
search.addEventListener('input', renderDomains);

const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.main-nav');
menuButton.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!expanded));
  nav.classList.toggle('open', !expanded);
});

nav.addEventListener('click', () => {
  menuButton.setAttribute('aria-expanded', 'false');
  nav.classList.remove('open');
});

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
let demoLang = 'zh';
let demoScenario = 'elevator';
const answerBox = document.querySelector('#demo-answer');
function updateDemo() {
  answerBox.innerHTML = `<span>RAG RESPONSE / ${demoLang.toUpperCase()}</span><p>${demoAnswers[demoScenario][demoLang]}</p><small>参考：逃生表达模板 · 安全沟通规则</small>`;
}
document.querySelectorAll('.lang').forEach((button) => button.addEventListener('click', () => {
  demoLang = button.dataset.lang;
  document.querySelectorAll('.lang').forEach((item) => {
    item.classList.toggle('active', item === button);
    item.setAttribute('aria-selected', String(item === button));
  });
  updateDemo();
}));
document.querySelectorAll('.scenario').forEach((button) => button.addEventListener('click', () => {
  demoScenario = button.dataset.scenario;
  document.querySelectorAll('.scenario').forEach((item) => item.classList.toggle('active', item === button));
  updateDemo();
}));

const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.main-nav a')];
const observer = new IntersectionObserver((entries) => {
  const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  navLinks.forEach((link) => link.classList.toggle('active', link.hash === `#${visible.target.id}`));
}, { rootMargin: '-25% 0px -60% 0px', threshold: [0, .2, .5] });
sections.forEach((section) => observer.observe(section));

renderDomains();
updateDemo();
