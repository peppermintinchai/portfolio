    /* VIDEO CONTROLS */
    (function () {
      var utils = window.portfolioUtils;
      utils.qsa('.frame-16x9 video').forEach(function (video) {
        if (video.dataset.enhanced) return;
        var keepNativeControls = video.hasAttribute('controls');
        video.dataset.enhanced = '1';
        video.controls = keepNativeControls;
        utils.prepareVideo(video);
        video.addEventListener('loadedmetadata', function () { utils.prepareVideo(video); });
        video.addEventListener('play', function () { utils.prepareVideo(video); });
        video.addEventListener('error', function () {
          var frame = video.closest('.frame-16x9');
          video.remove();
          if (frame) {
            frame.setAttribute('data-ph', 'VIDEO UNAVAILABLE');
            frame.setAttribute('aria-label', 'Video unavailable');
            frame.classList.remove('media-open-frame');
          }
        });
      });
    })();
