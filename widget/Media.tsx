import { Gtk } from "ags/gtk4"
import AstalMpris from "gi://AstalMpris"
import { createBinding, With, onCleanup } from "ags"

export default function Media() {
  const mpris = AstalMpris.Mpris.get_default()
  let lastPlaying: string | null = null

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
                  const activePlayer = players.find(
                    (p) =>
                      p.playback_status === AstalMpris.PlaybackStatus.PLAYING,
                  )

                  if (activePlayer) {
                    lastPlaying = activePlayer.bus_name
                  }

                  const targetPlayer =
                    activePlayer ||
                    players.find((p) => p.bus_name === lastPlaying) ||
                    players[0]

                  let child = box.get_first_child()
                  for (const player of players) {
                    if (!child) break
                    child.set_visible(player === targetPlayer)
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
                    } catch {}
                  })
                })
              }}
            >
              {players.map((player) => {
                const playbackIcon = createBinding(
                  player,
                  "playback-status",
                )((s: any) =>
                  s === AstalMpris.PlaybackStatus.PLAYING
                    ? "media-playback-pause-symbolic"
                    : "media-playback-start-symbolic",
                )

                return (
                  <menubutton cssClasses={["media-btn"]}>
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
                    <popover>
                      <box
                        css="padding: 16px; min-width: 250px;"
                        orientation={Gtk.Orientation.VERTICAL}
                        spacing={16}
                      >
                        <box spacing={16}>
                          <image
                            file={createBinding(player, "cover-art")}
                            iconName="audio-x-generic-symbolic"
                            css="-gtk-icon-size: 64px; border-radius: 8px;"
                          />
                          <box
                            orientation={Gtk.Orientation.VERTICAL}
                            valign={Gtk.Align.CENTER}
                          >
                            <label
                              label={createBinding(player, "title")}
                              css="font-weight: bold; font-size: 1.1em;"
                              halign={Gtk.Align.START}
                              wrap={true}
                              maxWidthChars={20}
                            />
                            <label
                              label={createBinding(player, "artist")}
                              css="opacity: 0.8;"
                              halign={Gtk.Align.START}
                              wrap={true}
                              maxWidthChars={20}
                            />
                          </box>
                        </box>
                        <centerbox>
                          <button
                            $type="start"
                            onClicked={() => player.previous()}
                            css="border-radius: 100%; padding: 8px;"
                          >
                            <image iconName="media-skip-backward-symbolic" />
                          </button>
                          <button
                            $type="center"
                            onClicked={() => player.play_pause()}
                            css="border-radius: 100%; padding: 8px; min-width: 40px;"
                          >
                            <image iconName={playbackIcon} />
                          </button>
                          <button
                            $type="end"
                            onClicked={() => player.next()}
                            css="border-radius: 100%; padding: 8px;"
                          >
                            <image iconName="media-skip-forward-symbolic" />
                          </button>
                        </centerbox>
                      </box>
                    </popover>
                  </menubutton>
                )
              })}
            </box>
          )
        }}
      </With>
    </box>
  )
}
