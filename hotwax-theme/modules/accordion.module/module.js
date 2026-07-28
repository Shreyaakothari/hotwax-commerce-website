/* ---------------------------------------------------------------------------
   FAQ structured data (PM-353)

   Builds ONE FAQPage JSON-LD block from the questions this module has already
   rendered on the page. The text is read back out of the rendered accordion,
   so the markup can never drift from what a visitor actually reads, and it is
   only ever emitted when visible questions exist.

   Opt in per accordion with the "Add FAQ schema for search engines" field.
   Several accordions on one page are combined into a single block.
   --------------------------------------------------------------------------- */
(function () {
  var GENERATED_FLAG = "data-faq-schema-generated";

  function readText(el) {
    if (!el) {
      return "";
    }
    return (el.textContent || "").replace(/\s+/g, " ").trim();
  }

  function hiddenOnEveryBreakpoint(el) {
    return (
      el.classList.contains("hide-mobile") &&
      el.classList.contains("hide-tablet") &&
      el.classList.contains("hide-desktop")
    );
  }

  function buildFaqSchema() {
    // Never add a second block, whatever the reason this ran twice.
    if (document.querySelector("script[" + GENERATED_FLAG + "]")) {
      return;
    }

    var blocks = document.querySelectorAll('.accordion[data-faq-schema="true"]');
    if (!blocks.length) {
      return;
    }

    var mainEntity = [];
    var seen = {};

    Array.prototype.forEach.call(blocks, function (block) {
      // Content a visitor can never see must not be marked up.
      if (hiddenOnEveryBreakpoint(block)) {
        return;
      }

      var items = block.querySelectorAll(".accordion__controls > li");

      Array.prototype.forEach.call(items, function (item) {
        var question = readText(item.querySelector(".accordion-title"));
        var answer = readText(item.querySelector(".accordion-content"));

        if (!question || !answer || seen[question]) {
          return;
        }
        seen[question] = true;

        mainEntity.push({
          "@type": "Question",
          name: question,
          acceptedAnswer: {
            "@type": "Answer",
            text: answer
          }
        });
      });
    });

    if (!mainEntity.length) {
      return;
    }

    var script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute(GENERATED_FLAG, "");
    // Building the node with textContent keeps every quote, newline and angle
    // bracket in the answers safely escaped.
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: mainEntity
    });
    document.head.appendChild(script);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildFaqSchema);
  } else {
    buildFaqSchema();
  }
})();

function accordion(el) {
  var dropDown = $(el).closest("li").find(".accordion-content");

  $(el)
    .closest(".accordion")
    .find(".accordion-content")
    .not(dropDown)
    .slideUp();

  if ($(el).parent().hasClass("active")) {
    $(el).parent().removeClass("active");
  } else {
    $(el).closest(".accordion").find("li.active").removeClass("active");
    $(el).parent().addClass("active");
  }

  dropDown.stop(false, true).slideToggle();
}

function openAccordion() {
  var idHash = window.location.hash.split("#")[1];
  if (idHash) {
    var dataId = $('[data-id="' + idHash + '"]');
    console.log(dataId);
    dataId.click();

    dataId[0].scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

$(function () {
  openAccordion();
});

$(".accordion a.accordion-title").on("click", function (e) {
  e.preventDefault();
  accordion(this);
});
