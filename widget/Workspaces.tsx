import { execAsync, createSubprocess } from "ags/process"
import GLib from "gi://GLib?version=2.0"
import { Gdk } from "ags/gtk4"

const HIS = GLib.getenv("HYPRLAND_INSTANCE_SIGNATURE")
const sock = `${GLib.getenv("XDG_RUNTIME_DIR")}/hypr/${HIS}/.socket2.sock`

type WorkspaceState = {
  focusedMonitor: string
  activeByMonitor: Record<string, number>
}

const INITIAL_STATE: WorkspaceState = {
  focusedMonitor: "",
  activeByMonitor: {},
}

function parseMonitors(json: string): WorkspaceState {
  try {
    const monitors = JSON.parse(json) as Array<{
      name?: string
      focused?: boolean
      activeWorkspace?: { id?: number }
    }>

    const activeByMonitor: Record<string, number> = {}
    let focusedMonitor = ""

    for (const mon of monitors) {
      const name = mon?.name ?? ""
      const ws = Number(mon?.activeWorkspace?.id ?? 0)

      if (name && ws > 0) activeByMonitor[name] = ws
      if (mon?.focused && name) focusedMonitor = name
    }

    if (!focusedMonitor && monitors[0]?.name) focusedMonitor = monitors[0].name

    return { focusedMonitor, activeByMonitor }
  } catch {
    return INITIAL_STATE
  }
}

function updateState(out: string, prev: WorkspaceState): WorkspaceState {
  let state: WorkspaceState = {
    focusedMonitor: prev.focusedMonitor,
    activeByMonitor: { ...prev.activeByMonitor },
  }

  // Initial/refresh snapshots injected by shell command
  const monmapMatches = out.match(/__MONMAP__>>(.*)/g)
  if (monmapMatches?.length) {
    const latest = monmapMatches[monmapMatches.length - 1]
    const payload = latest.replace("__MONMAP__>>", "")
    const parsed = parseMonitors(payload)
    if (Object.keys(parsed.activeByMonitor).length > 0) state = parsed
  }

  // Hyprland event: focusedmon>>MONITOR,WORKSPACE_ID
  const focusedMonMatches = Array.from(
    out.matchAll(/(?:^|\n)focusedmon>>([^,\n]+),(\d+)/g),
  )
  for (const m of focusedMonMatches) {
    const mon = m[1]
    const ws = parseInt(m[2])
    if (mon && !Number.isNaN(ws) && ws > 0) {
      state.focusedMonitor = mon
      state.activeByMonitor[mon] = ws
    }
  }

  // Hyprland event: workspace>>WORKSPACE_ID
  // Applies to currently focused monitor.
  const workspaceMatches = Array.from(out.matchAll(/(?:^|\n)workspace>>(\d+)/g))
  for (const m of workspaceMatches) {
    const ws = parseInt(m[1])
    if (!Number.isNaN(ws) && ws > 0 && state.focusedMonitor) {
      state.activeByMonitor[state.focusedMonitor] = ws
    }
  }

  return state
}

export default function Workspaces({
  gdkmonitor,
}: {
  gdkmonitor: Gdk.Monitor
}) {
  const monitorName = gdkmonitor.get_connector()

  const wsState = createSubprocess(
    INITIAL_STATE,
    ["sh", "-c", `echo "__MONMAP__>>$(hyprctl monitors -j)"; nc -U ${sock}`],
    updateState,
  )

  return (
    <box cssClasses={["workspaces"]} spacing={4}>
      {Array.from({ length: 9 }, (_, i) => i + 1).map((i) => (
        <button
          cssClasses={wsState((state) => {
            const isActiveOnThisMonitor =
              monitorName != null && state.activeByMonitor[monitorName] === i
            if (!isActiveOnThisMonitor) return ["workspace-btn"]

            const isFocusedMonitor = state.focusedMonitor === monitorName
            return isFocusedMonitor
              ? ["workspace-btn", "active-focused-monitor"]
              : ["workspace-btn", "active-unfocused-monitor"]
          })}
          onClicked={() => execAsync(`hyprctl dispatch workspace ${i}`)}
        >
          <label label={`${i}`} />
        </button>
      ))}
    </box>
  )
}
