    /* REQUEST FORMS */
    (function () {
      var utils = window.portfolioUtils;
      var FORMSPREE = 'https://formspree.io/f/xrevkwaq';
      var credModal = document.getElementById('cred-modal');
      var credForm = document.getElementById('cred-form');
      var credTitle = document.getElementById('cred-title');
      var credKind = document.getElementById('cred-kind');
      var availModal = document.getElementById('avail-modal');
      var availForm = document.getElementById('avail-form');
      var lastModalTrigger = null;

      if (!credModal || !credForm || !availModal || !availForm) return;

      function restoreModalFocus() {
        if (!lastModalTrigger || !document.contains(lastModalTrigger)) return;
        try { lastModalTrigger.focus({ preventScroll: true }); }
        catch (e) { lastModalTrigger.focus(); }
        lastModalTrigger = null;
      }

      function getStatus(form) {
        return form.querySelector('.req-status');
      }

      function setSubmitState(form, disabled) {
        utils.qsa('.req-send', form).forEach(function (button) {
          button.disabled = disabled;
          button.setAttribute('aria-busy', disabled ? 'true' : 'false');
        });
      }

      function openModal(modal, form, trigger) {
        if (window.vaultSound) window.vaultSound.open();
        if (trigger) lastModalTrigger = trigger;
        utils.setStatus(getStatus(form), '');
        setSubmitState(form, false);
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        window.setTimeout(function () {
          var firstField = form.querySelector('input:not([type="hidden"]), textarea, select, button');
          if (firstField) firstField.focus();
        }, 0);
      }

      function closeModal(modal) {
        var wasOpen = modal.classList.contains('open');
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        if (!credModal.classList.contains('open') && !availModal.classList.contains('open')) {
          document.body.classList.remove('modal-open');
          if (wasOpen) window.setTimeout(restoreModalFocus, 0);
        }
      }

      function anyModalOpen() {
        return credModal.classList.contains('open') || availModal.classList.contains('open');
      }

      function validEmail(input) {
        return input && input.value.trim() && input.validity.valid;
      }
      function tooLong(field, max) {
        return field && field.value.trim().length > max;
      }
      function looksLikeBot(form) {
        var trap = form.querySelector('input[name="_gotcha"]');
        return trap && trap.value.trim();
      }

      function validateForm(config) {
        var status = getStatus(config.form);
        var name = config.form.querySelector('input[name="name"]');
        var email = config.form.querySelector('input[name="email"]');
        var message = config.form.querySelector('textarea[name="message"]');
        var checked = config.form.querySelectorAll(config.checkboxSelector + ':checked');
        if (looksLikeBot(config.form)) { utils.setStatus(status, 'REQUEST BLOCKED', 'err'); return false; }
        if (!name || !name.value.trim()) { utils.setStatus(status, 'NAME REQUIRED', 'err'); return false; }
        if (tooLong(name, 80)) { utils.setStatus(status, 'NAME IS TOO LONG', 'err'); return false; }
        if (!validEmail(email)) { utils.setStatus(status, 'VALID EMAIL REQUIRED', 'err'); return false; }
        if (tooLong(message, 1200)) { utils.setStatus(status, 'MESSAGE IS TOO LONG', 'err'); return false; }
        if (!checked.length) { utils.setStatus(status, config.checkboxMessage, 'err'); return false; }
        return true;
      }

      function sendForm(config) {
        var form = config.form;
        var status = getStatus(form);
        if (form.dataset.sending === 'true') return;
        var controller = window.AbortController ? new AbortController() : null;
        var timeout = controller ? window.setTimeout(function () { controller.abort(); }, 12000) : 0;
        form.dataset.sending = 'true';
        setSubmitState(form, true);
        utils.setStatus(status, 'SENDING...');
        fetch(FORMSPREE, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(form),
          signal: controller ? controller.signal : undefined
        })
          .then(function (r) {
            if (!r.ok) throw new Error('bad');
            utils.setStatus(status, 'SENT - THANK YOU', 'ok');
            if (window.vaultSound) window.vaultSound.unlock();
            form.reset();
            window.setTimeout(function () { closeModal(config.modal); }, 1200);
          })
          .catch(function (err) {
            var timedOut = err && err.name === 'AbortError';
            utils.setStatus(status, timedOut ? 'SEND TIMED OUT - PLEASE TRY AGAIN' : 'SEND FAILED - PLEASE TRY AGAIN', 'err');
            if (window.vaultSound) window.vaultSound.deny();
          })
          .finally(function () {
            if (timeout) window.clearTimeout(timeout);
            form.dataset.sending = 'false';
            setSubmitState(form, false);
          });
      }

      function bindRequestForm(config) {
        utils.qsa(config.openSelector).forEach(function (button) {
          button.addEventListener('click', function () {
            config.form.reset();
            if (config.onOpen) config.onOpen(button);
            openModal(config.modal, config.form, button);
          });
        });
        var close = config.modal.querySelector('.req-close');
        if (close) close.addEventListener('click', function () { closeModal(config.modal); });
        config.modal.addEventListener('click', function (e) {
          if (e.target === config.modal) closeModal(config.modal);
        });
        config.form.addEventListener('submit', function (e) {
          e.preventDefault();
          if (validateForm(config)) sendForm(config);
        });
      }

      bindRequestForm({
        modal: credModal,
        form: credForm,
        openSelector: '.cred-open',
        checkboxSelector: 'input[name="credential_reason"]',
        checkboxMessage: 'SELECT AT LEAST ONE REASON',
        onOpen: function (button) {
          if (credKind) credKind.value = button.dataset.credentialKind || 'credentials';
          if (credTitle) credTitle.textContent = 'REQUEST CREDENTIALS & REFERENCES';
        }
      });

      bindRequestForm({
        modal: availModal,
        form: availForm,
        openSelector: '.avail-open',
        checkboxSelector: 'input[name="ask_about"]',
        checkboxMessage: 'SELECT AT LEAST ONE TOPIC'
      });

      document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape' || !anyModalOpen()) return;
        e.preventDefault();
        closeModal(credModal);
        closeModal(availModal);
      });
    })();
