import { Gtk } from "ags/gtk4"
import { createPoll } from "ags/time"
import AstalTray from "gi://AstalTray?version=0.1"
import { createBinding, For } from "ags"

export function Clock() {
  const time = createPoll("...", 1000, () => {
    const date = new Date()
    return date.toLocaleString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  })

  return (
    <menubutton cssClasses={["clock-btn"]} halign={Gtk.Align.CENTER}>
      <label label={time} />
      <popover>
        <box css="padding: 12px;">
          <Gtk.Calendar />
        </box>
      </popover>
    </menubutton>
  )
}

function TrayItem({ item }: { item: any }) {
  // Bind icon, tooltip, and menu model dynamically to the AstalTray item
  return (
    <menubutton
      hasFrame={false}
      cssClasses={["tray-item"]}
      tooltipMarkup={createBinding(item, "tooltip-markup")}
      menuModel={createBinding(item, "menu-model")}
      $={(w) => {
        w.insert_action_group("dbusmenu", item.action_group)
      }}
    >
      <image gicon={createBinding(item, "gicon")} />
    </menubutton>
  )
}

export function SysTray() {
  const tray = AstalTray.Tray.get_default()

  return (
    <box cssClasses={["system-tray"]} spacing={6} valign={Gtk.Align.CENTER}>
      <For each={createBinding(tray, "items")}>
        {(item: any) => <TrayItem item={item} />}
      </For>
    </box>
  )
}
