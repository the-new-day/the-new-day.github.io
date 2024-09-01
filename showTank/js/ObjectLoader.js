import * as _0x5bbf3c from 'three';
import { TDSLoader } from 'TDSLoader';
class ObjectLoader {
  constructor(_0x5614ed, _0x200c56) {
    this.texturePaths = _0x5614ed;
    this.modelPath = _0x200c56;
  }
  ["loadImageUsingFetch"](_0x413304) {
    return fetch(_0x413304).then(_0x8055e6 => {
      if (!_0x8055e6.ok) {
        return _0x8055e6.text().then(_0x8b973 => {
          throw new Error("Network response was not ok. Status: " + _0x8055e6.status + " " + _0x8055e6.statusText + ". Response: " + _0x8b973);
        });
      }
      return _0x8055e6.blob();
    }).then(_0x23a129 => {
      return new Promise((_0x12cada, _0x1d6b78) => {
        const _0xbfbfd0 = new Image();
        _0xbfbfd0.onload = () => _0x12cada(_0xbfbfd0);
        _0xbfbfd0.onerror = _0x1d6b78;
        _0xbfbfd0.src = URL.createObjectURL(_0x23a129);
      });
    });
  }
  ["loadImage"](_0x4f4b95) {
    return new Promise((_0x56ab7e, _0x4d829d) => {
      const _0x5634f7 = new Image();
      _0x5634f7.src = _0x4f4b95;
      _0x5634f7.onload = () => _0x56ab7e(_0x5634f7);
      _0x5634f7.onerror = _0x4d829d;
    });
  }
  ["loadTextures"]() {
    const {
      coloring: _0x448355,
      details: _0x34554c,
      alpha: _0x40b590,
      hardlight: _0x43764e
    } = this.texturePaths;
    return Promise.all([this.loadImageUsingFetch(_0x448355), this.loadImageUsingFetch(_0x34554c), this.loadImageUsingFetch(_0x40b590), this.loadImageUsingFetch(_0x43764e)]).then(([_0x226dff, _0x176632, _0x1f735c, _0x2b7fe4]) => {
      return this.mergeTextures(_0x226dff, _0x176632, _0x1f735c, _0x2b7fe4);
    });
  }
  ['mergeTextures'](_0x216f9f, _0x23b9a9, _0x5d261d, _0x5cff97) {
    const _0x44b16d = _0x23b9a9.width;
    const _0x56e338 = _0x23b9a9.height;
    const _0x445355 = document.createElement("canvas");
    const _0x4d953a = _0x445355.getContext('2d');
    _0x445355.width = _0x44b16d;
    _0x445355.height = _0x56e338;
    const _0x37588f = document.createElement("canvas");
    const _0xdef7f7 = _0x37588f.getContext('2d');
    _0x37588f.width = _0x44b16d;
    _0x37588f.height = _0x56e338;
    const _0xbbca3d = _0xdef7f7.createPattern(_0x216f9f, "repeat");
    _0xdef7f7.fillStyle = _0xbbca3d;
    _0xdef7f7.fillRect(0x0, 0x0, _0x44b16d, _0x56e338);
    _0x4d953a.drawImage(_0x37588f, 0x0, 0x0);
    _0x4d953a.globalCompositeOperation = "hard-light";
    _0x4d953a.drawImage(_0x5cff97, 0x0, 0x0, _0x44b16d, _0x56e338);
    const _0x1f3002 = this.mergeBitmapAlpha(_0x23b9a9, _0x5d261d);
    _0x4d953a.globalCompositeOperation = "source-over";
    _0x4d953a.drawImage(_0x1f3002, 0x0, 0x0);
    return _0x445355;
  }
  ['mergeBitmapAlpha'](_0x23cb49, _0x2aa8b1) {
    const _0x2f81c4 = _0x23cb49.width;
    const _0xca3b60 = _0x23cb49.height;
    const _0x622bf0 = document.createElement("canvas");
    const _0xe34758 = _0x622bf0.getContext('2d');
    _0x622bf0.width = _0x2f81c4;
    _0x622bf0.height = _0xca3b60;
    _0xe34758.drawImage(_0x23cb49, 0x0, 0x0);
    const _0x502d03 = _0xe34758.getImageData(0x0, 0x0, _0x2f81c4, _0xca3b60);
    const _0xf0c1cd = document.createElement('canvas').getContext('2d');
    _0xf0c1cd.canvas.width = _0x2aa8b1.width;
    _0xf0c1cd.canvas.height = _0x2aa8b1.height;
    _0xf0c1cd.drawImage(_0x2aa8b1, 0x0, 0x0);
    const _0x4088b9 = _0xf0c1cd.getImageData(0x0, 0x0, _0x2f81c4, _0xca3b60);
    for (let _0x4742f0 = 0x0; _0x4742f0 < _0x502d03.data.length; _0x4742f0 += 0x4) {
      _0x502d03.data[_0x4742f0 + 0x3] = _0x4088b9.data[_0x4742f0];
    }
    _0xe34758.putImageData(_0x502d03, 0x0, 0x0);
    return _0x622bf0;
  }
  ["loadModel"](_0xe9c041, _0xc892e7) {
    const _0x47368b = new TDSLoader();
    const _0x4c1c98 = new _0x5bbf3c.Texture(_0xe9c041);
    _0x4c1c98.needsUpdate = true;
    const _0xea92ad = new _0x5bbf3c.MeshBasicMaterial({
      'map': _0x4c1c98
    });
    _0x47368b.load(this.modelPath, _0x40c399 => {
      const _0x216dac = [];
      _0x40c399.traverse(_0x1e3e5d => {
        if (_0x1e3e5d.isMesh) {
          _0x1e3e5d.material = _0xea92ad;
          _0x1e3e5d.castShadow = true;
          _0x1e3e5d.receiveShadow = true;
          const _0x1a7be1 = new _0x5bbf3c.Box3().setFromObject(_0x1e3e5d);
          const _0x2ee6da = _0x1a7be1.max.z - _0x1a7be1.min.z;
          const _0x12ab44 = _0x1a7be1.max.y - _0x1a7be1.min.y;
          _0x1e3e5d.geometry.computeBoundingBox();
          _0x1e3e5d.geometry.center();
          _0x1e3e5d.geometry.translate(0x0, _0x12ab44 / 0x5, _0x2ee6da / 0x2);
          _0x216dac.push(_0x1e3e5d);
        }
      });
      if (_0xc892e7) {
        _0xc892e7(_0x216dac);
      }
    });
  }
  ['load'](_0x36db87) {
    this.loadTextures().then(_0x546f65 => {
      this.loadModel(_0x546f65, _0x36db87);
    })["catch"](_0x39cd62 => {
      console.error("Error loading resources:", _0x39cd62);
    });
  }
}
export { ObjectLoader };