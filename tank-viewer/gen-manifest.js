// Scan assets/ -> manifest.json. Run: node gen-manifest.js
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, 'assets');

function fileInfo(dir) {
  const files = fs.readdirSync(dir);
  const details = files.find(f => /^details\.(png|jpg)$/i.test(f)) || null;
  const lightmap = files.find(f => /^lightmap\.jpg$/i.test(f)) || null;
  const model = files.find(f => /\.3ds$/i.test(f)) || null;
  return { model, lightmap, details };
}

function scanItem(itemDir) {
  const entries = fs.readdirSync(itemDir, { withFileTypes: true });
  const modDirs = entries
    .filter(e => e.isDirectory() && /^m\d+$/i.test(e.name))
    .map(e => e.name)
    .sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));

  const mods = {};
  if (modDirs.length) {
    for (const m of modDirs) {
      mods[m] = fileInfo(path.join(itemDir, m));
      mods[m].dir = m; // sub-folder relative to item
    }
  } else {
    // flat item (no mod folders) -> single mod "m0" at item root
    mods['m0'] = fileInfo(itemDir);
    mods['m0'].dir = ''; // no sub-folder
  }
  return mods;
}

function scanCategory(cat) {
  const dir = path.join(ROOT, cat);
  const out = {};
  for (const name of fs.readdirSync(dir)) {
    const itemDir = path.join(dir, name);
    if (!fs.statSync(itemDir).isDirectory()) continue;
    out[name] = scanItem(itemDir);
  }
  return out;
}

function scanPaints() {
  const dir = path.join(ROOT, 'paints');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => /\.(jpg|png)$/i.test(f))
    .sort();
}

const manifest = {
  hulls: scanCategory('hulls'),
  turrets: scanCategory('turrets'),
  paints: scanPaints(),
};

fs.writeFileSync(
  path.join(__dirname, 'manifest.json'),
  JSON.stringify(manifest, null, 2)
);
console.log('manifest.json written:',
  Object.keys(manifest.hulls).length, 'hulls,',
  Object.keys(manifest.turrets).length, 'turrets,',
  manifest.paints.length, 'paints');
