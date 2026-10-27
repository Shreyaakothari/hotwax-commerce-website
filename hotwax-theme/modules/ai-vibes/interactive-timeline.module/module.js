(function () {
  "use strict";

  var timelines = document.querySelectorAll("[data-interactive-timeline]");
  var timelineStates = [];
  var progressFrame = null;
  var easeFrame = null;
  var lastFrame = 0;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function getDotCenter(dot) {
    var rect = dot.getBoundingClientRect();
    return rect.top + rect.height / 2;
  }

  function measureTimeline(state) {
    var activationPoint = window.innerHeight * 0.55;
    var listRect = state.list.getBoundingClientRect();
    var dotCenters = state.dots.map(getDotCenter);
    var firstCenter = dotCenters[0];
    var lastCenter = dotCenters[dotCenters.length - 1];
    var railHeight = Math.max(lastCenter - firstCenter, 0);
    var progressHeight = clamp(activationPoint - firstCenter, 0, railHeight);
    var activeIndex = dotCenters.reduce(function (reachedIndex, center, index) {
      return center <= activationPoint + 1 ? index : reachedIndex;
    }, 0);

    return {
      activeIndex: activeIndex,
      progressHeight: progressHeight,
      railHeight: railHeight,
      railTop: firstCenter - listRect.top,
      state: state
    };
  }

  function drawProgress(state) {
    var ratio = state.railHeight ? clamp(state.shown / state.railHeight, 0, 1) : 0;

    state.list.style.setProperty("--timeline-progress", ratio.toFixed(4));
    state.token.style.transform = "translate(" + (state.railLeft + 1) + "px, " + (state.railTop + ratio * state.railHeight) + "px)";
    state.token.classList.toggle("is-on", state.shown > 2 && state.shown < state.railHeight - 2);
  }

  // The red line and the hex ease toward the scroll position instead of jumping with each wheel step.
  function easeAll(now) {
    var moving = false;
    var step = 1 - Math.pow(0.88, Math.min((now - (lastFrame || now)) / 16.7, 4) || 1);

    lastFrame = now;
    timelineStates.forEach(function (state) {
      if (reduceMotion.matches) {
        state.shown = state.target;
      } else {
        state.shown += (state.target - state.shown) * step;
      }
      if (Math.abs(state.target - state.shown) < 0.3) {
        state.shown = state.target;
      }
      if (state.shown !== state.target) {
        moving = true;
      }
      drawProgress(state);
    });
    easeFrame = moving ? window.requestAnimationFrame(easeAll) : null;
    if (!moving) {
      lastFrame = 0;
    }
  }

  function renderTimeline(measurement) {
    var state = measurement.state;

    state.list.style.setProperty("--timeline-rail-top", measurement.railTop + "px");
    state.list.style.setProperty("--timeline-rail-height", measurement.railHeight + "px");
    state.railLeft = parseFloat(getComputedStyle(state.list).getPropertyValue("--timeline-rail-left")) || 24;
    state.railTop = measurement.railTop;
    state.railHeight = measurement.railHeight;
    state.target = measurement.progressHeight;
    state.activateItem(state.items[measurement.activeIndex]);
    if (easeFrame === null) {
      easeFrame = window.requestAnimationFrame(easeAll);
    }
  }

  function updateAllTimelines() {
    timelineStates.map(measureTimeline).forEach(renderTimeline);
    progressFrame = null;
  }

  function requestProgressUpdate() {
    if (progressFrame !== null) {
      return;
    }

    progressFrame = window.requestAnimationFrame(updateAllTimelines);
  }

  timelines.forEach(function (timeline) {
    var items = Array.prototype.slice.call(
      timeline.querySelectorAll("[data-interactive-timeline-item]")
    );

    if (!items.length) {
      return;
    }

    function activateItem(activeItem) {
      var activeIndex = items.indexOf(activeItem);

      items.forEach(function (item, index) {
        var isActive = item === activeItem;
        var isPassed = index < activeIndex;
        var trigger = item.querySelector("[data-interactive-timeline-step]");

        item.classList.toggle("is-active", isActive);
        item.classList.toggle("is-passed", isPassed);

        if (trigger) {
          trigger.setAttribute("aria-pressed", isActive ? "true" : "false");
        }
      });
    }

    var list = timeline.querySelector(".interactive-timeline__list");
    var dots = items.map(function (item) {
      return item.querySelector(".interactive-timeline__dot");
    }).filter(Boolean);

    if (!list || dots.length !== items.length) {
      return;
    }

    var token = document.createElement("li");
    token.className = "interactive-timeline__token";
    token.setAttribute("aria-hidden", "true");
    list.insertBefore(token, list.firstChild);

    var state = {
      activateItem: activateItem,
      dots: dots,
      items: items,
      list: list,
      railHeight: 0,
      railLeft: 24,
      railTop: 0,
      resizeObserver: null,
      shown: 0,
      target: 0,
      token: token
    };

    timelineStates.push(state);

    items.forEach(function (item) {
      var trigger = item.querySelector("[data-interactive-timeline-step]");

      if (!trigger) {
        return;
      }

      trigger.addEventListener("click", function () {
        var dot = item.querySelector(".interactive-timeline__dot");
        var dotRect = dot.getBoundingClientRect();
        var targetTop = window.scrollY + dotRect.top + dotRect.height / 2 - window.innerHeight * 0.55;

        window.scrollTo({
          behavior: reduceMotion.matches ? "auto" : "smooth",
          top: Math.max(targetTop, 0)
        });
        requestProgressUpdate();
      });
    });

    if ("ResizeObserver" in window) {
      state.resizeObserver = new ResizeObserver(requestProgressUpdate);
      state.resizeObserver.observe(timeline);
    }
  });

  if (timelineStates.length) {
    window.addEventListener("scroll", requestProgressUpdate, { passive: true });
    window.addEventListener("resize", requestProgressUpdate);
    requestProgressUpdate();
  }
})();
