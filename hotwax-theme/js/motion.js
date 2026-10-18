(function () {
  if (window.hwMotion) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(onView, { threshold: [0, 0.35] }) : null;
  var copies = 0;

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
      svg._inView = entry.intersectionRatio >= 0.35;
      if (svg._inView) {
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

  /* If the same graphic appears twice on a page, give this copy its own ids (kept inside the prefix) */
  function ownIds(svg) {
    var first = svg.querySelector('[id]');
    if (!first || document.querySelectorAll('[id="' + first.id + '"]').length < 2) return;
    var mark = 'c' + (++copies) + '-';
    var rename = function (id) { return id.replace(/^(hwm-[a-z]+-[dm]-)/, '$1' + mark); };
    svg.querySelectorAll('[id]').forEach(function (el) { el.id = rename(el.id); });
    svg.querySelectorAll('use').forEach(function (el) {
      var ref = el.getAttribute('href');
      if (ref && ref.charAt(0) === '#') el.setAttribute('href', '#' + rename(ref.slice(1)));
    });
    svg.querySelectorAll('[filter], [fill], [stroke]').forEach(function (el) {
      ['filter', 'fill', 'stroke'].forEach(function (attr) {
        var value = el.getAttribute(attr);
        if (value && value.indexOf('url(#') === 0) el.setAttribute(attr, 'url(#' + rename(value.slice(5, -1)) + ')');
      });
    });
  }

  function setUp(svg) {
    if (svg._hwm) return;
    svg._hwm = true;
    ownIds(svg);
    var clock = svg.querySelector('.hwm-clock');
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
        if (!shown(svg)) return;
        play(svg);
        if (io && !svg._inView) svg.classList.add('is-paused');
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(); });
  } else {
    init();
  }
})();
