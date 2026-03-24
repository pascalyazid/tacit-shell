import { Gtk } from "ags/gtk4"
import { execAsync } from "ags/process"
import { createPoll } from "ags/time"

export default function Workspaces() {
  // Poll the active workspace ID from Hyprland
  const activeWs = createPoll(1, 250, (prev) =>
    execAsync("hyprctl activeworkspace -j")
      .then((out) => JSON.parse(out).id as number)
      .catch(() => prev),
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
