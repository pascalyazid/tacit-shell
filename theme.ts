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
    await execAsync(`wal -q -n -i "${wallpaperPath}"`)
  } catch (error) {
    console.error("Failed to generate colors with pywal:", error)
  }

  // 3. Re-compile and apply AGS styles
  try {
    const agsDir = `${HOME}/.config/ags`
    const scss = `${agsDir}/style.scss`
    const css = `/tmp/ags-compiled-style.css`

    // Compile SCSS to CSS using the sass CLI
    await execAsync(`sass ${scss} ${css}`)

    // Reset any previously applied CSS and apply the new one
    app.reset_css()
    app.apply_css(css)

    console.log("AGS theme successfully updated!")
  } catch (error) {
    console.error("Failed to recompile and apply AGS styles:", error)
  }
}
