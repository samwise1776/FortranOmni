/*
 * ForUtils app template
 *
 * 1. Copy this file and rename it, for example:
 *      apps/my_tool.js
 *
 * 2. Change metadata below.
 *
 * 3. Add your module to apps/manifest.json:
 *      {
 *        "id": "my-tool",
 *        "module": "my_tool",
 *        "name": "My Tool",
 *        "icon": "🧰",
 *        "enabled": true
 *      }
 *
 * 4. Restart ForUtils.
 */

var metadata = {
    id: "template",
    name: "Template App",
    icon: "🧰",
};

function createPage(ctx) {
    const { Gtk, common } = ctx;

    const page = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        spacing: 16,
        hexpand: true,
        vexpand: true,
    });

    page.set_margin_top(28);
    page.set_margin_bottom(28);
    page.set_margin_start(34);
    page.set_margin_end(34);

    page.append(common.pageTitle("My New ForUtils App"));

    const card = common.card();
    card.append(common.sectionTitle("Start here"));

    const label = common.infoLabel(
        "Replace this with your own widgets and logic. The sidebar entry is generated from apps/manifest.json."
    );
    card.append(label);

    const button = new Gtk.Button({ label: "Test Button" });
    button.add_css_class("primary");
    button.connect("clicked", () => {
        label.set_label("Your new ForUtils app works.");
    });

    card.append(button);
    page.append(card);

    return { widget: page };
}
