// ============================================================================
//  AfterPlugins TextFX
//  Powerful text animation plugin for Adobe After Effects.
//  Features:
//    • 2D animation presets (typewriter, slide, wave, glitch, blur, rotate, ...)
//    • 3D animation presets (flip, spin, tumble, depth fly-in, cube unfold, orbit)
//    • Logo / hero reveals (cinematic, 3D cascade, stamp impact, HUD, energy burst)
//    • Stroke / spline reveal + unveil (write-on, dual stroke, neon outline, ...)
//    • Color presets (gradient sweep, hue cycle, neon glow, chromatic, rainbow, flash)
//
//  Installation
//  ------------
//    Place this file AND the /lib folder into:
//      Win:  C:\Program Files\Adobe\Adobe After Effects <ver>\Support Files\Scripts\ScriptUI Panels\
//      Mac:  /Applications/Adobe After Effects <ver>/Scripts/ScriptUI Panels/
//    Make sure "Allow Scripts to Write Files and Access Network" is ON in
//    AE Preferences → Scripting & Expressions.
//    Restart AE. Open via:  Window → AfterPlugins TextFX.jsx
//
//  Usage
//  -----
//    1. Open a comp and select one or more TEXT layers.
//    2. Pick a duration (and color for color/stroke presets).
//    3. Click any preset button. The animation is applied at the current time.
//    4. Everything is grouped under a single Undo step.
// ============================================================================

(function (thisObj) {

    // ---- Load library files ----------------------------------------------------
    function loadLib() {
        var here = (function () {
            try { return new File($.fileName).parent; } catch (e) { return Folder.current; }
        })();
        var libs = [
            "lib/utils.jsx",
            "lib/animations2D.jsx",
            "lib/animations3D.jsx",
            "lib/animationsLogo.jsx",
            "lib/animationsStroke.jsx",
            "lib/animationsColor.jsx"
        ];
        for (var i = 0; i < libs.length; i++) {
            var f = new File(here.fsName + "/" + libs[i]);
            if (!f.exists) {
                alert("AfterPlugins TextFX:\nMissing required file:\n" + f.fsName +
                      "\n\nMake sure the /lib folder sits next to the main .jsx file.");
                return false;
            }
            $.evalFile(f);
        }
        return true;
    }
    if (!loadLib()) return;

    // ---- Build panel ----------------------------------------------------------
    function buildUI(thisObj) {
        var pal = (thisObj instanceof Panel)
            ? thisObj
            : new Window("palette", "AfterPlugins TextFX", undefined, { resizeable: true });

        pal.orientation = "column";
        pal.alignChildren = ["fill", "top"];
        pal.spacing = 6;
        pal.margins = 10;

        // -------- Header
        var header = pal.add("group");
        header.orientation = "row";
        header.alignChildren = ["fill", "center"];
        var title = header.add("statictext", undefined, "AfterPlugins TextFX");
        title.graphics.font = ScriptUI.newFont(title.graphics.font.name, "BOLD", 14);
        var sub = pal.add("statictext", undefined, "Stunning, futuristic text animations — select text layer(s) and click a preset.");
        sub.alignment = ["fill","top"];

        // -------- Global Controls
        var ctrlPanel = pal.add("panel", undefined, "Settings");
        ctrlPanel.orientation = "column";
        ctrlPanel.alignChildren = ["fill","top"];
        ctrlPanel.margins = 10;
        ctrlPanel.spacing = 6;

        var row1 = ctrlPanel.add("group");
        row1.orientation = "row";
        row1.add("statictext", undefined, "Duration (sec):");
        var durInput = row1.add("edittext", undefined, "1.5");
        durInput.characters = 6;

        row1.add("statictext", undefined, "Start:");
        var startSel = row1.add("dropdownlist", undefined, ["Current time", "Comp start (0s)"]);
        startSel.selection = 0;

        row1.add("statictext", undefined, "Intensity:");
        var intInput = row1.add("edittext", undefined, "1.0");
        intInput.characters = 5;

        var row2 = ctrlPanel.add("group");
        row2.orientation = "row";

        row2.add("statictext", undefined, "Color A:");
        var colorA = row2.add("button", undefined, "");
        colorA.preferredSize = [40, 22];
        colorA._color = [1, 1, 1, 1];
        paintColorButton(colorA);
        colorA.onClick = function () { pickColor(colorA); };

        row2.add("statictext", undefined, "Color B:");
        var colorB = row2.add("button", undefined, "");
        colorB.preferredSize = [40, 22];
        colorB._color = [0.2, 0.7, 1, 1];
        paintColorButton(colorB);
        colorB.onClick = function () { pickColor(colorB); };

        row2.add("statictext", undefined, "Stroke W:");
        var strokeW = row2.add("edittext", undefined, "4");
        strokeW.characters = 4;

        // -------- Tab panel
        var tabs = pal.add("tabbedpanel");
        tabs.alignChildren = ["fill","top"];
        tabs.preferredSize.height = 320;

        var tab2D    = tabs.add("tab", undefined, "2D");
        var tab3D    = tabs.add("tab", undefined, "3D");
        var tabLogo  = tabs.add("tab", undefined, "Logo");
        var tabSpline= tabs.add("tab", undefined, "Stroke / Spline");
        var tabColor = tabs.add("tab", undefined, "Color");

        function gatherOpts() {
            var c = TFX_UTILS.activeComp();
            var startTime = 0;
            if (c) startTime = (startSel.selection.index === 0) ? TFX_UTILS.getStart(c) : 0;
            return {
                duration:    parseFloat(durInput.text)  || 1.5,
                intensity:   parseFloat(intInput.text)  || 1.0,
                startTime:   startTime,
                color:       colorA._color,
                color2:      colorB._color,
                strokeWidth: parseFloat(strokeW.text)   || 4
            };
        }

        function applyToSelected(preset, label) {
            var ctx = TFX_UTILS.requireTextLayers();
            if (!ctx) return;
            var opts = gatherOpts();
            TFX_UTILS.undoGroup("TextFX: " + label, function () {
                TFX_UTILS.eachLayer(ctx.layers, function (layer) {
                    preset.run(ctx.comp, layer, opts);
                });
            });
        }

        function buildPresetTab(tab, presets) {
            tab.orientation = "column";
            tab.alignChildren = ["fill", "top"];
            tab.spacing = 4;
            tab.margins = 8;

            // grid: 2 columns
            var keys = [];
            for (var k in presets) if (presets.hasOwnProperty(k)) keys.push(k);

            var rowGroup = null;
            for (var i = 0; i < keys.length; i++) {
                if (i % 2 === 0) {
                    rowGroup = tab.add("group");
                    rowGroup.orientation = "row";
                    rowGroup.alignChildren = ["fill","center"];
                    rowGroup.spacing = 6;
                }
                var key = keys[i];
                var preset = presets[key];
                var btn = rowGroup.add("button", undefined, preset.name);
                btn.preferredSize.width = 180;
                (function (p) {
                    btn.onClick = function () { applyToSelected(p, p.name); };
                })(preset);
            }
        }

        buildPresetTab(tab2D,    TFX_2D);
        buildPresetTab(tab3D,    TFX_3D);
        buildPresetTab(tabLogo,  TFX_LOGO);
        buildPresetTab(tabSpline,TFX_STROKE);
        buildPresetTab(tabColor, TFX_COLOR);

        // Footer
        var foot = pal.add("group");
        foot.orientation = "row";
        foot.alignChildren = ["fill","center"];
        var help = foot.add("button", undefined, "?");
        help.preferredSize = [28, 22];
        help.onClick = function () {
            alert(
                "AfterPlugins TextFX\n\n" +
                "1) Select one or more text layers.\n" +
                "2) Set duration (and color where applicable).\n" +
                "3) Click any preset.\n\n" +
                "• Stroke / Spline presets convert text to shapes (a new shape layer is created).\n" +
                "• 3D presets enable 3D on the layer automatically.\n" +
                "• Everything is wrapped in a single Undo step."
            );
        };
        var ver = foot.add("statictext", undefined, "v1.0 — AfterPlugins");
        ver.alignment = ["right","center"];

        pal.layout.layout(true);
        pal.layout.resize();
        pal.onResizing = pal.onResize = function () { this.layout.resize(); };

        if (pal instanceof Window) {
            pal.center();
            pal.show();
        }
        return pal;
    }

    // ---- Color picker helpers ------------------------------------------------
    function paintColorButton(btn) {
        try {
            var c = btn._color;
            btn.graphics.backgroundColor = btn.graphics.newBrush(btn.graphics.BrushType.SOLID_COLOR, [c[0], c[1], c[2], 1]);
        } catch (e) {}
    }
    function pickColor(btn) {
        try {
            var c = btn._color;
            var picked = $.colorPicker(rgbToHex(c));
            if (picked === -1) return;
            // colorPicker returns 0xRRGGBB
            var r = ((picked >> 16) & 0xff) / 255;
            var g = ((picked >>  8) & 0xff) / 255;
            var b = ((picked      ) & 0xff) / 255;
            btn._color = [r, g, b, 1];
            paintColorButton(btn);
        } catch (e) {}
    }
    function rgbToHex(c) {
        var r = Math.round(c[0] * 255), g = Math.round(c[1] * 255), b = Math.round(c[2] * 255);
        return (r << 16) | (g << 8) | b;
    }

    // ---- Go ------------------------------------------------------------------
    buildUI(thisObj);

})(this);
