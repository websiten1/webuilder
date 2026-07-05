/* Preset preview helper — when a preset site is embedded as a preview iframe,
   neutralize navigation so clicks/anchors can't escape the preview. */
(function () {
  var embedded = false;
  try { embedded = window.self !== window.top; } catch (e) { embedded = true; }
  if (!embedded) return;

  document.addEventListener(
    "click",
    function (e) {
      var el = e.target;
      while (el && el !== document.body) {
        if (el.tagName === "A" || el.tagName === "BUTTON") { e.preventDefault(); e.stopPropagation(); return; }
        el = el.parentElement;
      }
    },
    true
  );
  document.addEventListener("submit", function (e) { e.preventDefault(); }, true);
})();
