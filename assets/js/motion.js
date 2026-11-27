      /* MOTION — one authored slash sweep on pane activation */
      (function () {
        var anime = window.anime;
        var slashSelector = '.lead .sl';

        function reduced() {
          return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        }

        function clear(items) {
          Array.prototype.forEach.call(items, function (el) {
            el.style.opacity = '';
            el.style.transform = '';
          });
        }

        function punctuate(pane) {
          if (!anime || !pane || pane.hidden || reduced()) return;
          var slashes = pane.querySelectorAll(slashSelector);
          if (!slashes.length) return;

          anime.remove(slashes);
          clear(slashes);
          anime({
            targets: slashes,
            opacity: [0.25, 1],
            translateX: [-5, 0],
            duration: 260,
            delay: anime.stagger(45, { start: 20 }),
            easing: 'easeOutQuint',
            complete: function () { clear(slashes); }
          });
        }

        window.portfolioMotion = { enter: punctuate, punctuate: punctuate };
      })();
