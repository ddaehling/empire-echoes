/**
 * Put the whole atlas, including its timeline and context, into presentation mode.
 * Native fullscreen is preferred; a viewport-sized dialog remains available when
 * a browser, embedded preview or device cannot grant it.
 */
export function createFullscreen(stage, button, { onChange } = {}) {
  if (
    !(stage instanceof HTMLElement) ||
    !(button instanceof HTMLButtonElement)
  ) {
    throw new TypeError("Fullscreen needs an atlas element and a button.");
  }

  const doc = stage.ownerDocument;
  const win = doc.defaultView;
  const savedButton = {
    html: button.innerHTML,
    attributes: saveAttributes(button, [
      "aria-label",
      "aria-pressed",
      "aria-controls",
      "title",
      "type",
    ]),
  };
  const savedStage = saveAttributes(stage, ["role", "aria-modal", "tabindex"]);
  const status = doc.createElement("span");
  status.className = "sr-only fullscreen-status";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  stage.append(status);

  let mode = null;
  let requested = false;
  let busy = false;
  let destroyed = false;
  let previousFocus = null;
  let scrollPosition = null;
  let lockedStyles = [];
  let inertElements = [];
  let ownsBodyClass = false;
  let resizeFrame = 0;
  let delayedResizeFrame = 0;

  button.type = "button";
  if (stage.id) button.setAttribute("aria-controls", stage.id);
  renderButton();

  function fullscreenElement() {
    return doc.fullscreenElement || doc.webkitFullscreenElement || null;
  }

  function currentState() {
    return { active: mode !== null, mode };
  }

  function renderButton() {
    const active = mode !== null;
    const label = active ? "Exit full screen" : "Full screen";
    const path = active
      ? "M8 3v5H3m13-5v5h5M3 16h5v5m8 0v-5h5"
      : "M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5";
    button.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}" /></svg><span class="fullscreen-label">${label}</span>`;
    button.setAttribute("aria-label", label);
    button.setAttribute("aria-pressed", String(active));
    button.title = active ? "Exit full screen (Esc)" : "Open atlas full screen";
  }

  function resize() {
    if (destroyed) return;
    if (mode) {
      // visualViewport accounts for mobile browser chrome and the on-screen keyboard.
      const height = win.visualViewport?.height || win.innerHeight;
      stage.style.setProperty(
        "--atlas-fullscreen-height",
        `${Math.round(height)}px`,
      );
    }
    win.cancelAnimationFrame(resizeFrame);
    win.cancelAnimationFrame(delayedResizeFrame);
    resizeFrame = win.requestAnimationFrame(() => {
      resizeFrame = 0;
      stage.dispatchEvent(new CustomEvent("atlas:resize", { bubbles: true }));
      // Existing maps listen to window.resize; ResizeObserver-based renderers also
      // pick up the new size. The second frame allows fullscreen layout to settle.
      delayedResizeFrame = win.requestAnimationFrame(() => {
        delayedResizeFrame = 0;
        win.dispatchEvent(new Event("resize"));
      });
    });
  }

  function notify() {
    const state = currentState();
    stage.dispatchEvent(
      new CustomEvent("atlas:fullscreenchange", {
        detail: state,
        bubbles: true,
      }),
    );
    onChange?.(state);
    resize();
  }

  function lockBackground() {
    scrollPosition ||= { left: win.scrollX, top: win.scrollY };
    lockedStyles = [doc.documentElement, doc.body].map((element) => ({
      element,
      value: element.style.getPropertyValue("overflow"),
      priority: element.style.getPropertyPriority("overflow"),
    }));
    for (const { element } of lockedStyles)
      element.style.setProperty("overflow", "hidden");
    ownsBodyClass = !doc.body.classList.contains("atlas-fullscreen-open");
    doc.body.classList.add("atlas-fullscreen-open");
    // Keep the atlas's ancestors available while removing their siblings from
    // keyboard and assistive-technology navigation for the duration of the view.
    for (let child = stage; child.parentElement; child = child.parentElement) {
      for (const sibling of child.parentElement.children) {
        if (sibling === child || /^(SCRIPT|STYLE|LINK)$/.test(sibling.tagName))
          continue;
        inertElements.push({ element: sibling, inert: sibling.inert });
        sibling.inert = true;
      }
      if (child.parentElement === doc.body) break;
    }
  }

  function unlockBackground() {
    for (const { element, value, priority } of lockedStyles) {
      if (value) element.style.setProperty("overflow", value, priority);
      else element.style.removeProperty("overflow");
    }
    lockedStyles = [];
    for (const { element, inert } of inertElements) element.inert = inert;
    inertElements = [];
    if (ownsBodyClass) doc.body.classList.remove("atlas-fullscreen-open");
    ownsBodyClass = false;
  }

  function activate(nextMode) {
    if (destroyed || mode === nextMode) return;
    if (!mode) {
      lockBackground();
      stage.setAttribute("role", "dialog");
      stage.setAttribute("aria-modal", "true");
      if (!stage.hasAttribute("tabindex")) stage.tabIndex = -1;
    }
    mode = nextMode;
    stage.classList.add("is-fullscreen");
    stage.dataset.fullscreen = mode;
    stage.scrollTop = 0;
    renderButton();
    status.textContent =
      "Atlas full screen. Press Escape or use Exit full screen to return.";
    button.focus({ preventScroll: true });
    notify();
  }

  function deactivate({ restoreFocus = true } = {}) {
    if (!mode) return;
    requested = false;
    mode = null;
    stage.classList.remove("is-fullscreen");
    delete stage.dataset.fullscreen;
    stage.style.removeProperty("--atlas-fullscreen-height");
    restoreAttributes(stage, savedStage);
    unlockBackground();
    renderButton();
    status.textContent = "Atlas returned to the page.";
    // Restoring the exact page position avoids the atlas jumping when native
    // fullscreen exits after the browser has resized its viewport.
    if (scrollPosition)
      win.scrollTo({ ...scrollPosition, behavior: "instant" });
    scrollPosition = null;
    if (restoreFocus) {
      const focusTarget =
        previousFocus?.isConnected &&
        !previousFocus.closest("[hidden], [inert]")
          ? previousFocus
          : button;
      focusTarget.focus?.({ preventScroll: true });
    }
    previousFocus = null;
    notify();
  }

  async function enter() {
    requested = true;
    previousFocus =
      doc.activeElement instanceof HTMLElement ? doc.activeElement : button;
    scrollPosition = { left: win.scrollX, top: win.scrollY };
    const request = stage.requestFullscreen || stage.webkitRequestFullscreen;
    if (request && doc.fullscreenEnabled !== false) {
      try {
        await request.call(stage, { navigationUI: "hide" });
        if (destroyed || !requested) {
          if (fullscreenElement() === stage) await nativeExit();
          return;
        }
        if (fullscreenElement() === stage) {
          activate("native");
          return;
        }
        // Legacy WebKit returns before fullscreenchange rather than a promise.
        if (!stage.requestFullscreen) {
          await new Promise((resolve) => win.setTimeout(resolve, 180));
          if (destroyed || !requested) return;
          if (fullscreenElement() === stage) {
            activate("native");
            return;
          }
        }
      } catch {
        // Denied fullscreen is common in embedded previews and is recoverable.
      }
    }
    if (!destroyed && requested && !mode) activate("viewport");
  }

  async function nativeExit() {
    const leave = doc.exitFullscreen || doc.webkitExitFullscreen;
    if (leave) await leave.call(doc);
  }

  async function exit() {
    requested = false;
    if (!mode) return currentState();
    if (fullscreenElement() === stage) {
      try {
        await nativeExit();
      } catch {
        status.textContent =
          "Use your browser's full screen control or Escape to return to the page.";
        return currentState();
      }
      // fullscreenchange usually ran already. Do not misreport an unsuccessful exit.
      if (fullscreenElement() !== stage) deactivate();
    } else {
      deactivate();
    }
    return currentState();
  }

  async function toggle() {
    if (destroyed || busy) return currentState();
    busy = true;
    button.setAttribute("aria-busy", "true");
    try {
      if (mode) await exit();
      else await enter();
      return currentState();
    } finally {
      busy = false;
      button.removeAttribute("aria-busy");
    }
  }

  function onNativeChange() {
    if (fullscreenElement() === stage && !requested)
      void nativeExit().catch(() => {});
    else if (fullscreenElement() === stage) activate("native");
    else if (mode === "native") deactivate();
  }

  function focusableElements() {
    return [
      ...stage.querySelectorAll(
        'a[href], button, input, select, textarea, summary, [tabindex], [contenteditable="true"]',
      ),
    ].filter(
      (element) =>
        !element.disabled &&
        element.tabIndex >= 0 &&
        !element.closest("[hidden], [inert]") &&
        element.getClientRects().length,
    );
  }

  function onKeydown(event) {
    if (!mode && !requested) return;
    if (event.key === "Escape") {
      event.preventDefault();
      void exit();
      return;
    }
    if (!mode) return;
    if (event.key !== "Tab") return;
    const focusable = focusableElements();
    const first = focusable[0] || stage;
    const last = focusable.at(-1) || stage;
    if (
      event.shiftKey &&
      (doc.activeElement === first ||
        doc.activeElement === stage ||
        !stage.contains(doc.activeElement))
    ) {
      event.preventDefault();
      last.focus();
    } else if (
      !event.shiftKey &&
      (doc.activeElement === last || !stage.contains(doc.activeElement))
    ) {
      event.preventDefault();
      first.focus();
    }
  }

  function onFocusin(event) {
    if (mode && !stage.contains(event.target))
      button.focus({ preventScroll: true });
  }

  function onClick() {
    // WebKit does not focus pointer-clicked buttons by default. Establish the
    // trigger as the return point while preserving programmatic toggle() focus.
    button.focus({ preventScroll: true });
    void toggle();
  }

  function onViewportResize() {
    if (mode) resize();
  }

  // Only visualViewport triggers this handler. Listening to the synthetic
  // window.resize event dispatched above would create an animation-frame loop.
  button.addEventListener("click", onClick);
  doc.addEventListener("fullscreenchange", onNativeChange);
  doc.addEventListener("webkitfullscreenchange", onNativeChange);
  doc.addEventListener("keydown", onKeydown, true);
  doc.addEventListener("focusin", onFocusin);
  win.visualViewport?.addEventListener("resize", onViewportResize);
  win.addEventListener("orientationchange", onViewportResize);

  function destroy() {
    if (destroyed) return;
    requested = false;
    if (fullscreenElement() === stage) void nativeExit().catch(() => {});
    deactivate({ restoreFocus: false });
    destroyed = true;
    button.removeEventListener("click", onClick);
    doc.removeEventListener("fullscreenchange", onNativeChange);
    doc.removeEventListener("webkitfullscreenchange", onNativeChange);
    doc.removeEventListener("keydown", onKeydown, true);
    doc.removeEventListener("focusin", onFocusin);
    win.visualViewport?.removeEventListener("resize", onViewportResize);
    win.removeEventListener("orientationchange", onViewportResize);
    win.cancelAnimationFrame(resizeFrame);
    win.cancelAnimationFrame(delayedResizeFrame);
    button.innerHTML = savedButton.html;
    restoreAttributes(button, savedButton.attributes);
    button.removeAttribute("aria-busy");
    status.remove();
  }

  return {
    toggle,
    exit,
    destroy,
    get active() {
      return mode !== null;
    },
  };
}

function saveAttributes(element, names) {
  return names.map((name) => [name, element.getAttribute(name)]);
}

function restoreAttributes(element, attributes) {
  for (const [name, value] of attributes) {
    if (value === null) element.removeAttribute(name);
    else element.setAttribute(name, value);
  }
}
