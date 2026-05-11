// ============================================================================
// AfterPlugins TextFX — utils.jsx
// Shared helpers for text animator construction, easing, expressions
// ============================================================================

var TFX_UTILS = (function () {

    function activeComp() {
        var item = app.project.activeItem;
        if (!(item && item instanceof CompItem)) {
            alert("AfterPlugins TextFX:\nOpen or select a composition first.");
            return null;
        }
        return item;
    }

    function selectedTextLayers(comp) {
        var out = [];
        for (var i = 0; i < comp.selectedLayers.length; i++) {
            var L = comp.selectedLayers[i];
            if (L instanceof TextLayer) out.push(L);
        }
        return out;
    }

    function requireTextLayers() {
        var c = activeComp();
        if (!c) return null;
        var t = selectedTextLayers(c);
        if (!t.length) {
            alert("AfterPlugins TextFX:\nSelect one or more text layers.");
            return null;
        }
        return { comp: c, layers: t };
    }

    // Easing
    var EASE_IN_OUT = function (t) { return KeyframeEase ? new KeyframeEase(0.5, 75) : null; };
    var EASE_OUT    = function ()  { return new KeyframeEase(0.5, 85); };
    var EASE_IN     = function ()  { return new KeyframeEase(0.5, 85); };
    var LINEAR      = function ()  { return new KeyframeEase(0.0, 0.1); };

    function setTemporalEase(prop, idx, inEase, outEase) {
        try {
            var dims = prop.value && prop.value.length ? prop.value.length : 1;
            var inA = [], outA = [];
            for (var d = 0; d < dims; d++) {
                inA.push(inEase || new KeyframeEase(0.5, 75));
                outA.push(outEase || new KeyframeEase(0.5, 75));
            }
            prop.setTemporalEaseAtKey(idx, inA, outA);
        } catch (e) {}
    }

    function smoothKeys(prop) {
        for (var k = 1; k <= prop.numKeys; k++) {
            setTemporalEase(prop, k, new KeyframeEase(0.5, 85), new KeyframeEase(0.5, 85));
        }
    }

    // Text animator helpers
    function addAnimator(textLayer, label) {
        var animators = textLayer.property("ADBE Text Properties").property("ADBE Text Animators");
        var animator = animators.addProperty("ADBE Text Animator");
        animator.name = label || "TFX Animator";
        return animator;
    }

    function addRangeSelector(animator) {
        var selectors = animator.property("ADBE Text Selectors");
        var sel = selectors.addProperty("ADBE Text Selector");
        return sel;
    }

    function addAnimatorProp(animator, matchName) {
        return animator.property("ADBE Text Animator Properties").addProperty(matchName);
    }

    // Animate range selector start from 0 -> 100 over duration starting at startTime
    function animateRange(animator, startTime, duration, fromOffset, toOffset) {
        var sel = animator.property("ADBE Text Selectors").property(1);
        var startProp = sel.property("ADBE Text Percent Start");
        var endProp   = sel.property("ADBE Text Percent End");
        var offProp   = sel.property("ADBE Text Percent Offset");

        // Default behavior: end at 100, animate start from 0 to 100
        endProp.setValue(100);
        if (fromOffset === undefined) {
            startProp.setValueAtTime(startTime, 0);
            startProp.setValueAtTime(startTime + duration, 100);
            smoothKeys(startProp);
        } else {
            offProp.setValueAtTime(startTime, fromOffset);
            offProp.setValueAtTime(startTime + duration, toOffset);
            smoothKeys(offProp);
        }
        return sel;
    }

    // Configure advanced selector: per-character based-on, randomize order
    function configureAdvanced(sel, opts) {
        opts = opts || {};
        var adv = sel.property("ADBE Text Range Advanced");
        if (!adv) return;
        function trySet(matchName, value) {
            try {
                var p = adv.property(matchName);
                if (p) p.setValue(value);
            } catch (e) {}
        }
        if (opts.basedOn   !== undefined) trySet("ADBE Text Range Type2", opts.basedOn);          // 1 char,2 char w/o spaces,3 word,4 line
        if (opts.shape     !== undefined) trySet("ADBE Text Selector Shape", opts.shape);          // 1 square,2 ramp up,3 ramp down,4 triangle,5 round,6 smooth
        if (opts.randomize !== undefined) trySet("ADBE Text Randomize Order", opts.randomize ? 1 : 0);
        if (opts.smoothness !== undefined) trySet("ADBE Text Range Smoothness", opts.smoothness);
        if (opts.easeHigh  !== undefined) trySet("ADBE Text Range Ease High", opts.easeHigh);
        if (opts.easeLow   !== undefined) trySet("ADBE Text Range Ease Low",  opts.easeLow);
        if (opts.mode      !== undefined) trySet("ADBE Text Selector Mode",   opts.mode);
    }

    // Make text layer 3D enabled
    function set3D(layer, on) {
        try { layer.threeDLayer = !!on; } catch (e) {}
    }

    function getFontSize(layer) {
        try {
            var doc = layer.property("ADBE Text Properties").property("ADBE Text Document").value;
            return doc.fontSize || 80;
        } catch (e) { return 80; }
    }

    // Add an effect by display name
    function addEffect(layer, matchName) {
        return layer.property("ADBE Effect Parade").addProperty(matchName);
    }

    function hexToRGB(hex) {
        hex = hex.replace("#", "");
        if (hex.length === 3) hex = hex.charAt(0)+hex.charAt(0)+hex.charAt(1)+hex.charAt(1)+hex.charAt(2)+hex.charAt(2);
        var r = parseInt(hex.substr(0,2),16)/255;
        var g = parseInt(hex.substr(2,2),16)/255;
        var b = parseInt(hex.substr(4,2),16)/255;
        return [r,g,b,1];
    }

    function eachLayer(layers, fn) {
        for (var i = 0; i < layers.length; i++) fn(layers[i], i);
    }

    function undoGroup(name, fn) {
        app.beginUndoGroup(name);
        try { fn(); }
        catch (e) { alert("AfterPlugins TextFX error:\n" + e.toString()); }
        app.endUndoGroup();
    }

    function getStart(comp) {
        // Use current time if inside comp duration, else 0
        var t = comp.time;
        return (t < 0 || t > comp.duration) ? 0 : t;
    }

    // Remove every animator whose name starts with "TFX", remove TFX-named
    // effects from the layer's effect parade, and clear any transform keyframes
    // we likely added (Position/Scale/Opacity).
    function removeTFXFromLayer(layer) {
        try {
            var animators = layer.property("ADBE Text Properties").property("ADBE Text Animators");
            for (var i = animators.numProperties; i >= 1; i--) {
                var a = animators.property(i);
                if (a && a.name && a.name.indexOf("TFX") === 0) a.remove();
            }
        } catch (e) {}
        try {
            var fx = layer.property("ADBE Effect Parade");
            for (var j = fx.numProperties; j >= 1; j--) {
                var ef = fx.property(j);
                if (!ef) continue;
                // Remove well-known effects we add. We tag by name where we can.
                var n = ef.name || "";
                var m = ef.matchName || "";
                if (
                    m === "ADBE Glo2" ||
                    m === "ADBE Box Blur2" ||
                    m === "ADBE Fast Blur" ||
                    m === "ADBE Posterize Time" ||
                    m === "CC RGB Splitter" ||
                    n.indexOf("TFX") !== -1
                ) ef.remove();
            }
        } catch (e) {}
        // Clear keyframes on common transform props
        try {
            var t = layer.property("ADBE Transform Group");
            var props = ["ADBE Position", "ADBE Scale", "ADBE Opacity", "ADBE Rotate Z"];
            for (var k = 0; k < props.length; k++) {
                var p = t.property(props[k]);
                if (!p) continue;
                while (p.numKeys > 0) p.removeKey(1);
                try { if (p.expressionEnabled) p.expression = ""; } catch (ee) {}
            }
        } catch (e) {}
    }

    // Shift all keyframes on TFX animators so the earliest key aligns to `target` time.
    function shiftTFXKeyframes(layer, target) {
        var earliest = Infinity;
        var keyedProps = [];

        function visit(prop) {
            try {
                if (prop.numProperties !== undefined) {
                    for (var i = 1; i <= prop.numProperties; i++) visit(prop.property(i));
                    return;
                }
                if (prop.numKeys && prop.numKeys > 0) {
                    keyedProps.push(prop);
                    var t0 = prop.keyTime(1);
                    if (t0 < earliest) earliest = t0;
                }
            } catch (e) {}
        }
        try {
            var animators = layer.property("ADBE Text Properties").property("ADBE Text Animators");
            for (var i = 1; i <= animators.numProperties; i++) {
                var a = animators.property(i);
                if (a && a.name && a.name.indexOf("TFX") === 0) visit(a);
            }
        } catch (e) {}

        if (earliest === Infinity) return;
        var delta = target - earliest;
        if (Math.abs(delta) < 1e-6) return;

        for (var k = 0; k < keyedProps.length; k++) {
            var p = keyedProps[k];
            // Shift in reverse to avoid index collisions
            var pairs = [];
            for (var n = 1; n <= p.numKeys; n++) pairs.push({ t: p.keyTime(n), v: p.keyValue(n) });
            while (p.numKeys > 0) p.removeKey(1);
            for (var m = 0; m < pairs.length; m++) p.setValueAtTime(pairs[m].t + delta, pairs[m].v);
            smoothKeys(p);
        }
    }

    return {
        activeComp: activeComp,
        selectedTextLayers: selectedTextLayers,
        requireTextLayers: requireTextLayers,
        addAnimator: addAnimator,
        addRangeSelector: addRangeSelector,
        addAnimatorProp: addAnimatorProp,
        animateRange: animateRange,
        configureAdvanced: configureAdvanced,
        smoothKeys: smoothKeys,
        setTemporalEase: setTemporalEase,
        set3D: set3D,
        getFontSize: getFontSize,
        addEffect: addEffect,
        hexToRGB: hexToRGB,
        eachLayer: eachLayer,
        undoGroup: undoGroup,
        getStart: getStart,
        removeTFXFromLayer: removeTFXFromLayer,
        shiftTFXKeyframes: shiftTFXKeyframes
    };
})();
