import app from "ags/gtk4/app"
import { Astal, Gtk, Gdk } from "ags/gtk4"

function Left() {
  return (
    <box $type="start" halign={Gtk.Align.START} cssClasses={["left-box"]}>
      <label label="Left Widget Area" />
    </box>
  )
}

function Center() {
  return (
    <box $type="center" halign={Gtk.Align.CENTER} cssClasses={["center-box"]}>
      <label label="Center Widget Area" />
    </box>
  )
}

function Right() {
  return (
    <box $type="end" halign={Gtk.Align.END} cssClasses={["right-box"]}>
      <label label="Right Widget Area" />
    </box>
  )
}

export default function Bar(gdkmonitor: Gdk.Monitor) {
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

  return (
    <window
      visible
      name={`bar-${gdkmonitor.get_display()?.get_name()}`}
      class="Bar"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={TOP | LEFT | RIGHT}
      application={app}
    >
      <centerbox cssName="centerbox">
        <Left />
        <Center />
        <Right />
      </centerbox>
    </window>
  )
}
