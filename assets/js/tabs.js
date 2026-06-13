    /* TABS */
    (function () {
      var utils = window.portfolioUtils;
      var tabs = utils.qsa('.tab');
      var panes = utils.qsa('.pane');

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

      function activate(id, focusTab) {
        setActiveState(id);
        if (focusTab) {
          var activeTab = tabs.find(function (t) { return t.dataset.target === id; });
          if (activeTab) {
            try { activeTab.focus({ preventScroll: true }); }
            catch (e) { activeTab.focus(); }
          }
        }
        var pc = document.querySelector('.panes');
        if (pc) window.scrollTo({ top: pc.offsetTop - 4, behavior: 'smooth' });
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
      if (initialTab) setActiveState(initialTab.dataset.target);

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
