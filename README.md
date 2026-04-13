# AGS Bar for Hyprland (CachyOS)

A fast, highly-customizable, and memory-optimized top bar for Hyprland, built with [AGS (Aylur's GTK Shell)](https://aylur.github.io/ags-docs/) and GTK4.

This shell features dynamic on-the-fly theming using **Pywal**, completely integrating your wallpaper colors into the bar and the rest of your system seamlessly.

## ✨ Features

- **Multi-Monitor Support**: Automatically instantiates a top bar and power menu overlay for every connected display.
- **Dynamic Pywal Theming**: Select a wallpaper from the built-in popover, and the entire system theme (AGS, Kitty, Rofi, etc.) updates instantly.
- **Memory-Optimized Image Caching**: The wallpaper switcher uses highly efficient pre-scaled `GdkPixbuf` GTK textures to keep RAM usage incredibly low, even with 4K images.
- **Smart Media Player**: Automatically tracks and controls your active media player via MPRIS. Includes a popover with album art and playback controls.
- **Quick Settings Dropdown**: Easily manage your Network, Bluetooth (safe non-blocking toggles), and Audio (Speaker/Mic sliders).
- **System Tray & Clock**: Unified system tray and a datetime display with a clickable calendar popover.
- **Hyprland Workspaces**: Highlights the active workspace and allows click-to-switch navigation.

---

## 📦 Dependencies

To use this shell, you need to install AGS and the required backend libraries. Since you are on CachyOS/Arch, you can install them via your package manager or AUR.

```bash
# Core AGS and Sass compiler for theming, hyprmod for hyprland settings, notification daemon
yay -S ags dart-sass hyprmod-git dunst

# Desktop environment dependencies
sudo pacman -S hyprpaper python-pywal16

# Astal libraries (for system data bindings)
yay -S astal-gjs astal-mpris astal-tray astal-network astal-bluetooth astal-wireplumber libastal-battery-git

```

---

## 🚀 Setup & Installation

1. **Clone/Place the Config:** Ensure this repository is placed at `~/.config/ags`.
2. **Wallpaper Directory:** Create a folder at `~/wallpapers` and put some `.jpg` or `.png` images in it. The theme switcher looks here by default.
   ```bash
   mkdir -p ~/wallpapers
   ```
3. **Initial Run:** Start the bar manually to ensure everything is working.
   ```bash
   ags run
   ```

### Autostarting with Hyprland

To make the bar start automatically when you log into Hyprland, add the following line to your `~/.config/hypr/hyprland.conf`:

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

### Example 2: Rofi (App Launcher)

Pywal generates a standard Rofi theme. You can create a custom `config.rasi` file for Rofi that imports these colors and applies them to your launcher.

Create or edit `~/.config/rofi/config.rasi`:

```css
/* Import the dynamically generated Pywal colors */
@import "~/.cache/wal/colors-rofi-dark.rasi" * {
  /* Map Pywal's semantic colors to your theme */
  bg-col: @background;
  fg-col: @foreground;
  accent-col: @selected-normal-background;
  accent-fg: @selected-normal-foreground;

  background-color: transparent;
  text-color: @fg-col;
}

window {
  border: 2px;
  border-color: @accent-col;
  background-color: @bg-col;
}

element selected.normal,
element selected.active {
  background-color: @accent-col;
  text-color: @accent-fg;
}
```

### Example 3: Fuzzel

If you use Fuzzel instead of Rofi, simply add this to the top of your `~/.config/fuzzel/fuzzel.ini` (Requires creating a custom pywal template for fuzzel):

```ini
include=~/.cache/wal/colors-fuzzel.ini
```

---

## 🛠️ Code Quality

This project is formatted and linted for maintainability.

- **Format code:** `npm run format`
- **Lint code:** `npm run lint`
