# FortranOmni

**184 utilities in one open-source Linux desktop application.** Built with **GTK 4 + GJS** by [samwise1776](https://github.com/samwise1776).

FortranOmni brings everyday tools, developer helpers, converters, and system utilities together in one application. Instead of hunting for a different small program for every task, open FortranOmni and pick what you need.

[**Website**](https://samwise1776.github.io/FortranOmni/) · [**Releases**](https://github.com/samwise1776/FortranOmni/releases) · [**Browse all 184 utilities**](FortranOmni/TOOL_CATALOG.md) · [**Report a bug**](https://github.com/samwise1776/FortranOmni/issues)

## What can it do?

| Category | Examples |
| --- | --- |
| System | System Stats, Network Tools |
| Developer | Docs Maker, GH Gen, Crypto & Hashes, Password Generator |
| Files | File Organizer with preview and undo |
| Productivity | Timers and Stopwatch |
| Text, Math, Converters, Time, Network, Random | Small utilities for everyday tasks |

The [app manifest](FortranOmni/apps/manifest.json) currently lists **184 enabled tools**. The [tool catalog](FortranOmni/TOOL_CATALOG.md) describes what they do.

## Run from source on Ubuntu / Linux

Install the runtime:

```bash
sudo apt update
sudo apt install -y git gjs gir1.2-gtk-4.0
```

Clone the project and launch the desktop app:

```bash
git clone https://github.com/samwise1776/FortranOmni.git
cd FortranOmni/FortranOmni
bash run.sh
```

You need a Linux graphical desktop session. Other distributions may have different GTK 4 / GJS package names. If you already have the repository, run `bash FortranOmni/run.sh` from its root.

### Download a release

See the [GitHub releases page](https://github.com/samwise1776/FortranOmni/releases) for packaged archives. **Release packages may not contain the same updates as the current source tree.**

## What makes it useful?

- **One place for many tasks:** Use the sidebar/category list rather than installing a separate program for every small utility.
- **Open source:** Inspect the application and the [184-item tool catalog](FortranOmni/TOOL_CATALOG.md).
- **Hackable:** Add mini utilities through [`apps/manifest.json`](FortranOmni/apps/manifest.json) or build a custom page using the application templates.

## Get involved

Try the app, [report bugs or request features](https://github.com/samwise1776/FortranOmni/issues), and tell us which utilities you use most. Contributions and reproducible issue reports are welcome.

If FortranOmni is useful to you, consider **starring the repository** so other Linux developers can find it.

## Project

Maintained by **[samwise1776](https://github.com/samwise1776)**.

[More projects](https://github.com/samwise1776?tab=repositories) · [Software hub](https://samwise1776.github.io/apps/)

<!-- SAMWISE1776-IDENTITY-START -->
Public project identity: samwise1776
<!-- SAMWISE1776-IDENTITY-END -->
