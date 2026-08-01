globalThis.CSS = globalThis.CSS || {
  escape(value) {
    return String(value).replace(/[^a-zA-Z0-9_-]/g, character => `\\${character}`);
  }
};

await import('./site-map-audit.mjs');
