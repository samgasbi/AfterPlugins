// ============================================================================
// AfterPlugins TextFX — animationsStroke.jsx
// Stroke / spline reveal and unveil animations
//   Approach: clone text layer -> outline strokes via Stroke effect using
//   text outline shapes generated via "Create Shapes from Text" command,
//   then animate Trim Paths.
// ============================================================================

var TFX_STROKE = (function () {
    var U = TFX_UTILS;

    // Convert a text layer to shape layer via menu command. Returns the shape layer.
    function createShapesFromText(comp, textLayer) {
        // Snapshot existing shape layers by object identity (indices shift after insertion)
        var beforeList = [];
        for (var i = 1; i <= comp.numLayers; i++) {
            var L = comp.layer(i);
            if (L instanceof ShapeLayer) beforeList.push(L);
        }
        function wasBefore(layer) {
            for (var b = 0; b < beforeList.length; b++) if (beforeList[b] === layer) return true;
            return false;
        }

        // Deselect everything else; select only this text layer
        for (var j = 1; j <= comp.numLayers; j++) comp.layer(j).selected = false;
        textLayer.selected = true;

        try {
            var id = app.findMenuCommandId("Create Shapes from Text");
            if (!id) {
                alert("AfterPlugins TextFX:\n'Create Shapes from Text' menu command not found.\n" +
                      "Stroke/Spline presets require this command (English AE menus).");
                return null;
            }
            app.executeCommand(id);
        } catch (e) {
            alert("AfterPlugins TextFX:\nCould not run 'Create Shapes from Text'.\n" + e.toString());
            return null;
        }

        // Find the new shape layer (the one not in our snapshot)
        for (var k = 1; k <= comp.numLayers; k++) {
            var N = comp.layer(k);
            if (N instanceof ShapeLayer && !wasBefore(N)) return N;
        }
        return null;
    }

    // Apply trim paths animation to every group inside a shape layer
    function applyTrimPathsAnim(shapeLayer, t0, dur, startVal, endVal) {
        startVal = startVal === undefined ? 0   : startVal;
        endVal   = endVal   === undefined ? 100 : endVal;

        var contents = shapeLayer.property("ADBE Root Vectors Group");
        for (var i = 1; i <= contents.numProperties; i++) {
            var g = contents.property(i);
            if (g.matchName === "ADBE Vector Group") {
                var gc = g.property("ADBE Vectors Group");
                // Add Trim Paths
                var trim = gc.addProperty("ADBE Vector Filter - Trim");
                var endP = trim.property("ADBE Vector Trim End");
                endP.setValueAtTime(t0,        startVal);
                endP.setValueAtTime(t0 + dur,  endVal);
                U.smoothKeys(endP);
            }
        }
    }

    // Replace fill with stroke inside a shape layer (for clean stroke-only reveal)
    function strokifyShapes(shapeLayer, strokeWidth, strokeColor) {
        var contents = shapeLayer.property("ADBE Root Vectors Group");
        for (var i = 1; i <= contents.numProperties; i++) {
            var g = contents.property(i);
            if (g.matchName === "ADBE Vector Group") {
                var gc = g.property("ADBE Vectors Group");
                // Remove existing fills
                for (var k = gc.numProperties; k >= 1; k--) {
                    if (gc.property(k).matchName === "ADBE Vector Graphic - Fill") gc.property(k).remove();
                }
                // Add stroke if missing
                var hasStroke = false;
                for (var s = 1; s <= gc.numProperties; s++) {
                    if (gc.property(s).matchName === "ADBE Vector Graphic - Stroke") { hasStroke = true; break; }
                }
                if (!hasStroke) {
                    var stroke = gc.addProperty("ADBE Vector Graphic - Stroke");
                    stroke.property("ADBE Vector Stroke Color").setValue(strokeColor || [1,1,1,1]);
                    stroke.property("ADBE Vector Stroke Width").setValue(strokeWidth || 4);
                }
            }
        }
    }

    // Pure stroke write-on reveal
    function strokeWriteOn(comp, layer, opts) {
        var dur = opts.duration || 2.5;
        var t0  = opts.startTime;
        var color = opts.color || [1,1,1,1];

        var shape = createShapesFromText(comp, layer);
        if (!shape) return;
        strokifyShapes(shape, opts.strokeWidth || 4, color);
        applyTrimPathsAnim(shape, t0, dur, 0, 100);
        shape.name = layer.name + " — TFX Write-On";
    }

    // Stroke reveal -> fill in
    function strokeRevealThenFill(comp, layer, opts) {
        var dur = opts.duration || 3.0;
        var t0  = opts.startTime;
        var color = opts.color || [1,1,1,1];

        // 1) Duplicate the text layer; one becomes stroke layer, other stays as fill
        var fillLayer = layer; // original (fades in second)
        fillLayer.property("ADBE Transform Group").property("ADBE Opacity").setValueAtTime(t0,            0);
        fillLayer.property("ADBE Transform Group").property("ADBE Opacity").setValueAtTime(t0 + dur*0.6,  0);
        fillLayer.property("ADBE Transform Group").property("ADBE Opacity").setValueAtTime(t0 + dur,      100);

        // 2) Create stroke shapes
        var shape = createShapesFromText(comp, fillLayer);
        if (!shape) return;
        strokifyShapes(shape, opts.strokeWidth || 3, color);
        applyTrimPathsAnim(shape, t0, dur * 0.7, 0, 100);

        // 3) Fade stroke out as fill fades in
        var sop = shape.property("ADBE Transform Group").property("ADBE Opacity");
        sop.setValueAtTime(t0 + dur*0.6, 100);
        sop.setValueAtTime(t0 + dur,     0);
        shape.name = layer.name + " — TFX Stroke Reveal";
    }

    // Spline unveil: stroke draws, then unveils (trim end -> 100, then trim start -> 100)
    function splineUnveil(comp, layer, opts) {
        var dur = opts.duration || 3.5;
        var t0  = opts.startTime;
        var color = opts.color || [0.2, 1, 0.8, 1];

        var shape = createShapesFromText(comp, layer);
        if (!shape) return;
        strokifyShapes(shape, opts.strokeWidth || 4, color);

        var contents = shape.property("ADBE Root Vectors Group");
        for (var i = 1; i <= contents.numProperties; i++) {
            var g = contents.property(i);
            if (g.matchName === "ADBE Vector Group") {
                var gc = g.property("ADBE Vectors Group");
                var trim = gc.addProperty("ADBE Vector Filter - Trim");
                var start = trim.property("ADBE Vector Trim Start");
                var end   = trim.property("ADBE Vector Trim End");

                end.setValueAtTime(t0,            0);
                end.setValueAtTime(t0 + dur*0.5,  100);
                start.setValueAtTime(t0 + dur*0.55, 0);
                start.setValueAtTime(t0 + dur,    100);
                U.smoothKeys(end);
                U.smoothKeys(start);
            }
        }
        shape.name = layer.name + " — TFX Spline Unveil";
    }

    // Neon outline pulse: stroke writes on, then pulses glow
    function neonOutline(comp, layer, opts) {
        var dur = opts.duration || 2.5;
        var t0  = opts.startTime;
        var color = opts.color || [0.3, 0.7, 1, 1];

        var shape = createShapesFromText(comp, layer);
        if (!shape) return;
        strokifyShapes(shape, opts.strokeWidth || 5, color);
        applyTrimPathsAnim(shape, t0, dur * 0.7, 0, 100);

        try {
            var glow = U.addEffect(shape, "ADBE Glo2");
            glow.property("ADBE Glo2-0003").setValue(60);
            glow.property("ADBE Glo2-0004").setValue(2.5);
            glow.property("ADBE Glo2-0007").setValue(2); // glow colors -> A&B colors
            glow.property("ADBE Glo2-0008").setValue(color);
            // Pulse via expression on glow radius
            var gr = glow.property("ADBE Glo2-0003");
            gr.expression =
                "base = 40;\n" +
                "amp  = 25;\n" +
                "freq = 1.2;\n" +
                "if (time < " + (t0 + dur*0.7) + ") value\n" +
                "else base + Math.sin((time - " + (t0 + dur*0.7) + ") * freq * 2 * Math.PI) * amp;";
        } catch (e) {}
        shape.name = layer.name + " — TFX Neon Outline";
    }

    // Dual-direction stroke (top + bottom write toward middle)
    function dualStroke(comp, layer, opts) {
        var dur = opts.duration || 2.0;
        var t0  = opts.startTime;
        var color = opts.color || [1, 1, 1, 1];

        var shape = createShapesFromText(comp, layer);
        if (!shape) return;
        strokifyShapes(shape, opts.strokeWidth || 4, color);

        var contents = shape.property("ADBE Root Vectors Group");
        for (var i = 1; i <= contents.numProperties; i++) {
            var g = contents.property(i);
            if (g.matchName !== "ADBE Vector Group") continue;
            var gc = g.property("ADBE Vectors Group");
            var trim = gc.addProperty("ADBE Vector Filter - Trim");
            var s = trim.property("ADBE Vector Trim Start");
            var e = trim.property("ADBE Vector Trim End");
            s.setValueAtTime(t0,         50);
            s.setValueAtTime(t0 + dur,   0);
            e.setValueAtTime(t0,         50);
            e.setValueAtTime(t0 + dur,   100);
            U.smoothKeys(s); U.smoothKeys(e);
        }
        shape.name = layer.name + " — TFX Dual Stroke";
    }

    // Reverse stroke — fully drawn, retracts to nothing (unveil-from-end)
    function strokeRetract(comp, layer, opts) {
        var dur = opts.duration || 2.0;
        var t0  = opts.startTime;
        var color = opts.color || [1,1,1,1];

        var shape = createShapesFromText(comp, layer);
        if (!shape) return;
        strokifyShapes(shape, opts.strokeWidth || 4, color);

        var contents = shape.property("ADBE Root Vectors Group");
        for (var i = 1; i <= contents.numProperties; i++) {
            var g = contents.property(i);
            if (g.matchName !== "ADBE Vector Group") continue;
            var gc = g.property("ADBE Vectors Group");
            var trim = gc.addProperty("ADBE Vector Filter - Trim");
            var s = trim.property("ADBE Vector Trim Start");
            s.setValueAtTime(t0,         0);
            s.setValueAtTime(t0 + dur,   100);
            U.smoothKeys(s);
        }
        shape.name = layer.name + " — TFX Stroke Retract";
    }

    // Dashed signature: stroke with dashes draws on like a fancy signature
    function dashedSignature(comp, layer, opts) {
        var dur = opts.duration || 3.0;
        var t0  = opts.startTime;
        var color = opts.color || [1,1,1,1];

        var shape = createShapesFromText(comp, layer);
        if (!shape) return;
        strokifyShapes(shape, opts.strokeWidth || 5, color);

        var contents = shape.property("ADBE Root Vectors Group");
        for (var i = 1; i <= contents.numProperties; i++) {
            var g = contents.property(i);
            if (g.matchName !== "ADBE Vector Group") continue;
            var gc = g.property("ADBE Vectors Group");
            // Find stroke and add dashes
            for (var s = 1; s <= gc.numProperties; s++) {
                var sp = gc.property(s);
                if (sp.matchName === "ADBE Vector Graphic - Stroke") {
                    try {
                        var dashes = sp.property("ADBE Vector Stroke Dashes");
                        var d = dashes.addProperty("ADBE Vector Stroke Dash 1");
                        d.setValue(8);
                        var gap = dashes.addProperty("ADBE Vector Stroke Gap 1");
                        gap.setValue(4);
                    } catch (e) {}
                    try {
                        sp.property("ADBE Vector Stroke Line Cap").setValue(2);  // round
                        sp.property("ADBE Vector Stroke Line Join").setValue(2); // round
                    } catch (e2) {}
                }
            }
            var trim = gc.addProperty("ADBE Vector Filter - Trim");
            var endP = trim.property("ADBE Vector Trim End");
            endP.setValueAtTime(t0,        0);
            endP.setValueAtTime(t0 + dur,  100);
            U.smoothKeys(endP);
        }
        shape.name = layer.name + " — TFX Dashed Signature";
    }

    return {
        strokeWriteOn:        { name: "Stroke Write-On",        run: strokeWriteOn,        needsColor: true },
        strokeRevealThenFill: { name: "Stroke Reveal → Fill",  run: strokeRevealThenFill, needsColor: true },
        splineUnveil:         { name: "Spline Unveil",          run: splineUnveil,         needsColor: true },
        strokeRetract:        { name: "Stroke Retract",         run: strokeRetract,        needsColor: true },
        neonOutline:          { name: "Neon Outline",           run: neonOutline,          needsColor: true },
        dualStroke:           { name: "Dual Stroke",            run: dualStroke,           needsColor: true },
        dashedSignature:      { name: "Dashed Signature",       run: dashedSignature,      needsColor: true }
    };
})();
