    /* TABS */
    (function () {
      var utils = window.portfolioUtils;
      var tabs = utils.qsa('.tab');
      var panes = utils.qsa('.pane');
      var hashTargets = {
        '#work': 'pane-media',
        '#media': 'pane-media',
        '#projects': 'pane-media',
        '#music': 'pane-media',
        '#film': 'pane-media',
        '#personal': 'pane-personal',
        '#archive': 'pane-personal',
        '#stills': 'pane-personal',
        '#links': 'pane-personal',
        '#clips': 'pane-personal',
        '#video-diary': 'pane-personal',
        '#snapshots': 'pane-personal',
        '#cv': 'pane-resume',
        '#cv-experience': 'pane-resume',
        '#cv-skills': 'pane-resume',
        '#cv-certifications': 'pane-resume',
        '#cv-awards': 'pane-resume',
      };
      var idHashes = {
        'pane-media': '#work',
        'pane-personal': '#snapshots',
        'pane-resume': '#cv',
      };

      function idFromHash() {
        var hash = (window.location.hash || '').toLowerCase();
        return hashTargets[hash] || '';
      }

      function scrollTargetForHash() {
        var hash = (window.location.hash || '').toLowerCase();
        if (hash === '#clips' || hash === '#video-diary' || hash === '#snapshots') {
          return document.getElementById('snapshots');
        }
        if (hashTargets[hash] === 'pane-resume' && hash !== '#cv') {
          return document.getElementById(hash.slice(1));
        }
        return document.querySelector('.panes');
      }

      function scrollToActiveArea() {
        var target = scrollTargetForHash();
        if (!target) return;
        if (target.id && target.id.indexOf('cv-') === 0 && typeof target.scrollIntoView === 'function') {
          target.scrollIntoView({ block: 'start', behavior: 'smooth' });
          return;
        }
        var tabsNav = document.querySelector('.tabs');
        var offset = tabsNav ? tabsNav.getBoundingClientRect().height + 4 : 4;
        var top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }

      function setActiveState(id) {
        tabs.forEach(function (t) {
          var isActive = t.dataset.target === id;
          t.classList.toggle('active', isActive);
          t.setAttribute('aria-selected', isActive ? 'true' : 'false');
          t.setAttribute('tabindex', isActive ? '0' : '-1');
          if (isActive && typeof t.scrollIntoView === 'function') {
            t.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
          }
        });
        panes.forEach(function (p) {
          var isActive = p.id === id;
          p.classList.toggle('active', isActive);
          p.hidden = !isActive;
        });
        if (window.portfolioMotion) window.portfolioMotion.enter(document.getElementById(id));
      }

      function activate(id, focusTab, updateHash) {
        setActiveState(id);
        if (updateHash !== false && idHashes[id] && window.history && window.history.replaceState) {
          window.history.replaceState(null, '', idHashes[id]);
        }
        if (focusTab) {
          var activeTab = tabs.find(function (t) { return t.dataset.target === id; });
          if (activeTab) {
            try { activeTab.focus({ preventScroll: true }); }
            catch (e) { activeTab.focus(); }
          }
        }
        scrollToActiveArea();
      }

      function switchTab(idx, focusTab) {
        if (tabs[idx] && !tabs[idx].classList.contains('active')) {
          utils.pauseAllMedia();
          activate(tabs[idx].dataset.target, focusTab);
        }
      }

      tabs.forEach(function (t, i) {
        t.addEventListener('click', function () { switchTab(i); });
        t.addEventListener('keydown', function (e) {
          if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
          e.preventDefault();
          e.stopPropagation();
          var delta = e.key === 'ArrowRight' ? 1 : -1;
          switchTab((i + delta + tabs.length) % tabs.length, true);
        });
      });

      var initialTab = tabs.find(function (tab) { return tab.classList.contains('active'); }) || tabs[0];
      var initialTarget = idFromHash() || (initialTab && initialTab.dataset.target);
      if (initialTarget) setActiveState(initialTarget);
      if (idFromHash()) {
        requestAnimationFrame(scrollToActiveArea);
        setTimeout(scrollToActiveArea, 350);
      }

      window.addEventListener('hashchange', function () {
        var target = idFromHash();
        if (target) {
          activate(target, false, false);
          setTimeout(scrollToActiveArea, 120);
        }
      });

      document.addEventListener('keydown', function (e) {
        if (utils.isTextEntry(document.activeElement)) return;
        if (utils.qsa('.media-window').length) return;

        var key = e.key;
        if (key >= '1' && key <= '3') {
          e.preventDefault();
          switchTab(parseInt(key, 10) - 1, true);
        }
      });
    })();
