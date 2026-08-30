const { Gtk, GLib } = imports.gi;
function setText(view, text) { view.get_buffer().set_text(String(text || ""), -1); }
function createPage(ctx, entry) {
    const { common, window } = ctx;
    const s = new Gtk.ScrolledWindow({ hexpand: true, vexpand: true });
    const page = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 14, hexpand: true });
    page.set_margin_top(24); page.set_margin_bottom(24); page.set_margin_start(28); page.set_margin_end(28);
    page.append(common.pageTitle(entry.name));
    page.append(common.infoLabel("Generate starter repository files and optionally create a GitHub repository with gh."));
    const c = common.card(); c.append(common.sectionTitle("Repository"));
    const name = new Gtk.Entry({ placeholder_text: "Repo name" });
    const desc = new Gtk.Entry({ placeholder_text: "Description" });
    const lang = new Gtk.ComboBoxText(); ["Java","JavaScript","Python","Rust","Go","Kotlin","Lua","C","C++","Other"].forEach(x=>lang.append_text(x)); lang.set_active(0);
    c.append(common.infoLabel("Name")); c.append(name); c.append(common.infoLabel("Description")); c.append(desc); c.append(common.infoLabel("Language")); c.append(lang); page.append(c);
    const opts = common.card(); opts.append(common.sectionTitle("Files"));
    const readme = new Gtk.CheckButton({ label: "README.md", active: true });
    const gi = new Gtk.CheckButton({ label: ".gitignore", active: true });
    const contrib = new Gtk.CheckButton({ label: "CONTRIBUTING.md" });
    const change = new Gtk.CheckButton({ label: "CHANGELOG.md" }); [readme,gi,contrib,change].forEach(x=>opts.append(x)); page.append(opts);
    const buttons = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 8 });
    const previewBtn = new Gtk.Button({ label: "Preview" });
    const filesBtn = new Gtk.Button({ label: "Create Files" }); filesBtn.add_css_class("primary");
    const ghBtn = new Gtk.Button({ label: "Create GitHub Repo" }); [previewBtn,filesBtn,ghBtn].forEach(x=>buttons.append(x)); page.append(buttons);
    const status = common.infoLabel(""); status.add_css_class("muted"); page.append(status);
    const out = new Gtk.TextView({ editable: false, monospace: true, wrap_mode: Gtk.WrapMode.WORD_CHAR, vexpand: true });
    const os = new Gtk.ScrolledWindow({ min_content_height: 320, vexpand: true }); os.set_child(out); page.append(os); s.set_child(page);
    let projectDir = null;
    function safe() { return name.get_text().trim().replace(/[^A-Za-z0-9._-]/g, "-"); }
    function ignoreFor(l) { return ({Java:"*.class\n*.jar\nbuild/\ntarget/\n.idea/\n",JavaScript:"node_modules/\ndist/\n.env\n",Python:"__pycache__/\n*.pyc\n.venv/\n.env\n",Rust:"target/\n",Go:"bin/\n*.test\n",Kotlin:"*.class\n*.jar\nbuild/\n.gradle/\n"})[l] || "build/\ndist/\n.env\n"; }
    function generated() {
        const n=safe(), d=desc.get_text().trim(), l=lang.get_active_text()||"Other", r={};
        if (readme.get_active()) r["README.md"]=`# ${n}\n\n${d||"Project description."}\n\n## Built With\n\n${l}\n\n## Installation\n\n\`\`\`bash\ngit clone https://github.com/YOUR_USERNAME/${n}.git\ncd ${n}\n\`\`\`\n`;
        if (gi.get_active()) r[".gitignore"]=ignoreFor(l);
        if (contrib.get_active()) r["CONTRIBUTING.md"]=`# Contributing\n\n1. Fork the repo\n2. Create a branch\n3. Make changes\n4. Open a pull request\n`;
        if (change.get_active()) r["CHANGELOG.md"]="# Changelog\n\n## 0.1.0\n\n- Initial release\n";
        return r;
    }
    function preview(){ if(!safe()){setText(out,"Enter a repo name first.");return;} setText(out,Object.entries(generated()).map(([f,t])=>`===== ${f} =====\n${t}`).join("\n\n")); }
    function chooseFolder(cb){ const d=new Gtk.FileChooserNative({title:"Choose parent folder",transient_for:window,action:Gtk.FileChooserAction.SELECT_FOLDER,accept_label:"Choose",cancel_label:"Cancel"}); d.connect("response",(_,r)=>{if(r===Gtk.ResponseType.ACCEPT){const f=d.get_file();cb(f?f.get_path():null);}d.destroy();});d.show(); }
    function writeProject(parent){ const n=safe(); if(!n)return null; const dir=GLib.build_filenamev([parent,n]); GLib.mkdir_with_parents(dir,0o755); for(const [f,t] of Object.entries(generated())) common.writeTextFile(GLib.build_filenamev([dir,f]),t); projectDir=dir; status.set_label(`Created: ${dir}`); return dir; }
    previewBtn.connect("clicked",preview);
    filesBtn.connect("clicked",()=>chooseFolder(p=>p&&writeProject(p)));
    ghBtn.connect("clicked",()=>{ const go=dir=>{ if(!dir)return; common.run(["git","init",dir]); common.run(["git","-C",dir,"add","."]); common.run(["git","-C",dir,"commit","-m","Initial commit"]); const r=common.run(["gh","repo","create",safe(),"--public","--source",dir,"--remote","origin","--push"]); status.set_label(r.ok?"GitHub repo created.":(r.stderr||r.stdout||"gh failed")); }; if(projectDir)go(projectDir); else chooseFolder(p=>{if(p)go(writeProject(p));}); });
    preview(); return s;
}
var metadata={id:"ghgen",name:"GH Gen",icon:"🐙"};
