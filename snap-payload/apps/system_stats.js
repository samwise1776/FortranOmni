var metadata = {
    id: "system",
    name: "System Stats",
    icon: "🖥️",
};

function createPage(ctx) {
    const { Gtk, GLib, common } = ctx;

    const scroller = new Gtk.ScrolledWindow({
        hexpand: true,
        vexpand: true,
    });

    const page = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        spacing: 18,
        hexpand: true,
    });
    page.set_margin_top(28);
    page.set_margin_bottom(28);
    page.set_margin_start(34);
    page.set_margin_end(34);
    scroller.set_child(page);

    page.append(common.pageTitle("System Resource Monitor Workspace"));

    const machine = common.card();
    machine.append(common.sectionTitle("Machine"));

    const hostname = common.infoLabel();
    const os = common.infoLabel();
    const kernel = common.infoLabel();
    const arch = common.infoLabel();

    machine.append(hostname);
    machine.append(os);
    machine.append(kernel);
    machine.append(arch);
    page.append(machine);

    const resources = common.card();
    resources.append(common.sectionTitle("Resources"));

    const cpuModel = common.infoLabel();
    const cpuUsage = common.infoLabel();
    const cpuCores = common.infoLabel();
    const ram = common.infoLabel();
    const ramUsage = common.infoLabel();
    const disk = common.infoLabel();

    const cpuBar = new Gtk.ProgressBar({ show_text: true, hexpand: true });
    const ramBar = new Gtk.ProgressBar({ show_text: true, hexpand: true });
    const diskBar = new Gtk.ProgressBar({ show_text: true, hexpand: true });

    resources.append(cpuModel);
    resources.append(cpuUsage);
    resources.append(cpuBar);
    resources.append(cpuCores);
    resources.append(ram);
    resources.append(ramUsage);
    resources.append(ramBar);
    resources.append(disk);
    resources.append(diskBar);
    page.append(resources);

    const session = common.card();
    session.append(common.sectionTitle("Session"));

    const uptime = common.infoLabel();
    const currentUser = common.infoLabel();
    const desktop = common.infoLabel();
    const localIp = common.infoLabel();

    session.append(uptime);
    session.append(currentUser);
    session.append(desktop);
    session.append(localIp);
    page.append(session);

    const controls = new Gtk.Box({
        orientation: Gtk.Orientation.HORIZONTAL,
        spacing: 12,
    });

    const refreshButton = new Gtk.Button({
        label: "Refresh System Info",
    });
    refreshButton.add_css_class("primary");

    const updatedLabel = common.infoLabel();
    updatedLabel.add_css_class("muted");

    controls.append(refreshButton);
    controls.append(updatedLabel);
    page.append(controls);

    function readCpuModel() {
        const cpuinfo = common.readTextFile("/proc/cpuinfo", "");
        const line = cpuinfo.split(/\r?\n/).find(l =>
            l.toLowerCase().startsWith("model name")
        );
        if (!line) return "Unknown";
        const idx = line.indexOf(":");
        return idx >= 0 ? line.slice(idx + 1).trim() : line.trim();
    }

    function readCpuUsagePercent() {
        const cores = Math.max(1, Number(common.run(["nproc"]).stdout) || 1);
        const result = common.run([
            "sh", "-c",
            "ps -eo pcpu= | awk '{s+=$1} END {print s+0}'"
        ]);
        if (!result.ok) return 0;
        const total = Number(result.stdout) || 0;
        return Math.max(0, Math.min(100, total / cores));
    }

    function readMemory() {
        const text = common.readTextFile("/proc/meminfo", "");
        const map = {};
        for (const line of text.split(/\r?\n/)) {
            const match = line.match(/^([^:]+):\s+(\d+)/);
            if (match) map[match[1]] = Number(match[2]) * 1024;
        }

        const total = map.MemTotal || 0;
        const available = map.MemAvailable || 0;
        const used = Math.max(0, total - available);
        const percent = total > 0 ? used / total * 100 : 0;

        return { total, used, percent };
    }

    function readDisk() {
        const result = common.run(["df", "-B1", "--output=size,used,pcent", "/"]);
        if (!result.ok) return { total: 0, used: 0, percent: 0 };

        const lines = result.stdout.split(/\r?\n/).filter(Boolean);
        const values = (lines[1] || "").trim().split(/\s+/);
        const total = Number(values[0]) || 0;
        const used = Number(values[1]) || 0;
        const percent = Number((values[2] || "0").replace("%", "")) || 0;

        return { total, used, percent };
    }

    function readUptimeSeconds() {
        const text = common.readTextFile("/proc/uptime", "0");
        return Number(text.split(/\s+/)[0]) || 0;
    }

    function readLocalIp() {
        const result = common.run(["hostname", "-I"]);
        if (!result.ok) return "Unavailable";
        const ips = result.stdout.split(/\s+/).filter(Boolean);
        return ips[0] || "Unavailable";
    }

    function setBar(bar, percent, label) {
        const p = Math.max(0, Math.min(100, Number(percent) || 0));
        bar.set_fraction(p / 100);
        bar.set_text(`${label}: ${p.toFixed(1)}%`);
    }

    function refresh() {
        const osRelease = common.parseOsRelease();
        const osName = osRelease.PRETTY_NAME || osRelease.NAME || "Unknown Linux";
        const kernelText = common.firstLine(common.run(["uname", "-r"]).stdout) || "Unknown";
        const archText = common.firstLine(common.run(["uname", "-m"]).stdout) || "Unknown";
        const cores = common.firstLine(common.run(["nproc"]).stdout) || "Unknown";

        const cpuPercent = readCpuUsagePercent();
        const memory = readMemory();
        const diskInfo = readDisk();

        hostname.set_label(`Hostname: ${GLib.get_host_name() || "Unknown"}`);
        os.set_label(`Operating System: ${osName}`);
        kernel.set_label(`Kernel: ${kernelText}`);
        arch.set_label(`Architecture: ${archText}`);

        cpuModel.set_label(`CPU: ${readCpuModel()}`);
        cpuUsage.set_label(`CPU Usage: ${cpuPercent.toFixed(1)}%`);
        cpuCores.set_label(`CPU Cores: ${cores}`);

        ram.set_label(`RAM: ${common.formatBytes(memory.total)} total`);
        ramUsage.set_label(
            `RAM Usage: ${common.formatBytes(memory.used)} / ${common.formatBytes(memory.total)} (${memory.percent.toFixed(1)}%)`
        );
        disk.set_label(
            `Disk Space: ${common.formatBytes(diskInfo.used)} / ${common.formatBytes(diskInfo.total)} (${diskInfo.percent.toFixed(0)}% used)`
        );

        setBar(cpuBar, cpuPercent, "CPU");
        setBar(ramBar, memory.percent, "RAM");
        setBar(diskBar, diskInfo.percent, "Disk");

        uptime.set_label(`Uptime: ${common.formatDuration(readUptimeSeconds())}`);
        currentUser.set_label(`Current User: ${GLib.get_user_name() || "Unknown"}`);
        desktop.set_label(
            `Desktop Environment: ${GLib.getenv("XDG_CURRENT_DESKTOP") || GLib.getenv("DESKTOP_SESSION") || "Unknown"}`
        );
        localIp.set_label(`Local IP: ${readLocalIp()}`);

        const now = GLib.DateTime.new_now_local();
        updatedLabel.set_label(`Last updated: ${now.format("%H:%M:%S")}`);
    }

    refreshButton.connect("clicked", refresh);

    let timerId = 0;

    function ensureTimer() {
        if (timerId) {
            GLib.source_remove(timerId);
            timerId = 0;
        }

        if (ctx.settings.autoRefreshSystemStats) {
            const seconds = Math.max(2, Number(ctx.settings.autoRefreshSeconds) || 5);
            timerId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, seconds, () => {
                refresh();
                return GLib.SOURCE_CONTINUE;
            });
        }
    }

    refresh();
    ensureTimer();

    return {
        widget: scroller,
        onShow() {
            ensureTimer();
            refresh();
        },
    };
}
