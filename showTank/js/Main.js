import { App } from './App.js';
import { ErrorMessageManager } from './ErrorMessageManager.js';
window.onload = function () {
  const url = new URL(window.location.href);
  const refId = url.searchParams.get("hash");
  loadXml(refId);
};
function loadXml(refId) {
  const link = "https://s.pro-tanki.com/referer/" + refId + ".xml";
  fetch(link, {
    'method': "GET"
  }).then(response => {
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    return response.text();
  }).then(xml => {
    const parser = new DOMParser();
    const parsedXml = parser.parseFromString(xml, 'application/xml');
    const parsedUser = parsedXml.getElementsByTagName("user")[0];
    const callsign = parsedUser.getElementsByTagName("callsign")[0].textContent;
    const rank = parsedUser.getElementsByTagName("rank")[0].textContent;
    const rankId = parsedUser.getElementsByTagName("rankId")[0].textContent;
    const scores = parsedUser.getElementsByTagName("scores")[0].textContent;
    const position = parsedUser.getElementsByTagName("position")[0].textContent;
    const parsedTank = parsedUser.getElementsByTagName("tank")[0];
    const turret = parsedTank.getElementsByTagName("turret")[0].textContent;
    const hull = parsedTank.getElementsByTagName("hull")[0].textContent;
    const coloring = parsedTank.getElementsByTagName("coloring")[0].textContent;
    const userSettings = {
      'callsign': callsign,
      'rank': rank,
      'rankId': rankId,
      'scores': scores,
      'position': position,
      'tank': {
        'turret': turret,
        'hull': hull,
        'coloring': coloring
      }
    };
    document.getElementsByClassName("rank_ico")[0].src = 'http://s.pro-tanki.com/rankicons/' + rankId + ".png";
    document.getElementsByClassName("player-rank")[0].innerHTML = rank;
    document.getElementsByClassName('userId')[0].innerHTML = callsign;
    document.getElementsByClassName("score")[0].innerHTML = "Score: " + numToString(scores);
    new App(userSettings);
    const banner = document.getElementById('banner');
    banner.addEventListener("mouseenter", () => {
      document.getElementsByClassName("user-info")[0].style.display = "none";
      document.getElementsByClassName("invite-block")[0].style.display = "flex";
    });
    banner.addEventListener('mouseleave', () => {
      document.getElementsByClassName("user-info")[0].style.display = "flex";
      document.getElementsByClassName('invite-block')[0].style.display = "none";
    });
    banner.addEventListener("click", () => {
      window.open("https://start.protanki-game.com/?refId=" + refId, "_blank");
    });
  })["catch"](_0x236915 => {
    console.error(_0x236915);
    ErrorMessageManager.onError("UNKNOWN USER");
    new App();
  });
}
function numToString(_0x4a0180) {
  let _0x40c1c0 = new Array();
  var _0x259513 = Math.round(_0x4a0180).toString();
  var _0x549767 = _0x259513.length - parseInt(_0x259513.length / 0x3) * 0x3;
  var _0x33d8cd = 0;
  if (_0x549767 > 0) {
    _0x259513 = (_0x549767 == 0x1 ? "  " : " ") + _0x259513;
  }
  for (_0x33d8cd = 0; _0x33d8cd < _0x259513.length; _0x33d8cd += 0x3) {
    _0x40c1c0.push(_0x259513.substr(_0x33d8cd, 0x3));
  }
  _0x259513 = _0x40c1c0.join(" ");
  if (_0x549767 > 0) {
    _0x259513 = _0x259513.substr(0x3 - _0x549767);
  }
  return _0x259513 + '';
}