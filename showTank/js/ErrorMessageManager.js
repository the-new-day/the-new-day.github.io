var _0x3d1008 = function () {
    var _0xa59151 = true;
    return function (_0x29fd90, _0x11f288) {
      var _0x3f39f1 = _0xa59151 ? function () {
        if (_0x11f288) {
          var _0x154c5f = _0x11f288.apply(_0x29fd90, arguments);
          _0x11f288 = null;
          return _0x154c5f;
        }
      } : function () {};
      _0xa59151 = false;
      return _0x3f39f1;
    };
  }();
  var _0x4c0da1 = _0x3d1008(this, function () {
    return _0x4c0da1.toString().search("(((.+)+)+)+$").toString().constructor(_0x4c0da1).search("(((.+)+)+)+$");
  });
  _0x4c0da1();
  var _0x2d53ee = function () {
    var _0x124979 = true;
    return function (_0x483888, _0x16943d) {
      var _0x3b1700 = _0x124979 ? function () {
        if (_0x16943d) {
          var _0x2f9bb2 = _0x16943d.apply(_0x483888, arguments);
          _0x16943d = null;
          return _0x2f9bb2;
        }
      } : function () {};
      _0x124979 = false;
      return _0x3b1700;
    };
  }();
  var _0x3947dd = _0x2d53ee(this, function () {
    var _0x4a9580;
    try {
      var _0x5b4b81 = Function("return (function() {}.constructor(\"return this\")( ));");
      _0x4a9580 = _0x5b4b81();
    } catch (_0x441b9c) {
      _0x4a9580 = window;
    }
    var _0x355be1 = _0x4a9580.console = _0x4a9580.console || {};
    var _0x155156 = ['log', 'warn', "info", 'error', "exception", 'table', "trace"];
    for (var _0x17ef28 = 0x0; _0x17ef28 < _0x155156.length; _0x17ef28++) {
      var _0x2df68c = _0x2d53ee.constructor.prototype.bind(_0x2d53ee);
      var _0x44e6e8 = _0x155156[_0x17ef28];
      var _0x96fa62 = _0x355be1[_0x44e6e8] || _0x2df68c;
      _0x2df68c.__proto__ = _0x2d53ee.bind(_0x2d53ee);
      _0x2df68c.toString = _0x96fa62.toString.bind(_0x96fa62);
      _0x355be1[_0x44e6e8] = _0x2df68c;
    }
  });
  _0x3947dd();
  class ErrorMessageManager {
    static ["onError"](_0x42b872) {
      document.getElementsByClassName("user-info")[0x0].style.display = "none";
      document.getElementsByClassName("error-block")[0x0].style.display = "flex";
      document.getElementsByClassName("error-text")[0x0].innerHTML = _0x42b872;
    }
  }
  export { ErrorMessageManager };