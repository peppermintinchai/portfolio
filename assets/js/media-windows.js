    /* INTERNAL MEDIA WINDOWS */
    (function () {
      var utils = window.portfolioUtils;
      var desktop = document.getElementById('media-desktop');
      if (!desktop) return;
      var stack = 1121;
      var count = 0;
      var mainFrame = document.querySelector('main.frame');

      function mediaWindows() { return utils.qsa('.media-window', desktop); }

      function setPageInert(on) {
        if (!mainFrame) return;
        if ('inert' in mainFrame) mainFrame.inert = on;
        mainFrame.setAttribute('aria-hidden', on ? 'true' : 'false');
      }

      function syncMediaDialogState() {
        var wins = mediaWindows();
        var top = topMediaWindow();
        wins.forEach(function (win) {
          if (win === top) win.setAttribute('aria-modal', 'true');
          else win.removeAttribute('aria-modal');
        });
        setPageInert(wins.length > 0);
      }

      function titleFor(frame) {
        if (frame.dataset.title) return frame.dataset.title;
        var figure = frame.closest('figure');
        var label = figure ? figure.querySelector('.title') : null;
        return label ? label.textContent.trim() : 'MEDIA';
      }

      function focusWindow(win) {
        stack += 1;
        win.style.zIndex = stack;
        if (typeof win.focus === 'function') {
          try { win.focus({ preventScroll: true }); }
          catch (e) { win.focus(); }
        }
        syncMediaDialogState();
      }
      function topMediaWindow() {
        var wins = utils.qsa('.media-window', desktop);
        if (!wins.length) return null;
        wins.sort(function (a, b) {
          var za = parseInt(a.style.zIndex || 0, 10);
          var zb = parseInt(b.style.zIndex || 0, 10);
          return zb - za;
        });
        return wins[0];
      }
      function topMediaVideo() {
        var videos = utils.qsa('.media-window video', desktop);
        if (!videos.length) return null;
        videos.sort(function (a, b) {
          var wa = a.closest('.media-window');
          var wb = b.closest('.media-window');
          var za = parseInt(wa ? wa.style.zIndex : 0, 10);
          var zb = parseInt(wb ? wb.style.zIndex : 0, 10);
          return zb - za;
        });
        return videos[0];
      }
      function keyFor(frame) {
        var sourceVideo = frame.querySelector('video');
        var sourceIframe = frame.querySelector('iframe');
        var sourceImg = frame.dataset.imgSrc || (frame.querySelector('img') && frame.querySelector('img').getAttribute('src'));
        return sourceVideo ? (sourceVideo.currentSrc || sourceVideo.getAttribute('src')) : frame.dataset.embedSrc || (sourceIframe && sourceIframe.getAttribute('src')) || sourceImg || titleFor(frame);
      }
      function existingWindowFor(frame) {
        var key = keyFor(frame);
        return utils.qsa('.media-window', desktop).find(function (win) {
          return win.dataset.sourceKey === key;
        }) || null;
      }
      function closeWindow(win) {
        if (!win) return;
        var opener = win._opener;
        var wasTop = topMediaWindow() === win;
        utils.qsa('audio, video', win).forEach(function (media) {
          try { media.pause(); } catch (e) {}
        });
        win.remove();
        syncMediaDialogState();
        if (!mediaWindows().length) {
          if (opener && document.contains(opener)) {
            try { opener.focus({ preventScroll: true }); }
            catch (e) { opener.focus(); }
          }
        } else if (wasTop) {
          focusWindow(topMediaWindow());
        }
      }
      function activePageVideo() {
        var videos = utils.qsa('video');
        return videos.find(function (video) { return !video.paused && !video.ended; }) || null;
      }
      function toggleVideo(video) {
        if (!video) return;
        if (video.paused || video.ended) utils.playMedia(video);
        else video.pause();
      }
      function seekVideo(video, seconds) {
        if (!video || !isFinite(video.duration)) return;
        video.currentTime = utils.clamp(video.currentTime + seconds, 0, video.duration);
      }
      function toggleFullscreen(video) {
        if (!video) return;
        var target = video.closest('.media-window') || video;
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(function () {});
        } else if (target.requestFullscreen) {
          target.requestFullscreen().catch(function () {});
        }
      }

      function isMobileViewport() {
        return window.innerWidth <= 560;
      }

      function makeDraggable(win, handle) {
        handle.addEventListener('pointerdown', function (e) {
          if (e.button !== 0) return;
          if (isMobileViewport()) return;  /* CSS locks position on mobile */
          focusWindow(win);
          var rect = win.getBoundingClientRect();
          var startX = e.clientX;
          var startY = e.clientY;
          var startLeft = rect.left;
          var startTop = rect.top;
          handle.setPointerCapture(e.pointerId);

          function move(ev) {
            var nextLeft = startLeft + ev.clientX - startX;
            var nextTop = startTop + ev.clientY - startY;
            nextLeft = Math.max(8, Math.min(window.innerWidth - 80, nextLeft));
            nextTop = Math.max(8, Math.min(window.innerHeight - 42, nextTop));
            win.style.left = nextLeft + 'px';
            win.style.top = nextTop + 'px';
          }
          function up() {
            handle.removeEventListener('pointermove', move);
            handle.removeEventListener('pointerup', up);
            handle.removeEventListener('pointercancel', up);
          }
          handle.addEventListener('pointermove', move);
          handle.addEventListener('pointerup', up);
          handle.addEventListener('pointercancel', up);
        });
      }

      function makeResizable(win) {
        var dirs = ['n', 'e', 's', 'w', 'ne', 'nw', 'se', 'sw'];
        dirs.forEach(function (dir) {
          var handle = document.createElement('span');
          handle.className = 'resize-handle resize-' + dir;
          handle.setAttribute('aria-hidden', 'true');
          win.appendChild(handle);
          handle.addEventListener('pointerdown', function (e) {
            if (e.button !== 0) return;
            if (isMobileViewport()) return;  /* CSS locks dimensions on mobile */
            e.preventDefault();
            e.stopPropagation();
            focusWindow(win);
            var rect = win.getBoundingClientRect();
            var startX = e.clientX;
            var startY = e.clientY;
            var minW = 260;
            var minH = 190;
            var maxW = window.innerWidth - 18;
            var maxH = window.innerHeight - 18;
            handle.setPointerCapture(e.pointerId);

            function move(ev) {
              var dx = ev.clientX - startX;
              var dy = ev.clientY - startY;
              var left = rect.left;
              var top = rect.top;
              var width = rect.width;
              var height = rect.height;

              if (dir.indexOf('e') !== -1) width = utils.clamp(rect.width + dx, minW, maxW - rect.left);
              if (dir.indexOf('s') !== -1) height = utils.clamp(rect.height + dy, minH, maxH - rect.top);
              if (dir.indexOf('w') !== -1) {
                width = utils.clamp(rect.width - dx, minW, rect.right - 8);
                left = rect.right - width;
              }
              if (dir.indexOf('n') !== -1) {
                height = utils.clamp(rect.height - dy, minH, rect.bottom - 8);
                top = rect.bottom - height;
              }

              win.style.left = left + 'px';
              win.style.top = top + 'px';
              win.style.width = width + 'px';
              win.style.height = height + 'px';
            }
            function up() {
              handle.removeEventListener('pointermove', move);
              handle.removeEventListener('pointerup', up);
              handle.removeEventListener('pointercancel', up);
            }
            handle.addEventListener('pointermove', move);
            handle.addEventListener('pointerup', up);
            handle.addEventListener('pointercancel', up);
          });
        });
      }

      function openWindow(frame) {
        var sourceVideo = frame.querySelector('video');
        var sourceIframe = frame.querySelector('iframe');
        var sourceEmbed = frame.dataset.embedSrc;
        var sourceImg = frame.dataset.imgSrc || (frame.querySelector('img') && frame.querySelector('img').getAttribute('src'));
        if (!sourceVideo && !sourceIframe && !sourceEmbed && !sourceImg) return;
        var opener = document.activeElement && document.activeElement !== document.body ? document.activeElement : (frame && frame.isConnected ? frame : null);
        var existing = existingWindowFor(frame);
        if (existing) {
          focusWindow(existing);
          return;
        }
        utils.pauseAllMedia();
        count += 1;

        var win = document.createElement('section');
        var portrait = frame.dataset.popout === 'portrait';
        var polaroid = frame.dataset.polaroid === '1';
        win.className = 'media-window' + (portrait ? ' portrait' : '') + (polaroid ? ' polaroid' : '');
        win.dataset.sourceKey = keyFor(frame);
        win.setAttribute('role', 'dialog');
        win.setAttribute('tabindex', '-1');
        win._opener = opener;
        if (!isMobileViewport()) {
          var targetW = portrait ? Math.min(390, window.innerWidth - 28) : Math.min(920, window.innerWidth - 28);
          var targetH = portrait ? Math.min(610, window.innerHeight - 28) : Math.min(550, window.innerHeight - 28);
          var offset = ((count - 1) % 4) * 18;
          win.style.width = Math.max(280, targetW) + 'px';
          win.style.height = Math.max(220, targetH) + 'px';
          win.style.left = Math.max(9, Math.min((window.innerWidth - targetW) / 2 + offset, window.innerWidth - targetW - 9)) + 'px';
          win.style.top = Math.max(54, Math.min((window.innerHeight - targetH) / 2 + offset, window.innerHeight - targetH - 9)) + 'px';
        }
        focusWindow(win);

        var head = document.createElement('div');
        head.className = 'media-head';
        var title = document.createElement('span');
        title.className = 'media-title';
        title.textContent = titleFor(frame);
        title.id = 'media-title-' + count;
        win.setAttribute('aria-labelledby', title.id);
        var actions = document.createElement('span');
        actions.className = 'media-actions';
        var close = document.createElement('button');
        close.type = 'button';
        close.className = 'media-close';
        close.setAttribute('aria-label', 'Close media window');
        close.textContent = '×';
        actions.appendChild(close);
        head.appendChild(title);
        head.appendChild(actions);

        var stage = document.createElement('div');
        stage.className = 'media-stage';

        if (sourceVideo) {
          stage.dataset.state = 'loading';
          var status = document.createElement('div');
          status.className = 'media-stage-status';
          status.textContent = 'LOADING VIDEO';
          var videoSrc = sourceVideo.currentSrc || sourceVideo.getAttribute('src');
          var videoPoster = sourceVideo.getAttribute('poster') || '';
          function markReady() { stage.dataset.state = 'ready'; }
          function showVideoError(failed) {
            failed.remove();
            stage.dataset.state = 'error';
            status.textContent = 'VIDEO UNAVAILABLE';
            if (stage.querySelector('.media-stage-retry')) return;
            var retry = document.createElement('button');
            retry.type = 'button';
            retry.className = 'audio-retry media-stage-retry';
            retry.textContent = 'RETRY';
            retry.addEventListener('click', function () {
              retry.remove();
              stage.dataset.state = 'loading';
              status.textContent = 'LOADING VIDEO';
              var fresh = document.createElement('video');
              fresh.src = videoSrc;
              fresh.poster = videoPoster;
              fresh.controls = true;
              fresh.tabIndex = 0;
              fresh.preload = 'metadata';
              fresh.playsInline = true;
              fresh.setAttribute('playsinline', '');
              utils.prepareVideo(fresh);
              fresh.addEventListener('loadeddata', markReady);
              fresh.addEventListener('canplay', markReady);
              fresh.addEventListener('error', function () { showVideoError(fresh); });
              stage.insertBefore(fresh, status);
            });
            stage.appendChild(retry);
          }
          function makeVideo() {
            var video = document.createElement('video');
            video.src = videoSrc;
            video.poster = videoPoster;
            video.controls = true;
            video.tabIndex = 0;
            video.preload = 'metadata';
            video.playsInline = true;
            video.setAttribute('playsinline', '');
            video.addEventListener('loadeddata', markReady);
            video.addEventListener('canplay', markReady);
            video.addEventListener('error', function () { showVideoError(video); });
            return video;
          }
          stage.appendChild(makeVideo());
          stage.appendChild(status);
        } else if (sourceIframe || sourceEmbed) {
          var iframe = document.createElement('iframe');
          iframe.src = sourceEmbed || sourceIframe.getAttribute('src');
          iframe.allow = sourceIframe ? (sourceIframe.getAttribute('allow') || 'autoplay') : 'autoplay; encrypted-media; picture-in-picture';
          iframe.allowFullscreen = true;
          iframe.loading = 'lazy';
          stage.appendChild(iframe);
        } else if (sourceImg) {
          var img = document.createElement('img');
          img.src = sourceImg;
          img.alt = titleFor(frame);
          img.className = 'media-still';
          img.title = 'Click to open full size';
          img.addEventListener('click', function () {
            window.open(sourceImg, '_blank', 'noopener,noreferrer');
          });
          stage.appendChild(img);
          if (polaroid) {
            var caption = document.createElement('div');
            caption.className = 'polaroid-caption';
            caption.textContent = titleFor(frame);
            stage.appendChild(caption);
          }
          if (frame.dataset.qrNote) {
            var note = document.createElement('div');
            note.className = 'media-still-note';
            note.textContent = frame.dataset.qrNote;
            stage.appendChild(note);
          }
        }

        win.appendChild(head);
        win.appendChild(stage);
        desktop.appendChild(win);
        focusWindow(win);
        makeDraggable(win, head);
        makeResizable(win);
        win.addEventListener('pointerdown', function (e) {
          /* Let the native video controls handle clicks. Refocusing on mousedown swallows them. */
          if (e.target.closest('.media-stage')) return;
          focusWindow(win);
        });
        close.addEventListener('pointerdown', function (e) {
          e.stopPropagation();
        });
        close.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          closeWindow(win);
        });
      }

      utils.qsa('.frame-16x9').forEach(function (frame) {
        if (!frame.querySelector('video, iframe') && !frame.dataset.embedSrc) return;
        if (frame.querySelector('.media-pop-trigger')) return;
        if (frame.querySelector('video[controls]')) return;
        if (frame.querySelector('video')) {
          frame.classList.add('media-open-frame');
          if (frame.tagName !== 'BUTTON') {
            frame.setAttribute('role', 'button');
            frame.setAttribute('tabindex', '0');
          }
          if (!frame.hasAttribute('aria-label')) frame.setAttribute('aria-label', 'Open ' + titleFor(frame) + ' in viewer');
          frame.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            openWindow(frame);
          });
          frame.addEventListener('keydown', function (e) {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            e.preventDefault();
            openWindow(frame);
          });
          return;
        }
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'media-pop-trigger';
        button.setAttribute('aria-label', 'Open ' + titleFor(frame) + ' in floating media player');
        var icon = document.createElement('span');
        icon.setAttribute('aria-hidden', 'true');
        var label = document.createElement('em');
        label.textContent = 'PLAY';
        button.appendChild(icon);
        button.appendChild(label);
        button.addEventListener('click', function (e) {
          e.stopPropagation();
          openWindow(frame);
        });
        frame.appendChild(button);
      });

      utils.qsa('[data-media-img]').forEach(function (trigger) {
        trigger.addEventListener('click', function (e) {
          e.preventDefault();
          var proxy = document.createElement('div');
          proxy.dataset.imgSrc = trigger.getAttribute('data-media-img');
          proxy.dataset.popout = 'portrait';
          proxy.setAttribute('data-title', trigger.getAttribute('data-qr-title') || trigger.textContent.trim() || 'QR CODE');
          if (trigger.closest('.photo-wall')) proxy.dataset.polaroid = '1';
          if (trigger.getAttribute('data-qr-note')) proxy.dataset.qrNote = trigger.getAttribute('data-qr-note');
          openWindow(proxy);
        });
      });

      document.addEventListener('keydown', function (e) {
        var wins = mediaWindows();
        var top = topMediaWindow();
        var focusedMedia = document.activeElement && document.activeElement.closest('.media-stage');
        // keep native Space/Enter behavior on focused controls; isTextEntry now covers only real text inputs
        var inControl = !!(document.activeElement && document.activeElement.matches('button, a, input, textarea, select, summary, [role="button"]'));

        if (top && e.key === 'Tab') {
          var active = document.activeElement;
          if (active && active.closest && active.closest('.media-stage')) return;
          var focusables = utils.qsa('button, [href], input, textarea, select, video[controls], [tabindex]:not([tabindex="-1"])', top).filter(function (el) {
            return !el.disabled && el.type !== 'hidden' && el.getAttribute('aria-hidden') !== 'true' && el.getClientRects().length > 0;
          });
          if (!focusables.length) { e.preventDefault(); return; }
          var first = focusables[0];
          var last = focusables[focusables.length - 1];
          if (e.shiftKey && (document.activeElement === first || !top.contains(document.activeElement))) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && (document.activeElement === last || !top.contains(document.activeElement))) {
            e.preventDefault();
            first.focus();
          }
          return;
        }

        if (e.key === 'Escape') {
          if (top) { e.preventDefault(); closeWindow(top); }
          return;
        }

        if (utils.isTextEntry(document.activeElement)) return;
        var video = top ? topMediaVideo() : activePageVideo();
        if (!video || focusedMedia || inControl) return;

        if (e.code === 'Space' || e.key === ' ') {
          e.preventDefault();
          toggleVideo(video);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault();
          seekVideo(video, e.key === 'ArrowLeft' ? -15 : 15);
        } else if (e.key === 'f' || e.key === 'F') {
          e.preventDefault();
          toggleFullscreen(video);
        }
      });
    })();
