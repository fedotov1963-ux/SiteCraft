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

// Автоперелистывание отключено: страницы плавно всплывают при прокрутке (reveal ниже),
// а листает только сам пользователь.

// Плавное появление блоков: всплывают на экране при попадании в зону видимости
(function reveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  if (!('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    items.forEach((el) => el.classList.add('visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  items.forEach((el) => io.observe(el));
})();

// Форма заявки: отправка на почту через formsubmit.co
const leadForm = document.getElementById('leadForm');
if (leadForm) {
  const status = document.getElementById('formStatus');
  leadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.className = 'form-status';
    status.textContent = 'Отправляем...';
    const data = Object.fromEntries(new FormData(leadForm).entries());
    try {
      const res = await fetch(leadForm.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      status.className = 'form-status ok';
      status.textContent = 'Заявка отправлена. Отвечу лично в течение рабочего дня.';
      leadForm.reset();
    } catch (err) {
      status.className = 'form-status err';
      status.textContent = 'Не получилось отправить. Напишите напрямую в Telegram или на почту.';
    }
  });
}

// Кнопка "Смотреть, что входит" ведёт к карточке выбранного в калькуляторе типа сайта
const calcCta = document.getElementById('calcCta');
if (calcCta) {
  calcCta.addEventListener('click', (e) => {
    e.preventDefault();
    const cards = document.querySelectorAll('.price-card');
    const target = cards[state.type];
    if (!target) return;
    document.getElementById('pricing').scrollIntoView({ behavior: 'smooth', block: 'start' });
    // на телефоне карточки листаются горизонтально - подводим нужную к центру
    if (window.matchMedia('(max-width: 900px)').matches) {
      const row = document.querySelector('.pricing');
      const left = target.offsetLeft - (row.clientWidth - target.offsetWidth) / 2;
      row.scrollTo({ left, behavior: 'smooth' });
    }
    cards.forEach((c) => c.classList.remove('flash'));
    setTimeout(() => {
      target.classList.add('flash');
      setTimeout(() => target.classList.remove('flash'), 1800);
    }, 600);
  });
}
