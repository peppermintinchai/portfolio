    /* TABS */
    (function () {
      var utils = window.portfolioUtils;
      var tabs = utils.qsa('.tab');
      var panes = utils.qsa('.pane');
      var hashTargets = {
        '#projects': 'pane-projects',
        '#music': 'pane-music',
        '#film': 'pane-film',
        '#video-diary': 'pane-film',
        '#cv': 'pane-resume',
        '#availability': 'pane-availability'
      };
      var idHashes = {
        'pane-projects': '#projects',
        'pane-music': '#music',
        'pane-film': '#film',
        'pane-resume': '#cv',
        'pane-availability': '#availability'
      };

      function idFromHash() {
        var hash = (window.location.hash || '').toLowerCase();
        return hashTargets[hash] || '';
      }

      function scrollTargetForHash() {
        var hash = (window.location.hash || '').toLowerCase();
        if (hash === '#video-diary') {
          return document.getElementById('video-diary');
        }
        return document.querySelector('.panes');
      }

      function scrollToActiveArea() {
        var target = scrollTargetForHash();
        if (!target) return;
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
          if (window.vaultSound) window.vaultSound.menu();
          activate(tabs[idx].dataset.target, focusTab);
        }
      }

      function currentTabIndex() {
        return tabs.findIndex(function (tab) { return tab.classList.contains('active'); });
      }

      tabs.forEach(function (t, i) {
        t.addEventListener('click', function () { switchTab(i); });
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
        if (document.body.classList.contains('booting')) return;
        if (document.body.classList.contains('modal-open') || utils.isTextEntry(document.activeElement)) return;

        var key = e.key;
        if (key >= '1' && key <= '5') {
          e.preventDefault();
          switchTab(parseInt(key, 10) - 1, true);
          return;
        }

        if ((key === 'ArrowRight' || key === 'ArrowLeft') && !utils.isTextEntry(document.activeElement)) {
          e.preventDefault();
          var index = currentTabIndex();
          if (index < 0) return;
          var delta = key === 'ArrowRight' ? 1 : -1;
          switchTab((index + delta + tabs.length) % tabs.length, true);
        }
      });
    })();
