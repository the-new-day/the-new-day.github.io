import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TDSLoader } from 'three/addons/loaders/TDSLoader.js';

const $ = id => document.getElementById(id);
const status = msg => { $('status').textContent = msg || ''; };

// --- scene setup ---
const view = $('view');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 5000);
camera.position.set(250, 180, 250);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
view.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 30, 0);

// lights
scene.add(new THREE.AmbientLight(0xffffff, 0.9));
const key = new THREE.DirectionalLight(0xffffff, 1.0);
key.position.set(200, 400, 200);
scene.add(key);
const fill = new THREE.DirectionalLight(0xffffff, 0.4);
fill.position.set(-200, 100, -200);
scene.add(fill);

// grid floor
//scene.add(new THREE.GridHelper(600, 20, 0x444444, 0x333333));

function resize() {
  const w = view.clientWidth, h = view.clientHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

(function loop() {
  requestAnimationFrame(loop);
  controls.update();
  renderer.render(scene, camera);
})();

// --- model loading ---
const tdsLoader = new TDSLoader();
const texLoader = new THREE.TextureLoader();

let manifest = null;
let tankObj = null;
let framed = false; // only frame the camera once, not on every part swap

function path(cat, name, mod, file) {
  const dir = manifest[cat][name][mod].dir;
  return dir ? `assets/${cat}/${name}/${dir}/${file}` : `assets/${cat}/${name}/${file}`;
}

// Surface = paint * lightmap, then details.png layered on top (same UV),
// like Photoshop. Photoshop blends in gamma (sRGB) space, so we keep textures
// raw (no sRGB->linear decode), combine in sRGB, then convert to linear so the
// renderer's output encode reproduces the exact same pixels. Unlit.
// paint is an optional tiling colormap (white = no tint = original look).
function makeMaterial(light, details, paint) {
  const mat = new THREE.MeshBasicMaterial({ map: light, color: 0xffffff });
  mat.customProgramCacheKey = () => `tank-${!!details}-${!!paint}`;
  mat.onBeforeCompile = shader => {
    let head = '', code = '';
    if (paint) {
      // paint is pre-tiled onto a lightmap-sized canvas, so it shares the exact
      // same UV/orientation as the lightmap — just sample at vMapUv.
      shader.uniforms.uPaint = { value: paint };
      head += 'uniform sampler2D uPaint;\n';
      // modulate-2x: paint * lightmap * 2 (mid-gray lightmap = neutral)
      code += 'diffuseColor.rgb *= texture2D( uPaint, vMapUv ).rgb * 2.0;\n';
    }
    if (details) {
      shader.uniforms.uDetails = { value: details };
      head += 'uniform sampler2D uDetails;\n';
      code += `vec4 dt = texture2D( uDetails, vMapUv );
         diffuseColor.rgb = mix( diffuseColor.rgb, dt.rgb, dt.a ); // details over\n`;
    }
    shader.fragmentShader = head + shader.fragmentShader.replace(
      '#include <map_fragment>',
      `#include <map_fragment>
       ${code}
       diffuseColor.rgb = pow( diffuseColor.rgb, vec3( 2.2 ) );    // sRGB -> linear for output`);
  };
  return mat;
}

// load one .3ds and texture it
async function loadPart(cat, name, mod, paintImg) {
  const info = manifest[cat][name][mod];
  const obj = await new Promise((resolve, reject) =>
    tdsLoader.load(path(cat, name, mod, info.model), resolve, undefined, reject));

  // keep raw (no sRGB decode) — blending happens in sRGB space, see makeMaterial
  const light = info.lightmap
    ? await texLoader.loadAsync(path(cat, name, mod, info.lightmap)) : null;
  const details = info.details
    ? texLoader.load(path(cat, name, mod, info.details)) : null;

  const paint = (paintImg && light) ? tilePaint(paintImg, light.image) : null;

  obj.traverse(c => { if (c.isMesh) c.material = makeMaterial(light, details, paint); });
  return obj;
}

// Tile the paint colormap, at its native pixel size, across a canvas the size
// of this part's lightmap. The result is a texture in the same pixel/UV space
// as the lightmap — no flips, no UV scaling. Primitive "repeat line by line".
function tilePaint(paintImg, lightImg) {
  const canvas = document.createElement('canvas');
  canvas.width = lightImg.width;
  canvas.height = lightImg.height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = ctx.createPattern(paintImg, 'repeat');
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const tex = new THREE.CanvasTexture(canvas); // flipY default true, matches lightmap
  return tex;
}

// Load a paint colormap image. Returns the HTMLImageElement or null.
async function loadPaint(file) {
  if (!file) return null;
  const tex = await texLoader.loadAsync(`assets/paints/${file}`);
  return tex.image;
}

function findMesh(obj, re) {
  let mesh = null;
  obj.traverse(c => { if (c.isMesh && re.test(c.name)) mesh = c; });
  return mesh;
}
// TDSLoader stores mesh.position with Y/Z swapped vs the (Z-up) geometry frame.
// Undo that so a pivot reads in the same frame as Box3 centers.
function unswap(p) {
  return new THREE.Vector3(p.x, p.z, p.y);
}
// Helper/collision meshes, not part of the visible model:
// Box* (collision hulls), fmnt (fire mount), muzzle* (shell spawn point),
// mount (hull socket).
const HELPER_RE = /^(box|fmnt|muzzle|mount)/i;
function hideHelpers(obj) {
  obj.traverse(c => { if (c.isMesh && HELPER_RE.test(c.name)) c.visible = false; });
}
// bounding box over visible meshes only (Box3.setFromObject ignores the
// visible flag, so roll our own — and refresh world matrices first).
function visibleBox(obj) {
  obj.updateWorldMatrix(true, true);
  const b = new THREE.Box3();
  obj.traverse(c => { if (c.isMesh && c.visible) b.expandByObject(c); });
  return b;
}

// frame the tank in view
function fitCamera() {
  if (!tankObj) return;
  const box = visibleBox(tankObj);
  if (box.isEmpty()) return;
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const radius = Math.max(size.x, size.y, size.z);
  const dist = radius / Math.tan((camera.fov * Math.PI / 180) / 2) * 0.65;
  controls.target.copy(center);
  camera.position.set(center.x + dist, center.y + dist * 0.6, center.z + dist);
  camera.near = dist / 100;
  camera.far = dist * 100;
  camera.updateProjectionMatrix();
  controls.update();
}

async function rebuild() {
  status('loading...');
  const hull = $('hull').value, hullMod = $('hullMod').value;
  const turret = $('turret').value, turretMod = $('turretMod').value;
  try {
    const paint = await loadPaint($('paint').value); // '' = none
    const [h, t] = await Promise.all([
      loadPart('hulls', hull, hullMod, paint),
      loadPart('turrets', turret, turretMod, paint),
    ]);

    if (tankObj) scene.remove(tankObj);

    // drop collision/marker meshes before measuring & assembling
    hideHelpers(h);
    hideHelpers(t);

    // Models load Z-up: [x = width, y = depth/forward, z = height].
    // Connect the hull 'mount' socket to the turret's rotation axis (its pivot).
    // - depth (y): turret PIVOT, not geom center -> barrel points forward, body
    //   not shoved backward. (mesh.position is y/z-swapped, so unswap it.)
    // - width (x): turret geom center -> stays centered even if a model's pivot
    //   is offset sideways (e.g. smoky).
    // - height (z): turret base rests on hull top.
    const mountMesh = findMesh(h, /^mount/i);
    const turretMesh = findMesh(t, /^turret$/i);
    if (mountMesh && turretMesh) {
      const hullTopZ = new THREE.Box3().setFromObject(findMesh(h, /^hull$/i) || h).max.z;
      const tGeom = new THREE.Box3().setFromObject(turretMesh).getCenter(new THREE.Vector3());
      // base from visible meshes only (collision boxes can hang below the body)
      const tBaseZ = visibleBox(t).min.z;
      const tPivot = unswap(turretMesh.position);   // rotation axis (geom frame)
      const mPivot = unswap(mountMesh.position);     // socket point (geom frame)

      const anchor = new THREE.Vector3(tGeom.x, tPivot.y, tBaseZ);
      const target = new THREE.Vector3(mPivot.x, mPivot.y, hullTopZ);
      t.position.add(target.sub(anchor));
    }

    // assemble, then rotate 3ds Z-up -> Y-up
    const tank = new THREE.Group();
    tank.add(h, t);
    tank.rotation.x = -Math.PI / 2;
    scene.add(tank);

    // center on grid X/Z, sit on ground (min.y = 0)
    const box = visibleBox(tank);
    const c = box.getCenter(new THREE.Vector3());
    tank.position.x -= c.x;
    tank.position.z -= c.z;
    tank.position.y -= box.min.y;

    tankObj = tank;
    if (!framed) { fitCamera(); framed = true; } // keep user's view on swaps
    status('');
  } catch (e) {
    console.error(e);
    status('load failed: ' + (e.message || e));
  }
}

// --- UI ---
function fill_select(sel, items) {
  sel.innerHTML = items.map(v => `<option value="${v}">${v}</option>`).join('');
}
function modsOf(cat, name) {
  return Object.keys(manifest[cat][name]).sort();
}
function refreshMods() {
  fill_select($('hullMod'), modsOf('hulls', $('hull').value));
  fill_select($('turretMod'), modsOf('turrets', $('turret').value));
}

async function init() {
  manifest = await fetch('manifest.json').then(r => r.json());

  fill_select($('hull'), Object.keys(manifest.hulls).sort());
  fill_select($('turret'), Object.keys(manifest.turrets).sort());
  // paint: 'None' (value '') + colormaps, labels without extension
  $('paint').innerHTML = '<option value="">None</option>' +
    (manifest.paints || []).map(f =>
      `<option value="${f}">${f.replace(/\.[^.]+$/, '')}</option>`).join('');
  refreshMods();

  $('hull').onchange = () => { fill_select($('hullMod'), modsOf('hulls', $('hull').value)); rebuild(); };
  $('turret').onchange = () => { fill_select($('turretMod'), modsOf('turrets', $('turret').value)); rebuild(); };
  $('hullMod').onchange = rebuild;
  $('turretMod').onchange = rebuild;
  $('paint').onchange = rebuild;

  rebuild();
}

init().catch(e => status('init failed: ' + e.message));
