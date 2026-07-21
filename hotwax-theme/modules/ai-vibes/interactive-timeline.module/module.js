(function () {
  "use strict";

  var timelines = document.querySelectorAll("[data-interactive-timeline]");

  timelines.forEach(function (timeline) {
    var steps = timeline.querySelectorAll("[data-interactive-timeline-step]");
    var descriptions = timeline.querySelectorAll("[data-interactive-timeline-description]");

    function setDescriptionHeight() {
      var maxHeight = 0;

      descriptions.forEach(function (description) {
        maxHeight = Math.max(maxHeight, description.scrollHeight);
      });

      if (maxHeight) {
        timeline.style.setProperty("--interactive-timeline-detail-min", maxHeight + "px");
      }
    }

    function activateStep(activeStep) {
      steps.forEach(function (step) {
        var isActive = step === activeStep;
        var description = step.querySelector("[data-interactive-timeline-description]");

        step.classList.toggle("is-active", isActive);
        step.setAttribute("aria-expanded", isActive ? "true" : "false");

        if (description) {
          description.setAttribute("aria-hidden", isActive ? "false" : "true");
        }
      });
    }

    steps.forEach(function (step) {
      step.addEventListener("click", function () {
        activateStep(step);
      });

    });

    setDescriptionHeight();
    window.addEventListener("resize", setDescriptionHeight);
  });
})();
