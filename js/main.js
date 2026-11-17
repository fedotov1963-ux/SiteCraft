// SiteCraft — простые интерактивные элементы
// Никаких внешних библиотек и внешних запросов — безопасно по умолчанию.

document.addEventListener('DOMContentLoaded', () => {
  // Плавный скролл к якорям
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Подсветка активного пункта меню при скролле
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-list a');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle(
            'active',
            link.getAttribute('href') === '#' + entry.target.id
          );
        });
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );

  sections.forEach((section) => observer.observe(section));
});
