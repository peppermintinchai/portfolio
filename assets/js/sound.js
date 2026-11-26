    /* UI SOUND. Short mechanical clicks built from filtered noise + slightly detuned tones.
       Every press gets a little pitch and level variance so it never repeats identically.
       Off by default; the visitor opts in with the footer SOUND toggle. */
    (function () {
      var utils = window.portfolioUtils;
      var storageKey = 'portfolio-sound';
      var enabled = false;
      if (utils && utils.safeStorageGet) {
        enabled = utils.safeStorageGet(storageKey, 'off') === 'on';
      }

      var ctx;
      var noiseBuffer;

      function audioCtx() {
        var AudioCtor = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtor) throw new Error('Web Audio unsupported');
        if (!ctx) ctx = new AudioCtor();
        if (ctx.state === 'suspended') ctx.resume();
        return ctx;
      }

      /* one half-second of white noise, reused for every switch transient */
      function noise() {
        var ac = audioCtx();
        if (!noiseBuffer) {
          var len = Math.floor(ac.sampleRate * 0.5);
          noiseBuffer = ac.createBuffer(1, len, ac.sampleRate);
          var data = noiseBuffer.getChannelData(0);
          for (var i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
        }
        return noiseBuffer;
      }

      function varied(freq) {
        /* +/- ~1.5% so repeated clicks aren't perfectly identical */
        return freq * (1 + (Math.random() - 0.5) * 0.03);
      }

      /* physical switch: a short bandpassed noise flick */
      function flick(center, start, dur, gain) {
        var ac = audioCtx();
        var src = ac.createBufferSource();
        src.buffer = noise();
        src.playbackRate.value = 0.9 + Math.random() * 0.2;
        var bp = ac.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = varied(center);
        bp.Q.value = 1.1 + Math.random() * 0.5;
        var vol = ac.createGain();
        var t = ac.currentTime + start;
        vol.gain.setValueAtTime(0.0001, t);
        vol.gain.exponentialRampToValueAtTime(gain, t + 0.004);
        vol.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(bp).connect(vol).connect(ac.destination);
        src.start(t);
        src.stop(t + dur + 0.02);
      }

      function tone(freq, start, dur, gain) {
        var ac = audioCtx();
        var osc = ac.createOscillator();
        var vol = ac.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(varied(freq), ac.currentTime + start);
        var t = ac.currentTime + start;
        vol.gain.setValueAtTime(0.0001, t);
        vol.gain.exponentialRampToValueAtTime(gain * (0.94 + Math.random() * 0.12), t + 0.01);
        vol.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.connect(vol).connect(ac.destination);
        osc.start(t);
        osc.stop(t + dur + 0.02);
      }

      function syncToggle() {
        var btn = document.querySelector('.sound-toggle');
        if (!btn) return;
        btn.textContent = enabled ? 'SOUND ON' : 'SOUND OFF';
        btn.setAttribute('aria-pressed', enabled ? 'true' : 'false');
        btn.setAttribute('aria-label', enabled ? 'Turn interface sound off' : 'Turn interface sound on');
      }

      var api = {
        menu: function () {
          if (!enabled) return;
          try {
            flick(1900, 0, 0.035, 0.013);
            tone(520, 0.006, 0.07, 0.019);
            tone(780, 0.055, 0.065, 0.012);
          } catch (e) {}
        },
        open: function () {
          if (!enabled) return;
          try {
            flick(1500, 0, 0.045, 0.016);
            tone(360, 0.008, 0.085, 0.016);
            tone(640, 0.062, 0.095, 0.016);
          } catch (e) {}
        },
        setEnabled: function (on) {
          enabled = !!on;
          if (utils && utils.safeStorageSet) utils.safeStorageSet(storageKey, enabled ? 'on' : 'off');
          syncToggle();
        }
      };

      window.vaultSound = api;

      var toggle = document.querySelector('.sound-toggle');
      if (toggle) {
        toggle.addEventListener('click', function () { api.setEnabled(!enabled); });
      }
      syncToggle();
    })();
