    /* CUSTOM AUDIO ROWS */
    (function () {
      var utils = window.portfolioUtils;

      utils.qsa('.music-audio-card audio').forEach(function (audio) {
        if (audio.classList.contains('enhanced')) return;
        audio.classList.add('enhanced');
        audio.controls = false;

        var ui = document.createElement('div');
        ui.className = 'audio-ui';
        var play = document.createElement('button');
        play.type = 'button';
        play.className = 'audio-play';
        play.setAttribute('aria-label', 'Play audio');
        play.textContent = '▶';
        var track = document.createElement('div');
        track.className = 'audio-track';
        track.setAttribute('role', 'slider');
        track.setAttribute('tabindex', '0');
        track.setAttribute('aria-label', 'Audio progress');
        track.setAttribute('aria-valuemin', '0');
        track.setAttribute('aria-valuemax', '100');
        track.setAttribute('aria-valuenow', '0');
        track.setAttribute('aria-valuetext', '0:00');
        var fill = document.createElement('span');
        fill.className = 'audio-fill';
        track.appendChild(fill);
        var time = document.createElement('span');
        time.className = 'audio-time';
        time.textContent = '0:00';
        ui.appendChild(play);
        ui.appendChild(track);
        ui.appendChild(time);
        audio.insertAdjacentElement('afterend', ui);

        play.addEventListener('click', function () {
          utils.pauseAllMedia(audio);
          if (audio.paused) utils.playMedia(audio);
          else audio.pause();
        });
        function seekToPct(pct) {
          if (!isFinite(audio.duration) || !audio.duration) return;
          audio.currentTime = utils.clamp(pct, 0, 1) * audio.duration;
        }
        function updateProgress() {
          var pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
          fill.style.width = pct + '%';
          var text = utils.formatTime(audio.currentTime) + ' / ' + utils.formatTime(audio.duration);
          time.textContent = text;
          track.setAttribute('aria-valuenow', String(Math.round(pct)));
          track.setAttribute('aria-valuetext', text);
        }
        track.addEventListener('click', function (e) {
          var rect = track.getBoundingClientRect();
          var pct = utils.clamp((e.clientX - rect.left) / rect.width, 0, 1);
          seekToPct(pct);
        });
        track.addEventListener('keydown', function (e) {
          if (!isFinite(audio.duration) || !audio.duration) return;
          var handled = true;
          if (e.key === 'ArrowLeft') audio.currentTime = utils.clamp(audio.currentTime - 5, 0, audio.duration);
          else if (e.key === 'ArrowRight') audio.currentTime = utils.clamp(audio.currentTime + 5, 0, audio.duration);
          else if (e.key === 'Home') audio.currentTime = 0;
          else if (e.key === 'End') audio.currentTime = audio.duration;
          else handled = false;
          if (handled) e.preventDefault();
        });
        audio.addEventListener('play', function () {
          play.textContent = 'Ⅱ';
          play.setAttribute('aria-label', 'Pause audio');
        });
        audio.addEventListener('pause', function () {
          play.textContent = '▶';
          play.setAttribute('aria-label', 'Play audio');
        });
        audio.addEventListener('ended', function () {
          play.textContent = '▶';
          play.setAttribute('aria-label', 'Play audio');
        });
        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('loadedmetadata', function () {
          time.textContent = '0:00 / ' + utils.formatTime(audio.duration);
          updateProgress();
        });
        audio.addEventListener('error', function () {
          play.disabled = true;
          track.removeAttribute('tabindex');
          track.setAttribute('aria-disabled', 'true');
          time.textContent = 'UNAVAILABLE';
        });
      });
    })();
