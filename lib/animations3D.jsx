// ============================================================================
// AfterPlugins TextFX — animations3D.jsx
// 3D text animation presets (enables Per-character 3D / 3D layer where needed)
// ============================================================================

var TFX_3D = (function () {
    var U = TFX_UTILS;

    function enablePerChar3D(layer) {
        try {
            // Toggle Per-character 3D via the 3D Animators property
            var anim3D = layer.property("ADBE Text Properties").property("ADBE Text More Options")
                                .property("ADBE Text Anchor Point Option");
            // Ensure per-character 3D
            layer.property("ADBE Text Properties").property("ADBE Text More Options")
                 .property("ADBE Text Anchor Point Align").setValue(1);
        } catch (e) {}
        try {
            // The reliable way: set the layer's 3D property AND enable per-character via menu cmd
            layer.threeDLayer = true;
            // Per-character 3D is exposed via animator's "Enable Per-character 3D" option;
            // in scripting we set it on the Text property group:
            var tprops = layer.property("ADBE Text Properties");
            // Some AE versions expose this:
            try { tprops.property("ADBE Text Has 3D").setValue(true); } catch (e2) {}
        } catch (e) {}
    }

    function flipReveal(comp, layer, opts) {
        var dur = opts.duration || 1.2;
        var t0  = opts.startTime;

        enablePerChar3D(layer);

        var anim = U.addAnimator(layer, "TFX 3D Flip Reveal");
        var sel  = U.addRangeSelector(anim);
        U.configureAdvanced(sel, { basedOn: 1, shape: 6 });

        var rx = U.addAnimatorProp(anim, "ADBE Text Rotation X");
        rx.setValue(-90);
        var op = U.addAnimatorProp(anim, "ADBE Text Opacity");
        op.setValue(0);

        U.animateRange(anim, t0, dur);
    }

    function spinY(comp, layer, opts) {
        var dur = opts.duration || 1.4;
        var t0  = opts.startTime;

        enablePerChar3D(layer);

        var anim = U.addAnimator(layer, "TFX 3D Spin Y");
        var sel  = U.addRangeSelector(anim);
        U.configureAdvanced(sel, { basedOn: 1, shape: 6, smoothness: 100 });

        var ry = U.addAnimatorProp(anim, "ADBE Text Rotation Y");
        ry.setValue(180);
        var op = U.addAnimatorProp(anim, "ADBE Text Opacity");
        op.setValue(0);
        var sc = U.addAnimatorProp(anim, "ADBE Text Scale");
        sc.setValue([60, 60, 100]);

        U.animateRange(anim, t0, dur);
    }

    function tumble(comp, layer, opts) {
        var dur = opts.duration || 1.5;
        var t0  = opts.startTime;

        enablePerChar3D(layer);

        var anim = U.addAnimator(layer, "TFX 3D Tumble");
        var sel  = U.addRangeSelector(anim);
        U.configureAdvanced(sel, { basedOn: 1, shape: 6, randomize: true });

        var rx = U.addAnimatorProp(anim, "ADBE Text Rotation X"); rx.setValue(-180);
        var ry = U.addAnimatorProp(anim, "ADBE Text Rotation Y"); ry.setValue(120);
        var rz = U.addAnimatorProp(anim, "ADBE Text Rotation");   rz.setValue(-60);
        var op = U.addAnimatorProp(anim, "ADBE Text Opacity");    op.setValue(0);
        var sc = U.addAnimatorProp(anim, "ADBE Text Scale");      sc.setValue([0, 0, 100]);

        U.animateRange(anim, t0, dur);
    }

    function depthFlyIn(comp, layer, opts) {
        var dur = opts.duration || 1.3;
        var t0  = opts.startTime;
        var fontSize = U.getFontSize(layer);

        enablePerChar3D(layer);

        var anim = U.addAnimator(layer, "TFX 3D Depth Fly-In");
        var sel  = U.addRangeSelector(anim);
        U.configureAdvanced(sel, { basedOn: 1, shape: 6 });

        var pos = U.addAnimatorProp(anim, "ADBE Text Position 3D");
        pos.setValue([0, 0, -fontSize * 8]);
        var op = U.addAnimatorProp(anim, "ADBE Text Opacity");
        op.setValue(0);
        var blur = U.addAnimatorProp(anim, "ADBE Text Blur");
        blur.setValue([40, 40]);

        U.animateRange(anim, t0, dur);
    }

    function cubeUnfold(comp, layer, opts) {
        var dur = opts.duration || 1.6;
        var t0  = opts.startTime;
        var fontSize = U.getFontSize(layer);

        enablePerChar3D(layer);

        var anim = U.addAnimator(layer, "TFX 3D Cube Unfold");
        var sel  = U.addRangeSelector(anim);
        U.configureAdvanced(sel, { basedOn: 1, shape: 6 });

        var rx = U.addAnimatorProp(anim, "ADBE Text Rotation X");
        rx.setValue(-90);
        var anch = U.addAnimatorProp(anim, "ADBE Text Anchor Point 3D");
        anch.setValue([0, -fontSize * 0.5, 0]);
        var op = U.addAnimatorProp(anim, "ADBE Text Opacity"); op.setValue(0);

        U.animateRange(anim, t0, dur);
    }

    function orbitIn(comp, layer, opts) {
        var dur = opts.duration || 1.8;
        var t0  = opts.startTime;
        var fontSize = U.getFontSize(layer);

        enablePerChar3D(layer);

        var anim = U.addAnimator(layer, "TFX 3D Orbit In");
        var sel  = U.addRangeSelector(anim);
        U.configureAdvanced(sel, { basedOn: 1, shape: 6, randomize: true });

        var pos = U.addAnimatorProp(anim, "ADBE Text Position 3D");
        pos.setValue([fontSize * 4, -fontSize * 2, -fontSize * 6]);
        var ry  = U.addAnimatorProp(anim, "ADBE Text Rotation Y");
        ry.setValue(-360);
        var op  = U.addAnimatorProp(anim, "ADBE Text Opacity"); op.setValue(0);

        U.animateRange(anim, t0, dur);
    }

    function shutterReveal(comp, layer, opts) {
        var dur = opts.duration || 1.3;
        var t0  = opts.startTime;

        enablePerChar3D(layer);

        var anim = U.addAnimator(layer, "TFX 3D Shutter");
        var sel  = U.addRangeSelector(anim);
        U.configureAdvanced(sel, { basedOn: 1, shape: 1 });

        var rx = U.addAnimatorProp(anim, "ADBE Text Rotation X");
        rx.setValue(-110);
        var op = U.addAnimatorProp(anim, "ADBE Text Opacity"); op.setValue(0);
        var sk = U.addAnimatorProp(anim, "ADBE Text Skew");    sk.setValue(40);

        U.animateRange(anim, t0, dur);
    }

    function dominoFall(comp, layer, opts) {
        var dur = opts.duration || 1.8;
        var t0  = opts.startTime;
        var fontSize = U.getFontSize(layer);

        enablePerChar3D(layer);

        var anim = U.addAnimator(layer, "TFX 3D Domino");
        var sel  = U.addRangeSelector(anim);
        U.configureAdvanced(sel, { basedOn: 1, shape: 6, easeHigh: 60 });

        var rz = U.addAnimatorProp(anim, "ADBE Text Rotation"); rz.setValue(85);
        var rx = U.addAnimatorProp(anim, "ADBE Text Rotation X"); rx.setValue(20);
        var anch = U.addAnimatorProp(anim, "ADBE Text Anchor Point 3D");
        anch.setValue([0, fontSize*0.5, 0]);
        var op = U.addAnimatorProp(anim, "ADBE Text Opacity"); op.setValue(0);

        U.animateRange(anim, t0, dur);
    }

    return {
        flipReveal:    { name: "3D Flip Reveal",   run: flipReveal },
        spinY:         { name: "3D Spin Y",        run: spinY },
        tumble:        { name: "3D Tumble",        run: tumble },
        depthFlyIn:    { name: "3D Depth Fly-In",  run: depthFlyIn },
        cubeUnfold:    { name: "3D Cube Unfold",   run: cubeUnfold },
        orbitIn:       { name: "3D Orbit In",      run: orbitIn },
        shutterReveal: { name: "3D Shutter",       run: shutterReveal },
        dominoFall:    { name: "3D Domino Fall",   run: dominoFall }
    };
})();
