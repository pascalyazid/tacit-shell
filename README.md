# AGS Bar for Hyprland

A fast, highly-customizable, and memory-optimized top bar for Hyprland, built with [AGS (Aylur's GTK Shell)](https://aylur.github.io/ags-docs/) and GTK4.

This shell features dynamic theming using **Pywal**, completely integrating your wallpaper colors into the bar and the rest of your system.

## ✨ Features

- **Multi-Monitor Support**: Automatically instantiates a top bar and power menu overlay for every connected display.
- **Dynamic Pywal Theming**: Select a wallpaper from the built-in popover, and the AGS theme updates instantly.
- **Memory-Optimized Image Caching**: The wallpaper switcher uses highly efficient pre-scaled `GdkPixbuf` GTK textures to keep RAM usage incredibly low, even with 4K images.
- **Smart Media Player**: Automatically tracks and controls your active media player via MPRIS. Includes a popover with album art and playback controls.
- **Quick Settings Dropdown**: Easily manage your Network, Bluetooth (safe non-blocking toggles), and Audio (Speaker/Mic sliders).
- **System Tray & Clock**: Unified system tray and a datetime display with a clickable calendar popover.
- **Hyprland Workspaces**: Highlights the active workspace and allows click-to-switch navigation.

---

## 📦 Dependencies

To use this shell, you need to install AGS and the required backend libraries. Since you are most probably using Arch, you can install them via your package manager or AUR.

```bash
# Core AGS and Sass compiler for theming, Hyprmod for Hyprland settings, Dunst notification daemon
yay -S ags dart-sass hyprmod-git dunst

# Wallpaper dependencies
yay -S hyprpaper python-pywal16

# Astal libraries (for system data bindings)
yay -S astal-gjs astal-mpris astal-tray astal-network astal-bluetooth astal-wireplumber libastal-battery-git
```

---

## 🚀 Setup & Installation

1. **Clone/Place the Config:** Ensure this repository is placed at `~/.config/ags`.
2. **Wallpaper Directory:** Create a folder at `~/wallpapers` where you can place your  `.jpg` or `.png` wallpapers in. The theme switcher looks here by default.
   ```bash
   mkdir -p ~/wallpapers
   ```
3. **Initial Run:** Start the bar manually to ensure everything is working.
   ```bash
   ags run
   ```

### Autostarting with Hyprland

To make the bar start automatically when you launch Hyprland, add the following line to your `~/.config/hypr/hyprland.conf`:

```ini
# Start the AGS bar on login
exec-once = ags run
```

_(Note: The shell is configured to automatically restore your last used wallpaper and Pywal theme on boot!)_

---

## 🎨 Applying the Theme Globally

Because this shell uses **Pywal**, you can easily inject the dynamically generated colors into almost any other application on your system!

Whenever you change the wallpaper via the AGS bar, Pywal updates the color templates inside `~/.cache/wal/`. Here is how to apply them to other apps:

### Manual Updates:

If your application needs to be restartet to update its themes, place the needed commands in the update_script.sh. An example for the dunst notification daemon is already in there.

### Example 1: Kitty Terminal

Kitty has built-in Pywal support. Pywal automatically generates a `.conf` file for it. Just add this single line anywhere in your `~/.config/kitty/kitty.conf`:

```conf
include ~/.cache/wal/colors-kitty.conf
```

_Next time you open Kitty, it will perfectly match your wallpaper!_


### Example 2: Dunst (Notification Daemon)

Pywal doesn't generate a theme for every application, hence you have to define some templates yourself in `~/.config/wal/templates`.
In this case we will create a template for Dunst:

```toml
[global]
    # Define the corner radius in pixels.
    # A value of 0 disables rounded corners.
    corner_radius = 10

[urgency_low]
    background = "{background}CC"
    foreground = "{foreground}"
    frame_color = "{color2}"
    timeout = 10

[urgency_normal]
    background = "{background}CC"
    foreground = "{foreground}"
    frame_color = "{color1}"
    timeout = 10

[urgency_critical]
    background = "{background}CC"
    foreground = "{foreground}"
    frame_color = "{color9}"
    timeout = 0
```
After switching the wallpaper, pywal will generate a theme with the exactly same name in `~/.cache/wal`
You can create a symlink so dunst will always have the current theme:

```bash
ln -sf ~/.cache/wal/dunstrc ~/.config/dunst/dunstrc
```

Because dunst doesn't apply the theme while it's running, we added 
```bash
killall dunst
dunst &
```
in the `update_script.sh` Bash-Script which runs every time the wallpaper is switched.
You can add your own commands in there if needed.

---
