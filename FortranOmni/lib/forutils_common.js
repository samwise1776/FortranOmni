const { GLib, Gtk } = imports.gi;
const ByteArray = imports.byteArray;

const CONFIG_DIR = GLib.build_filenamev([GLib.get_user_config_dir(), "forutils"]);
const SETTINGS_FILE = GLib.build_filenamev([CONFIG_DIR, "settings.json"]);

function decodeBytes(bytes) {
    try { return ByteArray.toString(bytes); } catch (_) { return new TextDecoder().decode(bytes); }
}

function readTextFile(path, fallback = "") {
    try {
        const [ok, bytes] = GLib.file_get_contents(path);
        if (!ok) return fallback;
        return decodeBytes(bytes);
    } catch (_) {
        return fallback;
    }
}

function writeTextFile(path, text) {
    const dir = GLib.path_get_dirname(path);
    GLib.mkdir_with_parents(dir, 0o700);
    GLib.file_set_contents(path, text);
}

function loadSettings() {
    const defaults = {
        userName: GLib.get_user_name() || "User",
        autoRefreshSystemStats: false,
        autoRefreshSeconds: 5,
    };

    try {
        const text = readTextFile(SETTINGS_FILE, "");
        if (!text.trim()) return defaults;
        return Object.assign(defaults, JSON.parse(text));
    } catch (_) {
        return defaults;
    }
}

function saveSettings(settings) {
    writeTextFile(SETTINGS_FILE, JSON.stringify(settings, null, 2) + "\n");
}

function run(argv, timeoutSeconds = 8) {
    try {
        const [ok, stdout, stderr, status] = GLib.spawn_sync(
            null,
            argv,
            null,
            GLib.SpawnFlags.SEARCH_PATH,
            null
        );

        const out = stdout ? decodeBytes(stdout).trim() : "";
        const err = stderr ? decodeBytes(stderr).trim() : "";

        return {
            ok: Boolean(ok) && status === 0,
            stdout: out,
            stderr: err,
            status,
        };
    } catch (e) {
        return {
            ok: false,
            stdout: "",
            stderr: e.message || String(e),
            status: -1,
        };
    }
}

function firstLine(text) {
    return String(text || "").split(/\r?\n/)[0].trim();
}

function parseOsRelease() {
    const text = readTextFile("/etc/os-release", "");
    const result = {};
    for (const line of text.split(/\r?\n/)) {
        const idx = line.indexOf("=");
        if (idx < 1) continue;
        const key = line.slice(0, idx);
        let value = line.slice(idx + 1).trim();
        value = value.replace(/^["']|["']$/g, "");
        result[key] = value;
    }
    return result;
}

function formatBytes(bytes) {
    const n = Number(bytes);
    if (!Number.isFinite(n) || n < 0) return "Unknown";
    const units = ["B", "KB", "MB", "GB", "TB", "PB"];
    let value = n;
    let unit = 0;
    while (value >= 1024 && unit < units.length - 1) {
        value /= 1024;
        unit++;
    }
    return `${value.toFixed(unit >= 3 ? 2 : 1)} ${units[unit]}`;
}

function formatDuration(seconds) {
    let s = Math.max(0, Math.floor(Number(seconds) || 0));
    const days = Math.floor(s / 86400);
    s %= 86400;
    const hours = Math.floor(s / 3600);
    s %= 3600;
    const minutes = Math.floor(s / 60);

    const parts = [];
    if (days) parts.push(`${days} day${days === 1 ? "" : "s"}`);
    if (hours) parts.push(`${hours} hour${hours === 1 ? "" : "s"}`);
    if (minutes || parts.length === 0) parts.push(`${minutes} minute${minutes === 1 ? "" : "s"}`);
    return parts.slice(0, 2).join(", ");
}

function sectionTitle(text) {
    const label = new Gtk.Label({
        label: text,
        xalign: 0,
        halign: Gtk.Align.FILL,
    });
    label.add_css_class("section-title");
    return label;
}

function pageTitle(text) {
    const label = new Gtk.Label({
        label: text,
        xalign: 0,
        halign: Gtk.Align.FILL,
    });
    label.add_css_class("content-title");
    return label;
}

function infoLabel(text = "") {
    const label = new Gtk.Label({
        label: text,
        xalign: 0,
        halign: Gtk.Align.FILL,
        wrap: true,
        selectable: true,
    });
    label.add_css_class("info-label");
    return label;
}

function card(spacing = 8) {
    const box = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        spacing,
        hexpand: true,
    });
    box.add_css_class("card");
    return box;
}

function showError(parent, title, details = "") {
    const dialog = new Gtk.MessageDialog({
        transient_for: parent || null,
        modal: true,
        message_type: Gtk.MessageType.ERROR,
        buttons: Gtk.ButtonsType.CLOSE,
        text: title,
        secondary_text: details,
    });
    dialog.connect("response", d => d.destroy());
    dialog.present();
}

function showInfo(parent, title, details = "") {
    const dialog = new Gtk.MessageDialog({
        transient_for: parent || null,
        modal: true,
        message_type: Gtk.MessageType.INFO,
        buttons: Gtk.ButtonsType.CLOSE,
        text: title,
        secondary_text: details,
    });
    dialog.connect("response", d => d.destroy());
    dialog.present();
}

var CONFIG_DIR_PATH = CONFIG_DIR;
