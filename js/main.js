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
  { label: 'Визитка', price: 18000, term: 4 },
  { label: 'Лендинг', price: 28000, term: 6 },
  { label: 'Лендинг+', price: 42000, term: 10 },
];
const OPT_PRICE = 4000;
const OPT_TERM_DAYS = 1;

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

// Гарантия "один блок - один экран": если содержимое секции выше видимой
// области, аккуратно уменьшаем масштаб, чтобы весь блок (заголовок,
// текст и кнопки) помещался и не уходил под шапку.
// На компьютере блок с формой заявки и подвал считаются одним целым.
(function fitSections() {
  const mobile = window.matchMedia('(max-width: 900px)');
  const HEADER = 64;   // высота фиксированной шапки с брендом (телефон)
  const HEADER_D = 76; // высота фиксированной шапки (компьютер)
  const GAP = 12;      // небольшой воздух снизу экрана
  // высота элемента с учётом отступов: защита от схлопывания margin
  function outerHeight(el) {
    const m = getComputedStyle(el);
    return el.getBoundingClientRect().height +
      parseFloat(m.marginTop) + parseFloat(m.marginBottom);
  }
  // вертикальные отступы и рамки самого блока
  function padV(el) {
    const m = getComputedStyle(el);
    return parseFloat(m.paddingTop) + parseFloat(m.paddingBottom) +
      parseFloat(m.borderTopWidth) + parseFloat(m.borderBottomWidth);
  }
  function zoomToFit(wrap, contentH, avail, floor) {
    const min = floor || 0.6;
    if (contentH > avail) {
      wrap.style.zoom = Math.max(min, ((avail - 2) / contentH).toFixed(3));
    }
  }
  // надписи-ярлыки секций ("Как работаем", "Цены" и т.д.) - одного
  // видимого размера на экране независимо от масштаба своей секции
  function keepLabelSize(wrap) {
    const lbl = wrap.querySelector('.section-label');
    if (!lbl) return;
    lbl.style.fontSize = '';
    const base = parseFloat(getComputedStyle(lbl).fontSize);
    const z = parseFloat(wrap.style.zoom) || 1;
    if (z !== 1) lbl.style.fontSize = (base / z).toFixed(1) + 'px';
  }
  function fit() {
    const vh = window.innerHeight;
    // сброс ручной ширины блоков (пересчитывается ниже на компьютере)
    document.querySelectorAll('#services .svc-list, #author .author-box, #pricing .pricing')
      .forEach((el) => { el.style.width = ''; el.style.marginLeft = ''; el.style.marginRight = ''; });
    if (mobile.matches) {
      // телефон: каждая секция и подвал целиком на экране
      document.querySelectorAll('section, footer').forEach((sec) => {
        const wrap = sec.classList.contains('hero')
          ? sec.querySelector('.hero-inner')
          : sec.querySelector(':scope > .container');
        sec.style.minHeight = '';
        if (wrap) wrap.style.zoom = '';
        if (!wrap) return;
        // JS-замена 100svh: innerHeight - это реальная видимая высота экрана,
        // работает даже в браузерах без поддержки svh (Samsung Internet и др.)
        sec.style.minHeight = vh + 'px';
        const avail = vh - HEADER - GAP;
        const h = [...wrap.children].reduce((sum, el) => sum + outerHeight(el), 0);
        zoomToFit(wrap, h, avail);
        keepLabelSize(wrap);
      });
      return;
    }
    // компьютер: каждая секция - один экран, контент с отступами секции
    document.querySelectorAll('section').forEach((sec) => {
      if (sec.closest('.tail')) return;
      const isHero = sec.classList.contains('hero');
      const wrap = isHero ? sec.querySelector('.hero-inner') : sec.querySelector(':scope > .container');
      sec.style.minHeight = vh + 'px';
      if (!wrap) return;
      wrap.style.zoom = '';
      // контент центрируется CSS-ом в области под шапкой (padding-top
      // секции = высоте шапки): доступная высота - только видимая часть
      // экрана ниже шапки с воздухом снизу
      const avail = isHero
        ? vh - GAP - padV(wrap)
        : vh - GAP - HEADER_D;
      const h = isHero
        ? [...wrap.children].reduce((sum, el) => sum + outerHeight(el), 0)
        : outerHeight(wrap);
      // авто-масштаб секций с крупным текстом ослаблен (не ниже 0.85):
      // услуги, биография и цены должны читаться так же крупно,
      // как блоки "Как работаем"
      const BIG_TEXT = { author: 1, services: 1, pricing: 1 };
      zoomToFit(wrap, h, avail, BIG_TEXT[sec.id] ? 0.85 : undefined);
      keepLabelSize(wrap);
      // защита от обрезки заголовка: если контент даже на минимальном
      // масштабе выше экрана, не даём центрированию утащить его верх
      // под фиксированную шапку - прижимаем содержимое к верху секции
      const overflowTop = wrap.getBoundingClientRect().height - avail > 2;
      sec.style.justifyContent = overflowTop ? 'flex-start' : '';
    });
    // блоки в секциях услуг, автора и цен - визуально той же ширины,
    // что и блоки этапов: компенсируем только собственный масштаб секции
    document.querySelectorAll('#services .svc-list, #author .author-box, #pricing .pricing')
      .forEach((inner) => {
        const sec = inner.closest('section');
        const wrap = sec && sec.querySelector(':scope > .container');
        if (!wrap) return;
        const z = parseFloat(wrap.style.zoom) || 1;
        const w = wrap.clientWidth / z;
        inner.style.width = w + 'px';
        // браузер не центрирует блок шире контейнера через margin: auto -
        // задаём отступы явно, чтобы блок стоял по центру секции
        const m = (wrap.clientWidth - w) / 2;
        inner.style.marginLeft = m + 'px';
        inner.style.marginRight = m + 'px';
      });
    // блок с формой заявки + подвал - один общий экран
    const tail = document.querySelector('.tail');
    if (tail) {
      const fin = tail.querySelector('section.final');
      const foot = tail.querySelector('footer');
      const fw = fin ? fin.querySelector(':scope > .container') : null;
      const gw = foot ? foot.querySelector('.footer-grid') : null;
      tail.style.minHeight = vh + 'px';
      [fw, gw].forEach((w) => { if (w) w.style.zoom = ''; });
      if (fin && foot) {
        const avail = vh - GAP - HEADER_D;
        const h = outerHeight(fin) + outerHeight(foot);
        if (h > avail) {
          const z = Math.max(0.5, ((avail - 2) / h).toFixed(3));
          if (fw) fw.style.zoom = z;
          if (gw) gw.style.zoom = z;
        }
      }
    }
  }
  fit();
  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', () => setTimeout(fit, 250));
  window.addEventListener('load', fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);

  // если страница открыта с якорем (#services и т.д.), подгонка высот
  // секций сдвигает макет - возвращаемся к нужному блоку после пересчёта,
  // пока пользователь сам не начал скроллить
  let userScrolled = false;
  let programmaticScroll = false;
  window.addEventListener('scroll', () => {
    if (!programmaticScroll) userScrolled = true;
  }, { passive: true });
  function settleToHash() {
    if (userScrolled || !location.hash) return;
    const t = document.querySelector(location.hash);
    if (!t) return;
    programmaticScroll = true;
    // секции прилипают к верху окна (scroll-padding 0): просто к их верхней
    // границе - шапка перекрывает только отступ секции
    const top = t.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, Math.max(0, top));
    requestAnimationFrame(() => { programmaticScroll = false; });
  }
  window.addEventListener('load', settleToHash);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(settleToHash);
})();

// Кнопка "Смотреть, что входит" ведёт к карточке выбранного в калькуляторе типа сайта
const calcCta = document.getElementById('calcCta');
if (calcCta) {
  calcCta.addEventListener('click', (e) => {
    e.preventDefault();
    const cards = document.querySelectorAll('.price-card');
    const target = cards[state.type];
    if (!target) return;
    const pr = document.getElementById('pricing');
    const pTop = pr.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: Math.max(0, pTop), behavior: 'smooth' });
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
