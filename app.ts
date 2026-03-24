import app from "ags/gtk4/app"
import style from "./style.scss"
import Bar from "./widget/Bar"
import PowerMenu from "./widget/PowerMenu"
import { initThemeSync, restoreTheme } from "./theme"

initThemeSync()

app.start({
  css: style,
  main() {
    restoreTheme()
    app.get_monitors().map(Bar)
    app.get_monitors().map(PowerMenu)
  },
})
