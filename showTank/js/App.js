import * as _0x5af0ad from 'three';
import 'TDSLoader';
import './ObjectLoader.js';
import { Tank } from './Tank.js';
import { ErrorMessageManager } from './ErrorMessageManager.js';
class App {
  constructor(userSettings) {
    this.scene = null;
    this.camera = null;
    this.rotationSpeed = 0.001;
    this.renderer = null;
    this.turretMountPoint = null;
    this.initCamera();
    this.createPlane();
    if (!userSettings) {
      return;
    }
    try {
      this.userObject = userSettings;
      this.tank = new Tank(userSettings.tank);
      this.initTankView();
    } catch (err) {
      console.log(err);
      ErrorMessageManager.onError("CONNECTION ERROR");
    }
  }
  ["initTankView"]() {
    this.tank.load((_0x48ebbc, _0xdd7155) => {
      this.initHull();
    });
  }
  ["initTurret"]() {
    const turret = this.tank.turretMesh;
    turret.position.x = 0x0;
    turret.position.y = this.turretMountPoint.y;
    turret.position.z = this.turretMountPoint.z;
    turret.receiveShadow = true;
    turret.castShadow = true;
    this.scene.add(turret);
  }
  ["initHull"]() {
    const _0x386680 = this.tank.hullMesh;
    const _0x5e739e = this.tank.mountTurretMesh;
    var _0x462923 = _0x386680.position.clone();
    var _0x3f8a58 = _0x5e739e.position.clone();
    this.turretMountPoint = _0x3f8a58.sub(_0x462923).clone();
    _0x386680.position.x = 0x0;
    _0x386680.position.y = 0x0;
    _0x386680.position.z = 0x0;
    this.scene.add(_0x386680);
    this.createShadow(_0x386680);
    this.initTurret();
  }
  ["createShadow"](_0x205de9) {
    var _0x446883 = document.createElement("canvas");
    var _0x331be7 = _0x446883.getContext('2d');
    _0x205de9.geometry.computeBoundingBox();
    var _0x4512f3 = _0x205de9.geometry.boundingBox.clone();
    var _0x6696bf = _0x4512f3.max.x - _0x4512f3.min.x + 0x96;
    var _0xd5548e = _0x4512f3.max.y - _0x4512f3.min.y + 0x50;
    _0x446883.width = _0x6696bf + 120;
    _0x446883.height = _0xd5548e + 120;
    _0x331be7.globalCompositeOperation = 'multiply';
    _0x331be7.filter = "blur(30px)";
    _0x331be7.globalAlpha = 0.85;
    _0x331be7.beginPath();
    _0x331be7.rect(60, 60, _0x6696bf, _0xd5548e);
    _0x331be7.fillStyle = "black";
    _0x331be7.fill();
    var _0x375a6e = new _0x5af0ad.CanvasTexture(_0x446883);
    var _0x5f3199 = new _0x5af0ad.PlaneGeometry(_0x6696bf, _0xd5548e, 0xf, 0xf);
    var _0x2d5527 = new _0x5af0ad.MeshPhongMaterial({
      'map': _0x375a6e,
      'depthTest': true,
      'transparent': true
    });
    var _0x80009f = new _0x5af0ad.Mesh(_0x5f3199, _0x2d5527);
    _0x80009f.rotation.set(Math.PI + Math.PI / 0x2, 0x0, 0x0);
    _0x80009f.position.set(0x0, 0x1, 0x0);
    this.scene.add(_0x80009f);
  }
  ["initCamera"]() {
    var _0x2d8151 = document.getElementById("canvas");
    _0x2d8151.setAttribute("width", 0x2ee);
    _0x2d8151.setAttribute("height", 0xf0);
    this.renderer = new _0x5af0ad.WebGLRenderer({
      'canvas': _0x2d8151
    });
    this.renderer.setClearColor(0x0);
    this.renderer.shadowMap.type = _0x5af0ad.PCFSoftShadowMap;
    this.scene = new _0x5af0ad.Scene();
    this.camera = new _0x5af0ad.PerspectiveCamera(0x28, 3.125, 0.1, 0x7a120);
    this.camera.position.set(-0x384, 0x1f8, -0x96);
    this.camera.lookAt(new _0x5af0ad.Vector3(0x0, 0x1e, 0x0));
    var _0x243f7c = new _0x5af0ad.AmbientLight(0xffffff);
    this.scene.add(_0x243f7c);
    requestAnimationFrame(() => this.render());
  }
  ["render"]() {
    requestAnimationFrame(() => this.render());
    var _0x444af2 = this.camera.position.x;
    var _0x321362 = this.camera.position.z;
    this.camera.position.x = _0x444af2 * Math.cos(this.rotationSpeed) + _0x321362 * Math.sin(this.rotationSpeed);
    this.camera.position.z = _0x321362 * Math.cos(this.rotationSpeed) - _0x444af2 * Math.sin(this.rotationSpeed);
    this.camera.lookAt(new _0x5af0ad.Vector3(0x0, 0x3c, 0x0));
    this.renderer.render(this.scene, this.camera);
  }
  ["createPlane"]() {
    var _0x1148df = new _0x5af0ad.PlaneGeometry(0x2af8, 0x2af8, 0x28, 0x28);
    var _0x5de553 = new _0x5af0ad.TextureLoader();
    var _0x415092 = _0x5de553.load("img/ground.jpg");
    _0x415092.wrapS = _0x5af0ad.RepeatWrapping;
    _0x415092.wrapT = _0x5af0ad.RepeatWrapping;
    _0x415092.repeat.set(0x5, 0x5);
    var _0x308cc6 = new _0x5af0ad.MeshBasicMaterial({
      'map': _0x415092
    });
    var _0x260b1a = new _0x5af0ad.Mesh(_0x1148df, _0x308cc6);
    _0x260b1a.rotation.set(Math.PI + Math.PI / 0x2, 0x0, 0x0);
    _0x260b1a.position.set(0x0, 0x0, 0x0);
    this.scene.add(_0x260b1a);
  }
}
export { App };