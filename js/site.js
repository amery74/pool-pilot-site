document.addEventListener('DOMContentLoaded', function () {
  const header = document.querySelector('[data-site-header]');
  const button = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.mobile-menu');

  function setScrolledState() {
    if (header) {
      header.classList.toggle('is-scrolled', window.scrollY > 10);
    }
  }

  setScrolledState();
  window.addEventListener('scroll', setScrolledState, { passive: true });

  if (!button || !menu) {
    return;
  }

  function closeMenu() {
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Ouvrir le menu');
    menu.hidden = true;
    document.body.classList.remove('menu-open');
  }

  function openMenu() {
    button.setAttribute('aria-expanded', 'true');
    button.setAttribute('aria-label', 'Fermer le menu');
    menu.hidden = false;
    document.body.classList.add('menu-open');
  }

  button.addEventListener('click', function () {
    const open = button.getAttribute('aria-expanded') === 'true';
    if (open) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 1040) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });
});
