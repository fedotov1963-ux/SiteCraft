// Шапка при скролле
const header = document.getElementById('header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Мобильное меню
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
burger.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
});
mobileMenu.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') mobileMenu.classList.remove('open');
});

// Калькулятор стоимости сайта
const TYPES = [
  { label: 'Лендинг', price: 60000, term: 14 },
  { label: 'Корпоративный', price: 120000, term: 30 },
  { label: 'Магазин', price: 200000, term: 45 },
];
const OPT_PRICE = 15000;
const OPT_TERM_DAYS = 2;

const state = { type: 0, opts: 1 };
const fmt = (n) => n.toLocaleString('ru-RU');

function declDays(n) {
  const mod10 = n % 10, mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'день';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'дня';
  return 'дней';
}

function render() {
  const t = TYPES[state.type];
  document.getElementById('typeVal').textContent = t.label;
  document.getElementById('optsVal').textContent = state.opts;
  const budget = t.price + state.opts * OPT_PRICE;
  const days = t.term + state.opts * OPT_TERM_DAYS;
  document.getElementById('budget').innerHTML = fmt(budget) + ' <small>₽</small>';
  document.getElementById('termOut').innerHTML = days + ' <small>' + declDays(days) + '</small>';
}

document.querySelectorAll('.stepper button').forEach((btn) => {
  btn.addEventListener('click', () => {
    const dir = Number(btn.dataset.dir);
    if (btn.dataset.target === 'type') {
      state.type = (state.type + dir + TYPES.length) % TYPES.length;
    } else {
      state.opts = Math.min(5, Math.max(0, state.opts + dir));
    }
    render();
  });
});
render();

// Автоматическое плавное перелистывание секций
(function autoFlip() {
  // не мешаем людям с настройкой "уменьшить анимацию"
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ids = ['top', 'steps', 'services', 'cases', 'author', 'pricing', 'faq', 'contacts'];
  const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
  if (!els.length) return;

  const INTERVAL = 7000;   // секунда на секцию
  const PAUSE_AFTER_ACTION = 15000; // пауза после действия пользователя
  let paused = false;
  let resumeTimer = null;

  function currentIndex() {
    const y = window.scrollY + window.innerHeight * 0.4;
    for (let i = 0; i < els.length; i++) {
      if (els[i].offsetTop > y) return Math.max(0, i - 1);
    }
    return els.length - 1;
  }

  function go(i) {
    const next = (i + els.length) % els.length; // в конце - снова наверх
    els[next].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function userPause() {
    paused = true;
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => { paused = false; }, PAUSE_AFTER_ACTION);
  }

  // пользователь листает сам (колесо, касание, клавиши) - даём ему управление
  ['wheel', 'touchstart', 'keydown'].forEach((ev) =>
    window.addEventListener(ev, userPause, { passive: true }));

  setInterval(() => {
    if (paused || document.hidden) return;
    go(currentIndex() + 1);
  }, INTERVAL);
})();
