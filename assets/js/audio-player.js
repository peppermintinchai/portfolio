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
        track.addEventListener('click', function (e) {
          if (!isFinite(audio.duration) || !audio.duration) return;
          var rect = track.getBoundingClientRect();
          var pct = utils.clamp((e.clientX - rect.left) / rect.width, 0, 1);
          audio.currentTime = pct * audio.duration;
        });
        audio.addEventListener('play', function () { play.textContent = 'Ⅱ'; });
        audio.addEventListener('pause', function () { play.textContent = '▶'; });
        audio.addEventListener('ended', function () { play.textContent = '▶'; });
        audio.addEventListener('timeupdate', function () {
          var pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
          fill.style.width = pct + '%';
          time.textContent = utils.formatTime(audio.currentTime) + ' / ' + utils.formatTime(audio.duration);
        });
        audio.addEventListener('loadedmetadata', function () {
          time.textContent = '0:00 / ' + utils.formatTime(audio.duration);
        });
        audio.addEventListener('error', function () {
          play.disabled = true;
          time.textContent = 'UNAVAILABLE';
        });
      });
    })();
