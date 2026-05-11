// ============================================================================
// AfterPlugins TextFX — animations2D.jsx
// 2D text animation presets
// Each function signature: fn(comp, layer, opts)
//   opts = { duration, startTime, intensity }
// ============================================================================

var TFX_2D = (function () {
    var U = TFX_UTILS;

    function typewriter(comp, layer, opts) {
        var dur = opts.duration || 1.5;
        var t0  = opts.startTime;

        var anim = U.addAnimator(layer, "TFX Typewriter");
        var sel  = U.addRangeSelector(anim);
        U.configureAdvanced(sel, { basedOn: 1, shape: 1 });

        var opacity = U.addAnimatorProp(anim, "ADBE Text Opacity");
        opacity.setValue(0);

        // Animate end from 0 -> 100 reveals characters
        var endProp = sel.property("ADBE Text Percent End");
        var startProp = sel.property("ADBE Text Percent Start");
        startProp.setValue(0);
        endProp.setValueAtTime(t0, 0);
        endProp.setValueAtTime(t0 + dur, 100);
        U.smoothKeys(endProp);
    }

    function slideInBottom(comp, layer, opts) {
        var dur = opts.duration || 1.0;
        var t0  = opts.startTime;
        var fontSize = U.getFontSize(layer);

        var anim = U.addAnimator(layer, "TFX Slide In");
        var sel  = U.addRangeSelector(anim);
        U.configureAdvanced(sel, { basedOn: 1, shape: 6, easeHigh: 0, easeLow: 0 });

        var pos = U.addAnimatorProp(anim, "ADBE Text Position 3D");
        pos.setValue([0, fontSize * 1.5, 0]);
        var op  = U.addAnimatorProp(anim, "ADBE Text Opacity");
        op.setValue(0);

        U.animateRange(anim, t0, dur);
    }

    function fadeInWord(comp, layer, opts) {
        var dur = opts.duration || 1.2;
        var t0  = opts.startTime;

        var anim = U.addAnimator(layer, "TFX Fade Word");
        var sel  = U.addRangeSelector(anim);
        U.configureAdvanced(sel, { basedOn: 3, shape: 6 });

        var op = U.addAnimatorProp(anim, "ADBE Text Opacity");
        op.setValue(0);

        U.animateRange(anim, t0, dur);
    }

    function scaleBounce(comp, layer, opts) {
        var dur = opts.duration || 1.0;
        var t0  = opts.startTime;

        var anim = U.addAnimator(layer, "TFX Scale Bounce");
        var sel  = U.addRangeSelector(anim);
        U.configureAdvanced(sel, { basedOn: 1, shape: 6, randomize: true });

        var sc = U.addAnimatorProp(anim, "ADBE Text Scale");
        sc.setValue([0, 0, 100]);
        var op = U.addAnimatorProp(anim, "ADBE Text Opacity");
        op.setValue(0);

        var sel1 = U.animateRange(anim, t0, dur);

        // Bouncy expression on offset
        try {
            var off = sel1.property("ADBE Text Percent Offset");
            off.expression =
                "amp = 0.08;\n" +
                "freq = 3.0;\n" +
                "decay = 4.0;\n" +
                "n = 0;\n" +
                "if (numKeys > 0) n = nearestKey(time).index;\n" +
                "if (key(n).time > time) n--;\n" +
                "if (n == 0) { value } else {\n" +
                "  t = time - key(n).time;\n" +
                "  amp*Math.sin(freq*t*2*Math.PI)/Math.exp(decay*t)*100 + value;\n" +
                "}";
        } catch (e) {}
    }

    function wave(comp, layer, opts) {
        var dur = opts.duration || 2.0;
        var t0  = opts.startTime;
        var fontSize = U.getFontSize(layer);

        var anim = U.addAnimator(layer, "TFX Wave");
        var sel  = U.addRangeSelector(anim);
        U.configureAdvanced(sel, { basedOn: 1, shape: 6, smoothness: 100, easeHigh: 0, easeLow: 0 });

        var pos = U.addAnimatorProp(anim, "ADBE Text Position 3D");
        pos.setValue([0, -fontSize * 0.35, 0]);

        // Loop wave through offset
        var off = sel.property("ADBE Text Percent Offset");
        off.setValueAtTime(t0, -100);
        off.setValueAtTime(t0 + dur, 100);
        try {
            off.expression = "linear(time, " + t0 + ", " + (t0 + dur) + ", -100, 100)";
        } catch (e) {}

        // Narrow range for traveling wave
        sel.property("ADBE Text Percent Start").setValue(-30);
        sel.property("ADBE Text Percent End").setValue(30);
    }

    function glitchIn(comp, layer, opts) {
        var dur = opts.duration || 0.8;
        var t0  = opts.startTime;
        var fontSize = U.getFontSize(layer);
        var amp = (opts.intensity || 1.0) * fontSize * 0.4;

        var anim = U.addAnimator(layer, "TFX Glitch In");
        var sel  = U.addRangeSelector(anim);
        U.configureAdvanced(sel, { basedOn: 1, shape: 1, randomize: true });

        var pos = U.addAnimatorProp(anim, "ADBE Text Position 3D");
        pos.setValue([0, 0, 0]);
        try {
            pos.expression =
                "seed = textIndex;\n" +
                "seedRandom(seed, true);\n" +
                "amp = " + amp + ";\n" +
                "fr = 18;\n" +
                "[wiggle(fr, amp, 1, 0.5, time)[0] - position[0], wiggle(fr, amp, 1, 0.5, time+0.13)[1] - position[1], 0]";
        } catch (e) {}

        var op = U.addAnimatorProp(anim, "ADBE Text Opacity");
        op.setValue(0);
        var skew = U.addAnimatorProp(anim, "ADBE Text Skew");
        skew.setValue(15);

        U.animateRange(anim, t0, dur);

        // Add CC RGB Splitter style via Channel Mixer / glow if available
        try {
            var posterize = U.addEffect(layer, "ADBE Posterize Time");
            posterize.property("ADBE Posterize Time-0001").setValue(24);
        } catch (e) {}
    }

    function blurReveal(comp, layer, opts) {
        var dur = opts.duration || 1.4;
        var t0  = opts.startTime;
        var intensity = opts.intensity || 1.0;

        var anim = U.addAnimator(layer, "TFX Blur Reveal");
        var sel  = U.addRangeSelector(anim);
        U.configureAdvanced(sel, { basedOn: 1, shape: 6, smoothness: 100 });

        var blur = U.addAnimatorProp(anim, "ADBE Text Blur");
        blur.setValue([60 * intensity, 60 * intensity]);
        var op = U.addAnimatorProp(anim, "ADBE Text Opacity");
        op.setValue(0);
        var tr = U.addAnimatorProp(anim, "ADBE Text Tracking Amount");
        tr.setValue(30);

        U.animateRange(anim, t0, dur);
    }

    function trackingExpand(comp, layer, opts) {
        var dur = opts.duration || 1.5;
        var t0  = opts.startTime;

        var anim = U.addAnimator(layer, "TFX Tracking Expand");
        var sel  = U.addRangeSelector(anim);
        U.configureAdvanced(sel, { basedOn: 1, shape: 6 });

        var tr = U.addAnimatorProp(anim, "ADBE Text Tracking Amount");
        tr.setValue(40);
        var op = U.addAnimatorProp(anim, "ADBE Text Opacity");
        op.setValue(0);

        U.animateRange(anim, t0, dur);
    }

    function rotateIn(comp, layer, opts) {
        var dur = opts.duration || 1.0;
        var t0  = opts.startTime;

        var anim = U.addAnimator(layer, "TFX Rotate In");
        var sel  = U.addRangeSelector(anim);
        U.configureAdvanced(sel, { basedOn: 1, shape: 6 });

        var rot = U.addAnimatorProp(anim, "ADBE Text Rotation");
        rot.setValue(180);
        var op  = U.addAnimatorProp(anim, "ADBE Text Opacity");
        op.setValue(0);
        var sc  = U.addAnimatorProp(anim, "ADBE Text Scale");
        sc.setValue([20, 20, 100]);

        U.animateRange(anim, t0, dur);
    }

    return {
        typewriter:     { name: "Typewriter",      run: typewriter },
        slideInBottom:  { name: "Slide In Bottom", run: slideInBottom },
        fadeInWord:     { name: "Fade In (Word)",  run: fadeInWord },
        scaleBounce:    { name: "Scale Bounce",    run: scaleBounce },
        wave:           { name: "Wave",            run: wave },
        glitchIn:       { name: "Glitch In",       run: glitchIn },
        blurReveal:     { name: "Blur Reveal",     run: blurReveal },
        trackingExpand: { name: "Tracking Expand", run: trackingExpand },
        rotateIn:       { name: "Rotate In",       run: rotateIn }
    };
})();
