var metadata = {
    id: "preferences",
    name: "Preferences",
    icon: "⚙️",
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

    page.append(common.pageTitle("Preferences"));

    const profile = common.card(10);
    profile.append(common.sectionTitle("Profile"));

    const nameLabel = common.infoLabel("Display name shown in the ForUtils sidebar:");
    const nameEntry = new Gtk.Entry({
        text: ctx.settings.userName || "",
        placeholder_text: "Your display name",
        hexpand: true,
    });

    profile.append(nameLabel);
    profile.append(nameEntry);
    page.append(profile);

    const refreshCard = common.card(10);
    refreshCard.append(common.sectionTitle("System scanner"));

    const autoRefresh = new Gtk.CheckButton({
        label: "Automatically refresh system stats",
        active: Boolean(ctx.settings.autoRefreshSystemStats),
    });

    const secondsRow = new Gtk.Box({
        orientation: Gtk.Orientation.HORIZONTAL,
        spacing: 10,
    });
    const secondsLabel = common.infoLabel("Refresh every");
    const seconds = new Gtk.SpinButton({
        adjustment: new Gtk.Adjustment({
            lower: 2,
            upper: 300,
            step_increment: 1,
            page_increment: 5,
            value: Math.max(2, Number(ctx.settings.autoRefreshSeconds) || 5),
        }),
        numeric: true,
    });
    const secondsSuffix = common.infoLabel("seconds");

    secondsRow.append(secondsLabel);
    secondsRow.append(seconds);
    secondsRow.append(secondsSuffix);

    refreshCard.append(autoRefresh);
    refreshCard.append(secondsRow);
    page.append(refreshCard);

    const save = new Gtk.Button({ label: "Save Preferences" });
    save.add_css_class("primary");

    const status = common.infoLabel("");
    status.add_css_class("status-ok");

    save.connect("clicked", () => {
        const name = nameEntry.get_text().trim();
        ctx.settings.userName = name || "User";
        ctx.settings.autoRefreshSystemStats = autoRefresh.get_active();
        ctx.settings.autoRefreshSeconds = Math.max(2, seconds.get_value_as_int());
        ctx.saveSettings();
        status.set_label("Preferences saved.");
    });

    page.append(save);
    page.append(status);

    return { widget: scroller };
}
