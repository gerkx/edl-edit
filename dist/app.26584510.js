// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  return newRequire;
})({"javascript/app.js":[function(require,module,exports) {
// const util = require('./utils/util');
// const fileIn = require('./components/file-in');
var startTime = "00:00:00:00";
var fps = 25;
var dropArea = document.querySelector('.edl__file-zone');
var manualFile = document.getElementById('file-in');
var link = document.getElementById("file");
var dropped = 0;
dropArea.addEventListener("dragover", function (e) {
  e.preventDefault();
  e.stopPropagation();
  dropArea.classList.add('edl__file-zone--active');
});
dropArea.addEventListener("dragleave", function (e) {
  e.preventDefault();
  e.stopPropagation();
  dropArea.classList.remove('edl__file-zone--active'); // dropped = 0;
});
dropArea.addEventListener("drop", function (e) {
  e.preventDefault();
  e.stopPropagation();
  dropArea.classList.remove('edl__file-zone--active');
  var file = e.dataTransfer.files[0];
  dropped += 1;
  fileChecker(file); // dropped = 0;
});
link.addEventListener("change", function (e) {
  e.preventDefault();
  e.stopPropagation();
  var file = e.srcElement.files[0]; // console.log(link.value)
  // const file = e.dataTransfer.files[0];
  // console.log(file);

  dropped += 1;
  fileChecker(file);
});

function fileChecker(file) {
  var fileSplit = file.name.split(".");
  var ext = fileSplit[fileSplit.length - 1];

  if (ext !== "edl") {
    alert("Elige un EDL, por favor");
  }

  if (dropped == 1) {
    // alert("file dropped");
    var fileName = file.name;
    var read = new FileReader();

    read.onload = function () {
      // updateButton(fileName);
      var content = read.result.split("\n").map(function (line, idx, arr) {
        if (idx > 1 && arr[idx - 1].length <= 1) {
          return offsetSourceClipTC(line);
        } else {
          return line;
        }
      }).reduce(function (accum, val) {
        return accum += val + "\n";
      }, "");
      var file = "".concat(fileName.split(".")[0], "_rev.edl");
      download(content, file);
      dropped = 0;
    };

    read.readAsText(file);
  }
}

function tcToFrames(str) {
  var units = str.split(":").map(function (num) {
    return parseInt(num, 10);
  });
  var frames = (units[0] * 3600 + units[1] * 60 + units[2]) * fps + units[3];
  return frames;
}

function framesToTC(frames) {
  var sec = Math.floor(frames / 25);
  frames -= sec * fps;
  var fr = frames % 25;
  var min = Math.floor(sec / 60);
  sec -= min * 60;
  var hour = Math.floor(min / 60);
  min -= hour * 60;
  return "".concat(padZero(hour, 2), ":").concat(padZero(min, 2), ":").concat(padZero(sec, 2), ":").concat(padZero(fr, 2));
}

function offsetSourceClipTC(tcLine) {
  var lineArr = tcLine.split(/\s+/);
  var origStartFrame = tcToFrames(lineArr[4]);
  var origEndFrame = tcToFrames(lineArr[5]);
  var newStartFrame = tcToFrames(startTime);
  var frameOffset = origStartFrame - newStartFrame;
  var newEndTime = framesToTC(origEndFrame - frameOffset);
  return "".concat(lineArr[0], "  ").concat(lineArr[1], "       V  ").concat(lineArr[3], "        ").concat(startTime, " ").concat(newEndTime, " ").concat(lineArr[6], " ").concat(lineArr[7]);
}

function padZero(num, zeros) {
  num = num.toString();

  while (num.length < zeros) {
    num = "0" + num;
  }

  return num;
}

function download(text, filename) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function updateButton(str) {
  fileBtn.innerHTML = str;
}
},{}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "50177" + '/');

  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      console.clear();
      data.assets.forEach(function (asset) {
        hmrApply(global.parcelRequire, asset);
      });
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.parcelRequire, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAccept(global.parcelRequire, id);
  });
}
},{}]},{},["node_modules/parcel-bundler/src/builtins/hmr-runtime.js","javascript/app.js"], null)
//# sourceMappingURL=/app.26584510.map