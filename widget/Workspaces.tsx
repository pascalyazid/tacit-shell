import { execAsync, createSubprocess } from "ags/process"
import { Gdk } from "ags/gtk4"
import GLib from "gi://GLib?version=2.0"

const HIS = GLib.getenv("HYPRLAND_INSTANCE_SIGNATURE")
const sock = `${GLib.getenv("XDG_RUNTIME_DIR")}/hypr/${HIS}/.socket2.sock`

export default function Workspaces({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
  const monitorName = gdkmonitor.get_connector()

  // Listen to the Hyprland socket for instant workspace updates
  const activeWs = createSubprocess(
    1,
    [
      "sh",
      "-c",
      `
MON="${monitorName}"
print_ws() {
  hyprctl monitors -j | python3 -c "import json, sys; mon = sys.argv[1]; data = json.load(sys.stdin); print(next((m.get('activeWorkspace', {}).get('id', 0) for m in data if m.get('name') == mon), 0))" "$MON"
}

print_ws
nc -U ${sock} | while IFS= read -r line; do
  case "$line" in
    focusedmon*|workspace*|workspacev2*|moveworkspace*|moveworkspacev2*|createworkspace*|destroyworkspace*)
      print_ws
      ;;
  esac
done
`,
    ],
    (out, prev) => {
      const num = parseInt(out.trim())
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
