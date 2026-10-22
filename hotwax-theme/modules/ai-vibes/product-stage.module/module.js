(function () {
  function init() {
    if (!('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    document.querySelectorAll('.hw-ps__stage').forEach(function (stage) {
      if (stage.classList.contains('is-glow-armed')) return;
      stage.classList.add('is-glow-armed');
      var io = new IntersectionObserver(function (entries) {
        var entry = entries[entries.length - 1];
        if (entry.intersectionRatio >= 0.25) {
          stage.classList.add('is-glowing');
        } else if (!entry.isIntersecting) {
          stage.classList.remove('is-glowing');
        }
      }, { threshold: [0, 0.25] });
      io.observe(stage);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
