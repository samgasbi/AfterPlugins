# AfterPlugins TextFX

A powerful After Effects plugin (ScriptUI panel) for creating stunning,
futuristic text animations. Drop in a comp, select your text layer(s), and
trigger one of 30+ presets across five categories.

## Categories

| Tab            | What it does                                                                 |
| -------------- | ---------------------------------------------------------------------------- |
| **2D**         | Typewriter, Slide In, Fade Word, Scale Bounce, Wave, Glitch In, Blur Reveal, Tracking Expand, Rotate In |
| **3D**         | 3D Flip Reveal, Spin Y, Tumble, Depth Fly-In, Cube Unfold, Orbit In          |
| **Logo**       | Cinematic Reveal, 3D Cascade, Stamp Impact, HUD Reveal, Energy Burst         |
| **Stroke/Spline** | Stroke Write-On, Stroke Reveal → Fill, Spline Unveil, Neon Outline, Dual Stroke |
| **Color**      | Gradient Sweep, Hue Cycle, Neon Glow, Chromatic Aberration, Rainbow Per Char, Color Flash In |

## Install

1. Copy the entire `AfterPlugins` folder contents into After Effects'
   **ScriptUI Panels** folder:
   - **Windows:**
     `C:\Program Files\Adobe\Adobe After Effects <version>\Support Files\Scripts\ScriptUI Panels\`
   - **macOS:**
     `/Applications/Adobe After Effects <version>/Scripts/ScriptUI Panels/`

   You should end up with:
   ```
   ScriptUI Panels/
   ├── AfterPlugins TextFX.jsx
   └── lib/
       ├── utils.jsx
       ├── animations2D.jsx
       ├── animations3D.jsx
       ├── animationsLogo.jsx
       ├── animationsStroke.jsx
       └── animationsColor.jsx
   ```

2. In After Effects → **Preferences → Scripting & Expressions**, enable
   *"Allow Scripts to Write Files and Access Network"*.

3. Restart After Effects.

4. Open the panel via **Window → AfterPlugins TextFX.jsx** and dock it
   anywhere you like.

## Use

1. Open or create a composition.
2. Create a text layer (or several) and **select** them.
3. In the TextFX panel, set:
   - **Duration** (seconds for the animation)
   - **Start** — current time or comp start
   - **Intensity** (where applicable, e.g. glitch)
   - **Color A / Color B** — for color and stroke presets
   - **Stroke W** — stroke width for spline/stroke presets
4. Click any preset button. The animation is applied to **each** selected
   text layer and grouped under a single Undo step.

### Notes

- **Stroke / Spline** presets convert the text to shape outlines using
  AE's "Create Shapes from Text" command. This creates a new shape layer
  alongside the original text. You can delete the source text after if you
  only want the stroke look.
- **3D** presets enable 3D on the text layer automatically. Make sure your
  comp has a camera if you want to see meaningful Z-translation.
- All animations stack — you can apply several presets in sequence to
  layer effects.

## Files

| Path                          | Purpose                                         |
| ----------------------------- | ----------------------------------------------- |
| `AfterPlugins TextFX.jsx`     | Main entry — ScriptUI panel + preset dispatcher |
| `lib/utils.jsx`               | Animator/selector helpers, easing, color utils  |
| `lib/animations2D.jsx`        | 2D presets                                      |
| `lib/animations3D.jsx`        | 3D per-character presets                        |
| `lib/animationsLogo.jsx`      | Hero/logo reveals                               |
| `lib/animationsStroke.jsx`    | Stroke + spline reveal/unveil                   |
| `lib/animationsColor.jsx`     | Color and glow presets                          |

## Compatibility

Tested approach targets After Effects **CC 2019+** (uses standard scripting
APIs and `app.findMenuCommandId`). Some effects (CC RGB Splitter, Glow) are
shipped with AE — if your install lacks a third-party effect, that preset's
extra polish is skipped silently.

## License

Free to use, modify, and redistribute.
