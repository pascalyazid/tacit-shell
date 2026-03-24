import { Gtk } from "ags/gtk4"
import AstalMpris from "gi://AstalMpris?version=0.1"
import { createBinding, With, onCleanup } from "ags"

export default function Media() {
  const mpris = AstalMpris.Mpris.get_default()

  return (
    <box cssClasses={["media-container"]}>
      <With value={createBinding(mpris, "players")}>
        {(players: any[]) => {
          if (!players || players.length === 0) {
            return <box />
          }

          // We render all players but manage their visibility manually.
          return (
            <box
              $={(box) => {
                const updateVisibility = () => {
                  let hasPlaying = false
                  for (const player of players) {
                    if (
                      player.playback_status ===
                      AstalMpris.PlaybackStatus.PLAYING
                    ) {
                      hasPlaying = true
                      break
                    }
                  }

                  let first = true
                  let child = box.get_first_child()
                  for (const player of players) {
                    if (!child) break

                    if (hasPlaying) {
                      child.set_visible(
                        player.playback_status ===
                          AstalMpris.PlaybackStatus.PLAYING,
                      )
                    } else {
                      child.set_visible(first)
                      first = false
                    }
                    child = child.get_next_sibling()
                  }
                }

                const connections = players.map((p) =>
                  p.connect("notify::playback-status", updateVisibility),
                )

                updateVisibility()

                // Cleanup connections when this component is unmounted
                onCleanup(() => {
                  players.forEach((p, i) => {
                    try {
                      p.disconnect(connections[i])
                    } catch (e) {}
                  })
                })
              }}
            >
              {players.map((player) => (
                <button
                  cssClasses={["media-btn"]}
                  onClicked={() =>
                    console.log("Expand Media Controls - Phase 7")
                  }
                >
                  <box spacing={8} valign={Gtk.Align.CENTER}>
                    {/* Fallback to an icon if cover-art is empty */}
                    <image
                      cssClasses={["media-art"]}
                      file={createBinding(player, "cover-art")}
                      iconName="audio-x-generic-symbolic"
                    />
                    <label
                      cssClasses={["media-title"]}
                      label={createBinding(player, "title")}
                      maxWidthChars={25}
                      wrap={false}
                      ellipsize={3} // Pango.EllipsizeMode.END
                    />
                  </box>
                </button>
              ))}
            </box>
          )
        }}
      </With>
    </box>
  )
}
