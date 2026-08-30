const { Gtk, GLib } = imports.gi;

function getText(view) {
    const b = view.get_buffer();
    return b.get_text(b.get_start_iter(), b.get_end_iter(), true);
}
function setText(view, text) { view.get_buffer().set_text(String(text || ""), -1); }

function createPage(ctx, entry) {
    const { common, window } = ctx;
    const scroller = new Gtk.ScrolledWindow({ hexpand: true, vexpand: true });
    const page = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 12, hexpand: true });
    page.set_margin_top(24); page.set_margin_bottom(24); page.set_margin_start(28); page.set_margin_end(28);
    page.append(common.pageTitle(entry.name));
    page.append(common.infoLabel("Markdown editor with live plain-text preview, templates, open, and save."));

    const actions = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 8 });
    const newBtn = new Gtk.Button({ label: "New" });
    const openBtn = new Gtk.Button({ label: "Open .md" });
    const saveBtn = new Gtk.Button({ label: "Save" }); saveBtn.add_css_class("primary");
    const saveAsBtn = new Gtk.Button({ label: "Save As" });
    const templateBtn = new Gtk.Button({ label: "README Template" });
    [newBtn, openBtn, saveBtn, saveAsBtn, templateBtn].forEach(b => actions.append(b));
    page.append(actions);

    const pathLabel = common.infoLabel("Unsaved document"); pathLabel.add_css_class("muted"); page.append(pathLabel);
    const split = new Gtk.Paned({ orientation: Gtk.Orientation.HORIZONTAL, hexpand: true, vexpand: true });
    const editor = new Gtk.TextView({ monospace: true, wrap_mode: Gtk.WrapMode.WORD_CHAR, vexpand: true });
    const preview = new Gtk.TextView({ editable: false, wrap_mode: Gtk.WrapMode.WORD_CHAR, vexpand: true });
    const es = new Gtk.ScrolledWindow({ min_content_height: 520, hexpand: true, vexpand: true }); es.set_child(editor);
    const ps = new Gtk.ScrolledWindow({ min_content_height: 520, hexpand: true, vexpand: true }); ps.set_child(preview);
    const ec = common.card(); ec.append(common.sectionTitle("Markdown")); ec.append(es);
    const pc = common.card(); pc.append(common.sectionTitle("Preview")); pc.append(ps);
    split.set_start_child(ec); split.set_end_child(pc); split.set_position(500); page.append(split);
    scroller.set_child(page);

    let currentPath = null;
    function render(md) {
        return md.split(/\r?\n/).map(line => line
            .replace(/^#{1,6}\s+/, "")
            .replace(/\*\*(.*?)\*\*/g, "$1")
            .replace(/\*(.*?)\*/g, "$1")
            .replace(/`([^`]+)`/g, "$1")
            .replace(/^[-*]\s+/, "• ")).join("\n");
    }
    function refresh() { setText(preview, render(getText(editor))); }
    editor.get_buffer().connect("changed", refresh);

    function openFile() {
        const d = new Gtk.FileChooserNative({ title: "Open Markdown", transient_for: window, action: Gtk.FileChooserAction.OPEN, accept_label: "Open", cancel_label: "Cancel" });
        const f = new Gtk.FileFilter(); f.set_name("Markdown"); f.add_pattern("*.md"); d.add_filter(f);
        d.connect("response", (_, r) => { if (r === Gtk.ResponseType.ACCEPT) { const file = d.get_file(); if (file) { currentPath = file.get_path(); setText(editor, common.readTextFile(currentPath, "")); pathLabel.set_label(currentPath); } } d.destroy(); });
        d.show();
    }
    function saveDialog() {
        const d = new Gtk.FileChooserNative({ title: "Save Markdown", transient_for: window, action: Gtk.FileChooserAction.SAVE, accept_label: "Save", cancel_label: "Cancel" });
        d.set_current_name(currentPath ? GLib.path_get_basename(currentPath) : "README.md");
        d.connect("response", (_, r) => { if (r === Gtk.ResponseType.ACCEPT) { const file = d.get_file(); if (file) { currentPath = file.get_path(); common.writeTextFile(currentPath, getText(editor)); pathLabel.set_label(currentPath); } } d.destroy(); });
        d.show();
    }
    newBtn.connect("clicked", () => { currentPath = null; setText(editor, ""); pathLabel.set_label("Unsaved document"); });
    openBtn.connect("clicked", openFile);
    saveBtn.connect("clicked", () => currentPath ? common.writeTextFile(currentPath, getText(editor)) : saveDialog());
    saveAsBtn.connect("clicked", saveDialog);
    templateBtn.connect("clicked", () => setText(editor, `# Project Name\n\nA short description.\n\n## Features\n\n- Feature one\n- Feature two\n\n## Installation\n\n\`\`\`bash\n# commands\n\`\`\`\n\n## Usage\n\nExplain how to use it.\n\n## License\n\nChoose a license.\n`));
    refresh();
    return scroller;
}
var metadata = { id: "docs", name: "Docs Maker", icon: "📝" };
