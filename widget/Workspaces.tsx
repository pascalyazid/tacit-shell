import { execAsync, createSubprocess } from "ags/process"
import GLib from "gi://GLib?version=2.0"

const HIS = GLib.getenv("HYPRLAND_INSTANCE_SIGNATURE")
const sock = `${GLib.getenv("XDG_RUNTIME_DIR")}/hypr/${HIS}/.socket2.sock`

export default function Workspaces() {
  // Listen to the Hyprland socket for instant workspace updates
  const activeWs = createSubprocess(
    1,
    [
      "sh",
      "-c",
      `hyprctl activeworkspace -j | grep '"id":' | head -1 | awk '{print $2}' | tr -d ','; nc -U ${sock}`,
    ],
    (out, prev) => {
      const match = out.match(/(?:^|\n)workspace>>(\d+)/)
      if (match) return parseInt(match[1])

      const num = parseInt(out)
      if (!isNaN(num) && num > 0) return num

      return prev
    },
  )

  return (
    <box cssClasses={["workspaces"]} spacing={4}>
      {Array.from({ length: 9 }, (_, i) => i + 1).map((i) => (
        <button
          cssClasses={activeWs((active) =>
            active === i ? ["workspace-btn", "active"] : ["workspace-btn"],
          )}
          onClicked={() => execAsync(`hyprctl dispatch workspace ${i}`)}
        >
          <label label={`${i}`} />
        </button>
      ))}
    </box>
  )
}
