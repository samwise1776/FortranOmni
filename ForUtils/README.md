# ForUtils Ultimate

ForUtils Ultimate is a GTK4/GJS desktop utility suite. This build contains **184 tools total**, including the original major ForUtils tools plus **175 additional mini utilities**.

## Major apps

- System Stats
- Network Tools
- Docs Maker (Markdown)
- GH Gen
- File Organizer with preview + undo
- Timers + Stopwatch
- Crypto & Hashes
- Password Generator
- Preferences

## Extra utility categories

- Text tools
- Math tools
- Unit converters
- Time/date tools
- Developer helpers
- Network helpers
- Random generators

## Run

```bash
chmod +x run.sh app.js
./run.sh
```

Requirements: GTK4 and GJS. On Ubuntu-family systems they are commonly installable with `sudo apt install gjs gir1.2-gtk-4.0`.

## Add another tool

Add an entry to `apps/manifest.json`. For a simple mini utility, point `module` to `mini_tools` and add a supported `tool.op`. For a full custom page, copy `apps/template_app.js`.

## Safety

File Organizer only changes the folder you explicitly choose, previews its plan, and keeps an in-memory undo list for the most recent run. GH Gen only creates a GitHub repository after you press its button.
