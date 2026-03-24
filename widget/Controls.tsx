import { Gtk } from "ags/gtk4"

export function SettingsButton() {
  return (
    <button
      cssClasses={["control-btn", "settings-btn"]}
      onClicked={() => console.log("Open Settings Menu - Phase 8")}
    >
      <image iconName="emblem-system-symbolic" />
    </button>
  )
}

export function PowerButton() {
  return (
    <button
      cssClasses={["control-btn", "power-btn"]}
      onClicked={() => console.log("Open Power Menu - Phase 7")}
    >
      <image iconName="system-shutdown-symbolic" />
    </button>
  )
}

export default function Controls() {
  return (
    <box cssClasses={["controls-container"]} spacing={4} valign={Gtk.Align.CENTER}>
      <SettingsButton />
      <PowerButton />
    </box>
  )
}
