import app from "ags/gtk4/app"
import { Astal, Gtk, Gdk } from "ags/gtk4"
import Workspaces from "./Workspaces"
import { Clock, SysTray } from "./System"
import Media from "./Media"
import Controls from "./Controls"

function Left() {
  return (
    <box $type="start" halign={Gtk.Align.START} cssClasses={["left-box"]}>
      <Workspaces />
    </box>
  )
}

function Center() {
  return (
    <box
      $type="center"
      halign={Gtk.Align.CENTER}
      cssClasses={["center-box"]}
      spacing={8}
    >
      <Media />
      <Clock />
    </box>
  )
}

function Right() {
  return (
    <box
      $type="end"
      halign={Gtk.Align.END}
      cssClasses={["right-box"]}
      spacing={8}
    >
      <SysTray />
      <Controls />
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
