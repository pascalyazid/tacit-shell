import app from "ags/gtk4/app"
import { Astal, Gtk, Gdk } from "ags/gtk4"
import Workspaces from "./Workspaces"
import { Clock, SysTray, Battery } from "./System"
import Media from "./Media"
import Controls from "./Controls"
import ThemeSwitcher from "./ThemeSwitcher"

function Left({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
  return (
    <box $type="start" halign={Gtk.Align.START} cssClasses={["left-box"]}>
      <Workspaces gdkmonitor={gdkmonitor} />
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

function Right({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
  return (
    <box
      $type="end"
      halign={Gtk.Align.END}
      cssClasses={["right-box"]}
      spacing={8}
    >
      <ThemeSwitcher />
      <SysTray />
      <Battery />
      <Controls gdkmonitor={gdkmonitor} />
    </box>
  )
}

export default function Bar(gdkmonitor: Gdk.Monitor) {
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

  return (
    <window
      visible
      name={`bar-${gdkmonitor.get_connector()}`}
      class="Bar"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={TOP | LEFT | RIGHT}
      application={app}
    >
      <centerbox cssName="centerbox">
        <Left gdkmonitor={gdkmonitor} />
        <Center />
        <Right gdkmonitor={gdkmonitor} />
      </centerbox>
    </window>
  )
}
