import app from "ags/gtk4/app"
import { exec } from "ags/process"
import GLib from "gi://GLib?version=2.0"
import Bar from "./widget/Bar"
import PowerMenu from "./widget/PowerMenu"
import { initThemeSync, restoreTheme } from "./theme"

initThemeSync()

const HOME = GLib.getenv("HOME") || ""
const colorsPath = `${HOME}/.cache/wal/colors.scss`

if (!GLib.file_test(colorsPath, GLib.FileTest.EXISTS)) {
  console.log("No pywal colors found, generating default from pywal.png...")
  const agsDir = `${HOME}/.config/ags`
  exec(`wal -q -n -i ${agsDir}/pywal.png`)
}

const scss = `${HOME}/.config/ags/style.scss`
const css = `/tmp/ags-compiled-style.css`
exec(`sass ${scss} ${css}`)

app.start({
  css: css,
  main() {
    restoreTheme()
    app.get_monitors().map(Bar)
    app.get_monitors().map(PowerMenu)
  },
})
