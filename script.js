// Ken Collins personal site: small, plain JavaScript.
(function () {
  'use strict';

  var root = document.documentElement;

  // Theme toggle (remembers choice when storage is available)
  try {
    var saved = localStorage.getItem('kc-theme');
    if (saved) root.setAttribute('data-theme', saved);
  } catch (e) {}

  document.querySelector('.theme-btn').addEventListener('click', function () {
    var current = root.getAttribute('data-theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('kc-theme', next); } catch (e) {}
  });

  // Mobile menu
  var menuBtn = document.querySelector('.menu-btn');
  var links = document.querySelector('.links');
  menuBtn.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
  });
  links.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      links.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // Terminal typer
  var lines = [
    { p: '$ ', t: 'whoami' },
    { t: 'ken collins, web developer, martech, ai guy' },
    { p: '$ ', t: 'cat first_computer.txt' },
    { t: 'Apple IIe, late 80s' },
    { p: '$ ', t: 'df -h /mac-1993' },
    { t: '80MB ... 100% full (dad said it would last a lifetime)' },
    { p: '$ ', t: 'ask-ai "am I right?"' },
    { t: 'Absolutely! Great question!' },
    { p: '$ ', t: 'verify --trust-but' },
    { t: 'ok fine, double checking anyway...' }
  ];
  var typer = document.getElementById('typer');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  if (reduce) {
    typer.innerHTML = lines.map(function (l) {
      return (l.p ? '<span class="p">' + l.p + '</span>' : '') + esc(l.t);
    }).join('\n');
  } else {
    var li = 0, ci = 0, html = '';
    (function tick() {
      if (li >= lines.length) return;
      var line = lines[li];
      if (ci === 0 && line.p) html += '<span class="p">' + line.p + '</span>';
      if (ci < line.t.length) {
        html += esc(line.t.charAt(ci++));
        typer.innerHTML = html;
        setTimeout(tick, line.p ? 55 : 14);
      } else {
        html += '\n'; li++; ci = 0;
        typer.innerHTML = html;
        setTimeout(tick, line.p ? 250 : 650);
      }
    })();
  }

  // Count-up stats
  function countUp(el) {
    var target = +el.getAttribute('data-count');
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduce) { el.textContent = target.toLocaleString() + suffix; return; }
    var start = null, dur = 1200;
    function step(ts) {
      if (!start) start = ts;
      var k = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(target * eased).toLocaleString() + (k === 1 ? suffix : '');
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Reveal on scroll + stats trigger
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        if (en.target.hasAttribute('data-count')) countUp(en.target);
        else en.target.classList.add('in');
        io.unobserve(en.target);
      });
    }, { threshold: 0.2 });
    document.querySelectorAll('.reveal, [data-count]').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
    document.querySelectorAll('[data-count]').forEach(countUp);
  }

  // Project filters
  var chips = document.querySelectorAll('.chip');
  var cards = document.querySelectorAll('.card');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
      var f = chip.getAttribute('data-filter');
      cards.forEach(function (card) {
        var tags = card.getAttribute('data-tags').split(' ');
        card.classList.toggle('hide', f !== 'all' && tags.indexOf(f) === -1);
      });
    });
  });

  // Active nav link while scrolling
  var navLinks = document.querySelectorAll('.links a');
  var sections = Array.prototype.map.call(navLinks, function (a) {
    return document.querySelector(a.getAttribute('href'));
  });
  window.addEventListener('scroll', function () {
    var y = window.scrollY + 120;
    var current = -1;
    sections.forEach(function (s, i) { if (s && s.offsetTop <= y) current = i; });
    navLinks.forEach(function (a, i) { a.classList.toggle('active', i === current); });
  }, { passive: true });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
