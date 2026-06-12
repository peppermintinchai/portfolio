    /* THEME */
    (function () {
      var utils = window.portfolioUtils;
      var saved = 'black-cherry';
      var btns = Array.prototype.slice.call(document.querySelectorAll('.sw'));
      function apply(t) { document.body.setAttribute('data-theme', t); btns.forEach(function (b) { b.classList.toggle('active', b.dataset.themeSet === t); }); utils.safeStorageSet('vault-theme', t); }
      apply(saved);
      btns.forEach(function (b) { b.addEventListener('click', function () { if (window.vaultSound) window.vaultSound.menu(); apply(b.dataset.themeSet); }); });
    })();
