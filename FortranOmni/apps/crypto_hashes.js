var metadata = {
    id: "crypto",
    name: "Crypto & Hashes",
    icon: "🔑",
};

function createPage(ctx) {
    const { Gtk, GLib, common } = ctx;

    const scroller = new Gtk.ScrolledWindow({
        hexpand: true,
        vexpand: true,
    });

    const page = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        spacing: 16,
    });
    page.set_margin_top(28);
    page.set_margin_bottom(28);
    page.set_margin_start(34);
    page.set_margin_end(34);
    scroller.set_child(page);

    page.append(common.pageTitle("Crypto & Hashes"));

    const inputCard = common.card();
    inputCard.append(common.sectionTitle("Text"));

    const input = new Gtk.TextView({
        monospace: true,
        wrap_mode: Gtk.WrapMode.WORD_CHAR,
    });
    const inputScroll = new Gtk.ScrolledWindow({
        min_content_height: 180,
        hexpand: true,
    });
    inputScroll.set_child(input);
    inputCard.append(inputScroll);
    page.append(inputCard);

    const buttons = new Gtk.Box({
        orientation: Gtk.Orientation.HORIZONTAL,
        spacing: 8,
    });

    const sha256 = new Gtk.Button({ label: "SHA-256" });
    sha256.add_css_class("primary");
    const sha512 = new Gtk.Button({ label: "SHA-512" });
    const sha1 = new Gtk.Button({ label: "SHA-1" });
    const md5 = new Gtk.Button({ label: "MD5" });

    buttons.append(sha256);
    buttons.append(sha512);
    buttons.append(sha1);
    buttons.append(md5);
    page.append(buttons);

    const outputCard = common.card();
    outputCard.append(common.sectionTitle("Hash"));
    const output = common.infoLabel("Enter text, then choose a hash.");
    output.set_selectable(true);
    outputCard.append(output);

    const note = common.infoLabel(
        "SHA-256/SHA-512 are good general-purpose cryptographic hashes. MD5 and SHA-1 are included for compatibility checks, not for password security."
    );
    note.add_css_class("muted");
    outputCard.append(note);
    page.append(outputCard);

    function inputText() {
        const buffer = input.get_buffer();
        return buffer.get_text(buffer.get_start_iter(), buffer.get_end_iter(), true);
    }

    function hash(type) {
        const text = inputText();
        try {
            const value = GLib.compute_checksum_for_string(type, text, -1);
            output.set_label(value);
        } catch (e) {
            output.set_label(`Could not calculate hash: ${e.message}`);
        }
    }

    sha256.connect("clicked", () => hash(GLib.ChecksumType.SHA256));
    sha512.connect("clicked", () => hash(GLib.ChecksumType.SHA512));
    sha1.connect("clicked", () => hash(GLib.ChecksumType.SHA1));
    md5.connect("clicked", () => hash(GLib.ChecksumType.MD5));

    return { widget: scroller };
}
