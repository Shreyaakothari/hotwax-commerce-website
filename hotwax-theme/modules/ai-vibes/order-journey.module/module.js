(function () {
  var DURATION = 3600;

  function listen(query, fn) {
    if (query.addEventListener) query.addEventListener('change', fn);
    else if (query.addListener) query.addListener(fn);
  }

  function settled() {
    if (window.hwSettled) return window.hwSettled;
    return new Promise(function (resolve) {
      if (document.readyState === 'complete') resolve();
      else window.addEventListener('load', resolve, { once: true });
    });
  }

  function ease(p) {
    return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
  }

  function initJourney(root) {
    var line = root.querySelector('.hw-oj__line');
    if (!line) return;
    var steps = Array.prototype.slice.call(line.querySelectorAll('.hw-oj__step'));
    var hexes = line.querySelectorAll('.hw-oj__hex');
    var rail = line.querySelector('.hw-oj__rail');
    var fill = line.querySelector('.hw-oj__fill');
    var token = line.querySelector('.hw-oj__token');
    if (!steps.length || !rail || !fill || !token) return;

    var vertical = window.matchMedia('(max-width: 991px)');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    var played = false;
    var observer = null;
    var frame = 0;
    var tick = 0;

    function lightUpTo(index) {
      steps.forEach(function (step, i) { step.classList.toggle('is-lit', i <= index); });
    }

    function litIndex(progress) {
      return Math.min(steps.length - 1, Math.floor(progress * (steps.length - 1) + 0.04));
    }

    function reset() {
      cancelAnimationFrame(frame);
      frame = 0;
      line.classList.remove('is-done');
      steps.forEach(function (step) { step.classList.remove('is-lit'); });
      fill.style.width = fill.style.height = fill.style.transform = fill.style.transformOrigin = fill.style.willChange = '';
      token.style.opacity = token.style.transform = token.style.willChange = '';
    }

    function finish() {
      cancelAnimationFrame(frame);
      frame = 0;
      line.classList.add('is-done');
      lightUpTo(steps.length - 1);
      fill.style.width = fill.style.height = fill.style.transform = fill.style.willChange = '';
      token.style.opacity = '0';
      token.style.willChange = '';
    }

    function fitRail() {
      rail.style.top = rail.style.bottom = '';
      if (vertical.matches && hexes.length > 1) {
        var box = line.getBoundingClientRect();
        var first = hexes[0].getBoundingClientRect();
        var last = hexes[hexes.length - 1].getBoundingClientRect();
        rail.style.top = Math.round(first.top + first.height / 2 - box.top) + 'px';
        rail.style.bottom = Math.round(box.bottom - (last.top + last.height / 2)) + 'px';
      }
      rail.style.translate = '';
      var offset = rail.getBoundingClientRect().top % 1;
      if (offset) rail.style.translate = '0 ' + (-offset).toFixed(3) + 'px';
    }

    function follow() {
      tick = 0;
      if (!vertical.matches || reduce.matches) return;
      var box = rail.getBoundingClientRect();
      var p = Math.max(0, Math.min(1, (window.innerHeight * 0.62 - box.top) / box.height));
      fill.style.transform = 'scaleY(' + p + ')';
      token.style.transform = 'translateY(' + (p * box.height) + 'px)';
      token.style.opacity = p >= 1 ? '0' : '1';
      lightUpTo(litIndex(p));
      line.classList.toggle('is-done', p >= 1);
    }

    function onScroll() {
      if (!tick) tick = requestAnimationFrame(follow);
    }

    function relayout() {
      fitRail();
      onScroll();
    }

    function play() {
      if (played) return;
      played = true;
      var length = rail.offsetWidth;
      var start = null;
      fill.style.width = '100%';
      fill.style.transformOrigin = 'left';
      fill.style.transform = 'scaleX(0)';
      fill.style.willChange = token.style.willChange = 'transform';
      steps[0].classList.add('is-lit');
      function step(now) {
        if (start === null) start = now;
        var p = Math.min(1, (now - start) / DURATION);
        var e = ease(p);
        fill.style.transform = 'scaleX(' + e + ')';
        token.style.transform = 'translateX(' + (e * length) + 'px)';
        token.style.opacity = p < 0.96 ? '1' : String(1 - (p - 0.96) / 0.04);
        for (var i = 0; i <= litIndex(e); i++) steps[i].classList.add('is-lit');
        if (p < 1) frame = requestAnimationFrame(step);
        else finish();
      }
      frame = requestAnimationFrame(step);
    }

    function watch() {
      if (observer || played) return;
      settled().then(function () {
        if (observer || played || vertical.matches || reduce.matches) return;
        observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting || vertical.matches) return;
            observer.disconnect();
            observer = null;
            play();
          });
        }, { threshold: 0.5 });
        observer.observe(line);
      });
    }

    function apply() {
      reset();
      fitRail();
      if (reduce.matches || !('IntersectionObserver' in window)) {
        finish();
      } else if (vertical.matches) {
        fill.style.height = '100%';
        fill.style.transform = 'scaleY(0)';
        token.style.opacity = '1';
        follow();
      } else if (played) {
        finish();
      } else {
        watch();
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', relayout);
    window.addEventListener('load', relayout);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
    listen(vertical, function () {
      if (frame) played = true;
      apply();
    });
    listen(reduce, apply);
    apply();
  }

  function start() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-hw-oj]'), initJourney);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
