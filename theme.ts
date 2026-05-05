import app from "ags/gtk4/app"
import { execAsync } from "ags/process"
import GLib from "gi://GLib?version=2.0"
import Gio from "gi://Gio?version=2.0"

const HOME = GLib.getenv("HOME") || ""
const WALLPAPER_DIR = `${HOME}/wallpapers`

/**
 * Get a list of all wallpapers in the default wallpapers directory.
 */
export async function getWallpapers(): Promise<string[]> {
  try {
    const dir = Gio.File.new_for_path(WALLPAPER_DIR)
    const iter = dir.enumerate_children(
      "standard::name",
      Gio.FileQueryInfoFlags.NONE,
      null,
    )
    let info
    const files: string[] = []
    while ((info = iter.next_file(null))) {
      const name = info.get_name()
      if (name.match(/\.(jpg|jpeg|png|gif)$/i)) {
        files.push(`${WALLPAPER_DIR}/${name}`)
      }
    }
    files.sort()
    return files
  } catch (error) {
    console.error("Failed to read wallpapers directory:", error)
    return []
  }
}

/**
 * Synchronously ensure that a pywal colors file exists in /tmp
 * before AGS loads the initial SCSS file.
 */
export function initThemeSync() {
  const walCache = `${HOME}/.cache/wal/colors.scss`
  const tmpColors = `/tmp/ags-colors.scss`

  if (GLib.file_test(walCache, GLib.FileTest.EXISTS)) {
    // If Pywal has run before, copy its colors.scss to our safe /tmp location
    try {
      const [ok, content] = GLib.file_get_contents(walCache)
      if (ok) {
        GLib.file_set_contents(tmpColors, content)
      }
    } catch {}
  } else {
    // If Pywal hasn't run yet, provide a safe fallback so Sass compiles
    const fallback = `
$wallpaper: "";
$background: #1e1e1e;
$foreground: #d4d4d4;
$cursor: #d4d4d4;
$color0: #1e1e1e;
$color1: #f44747;
$color2: #6a9955;
$color3: #d7ba7d;
$color4: #569cd6;
$color5: #c586c0;
$color6: #4ec9b0;
$color7: #d4d4d4;
$color8: #808080;
$color9: #f44747;
$color10: #6a9955;
$color11: #d7ba7d;
$color12: #569cd6;
$color13: #c586c0;
$color14: #4ec9b0;
$color15: #d4d4d4;
`
    try {
      GLib.file_set_contents(tmpColors, fallback)
    } catch {}
  }
}

/**
 * Restore the last set wallpaper.
 */
export async function restoreTheme() {
  try {
    const out = await execAsync(["cat", `${HOME}/.cache/wal/wal`])
    const wallpaperPath = out.trim()
    if (wallpaperPath) {
      console.log(`Restoring theme for wallpaper: ${wallpaperPath}`)
      await setTheme(wallpaperPath)
    }
  } catch {
    console.log("No previous wallpaper found to restore.")
  }
}

/**
 * Set the wallpaper using hyprpaper, generate colors with pywal,
 * and reload the AGS theme.
 */
export async function setTheme(wallpaperPath: string) {
  console.log(`Setting theme for wallpaper: ${wallpaperPath}`)

  // 1. Set wallpaper with hyprpaper
  try {
    // Preload the wallpaper first
    await execAsync(["hyprctl", "hyprpaper", "preload", wallpaperPath]).catch(
      () => {},
    )

    const out = await execAsync("hyprctl monitors -j")
    const monitors = JSON.parse(out)
    for (const mon of monitors) {
      await execAsync([
        "hyprctl",
        "hyprpaper",
        "wallpaper",
        `${mon.name},${wallpaperPath}`,
      ])
    }
  } catch (error) {
    console.error("Failed to set wallpaper via hyprpaper:", error)
  }

  // 2. Generate colors with pywal16
  try {
    // -q: quiet, -i: image, -n: skip setting wallpaper (hyprpaper does it)
    await execAsync(
      `wal --backend modern-colorthief -q -n -i "${wallpaperPath}"`,
    )

    // Add this line so hyprlock always knows the current wallpaper:
    await execAsync([
      "cp",
      wallpaperPath,
      `${HOME}/.cache/current_wallpaper.jpg`,
    ])
  } catch (error) {
    console.error("Failed to generate colors with pywal:", error)
  }

  // 3. Re-compile and apply AGS styles
  try {
    const agsDir = `${HOME}/.config/ags`
    const scss = `${agsDir}/style.scss`
    const css = `/tmp/ags-compiled-style.css`

    // Copy the newly generated Pywal colors to the /tmp directory
    try {
      const walCache = `${HOME}/.cache/wal/colors.scss`
      const tmpColors = `/tmp/ags-colors.scss`
      await execAsync(["cp", walCache, tmpColors])
    } catch (e) {
      console.error("Failed to copy pywal colors to /tmp:", e)
    }

    // Compile SCSS to CSS using the sass CLI
    await execAsync(`sass ${scss} ${css}`)

    // Reset any previously applied CSS and apply the new one
    app.reset_css()
    app.apply_css(css)

    console.log("AGS theme successfully updated!")
  } catch (error) {
    console.error("Failed to recompile and apply AGS styles:", error)
  }

  // 4. Run update script
  try {
    const agsDir = `${HOME}/.config/ags`
    await execAsync(`${agsDir}/update_script.sh`)
    console.log("Ran update script")
  } catch (error) {
    console.error("Failed to run update script:", error)
  }
}
