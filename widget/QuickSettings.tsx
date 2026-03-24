import { Gtk } from "ags/gtk4"
import AstalNetwork from "gi://AstalNetwork?version=0.1"
import AstalBluetooth from "gi://AstalBluetooth?version=0.1"
import AstalWp from "gi://AstalWp?version=0.1"
import { createBinding } from "ags"

function NetworkItem() {
  const network = AstalNetwork.Network.get_default()

  return (
    <box spacing={12} valign={Gtk.Align.CENTER} cssClasses={["qs-item"]}>
      <image
        iconName={createBinding(network, "primary").as((p) => {
          if (p === AstalNetwork.Primary.WIFI && network.wifi) {
            return network.wifi.icon_name
          } else if (p === AstalNetwork.Primary.WIRED && network.wired) {
            return network.wired.icon_name
          }
          return "network-offline-symbolic"
        })}
        cssClasses={["qs-icon"]}
      />
      <label
        label={createBinding(network, "primary").as((p) => {
          if (p === AstalNetwork.Primary.WIFI && network.wifi) {
            return network.wifi.ssid || "Unknown Wi-Fi"
          } else if (p === AstalNetwork.Primary.WIRED) {
            return "Wired Connection"
          }
          return "Disconnected"
        })}
        halign={Gtk.Align.START}
        hexpand
      />
    </box>
  )
}

function BluetoothItem() {
  const bluetooth = AstalBluetooth.get_default()

  return (
    <box spacing={12} valign={Gtk.Align.CENTER} cssClasses={["qs-item"]}>
      <image
        iconName={createBinding(bluetooth, "is-powered").as((powered) =>
          powered ? "bluetooth-active-symbolic" : "bluetooth-disabled-symbolic",
        )}
        cssClasses={["qs-icon"]}
      />
      <label
        label={createBinding(bluetooth, "is-powered").as((powered) =>
          powered ? "Bluetooth On" : "Bluetooth Off",
        )}
        halign={Gtk.Align.START}
        hexpand
      />
      <switch
        valign={Gtk.Align.CENTER}
        active={createBinding(bluetooth, "is-powered")}
        onNotifyActive={(sw) => {
          if (bluetooth.adapter) {
            bluetooth.adapter.set_powered(sw.get_active())
          }
        }}
      />
    </box>
  )
}

function AudioSlider({ type }: { type: "speaker" | "microphone" }) {
  const wp = AstalWp.get_default()
  const audio = wp?.audio

  if (!audio) return <box />

  const endpoint =
    type === "speaker" ? audio.default_speaker : audio.default_microphone

  if (!endpoint) return <box />

  return (
    <box spacing={12} valign={Gtk.Align.CENTER} cssClasses={["qs-item"]}>
      <button
        cssClasses={["qs-icon-btn"]}
        onClicked={() => endpoint.set_mute(!endpoint.get_mute())}
      >
        <image iconName={createBinding(endpoint, "volume-icon")} />
      </button>
      <slider
        hexpand
        drawValue={false}
        value={createBinding(endpoint, "volume")}
        onChangeValue={({ value }) => endpoint.set_volume(value)}
      />
    </box>
  )
}

export default function QuickSettings() {
  return (
    <menubutton
      cssClasses={["control-btn", "settings-btn"]}
      tooltipText="Quick Settings"
    >
      <image iconName="emblem-system-symbolic" />
      <popover>
        <box
          orientation={Gtk.Orientation.VERTICAL}
          spacing={16}
          cssClasses={["quick-settings-menu"]}
        >
          <box orientation={Gtk.Orientation.VERTICAL} spacing={8}>
            <label
              label="Network & Bluetooth"
              cssClasses={["qs-title"]}
              halign={Gtk.Align.START}
            />
            <NetworkItem />
            <BluetoothItem />
          </box>
          <box orientation={Gtk.Orientation.VERTICAL} spacing={8}>
            <label
              label="Audio"
              cssClasses={["qs-title"]}
              halign={Gtk.Align.START}
            />
            <AudioSlider type="speaker" />
            <AudioSlider type="microphone" />
          </box>
        </box>
      </popover>
    </menubutton>
  )
}
