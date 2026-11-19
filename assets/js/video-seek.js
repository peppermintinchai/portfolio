/* VIDEO SEEK — minimal scrubber that stays hidden until the viewer interacts */
(function () {
  var utils = window.portfolioUtils;
  if (!utils) return;

  utils.qsa('.frame-16x9 video').forEach(function (video) {
    if (video.dataset.seekUi) return;
    video.dataset.seekUi = '1';

    video.removeAttribute('controls');
    video.controls = false;

    var frame = video.closest('.frame-16x9');
    if (!frame) return;
    frame.classList.add('vs-on');

    var bar = document.createElement('div');
    bar.className = 'vs-bar';
    bar.setAttribute('role', 'slider');
    bar.setAttribute('tabindex', '0');
    bar.setAttribute('aria-label', 'Seek video');
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', '100');

    var fill = document.createElement('div');
    fill.className = 'vs-fill';
    var thumb = document.createElement('div');
    thumb.className = 'vs-thumb';
    bar.appendChild(fill);
    bar.appendChild(thumb);
    frame.appendChild(bar);

    function show() { frame.classList.add('vs-show'); }
    function hideIfIdle() { if (video.paused) frame.classList.remove('vs-show'); }

    function paint() {
      var p = video.duration ? (video.currentTime / video.duration) * 100 : 0;
      fill.style.width = p + '%';
      thumb.style.left = p + '%';
      bar.setAttribute('aria-valuenow', String(Math.round(p)));
    }

    function seek(clientX) {
      var r = bar.getBoundingClientRect();
      if (!r.width) return;
      var ratio = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
      if (video.duration) {
        try { video.currentTime = ratio * video.duration; } catch (e) {}
      }
      fill.style.width = (ratio * 100) + '%';
      thumb.style.left = (ratio * 100) + '%';
    }

    var dragging = false;

    frame.addEventListener('click', function (e) {
      if (e.target.closest('.vs-bar')) return;
      show();
      if (video.paused) utils.playMedia(video);
      else video.pause();
    });

    frame.addEventListener('pointerleave', hideIfIdle);
    video.addEventListener('play', show);
    video.addEventListener('pause', function () { setTimeout(hideIfIdle, 1200); });
    video.addEventListener('timeupdate', paint);
    video.addEventListener('loadedmetadata', paint);
    video.addEventListener('durationchange', paint);

    bar.addEventListener('pointerdown', function (e) {
      dragging = true;
      try { bar.setPointerCapture(e.pointerId); } catch (err) {}
      seek(e.clientX);
      e.preventDefault();
      e.stopPropagation();
    });
    bar.addEventListener('pointermove', function (e) {
      if (dragging) seek(e.clientX);
    });
    bar.addEventListener('pointerup', function (e) {
      dragging = false;
      try { bar.releasePointerCapture(e.pointerId); } catch (err) {}
    });
    bar.addEventListener('pointercancel', function () { dragging = false; });

    bar.addEventListener('keydown', function (e) {
      if (!video.duration) return;
      if (e.key === 'ArrowRight') { video.currentTime = Math.min(video.duration, video.currentTime + 5); e.preventDefault(); }
      else if (e.key === 'ArrowLeft') { video.currentTime = Math.max(0, video.currentTime - 5); e.preventDefault(); }
      else if (e.key === ' ' || e.key === 'Enter') {
        if (video.paused) utils.playMedia(video); else video.pause();
        e.preventDefault();
      }
    });
  });
})();
