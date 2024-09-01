import * as _0x3862f7 from 'three';
import { TDSLoader } from 'TDSLoader';
class Tank {
constructor(tankInfo) {
    this.tankInfo = tankInfo;
    this.coloringPath = this.tankInfo.coloring + 'image.jpg';
    this.hullResourcesPath = {
        'details': this.tankInfo.hull + "details.jpg",
        'alpha': this.tankInfo.hull + "details_alpha.jpg",
        'lightmap': this.tankInfo.hull + "lightmap.jpg",
        'mesh': this.tankInfo.hull + "object.3ds"
    };
    this.turretResourcesPath = {
        'details': this.tankInfo.turret + "details.jpg",
        'alpha': this.tankInfo.turret + "details_alpha.jpg",
        'lightmap': this.tankInfo.turret + 'lightmap.jpg',
        'mesh': this.tankInfo.turret + "object.3ds"
    };
    this.hullMesh = null;
    this.turretMesh = null;
    this.mountTurretMesh = null;
}
['load'](_0x1d6733) {
    this.loadTankPart(this.hullResourcesPath, _2ef6d3 => {
        this.loadTankPart(this.turretResourcesPath, _0x3cc386 => {
            _0x1d6733();
        });
    });
}
["loadTankPart"](_0x1b0dab, _0xbe1d23) {
    this.loadTextures(_0x1b0dab).then(_0xf5901 => {
        this.loadModel(_0x1b0dab, _0xf5901, _0xbe1d23);
    })['catch'](_0x1f5363 => {
        console.error("Error loading resources:", _0x1f5363);
    });
}
["loadModel"](_0x129e12, _0xc43460, _0x45a895) {
    const _0x45b816 = new TDSLoader();
    const _0x192a8f = new _0x3862f7.Texture(_0xc43460);
    _0x192a8f.needsUpdate = true;
    const _2859cd = new _0x3862f7.MeshBasicMaterial({
    'map': _0x192a8f
    });
    _0x45b816.load(_0x129e12.mesh, _2899f2 => {
    _2899f2.traverse(_0x196076 => {
        if (_0x196076.isMesh) {
        const _523565 = _0x196076.name.toLowerCase();
        if (_523565 === "hull" || _523565 === "turret" || _523565 === 'mount') {
            _0x196076.material = _2859cd;
            _0x196076.castShadow = true;
            _0x196076.receiveShadow = true;
            const _0x4c44d7 = new _0x3862f7.Box3().setFromObject(_0x196076);
            const _0x11d72c = _0x4c44d7.max.z - _0x4c44d7.min.z;
            const _0x181b63 = _0x4c44d7.max.y - _0x4c44d7.min.y;
            _0x196076.geometry.computeBoundingBox();
            _0x196076.geometry.center();
            _0x196076.rotation.set(-Math.PI / 2, 0, Math.PI);
            switch (_523565) {
                case "hull":
                    _0x196076.geometry.translate(0, 0, _0x11d72c / 2);
                    this.hullMesh = _0x196076;
                    break;
                case "turret":
                    _0x196076.geometry.translate(0, _0x181b63 / 5, _0x11d72c / 2);
                    this.turretMesh = _0x196076;
                    break;
                case 'mount':
                    _0x196076.geometry.translate(0, 0, _0x11d72c / 2);
                    this.mountTurretMesh = _0x196076;
                    break;
            }
        }
        }
    });
    if (_0x45a895) {
        _0x45a895(null);
    }
    });
}
["loadTextures"](_0x192a1f) {
    const {
    details: _0x346274,
    alpha: _5aca66,
    lightmap: _2ae41d
    } = _0x192a1f;
    return Promise.all([this.loadImageUsingFetch(this.coloringPath), this.loadImageUsingFetch(_0x346274), this.loadImageUsingFetch(_5aca66), this.loadImageUsingFetch(_2ae41d)]).then(([_0xcbb8ed, _0x3ce079, _0x1ccff4, _0x1fc1e7]) => {
    return this.mergeTextures(_0xcbb8ed, _0x3ce079, _0x1ccff4, _0x1fc1e7);
    });
}
['loadImageUsingFetch'](_0x1d7cde) {
    return fetch(_0x1d7cde).then(_0x1a0de6 => {
    if (!_0x1a0de6.ok) {
        return _0x1a0de6.text().then(_0x3e5f3c => {
        throw new Error("Network response was not ok. Status: " + _0x1a0de6.status + " " + _0x1a0de6.statusText + ". Response: " + _0x3e5f3c);
        });
    }
    return _0x1a0de6.blob();
    }).then(_275566 => {
    return new Promise((_0x1a9fc5, _0x30b646) => {
        const _23c324 = new Image();
        _23c324.onload = () => {
        URL.revokeObjectURL(_23c324.src);
        _0x1a9fc5(_23c324);
        };
        _23c324.onerror = _0x30b646;
        _23c324.src = URL.createObjectURL(_275566);
    });
    });
}
["mergeTextures"](_0x42716a, _0x3a0682, _511823, _550059) {
    const _0x444a43 = _0x3a0682.width;
    const _0x393dd8 = _0x3a0682.height;
    const _0x1ccef9 = document.createElement('canvas');
    const _0x43712a = _0x1ccef9.getContext('2d');
    _0x1ccef9.width = _0x444a43;
    _0x1ccef9.height = _0x393dd8;
    const _521567 = document.createElement("canvas");
    const _0x424f03 = _521567.getContext('2d');
    _521567.width = _0x444a43;
    _521567.height = _0x393dd8;
    const _0x1e968f = _0x424f03.createPattern(_0x42716a, "repeat");
    _0x424f03.fillStyle = _0x1e968f;
    _0x424f03.fillRect(0, 0, _0x444a43, _0x393dd8);
    _0x43712a.drawImage(_521567, 0, 0);
    _0x43712a.globalCompositeOperation = "hard-light";
    _0x43712a.drawImage(_550059, 0, 0, _0x444a43, _0x393dd8);
    const _0x354eaf = this.mergeBitmapAlpha(_0x3a0682, _511823);
    _0x43712a.globalCompositeOperation = "source-over";
    _0x43712a.drawImage(_0x354eaf, 0, 0);
    return _0x1ccef9;
}
["mergeBitmapAlpha"](_0xae0e0e, _204384) {
    const _0x1bbcd2 = _0xae0e0e.width;
    const _0x11b7b5 = _0xae0e0e.height;
    const _0x3d5774 = document.createElement("canvas");
    const _0x4be580 = _0x3d5774.getContext('2d');
    _0x3d5774.width = _0x1bbcd2;
    _0x3d5774.height = _0x11b7b5;
    _0x4be580.drawImage(_0xae0e0e, 0, 0);
    const _0x4910bf = _0x4be580.getImageData(0, 0, _0x1bbcd2, _0x11b7b5);
    const _0x172b47 = document.createElement("canvas").getContext('2d');
    _0x172b47.canvas.width = _204384.width;
    _0x172b47.canvas.height = _204384.height;
    _0x172b47.drawImage(_204384, 0, 0);
    const _0x3d3341 = _0x172b47.getImageData(0, 0, _0x1bbcd2, _0x11b7b5);
    for (let _0x732901 = 0; _0x732901 < _0x4910bf.data.length; _0x732901 += 0x4) {
    _0x4910bf.data[_0x732901 + 0x3] = _0x3d3341.data[_0x732901];
    }
    _0x4be580.putImageData(_0x4910bf, 0, 0);
    return _0x3d5774;
}
}
export { Tank };