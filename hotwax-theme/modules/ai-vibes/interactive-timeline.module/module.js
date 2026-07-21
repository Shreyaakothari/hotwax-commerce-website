(function () {
  "use strict";

  const modules = document.querySelectorAll("[data-interactive-timeline]");

  const setDescriptionHeight = (moduleElement) => {
    const descriptions = Array.from(moduleElement.querySelectorAll("[data-interactive-timeline-description]"));

    if (!descriptions.length) {
      return;
    }

    moduleElement.style.setProperty("--interactive-timeline-detail-min", "0px");

    const maxHeight = descriptions.reduce((height, description) => {
      return Math.max(height, description.scrollHeight);
    }, 0);

    moduleElement.style.setProperty("--interactive-timeline-detail-min", `${maxHeight}px`);
  };

  modules.forEach((moduleElement) => {
    const steps = Array.from(moduleElement.querySelectorAll("[data-interactive-timeline-step]"));

    if (!steps.length) {
      return;
    }

    const activateStep = (activeStep) => {
      steps.forEach((step) => {
        const isActive = step === activeStep;
        const description = step.querySelector("[data-interactive-timeline-description]");

        step.classList.toggle("is-active", isActive);
        step.setAttribute("aria-expanded", isActive ? "true" : "false");

        if (description) {
          description.setAttribute("aria-hidden", isActive ? "false" : "true");
        }
      });
    };

    steps.forEach((step) => {
      step.addEventListener("click", () => activateStep(step));
      step.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") {
          return;
        }

        event.preventDefault();
        activateStep(step);
      });
    });

    setDescriptionHeight(moduleElement);
    activateStep(steps.find((step) => step.classList.contains("is-active")) || steps[0]);

    window.addEventListener("resize", () => setDescriptionHeight(moduleElement));
  });
})();
