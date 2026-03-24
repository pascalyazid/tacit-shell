import app from "ags/gtk4/app"
import { Astal, Gtk, Gdk } from "ags/gtk4"
import { execAsync } from "ags/process"

interface SysButtonProps {
  icon: string
  label: string
  command: string
}

function SysButton({ icon, label, command }: SysButtonProps) {
  return (
    <button
      cssClasses={["power-menu-btn"]}
      onClicked={() => {
        // Hide the power menu before executing the command
        app.get_windows().forEach((w) => {
          if (w.name?.startsWith("power-menu")) w.set_visible(false)
        })
        execAsync(command).catch((err) => console.error(err))
      }}
    >
      <box
        orientation={Gtk.Orientation.VERTICAL}
        spacing={12}
        halign={Gtk.Align.CENTER}
        valign={Gtk.Align.CENTER}
      >
        <image iconName={icon} cssClasses={["power-menu-icon"]} />
        <label label={label} cssClasses={["power-menu-label"]} />
      </box>
    </button>
  )
}

export default function PowerMenu(gdkmonitor: Gdk.Monitor) {
  return (
    <window
      name={`power-menu-${gdkmonitor.get_connector()}`}
      class="PowerMenu"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.IGNORE}
      layer={Astal.Layer.OVERLAY}
      // Not setting an anchor natively centers the window on the screen
      keymode={Astal.Keymode.ON_DEMAND}
      visible={false}
      application={app}
      $={(win) => {
        // Allow closing the menu with the Escape key
        const controller = new Gtk.EventControllerKey()
        controller.connect("key-pressed", (_, keyval) => {
          if (keyval === 65307) {
            // 65307 is the keysym for Escape
            win.set_visible(false)
          }
        })
        win.add_controller(controller)
      }}
    >
      <box
        cssClasses={["power-menu-container"]}
        spacing={24}
        halign={Gtk.Align.CENTER}
        valign={Gtk.Align.CENTER}
      >
        <SysButton
          icon="system-shutdown-symbolic"
          label="Power Off"
          command="systemctl poweroff"
        />
        <SysButton
          icon="system-reboot-symbolic"
          label="Reboot"
          command="systemctl reboot"
        />
        <SysButton
          icon="system-log-out-symbolic"
          label="Sign Out"
          command="hyprctl dispatch exit"
        />
        <SysButton
          icon="weather-clear-night-symbolic"
          label="Sleep"
          command="systemctl suspend"
        />
      </box>
    </window>
  )
}
