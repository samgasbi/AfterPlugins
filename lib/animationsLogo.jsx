// ============================================================================
// AfterPlugins TextFX — animationsLogo.jsx
// Logo / hero text reveal presets (2D + 3D)
// ============================================================================

var TFX_LOGO = (function () {
    var U = TFX_UTILS;

    // Cinematic 2D logo reveal: scale, blur, glow, fade together
    function cinematicReveal(comp, layer, opts) {
        var dur = opts.duration || 2.5;
        var t0  = opts.startTime;

        // Scale anim
        var s = layer.property("ADBE Transform Group").property("ADBE Scale");
        var base = s.value;
        s.setValueAtTime(t0,        [base[0] * 1.25, base[1] * 1.25]);
        s.setValueAtTime(t0 + dur,  base);
        U.smoothKeys(s);

        // Opacity anim
        var op = layer.property("ADBE Transform Group").property("ADBE Opacity");
        op.setValueAtTime(t0,           0);
        op.setValueAtTime(t0 + dur*0.6, 100);
        U.smoothKeys(op);

        // Fast Box Blur
        var blur;
        try { blur = U.addEffect(layer, "ADBE Box Blur2"); }
        catch (e) { try { blur = U.addEffect(layer, "ADBE Fast Blur"); } catch (e2) {} }
        if (blur) {
            var bp = blur.property(1);
            bp.setValueAtTime(t0,        80);
            bp.setValueAtTime(t0 + dur,  0);
            U.smoothKeys(bp);
        }

        // Glow
        try {
            var glow = U.addEffect(layer, "ADBE Glo2");
            glow.property("ADBE Glo2-0002").setValue(40); // threshold
            glow.property("ADBE Glo2-0003").setValue(2);  // glow radius
            glow.property("ADBE Glo2-0004").setValue(2);  // glow intensity
        } catch (e) {}
    }

    // 3D logo reveal: per-character cascade with depth and glow
    function logo3DCascade(comp, layer, opts) {
        var dur = opts.duration || 2.0;
        var t0  = opts.startTime;
        var fontSize = U.getFontSize(layer);

        U.set3D(layer, true);

        var anim = U.addAnimator(layer, "TFX Logo 3D Cascade");
        var sel  = U.addRangeSelector(anim);
        U.configureAdvanced(sel, { basedOn: 1, shape: 6, smoothness: 100, easeHigh: 50, easeLow: 0 });

        var pos = U.addAnimatorProp(anim, "ADBE Text Position 3D");
        pos.setValue([0, fontSize * 0.6, -fontSize * 3]);
        var ry = U.addAnimatorProp(anim, "ADBE Text Rotation Y");
        ry.setValue(75);
        var op = U.addAnimatorProp(anim, "ADBE Text Opacity"); op.setValue(0);

        U.animateRange(anim, t0, dur);

        try {
            var glow = U.addEffect(layer, "ADBE Glo2");
            glow.property("ADBE Glo2-0003").setValue(40);
            glow.property("ADBE Glo2-0004").setValue(1.5);
        } catch (e) {}
    }

    // Impact stamp: huge scale crashing down with motion blur and shake
    function stampImpact(comp, layer, opts) {
        var dur = opts.duration || 1.0;
        var t0  = opts.startTime;

        var s = layer.property("ADBE Transform Group").property("ADBE Scale");
        var base = s.value;
        s.setValueAtTime(t0,            [base[0]*5, base[1]*5]);
        s.setValueAtTime(t0 + dur*0.5,  [base[0]*0.92, base[1]*0.92]);
        s.setValueAtTime(t0 + dur,      base);
        U.smoothKeys(s);

        var op = layer.property("ADBE Transform Group").property("ADBE Opacity");
        op.setValueAtTime(t0,           0);
        op.setValueAtTime(t0 + dur*0.1, 100);

        // Camera shake post-impact via position expression
        try {
            var p = layer.property("ADBE Transform Group").property("ADBE Position");
            var basePos = p.value;
            p.expression =
                "amp = 60;\n" +
                "freq = 12;\n" +
                "decay = 8;\n" +
                "t = time - " + (t0 + dur*0.5) + ";\n" +
                "if (t < 0) value\n" +
                "else value + [Math.cos(freq*t*2*Math.PI), Math.sin(freq*1.3*t*2*Math.PI)] * amp / Math.exp(decay*t);";
        } catch (e) {}

        // Motion blur
        try { layer.motionBlur = true; } catch (e) {}
        try { comp.motionBlur = true; } catch (e) {}
    }

    // Futuristic HUD reveal: scanline mask + chromatic split
    function hudReveal(comp, layer, opts) {
        var dur = opts.duration || 1.5;
        var t0  = opts.startTime;

        var anim = U.addAnimator(layer, "TFX HUD Reveal");
        var sel  = U.addRangeSelector(anim);
        U.configureAdvanced(sel, { basedOn: 1, shape: 6 });

        var op = U.addAnimatorProp(anim, "ADBE Text Opacity"); op.setValue(0);
        var tr = U.addAnimatorProp(anim, "ADBE Text Tracking Amount"); tr.setValue(80);
        var blur = U.addAnimatorProp(anim, "ADBE Text Blur"); blur.setValue([30, 0]);
        U.animateRange(anim, t0, dur);

        // Channel offset (chromatic aberration) via Shift Channels or CC RGB Splitter
        try {
            var rgb = U.addEffect(layer, "CC RGB Splitter");
            var off = rgb.property("From Center");
            off.setValueAtTime(t0,     40);
            off.setValueAtTime(t0+dur, 0);
        } catch (e) {}

        // Posterize time for scanline feel
        try {
            var pt = U.addEffect(layer, "ADBE Posterize Time");
            pt.property(1).setValue(18);
        } catch (e) {}
    }

    // Energy burst — uses scale + glow + radial blur expression
    function energyBurst(comp, layer, opts) {
        var dur = opts.duration || 1.3;
        var t0  = opts.startTime;

        var anim = U.addAnimator(layer, "TFX Energy Burst");
        var sel  = U.addRangeSelector(anim);
        U.configureAdvanced(sel, { basedOn: 1, shape: 6, smoothness: 100, randomize: true });

        var sc = U.addAnimatorProp(anim, "ADBE Text Scale");
        sc.setValue([300, 300, 100]);
        var op = U.addAnimatorProp(anim, "ADBE Text Opacity"); op.setValue(0);
        var blur = U.addAnimatorProp(anim, "ADBE Text Blur"); blur.setValue([80, 80]);

        U.animateRange(anim, t0, dur);

        try {
            var glow = U.addEffect(layer, "ADBE Glo2");
            var gr = glow.property("ADBE Glo2-0003"); // radius
            gr.setValueAtTime(t0,         120);
            gr.setValueAtTime(t0 + dur,   8);
            U.smoothKeys(gr);
            glow.property("ADBE Glo2-0004").setValue(2.5);
        } catch (e) {}
    }

    return {
        cinematicReveal: { name: "Cinematic Reveal", run: cinematicReveal },
        logo3DCascade:   { name: "3D Cascade",       run: logo3DCascade },
        stampImpact:     { name: "Stamp Impact",     run: stampImpact },
        hudReveal:       { name: "HUD Reveal",       run: hudReveal },
        energyBurst:     { name: "Energy Burst",     run: energyBurst }
    };
})();
