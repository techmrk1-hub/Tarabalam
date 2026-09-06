(function loadTarabalamEngine() {
  var PARTS = 12;
  var VERSION = "31";
  var parts = new Array(PARTS);
  var loaded = 0;
  function finish() {
    var script = document.createElement("script");
    script.textContent = parts.join("");
    document.head.appendChild(script);
  }
  function loadOne(i) {
    fetch("/js/tb-parts/" + String(i).padStart(2, "0") + ".txt?v=" + VERSION, { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("Missing Tarabalam language part " + i);
        return res.text();
      })
      .then(function (text) {
        parts[i] = text;
        loaded += 1;
        if (loaded === PARTS) finish();
      })
      .catch(function (err) {
        console.error(err);
      });
  }
  for (var i = 0; i < PARTS; i++) loadOne(i);
})();
