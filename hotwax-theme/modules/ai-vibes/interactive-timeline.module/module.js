(function () {
  "use strict";

  var timelines = document.querySelectorAll("[data-interactive-timeline]");

  timelines.forEach(function (timeline) {
    var items = Array.prototype.slice.call(
      timeline.querySelectorAll("[data-interactive-timeline-item]")
    );

    if (!items.length) {
      return;
    }

    function activateItem(activeItem) {
      items.forEach(function (item) {
        var isActive = item === activeItem;
        var trigger = item.querySelector("[data-interactive-timeline-step]");

        item.classList.toggle("is-active", isActive);

        if (trigger) {
          trigger.setAttribute("aria-pressed", isActive ? "true" : "false");
        }
      });
    }

    items.forEach(function (item) {
      var trigger = item.querySelector("[data-interactive-timeline-step]");

      if (!trigger) {
        return;
      }

      trigger.addEventListener("click", function () {
        var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        activateItem(item);
        item.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "center"
        });
      });
    });

    if (!("IntersectionObserver" in window)) {
      return;
    }

    var visibleItems = [];
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var itemIndex = visibleItems.indexOf(entry.target);

        if (entry.isIntersecting && itemIndex === -1) {
          visibleItems.push(entry.target);
        } else if (!entry.isIntersecting && itemIndex !== -1) {
          visibleItems.splice(itemIndex, 1);
        }
      });

      if (!visibleItems.length) {
        return;
      }

      var activationPoint = window.innerHeight * 0.45;
      var closestItem = visibleItems.reduce(function (closest, item) {
        var itemRect = item.getBoundingClientRect();
        var closestRect = closest.getBoundingClientRect();
        var itemDistance = Math.abs(itemRect.top + itemRect.height / 2 - activationPoint);
        var closestDistance = Math.abs(closestRect.top + closestRect.height / 2 - activationPoint);

        return itemDistance < closestDistance ? item : closest;
      });

      activateItem(closestItem);
    }, {
      rootMargin: "-35% 0px -45% 0px",
      threshold: 0
    });

    items.forEach(function (item) {
      observer.observe(item);
    });
  });
})();
