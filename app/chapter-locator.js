(() => {
  const reader = document.getElementById('reader');
  const readerTitle = document.getElementById('reader-title');
  const readerMeta = document.getElementById('reader-meta');
  const readerStatus = document.getElementById('reader-status');

  if (!reader || !readerTitle || !readerMeta || !readerStatus) return;

  let pollId = null;
  let runId = 0;

  function currentFrame() {
    return document.getElementById('reader-frame');
  }

  function normalizeText(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      .trim()
      .toLowerCase();
  }

  function chapterNumber() {
    const match = readerMeta.textContent.match(/Cap[ií]tulo\s+(\d+)/i);
    return match ? Number(match[1]) : null;
  }

  function titleTokens(title) {
    return normalizeText(title)
      .split(' ')
      .filter((token) => token.length >= 4);
  }

  function candidateScore(element, normalizedTitle, tokens) {
    const text = normalizeText(element.textContent);
    if (!text) return 0;
    if (text === normalizedTitle) return 100;
    if (text.includes(normalizedTitle)) return 95;
    if (normalizedTitle.includes(text) && text.length >= 18) return 85;

    if (!tokens.length) return 0;
    const matched = tokens.filter((token) => text.includes(token)).length;
    const ratio = matched / tokens.length;
    if (matched >= 3 && ratio >= 0.75) return 70 + ratio * 10;
    return 0;
  }

  function findByTitle(document, title) {
    const normalizedTitle = normalizeText(title);
    if (!normalizedTitle) return null;
    const tokens = titleTokens(title);
    const selectors = [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', '[role="heading"]',
      '.chapter-title', '.chapter-heading', '.section-title', '.card-title',
      'section > header', 'article > header'
    ];

    let best = null;
    let bestScore = 0;
    document.querySelectorAll(selectors.join(',')).forEach((element) => {
      const score = candidateScore(element, normalizedTitle, tokens);
      if (score > bestScore) {
        best = element;
        bestScore = score;
      }
    });

    if (best) return best;

    document.querySelectorAll('section, article, header, [id]').forEach((element) => {
      const text = normalizeText(element.textContent);
      if (!text || text.length > 700) return;
      const score = candidateScore(element, normalizedTitle, tokens);
      if (score > bestScore) {
        best = element;
        bestScore = score;
      }
    });

    return bestScore >= 70 ? best : null;
  }

  function ensureAnchor(document, target, chapterId) {
    const anchorId = `capitulo-${chapterId}`;
    const existing = document.getElementById(anchorId);
    if (existing) return existing;

    const anchor = document.createElement('span');
    anchor.id = anchorId;
    anchor.setAttribute('aria-hidden', 'true');
    anchor.style.cssText = 'display:block;height:0;overflow:hidden;position:relative;top:-12px;';
    target.parentNode?.insertBefore(anchor, target);
    return anchor;
  }

  function clearPoll() {
    if (pollId !== null) {
      clearInterval(pollId);
      pollId = null;
    }
  }

  function stop() {
    runId += 1;
    clearPoll();
  }

  function currentChapterKey() {
    const chapterId = chapterNumber();
    const title = readerTitle.textContent.trim();
    return chapterId && title ? `${chapterId}:${normalizeText(title)}` : '';
  }

  function locateOnce(expectedFrame) {
    if (!reader.open || currentFrame() !== expectedFrame) return false;

    const chapterId = chapterNumber();
    const title = readerTitle.textContent.trim();
    if (!chapterId || !title) return false;

    try {
      const document = expectedFrame.contentDocument;
      if (!document?.body || !document.body.textContent?.trim()) return false;

      const anchorId = `capitulo-${chapterId}`;
      let anchor = document.getElementById(anchorId);
      if (!anchor) {
        const target = findByTitle(document, title);
        if (!target) return false;
        anchor = ensureAnchor(document, target, chapterId);
      }

      expectedFrame.hidden = false;
      expectedFrame.style.visibility = 'visible';
      readerStatus.hidden = true;
      anchor.scrollIntoView({ block: 'start' });
      return true;
    } catch {
      return false;
    }
  }

  function start() {
    stop();

    const expectedFrame = currentFrame();
    const expectedKey = currentChapterKey();
    if (!expectedFrame || !expectedKey || !reader.open) return;

    const expectedRun = runId;
    let attempts = 0;

    const check = () => {
      if (expectedRun !== runId || !reader.open || currentChapterKey() !== expectedKey || currentFrame() !== expectedFrame) {
        clearPoll();
        return;
      }

      attempts += 1;
      if (locateOnce(expectedFrame)) {
        clearPoll();
        return;
      }

      if (attempts >= 600) {
        clearPoll();
        expectedFrame.hidden = true;
        readerStatus.hidden = false;
        readerStatus.textContent = 'Não consegui carregar o texto deste capítulo. Feche o leitor e tente novamente.';
      }
    };

    check();
    if (pollId === null && !readerStatus.hidden) {
      pollId = window.setInterval(check, 50);
    }
  }

  window.SocioSofiaChapterLocator = { start, stop };
  reader.addEventListener('close', stop);
})();