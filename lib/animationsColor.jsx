// ============================================================================
// AfterPlugins TextFX — animationsColor.jsx
// Color animation presets
// ============================================================================

var TFX_COLOR = (function () {
    var U = TFX_UTILS;

    function gradientSweep(comp, layer, opts) {
        var dur = opts.duration || 2.0;
        var t0  = opts.startTime;
        var c1  = opts.color  || [0.2, 0.8, 1, 1];
        var c2  = opts.color2 || [1, 0.3, 0.9, 1];

        var anim = U.addAnimator(layer, "TFX Gradient Sweep");
        var sel  = U.addRangeSelector(anim);
        U.configureAdvanced(sel, { basedOn: 1, shape: 6, smoothness: 100 });

        var fill = U.addAnimatorProp(anim, "ADBE Text Fill Color");
        fill.setValue(c1);

        // Sweep via offset
        var off = sel.property("ADBE Text Percent Offset");
        off.setValueAtTime(t0,         -100);
        off.setValueAtTime(t0 + dur,    100);
        U.smoothKeys(off);
        sel.property("ADBE Text Percent Start").setValue(-25);
        sel.property("ADBE Text Percent End").setValue(25);

        // Second animator for the trailing color
        var anim2 = U.addAnimator(layer, "TFX Gradient Trail");
        var sel2  = U.addRangeSelector(anim2);
        U.configureAdvanced(sel2, { basedOn: 1, shape: 6, smoothness: 100 });
        var fill2 = U.addAnimatorProp(anim2, "ADBE Text Fill Color");
        fill2.setValue(c2);
        var off2 = sel2.property("ADBE Text Percent Offset");
        off2.setValueAtTime(t0,         -150);
        off2.setValueAtTime(t0 + dur,    50);
        U.smoothKeys(off2);
        sel2.property("ADBE Text Percent Start").setValue(-25);
        sel2.property("ADBE Text Percent End").setValue(25);
    }

    function hueCycle(comp, layer, opts) {
        var dur = opts.duration || 4.0;
        var t0  = opts.startTime;

        var anim = U.addAnimator(layer, "TFX Hue Cycle");
        U.addRangeSelector(anim);

        var hue = U.addAnimatorProp(anim, "ADBE Text Hue");
        hue.setValueAtTime(t0,         0);
        hue.setValueAtTime(t0 + dur,   360);
        try {
            hue.expression = "linear(time, " + t0 + ", " + (t0+dur) + ", 0, 360)";
        } catch (e) {}
    }

    function neonGlow(comp, layer, opts) {
        var dur = opts.duration || 1.5;
        var t0  = opts.startTime;
        var color = opts.color || [0.3, 0.6, 1, 1];

        // Set fill color to chosen
        try {
            var fillAll = U.addAnimator(layer, "TFX Neon Color");
            U.addRangeSelector(fillAll);
            var f = U.addAnimatorProp(fillAll, "ADBE Text Fill Color");
            f.setValue(color);
        } catch (e) {}

        try {
            var glow = U.addEffect(layer, "ADBE Glo2");
            glow.property("ADBE Glo2-0002").setValue(35);
            glow.property("ADBE Glo2-0007").setValue(2); // A&B colors
            glow.property("ADBE Glo2-0008").setValue(color);
            glow.property("ADBE Glo2-0009").setValue(color);
            var r = glow.property("ADBE Glo2-0003");
            r.setValueAtTime(t0,         8);
            r.setValueAtTime(t0 + dur*0.4, 60);
            r.setValueAtTime(t0 + dur,   25);
            U.smoothKeys(r);
            glow.property("ADBE Glo2-0004").setValue(2.0);
            r.expression =
                "base = 25; amp = 6; freq = 1.2;\n" +
                "if (time < " + (t0+dur) + ") value\n" +
                "else base + Math.sin((time-"+(t0+dur)+")*freq*2*Math.PI)*amp;";
        } catch (e) {}
    }

    function chromaticAberration(comp, layer, opts) {
        var dur = opts.duration || 1.2;
        var t0  = opts.startTime;

        try {
            var rgb = U.addEffect(layer, "CC RGB Splitter");
            var off = rgb.property("From Center");
            off.setValueAtTime(t0,         60);
            off.setValueAtTime(t0 + dur*0.6, 0);
            off.setValueAtTime(t0 + dur,   8);
            U.smoothKeys(off);
            // wiggle for futuristic feel after settle
            off.expression =
                "if (time < " + (t0+dur) + ") value\n" +
                "else 6 + wiggle(2, 4)";
        } catch (e) {
            // Fallback: Channel offset using Shift Channels
            try {
                var shift = U.addEffect(layer, "ADBE Shift Channels");
                shift; // no-op fallback marker
            } catch (e2) {}
        }
    }

    function rainbowPerChar(comp, layer, opts) {
        var dur = opts.duration || 0.001;
        var t0  = opts.startTime;

        var anim = U.addAnimator(layer, "TFX Rainbow Per Char");
        var sel  = U.addRangeSelector(anim);
        U.configureAdvanced(sel, { basedOn: 1, shape: 1 });

        var fill = U.addAnimatorProp(anim, "ADBE Text Fill Color");
        try {
            fill.expression =
                "hue = (textIndex / Math.max(textTotal,1) + time*0.15) % 1;\n" +
                "function hsv2rgb(h,s,v){\n" +
                "  var i=Math.floor(h*6),f=h*6-i,p=v*(1-s),q=v*(1-f*s),t=v*(1-(1-f)*s);\n" +
                "  switch(i%6){case 0:return[v,t,p];case 1:return[q,v,p];case 2:return[p,v,t];case 3:return[p,q,v];case 4:return[t,p,v];case 5:return[v,p,q];}\n" +
                "}\n" +
                "var rgb = hsv2rgb(hue,1,1);\n" +
                "[rgb[0],rgb[1],rgb[2],1];";
        } catch (e) {}
    }

    function colorFlashIn(comp, layer, opts) {
        var dur = opts.duration || 0.6;
        var t0  = opts.startTime;
        var color = opts.color || [1,1,1,1];

        var anim = U.addAnimator(layer, "TFX Color Flash");
        var sel  = U.addRangeSelector(anim);
        U.configureAdvanced(sel, { basedOn: 1, shape: 6 });

        var fill = U.addAnimatorProp(anim, "ADBE Text Fill Color");
        fill.setValue(color);

        U.animateRange(anim, t0, dur);
    }

    return {
        gradientSweep:        { name: "Gradient Sweep",     run: gradientSweep,        needsColor: true, needsColor2: true },
        hueCycle:             { name: "Hue Cycle",          run: hueCycle },
        neonGlow:             { name: "Neon Glow",          run: neonGlow,             needsColor: true },
        chromaticAberration:  { name: "Chromatic Aberration", run: chromaticAberration },
        rainbowPerChar:       { name: "Rainbow Per Char",   run: rainbowPerChar },
        colorFlashIn:         { name: "Color Flash In",     run: colorFlashIn,         needsColor: true }
    };
})();
