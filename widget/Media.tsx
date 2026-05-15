import { Gtk } from "ags/gtk4"
import AstalMpris from "gi://AstalMpris?version=0.1"
import GLib from "gi://GLib?version=2.0"
import { createBinding, With, onCleanup } from "ags"

function VinylRecord({ player, size }: { player: any; size: number }) {
  const border = Math.max(2, Math.round(size * 0.04))

  return (
    <box
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
      $={(box) => {
        let angle = 0
        let timerId: number | null = null

        const rotProvider = new Gtk.CssProvider()
        box
          .get_style_context()
          .add_provider(rotProvider, Gtk.STYLE_PROVIDER_PRIORITY_USER)

        const applyAngle = () => {
          rotProvider.load_from_string(`* { transform: rotate(${angle}deg); }`)
        }

        const startSpin = () => {
          if (timerId !== null) return
          timerId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 33, () => {
            angle = (angle + 2) % 360
            applyAngle()
            return true
          })
        }

        const stopSpin = () => {
          if (timerId !== null) {
            GLib.source_remove(timerId)
            timerId = null
          }
        }

        const frame = new Gtk.Frame()
        const provider = new Gtk.CssProvider()
        provider.load_from_string(`
          frame {
            border-radius: 50%;
            border: ${border}px solid rgba(20, 20, 20, 0.9);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
            padding: 0;
          }
        `)
        frame
          .get_style_context()
          .add_provider(provider, Gtk.STYLE_PROVIDER_PRIORITY_USER)
        frame.halign = Gtk.Align.CENTER
        frame.valign = Gtk.Align.CENTER

        const img = new Gtk.Image()
        img.icon_name = "audio-x-generic-symbolic"
        img.pixel_size = size

        const holeSize = Math.round(size * 0.1)
        const hole = new Gtk.Box({
          halign: Gtk.Align.CENTER,
          valign: Gtk.Align.CENTER,
        })
        const holeProvider = new Gtk.CssProvider()
        holeProvider.load_from_string(`
          box {
            background: rgba(0, 0, 0, 0.85);
            border: 2px solid rgba(255, 255, 255, 0.15);
            border-radius: 50%;
            min-width: ${holeSize}px;
            min-height: ${holeSize}px;
          }
        `)
        hole
          .get_style_context()
          .add_provider(holeProvider, Gtk.STYLE_PROVIDER_PRIORITY_USER)

        const overlay = new Gtk.Overlay()
        overlay.child = img
        frame.child = overlay
        box.append(frame)

        const updateArt = () => {
          const art = player.cover_art
          if (art) {
            img.set_from_file(art)
          } else {
            img.set_from_icon_name("audio-x-generic-symbolic")
          }
        }
        updateArt()

        if (player.playback_status === AstalMpris.PlaybackStatus.PLAYING) {
          startSpin()
        }
        applyAngle()

        const artConn = player.connect("notify::cover-art", updateArt)
        const statusConn = player.connect("notify::playback-status", () => {
          if (player.playback_status === AstalMpris.PlaybackStatus.PLAYING) {
            startSpin()
          } else {
            stopSpin()
          }
        })

        onCleanup(() => {
          stopSpin()
          try {
            player.disconnect(artConn)
          } catch {}
          try {
            player.disconnect(statusConn)
          } catch {}
        })
      }}
    />
  )
}

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
                    {/* --- Bar: small vinyl + title --- */}
                    <box spacing={8} valign={Gtk.Align.CENTER}>
                      <VinylRecord player={player} size={26} />
                      <label
                        cssClasses={["media-title"]}
                        label={createBinding(player, "title")}
                        maxWidthChars={20}
                        wrap={false}
                        ellipsize={3}
                      />
                    </box>

                    {/* --- Popover: expanded controls --- */}
                    <popover>
                      <box
                        css="padding: 20px; min-width: 300px;"
                        orientation={Gtk.Orientation.VERTICAL}
                        spacing={16}
                      >
                        <box spacing={16}>
                          <VinylRecord player={player} size={96} />
                          <box
                            orientation={Gtk.Orientation.VERTICAL}
                            valign={Gtk.Align.CENTER}
                            spacing={4}
                            hexpand={true}
                          >
                            <label
                              label={createBinding(player, "title")}
                              css="font-weight: bold; font-size: 1.15em;"
                              halign={Gtk.Align.START}
                              wrap={true}
                              maxWidthChars={22}
                            />
                            <label
                              label={createBinding(player, "artist")}
                              css="opacity: 0.7; font-size: 0.95em;"
                              halign={Gtk.Align.START}
                              wrap={true}
                              maxWidthChars={22}
                            />
                          </box>
                        </box>

                        <box
                          halign={Gtk.Align.CENTER}
                          spacing={12}
                          cssClasses={["media-controls"]}
                        >
                          <button
                            cssClasses={["media-ctrl-btn", "skip-btn"]}
                            onClicked={() => player.previous()}
                          >
                            <image
                              iconName="media-skip-backward-symbolic"
                              css="-gtk-icon-size: 18px;"
                            />
                          </button>
                          <button
                            cssClasses={["media-ctrl-btn", "play-pause-btn"]}
                            onClicked={() => player.play_pause()}
                          >
                            <image
                              iconName={playbackIcon}
                              css="-gtk-icon-size: 22px;"
                            />
                          </button>
                          <button
                            cssClasses={["media-ctrl-btn", "skip-btn"]}
                            onClicked={() => player.next()}
                          >
                            <image
                              iconName="media-skip-forward-symbolic"
                              css="-gtk-icon-size: 18px;"
                            />
                          </button>
                        </box>
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
