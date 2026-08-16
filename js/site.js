document.addEventListener('DOMContentLoaded', function () {
  const header = document.querySelector('[data-site-header]');
  const button = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.mobile-menu');
  const starTargets = document.querySelectorAll('[data-github-stars]');

  function setScrolledState() {
    if (header) {
      header.classList.toggle('is-scrolled', window.scrollY > 10);
    }
  }

  function displayGithubStars(count) {
    const formatted = new Intl.NumberFormat('fr-FR', { notation: count >= 1000 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(count);
    starTargets.forEach(function (target) {
      target.textContent = formatted;
      target.title = count + (count > 1 ? ' étoiles GitHub' : ' étoile GitHub');
    });
  }

  if (starTargets.length) {
    const cacheKey = 'pool-pilot:github-stars';
    const cacheDuration = 60 * 60 * 1000;
    let cached = null;

    try {
      cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
    } catch (error) {
      cached = null;
    }

    if (cached && Number.isFinite(cached.count)) {
      displayGithubStars(cached.count);
    }

    if (!cached || !cached.updated || Date.now() - cached.updated > cacheDuration) {
      fetch('https://api.github.com/repos/amery74/ha-poolpilot', {
        headers: { Accept: 'application/vnd.github+json' }
      })
        .then(function (response) {
          if (!response.ok) throw new Error('GitHub API ' + response.status);
          return response.json();
        })
        .then(function (repo) {
          if (!Number.isFinite(repo.stargazers_count)) return;
          displayGithubStars(repo.stargazers_count);
          try {
            localStorage.setItem(cacheKey, JSON.stringify({ count: repo.stargazers_count, updated: Date.now() }));
          } catch (error) {}
        })
        .catch(function () {
          if (!cached) {
            starTargets.forEach(function (target) { target.textContent = ''; });
          }
        });
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
