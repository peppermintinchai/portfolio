     /* MOTION — restrained staggered entrance, anime.js */
     (function () {
       var anime = window.anime;
       var selector = '.project-feature, .card, .moment, .xp, .cv-list-row';

       function reduced() {
         return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
       }

       function clear(items) {
         Array.prototype.forEach.call(items, function (el) {
           el.style.opacity = '';
           el.style.transform = '';
         });
       }

       function enter(pane) {
         if (!anime || !pane || pane.hidden || reduced()) return;
         var all = document.querySelectorAll(selector);
         anime.remove(all);
         clear(all);

         var items = pane.querySelectorAll(selector);
         if (!items.length) return;
         anime({
           targets: items,
           opacity: [0, 1],
           translateY: [6, 0],
           duration: 240,
           delay: anime.stagger(14, { start: 20 }),
           easing: 'easeOutQuad',
           complete: function () { clear(items); }
         });
       }

       window.portfolioMotion = { enter: enter };
     })();
