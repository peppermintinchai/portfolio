    /* MUSIC AUDIO — now open (gate removed) */

    /* PROOF GATE (cosmetic only) */
    (function () {
      var form = document.getElementById('proof-gate-form'), msg = document.getElementById('proof-gate-msg'),
          gate = document.getElementById('proof-gate'), cards = Array.prototype.slice.call(document.querySelectorAll('.proof-secure'));
      if (!form) return;
      function unlockProof(playSound) {
        if (playSound && window.vaultSound) window.vaultSound.unlock();
        msg.textContent = 'ACCESS GRANTED'; msg.className = 'proof-msg granted';
        cards.forEach(function (card) { card.classList.add('unlocked'); });
        if (gate) gate.style.display = 'none';
      }
      unlockProof(false);
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        unlockProof(true);
      });
    })();

    /* GATE (cosmetic only) */
    (function () {
      var form = document.getElementById('gate-form'), input = document.getElementById('gate-input'),
          msg = document.getElementById('gate-msg'), zone = document.getElementById('locked-zone'),
          gate = document.getElementById('gate'), KEY = 'KEKOUKOLA';
      if (!form) return;
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if ((input.value || '').trim().toUpperCase() === KEY) {
          if (window.vaultSound) window.vaultSound.unlock();
          msg.textContent = 'ACCESS_GRANTED // DECRYPTING SCHEDULE'; msg.className = 'msg granted';
          if (zone) zone.classList.add('unlocked');
          setTimeout(function () { if (gate) gate.style.display = 'none'; }, 600);
        } else {
          if (window.vaultSound) window.vaultSound.deny();
          msg.textContent = 'ACCESS_DENIED // RE-AUTHENTICATE'; msg.className = 'msg denied';
          if (input) input.value = '';
          void msg.offsetWidth;
        }
      });
    })();
