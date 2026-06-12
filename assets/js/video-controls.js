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
          if (frame) frame.setAttribute('data-ph', 'MEDIA UNAVAILABLE');
        });
      });
    })();
