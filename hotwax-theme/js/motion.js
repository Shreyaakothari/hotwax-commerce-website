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

  function setUp(svg) {
    if (svg._hwm) return;
    svg._hwm = true;
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
