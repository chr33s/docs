(function() {
  'use strict';

  // Jquery.$ selector

  const $ = function $(el) {
    try {
      return document.querySelector(el);
    } catch (e) {
      return null;
    }
  };

  const $$ = function $$(el) {
    try {
      return document.querySelectorAll(el);
    } catch (e) {
      return null;
    }
  };

  // cross-browser $(el).scrollIntoView

  function scrollTo(el, duration) {
    duration = duration || 1000;
    const startingY = window.pageYOffset;
    const elementY = window.pageYOffset + el.getBoundingClientRect().top;
    const targetY =
      document.body.scrollHeight - elementY < window.innerHeight
        ? document.body.scrollHeight - window.innerHeight
        : elementY;
    const diff = targetY - startingY;
    const easing = function(t) {
      return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    };
    let start;

    if (!diff) return;

    window.requestAnimationFrame(function step(timestamp) {
      if (!start) start = timestamp;
      const time = timestamp - start;
      let percent = Math.min(time / duration, 1);
      percent = easing(percent);

      window.scrollTo(0, startingY + diff * percent);

      if (time < duration) {
        window.requestAnimationFrame(step);
      }
    });
  }

  // Language selector

  function language(el, show) {
    const code = $$('.language-' + el.getAttribute('data-language'));
    for (let i = 0; i < code.length; i++) {
      code[i].classList[show ? 'remove' : 'add']('hide');
    }
  }

  function select(el, active) {
    if (active) {
      window.localStorage.setItem('language', el.getAttribute('data-language'));
    }
    el.classList[active ? 'add' : 'remove']('active');
    language(el, active);
  }

  // hash

  function hash(el) {
    return '#' + el.href.split('#').pop();
  }

  const languages = $$('.language > a');
  for (let i = 0; i < languages.length; i++) {
    language(languages[i], false);

    languages[i].addEventListener('click', function(e) {
      e.preventDefault();

      for (let ii = 0; ii < languages.length; ii++) {
        select(languages[ii], false);
      }

      select(languages[i], true);
    });
  }

  const selected = window.localStorage.getItem('language');
  if (selected) {
    const el = $('[data-language="' + selected + '"]');
    select(el, true);
  } else {
    select(languages[0], true);
  }

  // Smooth scroll links

  const hrefs = $$('a[href*="#"]');
  for (let i = 0; i < hrefs.length; i++) {
    hrefs[i].addEventListener('click', function(e) {
      e.preventDefault();

      const href = hash(hrefs[i]);
      scrollTo($(href));
    });
  }

  // Nav sync sync

  const navs = $$('#toc a');
  for (let i = 0; i < navs.length; i++) {
    const href = hash(navs[i]);
    const element = $(href);

    if (!element) continue;

    // eslint-disable-next-line no-unused-vars
    const _ = new window.Waypoint({
      handler: function() {
        for (let ii = 0; ii < navs.length; ii++) {
          $('nav a[href="' + hash(navs[ii]) + '"]').classList.remove('active');
        }
        $('nav a[href="' + href + '"]').classList.add('active');
      },
      element
    });
  }
})();
