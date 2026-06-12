    /* INTERNAL MEDIA WINDOWS */
    (function () {
      var utils = window.portfolioUtils;
      var desktop = document.getElementById('media-desktop');
      if (!desktop) return;
      var stack = 1121;
      var count = 0;

      function titleFor(frame) {
        var figure = frame.closest('figure');
        var label = figure ? figure.querySelector('.title') : null;
        return label ? label.textContent.trim() : 'MEDIA';
      }

      function focusWindow(win) {
        stack += 1;
        win.style.zIndex = stack;
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
        if (!sourceVideo && !sourceIframe && !sourceEmbed) return;
        count += 1;
        if (window.vaultSound) window.vaultSound.open();

        var win = document.createElement('section');
        var portrait = frame.classList.contains('frame-portrait') || frame.dataset.popout === 'portrait';
        win.className = 'media-window' + (portrait ? ' portrait' : '');
        win.setAttribute('role', 'dialog');
        win.setAttribute('aria-label', titleFor(frame));
        if (!isMobileViewport()) {
          var targetW = portrait ? Math.min(390, window.innerWidth - 28) : Math.min(920, window.innerWidth - 28);
          var targetH = portrait ? Math.min(610, window.innerHeight - 28) : Math.min(550, window.innerHeight - 28);
          var offset = Math.min(count - 1, 3) * 18;
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
        var actions = document.createElement('span');
        actions.className = 'media-actions';
        var close = document.createElement('button');
        close.type = 'button';
        close.className = 'media-close';
        close.setAttribute('aria-label', 'Close media window');
        close.innerHTML = '&times;';
        actions.appendChild(close);
        head.appendChild(title);
        head.appendChild(actions);

        var stage = document.createElement('div');
        stage.className = 'media-stage';

        if (sourceVideo) {
          var video = document.createElement('video');
          video.src = sourceVideo.currentSrc || sourceVideo.getAttribute('src');
          video.poster = sourceVideo.getAttribute('poster') || '';
          video.controls = true;
          video.autoplay = true;
          video.preload = 'auto';
          utils.prepareVideo(video);
          video.addEventListener('loadedmetadata', function () { utils.prepareVideo(video); });
          video.addEventListener('canplay', function () { utils.prepareVideo(video); }, { once: true });
          video.addEventListener('play', function () { utils.prepareVideo(video); });

          stage.appendChild(video);
          utils.playMedia(video);
        } else if (sourceIframe || sourceEmbed) {
          var iframe = document.createElement('iframe');
          iframe.src = sourceEmbed || sourceIframe.getAttribute('src');
          iframe.allow = sourceIframe ? (sourceIframe.getAttribute('allow') || 'autoplay') : 'autoplay; encrypted-media; picture-in-picture';
          iframe.allowFullscreen = true;
          iframe.loading = 'lazy';
          stage.appendChild(iframe);
        }

        win.appendChild(head);
        win.appendChild(stage);
        desktop.appendChild(win);
        makeDraggable(win, head);
        makeResizable(win);
        win.addEventListener('pointerdown', function () { focusWindow(win); });
        close.addEventListener('pointerdown', function (e) {
          e.stopPropagation();
        });
        close.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          win.remove();
        });
      }

      utils.qsa('.frame-16x9').forEach(function (frame) {
        if (!frame.querySelector('video, iframe') && !frame.dataset.embedSrc) return;
        if (frame.querySelector('.media-pop-trigger')) return;
        if (frame.querySelector('video[controls]')) return;
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'media-pop-trigger';
        button.setAttribute('aria-label', 'Open floating media player');
        button.innerHTML = '<span></span><em>PLAY</em>';
        button.addEventListener('click', function (e) {
          e.stopPropagation();
          openWindow(frame);
        });
        frame.appendChild(button);
      });

      utils.qsa('.project-feature.media-feature').forEach(function (card) {
        var frame = card.querySelector('.frame-16x9');
        if (!frame || (!frame.querySelector('video, iframe') && !frame.dataset.embedSrc)) return;
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', 'Play featured music video');
        function playFromCard(e) {
          if (e.target.closest('button, a, audio, video')) return;
          openWindow(frame);
        }
        card.addEventListener('click', playFromCard);
        card.addEventListener('keydown', function (e) {
          if (e.key !== 'Enter' && e.key !== ' ') return;
          e.preventDefault();
          openWindow(frame);
        });
      });

      document.addEventListener('keydown', function (e) {
        if (document.body.classList.contains('modal-open')) return;
        if (e.key === 'Escape') {
          var win = topMediaWindow();
          if (win) win.remove();
        } else if ((e.code === 'Space' || e.key === ' ') && !utils.isTextEntry(document.activeElement)) {
          var video = topMediaVideo() || activePageVideo();
          if (video) {
            e.preventDefault();
            toggleVideo(video);
          }
        } else if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !utils.isTextEntry(document.activeElement)) {
          var seekTarget = topMediaVideo() || activePageVideo();
          if (seekTarget) {
            e.preventDefault();
            seekVideo(seekTarget, e.key === 'ArrowLeft' ? -15 : 15);
          }
        } else if ((e.key === 'f' || e.key === 'F') && !utils.isTextEntry(document.activeElement)) {
          var fullscreenTarget = topMediaVideo() || activePageVideo();
          if (fullscreenTarget) {
            e.preventDefault();
            toggleFullscreen(fullscreenTarget);
          }
        }
      });
    })();
