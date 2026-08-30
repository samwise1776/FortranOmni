var metadata = {
    id: "network",
    name: "Network Tools",
    icon: "🌐",
};

function createPage(ctx) {
    const { Gtk, common } = ctx;

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

    page.append(common.pageTitle("Network Tools"));

    const targetCard = common.card(10);
    targetCard.append(common.sectionTitle("Host tools"));

    const target = new Gtk.Entry({
        placeholder_text: "example.com or 1.1.1.1",
        hexpand: true,
    });

    const buttonRow = new Gtk.Box({
        orientation: Gtk.Orientation.HORIZONTAL,
        spacing: 8,
    });

    const pingButton = new Gtk.Button({ label: "Ping" });
    pingButton.add_css_class("primary");

    const dnsButton = new Gtk.Button({ label: "DNS Lookup" });
    const routesButton = new Gtk.Button({ label: "Routes" });
    const interfacesButton = new Gtk.Button({ label: "Interfaces" });

    buttonRow.append(pingButton);
    buttonRow.append(dnsButton);
    buttonRow.append(routesButton);
    buttonRow.append(interfacesButton);

    targetCard.append(target);
    targetCard.append(buttonRow);
    page.append(targetCard);

    const outputCard = common.card(8);
    outputCard.append(common.sectionTitle("Output"));

    const output = new Gtk.TextView({
        editable: false,
        monospace: true,
        wrap_mode: Gtk.WrapMode.WORD_CHAR,
        vexpand: true,
    });
    output.set_size_request(-1, 360);

    const outputScroll = new Gtk.ScrolledWindow({
        hexpand: true,
        vexpand: true,
        min_content_height: 360,
    });
    outputScroll.set_child(output);
    outputCard.append(outputScroll);
    page.append(outputCard);

    function setOutput(text) {
        output.get_buffer().set_text(String(text || ""));
    }

    function cleanTarget() {
        const value = target.get_text().trim();
        if (!value) {
            setOutput("Enter a host or IP address first.");
            return null;
        }

        // Let programs receive the target as a single argv item.
        // No shell interpolation is used.
        if (value.length > 253 || /[\s/\\]/.test(value)) {
            setOutput("That target does not look like a normal hostname or IP address.");
            return null;
        }
        return value;
    }

    pingButton.connect("clicked", () => {
        const host = cleanTarget();
        if (!host) return;
        setOutput(`Pinging ${host}...\n`);
        const result = common.run(["ping", "-c", "4", "-W", "2", host]);
        setOutput(result.stdout || result.stderr || "No output.");
    });

    dnsButton.connect("clicked", () => {
        const host = cleanTarget();
        if (!host) return;
        const result = common.run(["getent", "ahosts", host]);
        setOutput(result.stdout || result.stderr || "No DNS results.");
    });

    routesButton.connect("clicked", () => {
        const result = common.run(["ip", "route"]);
        setOutput(result.stdout || result.stderr || "Could not read routes.");
    });

    interfacesButton.connect("clicked", () => {
        const result = common.run(["ip", "-brief", "address"]);
        setOutput(result.stdout || result.stderr || "Could not read interfaces.");
    });

    return {
        widget: scroller,
        onShow() {
            if (!output.get_buffer().get_char_count()) {
                const result = common.run(["ip", "-brief", "address"]);
                setOutput(result.stdout || result.stderr || "Network tools ready.");
            }
        },
    };
}
