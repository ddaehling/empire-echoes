/** The live atlas enters this reading surface; no map is copied or recreated. */
export function createTerritoryFocus(
  host,
  { stage, onClose, onAtlas, onRefocus },
) {
  host.setAttribute("role", "dialog");
  host.setAttribute("aria-modal", "true");
  host.setAttribute("aria-labelledby", "territory-focus-title");
  host.innerHTML = `<div class="tf-backdrop" aria-hidden="true"></div><div class="tf-shell">
    <header class="tf-toolbar"><button class="tf-atlas" data-focus-atlas>← Back to the atlas</button><span data-focus-context></span><a href="#rallye" data-focus-rallye hidden>Return to your rallye →</a><button class="tf-close" data-focus-close aria-label="Close territory focus" title="Close territory focus (Escape)">×</button></header>
    <div class="tf-layout"><section class="tf-geography" aria-label="Focused atlas"><div data-focus-map></div><div class="tf-map-caption"><div><strong data-focus-place></strong><button data-focus-refocus>Recentre territory</button></div><p data-focus-note></p></div></section><div class="tf-reading" data-focus-reading tabindex="-1"></div></div>
  </div>`;
  const reading = host.querySelector("[data-focus-reading]");
  const mount = host.querySelector("[data-focus-map]");
  let placeholder,
    returnFocus,
    scrollY = 0,
    active = false,
    mapSize = "";
  const inertState = new Map();
  const background = () => [
    ...document.querySelectorAll(
      ".site-header, .site-footer, .skip-link, #explore-view, #rallye-view, #teacher-view",
    ),
  ];
  function open({ name, id, year, projection, fromRallye, note }) {
    if (!active) {
      returnFocus = document.activeElement;
      scrollY = window.scrollY;
      placeholder = document.createElement("div");
      placeholder.className = "tf-map-placeholder";
      placeholder.style.height = `${stage.getBoundingClientRect().height}px`;
      stage.before(placeholder);
      mount.append(stage);
      for (const element of background()) {
        inertState.set(element, element.inert);
        element.inert = true;
      }
      document.body.classList.add("territory-focus-open");
      active = true;
    }
    host.hidden = false;
    stage.dataset.focusId = id || "";
    host.querySelector("[data-focus-place]").textContent = name;
    host.querySelector("[data-focus-context]").textContent =
      `${projection === "globe" ? "Globe" : "Flat map"} · ${year}`;
    host.querySelector("[data-focus-note]").textContent = note;
    host.querySelector("[data-focus-note]").dataset.baseNote = note;
    host.querySelector("[data-focus-rallye]").hidden = !fromRallye;
    reading.scrollTop = 0;
    host.querySelector(".tf-layout").scrollTop = 0;
    // Layout is settled before the controller computes its territory camera.
    const bounds = mount.getBoundingClientRect();
    mapSize = `${bounds.width}:${bounds.height}`;
  }
  function focusHeading() {
    reading.querySelector("[data-tp-heading]")?.focus({ preventScroll: true });
  }
  function close() {
    if (!active) return null;
    placeholder.replaceWith(stage);
    placeholder = null;
    delete stage.dataset.focusId;
    document.body.classList.remove("territory-focus-open");
    for (const [element, wasInert] of inertState) element.inert = wasInert;
    inertState.clear();
    host.hidden = true;
    active = false;
    window.scrollTo({ top: scrollY, behavior: "instant" });
    return returnFocus;
  }
  function onKey(event) {
    if (!active) return;
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onClose();
    }
    if (event.key !== "Tab") return;
    const items = [
      ...host.querySelectorAll(
        'button, a[href], input, select, summary, [tabindex="0"]',
      ),
    ].filter(
      (el) =>
        !el.disabled &&
        !el.closest("[hidden], [inert]") &&
        el.getClientRects().length,
    );
    const first = items[0],
      last = items.at(-1);
    if (
      event.shiftKey &&
      (document.activeElement === first ||
        !items.includes(document.activeElement))
    ) {
      event.preventDefault();
      last?.focus();
    } else if (
      !event.shiftKey &&
      (document.activeElement === last ||
        !host.contains(document.activeElement))
    ) {
      event.preventDefault();
      first?.focus();
    }
  }
  host.querySelector("[data-focus-close]").addEventListener("click", onClose);
  host.querySelector("[data-focus-atlas]").addEventListener("click", onAtlas);
  host
    .querySelector("[data-focus-refocus]")
    .addEventListener("click", onRefocus);
  document.addEventListener("keydown", onKey, true);
  const resizeObserver = new ResizeObserver(() => {
    if (!active) return;
    const bounds = mount.getBoundingClientRect();
    const nextSize = `${bounds.width}:${bounds.height}`;
    if (nextSize !== mapSize) {
      mapSize = nextSize;
      onRefocus({ animate: false });
    }
  });
  resizeObserver.observe(mount);
  return {
    reading,
    open,
    close,
    focusHeading,
    get active() {
      return active;
    },
  };
}
