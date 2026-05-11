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
        try {
            if (opts.basedOn !== undefined) adv.property("ADBE Text Range Type2").setValue(opts.basedOn); // 1 char,2 char w/o spaces,3 word,4 line
            if (opts.shape   !== undefined) adv.property("ADBE Text Selector Shape").setValue(opts.shape); // 1 square,2 ramp up,3 ramp down,4 triangle,5 round,6 smooth
            if (opts.randomize !== undefined) adv.property("ADBE Text Randomize Order").setValue(opts.randomize ? 1 : 0);
            if (opts.smoothness !== undefined) adv.property("ADBE Text Selector Smoothness").setValue(opts.smoothness);
            if (opts.easeHigh !== undefined) adv.property("ADBE Text Range Ease High").setValue(opts.easeHigh);
            if (opts.easeLow  !== undefined) adv.property("ADBE Text Range Ease Low").setValue(opts.easeLow);
            if (opts.mode !== undefined) adv.property("ADBE Text Selector Mode").setValue(opts.mode);
        } catch (e) {}
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
        getStart: getStart
    };
})();
