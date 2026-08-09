(() => {
  const runtimeParts = ["v8-runtime-01.part","v8-runtime-02a.part","v8-runtime-02b.part","v8-runtime-02c.part","v8-runtime-02d.part","v8-runtime-03.part","v8-runtime-04.part","v8-runtime-05.part"];
  const patchParts = ["v8-patch-01.part","v8-patch-02.part"];

  async function readParts(files) {
    const parts = await Promise.all(files.map(async file => {
      const response = await fetch(file, {cache:"no-cache"});
      if (!response.ok) throw new Error(`Falha ao carregar ${file}`);
      return (await response.text()).trim();
    }));
    return parts.join("");
  }

  async function gunzipBase64(value) {
    const raw = atob(value);
    const bytes = Uint8Array.from(raw, c => c.charCodeAt(0));
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
    return new Response(stream).text();
  }

  window.sociosofiaV8Ready = (async () => {
    const [runtimeB64, patchB64] = await Promise.all([readParts(runtimeParts), readParts(patchParts)]);
    const [runtimeText, patchText] = await Promise.all([gunzipBase64(runtimeB64), gunzipBase64(patchB64)]);
    window.__SOCIOSOFIA_V8_DATA__ = JSON.parse(runtimeText);
    new Function(patchText)();
    if (typeof window.applySociosofiaSoc1Etapa1V8 !== "function") throw new Error("Patch Sociosofia v8 não inicializado.");
  })();
})();
