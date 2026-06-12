/* SHARED HELPERS */
    (function () {
      function toArray(list) { return Array.prototype.slice.call(list || []); }
      function qsa(selector, root) { return toArray((root || document).querySelectorAll(selector)); }
      function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
      function isTextEntry(el) {
        if (!el) return false;
        var tag = el.tagName;
        return el.isContentEditable || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON';
      }
      function setStatus(el, message, state) {
        if (!el) return;
        el.textContent = message || '';
        el.className = 'req-status' + (state ? ' ' + state : '');
      }
      function formatTime(seconds) {
        if (!isFinite(seconds) || seconds < 0) return '0:00';
        var m = Math.floor(seconds / 60);
        var s = Math.floor(seconds % 60);
        return m + ':' + String(s).padStart(2, '0');
      }
      function prepareVideo(video) {
        if (!video) return;
        video.removeAttribute('muted');
        video.defaultMuted = false;
        video.muted = false;
        video.playsInline = true;
        video.setAttribute('playsinline', '');
        try { video.volume = 1; } catch (e) {}
      }
      function playMedia(media) {
        if (!media || typeof media.play !== 'function') return;
        if (media.tagName === 'VIDEO') prepareVideo(media);
        var attempt = media.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {
            if (media.tagName === 'VIDEO') {
              media.autoplay = false;
              prepareVideo(media);
            }
          });
        }
      }
      function pauseAllMedia(except) {
        qsa('audio, video').forEach(function (media) {
          if (media === except) return;
          try { media.pause(); } catch (e) {}
        });
        qsa('.frame-16x9 iframe').forEach(function (frame) {
          try {
            if (frame.contentWindow) frame.contentWindow.postMessage({ action: 'pause' }, '*');
          } catch (e) {}
        });
      }
      function safeStorageGet(key, fallback) {
        try {
          var value = localStorage.getItem(key);
          return value == null ? fallback : value;
        } catch (e) {
          return fallback;
        }
      }
      function safeStorageSet(key, value) {
        try { localStorage.setItem(key, value); } catch (e) {}
      }
      window.portfolioUtils = {
        toArray: toArray,
        qsa: qsa,
        clamp: clamp,
        isTextEntry: isTextEntry,
        setStatus: setStatus,
        formatTime: formatTime,
        prepareVideo: prepareVideo,
        playMedia: playMedia,
        pauseAllMedia: pauseAllMedia,
        safeStorageGet: safeStorageGet,
        safeStorageSet: safeStorageSet
      };
    })();
