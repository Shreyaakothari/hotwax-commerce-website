(function () {
  if (window.hwMotion) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(onView, { threshold: 0.35 }) : null;

  function shown(svg) {
    return svg.getClientRects().length > 0;
  }

  function waiting(svg) {
    return !!svg.closest('[inert]') || !shown(svg);
  }

  function play(svg) {
    if (reduce.matches) return;
    svg._started = true;
    svg._done = false;
    svg.classList.remove('is-live', 'is-paused');
    void svg.getBoundingClientRect();
    svg.classList.add('is-live');
  }

  function onView(entries) {
    entries.forEach(function (entry) {
      var svg = entry.target;
      if (entry.isIntersecting) {
        if (!svg._started && !waiting(svg)) {
          play(svg);
        } else if (svg._started) {
          svg.classList.remove('is-paused');
        }
      } else if (svg.classList.contains('is-live') && svg._started && !svg._done) {
        svg.classList.add('is-paused');
      }
    });
  }

  var copies = 0;

  /* If the same graphic appears twice on a page, give this copy its own ids */
  function ownIds(svg) {
    var first = svg.querySelector('[id]');
    if (!first || document.querySelectorAll('[id="' + first.id + '"]').length < 2) return;
    var suffix = '-c' + (++copies);
    svg.querySelectorAll('[id]').forEach(function (el) { el.id += suffix; });
    svg.querySelectorAll('use').forEach(function (el) {
      var ref = el.getAttribute('href');
      if (ref && ref.charAt(0) === '#') el.setAttribute('href', ref + suffix);
    });
    svg.querySelectorAll('[filter], [fill], [stroke]').forEach(function (el) {
      ['filter', 'fill', 'stroke'].forEach(function (attr) {
        var v = el.getAttribute(attr);
        if (v && v.indexOf('url(#') === 0) el.setAttribute(attr, v.replace(/\)$/, suffix + ')'));
      });
    });
  }

  function setUp(svg) {
    if (svg._hwm) return;
    svg._hwm = true;
    ownIds(svg);
    var clock = svg.querySelector('.clock');
    if (clock) {
      clock.addEventListener('animationend', function () { svg._done = true; });
    }
    if (reduce.matches || !io) return;
    svg.classList.add('is-live', 'is-paused');
    io.observe(svg);
  }

  function init(root) {
    (root || document).querySelectorAll('svg[data-hwm]').forEach(setUp);
  }

  window.hwMotion = {
    init: init,
    playIn: function (root) {
      root.querySelectorAll('svg[data-hwm]').forEach(function (svg) {
        setUp(svg);
        if (shown(svg)) play(svg);
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(); });
  } else {
    init();
  }
})();
