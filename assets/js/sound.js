    /* UI SOUND — subtle Web Audio ticks on boot/menu interactions */
    (function () {
      var ctx;
      function audioCtx() {
        var AudioCtor = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtor) throw new Error('Web Audio unsupported');
        if (!ctx) ctx = new AudioCtor();
        if (ctx.state === 'suspended') ctx.resume();
        return ctx;
      }
      function tone(freq, start, dur, gain) {
        var ac = audioCtx();
        var osc = ac.createOscillator();
        var vol = ac.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ac.currentTime + start);
        vol.gain.setValueAtTime(0.0001, ac.currentTime + start);
        vol.gain.exponentialRampToValueAtTime(gain, ac.currentTime + start + 0.012);
        vol.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + dur);
        osc.connect(vol).connect(ac.destination);
        osc.start(ac.currentTime + start);
        osc.stop(ac.currentTime + start + dur + 0.02);
      }
      function sweep(from, to, start, dur, gain) {
        var ac = audioCtx();
        var osc = ac.createOscillator();
        var vol = ac.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(from, ac.currentTime + start);
        osc.frequency.exponentialRampToValueAtTime(to, ac.currentTime + start + dur);
        vol.gain.setValueAtTime(0.0001, ac.currentTime + start);
        vol.gain.exponentialRampToValueAtTime(gain, ac.currentTime + start + 0.025);
        vol.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + dur);
        osc.connect(vol).connect(ac.destination);
        osc.start(ac.currentTime + start);
        osc.stop(ac.currentTime + start + dur + 0.03);
      }
      function pulse(freq, start, dur, gain) {
        var ac = audioCtx();
        var osc = ac.createOscillator();
        var vol = ac.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, ac.currentTime + start);
        vol.gain.setValueAtTime(0.0001, ac.currentTime + start);
        vol.gain.exponentialRampToValueAtTime(gain, ac.currentTime + start + 0.006);
        vol.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + dur);
        osc.connect(vol).connect(ac.destination);
        osc.start(ac.currentTime + start);
        osc.stop(ac.currentTime + start + dur + 0.015);
      }
      function chime(freq, start, dur, gain) {
        var ac = audioCtx();
        var osc = ac.createOscillator();
        var vol = ac.createGain();
        var filter = ac.createBiquadFilter();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ac.currentTime + start);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.01, ac.currentTime + start + dur);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2800, ac.currentTime + start);
        vol.gain.setValueAtTime(0.0001, ac.currentTime + start);
        vol.gain.exponentialRampToValueAtTime(gain, ac.currentTime + start + 0.018);
        vol.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + dur);
        osc.connect(filter).connect(vol).connect(ac.destination);
        osc.start(ac.currentTime + start);
        osc.stop(ac.currentTime + start + dur + 0.025);
      }
      window.vaultSound = {
        menu: function () { try { tone(520, 0, 0.08, 0.022); tone(780, 0.055, 0.07, 0.014); } catch (e) {} },
        open: function () { try { tone(360, 0, 0.09, 0.018); tone(640, 0.065, 0.1, 0.018); } catch (e) {} },
        unlock: function () { try { tone(440, 0, 0.07, 0.018); tone(660, 0.055, 0.08, 0.02); tone(990, 0.13, 0.12, 0.016); } catch (e) {} },
        planet: function () { try { pulse(74, 0, 0.08, 0.014); sweep(140, 1240, 0.04, 0.48, 0.011); chime(540, 0.14, 0.18, 0.01); chime(810, 0.24, 0.16, 0.008); pulse(980, 0.34, 0.032, 0.008); chime(1440, 0.43, 0.14, 0.009); } catch (e) {} },
        launch: function () { try { pulse(58, 0, 0.075, 0.016); chime(420, 0.04, 0.12, 0.012); chime(840, 0.12, 0.16, 0.012); sweep(620, 1680, 0.16, 0.28, 0.01); chime(1760, 0.34, 0.14, 0.011); } catch (e) {} },
        signal: function () { try { chime(660, 0, 0.11, 0.012); chime(990, 0.075, 0.12, 0.011); chime(1480, 0.17, 0.15, 0.01); } catch (e) {} },
        deny: function () { try { tone(180, 0, 0.12, 0.02); } catch (e) {} }
      };
    })();
