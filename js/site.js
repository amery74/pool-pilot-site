document.addEventListener('DOMContentLoaded', function () {
  const button = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');

  if (!button || !nav) {
    return;
  }

  button.addEventListener('click', function () {
    const open = nav.classList.toggle('open');
    button.setAttribute('aria-expanded', String(open));
  });

  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('open');
      button.setAttribute('aria-expanded', 'false');
    });
  });
});
