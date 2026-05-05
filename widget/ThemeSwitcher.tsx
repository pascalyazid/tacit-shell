import { Gtk } from "ags/gtk4"

import GdkPixbuf from "gi://GdkPixbuf?version=2.0"
import Gdk from "gi://Gdk?version=4.0"
import { getWallpapers, setTheme } from "../theme"

// Global memory cache for textures, shared across all monitors!
const textureCache = new Map<string, Gdk.Texture>()

export default function ThemeSwitcher() {
  let flowBox: Gtk.FlowBox
  // LOCAL to each monitor's instance, so they all build properly!
  let lastLoadedWps = ""

  const loadWallpapers = async (force = false) => {
    if (!flowBox) return
    const wps = await getWallpapers()
    const currentWpsStr = wps.join(",")

    if (!force && currentWpsStr === lastLoadedWps) {
      // No changes, no need to rebuild the UI
      return
    }
    lastLoadedWps = currentWpsStr

    // Clear existing children
    ;(flowBox as any).remove_all()

    // Add new ones using native GTK components
    for (const wp of wps) {
      if (!textureCache.has(wp)) {
        try {
          const pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_scale(
            wp,
            140,
            80,
            true,
          )
          const texture = Gdk.Texture.new_for_pixbuf(pixbuf)
          textureCache.set(wp, texture)
        } catch (e) {
          console.error(`Failed to load thumbnail for ${wp}`, e)
          continue
        }
      }

      const picture = new Gtk.Picture({
        paintable: textureCache.get(wp)!,
        contentFit: Gtk.ContentFit.COVER,
        widthRequest: 140,
        heightRequest: 80,
      })

      const btn = new Gtk.Button({
        cssClasses: ["wallpaper-btn"],
      })
      btn.set_child(picture)
      btn.connect("clicked", () => setTheme(wp))

      flowBox.append(btn)
    }
  }

  return (
    <menubutton
      cssClasses={["control-btn", "theme-switcher-btn"]}
      tooltipText="Switch Theme & Wallpaper"
    >
      <image iconName="preferences-desktop-wallpaper-symbolic" />
      <popover
        $={(p) => {
          p.connect("notify::visible", () => {
            if (p.get_visible()) {
              // Pass false so it only rebuilds if files changed
              loadWallpapers(false)
            }
          })
        }}
      >
        <Gtk.ScrolledWindow
          widthRequest={340}
          heightRequest={400}
          hscrollbarPolicy={Gtk.PolicyType.NEVER}
        >
          <Gtk.FlowBox
            $={(box) => {
              flowBox = box
              // Initial load
              loadWallpapers(false)
            }}
            selectionMode={Gtk.SelectionMode.NONE}
            maxChildrenPerLine={2}
            minChildrenPerLine={2}
            rowSpacing={8}
            columnSpacing={8}
            marginEnd={8}
            marginStart={8}
            marginTop={8}
            marginBottom={8}
          />
        </Gtk.ScrolledWindow>
      </popover>
    </menubutton>
  )
}
