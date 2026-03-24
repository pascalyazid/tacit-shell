import { Gtk } from "ags/gtk4"
import app from "ags/gtk4/app"
import QuickSettings from "./QuickSettings"

export function PowerButton({ gdkmonitor }: { gdkmonitor: any }) {
  return (
    <button
      cssClasses={["control-btn", "power-btn"]}
      onClicked={() =>
        app.toggle_window(`power-menu-${gdkmonitor.get_connector()}`)
      }
    >
      <image iconName="system-shutdown-symbolic" />
    </button>
  )
}

export default function Controls({ gdkmonitor }: { gdkmonitor: any }) {
  return (
    <box
      cssClasses={["controls-container"]}
      spacing={4}
      valign={Gtk.Align.CENTER}
    >
      <QuickSettings />
      <PowerButton gdkmonitor={gdkmonitor} />
    </box>
  )
}
