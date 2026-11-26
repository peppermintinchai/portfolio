    /* UI SOUND. Short mechanical clicks built from filtered noise + slightly detuned tones.
       Every press gets a little pitch and level variance so it never repeats identically. */
    (function () {
      var ctx;
      var noiseBuffer;

      function audioCtx() {
        var AudioCtor = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtor) throw new Error('Web Audio unsupported');
        if (!ctx) ctx = new AudioCtor();
        if (ctx.state === 'suspended') ctx.resume();
        return ctx;
      }

      /* one second of white noise, reused for every switch transient */
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

      function sweep(from, to, start, dur, gain) {
        var ac = audioCtx();
        var osc = ac.createOscillator();
        var vol = ac.createGain();
        osc.type = 'triangle';
        var t = ac.currentTime + start;
        osc.frequency.setValueAtTime(varied(from), t);
        osc.frequency.exponentialRampToValueAtTime(varied(to), t + dur);
        vol.gain.setValueAtTime(0.0001, t);
        vol.gain.exponentialRampToValueAtTime(gain, t + 0.022);
        vol.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.connect(vol).connect(ac.destination);
        osc.start(t);
        osc.stop(t + dur + 0.03);
      }

      function pulse(freq, start, dur, gain) {
        var ac = audioCtx();
        var osc = ac.createOscillator();
        var vol = ac.createGain();
        osc.type = 'square';
        var t = ac.currentTime + start;
        osc.frequency.setValueAtTime(varied(freq), t);
        vol.gain.setValueAtTime(0.0001, t);
        vol.gain.exponentialRampToValueAtTime(gain, t + 0.006);
        vol.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.connect(vol).connect(ac.destination);
        osc.start(t);
        osc.stop(t + dur + 0.015);
      }

      function chime(freq, start, dur, gain) {
        var ac = audioCtx();
        var osc = ac.createOscillator();
        var vol = ac.createGain();
        var filter = ac.createBiquadFilter();
        osc.type = 'sine';
        var t = ac.currentTime + start;
        osc.frequency.setValueAtTime(varied(freq), t);
        osc.frequency.exponentialRampToValueAtTime(varied(freq * 1.01), t + dur);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2800, t);
        vol.gain.setValueAtTime(0.0001, t);
        vol.gain.exponentialRampToValueAtTime(gain, t + 0.018);
        vol.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.connect(filter).connect(vol).connect(ac.destination);
        osc.start(t);
        osc.stop(t + dur + 0.025);
      }

      window.vaultSound = {
        menu: function () {
          try {
            flick(1900, 0, 0.035, 0.013);
            tone(520, 0.006, 0.07, 0.019);
            tone(780, 0.055, 0.065, 0.012);
          } catch (e) {}
        },
        open: function () {
          try {
            flick(1500, 0, 0.045, 0.016);
            tone(360, 0.008, 0.085, 0.016);
            tone(640, 0.062, 0.095, 0.016);
          } catch (e) {}
        },
        unlock: function () {
          try {
            flick(2200, 0, 0.04, 0.014);
            tone(440, 0.008, 0.065, 0.016);
            tone(660, 0.058, 0.075, 0.018);
            tone(990, 0.13, 0.11, 0.014);
          } catch (e) {}
        },
        launch: function () {
          try {
            flick(900, 0, 0.06, 0.02);
            pulse(58, 0, 0.075, 0.015);
            chime(420, 0.04, 0.12, 0.011);
            chime(840, 0.12, 0.16, 0.011);
            sweep(620, 1680, 0.16, 0.28, 0.009);
            chime(1760, 0.34, 0.14, 0.01);
          } catch (e) {}
        },
        signal: function () {
          try {
            flick(2600, 0, 0.03, 0.011);
            chime(660, 0.006, 0.105, 0.011);
            chime(990, 0.078, 0.115, 0.01);
            chime(1480, 0.17, 0.145, 0.009);
          } catch (e) {}
        },
        deny: function () {
          try {
            flick(600, 0, 0.06, 0.018);
            tone(180, 0.006, 0.115, 0.018);
          } catch (e) {}
        }
      };
    })();
