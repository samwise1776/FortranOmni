#!/usr/bin/env gjs

imports.gi.versions.Gtk = "4.0";
imports.gi.versions.Gdk = "4.0";

const { Gtk, Gdk, GLib, Gio } = imports.gi;

const ROOT = GLib.path_get_dirname(imports.system.programInvocationName);
const APPS_DIR = GLib.build_filenamev([ROOT, "apps"]);
const LIB_DIR = GLib.build_filenamev([ROOT, "lib"]);
const MANIFEST = GLib.build_filenamev([APPS_DIR, "manifest.json"]);

imports.searchPath.unshift(LIB_DIR);
imports.searchPath.unshift(APPS_DIR);

const Common = imports.fortranomni_common;

const APP_ID = "com.github.samwise1776.fortranomni";
const APP_NAME = "FortranOmni";

const state = {
    settings: Common.loadSettings(),
    stack: null,
    appRecords: [],
    sidebarUserLabel: null,
};

function installCss() {
    const css = `
        window { background: #101318; color: #e8eef5; }
        .topbar { background: #151a20; border-bottom: 1px solid #2a313a; padding: 8px 14px; }
        .brand { font-size: 24px; font-weight: 900; color: #00e8c0; }
        .muted { color: #8b97a4; }
        .sidebar { background: #151a20; border-right: 1px solid #2a313a; }
        .sidebar-button { padding: 9px 11px; border-radius: 7px; background: transparent; color: #dfe7ef; }
        .sidebar-button:hover { background: #232a33; }
        .sidebar-button.active { background: #26313a; font-weight: 800; }
        .content-title { font-size: 26px; font-weight: 900; color: #f7fafc; }
        .section-title { font-size: 18px; font-weight: 800; color: #eff5fa; }
        .info-label { font-size: 13px; color: #dce4ec; }
        .card { background: #171c22; border: 1px solid #2b333d; border-radius: 12px; padding: 15px; }
        .primary { background: #00cba8; color: #06110e; font-weight: 800; border-radius: 8px; padding: 8px 13px; }
        .primary:hover { background: #00e8c0; }
        .danger { background: #a93f4a; color: white; }
        entry, textview { background: #11161c; color: #edf3f8; border: 1px solid #303945; border-radius: 8px; }
        entry { padding: 8px; }
        textview { padding: 8px; }
        progressbar trough { min-height: 12px; }
        .tool-count { font-size: 12px; color: #7f8a97; }
        .category { font-size: 11px; font-weight: 800; color: #788593; margin-top: 8px; }
        .timer-display { font-size: 36px; font-weight: 900; }
    `;

    const provider = new Gtk.CssProvider();
    if (typeof provider.load_from_string === "function") provider.load_from_string(css);
    else provider.load_from_data(css);

    Gtk.StyleContext.add_provider_for_display(
        Gdk.Display.get_default(), provider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
    );
}

function loadManifest() {
    try {
        const [ok, bytes] = GLib.file_get_contents(MANIFEST);
        if (!ok) return [];
        const manifest = JSON.parse(new TextDecoder().decode(bytes));
        return Array.isArray(manifest.apps) ? manifest.apps.filter(x => x.enabled !== false) : [];
    } catch (e) {
        printerr(`[FortranOmni] manifest error: ${e.stack || e}`);
        return [];
    }
}

function createContext(window) {
    return {
        Gtk, Gdk, GLib, Gio, window,
        root: ROOT,
        common: Common,
        settings: state.settings,
        saveSettings() { Common.saveSettings(state.settings); },
    };
}

function navigateTo(id) {
    const rec = state.appRecords.find(r => r.id === id);
    if (!rec) return;
    state.stack.set_visible_child_name(id);
    for (const r of state.appRecords) {
        if (!r.button) continue;
        if (r.id === id) r.button.add_css_class("active");
        else r.button.remove_css_class("active");
    }
    if (rec.instance && typeof rec.instance.onShow === "function") {
        try { rec.instance.onShow(); } catch (e) { printerr(String(e)); }
    }
}

function createWindow(app) {
    const window = new Gtk.ApplicationWindow({
        application: app,
        title: APP_NAME,
        default_width: 1260,
        default_height: 800,
    });
    window.set_size_request(900, 600);

    const root = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 0 });
    window.set_child(root);

    const topbar = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 10 });
    topbar.add_css_class("topbar");
    const topTitle = new Gtk.Label({ label: "FortranOmni", xalign: 0, hexpand: true });
    topTitle.add_css_class("brand");
    const countLabel = new Gtk.Label({ label: "", xalign: 1 });
    countLabel.add_css_class("tool-count");
    topbar.append(topTitle);
    topbar.append(countLabel);
    root.append(topbar);

    const body = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 0, hexpand: true, vexpand: true });
    root.append(body);

    const sideWrap = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 8 });
    sideWrap.add_css_class("sidebar");
    sideWrap.set_size_request(310, -1);
    sideWrap.set_margin_top(12); sideWrap.set_margin_bottom(12);
    sideWrap.set_margin_start(10); sideWrap.set_margin_end(10);

    const brand = new Gtk.Label({ xalign: 0 });
    brand.set_markup('<span size="21000" weight="bold"><span foreground="#00e8c0">Fortran</span>Omni</span>');
    sideWrap.append(brand);
    state.sidebarUserLabel = new Gtk.Label({ label: `User: ${state.settings.userName || GLib.get_user_name() || "User"}`, xalign: 0 });
    state.sidebarUserLabel.add_css_class("muted");
    sideWrap.append(state.sidebarUserLabel);

    const search = new Gtk.SearchEntry({ placeholder_text: "Search 100+ tools..." });
    sideWrap.append(search);

    const navScroll = new Gtk.ScrolledWindow({ vexpand: true, hexpand: true });
    const navBox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 5 });
    navScroll.set_child(navBox);
    sideWrap.append(navScroll);
    body.append(sideWrap);

    const stack = new Gtk.Stack({
        hexpand: true, vexpand: true,
        transition_type: Gtk.StackTransitionType.CROSSFADE,
        transition_duration: 100,
    });
    state.stack = stack;
    body.append(stack);

    const ctx = createContext(window);
    const entries = loadManifest();

    for (const entry of entries) {
        try {
            const mod = imports[entry.module];
            if (!mod || typeof mod.createPage !== "function") throw new Error(`No createPage in ${entry.module}`);
            const instance = mod.createPage(ctx, entry) || {};
            const page = instance.widget || instance;
            const id = entry.id;
            stack.add_named(page, id);

            const button = new Gtk.Button({
                label: `${entry.icon || "•"} ${entry.name}`,
                halign: Gtk.Align.FILL,
                hexpand: true,
            });
            button.add_css_class("sidebar-button");
            button.set_has_frame(false);
            button.connect("clicked", () => navigateTo(id));
            navBox.append(button);

            state.appRecords.push({ id, entry, instance, button });
        } catch (e) {
            printerr(`[FortranOmni] failed ${entry.id}: ${e.stack || e}`);
        }
    }

    countLabel.set_label(`${state.appRecords.length} tools`);

    search.connect("search-changed", () => {
        const q = search.get_text().trim().toLowerCase();
        for (const rec of state.appRecords) {
            const hay = `${rec.entry.name} ${rec.entry.category || ""} ${rec.entry.description || ""}`.toLowerCase();
            rec.button.set_visible(!q || hay.includes(q));
        }
    });

    if (state.appRecords.length) navigateTo(state.appRecords[0].id);
    return window;
}

const app = new Gtk.Application({ application_id: APP_ID });
app.connect("activate", () => {
    installCss();
    const window = createWindow(app);
    window.present();
});
app.run([]);
