    /* BOOT — PLANET SIGNAL CATCH GAME (endless streak) */
    /* Streak resets on miss. Precision = progress toward tier evolution.
       Every tier = narrower zone + faster wave + zone drift (tier 3+).
       Planet aura shifts color every tier. */
    (function () {
      var utils = window.portfolioUtils;
      var boot = document.getElementById('boot');
      var panel = boot.querySelector('.boot-panel');
      var reopen = document.getElementById('boot-reopen');
      var planet = document.getElementById('planet-button');
      var title = document.getElementById('planet-title');
      var instruction = document.getElementById('planet-instruction');
      var signal = document.getElementById('planet-signal');
      var skip = document.getElementById('boot-skip');
      var game = document.getElementById('boot-game');
      var enter = document.getElementById('boot-enter');
      var resetBtn = document.getElementById('boot-reset');
      var chargeWrap = document.getElementById('space-charge');
      var chargeFill = document.getElementById('charge-fill');
      var chargeWindow = document.getElementById('charge-window');
      var chargeLabel = document.getElementById('charge-label');
      var dot = document.getElementById('signal-dot');
      var bonusMarker = document.getElementById('bonus-marker');
      var scanTimer = 0;

      var state = 'idle';          // idle | scanning | wave | caught-flash
      var catchesDone = 0;         // total successful catches (streak)
      var currentTier = 1;         // 1-7, increases when tierProgress hits 100
      var tierProgress = 0;        // 0-100, builds via catch precision
      var MAX_TIER = 7;
      var waveFrame = 0;
      var waveStart = 0;
      var animating = false;
      var gameMode = false;
      var enterUnlocked = false;
      var bestStreak = 0;
      var perfectCombo = 0;          // consecutive PERFECT catches (≥90%)
      var bonusReady = false;        // bonus challenge available at 50% progress
      var bonusActive = false;       // current wave is a bonus wave
      var bonusThisTier = 0;         // which tier already had its bonus
      var BONUS_WINDOW = 16;         // bonus zone width (%) — tight chase
      var highScore = parseInt(utils.safeStorageGet('signalGameHighScore', '0'), 10);

      /* Returning visitor detection — make skip more prominent for repeat visits */
      var bootVisits = 0;
      bootVisits = parseInt(utils.safeStorageGet('boot-visits', '0'), 10);
      bootVisits = isNaN(bootVisits) ? 0 : bootVisits;
      bootVisits++;
      utils.safeStorageSet('boot-visits', '' + bootVisits);
      var isReturning = bootVisits > 1;
      if (isReturning) {
        skip.classList.add('returning');
      }

      /* Streak milestones that trigger a special message */
      var MILESTONES = [10, 25, 50, 100, 250, 500];

      /* Tier configs — noticeably steeper jumps each tier */
      var TIERS = [
        { w: 38, spd: 50, driftA: 0,  driftS: 0    },  // tier 1 — learning
        { w: 26, spd: 60, driftA: 0,  driftS: 0    },  // tier 2 — tighter, faster
        { w: 16, spd: 70, driftA: 5,  driftS: 1.0  },  // tier 3 — drift awakens
        { w: 10, spd: 78, driftA: 14, driftS: 1.6  },  // tier 4 — chasing
        { w: 7,  spd: 86, driftA: 22, driftS: 2.2  },  // tier 5 — fast
        { w: 5,  spd: 94, driftA: 30, driftS: 2.8  },  // tier 6 — extreme
        { w: 3,  spd: 100,driftA: 38, driftS: 3.5  }   // tier 7 — nightmare
      ];

      var zoneW = 38;              // current zone width (pulled from tier)
      var zoneSpd = 50;            // current wave speed
      var driftAmp = 0;            // zone drift amplitude
      var driftSpd = 0;            // zone drift speed
      var baseSweetMin = 0;        // initial zone position (before drift)
      var sweetMin = 0, sweetMax = 0;

      /* --- helpers --- */
      function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

      function getTier() {
        return Math.min(currentTier, MAX_TIER);
      }

      function calcDifficulty() {
        var idx = getTier() - 1;
        var t = TIERS[idx];
        zoneW = t.w;
        zoneSpd = t.spd;
        driftAmp = t.driftA;
        driftSpd = t.driftS;
      }

      function generateSweetSpot() {
        calcDifficulty();
        var lo = 4;
        var hi = 100 - zoneW - 4;
        if (hi <= lo) { lo = 0; hi = 100 - zoneW; }
        baseSweetMin = lo + Math.random() * (hi - lo);
        sweetMin = baseSweetMin;
        sweetMax = sweetMin + zoneW;
        if (chargeWindow) {
          chargeWindow.style.left = sweetMin + '%';
          chargeWindow.style.width = zoneW + '%';
        }
      }

      function setCharge(pct, label) {
        if (chargeFill) chargeFill.style.width = clamp(pct, 0, 100) + '%';
        if (chargeLabel) chargeLabel.textContent = label || '';
        var hot = state === 'wave' && pct >= sweetMin && pct <= sweetMax;
        if (chargeWrap) chargeWrap.classList.toggle('is-hot', hot);
      }

      function setDot(show) {
        if (!dot) return;
        dot.classList.toggle('active', show);
        dot.classList.remove('caught');
      }

      function dotPosition() {
        if (!dot || !chargeWrap) return 0;
        var track = chargeWrap.querySelector('.charge-track');
        if (!track) return 0;
        var tr = track.getBoundingClientRect();
        var dr = dot.getBoundingClientRect();
        return ((dr.left + dr.width / 2 - tr.left) / tr.width) * 100;
      }

      function stopWave() {
        cancelAnimationFrame(waveFrame);
        waveFrame = 0;
      }

      function updateTierDisplay() {
        var tier = getTier();
        planet.setAttribute('data-tier', tier);
      }

      /* --- UI helpers --- */
      function showSkip(show) {
        var display = show ? '' : 'none';
        skip.style.display = display;
        if (game) game.style.display = display;
      }

      function resetPlanet() {
        planet.classList.remove('is-cutscene', 'is-space', 'is-launch', 'is-spun', 'is-evolving');
        planet.removeAttribute('data-tier');
      }

      function resetChargeWindow() {
        if (chargeWindow) {
          chargeWindow.style.left = '';
          chargeWindow.style.width = '';
          chargeWindow.style.opacity = '';
          chargeWindow.classList.remove('bonus', 'jump');
        }
      }

      function flashSignal(msg) {
        signal.textContent = msg || '';
        signal.classList.remove('live');
        void signal.offsetWidth;
        signal.classList.add('live');
      }

      function resetToIdle(msg) {
        state = 'idle';
        animating = false;
        stopWave();
        setDot(false);
        resetPlanet();
        panel.classList.remove('is-activating');
        title.textContent = gameMode ? 'signal game' : 'enter orbit';
        title.classList.remove('ready');
        instruction.textContent = msg || (gameMode ? 'click planet or tap space to catch signals' : 'click the planet');
        instruction.classList.remove('ready');
        if (catchesDone > 0) {
          setCharge(tierProgress, '');
          chargeLabel.textContent = 'TIER ' + getTier() + '  ▪  ' + Math.round(tierProgress) + '/100' + (bestStreak > 0 ? '  ▪  STREAK ' + bestStreak : '') + (highScore > 1 ? '  ▪  REC ' + highScore : '');
        } else {
          setCharge(0, '');
          if (highScore > 0) {
            chargeLabel.textContent = 'ALL-TIME RECORD: ' + highScore + (bestStreak > 0 ? '  ▪  BEST THIS SESSION ' + bestStreak : '');
          } else if (bestStreak > 0) {
            chargeLabel.textContent = 'best streak: ' + bestStreak;
          } else {
            chargeLabel.textContent = '';
          }
        }
        signal.textContent = '';
        signal.classList.remove('live');
        showSkip(true);
        if (enterUnlocked) {
          enter.textContent = 'enter →';
          enter.classList.add('show', 'pulse');
        } else {
          enter.classList.remove('show');
        }
      }

      /* --- SUCCESS --- */
      function showSuccess(pct) {
        var center = (sweetMin + sweetMax) / 2;
        var halfW = (sweetMax - sweetMin) / 2;
        var dist = Math.abs(pct - center);
        var precision = Math.max(0, Math.min(100, (1 - dist / halfW) * 100));

        /* Perfect-streak combo — chain PERFECT catches for a multiplier! */
        if (precision >= 90) {
          perfectCombo++;
        } else {
          perfectCombo = 0;
        }
        var comboMulti = Math.min(2.5, 1 + perfectCombo * 0.04);
        var gain = (4 + precision * 0.08) * comboMulti;
        /* Bonus catch = 2x gain! */
        if (bonusActive) {
          gain *= 2;
          bonusActive = false;
        }
        var oldProgress = tierProgress;

        catchesDone++;
        if (catchesDone > bestStreak) {
          bestStreak = catchesDone;
          /* Persist all-time high score */
          if (bestStreak > highScore) {
            highScore = bestStreak;
            utils.safeStorageSet('signalGameHighScore', String(highScore));
          }
        }

        var oldTier = getTier();
        tierProgress += gain;
        if (tierProgress >= 100 && currentTier < MAX_TIER) {
          tierProgress -= 100;
          currentTier++;
          planet.classList.add('is-evolving');
          setTimeout(function () { planet.classList.remove('is-evolving'); }, 920);
        }
        tierProgress = clamp(tierProgress, 0, 100);
        updateTierDisplay();

        /* Check if bonus challenge becomes available at 50% progress */
        if (tierProgress >= 50 && bonusThisTier < currentTier) {
          bonusReady = true;
          if (bonusMarker) bonusMarker.classList.add('active');
        }

        /* Precision label */
        var pLabel = precision >= 90 ? 'PERFECT' :
                     precision >= 70 ? 'NICE' :
                     precision >= 40 ? 'GOOD' :
                     precision >= 15 ? 'CLOSE' : 'PHEW';
        var bonusTag = bonusActive ? ' ✦ BONUS! ✦' : '';
        var comboTag = comboMulti > 1 ? ' 🔥x' + comboMulti.toFixed(1) : '';
        var msg = '✦ ' + pLabel + ' +' + Math.round(gain) + '%!' + comboTag + bonusTag + ' SIGNAL ' + catchesDone + ' ✦';

        /* Charge bar flash for solid catches */
        if (precision >= 70 && chargeFill) {
          chargeFill.classList.add('flash');
          setTimeout(function () { if (chargeFill) chargeFill.classList.remove('flash'); }, 250);
        }

        if (window.vaultSound) window.vaultSound.signal();
        planet.classList.remove('is-cutscene', 'is-launch');
        planet.classList.add('is-spun');

        var tierChanged = getTier() !== oldTier;
        if (tierChanged) {
          title.textContent = '✦★ TIER ' + getTier() + ' UNLOCKED ★✦';
        } else if (bestStreak === highScore && bestStreak > 1 && catchesDone === bestStreak && bestStreak > (window._lastHS || 0)) {
          window._lastHS = bestStreak;
          title.textContent = '✦ NEW HIGH SCORE: ' + highScore + ' ✦';
        } else {
          title.textContent = 'signal ' + catchesDone + ' · tier ' + getTier();
        }
        title.classList.add('ready');

        signal.textContent = msg;
        signal.classList.remove('live');
        void signal.offsetWidth;
        signal.classList.add('live');

        /* Streak milestone — show a special message briefly after catch */
        var isMilestone = MILESTONES.indexOf(catchesDone) >= 0;
        if (isMilestone) {
          setTimeout(function () {
            flashSignal('✦★ ' + catchesDone + ' CATCH STREAK ★✦');
          }, 1200);
        }

        state = 'idle';
        animating = false;

        var t = getTier();
        instruction.textContent = 'click to scan — tier ' + t + ' (' + zoneW + '%)';
        instruction.classList.add('ready');

        /* Animate the progress bar from old → new so player sees the gain */
        var comboTag2 = comboMulti > 1 ? ' 🔥x' + comboMulti.toFixed(1) : '';
        chargeLabel.textContent = 'TIER ' + t + '  ▪  ' + Math.round(oldProgress) + '→' + Math.round(tierProgress) + '% ◀ ' + (t < MAX_TIER ? 'TIER ' + (t+1) : 'MAX') + '  ▪  STREAK ' + catchesDone + comboTag2;
        setDot(false);
        showSkip(false);
        enterUnlocked = true;
        enter.textContent = '▶ ENTER ARCHIVE';
        enter.classList.add('show', 'pulse');
        animateFill(oldProgress, tierProgress, function () {
          chargeLabel.textContent = 'TIER ' + t + '  ▪  ' + Math.round(tierProgress) + '/100 ◀ TIER ' + (t < MAX_TIER ? (t+1) : 'MAX') + '  ▪  STREAK ' + catchesDone + '  ▪  BEST ' + bestStreak + (highScore > 1 ? '  ▪  REC ' + highScore : '');
        });
      }

      /* Animate charge fill from → to over ~500ms with ease (label untouched) */
      function animateFill(from, to, done) {
        var start = Date.now();
        var dur = 480;
        function tick() {
          var t = Math.min((Date.now() - start) / dur, 1);
          var eased = 1 - (1 - t) * (1 - t);  // ease-out quad
          var val = from + (to - from) * eased;
          if (chargeFill) chargeFill.style.width = clamp(val, 0, 100) + '%';
          if (t < 1) requestAnimationFrame(tick);
          else if (done) done();
        }
        tick();
      }

      /* --- PHASE 1: SCAN --- */
      function startScan() {
        utils.pauseAllMedia();
        if (state !== 'idle' || animating) return;
        state = 'scanning';
        animating = true;

        /* Set up bonus wave if ready */
        if (bonusReady) {
          bonusActive = true;
          bonusReady = false;
          bonusThisTier = currentTier;
          if (bonusMarker) bonusMarker.classList.remove('active');
        } else {
          bonusActive = false;
        }

        if (window.vaultSound) window.vaultSound.planet();
        planet.classList.remove('is-cutscene', 'is-space', 'is-launch', 'is-spun', 'is-evolving');
        void planet.offsetWidth;
        panel.classList.add('is-activating');
        planet.classList.add('is-cutscene');
        title.textContent = 'scanning — tier ' + getTier() + ' (' + Math.round(tierProgress) + '/100)';
        title.classList.remove('ready');
        instruction.textContent = 'listening for signal...';
        instruction.classList.remove('ready');
        setCharge(0, 'scanning...');
        setDot(false);
        signal.textContent = '';
        signal.classList.remove('live');
        showSkip(false);
        if (!enterUnlocked) enter.classList.remove('show');
        if (chargeWindow) {
          chargeWindow.style.opacity = '';
          chargeWindow.classList.remove('jump');
        }
        /* At higher tiers, zone visibility fades — you're catching blind */
        var fadeTier = getTier();
        if (chargeWindow && fadeTier >= 4) {
          var fadeOpacities = [1, 1, 1, 1, 0.55, 0.3, 0.12, 0.05];
          chargeWindow.style.opacity = fadeOpacities[Math.min(fadeTier, 7)];
        }
        /* Zone jump timer for tier 5+ */
        waveJumpTimer = 1;
        waveJumpNext = Date.now() + 2000 + Math.random() * 2000;
        generateSweetSpot();
        scanTimer = setTimeout(function () {
          scanTimer = 0;
          if (state !== 'scanning') return;
          state = 'wave';
          animating = false;
          planet.classList.remove('is-cutscene');
          panel.classList.remove('is-activating');
          if (bonusActive) {
            title.textContent = '✦ BONUS CHALLENGE! chasing ' + BONUS_WINDOW + '% ✦';
            if (chargeWindow) chargeWindow.classList.add('bonus');
          } else {
            if (chargeWindow) chargeWindow.classList.remove('bonus');
            var waveDesc = 'tier ' + getTier() + ' — ' + zoneW + '% window';
            if (driftAmp > 0) waveDesc += (getTier() >= 5 ? ' · drift+jump' : ' · drifting');
            if (getTier() >= 3) waveDesc += ' · variable speed';
            if (getTier() >= 5) waveDesc += ' · zone jumps!';
            title.textContent = waveDesc;
          }
          instruction.textContent = 'tap space to catch it!';
          instruction.classList.add('ready');
          setCharge(0, '');
          setDot(true);
          showSkip(false);
          waveStart = Date.now();
          updateWave();
        }, 1200);
      }

      /* --- PHASE 2: WAVE with variable dot speed, drift, zone jumps & bonus chase --- */
      /* — variable dot speed makes timing harder at higher tiers — */
      /* — zone jumps at tier 5+ teleport the sweet spot mid-wave — */
      var waveJumpTimer = 0;
      var waveJumpNext = 0;
      function updateWave() {
        if (state !== 'wave') return;
        var elapsed = (Date.now() - waveStart) / 1000;

        /* Variable dot speed: speed oscillates smoothly (tier 3+) */
        var pct;
        var tier = getTier();
        if (tier >= 3) {
          /* Sine-wave oscillation — dot naturally slows at edges, speeds through middle.
             No "stuck" issue because the sine derivative is continuous. */
          var period = 110 / zoneSpd;  // slightly faster than original sawtooth
          var phase = (elapsed % period) / period * 2 * Math.PI;
          pct = 50 + 50 * Math.sin(phase);
        } else {
          var raw = (elapsed * zoneSpd) % 200;
          pct = raw <= 100 ? raw : 200 - raw;
        }
        if (dot) dot.style.left = pct + '%';

        if (bonusActive) {
          /* BONUS MODE: zone chases the dot with smooth lag */
          var halfW = BONUS_WINDOW / 2;
          var targetMin = pct - halfW;
          targetMin = clamp(targetMin, 0, 100 - BONUS_WINDOW);
          sweetMin += (targetMin - sweetMin) * 0.07;
          sweetMax = sweetMin + BONUS_WINDOW;
          if (chargeWindow) {
            chargeWindow.style.left = sweetMin + '%';
            chargeWindow.style.width = BONUS_WINDOW + '%';
          }
        } else if (driftAmp > 0) {
          /* Drift mode with optional zone jumps at tier 5+ */
          if (tier >= 5 && waveJumpTimer > 0) {
            var now = Date.now();
            if (now >= waveJumpNext) {
              /* Zone teleports to a new random position */
              baseSweetMin = Math.random() * (100 - zoneW - 8) + 4;
              waveJumpNext = now + 1800 + Math.random() * 2200;
              if (chargeWindow) {
                chargeWindow.classList.add('jump');
                setTimeout(function () { if (chargeWindow) chargeWindow.classList.remove('jump'); }, 200);
              }
            }
          }
          var offset = Math.sin(elapsed * driftSpd) * driftAmp;
          sweetMin = clamp(baseSweetMin + offset, 0, 100 - zoneW);
          sweetMax = sweetMin + zoneW;
          if (chargeWindow) {
            chargeWindow.style.left = sweetMin + '%';
            chargeWindow.style.width = zoneW + '%';
          }
        }

        setCharge(pct, Math.round(pct) + '%');
        waveFrame = requestAnimationFrame(updateWave);
      }

      /* --- PHASE 3: CATCH --- */
      function tryCatch() {
        if (state !== 'wave' || animating) return;
        var pct = dotPosition();
        if (pct >= sweetMin && pct <= sweetMax) {
          /* HIT */
          stopWave();
          state = 'caught-flash';
          animating = true;
          if (window.vaultSound) window.vaultSound.launch();
          if (dot) dot.classList.add('caught');
          planet.classList.add('is-launch');
          panel.classList.add('is-activating');
          title.textContent = '✦ caught! ✦';
          setCharge(pct, '✦ nice! ✦');
          var capturePct = pct;
          setTimeout(function () {
            animating = false;
            planet.classList.remove('is-launch');
            panel.classList.remove('is-activating');
            showSuccess(capturePct);
          }, 620);
        } else {
          /* MISS — streak broken, full reset */
          catchesDone = 0;
          currentTier = 1;
          tierProgress = 0;
          perfectCombo = 0;
          bonusActive = false;
          if (chargeWindow) chargeWindow.classList.remove('bonus');
          updateTierDisplay();
          stopWave();
          state = 'idle';
          animating = true;
          if (window.vaultSound) window.vaultSound.deny();
          planet.classList.add('is-space');
          panel.classList.add('is-activating');
          setDot(false);
          if (dot) dot.style.left = '';
          resetChargeWindow();
          var dist = pct < sweetMin ? (sweetMin - pct) : (pct - sweetMax);
          var hint = pct < sweetMin ? 'too soon' : 'too late';
          title.textContent = hint + ' by ' + dist.toFixed(0) + '%';
          setCharge(pct, 'missed');
          setTimeout(function () {
            animating = false;
            planet.classList.remove('is-space');
            panel.classList.remove('is-activating');
            resetToIdle('signal lost — streak reset');
          }, 880);
        }
      }

      /* --- LAUNCH --- */
      function launchIntoArchive() {
        if (animating) return;
        animating = true;
        if (window.vaultSound) window.vaultSound.launch();
        planet.classList.remove('is-cutscene', 'is-space', 'is-spun', 'is-evolving');
        void planet.offsetWidth;
        planet.classList.add('is-launch');
        panel.classList.add('is-activating');
        title.textContent = 'launching';
        instruction.textContent = 'opening archive';
        setCharge(100, 'enter');
        setDot(false);
        signal.textContent = '';
        signal.classList.remove('live');
        showSkip(false);
        enter.classList.remove('show');
        planet.removeAttribute('data-tier');
        setTimeout(function () {
          boot.classList.add('done');
          document.body.classList.remove('booting');
          setTimeout(function () { boot.style.display = 'none'; }, 450);
        }, 460);
      }

      function planetQuickLaunch() {
        if (animating) return;
        animating = true;
        state = 'launching';
        stopWave();
        if (window.vaultSound) window.vaultSound.planet();
        planet.classList.remove('is-cutscene', 'is-space', 'is-spun', 'is-evolving', 'is-launch');
        void planet.offsetWidth;
        panel.classList.add('is-activating');
        planet.classList.add('is-cutscene');
        title.textContent = 'orbit locked';
        title.classList.add('ready');
        instruction.textContent = 'opening archive';
        instruction.classList.add('ready');
        signal.textContent = '';
        signal.classList.remove('live');
        showSkip(false);
        enter.classList.remove('show');
        resetChargeWindow();
        setDot(false);
        animateFill(0, 100, function () {
          animating = false;
          planet.classList.remove('is-cutscene');
          panel.classList.remove('is-activating');
          launchIntoArchive();
        });
      }

      function startGameMode() {
        if (animating) return;
        gameMode = true;
        state = 'idle';
        stopWave();
        resetPlanet();
        resetChargeWindow();
        setDot(false);
        setCharge(0, 'tap space to catch');
        signal.textContent = '';
        signal.classList.remove('live');
        title.textContent = 'signal game';
        title.classList.add('ready');
        instruction.textContent = 'click planet or tap space to catch signals';
        instruction.classList.add('ready');
        if (window.vaultSound) window.vaultSound.menu();
      }

      /* --- RESET --- */
      function resetBoot() {
        catchesDone = 0;
        currentTier = 1;
        tierProgress = 0;
        perfectCombo = 0;
        bestStreak = 0;
        gameMode = false;
        bonusReady = false;
        bonusActive = false;
        bonusThisTier = 0;
        if (bonusMarker) bonusMarker.classList.remove('active');
        state = 'idle';
        animating = false;
        stopWave();
        setDot(false);
        if (dot) dot.style.left = '';
        resetChargeWindow();
        boot.style.display = 'flex';
        document.body.classList.add('booting');
        resetPlanet();
        panel.classList.remove('is-activating');
        title.textContent = 'enter orbit';
        title.classList.remove('ready');
        instruction.textContent = 'click the planet';
        instruction.classList.remove('ready');
        setCharge(0, '');
        signal.textContent = '';
        signal.classList.remove('live');
        enterUnlocked = false;
        enter.textContent = 'enter →';
        enter.classList.remove('pulse', 'show');
        showSkip(true);
        requestAnimationFrame(function () { boot.classList.remove('done'); });
      }

      /* --- EVENTS --- */
      planet.addEventListener('click', function () {
        if (animating) return;
        if (!gameMode) {
          planetQuickLaunch();
        } else if (state === 'idle') {
          startScan();
        } else if (state === 'wave') {
          tryCatch();
        }
      });

      skip.addEventListener('click', function () {
        if (window.vaultSound) window.vaultSound.unlock();
        launchIntoArchive();
      });

      if (game) game.addEventListener('click', startGameMode);
      enter.addEventListener('click', launchIntoArchive);
      if (reopen) reopen.addEventListener('click', resetBoot);
      resetBtn.addEventListener('click', resetBoot);

      document.addEventListener('keydown', function (e) {
        if (!document.body.classList.contains('booting')) return;
        if (e.key === ' ' && !e.repeat) {
          if (gameMode) {
            e.preventDefault();
            if (state === 'idle' && !animating) startScan();
            else if (state === 'wave' && !animating) tryCatch();
          }
        } else if (e.key === 'Enter') {
          e.preventDefault();
          launchIntoArchive();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          if (state === 'wave' && !animating) {
            stopWave();
            setDot(false);
            if (dot) dot.style.left = '';
            resetToIdle();
          } else if (state === 'idle' && enter.classList.contains('show')) {
            launchIntoArchive();
          }
        }
      });
    })();
