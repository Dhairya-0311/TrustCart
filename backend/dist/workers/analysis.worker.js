"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/retry/lib/retry_operation.js
var require_retry_operation = __commonJS({
  "node_modules/retry/lib/retry_operation.js"(exports2, module2) {
    function RetryOperation(timeouts, options) {
      if (typeof options === "boolean") {
        options = { forever: options };
      }
      this._originalTimeouts = JSON.parse(JSON.stringify(timeouts));
      this._timeouts = timeouts;
      this._options = options || {};
      this._maxRetryTime = options && options.maxRetryTime || Infinity;
      this._fn = null;
      this._errors = [];
      this._attempts = 1;
      this._operationTimeout = null;
      this._operationTimeoutCb = null;
      this._timeout = null;
      this._operationStart = null;
      this._timer = null;
      if (this._options.forever) {
        this._cachedTimeouts = this._timeouts.slice(0);
      }
    }
    module2.exports = RetryOperation;
    RetryOperation.prototype.reset = function() {
      this._attempts = 1;
      this._timeouts = this._originalTimeouts.slice(0);
    };
    RetryOperation.prototype.stop = function() {
      if (this._timeout) {
        clearTimeout(this._timeout);
      }
      if (this._timer) {
        clearTimeout(this._timer);
      }
      this._timeouts = [];
      this._cachedTimeouts = null;
    };
    RetryOperation.prototype.retry = function(err) {
      if (this._timeout) {
        clearTimeout(this._timeout);
      }
      if (!err) {
        return false;
      }
      var currentTime = (/* @__PURE__ */ new Date()).getTime();
      if (err && currentTime - this._operationStart >= this._maxRetryTime) {
        this._errors.push(err);
        this._errors.unshift(new Error("RetryOperation timeout occurred"));
        return false;
      }
      this._errors.push(err);
      var timeout = this._timeouts.shift();
      if (timeout === void 0) {
        if (this._cachedTimeouts) {
          this._errors.splice(0, this._errors.length - 1);
          timeout = this._cachedTimeouts.slice(-1);
        } else {
          return false;
        }
      }
      var self2 = this;
      this._timer = setTimeout(function() {
        self2._attempts++;
        if (self2._operationTimeoutCb) {
          self2._timeout = setTimeout(function() {
            self2._operationTimeoutCb(self2._attempts);
          }, self2._operationTimeout);
          if (self2._options.unref) {
            self2._timeout.unref();
          }
        }
        self2._fn(self2._attempts);
      }, timeout);
      if (this._options.unref) {
        this._timer.unref();
      }
      return true;
    };
    RetryOperation.prototype.attempt = function(fn, timeoutOps) {
      this._fn = fn;
      if (timeoutOps) {
        if (timeoutOps.timeout) {
          this._operationTimeout = timeoutOps.timeout;
        }
        if (timeoutOps.cb) {
          this._operationTimeoutCb = timeoutOps.cb;
        }
      }
      var self2 = this;
      if (this._operationTimeoutCb) {
        this._timeout = setTimeout(function() {
          self2._operationTimeoutCb();
        }, self2._operationTimeout);
      }
      this._operationStart = (/* @__PURE__ */ new Date()).getTime();
      this._fn(this._attempts);
    };
    RetryOperation.prototype.try = function(fn) {
      console.log("Using RetryOperation.try() is deprecated");
      this.attempt(fn);
    };
    RetryOperation.prototype.start = function(fn) {
      console.log("Using RetryOperation.start() is deprecated");
      this.attempt(fn);
    };
    RetryOperation.prototype.start = RetryOperation.prototype.try;
    RetryOperation.prototype.errors = function() {
      return this._errors;
    };
    RetryOperation.prototype.attempts = function() {
      return this._attempts;
    };
    RetryOperation.prototype.mainError = function() {
      if (this._errors.length === 0) {
        return null;
      }
      var counts = {};
      var mainError = null;
      var mainErrorCount = 0;
      for (var i = 0; i < this._errors.length; i++) {
        var error = this._errors[i];
        var message = error.message;
        var count = (counts[message] || 0) + 1;
        counts[message] = count;
        if (count >= mainErrorCount) {
          mainError = error;
          mainErrorCount = count;
        }
      }
      return mainError;
    };
  }
});

// node_modules/retry/lib/retry.js
var require_retry = __commonJS({
  "node_modules/retry/lib/retry.js"(exports2) {
    var RetryOperation = require_retry_operation();
    exports2.operation = function(options) {
      var timeouts = exports2.timeouts(options);
      return new RetryOperation(timeouts, {
        forever: options && (options.forever || options.retries === Infinity),
        unref: options && options.unref,
        maxRetryTime: options && options.maxRetryTime
      });
    };
    exports2.timeouts = function(options) {
      if (options instanceof Array) {
        return [].concat(options);
      }
      var opts = {
        retries: 10,
        factor: 2,
        minTimeout: 1 * 1e3,
        maxTimeout: Infinity,
        randomize: false
      };
      for (var key in options) {
        opts[key] = options[key];
      }
      if (opts.minTimeout > opts.maxTimeout) {
        throw new Error("minTimeout is greater than maxTimeout");
      }
      var timeouts = [];
      for (var i = 0; i < opts.retries; i++) {
        timeouts.push(this.createTimeout(i, opts));
      }
      if (options && options.forever && !timeouts.length) {
        timeouts.push(this.createTimeout(i, opts));
      }
      timeouts.sort(function(a, b) {
        return a - b;
      });
      return timeouts;
    };
    exports2.createTimeout = function(attempt, opts) {
      var random = opts.randomize ? Math.random() + 1 : 1;
      var timeout = Math.round(random * Math.max(opts.minTimeout, 1) * Math.pow(opts.factor, attempt));
      timeout = Math.min(timeout, opts.maxTimeout);
      return timeout;
    };
    exports2.wrap = function(obj, options, methods) {
      if (options instanceof Array) {
        methods = options;
        options = null;
      }
      if (!methods) {
        methods = [];
        for (var key in obj) {
          if (typeof obj[key] === "function") {
            methods.push(key);
          }
        }
      }
      for (var i = 0; i < methods.length; i++) {
        var method = methods[i];
        var original = obj[method];
        obj[method] = function retryWrapper(original2) {
          var op = exports2.operation(options);
          var args = Array.prototype.slice.call(arguments, 1);
          var callback = args.pop();
          args.push(function(err) {
            if (op.retry(err)) {
              return;
            }
            if (err) {
              arguments[0] = op.mainError();
            }
            callback.apply(this, arguments);
          });
          op.attempt(function() {
            original2.apply(obj, args);
          });
        }.bind(obj, original);
        obj[method].options = options;
      }
    };
  }
});

// node_modules/retry/index.js
var require_retry2 = __commonJS({
  "node_modules/retry/index.js"(exports2, module2) {
    module2.exports = require_retry();
  }
});

// node_modules/p-retry/index.js
var require_p_retry = __commonJS({
  "node_modules/p-retry/index.js"(exports2, module2) {
    "use strict";
    var retry = require_retry2();
    var networkErrorMsgs = [
      "Failed to fetch",
      // Chrome
      "NetworkError when attempting to fetch resource.",
      // Firefox
      "The Internet connection appears to be offline.",
      // Safari
      "Network request failed"
      // `cross-fetch`
    ];
    var AbortError2 = class extends Error {
      constructor(message) {
        super();
        if (message instanceof Error) {
          this.originalError = message;
          ({ message } = message);
        } else {
          this.originalError = new Error(message);
          this.originalError.stack = this.stack;
        }
        this.name = "AbortError";
        this.message = message;
      }
    };
    var decorateErrorWithCounts = (error, attemptNumber, options) => {
      const retriesLeft = options.retries - (attemptNumber - 1);
      error.attemptNumber = attemptNumber;
      error.retriesLeft = retriesLeft;
      return error;
    };
    var isNetworkError2 = (errorMessage) => networkErrorMsgs.includes(errorMessage);
    var pRetry4 = (input, options) => new Promise((resolve, reject) => {
      options = {
        onFailedAttempt: () => {
        },
        retries: 10,
        ...options
      };
      const operation = retry.operation(options);
      operation.attempt(async (attemptNumber) => {
        try {
          resolve(await input(attemptNumber));
        } catch (error) {
          if (!(error instanceof Error)) {
            reject(new TypeError(`Non-error was thrown: "${error}". You should only throw errors.`));
            return;
          }
          if (error instanceof AbortError2) {
            operation.stop();
            reject(error.originalError);
          } else if (error instanceof TypeError && !isNetworkError2(error.message)) {
            operation.stop();
            reject(error);
          } else {
            decorateErrorWithCounts(error, attemptNumber, options);
            try {
              await options.onFailedAttempt(error);
            } catch (error2) {
              reject(error2);
              return;
            }
            if (!operation.retry(error)) {
              reject(operation.mainError());
            }
          }
        }
      });
    });
    module2.exports = pRetry4;
    module2.exports.default = pRetry4;
    module2.exports.AbortError = AbortError2;
  }
});

// node_modules/uuid/dist/esm-node/regex.js
var regex_default;
var init_regex = __esm({
  "node_modules/uuid/dist/esm-node/regex.js"() {
    regex_default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i;
  }
});

// node_modules/uuid/dist/esm-node/validate.js
function validate(uuid) {
  return typeof uuid === "string" && regex_default.test(uuid);
}
var validate_default;
var init_validate = __esm({
  "node_modules/uuid/dist/esm-node/validate.js"() {
    init_regex();
    validate_default = validate;
  }
});

// node_modules/uuid/dist/esm-node/parse.js
function parse(uuid) {
  if (!validate_default(uuid)) {
    throw TypeError("Invalid UUID");
  }
  let v;
  const arr2 = new Uint8Array(16);
  arr2[0] = (v = parseInt(uuid.slice(0, 8), 16)) >>> 24;
  arr2[1] = v >>> 16 & 255;
  arr2[2] = v >>> 8 & 255;
  arr2[3] = v & 255;
  arr2[4] = (v = parseInt(uuid.slice(9, 13), 16)) >>> 8;
  arr2[5] = v & 255;
  arr2[6] = (v = parseInt(uuid.slice(14, 18), 16)) >>> 8;
  arr2[7] = v & 255;
  arr2[8] = (v = parseInt(uuid.slice(19, 23), 16)) >>> 8;
  arr2[9] = v & 255;
  arr2[10] = (v = parseInt(uuid.slice(24, 36), 16)) / 1099511627776 & 255;
  arr2[11] = v / 4294967296 & 255;
  arr2[12] = v >>> 24 & 255;
  arr2[13] = v >>> 16 & 255;
  arr2[14] = v >>> 8 & 255;
  arr2[15] = v & 255;
  return arr2;
}
var parse_default;
var init_parse = __esm({
  "node_modules/uuid/dist/esm-node/parse.js"() {
    init_validate();
    parse_default = parse;
  }
});

// node_modules/uuid/dist/esm-node/stringify.js
function unsafeStringify(arr2, offset = 0) {
  return (byteToHex[arr2[offset + 0]] + byteToHex[arr2[offset + 1]] + byteToHex[arr2[offset + 2]] + byteToHex[arr2[offset + 3]] + "-" + byteToHex[arr2[offset + 4]] + byteToHex[arr2[offset + 5]] + "-" + byteToHex[arr2[offset + 6]] + byteToHex[arr2[offset + 7]] + "-" + byteToHex[arr2[offset + 8]] + byteToHex[arr2[offset + 9]] + "-" + byteToHex[arr2[offset + 10]] + byteToHex[arr2[offset + 11]] + byteToHex[arr2[offset + 12]] + byteToHex[arr2[offset + 13]] + byteToHex[arr2[offset + 14]] + byteToHex[arr2[offset + 15]]).toLowerCase();
}
var byteToHex;
var init_stringify = __esm({
  "node_modules/uuid/dist/esm-node/stringify.js"() {
    byteToHex = [];
    for (let i = 0; i < 256; ++i) {
      byteToHex.push((i + 256).toString(16).slice(1));
    }
  }
});

// node_modules/uuid/dist/esm-node/rng.js
function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    import_node_crypto.default.randomFillSync(rnds8Pool);
    poolPtr = 0;
  }
  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}
var import_node_crypto, rnds8Pool, poolPtr;
var init_rng = __esm({
  "node_modules/uuid/dist/esm-node/rng.js"() {
    import_node_crypto = __toESM(require("node:crypto"));
    rnds8Pool = new Uint8Array(256);
    poolPtr = rnds8Pool.length;
  }
});

// node_modules/uuid/dist/esm-node/v35.js
function stringToBytes(str) {
  str = unescape(encodeURIComponent(str));
  const bytes = [];
  for (let i = 0; i < str.length; ++i) {
    bytes.push(str.charCodeAt(i));
  }
  return bytes;
}
function v35(name, version, hashfunc) {
  function generateUUID(value, namespace, buf, offset) {
    var _namespace;
    if (typeof value === "string") {
      value = stringToBytes(value);
    }
    if (typeof namespace === "string") {
      namespace = parse_default(namespace);
    }
    if (((_namespace = namespace) === null || _namespace === void 0 ? void 0 : _namespace.length) !== 16) {
      throw TypeError("Namespace must be array-like (16 iterable integer values, 0-255)");
    }
    let bytes = new Uint8Array(16 + value.length);
    bytes.set(namespace);
    bytes.set(value, namespace.length);
    bytes = hashfunc(bytes);
    bytes[6] = bytes[6] & 15 | version;
    bytes[8] = bytes[8] & 63 | 128;
    if (buf) {
      offset = offset || 0;
      for (let i = 0; i < 16; ++i) {
        buf[offset + i] = bytes[i];
      }
      return buf;
    }
    return unsafeStringify(bytes);
  }
  try {
    generateUUID.name = name;
  } catch (err) {
  }
  generateUUID.DNS = DNS;
  generateUUID.URL = URL2;
  return generateUUID;
}
var DNS, URL2;
var init_v35 = __esm({
  "node_modules/uuid/dist/esm-node/v35.js"() {
    init_stringify();
    init_parse();
    DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
    URL2 = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
  }
});

// node_modules/uuid/dist/esm-node/native.js
var import_node_crypto2, native_default;
var init_native = __esm({
  "node_modules/uuid/dist/esm-node/native.js"() {
    import_node_crypto2 = __toESM(require("node:crypto"));
    native_default = {
      randomUUID: import_node_crypto2.default.randomUUID
    };
  }
});

// node_modules/uuid/dist/esm-node/v4.js
function v4(options, buf, offset) {
  if (native_default.randomUUID && !buf && !options) {
    return native_default.randomUUID();
  }
  options = options || {};
  const rnds = options.random || (options.rng || rng)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
var v4_default;
var init_v4 = __esm({
  "node_modules/uuid/dist/esm-node/v4.js"() {
    init_native();
    init_rng();
    init_stringify();
    v4_default = v4;
  }
});

// node_modules/uuid/dist/esm-node/sha1.js
function sha1(bytes) {
  if (Array.isArray(bytes)) {
    bytes = Buffer.from(bytes);
  } else if (typeof bytes === "string") {
    bytes = Buffer.from(bytes, "utf8");
  }
  return import_node_crypto3.default.createHash("sha1").update(bytes).digest();
}
var import_node_crypto3, sha1_default;
var init_sha1 = __esm({
  "node_modules/uuid/dist/esm-node/sha1.js"() {
    import_node_crypto3 = __toESM(require("node:crypto"));
    sha1_default = sha1;
  }
});

// node_modules/uuid/dist/esm-node/v5.js
var v5, v5_default;
var init_v5 = __esm({
  "node_modules/uuid/dist/esm-node/v5.js"() {
    init_v35();
    init_sha1();
    v5 = v35("v5", 80, sha1_default);
    v5_default = v5;
  }
});

// node_modules/uuid/dist/esm-node/v7.js
function v7(options, buf, offset) {
  options = options || {};
  let i = buf && offset || 0;
  const b = buf || new Uint8Array(16);
  const rnds = options.random || (options.rng || rng)();
  const msecs = options.msecs !== void 0 ? options.msecs : Date.now();
  let seq = options.seq !== void 0 ? options.seq : null;
  let seqHigh = _seqHigh;
  let seqLow = _seqLow;
  if (msecs > _msecs && options.msecs === void 0) {
    _msecs = msecs;
    if (seq !== null) {
      seqHigh = null;
      seqLow = null;
    }
  }
  if (seq !== null) {
    if (seq > 2147483647) {
      seq = 2147483647;
    }
    seqHigh = seq >>> 19 & 4095;
    seqLow = seq & 524287;
  }
  if (seqHigh === null || seqLow === null) {
    seqHigh = rnds[6] & 127;
    seqHigh = seqHigh << 8 | rnds[7];
    seqLow = rnds[8] & 63;
    seqLow = seqLow << 8 | rnds[9];
    seqLow = seqLow << 5 | rnds[10] >>> 3;
  }
  if (msecs + 1e4 > _msecs && seq === null) {
    if (++seqLow > 524287) {
      seqLow = 0;
      if (++seqHigh > 4095) {
        seqHigh = 0;
        _msecs++;
      }
    }
  } else {
    _msecs = msecs;
  }
  _seqHigh = seqHigh;
  _seqLow = seqLow;
  b[i++] = _msecs / 1099511627776 & 255;
  b[i++] = _msecs / 4294967296 & 255;
  b[i++] = _msecs / 16777216 & 255;
  b[i++] = _msecs / 65536 & 255;
  b[i++] = _msecs / 256 & 255;
  b[i++] = _msecs & 255;
  b[i++] = seqHigh >>> 4 & 15 | 112;
  b[i++] = seqHigh & 255;
  b[i++] = seqLow >>> 13 & 63 | 128;
  b[i++] = seqLow >>> 5 & 255;
  b[i++] = seqLow << 3 & 255 | rnds[10] & 7;
  b[i++] = rnds[11];
  b[i++] = rnds[12];
  b[i++] = rnds[13];
  b[i++] = rnds[14];
  b[i++] = rnds[15];
  return buf || unsafeStringify(b);
}
var _seqLow, _seqHigh, _msecs, v7_default;
var init_v7 = __esm({
  "node_modules/uuid/dist/esm-node/v7.js"() {
    init_rng();
    init_stringify();
    _seqLow = null;
    _seqHigh = null;
    _msecs = 0;
    v7_default = v7;
  }
});

// node_modules/uuid/dist/esm-node/index.js
var init_esm_node = __esm({
  "node_modules/uuid/dist/esm-node/index.js"() {
    init_v4();
    init_v5();
    init_v7();
    init_validate();
  }
});

// node_modules/langsmith/dist/singletons/traceable.js
function getCurrentRunTree(permitAbsentRunTree = false) {
  const runTree = AsyncLocalStorageProviderSingleton.getInstance().getStore();
  if (!permitAbsentRunTree && runTree === void 0) {
    throw new Error("Could not get the current run tree.\n\nPlease make sure you are calling this method within a traceable function and that tracing is enabled.");
  }
  return runTree;
}
function isTraceableFunction(x) {
  return typeof x === "function" && "langsmith:traceable" in x;
}
var MockAsyncLocalStorage, TRACING_ALS_KEY, mockAsyncLocalStorage, AsyncLocalStorageProvider, AsyncLocalStorageProviderSingleton;
var init_traceable = __esm({
  "node_modules/langsmith/dist/singletons/traceable.js"() {
    MockAsyncLocalStorage = class {
      getStore() {
        return void 0;
      }
      run(_, callback) {
        return callback();
      }
    };
    TRACING_ALS_KEY = /* @__PURE__ */ Symbol.for("ls:tracing_async_local_storage");
    mockAsyncLocalStorage = new MockAsyncLocalStorage();
    AsyncLocalStorageProvider = class {
      getInstance() {
        return globalThis[TRACING_ALS_KEY] ?? mockAsyncLocalStorage;
      }
      initializeGlobalInstance(instance) {
        if (globalThis[TRACING_ALS_KEY] === void 0) {
          globalThis[TRACING_ALS_KEY] = instance;
        }
      }
    };
    AsyncLocalStorageProviderSingleton = new AsyncLocalStorageProvider();
  }
});

// node_modules/langsmith/singletons/traceable.js
var init_traceable2 = __esm({
  "node_modules/langsmith/singletons/traceable.js"() {
    init_traceable();
  }
});

// node_modules/@langchain/core/dist/utils/fast-json-patch/src/helpers.js
function hasOwnProperty(obj, key) {
  return _hasOwnProperty.call(obj, key);
}
function _objectKeys(obj) {
  if (Array.isArray(obj)) {
    const keys2 = new Array(obj.length);
    for (let k = 0; k < keys2.length; k++) {
      keys2[k] = "" + k;
    }
    return keys2;
  }
  if (Object.keys) {
    return Object.keys(obj);
  }
  let keys = [];
  for (let i in obj) {
    if (hasOwnProperty(obj, i)) {
      keys.push(i);
    }
  }
  return keys;
}
function _deepClone(obj) {
  switch (typeof obj) {
    case "object":
      return JSON.parse(JSON.stringify(obj));
    //Faster than ES5 clone - http://jsperf.com/deep-cloning-of-objects/5
    case "undefined":
      return null;
    //this is how JSON.stringify behaves for array items
    default:
      return obj;
  }
}
function isInteger(str) {
  let i = 0;
  const len = str.length;
  let charCode;
  while (i < len) {
    charCode = str.charCodeAt(i);
    if (charCode >= 48 && charCode <= 57) {
      i++;
      continue;
    }
    return false;
  }
  return true;
}
function escapePathComponent(path2) {
  if (path2.indexOf("/") === -1 && path2.indexOf("~") === -1)
    return path2;
  return path2.replace(/~/g, "~0").replace(/\//g, "~1");
}
function unescapePathComponent(path2) {
  return path2.replace(/~1/g, "/").replace(/~0/g, "~");
}
function hasUndefined(obj) {
  if (obj === void 0) {
    return true;
  }
  if (obj) {
    if (Array.isArray(obj)) {
      for (let i2 = 0, len = obj.length; i2 < len; i2++) {
        if (hasUndefined(obj[i2])) {
          return true;
        }
      }
    } else if (typeof obj === "object") {
      const objKeys = _objectKeys(obj);
      const objKeysLength = objKeys.length;
      for (var i = 0; i < objKeysLength; i++) {
        if (hasUndefined(obj[objKeys[i]])) {
          return true;
        }
      }
    }
  }
  return false;
}
function patchErrorMessageFormatter(message, args) {
  const messageParts = [message];
  for (const key in args) {
    const value = typeof args[key] === "object" ? JSON.stringify(args[key], null, 2) : args[key];
    if (typeof value !== "undefined") {
      messageParts.push(`${key}: ${value}`);
    }
  }
  return messageParts.join("\n");
}
var _hasOwnProperty, PatchError;
var init_helpers = __esm({
  "node_modules/@langchain/core/dist/utils/fast-json-patch/src/helpers.js"() {
    _hasOwnProperty = Object.prototype.hasOwnProperty;
    PatchError = class extends Error {
      constructor(message, name, index, operation, tree) {
        super(patchErrorMessageFormatter(message, { name, index, operation, tree }));
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: name
        });
        Object.defineProperty(this, "index", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: index
        });
        Object.defineProperty(this, "operation", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: operation
        });
        Object.defineProperty(this, "tree", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: tree
        });
        Object.setPrototypeOf(this, new.target.prototype);
        this.message = patchErrorMessageFormatter(message, {
          name,
          index,
          operation,
          tree
        });
      }
    };
  }
});

// node_modules/@langchain/core/dist/utils/fast-json-patch/src/core.js
var core_exports = {};
__export(core_exports, {
  JsonPatchError: () => JsonPatchError,
  _areEquals: () => _areEquals,
  applyOperation: () => applyOperation,
  applyPatch: () => applyPatch,
  applyReducer: () => applyReducer,
  deepClone: () => deepClone,
  getValueByPointer: () => getValueByPointer,
  validate: () => validate2,
  validator: () => validator
});
function getValueByPointer(document2, pointer) {
  if (pointer == "") {
    return document2;
  }
  var getOriginalDestination = { op: "_get", path: pointer };
  applyOperation(document2, getOriginalDestination);
  return getOriginalDestination.value;
}
function applyOperation(document2, operation, validateOperation = false, mutateDocument = true, banPrototypeModifications = true, index = 0) {
  if (validateOperation) {
    if (typeof validateOperation == "function") {
      validateOperation(operation, 0, document2, operation.path);
    } else {
      validator(operation, 0);
    }
  }
  if (operation.path === "") {
    let returnValue = { newDocument: document2 };
    if (operation.op === "add") {
      returnValue.newDocument = operation.value;
      return returnValue;
    } else if (operation.op === "replace") {
      returnValue.newDocument = operation.value;
      returnValue.removed = document2;
      return returnValue;
    } else if (operation.op === "move" || operation.op === "copy") {
      returnValue.newDocument = getValueByPointer(document2, operation.from);
      if (operation.op === "move") {
        returnValue.removed = document2;
      }
      return returnValue;
    } else if (operation.op === "test") {
      returnValue.test = _areEquals(document2, operation.value);
      if (returnValue.test === false) {
        throw new JsonPatchError("Test operation failed", "TEST_OPERATION_FAILED", index, operation, document2);
      }
      returnValue.newDocument = document2;
      return returnValue;
    } else if (operation.op === "remove") {
      returnValue.removed = document2;
      returnValue.newDocument = null;
      return returnValue;
    } else if (operation.op === "_get") {
      operation.value = document2;
      return returnValue;
    } else {
      if (validateOperation) {
        throw new JsonPatchError("Operation `op` property is not one of operations defined in RFC-6902", "OPERATION_OP_INVALID", index, operation, document2);
      } else {
        return returnValue;
      }
    }
  } else {
    if (!mutateDocument) {
      document2 = _deepClone(document2);
    }
    const path2 = operation.path || "";
    const keys = path2.split("/");
    let obj = document2;
    let t = 1;
    let len = keys.length;
    let existingPathFragment = void 0;
    let key;
    let validateFunction;
    if (typeof validateOperation == "function") {
      validateFunction = validateOperation;
    } else {
      validateFunction = validator;
    }
    while (true) {
      key = keys[t];
      if (key && key.indexOf("~") != -1) {
        key = unescapePathComponent(key);
      }
      if (banPrototypeModifications && (key == "__proto__" || key == "prototype" && t > 0 && keys[t - 1] == "constructor")) {
        throw new TypeError("JSON-Patch: modifying `__proto__` or `constructor/prototype` prop is banned for security reasons, if this was on purpose, please set `banPrototypeModifications` flag false and pass it to this function. More info in fast-json-patch README");
      }
      if (validateOperation) {
        if (existingPathFragment === void 0) {
          if (obj[key] === void 0) {
            existingPathFragment = keys.slice(0, t).join("/");
          } else if (t == len - 1) {
            existingPathFragment = operation.path;
          }
          if (existingPathFragment !== void 0) {
            validateFunction(operation, 0, document2, existingPathFragment);
          }
        }
      }
      t++;
      if (Array.isArray(obj)) {
        if (key === "-") {
          key = obj.length;
        } else {
          if (validateOperation && !isInteger(key)) {
            throw new JsonPatchError("Expected an unsigned base-10 integer value, making the new referenced value the array element with the zero-based index", "OPERATION_PATH_ILLEGAL_ARRAY_INDEX", index, operation, document2);
          } else if (isInteger(key)) {
            key = ~~key;
          }
        }
        if (t >= len) {
          if (validateOperation && operation.op === "add" && key > obj.length) {
            throw new JsonPatchError("The specified index MUST NOT be greater than the number of elements in the array", "OPERATION_VALUE_OUT_OF_BOUNDS", index, operation, document2);
          }
          const returnValue = arrOps[operation.op].call(operation, obj, key, document2);
          if (returnValue.test === false) {
            throw new JsonPatchError("Test operation failed", "TEST_OPERATION_FAILED", index, operation, document2);
          }
          return returnValue;
        }
      } else {
        if (t >= len) {
          const returnValue = objOps[operation.op].call(operation, obj, key, document2);
          if (returnValue.test === false) {
            throw new JsonPatchError("Test operation failed", "TEST_OPERATION_FAILED", index, operation, document2);
          }
          return returnValue;
        }
      }
      obj = obj[key];
      if (validateOperation && t < len && (!obj || typeof obj !== "object")) {
        throw new JsonPatchError("Cannot perform operation at the desired path", "OPERATION_PATH_UNRESOLVABLE", index, operation, document2);
      }
    }
  }
}
function applyPatch(document2, patch, validateOperation, mutateDocument = true, banPrototypeModifications = true) {
  if (validateOperation) {
    if (!Array.isArray(patch)) {
      throw new JsonPatchError("Patch sequence must be an array", "SEQUENCE_NOT_AN_ARRAY");
    }
  }
  if (!mutateDocument) {
    document2 = _deepClone(document2);
  }
  const results = new Array(patch.length);
  for (let i = 0, length = patch.length; i < length; i++) {
    results[i] = applyOperation(document2, patch[i], validateOperation, true, banPrototypeModifications, i);
    document2 = results[i].newDocument;
  }
  results.newDocument = document2;
  return results;
}
function applyReducer(document2, operation, index) {
  const operationResult = applyOperation(document2, operation);
  if (operationResult.test === false) {
    throw new JsonPatchError("Test operation failed", "TEST_OPERATION_FAILED", index, operation, document2);
  }
  return operationResult.newDocument;
}
function validator(operation, index, document2, existingPathFragment) {
  if (typeof operation !== "object" || operation === null || Array.isArray(operation)) {
    throw new JsonPatchError("Operation is not an object", "OPERATION_NOT_AN_OBJECT", index, operation, document2);
  } else if (!objOps[operation.op]) {
    throw new JsonPatchError("Operation `op` property is not one of operations defined in RFC-6902", "OPERATION_OP_INVALID", index, operation, document2);
  } else if (typeof operation.path !== "string") {
    throw new JsonPatchError("Operation `path` property is not a string", "OPERATION_PATH_INVALID", index, operation, document2);
  } else if (operation.path.indexOf("/") !== 0 && operation.path.length > 0) {
    throw new JsonPatchError('Operation `path` property must start with "/"', "OPERATION_PATH_INVALID", index, operation, document2);
  } else if ((operation.op === "move" || operation.op === "copy") && typeof operation.from !== "string") {
    throw new JsonPatchError("Operation `from` property is not present (applicable in `move` and `copy` operations)", "OPERATION_FROM_REQUIRED", index, operation, document2);
  } else if ((operation.op === "add" || operation.op === "replace" || operation.op === "test") && operation.value === void 0) {
    throw new JsonPatchError("Operation `value` property is not present (applicable in `add`, `replace` and `test` operations)", "OPERATION_VALUE_REQUIRED", index, operation, document2);
  } else if ((operation.op === "add" || operation.op === "replace" || operation.op === "test") && hasUndefined(operation.value)) {
    throw new JsonPatchError("Operation `value` property is not present (applicable in `add`, `replace` and `test` operations)", "OPERATION_VALUE_CANNOT_CONTAIN_UNDEFINED", index, operation, document2);
  } else if (document2) {
    if (operation.op == "add") {
      var pathLen = operation.path.split("/").length;
      var existingPathLen = existingPathFragment.split("/").length;
      if (pathLen !== existingPathLen + 1 && pathLen !== existingPathLen) {
        throw new JsonPatchError("Cannot perform an `add` operation at the desired path", "OPERATION_PATH_CANNOT_ADD", index, operation, document2);
      }
    } else if (operation.op === "replace" || operation.op === "remove" || operation.op === "_get") {
      if (operation.path !== existingPathFragment) {
        throw new JsonPatchError("Cannot perform the operation at a path that does not exist", "OPERATION_PATH_UNRESOLVABLE", index, operation, document2);
      }
    } else if (operation.op === "move" || operation.op === "copy") {
      var existingValue = {
        op: "_get",
        path: operation.from,
        value: void 0
      };
      var error = validate2([existingValue], document2);
      if (error && error.name === "OPERATION_PATH_UNRESOLVABLE") {
        throw new JsonPatchError("Cannot perform the operation from a path that does not exist", "OPERATION_FROM_UNRESOLVABLE", index, operation, document2);
      }
    }
  }
}
function validate2(sequence, document2, externalValidator) {
  try {
    if (!Array.isArray(sequence)) {
      throw new JsonPatchError("Patch sequence must be an array", "SEQUENCE_NOT_AN_ARRAY");
    }
    if (document2) {
      applyPatch(_deepClone(document2), _deepClone(sequence), externalValidator || true);
    } else {
      externalValidator = externalValidator || validator;
      for (var i = 0; i < sequence.length; i++) {
        externalValidator(sequence[i], i, document2, void 0);
      }
    }
  } catch (e) {
    if (e instanceof JsonPatchError) {
      return e;
    } else {
      throw e;
    }
  }
}
function _areEquals(a, b) {
  if (a === b)
    return true;
  if (a && b && typeof a == "object" && typeof b == "object") {
    var arrA = Array.isArray(a), arrB = Array.isArray(b), i, length, key;
    if (arrA && arrB) {
      length = a.length;
      if (length != b.length)
        return false;
      for (i = length; i-- !== 0; )
        if (!_areEquals(a[i], b[i]))
          return false;
      return true;
    }
    if (arrA != arrB)
      return false;
    var keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b).length)
      return false;
    for (i = length; i-- !== 0; )
      if (!b.hasOwnProperty(keys[i]))
        return false;
    for (i = length; i-- !== 0; ) {
      key = keys[i];
      if (!_areEquals(a[key], b[key]))
        return false;
    }
    return true;
  }
  return a !== a && b !== b;
}
var JsonPatchError, deepClone, objOps, arrOps;
var init_core = __esm({
  "node_modules/@langchain/core/dist/utils/fast-json-patch/src/core.js"() {
    init_helpers();
    JsonPatchError = PatchError;
    deepClone = _deepClone;
    objOps = {
      add: function(obj, key, document2) {
        obj[key] = this.value;
        return { newDocument: document2 };
      },
      remove: function(obj, key, document2) {
        var removed = obj[key];
        delete obj[key];
        return { newDocument: document2, removed };
      },
      replace: function(obj, key, document2) {
        var removed = obj[key];
        obj[key] = this.value;
        return { newDocument: document2, removed };
      },
      move: function(obj, key, document2) {
        let removed = getValueByPointer(document2, this.path);
        if (removed) {
          removed = _deepClone(removed);
        }
        const originalValue = applyOperation(document2, {
          op: "remove",
          path: this.from
        }).removed;
        applyOperation(document2, {
          op: "add",
          path: this.path,
          value: originalValue
        });
        return { newDocument: document2, removed };
      },
      copy: function(obj, key, document2) {
        const valueToCopy = getValueByPointer(document2, this.from);
        applyOperation(document2, {
          op: "add",
          path: this.path,
          value: _deepClone(valueToCopy)
        });
        return { newDocument: document2 };
      },
      test: function(obj, key, document2) {
        return { newDocument: document2, test: _areEquals(obj[key], this.value) };
      },
      _get: function(obj, key, document2) {
        this.value = obj[key];
        return { newDocument: document2 };
      }
    };
    arrOps = {
      add: function(arr2, i, document2) {
        if (isInteger(i)) {
          arr2.splice(i, 0, this.value);
        } else {
          arr2[i] = this.value;
        }
        return { newDocument: document2, index: i };
      },
      remove: function(arr2, i, document2) {
        var removedList = arr2.splice(i, 1);
        return { newDocument: document2, removed: removedList[0] };
      },
      replace: function(arr2, i, document2) {
        var removed = arr2[i];
        arr2[i] = this.value;
        return { newDocument: document2, removed };
      },
      move: objOps.move,
      copy: objOps.copy,
      test: objOps.test,
      _get: objOps._get
    };
  }
});

// node_modules/@langchain/core/dist/utils/fast-json-patch/src/duplex.js
var init_duplex = __esm({
  "node_modules/@langchain/core/dist/utils/fast-json-patch/src/duplex.js"() {
    init_helpers();
    init_core();
  }
});

// node_modules/@langchain/core/dist/utils/fast-json-patch/index.js
var fast_json_patch_default;
var init_fast_json_patch = __esm({
  "node_modules/@langchain/core/dist/utils/fast-json-patch/index.js"() {
    init_core();
    init_duplex();
    init_helpers();
    init_core();
    init_helpers();
    fast_json_patch_default = {
      ...core_exports,
      // ...duplex,
      JsonPatchError: PatchError,
      deepClone: _deepClone,
      escapePathComponent,
      unescapePathComponent
    };
  }
});

// node_modules/langsmith/dist/experimental/otel/constants.js
var GEN_AI_OPERATION_NAME, GEN_AI_SYSTEM, GEN_AI_REQUEST_MODEL, GEN_AI_RESPONSE_MODEL, GEN_AI_USAGE_INPUT_TOKENS, GEN_AI_USAGE_OUTPUT_TOKENS, GEN_AI_USAGE_TOTAL_TOKENS, GEN_AI_REQUEST_MAX_TOKENS, GEN_AI_REQUEST_TEMPERATURE, GEN_AI_REQUEST_TOP_P, GEN_AI_REQUEST_FREQUENCY_PENALTY, GEN_AI_REQUEST_PRESENCE_PENALTY, GEN_AI_RESPONSE_FINISH_REASONS, GENAI_PROMPT, GENAI_COMPLETION, GEN_AI_REQUEST_EXTRA_QUERY, GEN_AI_REQUEST_EXTRA_BODY, GEN_AI_SERIALIZED_NAME, GEN_AI_SERIALIZED_SIGNATURE, GEN_AI_SERIALIZED_DOC, GEN_AI_RESPONSE_ID, GEN_AI_RESPONSE_SERVICE_TIER, GEN_AI_RESPONSE_SYSTEM_FINGERPRINT, GEN_AI_USAGE_INPUT_TOKEN_DETAILS, GEN_AI_USAGE_OUTPUT_TOKEN_DETAILS, LANGSMITH_SESSION_ID, LANGSMITH_SESSION_NAME, LANGSMITH_RUN_TYPE, LANGSMITH_NAME, LANGSMITH_METADATA, LANGSMITH_TAGS, LANGSMITH_REQUEST_STREAMING, LANGSMITH_REQUEST_HEADERS;
var init_constants = __esm({
  "node_modules/langsmith/dist/experimental/otel/constants.js"() {
    GEN_AI_OPERATION_NAME = "gen_ai.operation.name";
    GEN_AI_SYSTEM = "gen_ai.system";
    GEN_AI_REQUEST_MODEL = "gen_ai.request.model";
    GEN_AI_RESPONSE_MODEL = "gen_ai.response.model";
    GEN_AI_USAGE_INPUT_TOKENS = "gen_ai.usage.input_tokens";
    GEN_AI_USAGE_OUTPUT_TOKENS = "gen_ai.usage.output_tokens";
    GEN_AI_USAGE_TOTAL_TOKENS = "gen_ai.usage.total_tokens";
    GEN_AI_REQUEST_MAX_TOKENS = "gen_ai.request.max_tokens";
    GEN_AI_REQUEST_TEMPERATURE = "gen_ai.request.temperature";
    GEN_AI_REQUEST_TOP_P = "gen_ai.request.top_p";
    GEN_AI_REQUEST_FREQUENCY_PENALTY = "gen_ai.request.frequency_penalty";
    GEN_AI_REQUEST_PRESENCE_PENALTY = "gen_ai.request.presence_penalty";
    GEN_AI_RESPONSE_FINISH_REASONS = "gen_ai.response.finish_reasons";
    GENAI_PROMPT = "gen_ai.prompt";
    GENAI_COMPLETION = "gen_ai.completion";
    GEN_AI_REQUEST_EXTRA_QUERY = "gen_ai.request.extra_query";
    GEN_AI_REQUEST_EXTRA_BODY = "gen_ai.request.extra_body";
    GEN_AI_SERIALIZED_NAME = "gen_ai.serialized.name";
    GEN_AI_SERIALIZED_SIGNATURE = "gen_ai.serialized.signature";
    GEN_AI_SERIALIZED_DOC = "gen_ai.serialized.doc";
    GEN_AI_RESPONSE_ID = "gen_ai.response.id";
    GEN_AI_RESPONSE_SERVICE_TIER = "gen_ai.response.service_tier";
    GEN_AI_RESPONSE_SYSTEM_FINGERPRINT = "gen_ai.response.system_fingerprint";
    GEN_AI_USAGE_INPUT_TOKEN_DETAILS = "gen_ai.usage.input_token_details";
    GEN_AI_USAGE_OUTPUT_TOKEN_DETAILS = "gen_ai.usage.output_token_details";
    LANGSMITH_SESSION_ID = "langsmith.trace.session_id";
    LANGSMITH_SESSION_NAME = "langsmith.trace.session_name";
    LANGSMITH_RUN_TYPE = "langsmith.span.kind";
    LANGSMITH_NAME = "langsmith.trace.name";
    LANGSMITH_METADATA = "langsmith.metadata";
    LANGSMITH_TAGS = "langsmith.span.tags";
    LANGSMITH_REQUEST_STREAMING = "langsmith.request.streaming";
    LANGSMITH_REQUEST_HEADERS = "langsmith.request.headers";
  }
});

// node_modules/langsmith/dist/singletons/fetch.js
var DEFAULT_FETCH_IMPLEMENTATION, LANGSMITH_FETCH_IMPLEMENTATION_KEY, _globalFetchImplementationIsNodeFetch, _getFetchImplementation;
var init_fetch = __esm({
  "node_modules/langsmith/dist/singletons/fetch.js"() {
    init_env();
    DEFAULT_FETCH_IMPLEMENTATION = (...args) => fetch(...args);
    LANGSMITH_FETCH_IMPLEMENTATION_KEY = /* @__PURE__ */ Symbol.for("ls:fetch_implementation");
    _globalFetchImplementationIsNodeFetch = () => {
      const fetchImpl = globalThis[LANGSMITH_FETCH_IMPLEMENTATION_KEY];
      if (!fetchImpl)
        return false;
      return typeof fetchImpl === "function" && "Headers" in fetchImpl && "Request" in fetchImpl && "Response" in fetchImpl;
    };
    _getFetchImplementation = (debug) => {
      return async (...args) => {
        if (debug || getLangSmithEnvironmentVariable("DEBUG") === "true") {
          const [url, options] = args;
          console.log(`\u2192 ${options?.method || "GET"} ${url}`);
        }
        const res = await (globalThis[LANGSMITH_FETCH_IMPLEMENTATION_KEY] ?? DEFAULT_FETCH_IMPLEMENTATION)(...args);
        if (debug || getLangSmithEnvironmentVariable("DEBUG") === "true") {
          console.log(`\u2190 ${res.status} ${res.statusText} ${res.url}`);
        }
        return res;
      };
    };
  }
});

// node_modules/langsmith/dist/utils/project.js
var getDefaultProjectName;
var init_project = __esm({
  "node_modules/langsmith/dist/utils/project.js"() {
    init_env();
    getDefaultProjectName = () => {
      return getLangSmithEnvironmentVariable("PROJECT") ?? getEnvironmentVariable("LANGCHAIN_SESSION") ?? // TODO: Deprecate
      "default";
    };
  }
});

// node_modules/langsmith/dist/utils/warn.js
function warnOnce(message) {
  if (!warnedMessages[message]) {
    console.warn(message);
    warnedMessages[message] = true;
  }
}
var warnedMessages;
var init_warn = __esm({
  "node_modules/langsmith/dist/utils/warn.js"() {
    warnedMessages = {};
  }
});

// node_modules/langsmith/dist/utils/_uuid.js
function assertUuid(str, which) {
  if (!UUID_REGEX.test(str)) {
    const msg = which !== void 0 ? `Invalid UUID for ${which}: ${str}` : `Invalid UUID: ${str}`;
    throw new Error(msg);
  }
  return str;
}
function uuid7FromTime(timestamp2) {
  const msecs = typeof timestamp2 === "string" ? Date.parse(timestamp2) : timestamp2;
  return v7_default({ msecs, seq: 0 });
}
var UUID_REGEX;
var init_uuid = __esm({
  "node_modules/langsmith/dist/utils/_uuid.js"() {
    init_esm_node();
    init_warn();
    UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  }
});

// node_modules/langsmith/dist/uuid.js
var init_uuid2 = __esm({
  "node_modules/langsmith/dist/uuid.js"() {
    init_uuid();
  }
});

// node_modules/langsmith/dist/index.js
var __version__;
var init_dist = __esm({
  "node_modules/langsmith/dist/index.js"() {
    init_client();
    init_run_trees();
    init_fetch();
    init_project();
    init_uuid2();
    __version__ = "0.3.87";
  }
});

// node_modules/langsmith/dist/utils/env.js
function getRuntimeEnvironment() {
  if (runtimeEnvironment === void 0) {
    const env2 = getEnv();
    const releaseEnv = getShas();
    runtimeEnvironment = {
      library: "langsmith",
      runtime: env2,
      sdk: "langsmith-js",
      sdk_version: __version__,
      ...releaseEnv
    };
  }
  return runtimeEnvironment;
}
function getLangSmithEnvVarsMetadata() {
  const allEnvVars = getLangSmithEnvironmentVariables();
  const envVars = {};
  const excluded = [
    "LANGCHAIN_API_KEY",
    "LANGCHAIN_ENDPOINT",
    "LANGCHAIN_TRACING_V2",
    "LANGCHAIN_PROJECT",
    "LANGCHAIN_SESSION",
    "LANGSMITH_API_KEY",
    "LANGSMITH_ENDPOINT",
    "LANGSMITH_TRACING_V2",
    "LANGSMITH_PROJECT",
    "LANGSMITH_SESSION"
  ];
  for (const [key, value] of Object.entries(allEnvVars)) {
    if (typeof value === "string" && !excluded.includes(key) && !key.toLowerCase().includes("key") && !key.toLowerCase().includes("secret") && !key.toLowerCase().includes("token")) {
      if (key === "LANGCHAIN_REVISION_ID") {
        envVars["revision_id"] = value;
      } else {
        envVars[key] = value;
      }
    }
  }
  return envVars;
}
function getLangSmithEnvironmentVariables() {
  const envVars = {};
  try {
    if (typeof process !== "undefined" && process.env) {
      for (const [key, value] of Object.entries(process.env)) {
        if ((key.startsWith("LANGCHAIN_") || key.startsWith("LANGSMITH_")) && value != null) {
          if ((key.toLowerCase().includes("key") || key.toLowerCase().includes("secret") || key.toLowerCase().includes("token")) && typeof value === "string") {
            envVars[key] = value.slice(0, 2) + "*".repeat(value.length - 4) + value.slice(-2);
          } else {
            envVars[key] = value;
          }
        }
      }
    }
  } catch (e) {
  }
  return envVars;
}
function getEnvironmentVariable(name) {
  try {
    return typeof process !== "undefined" ? (
      // eslint-disable-next-line no-process-env
      process.env?.[name]
    ) : void 0;
  } catch (e) {
    return void 0;
  }
}
function getLangSmithEnvironmentVariable(name) {
  return getEnvironmentVariable(`LANGSMITH_${name}`) || getEnvironmentVariable(`LANGCHAIN_${name}`);
}
function getShas() {
  if (cachedCommitSHAs !== void 0) {
    return cachedCommitSHAs;
  }
  const common_release_envs = [
    "VERCEL_GIT_COMMIT_SHA",
    "NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA",
    "COMMIT_REF",
    "RENDER_GIT_COMMIT",
    "CI_COMMIT_SHA",
    "CIRCLE_SHA1",
    "CF_PAGES_COMMIT_SHA",
    "REACT_APP_GIT_SHA",
    "SOURCE_VERSION",
    "GITHUB_SHA",
    "TRAVIS_COMMIT",
    "GIT_COMMIT",
    "BUILD_VCS_NUMBER",
    "bamboo_planRepository_revision",
    "Build.SourceVersion",
    "BITBUCKET_COMMIT",
    "DRONE_COMMIT_SHA",
    "SEMAPHORE_GIT_SHA",
    "BUILDKITE_COMMIT"
  ];
  const shas = {};
  for (const env2 of common_release_envs) {
    const envVar = getEnvironmentVariable(env2);
    if (envVar !== void 0) {
      shas[env2] = envVar;
    }
  }
  cachedCommitSHAs = shas;
  return shas;
}
function getOtelEnabled() {
  return getEnvironmentVariable("OTEL_ENABLED") === "true" || getLangSmithEnvironmentVariable("OTEL_ENABLED") === "true";
}
var globalEnv, isBrowser, isWebWorker, isJsDom, isDeno, isNode, getEnv, runtimeEnvironment, cachedCommitSHAs;
var init_env = __esm({
  "node_modules/langsmith/dist/utils/env.js"() {
    init_dist();
    isBrowser = () => typeof window !== "undefined" && typeof window.document !== "undefined";
    isWebWorker = () => typeof globalThis === "object" && globalThis.constructor && globalThis.constructor.name === "DedicatedWorkerGlobalScope";
    isJsDom = () => typeof window !== "undefined" && window.name === "nodejs" || typeof navigator !== "undefined" && navigator.userAgent.includes("jsdom");
    isDeno = () => typeof Deno !== "undefined";
    isNode = () => typeof process !== "undefined" && typeof process.versions !== "undefined" && typeof process.versions.node !== "undefined" && !isDeno();
    getEnv = () => {
      if (globalEnv) {
        return globalEnv;
      }
      if (typeof Bun !== "undefined") {
        globalEnv = "bun";
      } else if (isBrowser()) {
        globalEnv = "browser";
      } else if (isNode()) {
        globalEnv = "node";
      } else if (isWebWorker()) {
        globalEnv = "webworker";
      } else if (isJsDom()) {
        globalEnv = "jsdom";
      } else if (isDeno()) {
        globalEnv = "deno";
      } else {
        globalEnv = "other";
      }
      return globalEnv;
    };
  }
});

// node_modules/langsmith/dist/singletons/otel.js
function getOTELTrace() {
  return OTELProviderSingleton.getTraceInstance();
}
function getOTELContext() {
  return OTELProviderSingleton.getContextInstance();
}
function getDefaultOTLPTracerComponents() {
  return OTELProviderSingleton.getDefaultOTLPTracerComponents();
}
var MockTracer, MockOTELTrace, MockOTELContext, OTEL_TRACE_KEY, OTEL_CONTEXT_KEY, OTEL_GET_DEFAULT_OTLP_TRACER_PROVIDER_KEY, mockOTELTrace, mockOTELContext, OTELProvider, OTELProviderSingleton;
var init_otel = __esm({
  "node_modules/langsmith/dist/singletons/otel.js"() {
    init_env();
    MockTracer = class {
      constructor() {
        Object.defineProperty(this, "hasWarned", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: false
        });
      }
      startActiveSpan(_name, ...args) {
        if (!this.hasWarned && getOtelEnabled()) {
          console.warn('You have enabled OTEL export via the `OTEL_ENABLED` or `LANGSMITH_OTEL_ENABLED` environment variable, but have not initialized the required OTEL instances. Please add:\n```\nimport { initializeOTEL } from "langsmith/experimental/otel/setup";\ninitializeOTEL();\n```\nat the beginning of your code.');
          this.hasWarned = true;
        }
        let fn;
        if (args.length === 1 && typeof args[0] === "function") {
          fn = args[0];
        } else if (args.length === 2 && typeof args[1] === "function") {
          fn = args[1];
        } else if (args.length === 3 && typeof args[2] === "function") {
          fn = args[2];
        }
        if (typeof fn === "function") {
          return fn();
        }
        return void 0;
      }
    };
    MockOTELTrace = class {
      constructor() {
        Object.defineProperty(this, "mockTracer", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: new MockTracer()
        });
      }
      getTracer(_name, _version) {
        return this.mockTracer;
      }
      getActiveSpan() {
        return void 0;
      }
      setSpan(context, _span) {
        return context;
      }
      getSpan(_context) {
        return void 0;
      }
      setSpanContext(context, _spanContext) {
        return context;
      }
      getTracerProvider() {
        return void 0;
      }
      setGlobalTracerProvider(_tracerProvider) {
        return false;
      }
    };
    MockOTELContext = class {
      active() {
        return {};
      }
      with(_context, fn) {
        return fn();
      }
    };
    OTEL_TRACE_KEY = /* @__PURE__ */ Symbol.for("ls:otel_trace");
    OTEL_CONTEXT_KEY = /* @__PURE__ */ Symbol.for("ls:otel_context");
    OTEL_GET_DEFAULT_OTLP_TRACER_PROVIDER_KEY = /* @__PURE__ */ Symbol.for("ls:otel_get_default_otlp_tracer_provider");
    mockOTELTrace = new MockOTELTrace();
    mockOTELContext = new MockOTELContext();
    OTELProvider = class {
      getTraceInstance() {
        return globalThis[OTEL_TRACE_KEY] ?? mockOTELTrace;
      }
      getContextInstance() {
        return globalThis[OTEL_CONTEXT_KEY] ?? mockOTELContext;
      }
      initializeGlobalInstances(otel) {
        if (globalThis[OTEL_TRACE_KEY] === void 0) {
          globalThis[OTEL_TRACE_KEY] = otel.trace;
        }
        if (globalThis[OTEL_CONTEXT_KEY] === void 0) {
          globalThis[OTEL_CONTEXT_KEY] = otel.context;
        }
      }
      setDefaultOTLPTracerComponents(components) {
        globalThis[OTEL_GET_DEFAULT_OTLP_TRACER_PROVIDER_KEY] = components;
      }
      getDefaultOTLPTracerComponents() {
        return globalThis[OTEL_GET_DEFAULT_OTLP_TRACER_PROVIDER_KEY] ?? void 0;
      }
    };
    OTELProviderSingleton = new OTELProvider();
  }
});

// node_modules/langsmith/dist/experimental/otel/translator.js
function getOperationName(runType) {
  return WELL_KNOWN_OPERATION_NAMES[runType] || runType;
}
var WELL_KNOWN_OPERATION_NAMES, LangSmithToOTELTranslator;
var init_translator = __esm({
  "node_modules/langsmith/dist/experimental/otel/translator.js"() {
    init_constants();
    init_otel();
    WELL_KNOWN_OPERATION_NAMES = {
      llm: "chat",
      tool: "execute_tool",
      retriever: "embeddings",
      embedding: "embeddings",
      prompt: "chat"
    };
    LangSmithToOTELTranslator = class {
      constructor() {
        Object.defineProperty(this, "spans", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: /* @__PURE__ */ new Map()
        });
      }
      exportBatch(operations, otelContextMap) {
        for (const op of operations) {
          try {
            if (!op.run) {
              continue;
            }
            if (op.operation === "post") {
              const span = this.createSpanForRun(op, op.run, otelContextMap.get(op.id));
              if (span && !op.run.end_time) {
                this.spans.set(op.id, span);
              }
            } else {
              this.updateSpanForRun(op, op.run);
            }
          } catch (e) {
            console.error(`Error processing operation ${op.id}:`, e);
          }
        }
      }
      createSpanForRun(op, runInfo, otelContext) {
        const activeSpan = otelContext && getOTELTrace().getSpan(otelContext);
        if (!activeSpan) {
          return;
        }
        try {
          return this.finishSpanSetup(activeSpan, runInfo, op);
        } catch (e) {
          console.error(`Failed to create span for run ${op.id}:`, e);
          return void 0;
        }
      }
      finishSpanSetup(span, runInfo, op) {
        this.setSpanAttributes(span, runInfo, op);
        if (runInfo.error) {
          span.setStatus({ code: 2 });
          span.recordException(new Error(runInfo.error));
        } else {
          span.setStatus({ code: 1 });
        }
        if (runInfo.end_time) {
          span.end(new Date(runInfo.end_time));
        }
        return span;
      }
      updateSpanForRun(op, runInfo) {
        try {
          const span = this.spans.get(op.id);
          if (!span) {
            console.debug(`No span found for run ${op.id} during update`);
            return;
          }
          this.setSpanAttributes(span, runInfo, op);
          if (runInfo.error) {
            span.setStatus({ code: 2 });
            span.recordException(new Error(runInfo.error));
          } else {
            span.setStatus({ code: 1 });
          }
          const endTime = runInfo.end_time;
          if (endTime) {
            span.end(new Date(endTime));
            this.spans.delete(op.id);
          }
        } catch (e) {
          console.error(`Failed to update span for run ${op.id}:`, e);
        }
      }
      extractModelName(runInfo) {
        if (runInfo.extra?.metadata) {
          const metadata = runInfo.extra.metadata;
          if (metadata.ls_model_name) {
            return metadata.ls_model_name;
          }
          if (metadata.invocation_params) {
            const invocationParams = metadata.invocation_params;
            if (invocationParams.model) {
              return invocationParams.model;
            } else if (invocationParams.model_name) {
              return invocationParams.model_name;
            }
          }
        }
        return;
      }
      setSpanAttributes(span, runInfo, op) {
        if ("run_type" in runInfo && runInfo.run_type) {
          span.setAttribute(LANGSMITH_RUN_TYPE, runInfo.run_type);
          const operationName = getOperationName(runInfo.run_type || "chain");
          span.setAttribute(GEN_AI_OPERATION_NAME, operationName);
        }
        if ("name" in runInfo && runInfo.name) {
          span.setAttribute(LANGSMITH_NAME, runInfo.name);
        }
        if ("session_id" in runInfo && runInfo.session_id) {
          span.setAttribute(LANGSMITH_SESSION_ID, runInfo.session_id);
        }
        if ("session_name" in runInfo && runInfo.session_name) {
          span.setAttribute(LANGSMITH_SESSION_NAME, runInfo.session_name);
        }
        this.setGenAiSystem(span, runInfo);
        const modelName = this.extractModelName(runInfo);
        if (modelName) {
          span.setAttribute(GEN_AI_REQUEST_MODEL, modelName);
        }
        if ("prompt_tokens" in runInfo && typeof runInfo.prompt_tokens === "number") {
          span.setAttribute(GEN_AI_USAGE_INPUT_TOKENS, runInfo.prompt_tokens);
        }
        if ("completion_tokens" in runInfo && typeof runInfo.completion_tokens === "number") {
          span.setAttribute(GEN_AI_USAGE_OUTPUT_TOKENS, runInfo.completion_tokens);
        }
        if ("total_tokens" in runInfo && typeof runInfo.total_tokens === "number") {
          span.setAttribute(GEN_AI_USAGE_TOTAL_TOKENS, runInfo.total_tokens);
        }
        this.setInvocationParameters(span, runInfo);
        const metadata = runInfo.extra?.metadata || {};
        for (const [key, value] of Object.entries(metadata)) {
          if (value !== null && value !== void 0) {
            span.setAttribute(`${LANGSMITH_METADATA}.${key}`, String(value));
          }
        }
        const tags = runInfo.tags;
        if (tags && Array.isArray(tags)) {
          span.setAttribute(LANGSMITH_TAGS, tags.join(", "));
        } else if (tags) {
          span.setAttribute(LANGSMITH_TAGS, String(tags));
        }
        if ("serialized" in runInfo && typeof runInfo.serialized === "object") {
          const serialized = runInfo.serialized;
          if (serialized.name) {
            span.setAttribute(GEN_AI_SERIALIZED_NAME, String(serialized.name));
          }
          if (serialized.signature) {
            span.setAttribute(GEN_AI_SERIALIZED_SIGNATURE, String(serialized.signature));
          }
          if (serialized.doc) {
            span.setAttribute(GEN_AI_SERIALIZED_DOC, String(serialized.doc));
          }
        }
        this.setIOAttributes(span, op);
      }
      setGenAiSystem(span, runInfo) {
        let system = "langchain";
        const modelName = this.extractModelName(runInfo);
        if (modelName) {
          const modelLower = modelName.toLowerCase();
          if (modelLower.includes("anthropic") || modelLower.startsWith("claude")) {
            system = "anthropic";
          } else if (modelLower.includes("bedrock")) {
            system = "aws.bedrock";
          } else if (modelLower.includes("azure") && modelLower.includes("openai")) {
            system = "az.ai.openai";
          } else if (modelLower.includes("azure") && modelLower.includes("inference")) {
            system = "az.ai.inference";
          } else if (modelLower.includes("cohere")) {
            system = "cohere";
          } else if (modelLower.includes("deepseek")) {
            system = "deepseek";
          } else if (modelLower.includes("gemini")) {
            system = "gemini";
          } else if (modelLower.includes("groq")) {
            system = "groq";
          } else if (modelLower.includes("watson") || modelLower.includes("ibm")) {
            system = "ibm.watsonx.ai";
          } else if (modelLower.includes("mistral")) {
            system = "mistral_ai";
          } else if (modelLower.includes("gpt") || modelLower.includes("openai")) {
            system = "openai";
          } else if (modelLower.includes("perplexity") || modelLower.includes("sonar")) {
            system = "perplexity";
          } else if (modelLower.includes("vertex")) {
            system = "vertex_ai";
          } else if (modelLower.includes("xai") || modelLower.includes("grok")) {
            system = "xai";
          }
        }
        span.setAttribute(GEN_AI_SYSTEM, system);
      }
      setInvocationParameters(span, runInfo) {
        if (!runInfo.extra?.metadata?.invocation_params) {
          return;
        }
        const invocationParams = runInfo.extra.metadata.invocation_params;
        if (invocationParams.max_tokens !== void 0) {
          span.setAttribute(GEN_AI_REQUEST_MAX_TOKENS, invocationParams.max_tokens);
        }
        if (invocationParams.temperature !== void 0) {
          span.setAttribute(GEN_AI_REQUEST_TEMPERATURE, invocationParams.temperature);
        }
        if (invocationParams.top_p !== void 0) {
          span.setAttribute(GEN_AI_REQUEST_TOP_P, invocationParams.top_p);
        }
        if (invocationParams.frequency_penalty !== void 0) {
          span.setAttribute(GEN_AI_REQUEST_FREQUENCY_PENALTY, invocationParams.frequency_penalty);
        }
        if (invocationParams.presence_penalty !== void 0) {
          span.setAttribute(GEN_AI_REQUEST_PRESENCE_PENALTY, invocationParams.presence_penalty);
        }
      }
      setIOAttributes(span, op) {
        if (op.run.inputs) {
          try {
            const inputs = op.run.inputs;
            if (typeof inputs === "object" && inputs !== null) {
              if (inputs.model && Array.isArray(inputs.messages)) {
                span.setAttribute(GEN_AI_REQUEST_MODEL, inputs.model);
              }
              if (inputs.stream !== void 0) {
                span.setAttribute(LANGSMITH_REQUEST_STREAMING, inputs.stream);
              }
              if (inputs.extra_headers) {
                span.setAttribute(LANGSMITH_REQUEST_HEADERS, JSON.stringify(inputs.extra_headers));
              }
              if (inputs.extra_query) {
                span.setAttribute(GEN_AI_REQUEST_EXTRA_QUERY, JSON.stringify(inputs.extra_query));
              }
              if (inputs.extra_body) {
                span.setAttribute(GEN_AI_REQUEST_EXTRA_BODY, JSON.stringify(inputs.extra_body));
              }
            }
            span.setAttribute(GENAI_PROMPT, JSON.stringify(inputs));
          } catch (e) {
            console.debug(`Failed to process inputs for run ${op.id}`, e);
          }
        }
        if (op.run.outputs) {
          try {
            const outputs = op.run.outputs;
            const tokenUsage = this.getUnifiedRunTokens(outputs);
            if (tokenUsage) {
              span.setAttribute(GEN_AI_USAGE_INPUT_TOKENS, tokenUsage[0]);
              span.setAttribute(GEN_AI_USAGE_OUTPUT_TOKENS, tokenUsage[1]);
              span.setAttribute(GEN_AI_USAGE_TOTAL_TOKENS, tokenUsage[0] + tokenUsage[1]);
            }
            if (outputs && typeof outputs === "object") {
              if (outputs.model) {
                span.setAttribute(GEN_AI_RESPONSE_MODEL, String(outputs.model));
              }
              if (outputs.id) {
                span.setAttribute(GEN_AI_RESPONSE_ID, outputs.id);
              }
              if (outputs.choices && Array.isArray(outputs.choices)) {
                const finishReasons = outputs.choices.map((choice) => choice.finish_reason).filter((reason) => reason).map(String);
                if (finishReasons.length > 0) {
                  span.setAttribute(GEN_AI_RESPONSE_FINISH_REASONS, finishReasons.join(", "));
                }
              }
              if (outputs.service_tier) {
                span.setAttribute(GEN_AI_RESPONSE_SERVICE_TIER, outputs.service_tier);
              }
              if (outputs.system_fingerprint) {
                span.setAttribute(GEN_AI_RESPONSE_SYSTEM_FINGERPRINT, outputs.system_fingerprint);
              }
              if (outputs.usage_metadata && typeof outputs.usage_metadata === "object") {
                const usageMetadata = outputs.usage_metadata;
                if (usageMetadata.input_token_details) {
                  span.setAttribute(GEN_AI_USAGE_INPUT_TOKEN_DETAILS, JSON.stringify(usageMetadata.input_token_details));
                }
                if (usageMetadata.output_token_details) {
                  span.setAttribute(GEN_AI_USAGE_OUTPUT_TOKEN_DETAILS, JSON.stringify(usageMetadata.output_token_details));
                }
              }
            }
            span.setAttribute(GENAI_COMPLETION, JSON.stringify(outputs));
          } catch (e) {
            console.debug(`Failed to process outputs for run ${op.id}`, e);
          }
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getUnifiedRunTokens(outputs) {
        if (!outputs) {
          return null;
        }
        let tokenUsage = this.extractUnifiedRunTokens(outputs.usage_metadata);
        if (tokenUsage) {
          return tokenUsage;
        }
        const keys = Object.keys(outputs);
        for (const key of keys) {
          const haystack = outputs[key];
          if (!haystack || typeof haystack !== "object") {
            continue;
          }
          tokenUsage = this.extractUnifiedRunTokens(haystack.usage_metadata);
          if (tokenUsage) {
            return tokenUsage;
          }
          if (haystack.lc === 1 && haystack.kwargs && typeof haystack.kwargs === "object") {
            tokenUsage = this.extractUnifiedRunTokens(haystack.kwargs.usage_metadata);
            if (tokenUsage) {
              return tokenUsage;
            }
          }
        }
        const generations = outputs.generations || [];
        if (!Array.isArray(generations)) {
          return null;
        }
        const flatGenerations = Array.isArray(generations[0]) ? generations.flat() : generations;
        for (const generation of flatGenerations) {
          if (typeof generation === "object" && generation.message && typeof generation.message === "object" && generation.message.kwargs && typeof generation.message.kwargs === "object") {
            tokenUsage = this.extractUnifiedRunTokens(generation.message.kwargs.usage_metadata);
            if (tokenUsage) {
              return tokenUsage;
            }
          }
        }
        return null;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      extractUnifiedRunTokens(outputs) {
        if (!outputs || typeof outputs !== "object") {
          return null;
        }
        if (typeof outputs.input_tokens !== "number" || typeof outputs.output_tokens !== "number") {
          return null;
        }
        return [outputs.input_tokens, outputs.output_tokens];
      }
    };
  }
});

// node_modules/langsmith/dist/utils/is-network-error/index.js
function isNetworkError(error) {
  const isValid = error && isError(error) && error.name === "TypeError" && typeof error.message === "string";
  if (!isValid) {
    return false;
  }
  const { message, stack } = error;
  if (message === "Load failed") {
    return stack === void 0 || // Sentry adds its own stack trace to the fetch error, so also check for that
    "__sentry_captured__" in error;
  }
  if (message.startsWith("error sending request for url")) {
    return true;
  }
  return errorMessages.has(message);
}
var objectToString, isError, errorMessages;
var init_is_network_error = __esm({
  "node_modules/langsmith/dist/utils/is-network-error/index.js"() {
    objectToString = Object.prototype.toString;
    isError = (value) => objectToString.call(value) === "[object Error]";
    errorMessages = /* @__PURE__ */ new Set([
      "network error",
      // Chrome
      "Failed to fetch",
      // Chrome
      "NetworkError when attempting to fetch resource.",
      // Firefox
      "The Internet connection appears to be offline.",
      // Safari 16
      "Network request failed",
      // `cross-fetch`
      "fetch failed",
      // Undici (Node.js)
      "terminated",
      // Undici (Node.js)
      " A network error occurred.",
      // Bun (WebKit)
      "Network connection lost"
      // Cloudflare Workers (fetch)
    ]);
  }
});

// node_modules/langsmith/dist/utils/p-retry/index.js
function validateRetries(retries) {
  if (typeof retries === "number") {
    if (retries < 0) {
      throw new TypeError("Expected `retries` to be a non-negative number.");
    }
    if (Number.isNaN(retries)) {
      throw new TypeError("Expected `retries` to be a valid number or Infinity, got NaN.");
    }
  } else if (retries !== void 0) {
    throw new TypeError("Expected `retries` to be a number or Infinity.");
  }
}
function validateNumberOption(name, value, { min = 0, allowInfinity = false } = {}) {
  if (value === void 0) {
    return;
  }
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new TypeError(`Expected \`${name}\` to be a number${allowInfinity ? " or Infinity" : ""}.`);
  }
  if (!allowInfinity && !Number.isFinite(value)) {
    throw new TypeError(`Expected \`${name}\` to be a finite number.`);
  }
  if (value < min) {
    throw new TypeError(`Expected \`${name}\` to be \u2265 ${min}.`);
  }
}
function calculateDelay(retriesConsumed, options) {
  const attempt = Math.max(1, retriesConsumed + 1);
  const random = options.randomize ? Math.random() + 1 : 1;
  let timeout = Math.round(random * options.minTimeout * options.factor ** (attempt - 1));
  timeout = Math.min(timeout, options.maxTimeout);
  return timeout;
}
function calculateRemainingTime(start, max) {
  if (!Number.isFinite(max)) {
    return max;
  }
  return max - (performance.now() - start);
}
async function onAttemptFailure({ error, attemptNumber, retriesConsumed, startTime, options }) {
  const normalizedError = error instanceof Error ? error : new TypeError(`Non-error was thrown: "${error}". You should only throw errors.`);
  if (normalizedError instanceof AbortError) {
    throw normalizedError.originalError;
  }
  const retriesLeft = Number.isFinite(options.retries) ? Math.max(0, options.retries - retriesConsumed) : options.retries;
  const maxRetryTime = options.maxRetryTime ?? Number.POSITIVE_INFINITY;
  const context = Object.freeze({
    error: normalizedError,
    attemptNumber,
    retriesLeft,
    retriesConsumed
  });
  await options.onFailedAttempt(context);
  if (calculateRemainingTime(startTime, maxRetryTime) <= 0) {
    throw normalizedError;
  }
  const consumeRetry = await options.shouldConsumeRetry(context);
  const remainingTime = calculateRemainingTime(startTime, maxRetryTime);
  if (remainingTime <= 0 || retriesLeft <= 0) {
    throw normalizedError;
  }
  if (normalizedError instanceof TypeError && !isNetworkError(normalizedError)) {
    if (consumeRetry) {
      throw normalizedError;
    }
    options.signal?.throwIfAborted();
    return false;
  }
  if (!await options.shouldRetry(context)) {
    throw normalizedError;
  }
  if (!consumeRetry) {
    options.signal?.throwIfAborted();
    return false;
  }
  const delayTime = calculateDelay(retriesConsumed, options);
  const finalDelay = Math.min(delayTime, remainingTime);
  if (finalDelay > 0) {
    await new Promise((resolve, reject) => {
      const onAbort = () => {
        clearTimeout(timeoutToken);
        options.signal?.removeEventListener("abort", onAbort);
        reject(options.signal.reason);
      };
      const timeoutToken = setTimeout(() => {
        options.signal?.removeEventListener("abort", onAbort);
        resolve();
      }, finalDelay);
      if (options.unref) {
        timeoutToken.unref?.();
      }
      options.signal?.addEventListener("abort", onAbort, { once: true });
    });
  }
  options.signal?.throwIfAborted();
  return true;
}
async function pRetry(input, options = {}) {
  options = { ...options };
  validateRetries(options.retries);
  if (Object.hasOwn(options, "forever")) {
    throw new Error("The `forever` option is no longer supported. For many use-cases, you can set `retries: Infinity` instead.");
  }
  options.retries ??= 10;
  options.factor ??= 2;
  options.minTimeout ??= 1e3;
  options.maxTimeout ??= Number.POSITIVE_INFINITY;
  options.maxRetryTime ??= Number.POSITIVE_INFINITY;
  options.randomize ??= false;
  options.onFailedAttempt ??= () => {
  };
  options.shouldRetry ??= () => true;
  options.shouldConsumeRetry ??= () => true;
  validateNumberOption("factor", options.factor, {
    min: 0,
    allowInfinity: false
  });
  validateNumberOption("minTimeout", options.minTimeout, {
    min: 0,
    allowInfinity: false
  });
  validateNumberOption("maxTimeout", options.maxTimeout, {
    min: 0,
    allowInfinity: true
  });
  validateNumberOption("maxRetryTime", options.maxRetryTime, {
    min: 0,
    allowInfinity: true
  });
  if (!(options.factor > 0)) {
    options.factor = 1;
  }
  options.signal?.throwIfAborted();
  let attemptNumber = 0;
  let retriesConsumed = 0;
  const startTime = performance.now();
  while (Number.isFinite(options.retries) ? retriesConsumed <= options.retries : true) {
    attemptNumber++;
    try {
      options.signal?.throwIfAborted();
      const result = await input(attemptNumber);
      options.signal?.throwIfAborted();
      return result;
    } catch (error) {
      if (await onAttemptFailure({
        error,
        attemptNumber,
        retriesConsumed,
        startTime,
        options
      })) {
        retriesConsumed++;
      }
    }
  }
  throw new Error("Retry attempts exhausted without throwing an error.");
}
var AbortError;
var init_p_retry = __esm({
  "node_modules/langsmith/dist/utils/p-retry/index.js"() {
    init_is_network_error();
    AbortError = class extends Error {
      constructor(message) {
        super();
        if (message instanceof Error) {
          this.originalError = message;
          ({ message } = message);
        } else {
          this.originalError = new Error(message);
          this.originalError.stack = this.stack;
        }
        this.name = "AbortError";
        this.message = message;
      }
    };
  }
});

// node_modules/eventemitter3/index.js
var require_eventemitter3 = __commonJS({
  "node_modules/eventemitter3/index.js"(exports2, module2) {
    "use strict";
    var has = Object.prototype.hasOwnProperty;
    var prefix = "~";
    function Events() {
    }
    if (Object.create) {
      Events.prototype = /* @__PURE__ */ Object.create(null);
      if (!new Events().__proto__) prefix = false;
    }
    function EE(fn, context, once) {
      this.fn = fn;
      this.context = context;
      this.once = once || false;
    }
    function addListener(emitter, event, fn, context, once) {
      if (typeof fn !== "function") {
        throw new TypeError("The listener must be a function");
      }
      var listener = new EE(fn, context || emitter, once), evt = prefix ? prefix + event : event;
      if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
      else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
      else emitter._events[evt] = [emitter._events[evt], listener];
      return emitter;
    }
    function clearEvent(emitter, evt) {
      if (--emitter._eventsCount === 0) emitter._events = new Events();
      else delete emitter._events[evt];
    }
    function EventEmitter() {
      this._events = new Events();
      this._eventsCount = 0;
    }
    EventEmitter.prototype.eventNames = function eventNames() {
      var names = [], events, name;
      if (this._eventsCount === 0) return names;
      for (name in events = this._events) {
        if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
      }
      if (Object.getOwnPropertySymbols) {
        return names.concat(Object.getOwnPropertySymbols(events));
      }
      return names;
    };
    EventEmitter.prototype.listeners = function listeners(event) {
      var evt = prefix ? prefix + event : event, handlers = this._events[evt];
      if (!handlers) return [];
      if (handlers.fn) return [handlers.fn];
      for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
        ee[i] = handlers[i].fn;
      }
      return ee;
    };
    EventEmitter.prototype.listenerCount = function listenerCount(event) {
      var evt = prefix ? prefix + event : event, listeners = this._events[evt];
      if (!listeners) return 0;
      if (listeners.fn) return 1;
      return listeners.length;
    };
    EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
      var evt = prefix ? prefix + event : event;
      if (!this._events[evt]) return false;
      var listeners = this._events[evt], len = arguments.length, args, i;
      if (listeners.fn) {
        if (listeners.once) this.removeListener(event, listeners.fn, void 0, true);
        switch (len) {
          case 1:
            return listeners.fn.call(listeners.context), true;
          case 2:
            return listeners.fn.call(listeners.context, a1), true;
          case 3:
            return listeners.fn.call(listeners.context, a1, a2), true;
          case 4:
            return listeners.fn.call(listeners.context, a1, a2, a3), true;
          case 5:
            return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
          case 6:
            return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
        }
        for (i = 1, args = new Array(len - 1); i < len; i++) {
          args[i - 1] = arguments[i];
        }
        listeners.fn.apply(listeners.context, args);
      } else {
        var length = listeners.length, j;
        for (i = 0; i < length; i++) {
          if (listeners[i].once) this.removeListener(event, listeners[i].fn, void 0, true);
          switch (len) {
            case 1:
              listeners[i].fn.call(listeners[i].context);
              break;
            case 2:
              listeners[i].fn.call(listeners[i].context, a1);
              break;
            case 3:
              listeners[i].fn.call(listeners[i].context, a1, a2);
              break;
            case 4:
              listeners[i].fn.call(listeners[i].context, a1, a2, a3);
              break;
            default:
              if (!args) for (j = 1, args = new Array(len - 1); j < len; j++) {
                args[j - 1] = arguments[j];
              }
              listeners[i].fn.apply(listeners[i].context, args);
          }
        }
      }
      return true;
    };
    EventEmitter.prototype.on = function on(event, fn, context) {
      return addListener(this, event, fn, context, false);
    };
    EventEmitter.prototype.once = function once(event, fn, context) {
      return addListener(this, event, fn, context, true);
    };
    EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
      var evt = prefix ? prefix + event : event;
      if (!this._events[evt]) return this;
      if (!fn) {
        clearEvent(this, evt);
        return this;
      }
      var listeners = this._events[evt];
      if (listeners.fn) {
        if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) {
          clearEvent(this, evt);
        }
      } else {
        for (var i = 0, events = [], length = listeners.length; i < length; i++) {
          if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) {
            events.push(listeners[i]);
          }
        }
        if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
        else clearEvent(this, evt);
      }
      return this;
    };
    EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
      var evt;
      if (event) {
        evt = prefix ? prefix + event : event;
        if (this._events[evt]) clearEvent(this, evt);
      } else {
        this._events = new Events();
        this._eventsCount = 0;
      }
      return this;
    };
    EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
    EventEmitter.prototype.addListener = EventEmitter.prototype.on;
    EventEmitter.prefixed = prefix;
    EventEmitter.EventEmitter = EventEmitter;
    if ("undefined" !== typeof module2) {
      module2.exports = EventEmitter;
    }
  }
});

// node_modules/p-finally/index.js
var require_p_finally = __commonJS({
  "node_modules/p-finally/index.js"(exports2, module2) {
    "use strict";
    module2.exports = (promise, onFinally) => {
      onFinally = onFinally || (() => {
      });
      return promise.then(
        (val) => new Promise((resolve) => {
          resolve(onFinally());
        }).then(() => val),
        (err) => new Promise((resolve) => {
          resolve(onFinally());
        }).then(() => {
          throw err;
        })
      );
    };
  }
});

// node_modules/p-timeout/index.js
var require_p_timeout = __commonJS({
  "node_modules/p-timeout/index.js"(exports2, module2) {
    "use strict";
    var pFinally = require_p_finally();
    var TimeoutError = class extends Error {
      constructor(message) {
        super(message);
        this.name = "TimeoutError";
      }
    };
    var pTimeout = (promise, milliseconds, fallback) => new Promise((resolve, reject) => {
      if (typeof milliseconds !== "number" || milliseconds < 0) {
        throw new TypeError("Expected `milliseconds` to be a positive number");
      }
      if (milliseconds === Infinity) {
        resolve(promise);
        return;
      }
      const timer = setTimeout(() => {
        if (typeof fallback === "function") {
          try {
            resolve(fallback());
          } catch (error) {
            reject(error);
          }
          return;
        }
        const message = typeof fallback === "string" ? fallback : `Promise timed out after ${milliseconds} milliseconds`;
        const timeoutError = fallback instanceof Error ? fallback : new TimeoutError(message);
        if (typeof promise.cancel === "function") {
          promise.cancel();
        }
        reject(timeoutError);
      }, milliseconds);
      pFinally(
        // eslint-disable-next-line promise/prefer-await-to-then
        promise.then(resolve, reject),
        () => {
          clearTimeout(timer);
        }
      );
    });
    module2.exports = pTimeout;
    module2.exports.default = pTimeout;
    module2.exports.TimeoutError = TimeoutError;
  }
});

// node_modules/p-queue/dist/lower-bound.js
var require_lower_bound = __commonJS({
  "node_modules/p-queue/dist/lower-bound.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    function lowerBound(array, value, comparator) {
      let first = 0;
      let count = array.length;
      while (count > 0) {
        const step = count / 2 | 0;
        let it = first + step;
        if (comparator(array[it], value) <= 0) {
          first = ++it;
          count -= step + 1;
        } else {
          count = step;
        }
      }
      return first;
    }
    exports2.default = lowerBound;
  }
});

// node_modules/p-queue/dist/priority-queue.js
var require_priority_queue = __commonJS({
  "node_modules/p-queue/dist/priority-queue.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var lower_bound_1 = require_lower_bound();
    var PriorityQueue = class {
      constructor() {
        this._queue = [];
      }
      enqueue(run, options) {
        options = Object.assign({ priority: 0 }, options);
        const element = {
          priority: options.priority,
          run
        };
        if (this.size && this._queue[this.size - 1].priority >= options.priority) {
          this._queue.push(element);
          return;
        }
        const index = lower_bound_1.default(this._queue, element, (a, b) => b.priority - a.priority);
        this._queue.splice(index, 0, element);
      }
      dequeue() {
        const item = this._queue.shift();
        return item === null || item === void 0 ? void 0 : item.run;
      }
      filter(options) {
        return this._queue.filter((element) => element.priority === options.priority).map((element) => element.run);
      }
      get size() {
        return this._queue.length;
      }
    };
    exports2.default = PriorityQueue;
  }
});

// node_modules/p-queue/dist/index.js
var require_dist = __commonJS({
  "node_modules/p-queue/dist/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var EventEmitter = require_eventemitter3();
    var p_timeout_1 = require_p_timeout();
    var priority_queue_1 = require_priority_queue();
    var empty = () => {
    };
    var timeoutError = new p_timeout_1.TimeoutError();
    var PQueue = class extends EventEmitter {
      constructor(options) {
        var _a, _b, _c, _d;
        super();
        this._intervalCount = 0;
        this._intervalEnd = 0;
        this._pendingCount = 0;
        this._resolveEmpty = empty;
        this._resolveIdle = empty;
        options = Object.assign({ carryoverConcurrencyCount: false, intervalCap: Infinity, interval: 0, concurrency: Infinity, autoStart: true, queueClass: priority_queue_1.default }, options);
        if (!(typeof options.intervalCap === "number" && options.intervalCap >= 1)) {
          throw new TypeError(`Expected \`intervalCap\` to be a number from 1 and up, got \`${(_b = (_a = options.intervalCap) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : ""}\` (${typeof options.intervalCap})`);
        }
        if (options.interval === void 0 || !(Number.isFinite(options.interval) && options.interval >= 0)) {
          throw new TypeError(`Expected \`interval\` to be a finite number >= 0, got \`${(_d = (_c = options.interval) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : ""}\` (${typeof options.interval})`);
        }
        this._carryoverConcurrencyCount = options.carryoverConcurrencyCount;
        this._isIntervalIgnored = options.intervalCap === Infinity || options.interval === 0;
        this._intervalCap = options.intervalCap;
        this._interval = options.interval;
        this._queue = new options.queueClass();
        this._queueClass = options.queueClass;
        this.concurrency = options.concurrency;
        this._timeout = options.timeout;
        this._throwOnTimeout = options.throwOnTimeout === true;
        this._isPaused = options.autoStart === false;
      }
      get _doesIntervalAllowAnother() {
        return this._isIntervalIgnored || this._intervalCount < this._intervalCap;
      }
      get _doesConcurrentAllowAnother() {
        return this._pendingCount < this._concurrency;
      }
      _next() {
        this._pendingCount--;
        this._tryToStartAnother();
        this.emit("next");
      }
      _resolvePromises() {
        this._resolveEmpty();
        this._resolveEmpty = empty;
        if (this._pendingCount === 0) {
          this._resolveIdle();
          this._resolveIdle = empty;
          this.emit("idle");
        }
      }
      _onResumeInterval() {
        this._onInterval();
        this._initializeIntervalIfNeeded();
        this._timeoutId = void 0;
      }
      _isIntervalPaused() {
        const now = Date.now();
        if (this._intervalId === void 0) {
          const delay = this._intervalEnd - now;
          if (delay < 0) {
            this._intervalCount = this._carryoverConcurrencyCount ? this._pendingCount : 0;
          } else {
            if (this._timeoutId === void 0) {
              this._timeoutId = setTimeout(() => {
                this._onResumeInterval();
              }, delay);
            }
            return true;
          }
        }
        return false;
      }
      _tryToStartAnother() {
        if (this._queue.size === 0) {
          if (this._intervalId) {
            clearInterval(this._intervalId);
          }
          this._intervalId = void 0;
          this._resolvePromises();
          return false;
        }
        if (!this._isPaused) {
          const canInitializeInterval = !this._isIntervalPaused();
          if (this._doesIntervalAllowAnother && this._doesConcurrentAllowAnother) {
            const job = this._queue.dequeue();
            if (!job) {
              return false;
            }
            this.emit("active");
            job();
            if (canInitializeInterval) {
              this._initializeIntervalIfNeeded();
            }
            return true;
          }
        }
        return false;
      }
      _initializeIntervalIfNeeded() {
        if (this._isIntervalIgnored || this._intervalId !== void 0) {
          return;
        }
        this._intervalId = setInterval(() => {
          this._onInterval();
        }, this._interval);
        this._intervalEnd = Date.now() + this._interval;
      }
      _onInterval() {
        if (this._intervalCount === 0 && this._pendingCount === 0 && this._intervalId) {
          clearInterval(this._intervalId);
          this._intervalId = void 0;
        }
        this._intervalCount = this._carryoverConcurrencyCount ? this._pendingCount : 0;
        this._processQueue();
      }
      /**
      Executes all queued functions until it reaches the limit.
      */
      _processQueue() {
        while (this._tryToStartAnother()) {
        }
      }
      get concurrency() {
        return this._concurrency;
      }
      set concurrency(newConcurrency) {
        if (!(typeof newConcurrency === "number" && newConcurrency >= 1)) {
          throw new TypeError(`Expected \`concurrency\` to be a number from 1 and up, got \`${newConcurrency}\` (${typeof newConcurrency})`);
        }
        this._concurrency = newConcurrency;
        this._processQueue();
      }
      /**
      Adds a sync or async task to the queue. Always returns a promise.
      */
      async add(fn, options = {}) {
        return new Promise((resolve, reject) => {
          const run = async () => {
            this._pendingCount++;
            this._intervalCount++;
            try {
              const operation = this._timeout === void 0 && options.timeout === void 0 ? fn() : p_timeout_1.default(Promise.resolve(fn()), options.timeout === void 0 ? this._timeout : options.timeout, () => {
                if (options.throwOnTimeout === void 0 ? this._throwOnTimeout : options.throwOnTimeout) {
                  reject(timeoutError);
                }
                return void 0;
              });
              resolve(await operation);
            } catch (error) {
              reject(error);
            }
            this._next();
          };
          this._queue.enqueue(run, options);
          this._tryToStartAnother();
          this.emit("add");
        });
      }
      /**
          Same as `.add()`, but accepts an array of sync or async functions.
      
          @returns A promise that resolves when all functions are resolved.
          */
      async addAll(functions, options) {
        return Promise.all(functions.map(async (function_) => this.add(function_, options)));
      }
      /**
      Start (or resume) executing enqueued tasks within concurrency limit. No need to call this if queue is not paused (via `options.autoStart = false` or by `.pause()` method.)
      */
      start() {
        if (!this._isPaused) {
          return this;
        }
        this._isPaused = false;
        this._processQueue();
        return this;
      }
      /**
      Put queue execution on hold.
      */
      pause() {
        this._isPaused = true;
      }
      /**
      Clear the queue.
      */
      clear() {
        this._queue = new this._queueClass();
      }
      /**
          Can be called multiple times. Useful if you for example add additional items at a later time.
      
          @returns A promise that settles when the queue becomes empty.
          */
      async onEmpty() {
        if (this._queue.size === 0) {
          return;
        }
        return new Promise((resolve) => {
          const existingResolve = this._resolveEmpty;
          this._resolveEmpty = () => {
            existingResolve();
            resolve();
          };
        });
      }
      /**
          The difference with `.onEmpty` is that `.onIdle` guarantees that all work from the queue has finished. `.onEmpty` merely signals that the queue is empty, but it could mean that some promises haven't completed yet.
      
          @returns A promise that settles when the queue becomes empty, and all promises have completed; `queue.size === 0 && queue.pending === 0`.
          */
      async onIdle() {
        if (this._pendingCount === 0 && this._queue.size === 0) {
          return;
        }
        return new Promise((resolve) => {
          const existingResolve = this._resolveIdle;
          this._resolveIdle = () => {
            existingResolve();
            resolve();
          };
        });
      }
      /**
      Size of the queue.
      */
      get size() {
        return this._queue.size;
      }
      /**
          Size of the queue, filtered by the given options.
      
          For example, this can be used to find the number of items remaining in the queue with a specific priority level.
          */
      sizeBy(options) {
        return this._queue.filter(options).length;
      }
      /**
      Number of pending promises.
      */
      get pending() {
        return this._pendingCount;
      }
      /**
      Whether the queue is currently paused.
      */
      get isPaused() {
        return this._isPaused;
      }
      get timeout() {
        return this._timeout;
      }
      /**
      Set the timeout for future operations.
      */
      set timeout(milliseconds) {
        this._timeout = milliseconds;
      }
    };
    exports2.default = PQueue;
  }
});

// node_modules/langsmith/dist/utils/async_caller.js
var import_p_queue, STATUS_RETRYABLE, AsyncCaller;
var init_async_caller = __esm({
  "node_modules/langsmith/dist/utils/async_caller.js"() {
    init_p_retry();
    import_p_queue = __toESM(require_dist(), 1);
    STATUS_RETRYABLE = [
      408,
      // Request Timeout
      425,
      // Too Early
      429,
      // Too Many Requests
      500,
      // Internal Server Error
      502,
      // Bad Gateway
      503,
      // Service Unavailable
      504
      // Gateway Timeout
    ];
    AsyncCaller = class {
      constructor(params) {
        Object.defineProperty(this, "maxConcurrency", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "maxRetries", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "maxQueueSizeBytes", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "queue", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "onFailedResponseHook", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "queueSizeBytes", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: 0
        });
        this.maxConcurrency = params.maxConcurrency ?? Infinity;
        this.maxRetries = params.maxRetries ?? 6;
        this.maxQueueSizeBytes = params.maxQueueSizeBytes;
        if ("default" in import_p_queue.default) {
          this.queue = new import_p_queue.default.default({
            concurrency: this.maxConcurrency
          });
        } else {
          this.queue = new import_p_queue.default({ concurrency: this.maxConcurrency });
        }
        this.onFailedResponseHook = params?.onFailedResponseHook;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      call(callable, ...args) {
        return this.callWithOptions({}, callable, ...args);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      callWithOptions(options, callable, ...args) {
        const sizeBytes = options.sizeBytes ?? 0;
        if (this.maxQueueSizeBytes !== void 0 && sizeBytes > 0 && this.queueSizeBytes + sizeBytes > this.maxQueueSizeBytes) {
          return Promise.reject(new Error(`Queue size limit (${this.maxQueueSizeBytes} bytes) exceeded. Current queue size: ${this.queueSizeBytes} bytes, attempted addition: ${sizeBytes} bytes.`));
        }
        if (sizeBytes > 0) {
          this.queueSizeBytes += sizeBytes;
        }
        const onFailedResponseHook = this.onFailedResponseHook;
        let promise = this.queue.add(() => pRetry(() => callable(...args).catch((error) => {
          if (error instanceof Error) {
            throw error;
          } else {
            throw new Error(error);
          }
        }), {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          async onFailedAttempt({ error }) {
            if (error.message.startsWith("Cancel") || error.message.startsWith("TimeoutError") || error.name === "TimeoutError" || error.message.startsWith("AbortError")) {
              throw error;
            }
            if (error?.code === "ECONNABORTED") {
              throw error;
            }
            const response = error?.response;
            if (onFailedResponseHook) {
              const handled = await onFailedResponseHook(response);
              if (handled) {
                return;
              }
            }
            const status = response?.status ?? error?.status;
            if (status) {
              if (!STATUS_RETRYABLE.includes(+status)) {
                throw error;
              }
            }
          },
          retries: this.maxRetries,
          randomize: true
        }), { throwOnTimeout: true });
        if (sizeBytes > 0) {
          promise = promise.finally(() => {
            this.queueSizeBytes -= sizeBytes;
          });
        }
        if (options.signal) {
          return Promise.race([
            promise,
            new Promise((_, reject) => {
              options.signal?.addEventListener("abort", () => {
                reject(new Error("AbortError"));
              });
            })
          ]);
        }
        return promise;
      }
    };
  }
});

// node_modules/langsmith/dist/utils/messages.js
function isLangChainMessage(message) {
  return typeof message?._getType === "function";
}
function convertLangChainMessageToExample(message) {
  const converted = {
    type: message._getType(),
    data: { content: message.content }
  };
  if (message?.additional_kwargs && Object.keys(message.additional_kwargs).length > 0) {
    converted.data.additional_kwargs = { ...message.additional_kwargs };
  }
  return converted;
}
var init_messages = __esm({
  "node_modules/langsmith/dist/utils/messages.js"() {
  }
});

// node_modules/semver/internal/constants.js
var require_constants = __commonJS({
  "node_modules/semver/internal/constants.js"(exports2, module2) {
    "use strict";
    var SEMVER_SPEC_VERSION = "2.0.0";
    var MAX_LENGTH = 256;
    var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
    9007199254740991;
    var MAX_SAFE_COMPONENT_LENGTH = 16;
    var MAX_SAFE_BUILD_LENGTH = MAX_LENGTH - 6;
    var RELEASE_TYPES = [
      "major",
      "premajor",
      "minor",
      "preminor",
      "patch",
      "prepatch",
      "prerelease"
    ];
    module2.exports = {
      MAX_LENGTH,
      MAX_SAFE_COMPONENT_LENGTH,
      MAX_SAFE_BUILD_LENGTH,
      MAX_SAFE_INTEGER,
      RELEASE_TYPES,
      SEMVER_SPEC_VERSION,
      FLAG_INCLUDE_PRERELEASE: 1,
      FLAG_LOOSE: 2
    };
  }
});

// node_modules/semver/internal/debug.js
var require_debug = __commonJS({
  "node_modules/semver/internal/debug.js"(exports2, module2) {
    "use strict";
    var debug = typeof process === "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...args) => console.error("SEMVER", ...args) : () => {
    };
    module2.exports = debug;
  }
});

// node_modules/semver/internal/re.js
var require_re = __commonJS({
  "node_modules/semver/internal/re.js"(exports2, module2) {
    "use strict";
    var {
      MAX_SAFE_COMPONENT_LENGTH,
      MAX_SAFE_BUILD_LENGTH,
      MAX_LENGTH
    } = require_constants();
    var debug = require_debug();
    exports2 = module2.exports = {};
    var re = exports2.re = [];
    var safeRe = exports2.safeRe = [];
    var src = exports2.src = [];
    var safeSrc = exports2.safeSrc = [];
    var t = exports2.t = {};
    var R = 0;
    var LETTERDASHNUMBER = "[a-zA-Z0-9-]";
    var safeRegexReplacements = [
      ["\\s", 1],
      ["\\d", MAX_LENGTH],
      [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH]
    ];
    var makeSafeRegex = (value) => {
      for (const [token, max] of safeRegexReplacements) {
        value = value.split(`${token}*`).join(`${token}{0,${max}}`).split(`${token}+`).join(`${token}{1,${max}}`);
      }
      return value;
    };
    var createToken = (name, value, isGlobal) => {
      const safe = makeSafeRegex(value);
      const index = R++;
      debug(name, index, value);
      t[name] = index;
      src[index] = value;
      safeSrc[index] = safe;
      re[index] = new RegExp(value, isGlobal ? "g" : void 0);
      safeRe[index] = new RegExp(safe, isGlobal ? "g" : void 0);
    };
    createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*");
    createToken("NUMERICIDENTIFIERLOOSE", "\\d+");
    createToken("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);
    createToken("MAINVERSION", `(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})`);
    createToken("MAINVERSIONLOOSE", `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})`);
    createToken("PRERELEASEIDENTIFIER", `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIER]})`);
    createToken("PRERELEASEIDENTIFIERLOOSE", `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIERLOOSE]})`);
    createToken("PRERELEASE", `(?:-(${src[t.PRERELEASEIDENTIFIER]}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`);
    createToken("PRERELEASELOOSE", `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`);
    createToken("BUILDIDENTIFIER", `${LETTERDASHNUMBER}+`);
    createToken("BUILD", `(?:\\+(${src[t.BUILDIDENTIFIER]}(?:\\.${src[t.BUILDIDENTIFIER]})*))`);
    createToken("FULLPLAIN", `v?${src[t.MAINVERSION]}${src[t.PRERELEASE]}?${src[t.BUILD]}?`);
    createToken("FULL", `^${src[t.FULLPLAIN]}$`);
    createToken("LOOSEPLAIN", `[v=\\s]*${src[t.MAINVERSIONLOOSE]}${src[t.PRERELEASELOOSE]}?${src[t.BUILD]}?`);
    createToken("LOOSE", `^${src[t.LOOSEPLAIN]}$`);
    createToken("GTLT", "((?:<|>)?=?)");
    createToken("XRANGEIDENTIFIERLOOSE", `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
    createToken("XRANGEIDENTIFIER", `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);
    createToken("XRANGEPLAIN", `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:${src[t.PRERELEASE]})?${src[t.BUILD]}?)?)?`);
    createToken("XRANGEPLAINLOOSE", `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:${src[t.PRERELEASELOOSE]})?${src[t.BUILD]}?)?)?`);
    createToken("XRANGE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
    createToken("XRANGELOOSE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("COERCEPLAIN", `${"(^|[^\\d])(\\d{1,"}${MAX_SAFE_COMPONENT_LENGTH}})(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?`);
    createToken("COERCE", `${src[t.COERCEPLAIN]}(?:$|[^\\d])`);
    createToken("COERCEFULL", src[t.COERCEPLAIN] + `(?:${src[t.PRERELEASE]})?(?:${src[t.BUILD]})?(?:$|[^\\d])`);
    createToken("COERCERTL", src[t.COERCE], true);
    createToken("COERCERTLFULL", src[t.COERCEFULL], true);
    createToken("LONETILDE", "(?:~>?)");
    createToken("TILDETRIM", `(\\s*)${src[t.LONETILDE]}\\s+`, true);
    exports2.tildeTrimReplace = "$1~";
    createToken("TILDE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
    createToken("TILDELOOSE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("LONECARET", "(?:\\^)");
    createToken("CARETTRIM", `(\\s*)${src[t.LONECARET]}\\s+`, true);
    exports2.caretTrimReplace = "$1^";
    createToken("CARET", `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
    createToken("CARETLOOSE", `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("COMPARATORLOOSE", `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`);
    createToken("COMPARATOR", `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`);
    createToken("COMPARATORTRIM", `(\\s*)${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true);
    exports2.comparatorTrimReplace = "$1$2$3";
    createToken("HYPHENRANGE", `^\\s*(${src[t.XRANGEPLAIN]})\\s+-\\s+(${src[t.XRANGEPLAIN]})\\s*$`);
    createToken("HYPHENRANGELOOSE", `^\\s*(${src[t.XRANGEPLAINLOOSE]})\\s+-\\s+(${src[t.XRANGEPLAINLOOSE]})\\s*$`);
    createToken("STAR", "(<|>)?=?\\s*\\*");
    createToken("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
    createToken("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  }
});

// node_modules/semver/internal/parse-options.js
var require_parse_options = __commonJS({
  "node_modules/semver/internal/parse-options.js"(exports2, module2) {
    "use strict";
    var looseOption = Object.freeze({ loose: true });
    var emptyOpts = Object.freeze({});
    var parseOptions = (options) => {
      if (!options) {
        return emptyOpts;
      }
      if (typeof options !== "object") {
        return looseOption;
      }
      return options;
    };
    module2.exports = parseOptions;
  }
});

// node_modules/semver/internal/identifiers.js
var require_identifiers = __commonJS({
  "node_modules/semver/internal/identifiers.js"(exports2, module2) {
    "use strict";
    var numeric = /^[0-9]+$/;
    var compareIdentifiers = (a, b) => {
      if (typeof a === "number" && typeof b === "number") {
        return a === b ? 0 : a < b ? -1 : 1;
      }
      const anum = numeric.test(a);
      const bnum = numeric.test(b);
      if (anum && bnum) {
        a = +a;
        b = +b;
      }
      return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
    };
    var rcompareIdentifiers = (a, b) => compareIdentifiers(b, a);
    module2.exports = {
      compareIdentifiers,
      rcompareIdentifiers
    };
  }
});

// node_modules/semver/classes/semver.js
var require_semver = __commonJS({
  "node_modules/semver/classes/semver.js"(exports2, module2) {
    "use strict";
    var debug = require_debug();
    var { MAX_LENGTH, MAX_SAFE_INTEGER } = require_constants();
    var { safeRe: re, t } = require_re();
    var parseOptions = require_parse_options();
    var { compareIdentifiers } = require_identifiers();
    var SemVer = class _SemVer {
      constructor(version, options) {
        options = parseOptions(options);
        if (version instanceof _SemVer) {
          if (version.loose === !!options.loose && version.includePrerelease === !!options.includePrerelease) {
            return version;
          } else {
            version = version.version;
          }
        } else if (typeof version !== "string") {
          throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version}".`);
        }
        if (version.length > MAX_LENGTH) {
          throw new TypeError(
            `version is longer than ${MAX_LENGTH} characters`
          );
        }
        debug("SemVer", version, options);
        this.options = options;
        this.loose = !!options.loose;
        this.includePrerelease = !!options.includePrerelease;
        const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);
        if (!m) {
          throw new TypeError(`Invalid Version: ${version}`);
        }
        this.raw = version;
        this.major = +m[1];
        this.minor = +m[2];
        this.patch = +m[3];
        if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
          throw new TypeError("Invalid major version");
        }
        if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
          throw new TypeError("Invalid minor version");
        }
        if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
          throw new TypeError("Invalid patch version");
        }
        if (!m[4]) {
          this.prerelease = [];
        } else {
          this.prerelease = m[4].split(".").map((id) => {
            if (/^[0-9]+$/.test(id)) {
              const num = +id;
              if (num >= 0 && num < MAX_SAFE_INTEGER) {
                return num;
              }
            }
            return id;
          });
        }
        this.build = m[5] ? m[5].split(".") : [];
        this.format();
      }
      format() {
        this.version = `${this.major}.${this.minor}.${this.patch}`;
        if (this.prerelease.length) {
          this.version += `-${this.prerelease.join(".")}`;
        }
        return this.version;
      }
      toString() {
        return this.version;
      }
      compare(other) {
        debug("SemVer.compare", this.version, this.options, other);
        if (!(other instanceof _SemVer)) {
          if (typeof other === "string" && other === this.version) {
            return 0;
          }
          other = new _SemVer(other, this.options);
        }
        if (other.version === this.version) {
          return 0;
        }
        return this.compareMain(other) || this.comparePre(other);
      }
      compareMain(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        if (this.major < other.major) {
          return -1;
        }
        if (this.major > other.major) {
          return 1;
        }
        if (this.minor < other.minor) {
          return -1;
        }
        if (this.minor > other.minor) {
          return 1;
        }
        if (this.patch < other.patch) {
          return -1;
        }
        if (this.patch > other.patch) {
          return 1;
        }
        return 0;
      }
      comparePre(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        if (this.prerelease.length && !other.prerelease.length) {
          return -1;
        } else if (!this.prerelease.length && other.prerelease.length) {
          return 1;
        } else if (!this.prerelease.length && !other.prerelease.length) {
          return 0;
        }
        let i = 0;
        do {
          const a = this.prerelease[i];
          const b = other.prerelease[i];
          debug("prerelease compare", i, a, b);
          if (a === void 0 && b === void 0) {
            return 0;
          } else if (b === void 0) {
            return 1;
          } else if (a === void 0) {
            return -1;
          } else if (a === b) {
            continue;
          } else {
            return compareIdentifiers(a, b);
          }
        } while (++i);
      }
      compareBuild(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        let i = 0;
        do {
          const a = this.build[i];
          const b = other.build[i];
          debug("build compare", i, a, b);
          if (a === void 0 && b === void 0) {
            return 0;
          } else if (b === void 0) {
            return 1;
          } else if (a === void 0) {
            return -1;
          } else if (a === b) {
            continue;
          } else {
            return compareIdentifiers(a, b);
          }
        } while (++i);
      }
      // preminor will bump the version up to the next minor release, and immediately
      // down to pre-release. premajor and prepatch work the same way.
      inc(release, identifier, identifierBase) {
        if (release.startsWith("pre")) {
          if (!identifier && identifierBase === false) {
            throw new Error("invalid increment argument: identifier is empty");
          }
          if (identifier) {
            const match = `-${identifier}`.match(this.options.loose ? re[t.PRERELEASELOOSE] : re[t.PRERELEASE]);
            if (!match || match[1] !== identifier) {
              throw new Error(`invalid identifier: ${identifier}`);
            }
          }
        }
        switch (release) {
          case "premajor":
            this.prerelease.length = 0;
            this.patch = 0;
            this.minor = 0;
            this.major++;
            this.inc("pre", identifier, identifierBase);
            break;
          case "preminor":
            this.prerelease.length = 0;
            this.patch = 0;
            this.minor++;
            this.inc("pre", identifier, identifierBase);
            break;
          case "prepatch":
            this.prerelease.length = 0;
            this.inc("patch", identifier, identifierBase);
            this.inc("pre", identifier, identifierBase);
            break;
          // If the input is a non-prerelease version, this acts the same as
          // prepatch.
          case "prerelease":
            if (this.prerelease.length === 0) {
              this.inc("patch", identifier, identifierBase);
            }
            this.inc("pre", identifier, identifierBase);
            break;
          case "release":
            if (this.prerelease.length === 0) {
              throw new Error(`version ${this.raw} is not a prerelease`);
            }
            this.prerelease.length = 0;
            break;
          case "major":
            if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) {
              this.major++;
            }
            this.minor = 0;
            this.patch = 0;
            this.prerelease = [];
            break;
          case "minor":
            if (this.patch !== 0 || this.prerelease.length === 0) {
              this.minor++;
            }
            this.patch = 0;
            this.prerelease = [];
            break;
          case "patch":
            if (this.prerelease.length === 0) {
              this.patch++;
            }
            this.prerelease = [];
            break;
          // This probably shouldn't be used publicly.
          // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
          case "pre": {
            const base = Number(identifierBase) ? 1 : 0;
            if (this.prerelease.length === 0) {
              this.prerelease = [base];
            } else {
              let i = this.prerelease.length;
              while (--i >= 0) {
                if (typeof this.prerelease[i] === "number") {
                  this.prerelease[i]++;
                  i = -2;
                }
              }
              if (i === -1) {
                if (identifier === this.prerelease.join(".") && identifierBase === false) {
                  throw new Error("invalid increment argument: identifier already exists");
                }
                this.prerelease.push(base);
              }
            }
            if (identifier) {
              let prerelease = [identifier, base];
              if (identifierBase === false) {
                prerelease = [identifier];
              }
              if (compareIdentifiers(this.prerelease[0], identifier) === 0) {
                if (isNaN(this.prerelease[1])) {
                  this.prerelease = prerelease;
                }
              } else {
                this.prerelease = prerelease;
              }
            }
            break;
          }
          default:
            throw new Error(`invalid increment argument: ${release}`);
        }
        this.raw = this.format();
        if (this.build.length) {
          this.raw += `+${this.build.join(".")}`;
        }
        return this;
      }
    };
    module2.exports = SemVer;
  }
});

// node_modules/semver/functions/parse.js
var require_parse = __commonJS({
  "node_modules/semver/functions/parse.js"(exports2, module2) {
    "use strict";
    var SemVer = require_semver();
    var parse5 = (version, options, throwErrors = false) => {
      if (version instanceof SemVer) {
        return version;
      }
      try {
        return new SemVer(version, options);
      } catch (er) {
        if (!throwErrors) {
          return null;
        }
        throw er;
      }
    };
    module2.exports = parse5;
  }
});

// node_modules/semver/functions/valid.js
var require_valid = __commonJS({
  "node_modules/semver/functions/valid.js"(exports2, module2) {
    "use strict";
    var parse5 = require_parse();
    var valid = (version, options) => {
      const v = parse5(version, options);
      return v ? v.version : null;
    };
    module2.exports = valid;
  }
});

// node_modules/semver/functions/clean.js
var require_clean = __commonJS({
  "node_modules/semver/functions/clean.js"(exports2, module2) {
    "use strict";
    var parse5 = require_parse();
    var clean = (version, options) => {
      const s = parse5(version.trim().replace(/^[=v]+/, ""), options);
      return s ? s.version : null;
    };
    module2.exports = clean;
  }
});

// node_modules/semver/functions/inc.js
var require_inc = __commonJS({
  "node_modules/semver/functions/inc.js"(exports2, module2) {
    "use strict";
    var SemVer = require_semver();
    var inc = (version, release, options, identifier, identifierBase) => {
      if (typeof options === "string") {
        identifierBase = identifier;
        identifier = options;
        options = void 0;
      }
      try {
        return new SemVer(
          version instanceof SemVer ? version.version : version,
          options
        ).inc(release, identifier, identifierBase).version;
      } catch (er) {
        return null;
      }
    };
    module2.exports = inc;
  }
});

// node_modules/semver/functions/diff.js
var require_diff = __commonJS({
  "node_modules/semver/functions/diff.js"(exports2, module2) {
    "use strict";
    var parse5 = require_parse();
    var diff = (version1, version2) => {
      const v1 = parse5(version1, null, true);
      const v2 = parse5(version2, null, true);
      const comparison = v1.compare(v2);
      if (comparison === 0) {
        return null;
      }
      const v1Higher = comparison > 0;
      const highVersion = v1Higher ? v1 : v2;
      const lowVersion = v1Higher ? v2 : v1;
      const highHasPre = !!highVersion.prerelease.length;
      const lowHasPre = !!lowVersion.prerelease.length;
      if (lowHasPre && !highHasPre) {
        if (!lowVersion.patch && !lowVersion.minor) {
          return "major";
        }
        if (lowVersion.compareMain(highVersion) === 0) {
          if (lowVersion.minor && !lowVersion.patch) {
            return "minor";
          }
          return "patch";
        }
      }
      const prefix = highHasPre ? "pre" : "";
      if (v1.major !== v2.major) {
        return prefix + "major";
      }
      if (v1.minor !== v2.minor) {
        return prefix + "minor";
      }
      if (v1.patch !== v2.patch) {
        return prefix + "patch";
      }
      return "prerelease";
    };
    module2.exports = diff;
  }
});

// node_modules/semver/functions/major.js
var require_major = __commonJS({
  "node_modules/semver/functions/major.js"(exports2, module2) {
    "use strict";
    var SemVer = require_semver();
    var major = (a, loose) => new SemVer(a, loose).major;
    module2.exports = major;
  }
});

// node_modules/semver/functions/minor.js
var require_minor = __commonJS({
  "node_modules/semver/functions/minor.js"(exports2, module2) {
    "use strict";
    var SemVer = require_semver();
    var minor = (a, loose) => new SemVer(a, loose).minor;
    module2.exports = minor;
  }
});

// node_modules/semver/functions/patch.js
var require_patch = __commonJS({
  "node_modules/semver/functions/patch.js"(exports2, module2) {
    "use strict";
    var SemVer = require_semver();
    var patch = (a, loose) => new SemVer(a, loose).patch;
    module2.exports = patch;
  }
});

// node_modules/semver/functions/prerelease.js
var require_prerelease = __commonJS({
  "node_modules/semver/functions/prerelease.js"(exports2, module2) {
    "use strict";
    var parse5 = require_parse();
    var prerelease = (version, options) => {
      const parsed = parse5(version, options);
      return parsed && parsed.prerelease.length ? parsed.prerelease : null;
    };
    module2.exports = prerelease;
  }
});

// node_modules/semver/functions/compare.js
var require_compare = __commonJS({
  "node_modules/semver/functions/compare.js"(exports2, module2) {
    "use strict";
    var SemVer = require_semver();
    var compare = (a, b, loose) => new SemVer(a, loose).compare(new SemVer(b, loose));
    module2.exports = compare;
  }
});

// node_modules/semver/functions/rcompare.js
var require_rcompare = __commonJS({
  "node_modules/semver/functions/rcompare.js"(exports2, module2) {
    "use strict";
    var compare = require_compare();
    var rcompare = (a, b, loose) => compare(b, a, loose);
    module2.exports = rcompare;
  }
});

// node_modules/semver/functions/compare-loose.js
var require_compare_loose = __commonJS({
  "node_modules/semver/functions/compare-loose.js"(exports2, module2) {
    "use strict";
    var compare = require_compare();
    var compareLoose = (a, b) => compare(a, b, true);
    module2.exports = compareLoose;
  }
});

// node_modules/semver/functions/compare-build.js
var require_compare_build = __commonJS({
  "node_modules/semver/functions/compare-build.js"(exports2, module2) {
    "use strict";
    var SemVer = require_semver();
    var compareBuild = (a, b, loose) => {
      const versionA = new SemVer(a, loose);
      const versionB = new SemVer(b, loose);
      return versionA.compare(versionB) || versionA.compareBuild(versionB);
    };
    module2.exports = compareBuild;
  }
});

// node_modules/semver/functions/sort.js
var require_sort = __commonJS({
  "node_modules/semver/functions/sort.js"(exports2, module2) {
    "use strict";
    var compareBuild = require_compare_build();
    var sort = (list, loose) => list.sort((a, b) => compareBuild(a, b, loose));
    module2.exports = sort;
  }
});

// node_modules/semver/functions/rsort.js
var require_rsort = __commonJS({
  "node_modules/semver/functions/rsort.js"(exports2, module2) {
    "use strict";
    var compareBuild = require_compare_build();
    var rsort = (list, loose) => list.sort((a, b) => compareBuild(b, a, loose));
    module2.exports = rsort;
  }
});

// node_modules/semver/functions/gt.js
var require_gt = __commonJS({
  "node_modules/semver/functions/gt.js"(exports2, module2) {
    "use strict";
    var compare = require_compare();
    var gt = (a, b, loose) => compare(a, b, loose) > 0;
    module2.exports = gt;
  }
});

// node_modules/semver/functions/lt.js
var require_lt = __commonJS({
  "node_modules/semver/functions/lt.js"(exports2, module2) {
    "use strict";
    var compare = require_compare();
    var lt = (a, b, loose) => compare(a, b, loose) < 0;
    module2.exports = lt;
  }
});

// node_modules/semver/functions/eq.js
var require_eq = __commonJS({
  "node_modules/semver/functions/eq.js"(exports2, module2) {
    "use strict";
    var compare = require_compare();
    var eq = (a, b, loose) => compare(a, b, loose) === 0;
    module2.exports = eq;
  }
});

// node_modules/semver/functions/neq.js
var require_neq = __commonJS({
  "node_modules/semver/functions/neq.js"(exports2, module2) {
    "use strict";
    var compare = require_compare();
    var neq = (a, b, loose) => compare(a, b, loose) !== 0;
    module2.exports = neq;
  }
});

// node_modules/semver/functions/gte.js
var require_gte = __commonJS({
  "node_modules/semver/functions/gte.js"(exports2, module2) {
    "use strict";
    var compare = require_compare();
    var gte = (a, b, loose) => compare(a, b, loose) >= 0;
    module2.exports = gte;
  }
});

// node_modules/semver/functions/lte.js
var require_lte = __commonJS({
  "node_modules/semver/functions/lte.js"(exports2, module2) {
    "use strict";
    var compare = require_compare();
    var lte = (a, b, loose) => compare(a, b, loose) <= 0;
    module2.exports = lte;
  }
});

// node_modules/semver/functions/cmp.js
var require_cmp = __commonJS({
  "node_modules/semver/functions/cmp.js"(exports2, module2) {
    "use strict";
    var eq = require_eq();
    var neq = require_neq();
    var gt = require_gt();
    var gte = require_gte();
    var lt = require_lt();
    var lte = require_lte();
    var cmp = (a, op, b, loose) => {
      switch (op) {
        case "===":
          if (typeof a === "object") {
            a = a.version;
          }
          if (typeof b === "object") {
            b = b.version;
          }
          return a === b;
        case "!==":
          if (typeof a === "object") {
            a = a.version;
          }
          if (typeof b === "object") {
            b = b.version;
          }
          return a !== b;
        case "":
        case "=":
        case "==":
          return eq(a, b, loose);
        case "!=":
          return neq(a, b, loose);
        case ">":
          return gt(a, b, loose);
        case ">=":
          return gte(a, b, loose);
        case "<":
          return lt(a, b, loose);
        case "<=":
          return lte(a, b, loose);
        default:
          throw new TypeError(`Invalid operator: ${op}`);
      }
    };
    module2.exports = cmp;
  }
});

// node_modules/semver/functions/coerce.js
var require_coerce = __commonJS({
  "node_modules/semver/functions/coerce.js"(exports2, module2) {
    "use strict";
    var SemVer = require_semver();
    var parse5 = require_parse();
    var { safeRe: re, t } = require_re();
    var coerce = (version, options) => {
      if (version instanceof SemVer) {
        return version;
      }
      if (typeof version === "number") {
        version = String(version);
      }
      if (typeof version !== "string") {
        return null;
      }
      options = options || {};
      let match = null;
      if (!options.rtl) {
        match = version.match(options.includePrerelease ? re[t.COERCEFULL] : re[t.COERCE]);
      } else {
        const coerceRtlRegex = options.includePrerelease ? re[t.COERCERTLFULL] : re[t.COERCERTL];
        let next;
        while ((next = coerceRtlRegex.exec(version)) && (!match || match.index + match[0].length !== version.length)) {
          if (!match || next.index + next[0].length !== match.index + match[0].length) {
            match = next;
          }
          coerceRtlRegex.lastIndex = next.index + next[1].length + next[2].length;
        }
        coerceRtlRegex.lastIndex = -1;
      }
      if (match === null) {
        return null;
      }
      const major = match[2];
      const minor = match[3] || "0";
      const patch = match[4] || "0";
      const prerelease = options.includePrerelease && match[5] ? `-${match[5]}` : "";
      const build = options.includePrerelease && match[6] ? `+${match[6]}` : "";
      return parse5(`${major}.${minor}.${patch}${prerelease}${build}`, options);
    };
    module2.exports = coerce;
  }
});

// node_modules/semver/functions/truncate.js
var require_truncate = __commonJS({
  "node_modules/semver/functions/truncate.js"(exports2, module2) {
    "use strict";
    var parse5 = require_parse();
    var constants = require_constants();
    var SemVer = require_semver();
    var truncate = (version, truncation, options) => {
      if (!constants.RELEASE_TYPES.includes(truncation)) {
        return null;
      }
      const clonedVersion = cloneInputVersion(version, options);
      return clonedVersion && doTruncation(clonedVersion, truncation);
    };
    var cloneInputVersion = (version, options) => {
      const versionStringToParse = version instanceof SemVer ? version.version : version;
      return parse5(versionStringToParse, options);
    };
    var doTruncation = (version, truncation) => {
      if (isPrerelease(truncation)) {
        return version.version;
      }
      version.prerelease = [];
      switch (truncation) {
        case "major":
          version.minor = 0;
          version.patch = 0;
          break;
        case "minor":
          version.patch = 0;
          break;
      }
      return version.format();
    };
    var isPrerelease = (type) => {
      return type.startsWith("pre");
    };
    module2.exports = truncate;
  }
});

// node_modules/semver/internal/lrucache.js
var require_lrucache = __commonJS({
  "node_modules/semver/internal/lrucache.js"(exports2, module2) {
    "use strict";
    var LRUCache = class {
      constructor() {
        this.max = 1e3;
        this.map = /* @__PURE__ */ new Map();
      }
      get(key) {
        const value = this.map.get(key);
        if (value === void 0) {
          return void 0;
        } else {
          this.map.delete(key);
          this.map.set(key, value);
          return value;
        }
      }
      delete(key) {
        return this.map.delete(key);
      }
      set(key, value) {
        const deleted = this.delete(key);
        if (!deleted && value !== void 0) {
          if (this.map.size >= this.max) {
            const firstKey = this.map.keys().next().value;
            this.delete(firstKey);
          }
          this.map.set(key, value);
        }
        return this;
      }
    };
    module2.exports = LRUCache;
  }
});

// node_modules/semver/classes/range.js
var require_range = __commonJS({
  "node_modules/semver/classes/range.js"(exports2, module2) {
    "use strict";
    var SPACE_CHARACTERS = /\s+/g;
    var Range = class _Range {
      constructor(range, options) {
        options = parseOptions(options);
        if (range instanceof _Range) {
          if (range.loose === !!options.loose && range.includePrerelease === !!options.includePrerelease) {
            return range;
          } else {
            return new _Range(range.raw, options);
          }
        }
        if (range instanceof Comparator) {
          this.raw = range.value;
          this.set = [[range]];
          this.formatted = void 0;
          return this;
        }
        this.options = options;
        this.loose = !!options.loose;
        this.includePrerelease = !!options.includePrerelease;
        this.raw = range.trim().replace(SPACE_CHARACTERS, " ");
        this.set = this.raw.split("||").map((r) => this.parseRange(r.trim())).filter((c) => c.length);
        if (!this.set.length) {
          throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
        }
        if (this.set.length > 1) {
          const first = this.set[0];
          this.set = this.set.filter((c) => !isNullSet(c[0]));
          if (this.set.length === 0) {
            this.set = [first];
          } else if (this.set.length > 1) {
            for (const c of this.set) {
              if (c.length === 1 && isAny(c[0])) {
                this.set = [c];
                break;
              }
            }
          }
        }
        this.formatted = void 0;
      }
      get range() {
        if (this.formatted === void 0) {
          this.formatted = "";
          for (let i = 0; i < this.set.length; i++) {
            if (i > 0) {
              this.formatted += "||";
            }
            const comps = this.set[i];
            for (let k = 0; k < comps.length; k++) {
              if (k > 0) {
                this.formatted += " ";
              }
              this.formatted += comps[k].toString().trim();
            }
          }
        }
        return this.formatted;
      }
      format() {
        return this.range;
      }
      toString() {
        return this.range;
      }
      parseRange(range) {
        const memoOpts = (this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) | (this.options.loose && FLAG_LOOSE);
        const memoKey = memoOpts + ":" + range;
        const cached = cache.get(memoKey);
        if (cached) {
          return cached;
        }
        const loose = this.options.loose;
        const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE];
        range = range.replace(hr, hyphenReplace(this.options.includePrerelease));
        debug("hyphen replace", range);
        range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace);
        debug("comparator trim", range);
        range = range.replace(re[t.TILDETRIM], tildeTrimReplace);
        debug("tilde trim", range);
        range = range.replace(re[t.CARETTRIM], caretTrimReplace);
        debug("caret trim", range);
        let rangeList = range.split(" ").map((comp) => parseComparator(comp, this.options)).join(" ").split(/\s+/).map((comp) => replaceGTE0(comp, this.options));
        if (loose) {
          rangeList = rangeList.filter((comp) => {
            debug("loose invalid filter", comp, this.options);
            return !!comp.match(re[t.COMPARATORLOOSE]);
          });
        }
        debug("range list", rangeList);
        const rangeMap = /* @__PURE__ */ new Map();
        const comparators = rangeList.map((comp) => new Comparator(comp, this.options));
        for (const comp of comparators) {
          if (isNullSet(comp)) {
            return [comp];
          }
          rangeMap.set(comp.value, comp);
        }
        if (rangeMap.size > 1 && rangeMap.has("")) {
          rangeMap.delete("");
        }
        const result = [...rangeMap.values()];
        cache.set(memoKey, result);
        return result;
      }
      intersects(range, options) {
        if (!(range instanceof _Range)) {
          throw new TypeError("a Range is required");
        }
        return this.set.some((thisComparators) => {
          return isSatisfiable(thisComparators, options) && range.set.some((rangeComparators) => {
            return isSatisfiable(rangeComparators, options) && thisComparators.every((thisComparator) => {
              return rangeComparators.every((rangeComparator) => {
                return thisComparator.intersects(rangeComparator, options);
              });
            });
          });
        });
      }
      // if ANY of the sets match ALL of its comparators, then pass
      test(version) {
        if (!version) {
          return false;
        }
        if (typeof version === "string") {
          try {
            version = new SemVer(version, this.options);
          } catch (er) {
            return false;
          }
        }
        for (let i = 0; i < this.set.length; i++) {
          if (testSet(this.set[i], version, this.options)) {
            return true;
          }
        }
        return false;
      }
    };
    module2.exports = Range;
    var LRU = require_lrucache();
    var cache = new LRU();
    var parseOptions = require_parse_options();
    var Comparator = require_comparator();
    var debug = require_debug();
    var SemVer = require_semver();
    var {
      safeRe: re,
      t,
      comparatorTrimReplace,
      tildeTrimReplace,
      caretTrimReplace
    } = require_re();
    var { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } = require_constants();
    var isNullSet = (c) => c.value === "<0.0.0-0";
    var isAny = (c) => c.value === "";
    var isSatisfiable = (comparators, options) => {
      let result = true;
      const remainingComparators = comparators.slice();
      let testComparator = remainingComparators.pop();
      while (result && remainingComparators.length) {
        result = remainingComparators.every((otherComparator) => {
          return testComparator.intersects(otherComparator, options);
        });
        testComparator = remainingComparators.pop();
      }
      return result;
    };
    var parseComparator = (comp, options) => {
      comp = comp.replace(re[t.BUILD], "");
      debug("comp", comp, options);
      comp = replaceCarets(comp, options);
      debug("caret", comp);
      comp = replaceTildes(comp, options);
      debug("tildes", comp);
      comp = replaceXRanges(comp, options);
      debug("xrange", comp);
      comp = replaceStars(comp, options);
      debug("stars", comp);
      return comp;
    };
    var isX = (id) => !id || id.toLowerCase() === "x" || id === "*";
    var replaceTildes = (comp, options) => {
      return comp.trim().split(/\s+/).map((c) => replaceTilde(c, options)).join(" ");
    };
    var replaceTilde = (comp, options) => {
      const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE];
      return comp.replace(r, (_, M, m, p, pr) => {
        debug("tilde", comp, _, M, m, p, pr);
        let ret;
        if (isX(M)) {
          ret = "";
        } else if (isX(m)) {
          ret = `>=${M}.0.0 <${+M + 1}.0.0-0`;
        } else if (isX(p)) {
          ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`;
        } else if (pr) {
          debug("replaceTilde pr", pr);
          ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
        } else {
          ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
        }
        debug("tilde return", ret);
        return ret;
      });
    };
    var replaceCarets = (comp, options) => {
      return comp.trim().split(/\s+/).map((c) => replaceCaret(c, options)).join(" ");
    };
    var replaceCaret = (comp, options) => {
      debug("caret", comp, options);
      const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET];
      const z8 = options.includePrerelease ? "-0" : "";
      return comp.replace(r, (_, M, m, p, pr) => {
        debug("caret", comp, _, M, m, p, pr);
        let ret;
        if (isX(M)) {
          ret = "";
        } else if (isX(m)) {
          ret = `>=${M}.0.0${z8} <${+M + 1}.0.0-0`;
        } else if (isX(p)) {
          if (M === "0") {
            ret = `>=${M}.${m}.0${z8} <${M}.${+m + 1}.0-0`;
          } else {
            ret = `>=${M}.${m}.0${z8} <${+M + 1}.0.0-0`;
          }
        } else if (pr) {
          debug("replaceCaret pr", pr);
          if (M === "0") {
            if (m === "0") {
              ret = `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0`;
            } else {
              ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
            }
          } else {
            ret = `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`;
          }
        } else {
          debug("no pr");
          if (M === "0") {
            if (m === "0") {
              ret = `>=${M}.${m}.${p}${z8} <${M}.${m}.${+p + 1}-0`;
            } else {
              ret = `>=${M}.${m}.${p}${z8} <${M}.${+m + 1}.0-0`;
            }
          } else {
            ret = `>=${M}.${m}.${p} <${+M + 1}.0.0-0`;
          }
        }
        debug("caret return", ret);
        return ret;
      });
    };
    var replaceXRanges = (comp, options) => {
      debug("replaceXRanges", comp, options);
      return comp.split(/\s+/).map((c) => replaceXRange(c, options)).join(" ");
    };
    var replaceXRange = (comp, options) => {
      comp = comp.trim();
      const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE];
      return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
        debug("xRange", comp, ret, gtlt, M, m, p, pr);
        const xM = isX(M);
        const xm = xM || isX(m);
        const xp = xm || isX(p);
        const anyX = xp;
        if (gtlt === "=" && anyX) {
          gtlt = "";
        }
        pr = options.includePrerelease ? "-0" : "";
        if (xM) {
          if (gtlt === ">" || gtlt === "<") {
            ret = "<0.0.0-0";
          } else {
            ret = "*";
          }
        } else if (gtlt && anyX) {
          if (xm) {
            m = 0;
          }
          p = 0;
          if (gtlt === ">") {
            gtlt = ">=";
            if (xm) {
              M = +M + 1;
              m = 0;
              p = 0;
            } else {
              m = +m + 1;
              p = 0;
            }
          } else if (gtlt === "<=") {
            gtlt = "<";
            if (xm) {
              M = +M + 1;
            } else {
              m = +m + 1;
            }
          }
          if (gtlt === "<") {
            pr = "-0";
          }
          ret = `${gtlt + M}.${m}.${p}${pr}`;
        } else if (xm) {
          ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
        } else if (xp) {
          ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`;
        }
        debug("xRange return", ret);
        return ret;
      });
    };
    var replaceStars = (comp, options) => {
      debug("replaceStars", comp, options);
      return comp.trim().replace(re[t.STAR], "");
    };
    var replaceGTE0 = (comp, options) => {
      debug("replaceGTE0", comp, options);
      return comp.trim().replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], "");
    };
    var hyphenReplace = (incPr) => ($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr) => {
      if (isX(fM)) {
        from = "";
      } else if (isX(fm)) {
        from = `>=${fM}.0.0${incPr ? "-0" : ""}`;
      } else if (isX(fp)) {
        from = `>=${fM}.${fm}.0${incPr ? "-0" : ""}`;
      } else if (fpr) {
        from = `>=${from}`;
      } else {
        from = `>=${from}${incPr ? "-0" : ""}`;
      }
      if (isX(tM)) {
        to = "";
      } else if (isX(tm)) {
        to = `<${+tM + 1}.0.0-0`;
      } else if (isX(tp)) {
        to = `<${tM}.${+tm + 1}.0-0`;
      } else if (tpr) {
        to = `<=${tM}.${tm}.${tp}-${tpr}`;
      } else if (incPr) {
        to = `<${tM}.${tm}.${+tp + 1}-0`;
      } else {
        to = `<=${to}`;
      }
      return `${from} ${to}`.trim();
    };
    var testSet = (set, version, options) => {
      for (let i = 0; i < set.length; i++) {
        if (!set[i].test(version)) {
          return false;
        }
      }
      if (version.prerelease.length && !options.includePrerelease) {
        for (let i = 0; i < set.length; i++) {
          debug(set[i].semver);
          if (set[i].semver === Comparator.ANY) {
            continue;
          }
          if (set[i].semver.prerelease.length > 0) {
            const allowed = set[i].semver;
            if (allowed.major === version.major && allowed.minor === version.minor && allowed.patch === version.patch) {
              return true;
            }
          }
        }
        return false;
      }
      return true;
    };
  }
});

// node_modules/semver/classes/comparator.js
var require_comparator = __commonJS({
  "node_modules/semver/classes/comparator.js"(exports2, module2) {
    "use strict";
    var ANY = /* @__PURE__ */ Symbol("SemVer ANY");
    var Comparator = class _Comparator {
      static get ANY() {
        return ANY;
      }
      constructor(comp, options) {
        options = parseOptions(options);
        if (comp instanceof _Comparator) {
          if (comp.loose === !!options.loose) {
            return comp;
          } else {
            comp = comp.value;
          }
        }
        comp = comp.trim().split(/\s+/).join(" ");
        debug("comparator", comp, options);
        this.options = options;
        this.loose = !!options.loose;
        this.parse(comp);
        if (this.semver === ANY) {
          this.value = "";
        } else {
          this.value = this.operator + this.semver.version;
        }
        debug("comp", this);
      }
      parse(comp) {
        const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
        const m = comp.match(r);
        if (!m) {
          throw new TypeError(`Invalid comparator: ${comp}`);
        }
        this.operator = m[1] !== void 0 ? m[1] : "";
        if (this.operator === "=") {
          this.operator = "";
        }
        if (!m[2]) {
          this.semver = ANY;
        } else {
          this.semver = new SemVer(m[2], this.options.loose);
        }
      }
      toString() {
        return this.value;
      }
      test(version) {
        debug("Comparator.test", version, this.options.loose);
        if (this.semver === ANY || version === ANY) {
          return true;
        }
        if (typeof version === "string") {
          try {
            version = new SemVer(version, this.options);
          } catch (er) {
            return false;
          }
        }
        return cmp(version, this.operator, this.semver, this.options);
      }
      intersects(comp, options) {
        if (!(comp instanceof _Comparator)) {
          throw new TypeError("a Comparator is required");
        }
        if (this.operator === "") {
          if (this.value === "") {
            return true;
          }
          return new Range(comp.value, options).test(this.value);
        } else if (comp.operator === "") {
          if (comp.value === "") {
            return true;
          }
          return new Range(this.value, options).test(comp.semver);
        }
        options = parseOptions(options);
        if (options.includePrerelease && (this.value === "<0.0.0-0" || comp.value === "<0.0.0-0")) {
          return false;
        }
        if (!options.includePrerelease && (this.value.startsWith("<0.0.0") || comp.value.startsWith("<0.0.0"))) {
          return false;
        }
        if (this.operator.startsWith(">") && comp.operator.startsWith(">")) {
          return true;
        }
        if (this.operator.startsWith("<") && comp.operator.startsWith("<")) {
          return true;
        }
        if (this.semver.version === comp.semver.version && this.operator.includes("=") && comp.operator.includes("=")) {
          return true;
        }
        if (cmp(this.semver, "<", comp.semver, options) && this.operator.startsWith(">") && comp.operator.startsWith("<")) {
          return true;
        }
        if (cmp(this.semver, ">", comp.semver, options) && this.operator.startsWith("<") && comp.operator.startsWith(">")) {
          return true;
        }
        return false;
      }
    };
    module2.exports = Comparator;
    var parseOptions = require_parse_options();
    var { safeRe: re, t } = require_re();
    var cmp = require_cmp();
    var debug = require_debug();
    var SemVer = require_semver();
    var Range = require_range();
  }
});

// node_modules/semver/functions/satisfies.js
var require_satisfies = __commonJS({
  "node_modules/semver/functions/satisfies.js"(exports2, module2) {
    "use strict";
    var Range = require_range();
    var satisfies = (version, range, options) => {
      try {
        range = new Range(range, options);
      } catch (er) {
        return false;
      }
      return range.test(version);
    };
    module2.exports = satisfies;
  }
});

// node_modules/semver/ranges/to-comparators.js
var require_to_comparators = __commonJS({
  "node_modules/semver/ranges/to-comparators.js"(exports2, module2) {
    "use strict";
    var Range = require_range();
    var toComparators = (range, options) => new Range(range, options).set.map((comp) => comp.map((c) => c.value).join(" ").trim().split(" "));
    module2.exports = toComparators;
  }
});

// node_modules/semver/ranges/max-satisfying.js
var require_max_satisfying = __commonJS({
  "node_modules/semver/ranges/max-satisfying.js"(exports2, module2) {
    "use strict";
    var SemVer = require_semver();
    var Range = require_range();
    var maxSatisfying = (versions, range, options) => {
      let max = null;
      let maxSV = null;
      let rangeObj = null;
      try {
        rangeObj = new Range(range, options);
      } catch (er) {
        return null;
      }
      versions.forEach((v) => {
        if (rangeObj.test(v)) {
          if (!max || maxSV.compare(v) === -1) {
            max = v;
            maxSV = new SemVer(max, options);
          }
        }
      });
      return max;
    };
    module2.exports = maxSatisfying;
  }
});

// node_modules/semver/ranges/min-satisfying.js
var require_min_satisfying = __commonJS({
  "node_modules/semver/ranges/min-satisfying.js"(exports2, module2) {
    "use strict";
    var SemVer = require_semver();
    var Range = require_range();
    var minSatisfying = (versions, range, options) => {
      let min = null;
      let minSV = null;
      let rangeObj = null;
      try {
        rangeObj = new Range(range, options);
      } catch (er) {
        return null;
      }
      versions.forEach((v) => {
        if (rangeObj.test(v)) {
          if (!min || minSV.compare(v) === 1) {
            min = v;
            minSV = new SemVer(min, options);
          }
        }
      });
      return min;
    };
    module2.exports = minSatisfying;
  }
});

// node_modules/semver/ranges/min-version.js
var require_min_version = __commonJS({
  "node_modules/semver/ranges/min-version.js"(exports2, module2) {
    "use strict";
    var SemVer = require_semver();
    var Range = require_range();
    var gt = require_gt();
    var minVersion = (range, loose) => {
      range = new Range(range, loose);
      let minver = new SemVer("0.0.0");
      if (range.test(minver)) {
        return minver;
      }
      minver = new SemVer("0.0.0-0");
      if (range.test(minver)) {
        return minver;
      }
      minver = null;
      for (let i = 0; i < range.set.length; ++i) {
        const comparators = range.set[i];
        let setMin = null;
        comparators.forEach((comparator) => {
          const compver = new SemVer(comparator.semver.version);
          switch (comparator.operator) {
            case ">":
              if (compver.prerelease.length === 0) {
                compver.patch++;
              } else {
                compver.prerelease.push(0);
              }
              compver.raw = compver.format();
            /* fallthrough */
            case "":
            case ">=":
              if (!setMin || gt(compver, setMin)) {
                setMin = compver;
              }
              break;
            case "<":
            case "<=":
              break;
            /* istanbul ignore next */
            default:
              throw new Error(`Unexpected operation: ${comparator.operator}`);
          }
        });
        if (setMin && (!minver || gt(minver, setMin))) {
          minver = setMin;
        }
      }
      if (minver && range.test(minver)) {
        return minver;
      }
      return null;
    };
    module2.exports = minVersion;
  }
});

// node_modules/semver/ranges/valid.js
var require_valid2 = __commonJS({
  "node_modules/semver/ranges/valid.js"(exports2, module2) {
    "use strict";
    var Range = require_range();
    var validRange = (range, options) => {
      try {
        return new Range(range, options).range || "*";
      } catch (er) {
        return null;
      }
    };
    module2.exports = validRange;
  }
});

// node_modules/semver/ranges/outside.js
var require_outside = __commonJS({
  "node_modules/semver/ranges/outside.js"(exports2, module2) {
    "use strict";
    var SemVer = require_semver();
    var Comparator = require_comparator();
    var { ANY } = Comparator;
    var Range = require_range();
    var satisfies = require_satisfies();
    var gt = require_gt();
    var lt = require_lt();
    var lte = require_lte();
    var gte = require_gte();
    var outside = (version, range, hilo, options) => {
      version = new SemVer(version, options);
      range = new Range(range, options);
      let gtfn, ltefn, ltfn, comp, ecomp;
      switch (hilo) {
        case ">":
          gtfn = gt;
          ltefn = lte;
          ltfn = lt;
          comp = ">";
          ecomp = ">=";
          break;
        case "<":
          gtfn = lt;
          ltefn = gte;
          ltfn = gt;
          comp = "<";
          ecomp = "<=";
          break;
        default:
          throw new TypeError('Must provide a hilo val of "<" or ">"');
      }
      if (satisfies(version, range, options)) {
        return false;
      }
      for (let i = 0; i < range.set.length; ++i) {
        const comparators = range.set[i];
        let high = null;
        let low = null;
        comparators.forEach((comparator) => {
          if (comparator.semver === ANY) {
            comparator = new Comparator(">=0.0.0");
          }
          high = high || comparator;
          low = low || comparator;
          if (gtfn(comparator.semver, high.semver, options)) {
            high = comparator;
          } else if (ltfn(comparator.semver, low.semver, options)) {
            low = comparator;
          }
        });
        if (high.operator === comp || high.operator === ecomp) {
          return false;
        }
        if ((!low.operator || low.operator === comp) && ltefn(version, low.semver)) {
          return false;
        } else if (low.operator === ecomp && ltfn(version, low.semver)) {
          return false;
        }
      }
      return true;
    };
    module2.exports = outside;
  }
});

// node_modules/semver/ranges/gtr.js
var require_gtr = __commonJS({
  "node_modules/semver/ranges/gtr.js"(exports2, module2) {
    "use strict";
    var outside = require_outside();
    var gtr = (version, range, options) => outside(version, range, ">", options);
    module2.exports = gtr;
  }
});

// node_modules/semver/ranges/ltr.js
var require_ltr = __commonJS({
  "node_modules/semver/ranges/ltr.js"(exports2, module2) {
    "use strict";
    var outside = require_outside();
    var ltr = (version, range, options) => outside(version, range, "<", options);
    module2.exports = ltr;
  }
});

// node_modules/semver/ranges/intersects.js
var require_intersects = __commonJS({
  "node_modules/semver/ranges/intersects.js"(exports2, module2) {
    "use strict";
    var Range = require_range();
    var intersects = (r1, r2, options) => {
      r1 = new Range(r1, options);
      r2 = new Range(r2, options);
      return r1.intersects(r2, options);
    };
    module2.exports = intersects;
  }
});

// node_modules/semver/ranges/simplify.js
var require_simplify = __commonJS({
  "node_modules/semver/ranges/simplify.js"(exports2, module2) {
    "use strict";
    var satisfies = require_satisfies();
    var compare = require_compare();
    module2.exports = (versions, range, options) => {
      const set = [];
      let first = null;
      let prev = null;
      const v = versions.sort((a, b) => compare(a, b, options));
      for (const version of v) {
        const included = satisfies(version, range, options);
        if (included) {
          prev = version;
          if (!first) {
            first = version;
          }
        } else {
          if (prev) {
            set.push([first, prev]);
          }
          prev = null;
          first = null;
        }
      }
      if (first) {
        set.push([first, null]);
      }
      const ranges = [];
      for (const [min, max] of set) {
        if (min === max) {
          ranges.push(min);
        } else if (!max && min === v[0]) {
          ranges.push("*");
        } else if (!max) {
          ranges.push(`>=${min}`);
        } else if (min === v[0]) {
          ranges.push(`<=${max}`);
        } else {
          ranges.push(`${min} - ${max}`);
        }
      }
      const simplified = ranges.join(" || ");
      const original = typeof range.raw === "string" ? range.raw : String(range);
      return simplified.length < original.length ? simplified : range;
    };
  }
});

// node_modules/semver/ranges/subset.js
var require_subset = __commonJS({
  "node_modules/semver/ranges/subset.js"(exports2, module2) {
    "use strict";
    var Range = require_range();
    var Comparator = require_comparator();
    var { ANY } = Comparator;
    var satisfies = require_satisfies();
    var compare = require_compare();
    var subset = (sub, dom, options = {}) => {
      if (sub === dom) {
        return true;
      }
      sub = new Range(sub, options);
      dom = new Range(dom, options);
      let sawNonNull = false;
      OUTER: for (const simpleSub of sub.set) {
        for (const simpleDom of dom.set) {
          const isSub = simpleSubset(simpleSub, simpleDom, options);
          sawNonNull = sawNonNull || isSub !== null;
          if (isSub) {
            continue OUTER;
          }
        }
        if (sawNonNull) {
          return false;
        }
      }
      return true;
    };
    var minimumVersionWithPreRelease = [new Comparator(">=0.0.0-0")];
    var minimumVersion = [new Comparator(">=0.0.0")];
    var simpleSubset = (sub, dom, options) => {
      if (sub === dom) {
        return true;
      }
      if (sub.length === 1 && sub[0].semver === ANY) {
        if (dom.length === 1 && dom[0].semver === ANY) {
          return true;
        } else if (options.includePrerelease) {
          sub = minimumVersionWithPreRelease;
        } else {
          sub = minimumVersion;
        }
      }
      if (dom.length === 1 && dom[0].semver === ANY) {
        if (options.includePrerelease) {
          return true;
        } else {
          dom = minimumVersion;
        }
      }
      const eqSet = /* @__PURE__ */ new Set();
      let gt, lt;
      for (const c of sub) {
        if (c.operator === ">" || c.operator === ">=") {
          gt = higherGT(gt, c, options);
        } else if (c.operator === "<" || c.operator === "<=") {
          lt = lowerLT(lt, c, options);
        } else {
          eqSet.add(c.semver);
        }
      }
      if (eqSet.size > 1) {
        return null;
      }
      let gtltComp;
      if (gt && lt) {
        gtltComp = compare(gt.semver, lt.semver, options);
        if (gtltComp > 0) {
          return null;
        } else if (gtltComp === 0 && (gt.operator !== ">=" || lt.operator !== "<=")) {
          return null;
        }
      }
      for (const eq of eqSet) {
        if (gt && !satisfies(eq, String(gt), options)) {
          return null;
        }
        if (lt && !satisfies(eq, String(lt), options)) {
          return null;
        }
        for (const c of dom) {
          if (!satisfies(eq, String(c), options)) {
            return false;
          }
        }
        return true;
      }
      let higher, lower;
      let hasDomLT, hasDomGT;
      let needDomLTPre = lt && !options.includePrerelease && lt.semver.prerelease.length ? lt.semver : false;
      let needDomGTPre = gt && !options.includePrerelease && gt.semver.prerelease.length ? gt.semver : false;
      if (needDomLTPre && needDomLTPre.prerelease.length === 1 && lt.operator === "<" && needDomLTPre.prerelease[0] === 0) {
        needDomLTPre = false;
      }
      for (const c of dom) {
        hasDomGT = hasDomGT || c.operator === ">" || c.operator === ">=";
        hasDomLT = hasDomLT || c.operator === "<" || c.operator === "<=";
        if (gt) {
          if (needDomGTPre) {
            if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomGTPre.major && c.semver.minor === needDomGTPre.minor && c.semver.patch === needDomGTPre.patch) {
              needDomGTPre = false;
            }
          }
          if (c.operator === ">" || c.operator === ">=") {
            higher = higherGT(gt, c, options);
            if (higher === c && higher !== gt) {
              return false;
            }
          } else if (gt.operator === ">=" && !satisfies(gt.semver, String(c), options)) {
            return false;
          }
        }
        if (lt) {
          if (needDomLTPre) {
            if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomLTPre.major && c.semver.minor === needDomLTPre.minor && c.semver.patch === needDomLTPre.patch) {
              needDomLTPre = false;
            }
          }
          if (c.operator === "<" || c.operator === "<=") {
            lower = lowerLT(lt, c, options);
            if (lower === c && lower !== lt) {
              return false;
            }
          } else if (lt.operator === "<=" && !satisfies(lt.semver, String(c), options)) {
            return false;
          }
        }
        if (!c.operator && (lt || gt) && gtltComp !== 0) {
          return false;
        }
      }
      if (gt && hasDomLT && !lt && gtltComp !== 0) {
        return false;
      }
      if (lt && hasDomGT && !gt && gtltComp !== 0) {
        return false;
      }
      if (needDomGTPre || needDomLTPre) {
        return false;
      }
      return true;
    };
    var higherGT = (a, b, options) => {
      if (!a) {
        return b;
      }
      const comp = compare(a.semver, b.semver, options);
      return comp > 0 ? a : comp < 0 ? b : b.operator === ">" && a.operator === ">=" ? b : a;
    };
    var lowerLT = (a, b, options) => {
      if (!a) {
        return b;
      }
      const comp = compare(a.semver, b.semver, options);
      return comp < 0 ? a : comp > 0 ? b : b.operator === "<" && a.operator === "<=" ? b : a;
    };
    module2.exports = subset;
  }
});

// node_modules/semver/index.js
var require_semver2 = __commonJS({
  "node_modules/semver/index.js"(exports2, module2) {
    "use strict";
    var internalRe = require_re();
    var constants = require_constants();
    var SemVer = require_semver();
    var identifiers = require_identifiers();
    var parse5 = require_parse();
    var valid = require_valid();
    var clean = require_clean();
    var inc = require_inc();
    var diff = require_diff();
    var major = require_major();
    var minor = require_minor();
    var patch = require_patch();
    var prerelease = require_prerelease();
    var compare = require_compare();
    var rcompare = require_rcompare();
    var compareLoose = require_compare_loose();
    var compareBuild = require_compare_build();
    var sort = require_sort();
    var rsort = require_rsort();
    var gt = require_gt();
    var lt = require_lt();
    var eq = require_eq();
    var neq = require_neq();
    var gte = require_gte();
    var lte = require_lte();
    var cmp = require_cmp();
    var coerce = require_coerce();
    var truncate = require_truncate();
    var Comparator = require_comparator();
    var Range = require_range();
    var satisfies = require_satisfies();
    var toComparators = require_to_comparators();
    var maxSatisfying = require_max_satisfying();
    var minSatisfying = require_min_satisfying();
    var minVersion = require_min_version();
    var validRange = require_valid2();
    var outside = require_outside();
    var gtr = require_gtr();
    var ltr = require_ltr();
    var intersects = require_intersects();
    var simplifyRange = require_simplify();
    var subset = require_subset();
    module2.exports = {
      parse: parse5,
      valid,
      clean,
      inc,
      diff,
      major,
      minor,
      patch,
      prerelease,
      compare,
      rcompare,
      compareLoose,
      compareBuild,
      sort,
      rsort,
      gt,
      lt,
      eq,
      neq,
      gte,
      lte,
      cmp,
      coerce,
      truncate,
      Comparator,
      Range,
      satisfies,
      toComparators,
      maxSatisfying,
      minSatisfying,
      minVersion,
      validRange,
      outside,
      gtr,
      ltr,
      intersects,
      simplifyRange,
      subset,
      SemVer,
      re: internalRe.re,
      src: internalRe.src,
      tokens: internalRe.t,
      SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
      RELEASE_TYPES: constants.RELEASE_TYPES,
      compareIdentifiers: identifiers.compareIdentifiers,
      rcompareIdentifiers: identifiers.rcompareIdentifiers
    };
  }
});

// node_modules/langsmith/dist/utils/prompts.js
function parsePromptIdentifier(identifier) {
  if (!identifier || identifier.split("/").length > 2 || identifier.startsWith("/") || identifier.endsWith("/") || identifier.split(":").length > 2) {
    throw new Error(`Invalid identifier format: ${identifier}`);
  }
  const [ownerNamePart, commitPart] = identifier.split(":");
  const commit = commitPart || "latest";
  if (ownerNamePart.includes("/")) {
    const [owner, name] = ownerNamePart.split("/", 2);
    if (!owner || !name) {
      throw new Error(`Invalid identifier format: ${identifier}`);
    }
    return [owner, name, commit];
  } else {
    if (!ownerNamePart) {
      throw new Error(`Invalid identifier format: ${identifier}`);
    }
    return ["-", ownerNamePart, commit];
  }
}
var import_semver;
var init_prompts = __esm({
  "node_modules/langsmith/dist/utils/prompts.js"() {
    import_semver = __toESM(require_semver2(), 1);
  }
});

// node_modules/langsmith/dist/utils/error.js
async function raiseForStatus(response, context, consumeOnSuccess) {
  let errorBody;
  if (response.ok) {
    if (consumeOnSuccess) {
      errorBody = await response.text();
    }
    return;
  }
  if (response.status === 403) {
    try {
      const errorData = await response.json();
      const errorCode = errorData?.error;
      if (errorCode === "org_scoped_key_requires_workspace") {
        errorBody = "This API key is org-scoped and requires workspace specification. Please provide 'workspaceId' parameter, or set LANGSMITH_WORKSPACE_ID environment variable.";
      }
    } catch (e) {
      const errorWithStatus = new Error(`${response.status} ${response.statusText}`);
      errorWithStatus.status = response?.status;
      throw errorWithStatus;
    }
  }
  if (errorBody === void 0) {
    try {
      errorBody = await response.text();
    } catch (e) {
      errorBody = "";
    }
  }
  const fullMessage = `Failed to ${context}. Received status [${response.status}]: ${response.statusText}. Message: ${errorBody}`;
  if (response.status === 409) {
    throw new LangSmithConflictError(fullMessage);
  }
  const err = new Error(fullMessage);
  err.status = response.status;
  throw err;
}
function isConflictingEndpointsError(err) {
  return typeof err === "object" && err !== null && err.code === ERR_CONFLICTING_ENDPOINTS;
}
var LangSmithConflictError, ERR_CONFLICTING_ENDPOINTS, ConflictingEndpointsError;
var init_error = __esm({
  "node_modules/langsmith/dist/utils/error.js"() {
    LangSmithConflictError = class extends Error {
      constructor(message) {
        super(message);
        Object.defineProperty(this, "status", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.name = "LangSmithConflictError";
        this.status = 409;
      }
    };
    ERR_CONFLICTING_ENDPOINTS = "ERR_CONFLICTING_ENDPOINTS";
    ConflictingEndpointsError = class extends Error {
      constructor() {
        super("You cannot provide both LANGSMITH_ENDPOINT / LANGCHAIN_ENDPOINT and LANGSMITH_RUNS_ENDPOINTS.");
        Object.defineProperty(this, "code", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ERR_CONFLICTING_ENDPOINTS
        });
        this.name = "ConflictingEndpointsError";
      }
    };
  }
});

// node_modules/langsmith/dist/utils/fast-safe-stringify/index.js
function defaultOptions() {
  return {
    depthLimit: Number.MAX_SAFE_INTEGER,
    edgesLimit: Number.MAX_SAFE_INTEGER
  };
}
function encodeString(str) {
  return encoder.encode(str);
}
function serializeWellKnownTypes(val) {
  if (val && typeof val === "object" && val !== null) {
    if (val instanceof Map) {
      return Object.fromEntries(val);
    } else if (val instanceof Set) {
      return Array.from(val);
    } else if (val instanceof Date) {
      return val.toISOString();
    } else if (val instanceof RegExp) {
      return val.toString();
    } else if (val instanceof Error) {
      return {
        name: val.name,
        message: val.message
      };
    }
  } else if (typeof val === "bigint") {
    return val.toString();
  }
  return val;
}
function createDefaultReplacer(userReplacer) {
  return function(key, val) {
    if (userReplacer) {
      const userResult = userReplacer.call(this, key, val);
      if (userResult !== void 0) {
        return userResult;
      }
    }
    return serializeWellKnownTypes(val);
  };
}
function serialize(obj, errorContext, replacer, spacer, options) {
  try {
    const str = JSON.stringify(obj, createDefaultReplacer(replacer), spacer);
    return encodeString(str);
  } catch (e) {
    if (!e.message?.includes("Converting circular structure to JSON")) {
      console.warn(`[WARNING]: LangSmith received unserializable value.${errorContext ? `
Context: ${errorContext}` : ""}`);
      return encodeString("[Unserializable]");
    }
    getLangSmithEnvironmentVariable("SUPPRESS_CIRCULAR_JSON_WARNINGS") !== "true" && console.warn(`[WARNING]: LangSmith received circular JSON. This will decrease tracer performance. ${errorContext ? `
Context: ${errorContext}` : ""}`);
    if (typeof options === "undefined") {
      options = defaultOptions();
    }
    decirc(obj, "", 0, [], void 0, 0, options);
    let res;
    try {
      if (replacerStack.length === 0) {
        res = JSON.stringify(obj, replacer, spacer);
      } else {
        res = JSON.stringify(obj, replaceGetterValues(replacer), spacer);
      }
    } catch (_) {
      return encodeString("[unable to serialize, circular reference is too complex to analyze]");
    } finally {
      while (arr.length !== 0) {
        const part = arr.pop();
        if (part.length === 4) {
          Object.defineProperty(part[0], part[1], part[3]);
        } else {
          part[0][part[1]] = part[2];
        }
      }
    }
    return encodeString(res);
  }
}
function setReplace(replace, val, k, parent) {
  var propertyDescriptor = Object.getOwnPropertyDescriptor(parent, k);
  if (propertyDescriptor.get !== void 0) {
    if (propertyDescriptor.configurable) {
      Object.defineProperty(parent, k, { value: replace });
      arr.push([parent, k, val, propertyDescriptor]);
    } else {
      replacerStack.push([val, k, replace]);
    }
  } else {
    parent[k] = replace;
    arr.push([parent, k, val]);
  }
}
function decirc(val, k, edgeIndex, stack, parent, depth, options) {
  depth += 1;
  var i;
  if (typeof val === "object" && val !== null) {
    for (i = 0; i < stack.length; i++) {
      if (stack[i] === val) {
        setReplace(CIRCULAR_REPLACE_NODE, val, k, parent);
        return;
      }
    }
    if (typeof options.depthLimit !== "undefined" && depth > options.depthLimit) {
      setReplace(LIMIT_REPLACE_NODE, val, k, parent);
      return;
    }
    if (typeof options.edgesLimit !== "undefined" && edgeIndex + 1 > options.edgesLimit) {
      setReplace(LIMIT_REPLACE_NODE, val, k, parent);
      return;
    }
    stack.push(val);
    if (Array.isArray(val)) {
      for (i = 0; i < val.length; i++) {
        decirc(val[i], i, i, stack, val, depth, options);
      }
    } else {
      val = serializeWellKnownTypes(val);
      var keys = Object.keys(val);
      for (i = 0; i < keys.length; i++) {
        var key = keys[i];
        decirc(val[key], key, i, stack, val, depth, options);
      }
    }
    stack.pop();
  }
}
function replaceGetterValues(replacer) {
  replacer = typeof replacer !== "undefined" ? replacer : function(k, v) {
    return v;
  };
  return function(key, val) {
    if (replacerStack.length > 0) {
      for (var i = 0; i < replacerStack.length; i++) {
        var part = replacerStack[i];
        if (part[1] === key && part[0] === val) {
          val = part[2];
          replacerStack.splice(i, 1);
          break;
        }
      }
    }
    return replacer.call(this, key, val);
  };
}
var LIMIT_REPLACE_NODE, CIRCULAR_REPLACE_NODE, arr, replacerStack, encoder;
var init_fast_safe_stringify = __esm({
  "node_modules/langsmith/dist/utils/fast-safe-stringify/index.js"() {
    init_env();
    LIMIT_REPLACE_NODE = "[...]";
    CIRCULAR_REPLACE_NODE = { result: "[Circular]" };
    arr = [];
    replacerStack = [];
    encoder = new TextEncoder();
  }
});

// node_modules/langsmith/dist/client.js
function mergeRuntimeEnvIntoRun(run, cachedEnvVars, omitTracedRuntimeInfo) {
  if (omitTracedRuntimeInfo) {
    return run;
  }
  const runtimeEnv = getRuntimeEnvironment();
  const envVars = cachedEnvVars ?? getLangSmithEnvVarsMetadata();
  const extra = run.extra ?? {};
  const metadata = extra.metadata;
  run.extra = {
    ...extra,
    runtime: {
      ...runtimeEnv,
      ...extra?.runtime
    },
    metadata: {
      ...envVars,
      ...envVars.revision_id || "revision_id" in run && run.revision_id ? {
        revision_id: ("revision_id" in run ? run.revision_id : void 0) ?? envVars.revision_id
      } : {},
      ...metadata
    }
  };
  return run;
}
async function toArray(iterable) {
  const result = [];
  for await (const item of iterable) {
    result.push(item);
  }
  return result;
}
function trimQuotes(str) {
  if (str === void 0) {
    return void 0;
  }
  return str.trim().replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
}
function _formatFeedbackScore(score) {
  if (typeof score === "number") {
    return Number(score.toFixed(4));
  }
  return score;
}
function isExampleCreate(input) {
  return "dataset_id" in input || "dataset_name" in input;
}
var getTracingSamplingRate, isLocalhost, handle429, DEFAULT_UNCOMPRESSED_BATCH_SIZE_LIMIT_BYTES, DEFAULT_MAX_SIZE_BYTES, SERVER_INFO_REQUEST_TIMEOUT_MS, DEFAULT_BATCH_SIZE_LIMIT, DEFAULT_API_URL, AutoBatchQueue, Client;
var init_client = __esm({
  "node_modules/langsmith/dist/client.js"() {
    init_esm_node();
    init_translator();
    init_otel();
    init_async_caller();
    init_messages();
    init_env();
    init_dist();
    init_uuid();
    init_warn();
    init_prompts();
    init_error();
    init_fetch();
    init_fast_safe_stringify();
    getTracingSamplingRate = (configRate) => {
      const samplingRateStr = configRate?.toString() ?? getLangSmithEnvironmentVariable("TRACING_SAMPLING_RATE");
      if (samplingRateStr === void 0) {
        return void 0;
      }
      const samplingRate = parseFloat(samplingRateStr);
      if (samplingRate < 0 || samplingRate > 1) {
        throw new Error(`LANGSMITH_TRACING_SAMPLING_RATE must be between 0 and 1 if set. Got: ${samplingRate}`);
      }
      return samplingRate;
    };
    isLocalhost = (url) => {
      const strippedUrl = url.replace("http://", "").replace("https://", "");
      const hostname = strippedUrl.split("/")[0].split(":")[0];
      return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
    };
    handle429 = async (response) => {
      if (response?.status === 429) {
        const retryAfter = parseInt(response.headers.get("retry-after") ?? "10", 10) * 1e3;
        if (retryAfter > 0) {
          await new Promise((resolve) => setTimeout(resolve, retryAfter));
          return true;
        }
      }
      return false;
    };
    DEFAULT_UNCOMPRESSED_BATCH_SIZE_LIMIT_BYTES = 24 * 1024 * 1024;
    DEFAULT_MAX_SIZE_BYTES = 1024 * 1024 * 1024;
    SERVER_INFO_REQUEST_TIMEOUT_MS = 1e4;
    DEFAULT_BATCH_SIZE_LIMIT = 100;
    DEFAULT_API_URL = "https://api.smith.langchain.com";
    AutoBatchQueue = class {
      constructor(maxSizeBytes) {
        Object.defineProperty(this, "items", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: []
        });
        Object.defineProperty(this, "sizeBytes", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: 0
        });
        Object.defineProperty(this, "maxSizeBytes", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.maxSizeBytes = maxSizeBytes ?? DEFAULT_MAX_SIZE_BYTES;
      }
      peek() {
        return this.items[0];
      }
      push(item) {
        let itemPromiseResolve;
        const itemPromise = new Promise((resolve) => {
          itemPromiseResolve = resolve;
        });
        const size = serialize(item.item, `Serializing run with id: ${item.item.id}`).length;
        if (this.sizeBytes + size > this.maxSizeBytes && this.items.length > 0) {
          console.warn(`AutoBatchQueue size limit (${this.maxSizeBytes} bytes) exceeded. Dropping run with id: ${item.item.id}. Current queue size: ${this.sizeBytes} bytes, attempted addition: ${size} bytes.`);
          itemPromiseResolve();
          return itemPromise;
        }
        this.items.push({
          action: item.action,
          payload: item.item,
          otelContext: item.otelContext,
          apiKey: item.apiKey,
          apiUrl: item.apiUrl,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          itemPromiseResolve,
          itemPromise,
          size
        });
        this.sizeBytes += size;
        return itemPromise;
      }
      pop({ upToSizeBytes, upToSize }) {
        if (upToSizeBytes < 1) {
          throw new Error("Number of bytes to pop off may not be less than 1.");
        }
        const popped = [];
        let poppedSizeBytes = 0;
        while (poppedSizeBytes + (this.peek()?.size ?? 0) < upToSizeBytes && this.items.length > 0 && popped.length < upToSize) {
          const item = this.items.shift();
          if (item) {
            popped.push(item);
            poppedSizeBytes += item.size;
            this.sizeBytes -= item.size;
          }
        }
        if (popped.length === 0 && this.items.length > 0) {
          const item = this.items.shift();
          popped.push(item);
          poppedSizeBytes += item.size;
          this.sizeBytes -= item.size;
        }
        return [
          popped.map((it) => ({
            action: it.action,
            item: it.payload,
            otelContext: it.otelContext,
            apiKey: it.apiKey,
            apiUrl: it.apiUrl,
            size: it.size
          })),
          () => popped.forEach((it) => it.itemPromiseResolve())
        ];
      }
    };
    Client = class _Client {
      get _fetch() {
        return this.fetchImplementation || _getFetchImplementation(this.debug);
      }
      constructor(config = {}) {
        Object.defineProperty(this, "apiKey", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "apiUrl", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "webUrl", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "workspaceId", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "caller", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "batchIngestCaller", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "timeout_ms", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "_tenantId", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: null
        });
        Object.defineProperty(this, "hideInputs", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "hideOutputs", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "omitTracedRuntimeInfo", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "tracingSampleRate", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "filteredPostUuids", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: /* @__PURE__ */ new Set()
        });
        Object.defineProperty(this, "autoBatchTracing", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        Object.defineProperty(this, "autoBatchQueue", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "autoBatchTimeout", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "autoBatchAggregationDelayMs", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: 250
        });
        Object.defineProperty(this, "batchSizeBytesLimit", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "batchSizeLimit", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "fetchOptions", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "settings", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "blockOnRootRunFinalization", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: getEnvironmentVariable("LANGSMITH_TRACING_BACKGROUND") === "false"
        });
        Object.defineProperty(this, "traceBatchConcurrency", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: 5
        });
        Object.defineProperty(this, "_serverInfo", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "_getServerInfoPromise", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "manualFlushMode", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: false
        });
        Object.defineProperty(this, "langSmithToOTELTranslator", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "fetchImplementation", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "cachedLSEnvVarsForMetadata", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "multipartStreamingDisabled", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: false
        });
        Object.defineProperty(this, "debug", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: getEnvironmentVariable("LANGSMITH_DEBUG") === "true"
        });
        const defaultConfig = _Client.getDefaultClientConfig();
        this.tracingSampleRate = getTracingSamplingRate(config.tracingSamplingRate);
        this.apiUrl = trimQuotes(config.apiUrl ?? defaultConfig.apiUrl) ?? "";
        if (this.apiUrl.endsWith("/")) {
          this.apiUrl = this.apiUrl.slice(0, -1);
        }
        this.apiKey = trimQuotes(config.apiKey ?? defaultConfig.apiKey);
        this.webUrl = trimQuotes(config.webUrl ?? defaultConfig.webUrl);
        if (this.webUrl?.endsWith("/")) {
          this.webUrl = this.webUrl.slice(0, -1);
        }
        this.workspaceId = trimQuotes(config.workspaceId ?? getLangSmithEnvironmentVariable("WORKSPACE_ID"));
        this.timeout_ms = config.timeout_ms ?? 9e4;
        this.caller = new AsyncCaller({
          ...config.callerOptions ?? {},
          maxRetries: 4,
          debug: config.debug ?? this.debug
        });
        this.traceBatchConcurrency = config.traceBatchConcurrency ?? this.traceBatchConcurrency;
        if (this.traceBatchConcurrency < 1) {
          throw new Error("Trace batch concurrency must be positive.");
        }
        this.debug = config.debug ?? this.debug;
        this.fetchImplementation = config.fetchImplementation;
        const maxMemory = config.maxIngestMemoryBytes ?? DEFAULT_MAX_SIZE_BYTES;
        this.batchIngestCaller = new AsyncCaller({
          maxRetries: 4,
          maxConcurrency: this.traceBatchConcurrency,
          maxQueueSizeBytes: maxMemory,
          ...config.callerOptions ?? {},
          onFailedResponseHook: handle429,
          debug: config.debug ?? this.debug
        });
        this.hideInputs = config.hideInputs ?? config.anonymizer ?? defaultConfig.hideInputs;
        this.hideOutputs = config.hideOutputs ?? config.anonymizer ?? defaultConfig.hideOutputs;
        this.omitTracedRuntimeInfo = config.omitTracedRuntimeInfo ?? false;
        this.autoBatchTracing = config.autoBatchTracing ?? this.autoBatchTracing;
        this.autoBatchQueue = new AutoBatchQueue(maxMemory);
        this.blockOnRootRunFinalization = config.blockOnRootRunFinalization ?? this.blockOnRootRunFinalization;
        this.batchSizeBytesLimit = config.batchSizeBytesLimit;
        this.batchSizeLimit = config.batchSizeLimit;
        this.fetchOptions = config.fetchOptions || {};
        this.manualFlushMode = config.manualFlushMode ?? this.manualFlushMode;
        if (getOtelEnabled()) {
          this.langSmithToOTELTranslator = new LangSmithToOTELTranslator();
        }
        this.cachedLSEnvVarsForMetadata = getLangSmithEnvVarsMetadata();
      }
      static getDefaultClientConfig() {
        const apiKey = getLangSmithEnvironmentVariable("API_KEY");
        const apiUrl = getLangSmithEnvironmentVariable("ENDPOINT") ?? DEFAULT_API_URL;
        const hideInputs = getLangSmithEnvironmentVariable("HIDE_INPUTS") === "true";
        const hideOutputs = getLangSmithEnvironmentVariable("HIDE_OUTPUTS") === "true";
        return {
          apiUrl,
          apiKey,
          webUrl: void 0,
          hideInputs,
          hideOutputs
        };
      }
      getHostUrl() {
        if (this.webUrl) {
          return this.webUrl;
        } else if (isLocalhost(this.apiUrl)) {
          this.webUrl = "http://localhost:3000";
          return this.webUrl;
        } else if (this.apiUrl.endsWith("/api/v1")) {
          this.webUrl = this.apiUrl.replace("/api/v1", "");
          return this.webUrl;
        } else if (this.apiUrl.includes("/api") && !this.apiUrl.split(".", 1)[0].endsWith("api")) {
          this.webUrl = this.apiUrl.replace("/api", "");
          return this.webUrl;
        } else if (this.apiUrl.split(".", 1)[0].includes("dev")) {
          this.webUrl = "https://dev.smith.langchain.com";
          return this.webUrl;
        } else if (this.apiUrl.split(".", 1)[0].includes("eu")) {
          this.webUrl = "https://eu.smith.langchain.com";
          return this.webUrl;
        } else if (this.apiUrl.split(".", 1)[0].includes("beta")) {
          this.webUrl = "https://beta.smith.langchain.com";
          return this.webUrl;
        } else {
          this.webUrl = "https://smith.langchain.com";
          return this.webUrl;
        }
      }
      get headers() {
        const headers = {
          "User-Agent": `langsmith-js/${__version__}`
        };
        if (this.apiKey) {
          headers["x-api-key"] = `${this.apiKey}`;
        }
        if (this.workspaceId) {
          headers["x-tenant-id"] = this.workspaceId;
        }
        return headers;
      }
      _getPlatformEndpointPath(path2) {
        const needsV1Prefix = this.apiUrl.slice(-3) !== "/v1" && this.apiUrl.slice(-4) !== "/v1/";
        return needsV1Prefix ? `/v1/platform/${path2}` : `/platform/${path2}`;
      }
      async processInputs(inputs) {
        if (this.hideInputs === false) {
          return inputs;
        }
        if (this.hideInputs === true) {
          return {};
        }
        if (typeof this.hideInputs === "function") {
          return this.hideInputs(inputs);
        }
        return inputs;
      }
      async processOutputs(outputs) {
        if (this.hideOutputs === false) {
          return outputs;
        }
        if (this.hideOutputs === true) {
          return {};
        }
        if (typeof this.hideOutputs === "function") {
          return this.hideOutputs(outputs);
        }
        return outputs;
      }
      async prepareRunCreateOrUpdateInputs(run) {
        const runParams = { ...run };
        if (runParams.inputs !== void 0) {
          runParams.inputs = await this.processInputs(runParams.inputs);
        }
        if (runParams.outputs !== void 0) {
          runParams.outputs = await this.processOutputs(runParams.outputs);
        }
        return runParams;
      }
      async _getResponse(path2, queryParams) {
        const paramsString = queryParams?.toString() ?? "";
        const url = `${this.apiUrl}${path2}?${paramsString}`;
        const response = await this.caller.call(async () => {
          const res = await this._fetch(url, {
            method: "GET",
            headers: this.headers,
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions
          });
          await raiseForStatus(res, `fetch ${path2}`);
          return res;
        });
        return response;
      }
      async _get(path2, queryParams) {
        const response = await this._getResponse(path2, queryParams);
        return response.json();
      }
      async *_getPaginated(path2, queryParams = new URLSearchParams(), transform) {
        let offset = Number(queryParams.get("offset")) || 0;
        const limit = Number(queryParams.get("limit")) || 100;
        while (true) {
          queryParams.set("offset", String(offset));
          queryParams.set("limit", String(limit));
          const url = `${this.apiUrl}${path2}?${queryParams}`;
          const response = await this.caller.call(async () => {
            const res = await this._fetch(url, {
              method: "GET",
              headers: this.headers,
              signal: AbortSignal.timeout(this.timeout_ms),
              ...this.fetchOptions
            });
            await raiseForStatus(res, `fetch ${path2}`);
            return res;
          });
          const items = transform ? transform(await response.json()) : await response.json();
          if (items.length === 0) {
            break;
          }
          yield items;
          if (items.length < limit) {
            break;
          }
          offset += items.length;
        }
      }
      async *_getCursorPaginatedList(path2, body = null, requestMethod = "POST", dataKey = "runs") {
        const bodyParams = body ? { ...body } : {};
        while (true) {
          const body2 = JSON.stringify(bodyParams);
          const response = await this.caller.call(async () => {
            const res = await this._fetch(`${this.apiUrl}${path2}`, {
              method: requestMethod,
              headers: { ...this.headers, "Content-Type": "application/json" },
              signal: AbortSignal.timeout(this.timeout_ms),
              ...this.fetchOptions,
              body: body2
            });
            await raiseForStatus(res, `fetch ${path2}`);
            return res;
          });
          const responseBody = await response.json();
          if (!responseBody) {
            break;
          }
          if (!responseBody[dataKey]) {
            break;
          }
          yield responseBody[dataKey];
          const cursors = responseBody.cursors;
          if (!cursors) {
            break;
          }
          if (!cursors.next) {
            break;
          }
          bodyParams.cursor = cursors.next;
        }
      }
      // Allows mocking for tests
      _shouldSample() {
        if (this.tracingSampleRate === void 0) {
          return true;
        }
        return Math.random() < this.tracingSampleRate;
      }
      _filterForSampling(runs, patch = false) {
        if (this.tracingSampleRate === void 0) {
          return runs;
        }
        if (patch) {
          const sampled = [];
          for (const run of runs) {
            if (!this.filteredPostUuids.has(run.trace_id)) {
              sampled.push(run);
            } else if (run.id === run.trace_id) {
              this.filteredPostUuids.delete(run.trace_id);
            }
          }
          return sampled;
        } else {
          const sampled = [];
          for (const run of runs) {
            const traceId = run.trace_id ?? run.id;
            if (this.filteredPostUuids.has(traceId)) {
              continue;
            }
            if (run.id === traceId) {
              if (this._shouldSample()) {
                sampled.push(run);
              } else {
                this.filteredPostUuids.add(traceId);
              }
            } else {
              sampled.push(run);
            }
          }
          return sampled;
        }
      }
      async _getBatchSizeLimitBytes() {
        const serverInfo = await this._ensureServerInfo();
        return this.batchSizeBytesLimit ?? serverInfo.batch_ingest_config?.size_limit_bytes ?? DEFAULT_UNCOMPRESSED_BATCH_SIZE_LIMIT_BYTES;
      }
      /**
       * Get the maximum number of operations to batch in a single request.
       */
      async _getBatchSizeLimit() {
        const serverInfo = await this._ensureServerInfo();
        return this.batchSizeLimit ?? serverInfo.batch_ingest_config?.size_limit ?? DEFAULT_BATCH_SIZE_LIMIT;
      }
      async _getDatasetExamplesMultiPartSupport() {
        const serverInfo = await this._ensureServerInfo();
        return serverInfo.instance_flags?.dataset_examples_multipart_enabled ?? false;
      }
      drainAutoBatchQueue({ batchSizeLimitBytes, batchSizeLimit }) {
        const promises = [];
        while (this.autoBatchQueue.items.length > 0) {
          const [batch, done] = this.autoBatchQueue.pop({
            upToSizeBytes: batchSizeLimitBytes,
            upToSize: batchSizeLimit
          });
          if (!batch.length) {
            done();
            break;
          }
          const batchesByDestination = batch.reduce((acc, item) => {
            const apiUrl = item.apiUrl ?? this.apiUrl;
            const apiKey = item.apiKey ?? this.apiKey;
            const isDefault = item.apiKey === this.apiKey && item.apiUrl === this.apiUrl;
            const batchKey = isDefault ? "default" : `${apiUrl}|${apiKey}`;
            if (!acc[batchKey]) {
              acc[batchKey] = [];
            }
            acc[batchKey].push(item);
            return acc;
          }, {});
          const batchPromises = [];
          for (const [batchKey, batch2] of Object.entries(batchesByDestination)) {
            const batchPromise = this._processBatch(batch2, {
              apiUrl: batchKey === "default" ? void 0 : batchKey.split("|")[0],
              apiKey: batchKey === "default" ? void 0 : batchKey.split("|")[1]
            });
            batchPromises.push(batchPromise);
          }
          const allBatchesPromise = Promise.all(batchPromises).finally(done);
          promises.push(allBatchesPromise);
        }
        return Promise.all(promises);
      }
      async _processBatch(batch, options) {
        if (!batch.length) {
          return;
        }
        const batchSizeBytes = batch.reduce((sum, item) => sum + (item.size ?? 0), 0);
        try {
          if (this.langSmithToOTELTranslator !== void 0) {
            this._sendBatchToOTELTranslator(batch);
          } else {
            const ingestParams = {
              runCreates: batch.filter((item) => item.action === "create").map((item) => item.item),
              runUpdates: batch.filter((item) => item.action === "update").map((item) => item.item)
            };
            const serverInfo = await this._ensureServerInfo();
            if (serverInfo?.batch_ingest_config?.use_multipart_endpoint) {
              const useGzip = serverInfo?.instance_flags?.gzip_body_enabled;
              await this.multipartIngestRuns(ingestParams, {
                ...options,
                useGzip,
                sizeBytes: batchSizeBytes
              });
            } else {
              await this.batchIngestRuns(ingestParams, {
                ...options,
                sizeBytes: batchSizeBytes
              });
            }
          }
        } catch (e) {
          console.error("Error exporting batch:", e);
        }
      }
      _sendBatchToOTELTranslator(batch) {
        if (this.langSmithToOTELTranslator !== void 0) {
          const otelContextMap = /* @__PURE__ */ new Map();
          const operations = [];
          for (const item of batch) {
            if (item.item.id && item.otelContext) {
              otelContextMap.set(item.item.id, item.otelContext);
              if (item.action === "create") {
                operations.push({
                  operation: "post",
                  id: item.item.id,
                  trace_id: item.item.trace_id ?? item.item.id,
                  run: item.item
                });
              } else {
                operations.push({
                  operation: "patch",
                  id: item.item.id,
                  trace_id: item.item.trace_id ?? item.item.id,
                  run: item.item
                });
              }
            }
          }
          this.langSmithToOTELTranslator.exportBatch(operations, otelContextMap);
        }
      }
      async processRunOperation(item) {
        clearTimeout(this.autoBatchTimeout);
        this.autoBatchTimeout = void 0;
        item.item = mergeRuntimeEnvIntoRun(item.item, this.cachedLSEnvVarsForMetadata, this.omitTracedRuntimeInfo);
        const itemPromise = this.autoBatchQueue.push(item);
        if (this.manualFlushMode) {
          return itemPromise;
        }
        const sizeLimitBytes = await this._getBatchSizeLimitBytes();
        const sizeLimit = await this._getBatchSizeLimit();
        if (this.autoBatchQueue.sizeBytes > sizeLimitBytes || this.autoBatchQueue.items.length > sizeLimit) {
          void this.drainAutoBatchQueue({
            batchSizeLimitBytes: sizeLimitBytes,
            batchSizeLimit: sizeLimit
          });
        }
        if (this.autoBatchQueue.items.length > 0) {
          this.autoBatchTimeout = setTimeout(() => {
            this.autoBatchTimeout = void 0;
            void this.drainAutoBatchQueue({
              batchSizeLimitBytes: sizeLimitBytes,
              batchSizeLimit: sizeLimit
            });
          }, this.autoBatchAggregationDelayMs);
        }
        return itemPromise;
      }
      async _getServerInfo() {
        const response = await this.caller.call(async () => {
          const res = await this._fetch(`${this.apiUrl}/info`, {
            method: "GET",
            headers: { Accept: "application/json" },
            signal: AbortSignal.timeout(SERVER_INFO_REQUEST_TIMEOUT_MS),
            ...this.fetchOptions
          });
          await raiseForStatus(res, "get server info");
          return res;
        });
        const json = await response.json();
        if (this.debug) {
          console.log("\n=== LangSmith Server Configuration ===\n" + JSON.stringify(json, null, 2) + "\n");
        }
        return json;
      }
      async _ensureServerInfo() {
        if (this._getServerInfoPromise === void 0) {
          this._getServerInfoPromise = (async () => {
            if (this._serverInfo === void 0) {
              try {
                this._serverInfo = await this._getServerInfo();
              } catch (e) {
                console.warn(`[LANGSMITH]: Failed to fetch info on supported operations. Falling back to batch operations and default limits. Info: ${e.status ?? "Unspecified status code"} ${e.message}`);
              }
            }
            return this._serverInfo ?? {};
          })();
        }
        return this._getServerInfoPromise.then((serverInfo) => {
          if (this._serverInfo === void 0) {
            this._getServerInfoPromise = void 0;
          }
          return serverInfo;
        });
      }
      async _getSettings() {
        if (!this.settings) {
          this.settings = this._get("/settings");
        }
        return await this.settings;
      }
      /**
       * Flushes current queued traces.
       */
      async flush() {
        const sizeLimitBytes = await this._getBatchSizeLimitBytes();
        const sizeLimit = await this._getBatchSizeLimit();
        await this.drainAutoBatchQueue({
          batchSizeLimitBytes: sizeLimitBytes,
          batchSizeLimit: sizeLimit
        });
      }
      _cloneCurrentOTELContext() {
        const otel_trace = getOTELTrace();
        const otel_context = getOTELContext();
        if (this.langSmithToOTELTranslator !== void 0) {
          const currentSpan = otel_trace.getActiveSpan();
          if (currentSpan) {
            return otel_trace.setSpan(otel_context.active(), currentSpan);
          }
        }
        return void 0;
      }
      async createRun(run, options) {
        if (!this._filterForSampling([run]).length) {
          return;
        }
        const headers = {
          ...this.headers,
          "Content-Type": "application/json"
        };
        const session_name = run.project_name;
        delete run.project_name;
        const runCreate = await this.prepareRunCreateOrUpdateInputs({
          session_name,
          ...run,
          start_time: run.start_time ?? Date.now()
        });
        if (this.autoBatchTracing && runCreate.trace_id !== void 0 && runCreate.dotted_order !== void 0) {
          const otelContext = this._cloneCurrentOTELContext();
          void this.processRunOperation({
            action: "create",
            item: runCreate,
            otelContext,
            apiKey: options?.apiKey,
            apiUrl: options?.apiUrl
          }).catch(console.error);
          return;
        }
        const mergedRunCreateParam = mergeRuntimeEnvIntoRun(runCreate, this.cachedLSEnvVarsForMetadata, this.omitTracedRuntimeInfo);
        if (options?.apiKey !== void 0) {
          headers["x-api-key"] = options.apiKey;
        }
        if (options?.workspaceId !== void 0) {
          headers["x-tenant-id"] = options.workspaceId;
        }
        const body = serialize(mergedRunCreateParam, `Creating run with id: ${mergedRunCreateParam.id}`);
        await this.caller.call(async () => {
          const res = await this._fetch(`${options?.apiUrl ?? this.apiUrl}/runs`, {
            method: "POST",
            headers,
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions,
            body
          });
          await raiseForStatus(res, "create run", true);
          return res;
        });
      }
      /**
       * Batch ingest/upsert multiple runs in the Langsmith system.
       * @param runs
       */
      async batchIngestRuns({ runCreates, runUpdates }, options) {
        if (runCreates === void 0 && runUpdates === void 0) {
          return;
        }
        let preparedCreateParams = await Promise.all(runCreates?.map((create) => this.prepareRunCreateOrUpdateInputs(create)) ?? []);
        let preparedUpdateParams = await Promise.all(runUpdates?.map((update) => this.prepareRunCreateOrUpdateInputs(update)) ?? []);
        if (preparedCreateParams.length > 0 && preparedUpdateParams.length > 0) {
          const createById = preparedCreateParams.reduce((params, run) => {
            if (!run.id) {
              return params;
            }
            params[run.id] = run;
            return params;
          }, {});
          const standaloneUpdates = [];
          for (const updateParam of preparedUpdateParams) {
            if (updateParam.id !== void 0 && createById[updateParam.id]) {
              createById[updateParam.id] = {
                ...createById[updateParam.id],
                ...updateParam
              };
            } else {
              standaloneUpdates.push(updateParam);
            }
          }
          preparedCreateParams = Object.values(createById);
          preparedUpdateParams = standaloneUpdates;
        }
        const rawBatch = {
          post: preparedCreateParams,
          patch: preparedUpdateParams
        };
        if (!rawBatch.post.length && !rawBatch.patch.length) {
          return;
        }
        const batchChunks = {
          post: [],
          patch: []
        };
        for (const k of ["post", "patch"]) {
          const key = k;
          const batchItems = rawBatch[key].reverse();
          let batchItem = batchItems.pop();
          while (batchItem !== void 0) {
            batchChunks[key].push(batchItem);
            batchItem = batchItems.pop();
          }
        }
        if (batchChunks.post.length > 0 || batchChunks.patch.length > 0) {
          const runIds = batchChunks.post.map((item) => item.id).concat(batchChunks.patch.map((item) => item.id)).join(",");
          await this._postBatchIngestRuns(serialize(batchChunks, `Ingesting runs with ids: ${runIds}`), options);
        }
      }
      async _postBatchIngestRuns(body, options) {
        const headers = {
          ...this.headers,
          "Content-Type": "application/json",
          Accept: "application/json"
        };
        if (options?.apiKey !== void 0) {
          headers["x-api-key"] = options.apiKey;
        }
        await this.batchIngestCaller.callWithOptions({ sizeBytes: options?.sizeBytes }, async () => {
          const res = await this._fetch(`${options?.apiUrl ?? this.apiUrl}/runs/batch`, {
            method: "POST",
            headers,
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions,
            body
          });
          await raiseForStatus(res, "batch create run", true);
          return res;
        });
      }
      /**
       * Batch ingest/upsert multiple runs in the Langsmith system.
       * @param runs
       */
      async multipartIngestRuns({ runCreates, runUpdates }, options) {
        if (runCreates === void 0 && runUpdates === void 0) {
          return;
        }
        const allAttachments = {};
        let preparedCreateParams = [];
        for (const create of runCreates ?? []) {
          const preparedCreate = await this.prepareRunCreateOrUpdateInputs(create);
          if (preparedCreate.id !== void 0 && preparedCreate.attachments !== void 0) {
            allAttachments[preparedCreate.id] = preparedCreate.attachments;
          }
          delete preparedCreate.attachments;
          preparedCreateParams.push(preparedCreate);
        }
        let preparedUpdateParams = [];
        for (const update of runUpdates ?? []) {
          preparedUpdateParams.push(await this.prepareRunCreateOrUpdateInputs(update));
        }
        const invalidRunCreate = preparedCreateParams.find((runCreate) => {
          return runCreate.trace_id === void 0 || runCreate.dotted_order === void 0;
        });
        if (invalidRunCreate !== void 0) {
          throw new Error(`Multipart ingest requires "trace_id" and "dotted_order" to be set when creating a run`);
        }
        const invalidRunUpdate = preparedUpdateParams.find((runUpdate) => {
          return runUpdate.trace_id === void 0 || runUpdate.dotted_order === void 0;
        });
        if (invalidRunUpdate !== void 0) {
          throw new Error(`Multipart ingest requires "trace_id" and "dotted_order" to be set when updating a run`);
        }
        if (preparedCreateParams.length > 0 && preparedUpdateParams.length > 0) {
          const createById = preparedCreateParams.reduce((params, run) => {
            if (!run.id) {
              return params;
            }
            params[run.id] = run;
            return params;
          }, {});
          const standaloneUpdates = [];
          for (const updateParam of preparedUpdateParams) {
            if (updateParam.id !== void 0 && createById[updateParam.id]) {
              createById[updateParam.id] = {
                ...createById[updateParam.id],
                ...updateParam
              };
            } else {
              standaloneUpdates.push(updateParam);
            }
          }
          preparedCreateParams = Object.values(createById);
          preparedUpdateParams = standaloneUpdates;
        }
        if (preparedCreateParams.length === 0 && preparedUpdateParams.length === 0) {
          return;
        }
        const accumulatedContext = [];
        const accumulatedParts = [];
        for (const [method, payloads] of [
          ["post", preparedCreateParams],
          ["patch", preparedUpdateParams]
        ]) {
          for (const originalPayload of payloads) {
            const { inputs, outputs, events, extra, error, serialized, attachments, ...payload } = originalPayload;
            const fields = { inputs, outputs, events, extra, error, serialized };
            const stringifiedPayload = serialize(payload, `Serializing for multipart ingestion of run with id: ${payload.id}`);
            accumulatedParts.push({
              name: `${method}.${payload.id}`,
              payload: new Blob([stringifiedPayload], {
                type: `application/json; length=${stringifiedPayload.length}`
                // encoding=gzip
              })
            });
            for (const [key, value] of Object.entries(fields)) {
              if (value === void 0) {
                continue;
              }
              const stringifiedValue = serialize(value, `Serializing ${key} for multipart ingestion of run with id: ${payload.id}`);
              accumulatedParts.push({
                name: `${method}.${payload.id}.${key}`,
                payload: new Blob([stringifiedValue], {
                  type: `application/json; length=${stringifiedValue.length}`
                })
              });
            }
            if (payload.id !== void 0) {
              const attachments2 = allAttachments[payload.id];
              if (attachments2) {
                delete allAttachments[payload.id];
                for (const [name, attachment] of Object.entries(attachments2)) {
                  let contentType;
                  let content;
                  if (Array.isArray(attachment)) {
                    [contentType, content] = attachment;
                  } else {
                    contentType = attachment.mimeType;
                    content = attachment.data;
                  }
                  if (name.includes(".")) {
                    console.warn(`Skipping attachment '${name}' for run ${payload.id}: Invalid attachment name. Attachment names must not contain periods ('.'). Please rename the attachment and try again.`);
                    continue;
                  }
                  accumulatedParts.push({
                    name: `attachment.${payload.id}.${name}`,
                    payload: new Blob([content], {
                      type: `${contentType}; length=${content.byteLength}`
                    })
                  });
                }
              }
            }
            accumulatedContext.push(`trace=${payload.trace_id},id=${payload.id}`);
          }
        }
        await this._sendMultipartRequest(accumulatedParts, accumulatedContext.join("; "), options);
      }
      async _createNodeFetchBody(parts, boundary) {
        const chunks = [];
        for (const part of parts) {
          chunks.push(new Blob([`--${boundary}\r
`]));
          chunks.push(new Blob([
            `Content-Disposition: form-data; name="${part.name}"\r
`,
            `Content-Type: ${part.payload.type}\r
\r
`
          ]));
          chunks.push(part.payload);
          chunks.push(new Blob(["\r\n"]));
        }
        chunks.push(new Blob([`--${boundary}--\r
`]));
        const body = new Blob(chunks);
        const arrayBuffer = await body.arrayBuffer();
        return arrayBuffer;
      }
      async _createMultipartStream(parts, boundary) {
        const encoder2 = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            const writeChunk = async (chunk) => {
              if (typeof chunk === "string") {
                controller.enqueue(encoder2.encode(chunk));
              } else {
                controller.enqueue(chunk);
              }
            };
            for (const part of parts) {
              await writeChunk(`--${boundary}\r
`);
              await writeChunk(`Content-Disposition: form-data; name="${part.name}"\r
`);
              await writeChunk(`Content-Type: ${part.payload.type}\r
\r
`);
              const payloadStream = part.payload.stream();
              const reader = payloadStream.getReader();
              try {
                let result;
                while (!(result = await reader.read()).done) {
                  controller.enqueue(result.value);
                }
              } finally {
                reader.releaseLock();
              }
              await writeChunk("\r\n");
            }
            await writeChunk(`--${boundary}--\r
`);
            controller.close();
          }
        });
        return stream;
      }
      async _sendMultipartRequest(parts, context, options) {
        const boundary = "----LangSmithFormBoundary" + Math.random().toString(36).slice(2);
        const isNodeFetch = _globalFetchImplementationIsNodeFetch();
        const buildBuffered = () => this._createNodeFetchBody(parts, boundary);
        const buildStream = () => this._createMultipartStream(parts, boundary);
        const sendWithRetry = async (bodyFactory) => {
          return this.batchIngestCaller.callWithOptions({ sizeBytes: options?.sizeBytes }, async () => {
            const body = await bodyFactory();
            const headers = {
              ...this.headers,
              "Content-Type": `multipart/form-data; boundary=${boundary}`
            };
            if (options?.apiKey !== void 0) {
              headers["x-api-key"] = options.apiKey;
            }
            let transformedBody = body;
            if (options?.useGzip && typeof body === "object" && "pipeThrough" in body) {
              transformedBody = body.pipeThrough(new CompressionStream("gzip"));
              headers["Content-Encoding"] = "gzip";
            }
            const response = await this._fetch(`${options?.apiUrl ?? this.apiUrl}/runs/multipart`, {
              method: "POST",
              headers,
              body: transformedBody,
              duplex: "half",
              signal: AbortSignal.timeout(this.timeout_ms),
              ...this.fetchOptions
            });
            await raiseForStatus(response, `Failed to send multipart request`, true);
            return response;
          });
        };
        try {
          let res;
          let streamedAttempt = false;
          if (!isNodeFetch && !this.multipartStreamingDisabled && getEnv() !== "bun") {
            streamedAttempt = true;
            res = await sendWithRetry(buildStream);
          } else {
            res = await sendWithRetry(buildBuffered);
          }
          if ((!this.multipartStreamingDisabled || streamedAttempt) && res.status === 422 && (options?.apiUrl ?? this.apiUrl) !== DEFAULT_API_URL) {
            console.warn(`Streaming multipart upload to ${options?.apiUrl ?? this.apiUrl}/runs/multipart failed. This usually means the host does not support chunked uploads. Retrying with a buffered upload for operation "${context}".`);
            this.multipartStreamingDisabled = true;
            res = await sendWithRetry(buildBuffered);
          }
        } catch (e) {
          console.warn(`${e.message.trim()}

Context: ${context}`);
        }
      }
      async updateRun(runId, run, options) {
        assertUuid(runId);
        if (run.inputs) {
          run.inputs = await this.processInputs(run.inputs);
        }
        if (run.outputs) {
          run.outputs = await this.processOutputs(run.outputs);
        }
        const data = { ...run, id: runId };
        if (!this._filterForSampling([data], true).length) {
          return;
        }
        if (this.autoBatchTracing && data.trace_id !== void 0 && data.dotted_order !== void 0) {
          const otelContext = this._cloneCurrentOTELContext();
          if (run.end_time !== void 0 && data.parent_run_id === void 0 && this.blockOnRootRunFinalization && !this.manualFlushMode) {
            await this.processRunOperation({
              action: "update",
              item: data,
              otelContext,
              apiKey: options?.apiKey,
              apiUrl: options?.apiUrl
            }).catch(console.error);
            return;
          } else {
            void this.processRunOperation({
              action: "update",
              item: data,
              otelContext,
              apiKey: options?.apiKey,
              apiUrl: options?.apiUrl
            }).catch(console.error);
          }
          return;
        }
        const headers = {
          ...this.headers,
          "Content-Type": "application/json"
        };
        if (options?.apiKey !== void 0) {
          headers["x-api-key"] = options.apiKey;
        }
        if (options?.workspaceId !== void 0) {
          headers["x-tenant-id"] = options.workspaceId;
        }
        const body = serialize(run, `Serializing payload to update run with id: ${runId}`);
        await this.caller.call(async () => {
          const res = await this._fetch(`${options?.apiUrl ?? this.apiUrl}/runs/${runId}`, {
            method: "PATCH",
            headers,
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions,
            body
          });
          await raiseForStatus(res, "update run", true);
          return res;
        });
      }
      async readRun(runId, { loadChildRuns } = { loadChildRuns: false }) {
        assertUuid(runId);
        let run = await this._get(`/runs/${runId}`);
        if (loadChildRuns) {
          run = await this._loadChildRuns(run);
        }
        return run;
      }
      async getRunUrl({ runId, run, projectOpts }) {
        if (run !== void 0) {
          let sessionId;
          if (run.session_id) {
            sessionId = run.session_id;
          } else if (projectOpts?.projectName) {
            sessionId = (await this.readProject({ projectName: projectOpts?.projectName })).id;
          } else if (projectOpts?.projectId) {
            sessionId = projectOpts?.projectId;
          } else {
            const project = await this.readProject({
              projectName: getLangSmithEnvironmentVariable("PROJECT") || "default"
            });
            sessionId = project.id;
          }
          const tenantId = await this._getTenantId();
          return `${this.getHostUrl()}/o/${tenantId}/projects/p/${sessionId}/r/${run.id}?poll=true`;
        } else if (runId !== void 0) {
          const run_ = await this.readRun(runId);
          if (!run_.app_path) {
            throw new Error(`Run ${runId} has no app_path`);
          }
          const baseUrl = this.getHostUrl();
          return `${baseUrl}${run_.app_path}`;
        } else {
          throw new Error("Must provide either runId or run");
        }
      }
      async _loadChildRuns(run) {
        const childRuns = await toArray(this.listRuns({
          isRoot: false,
          projectId: run.session_id,
          traceId: run.trace_id
        }));
        const treemap = {};
        const runs = {};
        childRuns.sort((a, b) => (a?.dotted_order ?? "").localeCompare(b?.dotted_order ?? ""));
        for (const childRun of childRuns) {
          if (childRun.parent_run_id === null || childRun.parent_run_id === void 0) {
            throw new Error(`Child run ${childRun.id} has no parent`);
          }
          if (childRun.dotted_order?.startsWith(run.dotted_order ?? "") && childRun.id !== run.id) {
            if (!(childRun.parent_run_id in treemap)) {
              treemap[childRun.parent_run_id] = [];
            }
            treemap[childRun.parent_run_id].push(childRun);
            runs[childRun.id] = childRun;
          }
        }
        run.child_runs = treemap[run.id] || [];
        for (const runId in treemap) {
          if (runId !== run.id) {
            runs[runId].child_runs = treemap[runId];
          }
        }
        return run;
      }
      /**
       * List runs from the LangSmith server.
       * @param projectId - The ID of the project to filter by.
       * @param projectName - The name of the project to filter by.
       * @param parentRunId - The ID of the parent run to filter by.
       * @param traceId - The ID of the trace to filter by.
       * @param referenceExampleId - The ID of the reference example to filter by.
       * @param startTime - The start time to filter by.
       * @param isRoot - Indicates whether to only return root runs.
       * @param runType - The run type to filter by.
       * @param error - Indicates whether to filter by error runs.
       * @param id - The ID of the run to filter by.
       * @param query - The query string to filter by.
       * @param filter - The filter string to apply to the run spans.
       * @param traceFilter - The filter string to apply on the root run of the trace.
       * @param treeFilter - The filter string to apply on other runs in the trace.
       * @param limit - The maximum number of runs to retrieve.
       * @returns {AsyncIterable<Run>} - The runs.
       *
       * @example
       * // List all runs in a project
       * const projectRuns = client.listRuns({ projectName: "<your_project>" });
       *
       * @example
       * // List LLM and Chat runs in the last 24 hours
       * const todaysLLMRuns = client.listRuns({
       *   projectName: "<your_project>",
       *   start_time: new Date(Date.now() - 24 * 60 * 60 * 1000),
       *   run_type: "llm",
       * });
       *
       * @example
       * // List traces in a project
       * const rootRuns = client.listRuns({
       *   projectName: "<your_project>",
       *   execution_order: 1,
       * });
       *
       * @example
       * // List runs without errors
       * const correctRuns = client.listRuns({
       *   projectName: "<your_project>",
       *   error: false,
       * });
       *
       * @example
       * // List runs by run ID
       * const runIds = [
       *   "a36092d2-4ad5-4fb4-9c0d-0dba9a2ed836",
       *   "9398e6be-964f-4aa4-8ae9-ad78cd4b7074",
       * ];
       * const selectedRuns = client.listRuns({ run_ids: runIds });
       *
       * @example
       * // List all "chain" type runs that took more than 10 seconds and had `total_tokens` greater than 5000
       * const chainRuns = client.listRuns({
       *   projectName: "<your_project>",
       *   filter: 'and(eq(run_type, "chain"), gt(latency, 10), gt(total_tokens, 5000))',
       * });
       *
       * @example
       * // List all runs called "extractor" whose root of the trace was assigned feedback "user_score" score of 1
       * const goodExtractorRuns = client.listRuns({
       *   projectName: "<your_project>",
       *   filter: 'eq(name, "extractor")',
       *   traceFilter: 'and(eq(feedback_key, "user_score"), eq(feedback_score, 1))',
       * });
       *
       * @example
       * // List all runs that started after a specific timestamp and either have "error" not equal to null or a "Correctness" feedback score equal to 0
       * const complexRuns = client.listRuns({
       *   projectName: "<your_project>",
       *   filter: 'and(gt(start_time, "2023-07-15T12:34:56Z"), or(neq(error, null), and(eq(feedback_key, "Correctness"), eq(feedback_score, 0.0))))',
       * });
       *
       * @example
       * // List all runs where `tags` include "experimental" or "beta" and `latency` is greater than 2 seconds
       * const taggedRuns = client.listRuns({
       *   projectName: "<your_project>",
       *   filter: 'and(or(has(tags, "experimental"), has(tags, "beta")), gt(latency, 2))',
       * });
       */
      async *listRuns(props) {
        const { projectId, projectName, parentRunId, traceId, referenceExampleId, startTime, executionOrder, isRoot, runType, error, id, query, filter, traceFilter, treeFilter, limit, select, order } = props;
        let projectIds = [];
        if (projectId) {
          projectIds = Array.isArray(projectId) ? projectId : [projectId];
        }
        if (projectName) {
          const projectNames = Array.isArray(projectName) ? projectName : [projectName];
          const projectIds_ = await Promise.all(projectNames.map((name) => this.readProject({ projectName: name }).then((project) => project.id)));
          projectIds.push(...projectIds_);
        }
        const default_select = [
          "app_path",
          "completion_cost",
          "completion_tokens",
          "dotted_order",
          "end_time",
          "error",
          "events",
          "extra",
          "feedback_stats",
          "first_token_time",
          "id",
          "inputs",
          "name",
          "outputs",
          "parent_run_id",
          "parent_run_ids",
          "prompt_cost",
          "prompt_tokens",
          "reference_example_id",
          "run_type",
          "session_id",
          "start_time",
          "status",
          "tags",
          "total_cost",
          "total_tokens",
          "trace_id"
        ];
        const body = {
          session: projectIds.length ? projectIds : null,
          run_type: runType,
          reference_example: referenceExampleId,
          query,
          filter,
          trace_filter: traceFilter,
          tree_filter: treeFilter,
          execution_order: executionOrder,
          parent_run: parentRunId,
          start_time: startTime ? startTime.toISOString() : null,
          error,
          id,
          limit,
          trace: traceId,
          select: select ? select : default_select,
          is_root: isRoot,
          order
        };
        if (body.select.includes("child_run_ids")) {
          warnOnce("Deprecated: 'child_run_ids' in the listRuns select parameter is deprecated and will be removed in a future version.");
        }
        let runsYielded = 0;
        for await (const runs of this._getCursorPaginatedList("/runs/query", body)) {
          if (limit) {
            if (runsYielded >= limit) {
              break;
            }
            if (runs.length + runsYielded > limit) {
              const newRuns = runs.slice(0, limit - runsYielded);
              yield* newRuns;
              break;
            }
            runsYielded += runs.length;
            yield* runs;
          } else {
            yield* runs;
          }
        }
      }
      async *listGroupRuns(props) {
        const { projectId, projectName, groupBy, filter, startTime, endTime, limit, offset } = props;
        const sessionId = projectId || (await this.readProject({ projectName })).id;
        const baseBody = {
          session_id: sessionId,
          group_by: groupBy,
          filter,
          start_time: startTime ? startTime.toISOString() : null,
          end_time: endTime ? endTime.toISOString() : null,
          limit: Number(limit) || 100
        };
        let currentOffset = Number(offset) || 0;
        const path2 = "/runs/group";
        const url = `${this.apiUrl}${path2}`;
        while (true) {
          const currentBody = {
            ...baseBody,
            offset: currentOffset
          };
          const filteredPayload = Object.fromEntries(Object.entries(currentBody).filter(([_, value]) => value !== void 0));
          const body = JSON.stringify(filteredPayload);
          const response = await this.caller.call(async () => {
            const res = await this._fetch(url, {
              method: "POST",
              headers: { ...this.headers, "Content-Type": "application/json" },
              signal: AbortSignal.timeout(this.timeout_ms),
              ...this.fetchOptions,
              body
            });
            await raiseForStatus(res, `Failed to fetch ${path2}`);
            return res;
          });
          const items = await response.json();
          const { groups, total } = items;
          if (groups.length === 0) {
            break;
          }
          for (const thread of groups) {
            yield thread;
          }
          currentOffset += groups.length;
          if (currentOffset >= total) {
            break;
          }
        }
      }
      async getRunStats({ id, trace, parentRun, runType, projectNames, projectIds, referenceExampleIds, startTime, endTime, error, query, filter, traceFilter, treeFilter, isRoot, dataSourceType }) {
        let projectIds_ = projectIds || [];
        if (projectNames) {
          projectIds_ = [
            ...projectIds || [],
            ...await Promise.all(projectNames.map((name) => this.readProject({ projectName: name }).then((project) => project.id)))
          ];
        }
        const payload = {
          id,
          trace,
          parent_run: parentRun,
          run_type: runType,
          session: projectIds_,
          reference_example: referenceExampleIds,
          start_time: startTime,
          end_time: endTime,
          error,
          query,
          filter,
          trace_filter: traceFilter,
          tree_filter: treeFilter,
          is_root: isRoot,
          data_source_type: dataSourceType
        };
        const filteredPayload = Object.fromEntries(Object.entries(payload).filter(([_, value]) => value !== void 0));
        const body = JSON.stringify(filteredPayload);
        const response = await this.caller.call(async () => {
          const res = await this._fetch(`${this.apiUrl}/runs/stats`, {
            method: "POST",
            headers: { ...this.headers, "Content-Type": "application/json" },
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions,
            body
          });
          await raiseForStatus(res, "get run stats");
          return res;
        });
        const result = await response.json();
        return result;
      }
      async shareRun(runId, { shareId } = {}) {
        const data = {
          run_id: runId,
          share_token: shareId || v4_default()
        };
        assertUuid(runId);
        const body = JSON.stringify(data);
        const response = await this.caller.call(async () => {
          const res = await this._fetch(`${this.apiUrl}/runs/${runId}/share`, {
            method: "PUT",
            headers: this.headers,
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions,
            body
          });
          await raiseForStatus(res, "share run");
          return res;
        });
        const result = await response.json();
        if (result === null || !("share_token" in result)) {
          throw new Error("Invalid response from server");
        }
        return `${this.getHostUrl()}/public/${result["share_token"]}/r`;
      }
      async unshareRun(runId) {
        assertUuid(runId);
        await this.caller.call(async () => {
          const res = await this._fetch(`${this.apiUrl}/runs/${runId}/share`, {
            method: "DELETE",
            headers: this.headers,
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions
          });
          await raiseForStatus(res, "unshare run", true);
          return res;
        });
      }
      async readRunSharedLink(runId) {
        assertUuid(runId);
        const response = await this.caller.call(async () => {
          const res = await this._fetch(`${this.apiUrl}/runs/${runId}/share`, {
            method: "GET",
            headers: this.headers,
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions
          });
          await raiseForStatus(res, "read run shared link");
          return res;
        });
        const result = await response.json();
        if (result === null || !("share_token" in result)) {
          return void 0;
        }
        return `${this.getHostUrl()}/public/${result["share_token"]}/r`;
      }
      async listSharedRuns(shareToken, { runIds } = {}) {
        const queryParams = new URLSearchParams({
          share_token: shareToken
        });
        if (runIds !== void 0) {
          for (const runId of runIds) {
            queryParams.append("id", runId);
          }
        }
        assertUuid(shareToken);
        const response = await this.caller.call(async () => {
          const res = await this._fetch(`${this.apiUrl}/public/${shareToken}/runs${queryParams}`, {
            method: "GET",
            headers: this.headers,
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions
          });
          await raiseForStatus(res, "list shared runs");
          return res;
        });
        const runs = await response.json();
        return runs;
      }
      async readDatasetSharedSchema(datasetId, datasetName) {
        if (!datasetId && !datasetName) {
          throw new Error("Either datasetId or datasetName must be given");
        }
        if (!datasetId) {
          const dataset = await this.readDataset({ datasetName });
          datasetId = dataset.id;
        }
        assertUuid(datasetId);
        const response = await this.caller.call(async () => {
          const res = await this._fetch(`${this.apiUrl}/datasets/${datasetId}/share`, {
            method: "GET",
            headers: this.headers,
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions
          });
          await raiseForStatus(res, "read dataset shared schema");
          return res;
        });
        const shareSchema = await response.json();
        shareSchema.url = `${this.getHostUrl()}/public/${shareSchema.share_token}/d`;
        return shareSchema;
      }
      async shareDataset(datasetId, datasetName) {
        if (!datasetId && !datasetName) {
          throw new Error("Either datasetId or datasetName must be given");
        }
        if (!datasetId) {
          const dataset = await this.readDataset({ datasetName });
          datasetId = dataset.id;
        }
        const data = {
          dataset_id: datasetId
        };
        assertUuid(datasetId);
        const body = JSON.stringify(data);
        const response = await this.caller.call(async () => {
          const res = await this._fetch(`${this.apiUrl}/datasets/${datasetId}/share`, {
            method: "PUT",
            headers: this.headers,
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions,
            body
          });
          await raiseForStatus(res, "share dataset");
          return res;
        });
        const shareSchema = await response.json();
        shareSchema.url = `${this.getHostUrl()}/public/${shareSchema.share_token}/d`;
        return shareSchema;
      }
      async unshareDataset(datasetId) {
        assertUuid(datasetId);
        await this.caller.call(async () => {
          const res = await this._fetch(`${this.apiUrl}/datasets/${datasetId}/share`, {
            method: "DELETE",
            headers: this.headers,
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions
          });
          await raiseForStatus(res, "unshare dataset", true);
          return res;
        });
      }
      async readSharedDataset(shareToken) {
        assertUuid(shareToken);
        const response = await this.caller.call(async () => {
          const res = await this._fetch(`${this.apiUrl}/public/${shareToken}/datasets`, {
            method: "GET",
            headers: this.headers,
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions
          });
          await raiseForStatus(res, "read shared dataset");
          return res;
        });
        const dataset = await response.json();
        return dataset;
      }
      /**
       * Get shared examples.
       *
       * @param {string} shareToken The share token to get examples for. A share token is the UUID (or LangSmith URL, including UUID) generated when explicitly marking an example as public.
       * @param {Object} [options] Additional options for listing the examples.
       * @param {string[] | undefined} [options.exampleIds] A list of example IDs to filter by.
       * @returns {Promise<Example[]>} The shared examples.
       */
      async listSharedExamples(shareToken, options) {
        const params = {};
        if (options?.exampleIds) {
          params.id = options.exampleIds;
        }
        const urlParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((v) => urlParams.append(key, v));
          } else {
            urlParams.append(key, value);
          }
        });
        const response = await this.caller.call(async () => {
          const res = await this._fetch(`${this.apiUrl}/public/${shareToken}/examples?${urlParams.toString()}`, {
            method: "GET",
            headers: this.headers,
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions
          });
          await raiseForStatus(res, "list shared examples");
          return res;
        });
        const result = await response.json();
        if (!response.ok) {
          if ("detail" in result) {
            throw new Error(`Failed to list shared examples.
Status: ${response.status}
Message: ${Array.isArray(result.detail) ? result.detail.join("\n") : "Unspecified error"}`);
          }
          throw new Error(`Failed to list shared examples: ${response.status} ${response.statusText}`);
        }
        return result.map((example) => ({
          ...example,
          _hostUrl: this.getHostUrl()
        }));
      }
      async createProject({ projectName, description = null, metadata = null, upsert = false, projectExtra = null, referenceDatasetId = null }) {
        const upsert_ = upsert ? `?upsert=true` : "";
        const endpoint = `${this.apiUrl}/sessions${upsert_}`;
        const extra = projectExtra || {};
        if (metadata) {
          extra["metadata"] = metadata;
        }
        const body = {
          name: projectName,
          extra,
          description
        };
        if (referenceDatasetId !== null) {
          body["reference_dataset_id"] = referenceDatasetId;
        }
        const serializedBody = JSON.stringify(body);
        const response = await this.caller.call(async () => {
          const res = await this._fetch(endpoint, {
            method: "POST",
            headers: { ...this.headers, "Content-Type": "application/json" },
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions,
            body: serializedBody
          });
          await raiseForStatus(res, "create project");
          return res;
        });
        const result = await response.json();
        return result;
      }
      async updateProject(projectId, { name = null, description = null, metadata = null, projectExtra = null, endTime = null }) {
        const endpoint = `${this.apiUrl}/sessions/${projectId}`;
        let extra = projectExtra;
        if (metadata) {
          extra = { ...extra || {}, metadata };
        }
        const body = JSON.stringify({
          name,
          extra,
          description,
          end_time: endTime ? new Date(endTime).toISOString() : null
        });
        const response = await this.caller.call(async () => {
          const res = await this._fetch(endpoint, {
            method: "PATCH",
            headers: { ...this.headers, "Content-Type": "application/json" },
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions,
            body
          });
          await raiseForStatus(res, "update project");
          return res;
        });
        const result = await response.json();
        return result;
      }
      async hasProject({ projectId, projectName }) {
        let path2 = "/sessions";
        const params = new URLSearchParams();
        if (projectId !== void 0 && projectName !== void 0) {
          throw new Error("Must provide either projectName or projectId, not both");
        } else if (projectId !== void 0) {
          assertUuid(projectId);
          path2 += `/${projectId}`;
        } else if (projectName !== void 0) {
          params.append("name", projectName);
        } else {
          throw new Error("Must provide projectName or projectId");
        }
        const response = await this.caller.call(async () => {
          const res = await this._fetch(`${this.apiUrl}${path2}?${params}`, {
            method: "GET",
            headers: this.headers,
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions
          });
          await raiseForStatus(res, "has project");
          return res;
        });
        try {
          const result = await response.json();
          if (!response.ok) {
            return false;
          }
          if (Array.isArray(result)) {
            return result.length > 0;
          }
          return true;
        } catch (e) {
          return false;
        }
      }
      async readProject({ projectId, projectName, includeStats }) {
        let path2 = "/sessions";
        const params = new URLSearchParams();
        if (projectId !== void 0 && projectName !== void 0) {
          throw new Error("Must provide either projectName or projectId, not both");
        } else if (projectId !== void 0) {
          assertUuid(projectId);
          path2 += `/${projectId}`;
        } else if (projectName !== void 0) {
          params.append("name", projectName);
        } else {
          throw new Error("Must provide projectName or projectId");
        }
        if (includeStats !== void 0) {
          params.append("include_stats", includeStats.toString());
        }
        const response = await this._get(path2, params);
        let result;
        if (Array.isArray(response)) {
          if (response.length === 0) {
            throw new Error(`Project[id=${projectId}, name=${projectName}] not found`);
          }
          result = response[0];
        } else {
          result = response;
        }
        return result;
      }
      async getProjectUrl({ projectId, projectName }) {
        if (projectId === void 0 && projectName === void 0) {
          throw new Error("Must provide either projectName or projectId");
        }
        const project = await this.readProject({ projectId, projectName });
        const tenantId = await this._getTenantId();
        return `${this.getHostUrl()}/o/${tenantId}/projects/p/${project.id}`;
      }
      async getDatasetUrl({ datasetId, datasetName }) {
        if (datasetId === void 0 && datasetName === void 0) {
          throw new Error("Must provide either datasetName or datasetId");
        }
        const dataset = await this.readDataset({ datasetId, datasetName });
        const tenantId = await this._getTenantId();
        return `${this.getHostUrl()}/o/${tenantId}/datasets/${dataset.id}`;
      }
      async _getTenantId() {
        if (this._tenantId !== null) {
          return this._tenantId;
        }
        const queryParams = new URLSearchParams({ limit: "1" });
        for await (const projects of this._getPaginated("/sessions", queryParams)) {
          this._tenantId = projects[0].tenant_id;
          return projects[0].tenant_id;
        }
        throw new Error("No projects found to resolve tenant.");
      }
      async *listProjects({ projectIds, name, nameContains, referenceDatasetId, referenceDatasetName, includeStats, datasetVersion, referenceFree, metadata } = {}) {
        const params = new URLSearchParams();
        if (projectIds !== void 0) {
          for (const projectId of projectIds) {
            params.append("id", projectId);
          }
        }
        if (name !== void 0) {
          params.append("name", name);
        }
        if (nameContains !== void 0) {
          params.append("name_contains", nameContains);
        }
        if (referenceDatasetId !== void 0) {
          params.append("reference_dataset", referenceDatasetId);
        } else if (referenceDatasetName !== void 0) {
          const dataset = await this.readDataset({
            datasetName: referenceDatasetName
          });
          params.append("reference_dataset", dataset.id);
        }
        if (includeStats !== void 0) {
          params.append("include_stats", includeStats.toString());
        }
        if (datasetVersion !== void 0) {
          params.append("dataset_version", datasetVersion);
        }
        if (referenceFree !== void 0) {
          params.append("reference_free", referenceFree.toString());
        }
        if (metadata !== void 0) {
          params.append("metadata", JSON.stringify(metadata));
        }
        for await (const projects of this._getPaginated("/sessions", params)) {
          yield* projects;
        }
      }
      async deleteProject({ projectId, projectName }) {
        let projectId_;
        if (projectId === void 0 && projectName === void 0) {
          throw new Error("Must provide projectName or projectId");
        } else if (projectId !== void 0 && projectName !== void 0) {
          throw new Error("Must provide either projectName or projectId, not both");
        } else if (projectId === void 0) {
          projectId_ = (await this.readProject({ projectName })).id;
        } else {
          projectId_ = projectId;
        }
        assertUuid(projectId_);
        await this.caller.call(async () => {
          const res = await this._fetch(`${this.apiUrl}/sessions/${projectId_}`, {
            method: "DELETE",
            headers: this.headers,
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions
          });
          await raiseForStatus(res, `delete session ${projectId_} (${projectName})`, true);
          return res;
        });
      }
      async uploadCsv({ csvFile, fileName, inputKeys, outputKeys, description, dataType, name }) {
        const url = `${this.apiUrl}/datasets/upload`;
        const formData = new FormData();
        formData.append("file", csvFile, fileName);
        inputKeys.forEach((key) => {
          formData.append("input_keys", key);
        });
        outputKeys.forEach((key) => {
          formData.append("output_keys", key);
        });
        if (description) {
          formData.append("description", description);
        }
        if (dataType) {
          formData.append("data_type", dataType);
        }
        if (name) {
          formData.append("name", name);
        }
        const response = await this.caller.call(async () => {
          const res = await this._fetch(url, {
            method: "POST",
            headers: this.headers,
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions,
            body: formData
          });
          await raiseForStatus(res, "upload CSV");
          return res;
        });
        const result = await response.json();
        return result;
      }
      async createDataset(name, { description, dataType, inputsSchema, outputsSchema, metadata } = {}) {
        const body = {
          name,
          description,
          extra: metadata ? { metadata } : void 0
        };
        if (dataType) {
          body.data_type = dataType;
        }
        if (inputsSchema) {
          body.inputs_schema_definition = inputsSchema;
        }
        if (outputsSchema) {
          body.outputs_schema_definition = outputsSchema;
        }
        const serializedBody = JSON.stringify(body);
        const response = await this.caller.call(async () => {
          const res = await this._fetch(`${this.apiUrl}/datasets`, {
            method: "POST",
            headers: { ...this.headers, "Content-Type": "application/json" },
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions,
            body: serializedBody
          });
          await raiseForStatus(res, "create dataset");
          return res;
        });
        const result = await response.json();
        return result;
      }
      async readDataset({ datasetId, datasetName }) {
        let path2 = "/datasets";
        const params = new URLSearchParams({ limit: "1" });
        if (datasetId && datasetName) {
          throw new Error("Must provide either datasetName or datasetId, not both");
        } else if (datasetId) {
          assertUuid(datasetId);
          path2 += `/${datasetId}`;
        } else if (datasetName) {
          params.append("name", datasetName);
        } else {
          throw new Error("Must provide datasetName or datasetId");
        }
        const response = await this._get(path2, params);
        let result;
        if (Array.isArray(response)) {
          if (response.length === 0) {
            throw new Error(`Dataset[id=${datasetId}, name=${datasetName}] not found`);
          }
          result = response[0];
        } else {
          result = response;
        }
        return result;
      }
      async hasDataset({ datasetId, datasetName }) {
        try {
          await this.readDataset({ datasetId, datasetName });
          return true;
        } catch (e) {
          if (
            // eslint-disable-next-line no-instanceof/no-instanceof
            e instanceof Error && e.message.toLocaleLowerCase().includes("not found")
          ) {
            return false;
          }
          throw e;
        }
      }
      async diffDatasetVersions({ datasetId, datasetName, fromVersion, toVersion }) {
        let datasetId_ = datasetId;
        if (datasetId_ === void 0 && datasetName === void 0) {
          throw new Error("Must provide either datasetName or datasetId");
        } else if (datasetId_ !== void 0 && datasetName !== void 0) {
          throw new Error("Must provide either datasetName or datasetId, not both");
        } else if (datasetId_ === void 0) {
          const dataset = await this.readDataset({ datasetName });
          datasetId_ = dataset.id;
        }
        const urlParams = new URLSearchParams({
          from_version: typeof fromVersion === "string" ? fromVersion : fromVersion.toISOString(),
          to_version: typeof toVersion === "string" ? toVersion : toVersion.toISOString()
        });
        const response = await this._get(`/datasets/${datasetId_}/versions/diff`, urlParams);
        return response;
      }
      async readDatasetOpenaiFinetuning({ datasetId, datasetName }) {
        const path2 = "/datasets";
        if (datasetId !== void 0) {
        } else if (datasetName !== void 0) {
          datasetId = (await this.readDataset({ datasetName })).id;
        } else {
          throw new Error("Must provide either datasetName or datasetId");
        }
        const response = await this._getResponse(`${path2}/${datasetId}/openai_ft`);
        const datasetText = await response.text();
        const dataset = datasetText.trim().split("\n").map((line) => JSON.parse(line));
        return dataset;
      }
      async *listDatasets({ limit = 100, offset = 0, datasetIds, datasetName, datasetNameContains, metadata } = {}) {
        const path2 = "/datasets";
        const params = new URLSearchParams({
          limit: limit.toString(),
          offset: offset.toString()
        });
        if (datasetIds !== void 0) {
          for (const id_ of datasetIds) {
            params.append("id", id_);
          }
        }
        if (datasetName !== void 0) {
          params.append("name", datasetName);
        }
        if (datasetNameContains !== void 0) {
          params.append("name_contains", datasetNameContains);
        }
        if (metadata !== void 0) {
          params.append("metadata", JSON.stringify(metadata));
        }
        for await (const datasets of this._getPaginated(path2, params)) {
          yield* datasets;
        }
      }
      /**
       * Update a dataset
       * @param props The dataset details to update
       * @returns The updated dataset
       */
      async updateDataset(props) {
        const { datasetId, datasetName, ...update } = props;
        if (!datasetId && !datasetName) {
          throw new Error("Must provide either datasetName or datasetId");
        }
        const _datasetId = datasetId ?? (await this.readDataset({ datasetName })).id;
        assertUuid(_datasetId);
        const body = JSON.stringify(update);
        const response = await this.caller.call(async () => {
          const res = await this._fetch(`${this.apiUrl}/datasets/${_datasetId}`, {
            method: "PATCH",
            headers: { ...this.headers, "Content-Type": "application/json" },
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions,
            body
          });
          await raiseForStatus(res, "update dataset");
          return res;
        });
        return await response.json();
      }
      /**
       * Updates a tag on a dataset.
       *
       * If the tag is already assigned to a different version of this dataset,
       * the tag will be moved to the new version. The as_of parameter is used to
       * determine which version of the dataset to apply the new tags to.
       *
       * It must be an exact version of the dataset to succeed. You can
       * use the "readDatasetVersion" method to find the exact version
       * to apply the tags to.
       * @param params.datasetId The ID of the dataset to update. Must be provided if "datasetName" is not provided.
       * @param params.datasetName The name of the dataset to update. Must be provided if "datasetId" is not provided.
       * @param params.asOf The timestamp of the dataset to apply the new tags to.
       * @param params.tag The new tag to apply to the dataset.
       */
      async updateDatasetTag(props) {
        const { datasetId, datasetName, asOf, tag } = props;
        if (!datasetId && !datasetName) {
          throw new Error("Must provide either datasetName or datasetId");
        }
        const _datasetId = datasetId ?? (await this.readDataset({ datasetName })).id;
        assertUuid(_datasetId);
        const body = JSON.stringify({
          as_of: typeof asOf === "string" ? asOf : asOf.toISOString(),
          tag
        });
        await this.caller.call(async () => {
          const res = await this._fetch(`${this.apiUrl}/datasets/${_datasetId}/tags`, {
            method: "PUT",
            headers: { ...this.headers, "Content-Type": "application/json" },
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions,
            body
          });
          await raiseForStatus(res, "update dataset tags", true);
          return res;
        });
      }
      async deleteDataset({ datasetId, datasetName }) {
        let path2 = "/datasets";
        let datasetId_ = datasetId;
        if (datasetId !== void 0 && datasetName !== void 0) {
          throw new Error("Must provide either datasetName or datasetId, not both");
        } else if (datasetName !== void 0) {
          const dataset = await this.readDataset({ datasetName });
          datasetId_ = dataset.id;
        }
        if (datasetId_ !== void 0) {
          assertUuid(datasetId_);
          path2 += `/${datasetId_}`;
        } else {
          throw new Error("Must provide datasetName or datasetId");
        }
        await this.caller.call(async () => {
          const res = await this._fetch(this.apiUrl + path2, {
            method: "DELETE",
            headers: this.headers,
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions
          });
          await raiseForStatus(res, `delete ${path2}`, true);
          return res;
        });
      }
      async indexDataset({ datasetId, datasetName, tag }) {
        let datasetId_ = datasetId;
        if (!datasetId_ && !datasetName) {
          throw new Error("Must provide either datasetName or datasetId");
        } else if (datasetId_ && datasetName) {
          throw new Error("Must provide either datasetName or datasetId, not both");
        } else if (!datasetId_) {
          const dataset = await this.readDataset({ datasetName });
          datasetId_ = dataset.id;
        }
        assertUuid(datasetId_);
        const data = {
          tag
        };
        const body = JSON.stringify(data);
        const response = await this.caller.call(async () => {
          const res = await this._fetch(`${this.apiUrl}/datasets/${datasetId_}/index`, {
            method: "POST",
            headers: { ...this.headers, "Content-Type": "application/json" },
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions,
            body
          });
          await raiseForStatus(res, "index dataset");
          return res;
        });
        await response.json();
      }
      /**
       * Lets you run a similarity search query on a dataset.
       *
       * Requires the dataset to be indexed. Please see the `indexDataset` method to set up indexing.
       *
       * @param inputs      The input on which to run the similarity search. Must have the
       *                    same schema as the dataset.
       *
       * @param datasetId   The dataset to search for similar examples.
       *
       * @param limit       The maximum number of examples to return. Will return the top `limit` most
       *                    similar examples in order of most similar to least similar. If no similar
       *                    examples are found, random examples will be returned.
       *
       * @param filter      A filter string to apply to the search. Only examples will be returned that
       *                    match the filter string. Some examples of filters
       *
       *                    - eq(metadata.mykey, "value")
       *                    - and(neq(metadata.my.nested.key, "value"), neq(metadata.mykey, "value"))
       *                    - or(eq(metadata.mykey, "value"), eq(metadata.mykey, "othervalue"))
       *
       * @returns           A list of similar examples.
       *
       *
       * @example
       * dataset_id = "123e4567-e89b-12d3-a456-426614174000"
       * inputs = {"text": "How many people live in Berlin?"}
       * limit = 5
       * examples = await client.similarExamples(inputs, dataset_id, limit)
       */
      async similarExamples(inputs, datasetId, limit, { filter } = {}) {
        const data = {
          limit,
          inputs
        };
        if (filter !== void 0) {
          data["filter"] = filter;
        }
        assertUuid(datasetId);
        const body = JSON.stringify(data);
        const response = await this.caller.call(async () => {
          const res = await this._fetch(`${this.apiUrl}/datasets/${datasetId}/search`, {
            headers: { ...this.headers, "Content-Type": "application/json" },
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions,
            method: "POST",
            body
          });
          await raiseForStatus(res, "fetch similar examples");
          return res;
        });
        const result = await response.json();
        return result["examples"];
      }
      async createExample(inputsOrUpdate, outputs, options) {
        if (isExampleCreate(inputsOrUpdate)) {
          if (outputs !== void 0 || options !== void 0) {
            throw new Error("Cannot provide outputs or options when using ExampleCreate object");
          }
        }
        let datasetId_ = outputs ? options?.datasetId : inputsOrUpdate.dataset_id;
        const datasetName_ = outputs ? options?.datasetName : inputsOrUpdate.dataset_name;
        if (datasetId_ === void 0 && datasetName_ === void 0) {
          throw new Error("Must provide either datasetName or datasetId");
        } else if (datasetId_ !== void 0 && datasetName_ !== void 0) {
          throw new Error("Must provide either datasetName or datasetId, not both");
        } else if (datasetId_ === void 0) {
          const dataset = await this.readDataset({ datasetName: datasetName_ });
          datasetId_ = dataset.id;
        }
        const createdAt_ = (outputs ? options?.createdAt : inputsOrUpdate.created_at) || /* @__PURE__ */ new Date();
        let data;
        if (!isExampleCreate(inputsOrUpdate)) {
          data = {
            inputs: inputsOrUpdate,
            outputs,
            created_at: createdAt_?.toISOString(),
            id: options?.exampleId,
            metadata: options?.metadata,
            split: options?.split,
            source_run_id: options?.sourceRunId,
            use_source_run_io: options?.useSourceRunIO,
            use_source_run_attachments: options?.useSourceRunAttachments,
            attachments: options?.attachments
          };
        } else {
          data = inputsOrUpdate;
        }
        const response = await this._uploadExamplesMultipart(datasetId_, [data]);
        const example = await this.readExample(response.example_ids?.[0] ?? v4_default());
        return example;
      }
      async createExamples(propsOrUploads) {
        if (Array.isArray(propsOrUploads)) {
          if (propsOrUploads.length === 0) {
            return [];
          }
          const uploads = propsOrUploads;
          let datasetId_2 = uploads[0].dataset_id;
          const datasetName_2 = uploads[0].dataset_name;
          if (datasetId_2 === void 0 && datasetName_2 === void 0) {
            throw new Error("Must provide either datasetName or datasetId");
          } else if (datasetId_2 !== void 0 && datasetName_2 !== void 0) {
            throw new Error("Must provide either datasetName or datasetId, not both");
          } else if (datasetId_2 === void 0) {
            const dataset = await this.readDataset({ datasetName: datasetName_2 });
            datasetId_2 = dataset.id;
          }
          const response2 = await this._uploadExamplesMultipart(datasetId_2, uploads);
          const examples2 = await Promise.all(response2.example_ids.map((id) => this.readExample(id)));
          return examples2;
        }
        const { inputs, outputs, metadata, splits, sourceRunIds, useSourceRunIOs, useSourceRunAttachments, attachments, exampleIds, datasetId, datasetName } = propsOrUploads;
        if (inputs === void 0) {
          throw new Error("Must provide inputs when using legacy parameters");
        }
        let datasetId_ = datasetId;
        const datasetName_ = datasetName;
        if (datasetId_ === void 0 && datasetName_ === void 0) {
          throw new Error("Must provide either datasetName or datasetId");
        } else if (datasetId_ !== void 0 && datasetName_ !== void 0) {
          throw new Error("Must provide either datasetName or datasetId, not both");
        } else if (datasetId_ === void 0) {
          const dataset = await this.readDataset({ datasetName: datasetName_ });
          datasetId_ = dataset.id;
        }
        const formattedExamples = inputs.map((input, idx) => {
          return {
            dataset_id: datasetId_,
            inputs: input,
            outputs: outputs?.[idx],
            metadata: metadata?.[idx],
            split: splits?.[idx],
            id: exampleIds?.[idx],
            attachments: attachments?.[idx],
            source_run_id: sourceRunIds?.[idx],
            use_source_run_io: useSourceRunIOs?.[idx],
            use_source_run_attachments: useSourceRunAttachments?.[idx]
          };
        });
        const response = await this._uploadExamplesMultipart(datasetId_, formattedExamples);
        const examples = await Promise.all(response.example_ids.map((id) => this.readExample(id)));
        return examples;
      }
      async createLLMExample(input, generation, options) {
        return this.createExample({ input }, { output: generation }, options);
      }
      async createChatExample(input, generations, options) {
        const finalInput = input.map((message) => {
          if (isLangChainMessage(message)) {
            return convertLangChainMessageToExample(message);
          }
          return message;
        });
        const finalOutput = isLangChainMessage(generations) ? convertLangChainMessageToExample(generations) : generations;
        return this.createExample({ input: finalInput }, { output: finalOutput }, options);
      }
      async readExample(exampleId) {
        assertUuid(exampleId);
        const path2 = `/examples/${exampleId}`;
        const rawExample = await this._get(path2);
        const { attachment_urls, ...rest } = rawExample;
        const example = rest;
        if (attachment_urls) {
          example.attachments = Object.entries(attachment_urls).reduce((acc, [key, value]) => {
            acc[key.slice("attachment.".length)] = {
              presigned_url: value.presigned_url,
              mime_type: value.mime_type
            };
            return acc;
          }, {});
        }
        return example;
      }
      async *listExamples({ datasetId, datasetName, exampleIds, asOf, splits, inlineS3Urls, metadata, limit, offset, filter, includeAttachments } = {}) {
        let datasetId_;
        if (datasetId !== void 0 && datasetName !== void 0) {
          throw new Error("Must provide either datasetName or datasetId, not both");
        } else if (datasetId !== void 0) {
          datasetId_ = datasetId;
        } else if (datasetName !== void 0) {
          const dataset = await this.readDataset({ datasetName });
          datasetId_ = dataset.id;
        } else {
          throw new Error("Must provide a datasetName or datasetId");
        }
        const params = new URLSearchParams({ dataset: datasetId_ });
        const dataset_version = asOf ? typeof asOf === "string" ? asOf : asOf?.toISOString() : void 0;
        if (dataset_version) {
          params.append("as_of", dataset_version);
        }
        const inlineS3Urls_ = inlineS3Urls ?? true;
        params.append("inline_s3_urls", inlineS3Urls_.toString());
        if (exampleIds !== void 0) {
          for (const id_ of exampleIds) {
            params.append("id", id_);
          }
        }
        if (splits !== void 0) {
          for (const split of splits) {
            params.append("splits", split);
          }
        }
        if (metadata !== void 0) {
          const serializedMetadata = JSON.stringify(metadata);
          params.append("metadata", serializedMetadata);
        }
        if (limit !== void 0) {
          params.append("limit", limit.toString());
        }
        if (offset !== void 0) {
          params.append("offset", offset.toString());
        }
        if (filter !== void 0) {
          params.append("filter", filter);
        }
        if (includeAttachments === true) {
          ["attachment_urls", "outputs", "metadata"].forEach((field) => params.append("select", field));
        }
        let i = 0;
        for await (const rawExamples of this._getPaginated("/examples", params)) {
          for (const rawExample of rawExamples) {
            const { attachment_urls, ...rest } = rawExample;
            const example = rest;
            if (attachment_urls) {
              example.attachments = Object.entries(attachment_urls).reduce((acc, [key, value]) => {
                acc[key.slice("attachment.".length)] = {
                  presigned_url: value.presigned_url,
                  mime_type: value.mime_type || void 0
                };
                return acc;
              }, {});
            }
            yield example;
            i++;
          }
          if (limit !== void 0 && i >= limit) {
            break;
          }
        }
      }
      async deleteExample(exampleId) {
        assertUuid(exampleId);
        const path2 = `/examples/${exampleId}`;
        await this.caller.call(async () => {
          const res = await this._fetch(this.apiUrl + path2, {
            method: "DELETE",
            headers: this.headers,
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions
          });
          await raiseForStatus(res, `delete ${path2}`, true);
          return res;
        });
      }
      /**
       * Delete multiple examples by ID.
       * @param exampleIds - The IDs of the examples to delete
       * @param options - Optional settings for deletion
       * @param options.hardDelete - If true, permanently delete examples. If false (default), soft delete them.
       */
      async deleteExamples(exampleIds, options) {
        exampleIds.forEach((id) => assertUuid(id));
        if (options?.hardDelete) {
          const path2 = this._getPlatformEndpointPath("datasets/examples/delete");
          await this.caller.call(async () => {
            const res = await this._fetch(`${this.apiUrl}${path2}`, {
              method: "POST",
              headers: { ...this.headers, "Content-Type": "application/json" },
              body: JSON.stringify({
                example_ids: exampleIds,
                hard_delete: true
              }),
              signal: AbortSignal.timeout(this.timeout_ms),
              ...this.fetchOptions
            });
            await raiseForStatus(res, "hard delete examples", true);
            return res;
          });
        } else {
          const params = new URLSearchParams();
          exampleIds.forEach((id) => params.append("example_ids", id));
          await this.caller.call(async () => {
            const res = await this._fetch(`${this.apiUrl}/examples?${params.toString()}`, {
              method: "DELETE",
              headers: this.headers,
              signal: AbortSignal.timeout(this.timeout_ms),
              ...this.fetchOptions
            });
            await raiseForStatus(res, "delete examples", true);
            return res;
          });
        }
      }
      async updateExample(exampleIdOrUpdate, update) {
        let exampleId;
        if (update) {
          exampleId = exampleIdOrUpdate;
        } else {
          exampleId = exampleIdOrUpdate.id;
        }
        assertUuid(exampleId);
        let updateToUse;
        if (update) {
          updateToUse = { id: exampleId, ...update };
        } else {
          updateToUse = exampleIdOrUpdate;
        }
        let datasetId;
        if (updateToUse.dataset_id !== void 0) {
          datasetId = updateToUse.dataset_id;
        } else {
          const example = await this.readExample(exampleId);
          datasetId = example.dataset_id;
        }
        return this._updateExamplesMultipart(datasetId, [updateToUse]);
      }
      async updateExamples(update) {
        let datasetId;
        if (update[0].dataset_id === void 0) {
          const example = await this.readExample(update[0].id);
          datasetId = example.dataset_id;
        } else {
          datasetId = update[0].dataset_id;
        }
        return this._updateExamplesMultipart(datasetId, update);
      }
      /**
       * Get dataset version by closest date or exact tag.
       *
       * Use this to resolve the nearest version to a given timestamp or for a given tag.
       *
       * @param options The options for getting the dataset version
       * @param options.datasetId The ID of the dataset
       * @param options.datasetName The name of the dataset
       * @param options.asOf The timestamp of the dataset to retrieve
       * @param options.tag The tag of the dataset to retrieve
       * @returns The dataset version
       */
      async readDatasetVersion({ datasetId, datasetName, asOf, tag }) {
        let resolvedDatasetId;
        if (!datasetId) {
          const dataset = await this.readDataset({ datasetName });
          resolvedDatasetId = dataset.id;
        } else {
          resolvedDatasetId = datasetId;
        }
        assertUuid(resolvedDatasetId);
        if (asOf && tag || !asOf && !tag) {
          throw new Error("Exactly one of asOf and tag must be specified.");
        }
        const params = new URLSearchParams();
        if (asOf !== void 0) {
          params.append("as_of", typeof asOf === "string" ? asOf : asOf.toISOString());
        }
        if (tag !== void 0) {
          params.append("tag", tag);
        }
        const response = await this.caller.call(async () => {
          const res = await this._fetch(`${this.apiUrl}/datasets/${resolvedDatasetId}/version?${params.toString()}`, {
            method: "GET",
            headers: { ...this.headers },
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions
          });
          await raiseForStatus(res, "read dataset version");
          return res;
        });
        return await response.json();
      }
      async listDatasetSplits({ datasetId, datasetName, asOf }) {
        let datasetId_;
        if (datasetId === void 0 && datasetName === void 0) {
          throw new Error("Must provide dataset name or ID");
        } else if (datasetId !== void 0 && datasetName !== void 0) {
          throw new Error("Must provide either datasetName or datasetId, not both");
        } else if (datasetId === void 0) {
          const dataset = await this.readDataset({ datasetName });
          datasetId_ = dataset.id;
        } else {
          datasetId_ = datasetId;
        }
        assertUuid(datasetId_);
        const params = new URLSearchParams();
        const dataset_version = asOf ? typeof asOf === "string" ? asOf : asOf?.toISOString() : void 0;
        if (dataset_version) {
          params.append("as_of", dataset_version);
        }
        const response = await this._get(`/datasets/${datasetId_}/splits`, params);
        return response;
      }
      async updateDatasetSplits({ datasetId, datasetName, splitName, exampleIds, remove = false }) {
        let datasetId_;
        if (datasetId === void 0 && datasetName === void 0) {
          throw new Error("Must provide dataset name or ID");
        } else if (datasetId !== void 0 && datasetName !== void 0) {
          throw new Error("Must provide either datasetName or datasetId, not both");
        } else if (datasetId === void 0) {
          const dataset = await this.readDataset({ datasetName });
          datasetId_ = dataset.id;
        } else {
          datasetId_ = datasetId;
        }
        assertUuid(datasetId_);
        const data = {
          split_name: splitName,
          examples: exampleIds.map((id) => {
            assertUuid(id);
            return id;
          }),
          remove
        };
        const body = JSON.stringify(data);
        await this.caller.call(async () => {
          const res = await this._fetch(`${this.apiUrl}/datasets/${datasetId_}/splits`, {
            method: "PUT",
            headers: { ...this.headers, "Content-Type": "application/json" },
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions,
            body
          });
          await raiseForStatus(res, "update dataset splits", true);
          return res;
        });
      }
      /**
       * @deprecated This method is deprecated and will be removed in future LangSmith versions, use `evaluate` from `langsmith/evaluation` instead.
       */
      async evaluateRun(run, evaluator, { sourceInfo, loadChildRuns, referenceExample } = { loadChildRuns: false }) {
        warnOnce("This method is deprecated and will be removed in future LangSmith versions, use `evaluate` from `langsmith/evaluation` instead.");
        let run_;
        if (typeof run === "string") {
          run_ = await this.readRun(run, { loadChildRuns });
        } else if (typeof run === "object" && "id" in run) {
          run_ = run;
        } else {
          throw new Error(`Invalid run type: ${typeof run}`);
        }
        if (run_.reference_example_id !== null && run_.reference_example_id !== void 0) {
          referenceExample = await this.readExample(run_.reference_example_id);
        }
        const feedbackResult = await evaluator.evaluateRun(run_, referenceExample);
        const [_, feedbacks] = await this._logEvaluationFeedback(feedbackResult, run_, sourceInfo);
        return feedbacks[0];
      }
      async createFeedback(runId, key, { score, value, correction, comment, sourceInfo, feedbackSourceType = "api", sourceRunId, feedbackId, feedbackConfig, projectId, comparativeExperimentId }) {
        if (!runId && !projectId) {
          throw new Error("One of runId or projectId must be provided");
        }
        if (runId && projectId) {
          throw new Error("Only one of runId or projectId can be provided");
        }
        const feedback_source = {
          type: feedbackSourceType ?? "api",
          metadata: sourceInfo ?? {}
        };
        if (sourceRunId !== void 0 && feedback_source?.metadata !== void 0 && !feedback_source.metadata["__run"]) {
          feedback_source.metadata["__run"] = { run_id: sourceRunId };
        }
        if (feedback_source?.metadata !== void 0 && feedback_source.metadata["__run"]?.run_id !== void 0) {
          assertUuid(feedback_source.metadata["__run"].run_id);
        }
        const feedback = {
          id: feedbackId ?? v4_default(),
          run_id: runId,
          key,
          score: _formatFeedbackScore(score),
          value,
          correction,
          comment,
          feedback_source,
          comparative_experiment_id: comparativeExperimentId,
          feedbackConfig,
          session_id: projectId
        };
        const body = JSON.stringify(feedback);
        const url = `${this.apiUrl}/feedback`;
        await this.caller.call(async () => {
          const res = await this._fetch(url, {
            method: "POST",
            headers: { ...this.headers, "Content-Type": "application/json" },
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions,
            body
          });
          await raiseForStatus(res, "create feedback", true);
          return res;
        });
        return feedback;
      }
      async updateFeedback(feedbackId, { score, value, correction, comment }) {
        const feedbackUpdate = {};
        if (score !== void 0 && score !== null) {
          feedbackUpdate["score"] = _formatFeedbackScore(score);
        }
        if (value !== void 0 && value !== null) {
          feedbackUpdate["value"] = value;
        }
        if (correction !== void 0 && correction !== null) {
          feedbackUpdate["correction"] = correction;
        }
        if (comment !== void 0 && comment !== null) {
          feedbackUpdate["comment"] = comment;
        }
        assertUuid(feedbackId);
        const body = JSON.stringify(feedbackUpdate);
        await this.caller.call(async () => {
          const res = await this._fetch(`${this.apiUrl}/feedback/${feedbackId}`, {
            method: "PATCH",
            headers: { ...this.headers, "Content-Type": "application/json" },
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions,
            body
          });
          await raiseForStatus(res, "update feedback", true);
          return res;
        });
      }
      async readFeedback(feedbackId) {
        assertUuid(feedbackId);
        const path2 = `/feedback/${feedbackId}`;
        const response = await this._get(path2);
        return response;
      }
      async deleteFeedback(feedbackId) {
        assertUuid(feedbackId);
        const path2 = `/feedback/${feedbackId}`;
        await this.caller.call(async () => {
          const res = await this._fetch(this.apiUrl + path2, {
            method: "DELETE",
            headers: this.headers,
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions
          });
          await raiseForStatus(res, `delete ${path2}`, true);
          return res;
        });
      }
      async *listFeedback({ runIds, feedbackKeys, feedbackSourceTypes } = {}) {
        const queryParams = new URLSearchParams();
        if (runIds) {
          for (const runId of runIds) {
            assertUuid(runId);
            queryParams.append("run", runId);
          }
        }
        if (feedbackKeys) {
          for (const key of feedbackKeys) {
            queryParams.append("key", key);
          }
        }
        if (feedbackSourceTypes) {
          for (const type of feedbackSourceTypes) {
            queryParams.append("source", type);
          }
        }
        for await (const feedbacks of this._getPaginated("/feedback", queryParams)) {
          yield* feedbacks;
        }
      }
      /**
       * Creates a presigned feedback token and URL.
       *
       * The token can be used to authorize feedback metrics without
       * needing an API key. This is useful for giving browser-based
       * applications the ability to submit feedback without needing
       * to expose an API key.
       *
       * @param runId The ID of the run.
       * @param feedbackKey The feedback key.
       * @param options Additional options for the token.
       * @param options.expiration The expiration time for the token.
       *
       * @returns A promise that resolves to a FeedbackIngestToken.
       */
      async createPresignedFeedbackToken(runId, feedbackKey, { expiration, feedbackConfig } = {}) {
        const body = {
          run_id: runId,
          feedback_key: feedbackKey,
          feedback_config: feedbackConfig
        };
        if (expiration) {
          if (typeof expiration === "string") {
            body["expires_at"] = expiration;
          } else if (expiration?.hours || expiration?.minutes || expiration?.days) {
            body["expires_in"] = expiration;
          }
        } else {
          body["expires_in"] = {
            hours: 3
          };
        }
        const serializedBody = JSON.stringify(body);
        const response = await this.caller.call(async () => {
          const res = await this._fetch(`${this.apiUrl}/feedback/tokens`, {
            method: "POST",
            headers: { ...this.headers, "Content-Type": "application/json" },
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions,
            body: serializedBody
          });
          await raiseForStatus(res, "create presigned feedback token");
          return res;
        });
        return await response.json();
      }
      async createComparativeExperiment({ name, experimentIds, referenceDatasetId, createdAt, description, metadata, id }) {
        if (experimentIds.length === 0) {
          throw new Error("At least one experiment is required");
        }
        if (!referenceDatasetId) {
          referenceDatasetId = (await this.readProject({
            projectId: experimentIds[0]
          })).reference_dataset_id;
        }
        if (!referenceDatasetId == null) {
          throw new Error("A reference dataset is required");
        }
        const body = {
          id,
          name,
          experiment_ids: experimentIds,
          reference_dataset_id: referenceDatasetId,
          description,
          created_at: (createdAt ?? /* @__PURE__ */ new Date())?.toISOString(),
          extra: {}
        };
        if (metadata)
          body.extra["metadata"] = metadata;
        const serializedBody = JSON.stringify(body);
        const response = await this.caller.call(async () => {
          const res = await this._fetch(`${this.apiUrl}/datasets/comparative`, {
            method: "POST",
            headers: { ...this.headers, "Content-Type": "application/json" },
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions,
            body: serializedBody
          });
          await raiseForStatus(res, "create comparative experiment");
          return res;
        });
        return response.json();
      }
      /**
       * Retrieves a list of presigned feedback tokens for a given run ID.
       * @param runId The ID of the run.
       * @returns An async iterable of FeedbackIngestToken objects.
       */
      async *listPresignedFeedbackTokens(runId) {
        assertUuid(runId);
        const params = new URLSearchParams({ run_id: runId });
        for await (const tokens of this._getPaginated("/feedback/tokens", params)) {
          yield* tokens;
        }
      }
      _selectEvalResults(results) {
        let results_;
        if ("results" in results) {
          results_ = results.results;
        } else if (Array.isArray(results)) {
          results_ = results;
        } else {
          results_ = [results];
        }
        return results_;
      }
      async _logEvaluationFeedback(evaluatorResponse, run, sourceInfo) {
        const evalResults = this._selectEvalResults(evaluatorResponse);
        const feedbacks = [];
        for (const res of evalResults) {
          let sourceInfo_ = sourceInfo || {};
          if (res.evaluatorInfo) {
            sourceInfo_ = { ...res.evaluatorInfo, ...sourceInfo_ };
          }
          let runId_ = null;
          if (res.targetRunId) {
            runId_ = res.targetRunId;
          } else if (run) {
            runId_ = run.id;
          }
          feedbacks.push(await this.createFeedback(runId_, res.key, {
            score: res.score,
            value: res.value,
            comment: res.comment,
            correction: res.correction,
            sourceInfo: sourceInfo_,
            sourceRunId: res.sourceRunId,
            feedbackConfig: res.feedbackConfig,
            feedbackSourceType: "model"
          }));
        }
        return [evalResults, feedbacks];
      }
      async logEvaluationFeedback(evaluatorResponse, run, sourceInfo) {
        const [results] = await this._logEvaluationFeedback(evaluatorResponse, run, sourceInfo);
        return results;
      }
      /**
       * API for managing annotation queues
       */
      /**
       * List the annotation queues on the LangSmith API.
       * @param options - The options for listing annotation queues
       * @param options.queueIds - The IDs of the queues to filter by
       * @param options.name - The name of the queue to filter by
       * @param options.nameContains - The substring that the queue name should contain
       * @param options.limit - The maximum number of queues to return
       * @returns An iterator of AnnotationQueue objects
       */
      async *listAnnotationQueues(options = {}) {
        const { queueIds, name, nameContains, limit } = options;
        const params = new URLSearchParams();
        if (queueIds) {
          queueIds.forEach((id, i) => {
            assertUuid(id, `queueIds[${i}]`);
            params.append("ids", id);
          });
        }
        if (name)
          params.append("name", name);
        if (nameContains)
          params.append("name_contains", nameContains);
        params.append("limit", (limit !== void 0 ? Math.min(limit, 100) : 100).toString());
        let count = 0;
        for await (const queues of this._getPaginated("/annotation-queues", params)) {
          yield* queues;
          count++;
          if (limit !== void 0 && count >= limit)
            break;
        }
      }
      /**
       * Create an annotation queue on the LangSmith API.
       * @param options - The options for creating an annotation queue
       * @param options.name - The name of the annotation queue
       * @param options.description - The description of the annotation queue
       * @param options.queueId - The ID of the annotation queue
       * @returns The created AnnotationQueue object
       */
      async createAnnotationQueue(options) {
        const { name, description, queueId, rubricInstructions } = options;
        const body = {
          name,
          description,
          id: queueId || v4_default(),
          rubric_instructions: rubricInstructions
        };
        const serializedBody = JSON.stringify(Object.fromEntries(Object.entries(body).filter(([_, v]) => v !== void 0)));
        const response = await this.caller.call(async () => {
          const res = await this._fetch(`${this.apiUrl}/annotation-queues`, {
            method: "POST",
            headers: { ...this.headers, "Content-Type": "application/json" },
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions,
            body: serializedBody
          });
          await raiseForStatus(res, "create annotation queue");
          return res;
        });
        return response.json();
      }
      /**
       * Read an annotation queue with the specified queue ID.
       * @param queueId - The ID of the annotation queue to read
       * @returns The AnnotationQueueWithDetails object
       */
      async readAnnotationQueue(queueId) {
        const response = await this.caller.call(async () => {
          const res = await this._fetch(`${this.apiUrl}/annotation-queues/${assertUuid(queueId, "queueId")}`, {
            method: "GET",
            headers: this.headers,
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions
          });
          await raiseForStatus(res, "read annotation queue");
          return res;
        });
        return response.json();
      }
      /**
       * Update an annotation queue with the specified queue ID.
       * @param queueId - The ID of the annotation queue to update
       * @param options - The options for updating the annotation queue
       * @param options.name - The new name for the annotation queue
       * @param options.description - The new description for the annotation queue
       */
      async updateAnnotationQueue(queueId, options) {
        const { name, description, rubricInstructions } = options;
        const body = JSON.stringify({
          name,
          description,
          rubric_instructions: rubricInstructions
        });
        await this.caller.call(async () => {
          const res = await this._fetch(`${this.apiUrl}/annotation-queues/${assertUuid(queueId, "queueId")}`, {
            method: "PATCH",
            headers: { ...this.headers, "Content-Type": "application/json" },
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions,
            body
          });
          await raiseForStatus(res, "update annotation queue", true);
          return res;
        });
      }
      /**
       * Delete an annotation queue with the specified queue ID.
       * @param queueId - The ID of the annotation queue to delete
       */
      async deleteAnnotationQueue(queueId) {
        await this.caller.call(async () => {
          const res = await this._fetch(`${this.apiUrl}/annotation-queues/${assertUuid(queueId, "queueId")}`, {
            method: "DELETE",
            headers: { ...this.headers, Accept: "application/json" },
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions
          });
          await raiseForStatus(res, "delete annotation queue", true);
          return res;
        });
      }
      /**
       * Add runs to an annotation queue with the specified queue ID.
       * @param queueId - The ID of the annotation queue
       * @param runIds - The IDs of the runs to be added to the annotation queue
       */
      async addRunsToAnnotationQueue(queueId, runIds) {
        const body = JSON.stringify(runIds.map((id, i) => assertUuid(id, `runIds[${i}]`).toString()));
        await this.caller.call(async () => {
          const res = await this._fetch(`${this.apiUrl}/annotation-queues/${assertUuid(queueId, "queueId")}/runs`, {
            method: "POST",
            headers: { ...this.headers, "Content-Type": "application/json" },
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions,
            body
          });
          await raiseForStatus(res, "add runs to annotation queue", true);
          return res;
        });
      }
      /**
       * Get a run from an annotation queue at the specified index.
       * @param queueId - The ID of the annotation queue
       * @param index - The index of the run to retrieve
       * @returns A Promise that resolves to a RunWithAnnotationQueueInfo object
       * @throws {Error} If the run is not found at the given index or for other API-related errors
       */
      async getRunFromAnnotationQueue(queueId, index) {
        const baseUrl = `/annotation-queues/${assertUuid(queueId, "queueId")}/run`;
        const response = await this.caller.call(async () => {
          const res = await this._fetch(`${this.apiUrl}${baseUrl}/${index}`, {
            method: "GET",
            headers: this.headers,
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions
          });
          await raiseForStatus(res, "get run from annotation queue");
          return res;
        });
        return response.json();
      }
      /**
       * Delete a run from an an annotation queue.
       * @param queueId - The ID of the annotation queue to delete the run from
       * @param queueRunId - The ID of the run to delete from the annotation queue
       */
      async deleteRunFromAnnotationQueue(queueId, queueRunId) {
        await this.caller.call(async () => {
          const res = await this._fetch(`${this.apiUrl}/annotation-queues/${assertUuid(queueId, "queueId")}/runs/${assertUuid(queueRunId, "queueRunId")}`, {
            method: "DELETE",
            headers: { ...this.headers, Accept: "application/json" },
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions
          });
          await raiseForStatus(res, "delete run from annotation queue", true);
          return res;
        });
      }
      /**
       * Get the size of an annotation queue.
       * @param queueId - The ID of the annotation queue
       */
      async getSizeFromAnnotationQueue(queueId) {
        const response = await this.caller.call(async () => {
          const res = await this._fetch(`${this.apiUrl}/annotation-queues/${assertUuid(queueId, "queueId")}/size`, {
            method: "GET",
            headers: this.headers,
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions
          });
          await raiseForStatus(res, "get size from annotation queue");
          return res;
        });
        return response.json();
      }
      async _currentTenantIsOwner(owner) {
        const settings = await this._getSettings();
        return owner == "-" || settings.tenant_handle === owner;
      }
      async _ownerConflictError(action, owner) {
        const settings = await this._getSettings();
        return new Error(`Cannot ${action} for another tenant.

      Current tenant: ${settings.tenant_handle}

      Requested tenant: ${owner}`);
      }
      async _getLatestCommitHash(promptOwnerAndName) {
        const response = await this.caller.call(async () => {
          const res = await this._fetch(`${this.apiUrl}/commits/${promptOwnerAndName}/?limit=${1}&offset=${0}`, {
            method: "GET",
            headers: this.headers,
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions
          });
          await raiseForStatus(res, "get latest commit hash");
          return res;
        });
        const json = await response.json();
        if (json.commits.length === 0) {
          return void 0;
        }
        return json.commits[0].commit_hash;
      }
      async _likeOrUnlikePrompt(promptIdentifier, like) {
        const [owner, promptName, _] = parsePromptIdentifier(promptIdentifier);
        const body = JSON.stringify({ like });
        const response = await this.caller.call(async () => {
          const res = await this._fetch(`${this.apiUrl}/likes/${owner}/${promptName}`, {
            method: "POST",
            headers: { ...this.headers, "Content-Type": "application/json" },
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions,
            body
          });
          await raiseForStatus(res, `${like ? "like" : "unlike"} prompt`);
          return res;
        });
        return response.json();
      }
      async _getPromptUrl(promptIdentifier) {
        const [owner, promptName, commitHash] = parsePromptIdentifier(promptIdentifier);
        if (!await this._currentTenantIsOwner(owner)) {
          if (commitHash !== "latest") {
            return `${this.getHostUrl()}/hub/${owner}/${promptName}/${commitHash.substring(0, 8)}`;
          } else {
            return `${this.getHostUrl()}/hub/${owner}/${promptName}`;
          }
        } else {
          const settings = await this._getSettings();
          if (commitHash !== "latest") {
            return `${this.getHostUrl()}/prompts/${promptName}/${commitHash.substring(0, 8)}?organizationId=${settings.id}`;
          } else {
            return `${this.getHostUrl()}/prompts/${promptName}?organizationId=${settings.id}`;
          }
        }
      }
      async promptExists(promptIdentifier) {
        const prompt = await this.getPrompt(promptIdentifier);
        return !!prompt;
      }
      async likePrompt(promptIdentifier) {
        return this._likeOrUnlikePrompt(promptIdentifier, true);
      }
      async unlikePrompt(promptIdentifier) {
        return this._likeOrUnlikePrompt(promptIdentifier, false);
      }
      async *listCommits(promptOwnerAndName) {
        for await (const commits of this._getPaginated(`/commits/${promptOwnerAndName}/`, new URLSearchParams(), (res) => res.commits)) {
          yield* commits;
        }
      }
      async *listPrompts(options) {
        const params = new URLSearchParams();
        params.append("sort_field", options?.sortField ?? "updated_at");
        params.append("sort_direction", "desc");
        params.append("is_archived", (!!options?.isArchived).toString());
        if (options?.isPublic !== void 0) {
          params.append("is_public", options.isPublic.toString());
        }
        if (options?.query) {
          params.append("query", options.query);
        }
        for await (const prompts of this._getPaginated("/repos", params, (res) => res.repos)) {
          yield* prompts;
        }
      }
      async getPrompt(promptIdentifier) {
        const [owner, promptName, _] = parsePromptIdentifier(promptIdentifier);
        const response = await this.caller.call(async () => {
          const res = await this._fetch(`${this.apiUrl}/repos/${owner}/${promptName}`, {
            method: "GET",
            headers: this.headers,
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions
          });
          if (res?.status === 404) {
            return null;
          }
          await raiseForStatus(res, "get prompt");
          return res;
        });
        const result = await response?.json();
        if (result?.repo) {
          return result.repo;
        } else {
          return null;
        }
      }
      async createPrompt(promptIdentifier, options) {
        const settings = await this._getSettings();
        if (options?.isPublic && !settings.tenant_handle) {
          throw new Error(`Cannot create a public prompt without first

        creating a LangChain Hub handle.
        You can add a handle by creating a public prompt at:

        https://smith.langchain.com/prompts`);
        }
        const [owner, promptName, _] = parsePromptIdentifier(promptIdentifier);
        if (!await this._currentTenantIsOwner(owner)) {
          throw await this._ownerConflictError("create a prompt", owner);
        }
        const data = {
          repo_handle: promptName,
          ...options?.description && { description: options.description },
          ...options?.readme && { readme: options.readme },
          ...options?.tags && { tags: options.tags },
          is_public: !!options?.isPublic
        };
        const body = JSON.stringify(data);
        const response = await this.caller.call(async () => {
          const res = await this._fetch(`${this.apiUrl}/repos/`, {
            method: "POST",
            headers: { ...this.headers, "Content-Type": "application/json" },
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions,
            body
          });
          await raiseForStatus(res, "create prompt");
          return res;
        });
        const { repo } = await response.json();
        return repo;
      }
      async createCommit(promptIdentifier, object, options) {
        if (!await this.promptExists(promptIdentifier)) {
          throw new Error("Prompt does not exist, you must create it first.");
        }
        const [owner, promptName, _] = parsePromptIdentifier(promptIdentifier);
        const resolvedParentCommitHash = options?.parentCommitHash === "latest" || !options?.parentCommitHash ? await this._getLatestCommitHash(`${owner}/${promptName}`) : options?.parentCommitHash;
        const payload = {
          manifest: JSON.parse(JSON.stringify(object)),
          parent_commit: resolvedParentCommitHash
        };
        const body = JSON.stringify(payload);
        const response = await this.caller.call(async () => {
          const res = await this._fetch(`${this.apiUrl}/commits/${owner}/${promptName}`, {
            method: "POST",
            headers: { ...this.headers, "Content-Type": "application/json" },
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions,
            body
          });
          await raiseForStatus(res, "create commit");
          return res;
        });
        const result = await response.json();
        return this._getPromptUrl(`${owner}/${promptName}${result.commit_hash ? `:${result.commit_hash}` : ""}`);
      }
      /**
       * Update examples with attachments using multipart form data.
       * @param updates List of ExampleUpdateWithAttachments objects to upsert
       * @returns Promise with the update response
       */
      async updateExamplesMultipart(datasetId, updates = []) {
        return this._updateExamplesMultipart(datasetId, updates);
      }
      async _updateExamplesMultipart(datasetId, updates = []) {
        if (!await this._getDatasetExamplesMultiPartSupport()) {
          throw new Error("Your LangSmith deployment does not allow using the multipart examples endpoint, please upgrade your deployment to the latest version.");
        }
        const formData = new FormData();
        for (const example of updates) {
          const exampleId = example.id;
          const exampleBody = {
            ...example.metadata && { metadata: example.metadata },
            ...example.split && { split: example.split }
          };
          const stringifiedExample = serialize(exampleBody, `Serializing body for example with id: ${exampleId}`);
          const exampleBlob = new Blob([stringifiedExample], {
            type: "application/json"
          });
          formData.append(exampleId, exampleBlob);
          if (example.inputs) {
            const stringifiedInputs = serialize(example.inputs, `Serializing inputs for example with id: ${exampleId}`);
            const inputsBlob = new Blob([stringifiedInputs], {
              type: "application/json"
            });
            formData.append(`${exampleId}.inputs`, inputsBlob);
          }
          if (example.outputs) {
            const stringifiedOutputs = serialize(example.outputs, `Serializing outputs whle updating example with id: ${exampleId}`);
            const outputsBlob = new Blob([stringifiedOutputs], {
              type: "application/json"
            });
            formData.append(`${exampleId}.outputs`, outputsBlob);
          }
          if (example.attachments) {
            for (const [name, attachment] of Object.entries(example.attachments)) {
              let mimeType;
              let data;
              if (Array.isArray(attachment)) {
                [mimeType, data] = attachment;
              } else {
                mimeType = attachment.mimeType;
                data = attachment.data;
              }
              const attachmentBlob = new Blob([data], {
                type: `${mimeType}; length=${data.byteLength}`
              });
              formData.append(`${exampleId}.attachment.${name}`, attachmentBlob);
            }
          }
          if (example.attachments_operations) {
            const stringifiedAttachmentsOperations = serialize(example.attachments_operations, `Serializing attachments while updating example with id: ${exampleId}`);
            const attachmentsOperationsBlob = new Blob([stringifiedAttachmentsOperations], {
              type: "application/json"
            });
            formData.append(`${exampleId}.attachments_operations`, attachmentsOperationsBlob);
          }
        }
        const datasetIdToUse = datasetId ?? updates[0]?.dataset_id;
        const response = await this.caller.call(async () => {
          const res = await this._fetch(`${this.apiUrl}${this._getPlatformEndpointPath(`datasets/${datasetIdToUse}/examples`)}`, {
            method: "PATCH",
            headers: this.headers,
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions,
            body: formData
          });
          await raiseForStatus(res, "update examples");
          return res;
        });
        return response.json();
      }
      /**
       * Upload examples with attachments using multipart form data.
       * @param uploads List of ExampleUploadWithAttachments objects to upload
       * @returns Promise with the upload response
       * @deprecated This method is deprecated and will be removed in future LangSmith versions, please use `createExamples` instead
       */
      async uploadExamplesMultipart(datasetId, uploads = []) {
        return this._uploadExamplesMultipart(datasetId, uploads);
      }
      async _uploadExamplesMultipart(datasetId, uploads = []) {
        if (!await this._getDatasetExamplesMultiPartSupport()) {
          throw new Error("Your LangSmith deployment does not allow using the multipart examples endpoint, please upgrade your deployment to the latest version.");
        }
        const formData = new FormData();
        for (const example of uploads) {
          const exampleId = (example.id ?? v4_default()).toString();
          const exampleBody = {
            created_at: example.created_at,
            ...example.metadata && { metadata: example.metadata },
            ...example.split && { split: example.split },
            ...example.source_run_id && { source_run_id: example.source_run_id },
            ...example.use_source_run_io && {
              use_source_run_io: example.use_source_run_io
            },
            ...example.use_source_run_attachments && {
              use_source_run_attachments: example.use_source_run_attachments
            }
          };
          const stringifiedExample = serialize(exampleBody, `Serializing body for uploaded example with id: ${exampleId}`);
          const exampleBlob = new Blob([stringifiedExample], {
            type: "application/json"
          });
          formData.append(exampleId, exampleBlob);
          if (example.inputs) {
            const stringifiedInputs = serialize(example.inputs, `Serializing inputs for uploaded example with id: ${exampleId}`);
            const inputsBlob = new Blob([stringifiedInputs], {
              type: "application/json"
            });
            formData.append(`${exampleId}.inputs`, inputsBlob);
          }
          if (example.outputs) {
            const stringifiedOutputs = serialize(example.outputs, `Serializing outputs for uploaded example with id: ${exampleId}`);
            const outputsBlob = new Blob([stringifiedOutputs], {
              type: "application/json"
            });
            formData.append(`${exampleId}.outputs`, outputsBlob);
          }
          if (example.attachments) {
            for (const [name, attachment] of Object.entries(example.attachments)) {
              let mimeType;
              let data;
              if (Array.isArray(attachment)) {
                [mimeType, data] = attachment;
              } else {
                mimeType = attachment.mimeType;
                data = attachment.data;
              }
              const attachmentBlob = new Blob([data], {
                type: `${mimeType}; length=${data.byteLength}`
              });
              formData.append(`${exampleId}.attachment.${name}`, attachmentBlob);
            }
          }
        }
        const response = await this.caller.call(async () => {
          const res = await this._fetch(`${this.apiUrl}${this._getPlatformEndpointPath(`datasets/${datasetId}/examples`)}`, {
            method: "POST",
            headers: this.headers,
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions,
            body: formData
          });
          await raiseForStatus(res, "upload examples");
          return res;
        });
        return response.json();
      }
      async updatePrompt(promptIdentifier, options) {
        if (!await this.promptExists(promptIdentifier)) {
          throw new Error("Prompt does not exist, you must create it first.");
        }
        const [owner, promptName] = parsePromptIdentifier(promptIdentifier);
        if (!await this._currentTenantIsOwner(owner)) {
          throw await this._ownerConflictError("update a prompt", owner);
        }
        const payload = {};
        if (options?.description !== void 0)
          payload.description = options.description;
        if (options?.readme !== void 0)
          payload.readme = options.readme;
        if (options?.tags !== void 0)
          payload.tags = options.tags;
        if (options?.isPublic !== void 0)
          payload.is_public = options.isPublic;
        if (options?.isArchived !== void 0)
          payload.is_archived = options.isArchived;
        if (Object.keys(payload).length === 0) {
          throw new Error("No valid update options provided");
        }
        const body = JSON.stringify(payload);
        const response = await this.caller.call(async () => {
          const res = await this._fetch(`${this.apiUrl}/repos/${owner}/${promptName}`, {
            method: "PATCH",
            headers: {
              ...this.headers,
              "Content-Type": "application/json"
            },
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions,
            body
          });
          await raiseForStatus(res, "update prompt");
          return res;
        });
        return response.json();
      }
      async deletePrompt(promptIdentifier) {
        if (!await this.promptExists(promptIdentifier)) {
          throw new Error("Prompt does not exist, you must create it first.");
        }
        const [owner, promptName, _] = parsePromptIdentifier(promptIdentifier);
        if (!await this._currentTenantIsOwner(owner)) {
          throw await this._ownerConflictError("delete a prompt", owner);
        }
        const response = await this.caller.call(async () => {
          const res = await this._fetch(`${this.apiUrl}/repos/${owner}/${promptName}`, {
            method: "DELETE",
            headers: this.headers,
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions
          });
          await raiseForStatus(res, "delete prompt");
          return res;
        });
        return response.json();
      }
      async pullPromptCommit(promptIdentifier, options) {
        const [owner, promptName, commitHash] = parsePromptIdentifier(promptIdentifier);
        const response = await this.caller.call(async () => {
          const res = await this._fetch(`${this.apiUrl}/commits/${owner}/${promptName}/${commitHash}${options?.includeModel ? "?include_model=true" : ""}`, {
            method: "GET",
            headers: this.headers,
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions
          });
          await raiseForStatus(res, "pull prompt commit");
          return res;
        });
        const result = await response.json();
        return {
          owner,
          repo: promptName,
          commit_hash: result.commit_hash,
          manifest: result.manifest,
          examples: result.examples
        };
      }
      /**
       * This method should not be used directly, use `import { pull } from "langchain/hub"` instead.
       * Using this method directly returns the JSON string of the prompt rather than a LangChain object.
       * @private
       */
      async _pullPrompt(promptIdentifier, options) {
        const promptObject = await this.pullPromptCommit(promptIdentifier, {
          includeModel: options?.includeModel
        });
        const prompt = JSON.stringify(promptObject.manifest);
        return prompt;
      }
      async pushPrompt(promptIdentifier, options) {
        if (await this.promptExists(promptIdentifier)) {
          if (options && Object.keys(options).some((key) => key !== "object")) {
            await this.updatePrompt(promptIdentifier, {
              description: options?.description,
              readme: options?.readme,
              tags: options?.tags,
              isPublic: options?.isPublic
            });
          }
        } else {
          await this.createPrompt(promptIdentifier, {
            description: options?.description,
            readme: options?.readme,
            tags: options?.tags,
            isPublic: options?.isPublic
          });
        }
        if (!options?.object) {
          return await this._getPromptUrl(promptIdentifier);
        }
        const url = await this.createCommit(promptIdentifier, options?.object, {
          parentCommitHash: options?.parentCommitHash
        });
        return url;
      }
      /**
         * Clone a public dataset to your own langsmith tenant.
         * This operation is idempotent. If you already have a dataset with the given name,
         * this function will do nothing.
      
         * @param {string} tokenOrUrl The token of the public dataset to clone.
         * @param {Object} [options] Additional options for cloning the dataset.
         * @param {string} [options.sourceApiUrl] The URL of the langsmith server where the data is hosted. Defaults to the API URL of your current client.
         * @param {string} [options.datasetName] The name of the dataset to create in your tenant. Defaults to the name of the public dataset.
         * @returns {Promise<void>}
         */
      async clonePublicDataset(tokenOrUrl, options = {}) {
        const { sourceApiUrl = this.apiUrl, datasetName } = options;
        const [parsedApiUrl, tokenUuid] = this.parseTokenOrUrl(tokenOrUrl, sourceApiUrl);
        const sourceClient = new _Client({
          apiUrl: parsedApiUrl,
          // Placeholder API key not needed anymore in most cases, but
          // some private deployments may have API key-based rate limiting
          // that would cause this to fail if we provide no value.
          apiKey: "placeholder"
        });
        const ds = await sourceClient.readSharedDataset(tokenUuid);
        const finalDatasetName = datasetName || ds.name;
        try {
          if (await this.hasDataset({ datasetId: finalDatasetName })) {
            console.log(`Dataset ${finalDatasetName} already exists in your tenant. Skipping.`);
            return;
          }
        } catch (_) {
        }
        const examples = await sourceClient.listSharedExamples(tokenUuid);
        const dataset = await this.createDataset(finalDatasetName, {
          description: ds.description,
          dataType: ds.data_type || "kv",
          inputsSchema: ds.inputs_schema_definition ?? void 0,
          outputsSchema: ds.outputs_schema_definition ?? void 0
        });
        try {
          await this.createExamples({
            inputs: examples.map((e) => e.inputs),
            outputs: examples.flatMap((e) => e.outputs ? [e.outputs] : []),
            datasetId: dataset.id
          });
        } catch (e) {
          console.error(`An error occurred while creating dataset ${finalDatasetName}. You should delete it manually.`);
          throw e;
        }
      }
      parseTokenOrUrl(urlOrToken, apiUrl, numParts = 2, kind = "dataset") {
        try {
          assertUuid(urlOrToken);
          return [apiUrl, urlOrToken];
        } catch (_) {
        }
        try {
          const parsedUrl = new URL(urlOrToken);
          const pathParts = parsedUrl.pathname.split("/").filter((part) => part !== "");
          if (pathParts.length >= numParts) {
            const tokenUuid = pathParts[pathParts.length - numParts];
            return [apiUrl, tokenUuid];
          } else {
            throw new Error(`Invalid public ${kind} URL: ${urlOrToken}`);
          }
        } catch (error) {
          throw new Error(`Invalid public ${kind} URL or token: ${urlOrToken}`);
        }
      }
      /**
       * Awaits all pending trace batches. Useful for environments where
       * you need to be sure that all tracing requests finish before execution ends,
       * such as serverless environments.
       *
       * @example
       * ```
       * import { Client } from "langsmith";
       *
       * const client = new Client();
       *
       * try {
       *   // Tracing happens here
       *   ...
       * } finally {
       *   await client.awaitPendingTraceBatches();
       * }
       * ```
       *
       * @returns A promise that resolves once all currently pending traces have sent.
       */
      async awaitPendingTraceBatches() {
        if (this.manualFlushMode) {
          console.warn("[WARNING]: When tracing in manual flush mode, you must call `await client.flush()` manually to submit trace batches.");
          return Promise.resolve();
        }
        await Promise.all([
          ...this.autoBatchQueue.items.map(({ itemPromise }) => itemPromise),
          this.batchIngestCaller.queue.onIdle()
        ]);
        if (this.langSmithToOTELTranslator !== void 0) {
          await getDefaultOTLPTracerComponents()?.DEFAULT_LANGSMITH_SPAN_PROCESSOR?.forceFlush();
        }
      }
    };
  }
});

// node_modules/langsmith/dist/env.js
var isTracingEnabled;
var init_env2 = __esm({
  "node_modules/langsmith/dist/env.js"() {
    init_env();
    isTracingEnabled = (tracingEnabled) => {
      if (tracingEnabled !== void 0) {
        return tracingEnabled;
      }
      const envVars = ["TRACING_V2", "TRACING"];
      return !!envVars.find((envVar) => getLangSmithEnvironmentVariable(envVar) === "true");
    };
  }
});

// node_modules/langsmith/dist/singletons/constants.js
var _LC_CONTEXT_VARIABLES_KEY, _REPLICA_TRACE_ROOTS_KEY;
var init_constants2 = __esm({
  "node_modules/langsmith/dist/singletons/constants.js"() {
    _LC_CONTEXT_VARIABLES_KEY = /* @__PURE__ */ Symbol.for("lc:context_variables");
    _REPLICA_TRACE_ROOTS_KEY = /* @__PURE__ */ Symbol.for("langsmith:replica_trace_roots");
  }
});

// node_modules/langsmith/dist/utils/context_vars.js
function getContextVar(runTree, key) {
  if (_LC_CONTEXT_VARIABLES_KEY in runTree) {
    const contextVars = runTree[_LC_CONTEXT_VARIABLES_KEY];
    return contextVars[key];
  }
  return void 0;
}
function setContextVar(runTree, key, value) {
  const contextVars = _LC_CONTEXT_VARIABLES_KEY in runTree ? (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    runTree[_LC_CONTEXT_VARIABLES_KEY]
  ) : {};
  contextVars[key] = value;
  runTree[_LC_CONTEXT_VARIABLES_KEY] = contextVars;
}
var init_context_vars = __esm({
  "node_modules/langsmith/dist/utils/context_vars.js"() {
    init_constants2();
  }
});

// node_modules/langsmith/dist/run_trees.js
function getReplicaKey(replica) {
  const sortedKeys = Object.keys(replica).sort();
  const keyData = sortedKeys.map((key) => `${key}:${replica[key] ?? ""}`).join("|");
  return v5_default(keyData, UUID_NAMESPACE_DNS);
}
function stripNonAlphanumeric(input) {
  return input.replace(/[-:.]/g, "");
}
function getMicrosecondPrecisionDatestring(epoch, executionOrder = 1) {
  const paddedOrder = executionOrder.toFixed(0).slice(0, 3).padStart(3, "0");
  return `${new Date(epoch).toISOString().slice(0, -1)}${paddedOrder}Z`;
}
function convertToDottedOrderFormat(epoch, runId, executionOrder = 1) {
  const microsecondPrecisionDatestring = getMicrosecondPrecisionDatestring(epoch, executionOrder);
  return {
    dottedOrder: stripNonAlphanumeric(microsecondPrecisionDatestring) + runId,
    microsecondPrecisionDatestring
  };
}
function isRunTree(x) {
  return x != null && typeof x.createChild === "function" && typeof x.postRun === "function";
}
function isLangChainTracerLike(x) {
  return typeof x === "object" && x != null && typeof x.name === "string" && x.name === "langchain_tracer";
}
function containsLangChainTracerLike(x) {
  return Array.isArray(x) && x.some((callback) => isLangChainTracerLike(callback));
}
function isCallbackManagerLike(x) {
  return typeof x === "object" && x != null && Array.isArray(x.handlers);
}
function isRunnableConfigLike(x) {
  const callbacks = x?.callbacks;
  return x != null && typeof callbacks === "object" && // Callback manager with a langchain tracer
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (containsLangChainTracerLike(callbacks?.handlers) || // Or it's an array with a LangChainTracerLike object within it
  containsLangChainTracerLike(callbacks));
}
function _getWriteReplicasFromEnv() {
  const envVar = getEnvironmentVariable("LANGSMITH_RUNS_ENDPOINTS");
  if (!envVar)
    return [];
  try {
    const parsed = JSON.parse(envVar);
    if (Array.isArray(parsed)) {
      const replicas = [];
      for (const item of parsed) {
        if (typeof item !== "object" || item === null) {
          console.warn(`Invalid item type in LANGSMITH_RUNS_ENDPOINTS: expected object, got ${typeof item}`);
          continue;
        }
        if (typeof item.api_url !== "string") {
          console.warn(`Invalid api_url type in LANGSMITH_RUNS_ENDPOINTS: expected string, got ${typeof item.api_url}`);
          continue;
        }
        if (typeof item.api_key !== "string") {
          console.warn(`Invalid api_key type in LANGSMITH_RUNS_ENDPOINTS: expected string, got ${typeof item.api_key}`);
          continue;
        }
        replicas.push({
          apiUrl: item.api_url.replace(/\/$/, ""),
          apiKey: item.api_key
        });
      }
      return replicas;
    } else if (typeof parsed === "object" && parsed !== null) {
      _checkEndpointEnvUnset(parsed);
      const replicas = [];
      for (const [url, key] of Object.entries(parsed)) {
        const cleanUrl = url.replace(/\/$/, "");
        if (typeof key === "string") {
          replicas.push({
            apiUrl: cleanUrl,
            apiKey: key
          });
        } else {
          console.warn(`Invalid value type in LANGSMITH_RUNS_ENDPOINTS for URL ${url}: expected string, got ${typeof key}`);
          continue;
        }
      }
      return replicas;
    } else {
      console.warn(`Invalid LANGSMITH_RUNS_ENDPOINTS \u2013 must be valid JSON array of objects with api_url and api_key properties, or object mapping url->apiKey, got ${typeof parsed}`);
      return [];
    }
  } catch (e) {
    if (isConflictingEndpointsError(e)) {
      throw e;
    }
    console.warn("Invalid LANGSMITH_RUNS_ENDPOINTS \u2013 must be valid JSON array of objects with api_url and api_key properties, or object mapping url->apiKey");
    return [];
  }
}
function _ensureWriteReplicas(replicas) {
  if (replicas) {
    return replicas.map((replica) => {
      if (Array.isArray(replica)) {
        return {
          projectName: replica[0],
          updates: replica[1]
        };
      }
      return replica;
    });
  }
  return _getWriteReplicasFromEnv();
}
function _checkEndpointEnvUnset(parsed) {
  if (Object.keys(parsed).length > 0 && getLangSmithEnvironmentVariable("ENDPOINT")) {
    throw new ConflictingEndpointsError();
  }
}
var TIMESTAMP_LENGTH, UUID_NAMESPACE_DNS, Baggage, RunTree;
var init_run_trees = __esm({
  "node_modules/langsmith/dist/run_trees.js"() {
    init_client();
    init_env2();
    init_error();
    init_constants2();
    init_context_vars();
    init_env();
    init_project();
    init_env();
    init_warn();
    init_uuid();
    init_esm_node();
    TIMESTAMP_LENGTH = 36;
    UUID_NAMESPACE_DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
    Baggage = class _Baggage {
      constructor(metadata, tags, project_name, replicas) {
        Object.defineProperty(this, "metadata", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "tags", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "project_name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "replicas", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.metadata = metadata;
        this.tags = tags;
        this.project_name = project_name;
        this.replicas = replicas;
      }
      static fromHeader(value) {
        const items = value.split(",");
        let metadata = {};
        let tags = [];
        let project_name;
        let replicas;
        for (const item of items) {
          const [key, uriValue] = item.split("=");
          const value2 = decodeURIComponent(uriValue);
          if (key === "langsmith-metadata") {
            metadata = JSON.parse(value2);
          } else if (key === "langsmith-tags") {
            tags = value2.split(",");
          } else if (key === "langsmith-project") {
            project_name = value2;
          } else if (key === "langsmith-replicas") {
            replicas = JSON.parse(value2);
          }
        }
        return new _Baggage(metadata, tags, project_name, replicas);
      }
      toHeader() {
        const items = [];
        if (this.metadata && Object.keys(this.metadata).length > 0) {
          items.push(`langsmith-metadata=${encodeURIComponent(JSON.stringify(this.metadata))}`);
        }
        if (this.tags && this.tags.length > 0) {
          items.push(`langsmith-tags=${encodeURIComponent(this.tags.join(","))}`);
        }
        if (this.project_name) {
          items.push(`langsmith-project=${encodeURIComponent(this.project_name)}`);
        }
        return items.join(",");
      }
    };
    RunTree = class _RunTree {
      constructor(originalConfig) {
        Object.defineProperty(this, "id", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "run_type", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "project_name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "parent_run", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "parent_run_id", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "child_runs", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "start_time", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "end_time", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "extra", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "tags", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "error", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "serialized", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "inputs", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "outputs", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "reference_example_id", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "client", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "events", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "trace_id", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "dotted_order", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "tracingEnabled", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "execution_order", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "child_execution_order", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "attachments", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "replicas", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "distributedParentId", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "_serialized_start_time", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        if (isRunTree(originalConfig)) {
          Object.assign(this, { ...originalConfig });
          return;
        }
        const defaultConfig = _RunTree.getDefaultConfig();
        const { metadata, ...config } = originalConfig;
        const client2 = config.client ?? _RunTree.getSharedClient();
        const dedupedMetadata = {
          ...metadata,
          ...config?.extra?.metadata
        };
        config.extra = { ...config.extra, metadata: dedupedMetadata };
        if ("id" in config && config.id == null) {
          delete config.id;
        }
        Object.assign(this, { ...defaultConfig, ...config, client: client2 });
        this.execution_order ??= 1;
        this.child_execution_order ??= 1;
        if (!this.dotted_order) {
          this._serialized_start_time = getMicrosecondPrecisionDatestring(this.start_time, this.execution_order);
        }
        if (!this.id) {
          this.id = uuid7FromTime(this._serialized_start_time ?? this.start_time);
        }
        if (!this.trace_id) {
          if (this.parent_run) {
            this.trace_id = this.parent_run.trace_id ?? this.id;
          } else {
            this.trace_id = this.id;
          }
        }
        this.replicas = _ensureWriteReplicas(this.replicas);
        if (!this.dotted_order) {
          const { dottedOrder } = convertToDottedOrderFormat(this.start_time, this.id, this.execution_order);
          if (this.parent_run) {
            this.dotted_order = this.parent_run.dotted_order + "." + dottedOrder;
          } else {
            this.dotted_order = dottedOrder;
          }
        }
      }
      set metadata(metadata) {
        this.extra = {
          ...this.extra,
          metadata: {
            ...this.extra?.metadata,
            ...metadata
          }
        };
      }
      get metadata() {
        return this.extra?.metadata;
      }
      static getDefaultConfig() {
        const start_time = Date.now();
        return {
          run_type: "chain",
          project_name: getDefaultProjectName(),
          child_runs: [],
          api_url: getEnvironmentVariable("LANGCHAIN_ENDPOINT") ?? "http://localhost:1984",
          api_key: getEnvironmentVariable("LANGCHAIN_API_KEY"),
          caller_options: {},
          start_time,
          serialized: {},
          inputs: {},
          extra: {}
        };
      }
      static getSharedClient() {
        if (!_RunTree.sharedClient) {
          _RunTree.sharedClient = new Client();
        }
        return _RunTree.sharedClient;
      }
      createChild(config) {
        const child_execution_order = this.child_execution_order + 1;
        const inheritedReplicas = this.replicas?.map((replica) => {
          const { reroot, ...rest } = replica;
          return rest;
        });
        const childReplicas = config.replicas ?? inheritedReplicas;
        const child = new _RunTree({
          ...config,
          parent_run: this,
          project_name: this.project_name,
          replicas: childReplicas,
          client: this.client,
          tracingEnabled: this.tracingEnabled,
          execution_order: child_execution_order,
          child_execution_order
        });
        if (_LC_CONTEXT_VARIABLES_KEY in this) {
          child[_LC_CONTEXT_VARIABLES_KEY] = this[_LC_CONTEXT_VARIABLES_KEY];
        }
        const LC_CHILD = /* @__PURE__ */ Symbol.for("lc:child_config");
        const presentConfig = config.extra?.[LC_CHILD] ?? this.extra[LC_CHILD];
        if (isRunnableConfigLike(presentConfig)) {
          const newConfig = { ...presentConfig };
          const callbacks = isCallbackManagerLike(newConfig.callbacks) ? newConfig.callbacks.copy?.() : void 0;
          if (callbacks) {
            Object.assign(callbacks, { _parentRunId: child.id });
            callbacks.handlers?.find(isLangChainTracerLike)?.updateFromRunTree?.(child);
            newConfig.callbacks = callbacks;
          }
          child.extra[LC_CHILD] = newConfig;
        }
        const visited = /* @__PURE__ */ new Set();
        let current = this;
        while (current != null && !visited.has(current.id)) {
          visited.add(current.id);
          current.child_execution_order = Math.max(current.child_execution_order, child_execution_order);
          current = current.parent_run;
        }
        this.child_runs.push(child);
        return child;
      }
      async end(outputs, error, endTime = Date.now(), metadata) {
        this.outputs = this.outputs ?? outputs;
        this.error = this.error ?? error;
        this.end_time = this.end_time ?? endTime;
        if (metadata && Object.keys(metadata).length > 0) {
          this.extra = this.extra ? { ...this.extra, metadata: { ...this.extra.metadata, ...metadata } } : { metadata };
        }
      }
      _convertToCreate(run, runtimeEnv, excludeChildRuns = true) {
        const runExtra = run.extra ?? {};
        if (runExtra?.runtime?.library === void 0) {
          if (!runExtra.runtime) {
            runExtra.runtime = {};
          }
          if (runtimeEnv) {
            for (const [k, v] of Object.entries(runtimeEnv)) {
              if (!runExtra.runtime[k]) {
                runExtra.runtime[k] = v;
              }
            }
          }
        }
        let child_runs;
        let parent_run_id;
        if (!excludeChildRuns) {
          child_runs = run.child_runs.map((child_run) => this._convertToCreate(child_run, runtimeEnv, excludeChildRuns));
          parent_run_id = void 0;
        } else {
          parent_run_id = run.parent_run?.id ?? run.parent_run_id;
          child_runs = [];
        }
        return {
          id: run.id,
          name: run.name,
          start_time: run._serialized_start_time ?? run.start_time,
          end_time: run.end_time,
          run_type: run.run_type,
          reference_example_id: run.reference_example_id,
          extra: runExtra,
          serialized: run.serialized,
          error: run.error,
          inputs: run.inputs,
          outputs: run.outputs,
          session_name: run.project_name,
          child_runs,
          parent_run_id,
          trace_id: run.trace_id,
          dotted_order: run.dotted_order,
          tags: run.tags,
          attachments: run.attachments,
          events: run.events
        };
      }
      _sliceParentId(parentId, run) {
        if (run.dotted_order) {
          const segs = run.dotted_order.split(".");
          let startIdx = null;
          for (let idx = 0; idx < segs.length; idx++) {
            const segId = segs[idx].slice(-TIMESTAMP_LENGTH);
            if (segId === parentId) {
              startIdx = idx;
              break;
            }
          }
          if (startIdx !== null) {
            const trimmedSegs = segs.slice(startIdx + 1);
            run.dotted_order = trimmedSegs.join(".");
            if (trimmedSegs.length > 0) {
              run.trace_id = trimmedSegs[0].slice(-TIMESTAMP_LENGTH);
            } else {
              run.trace_id = run.id;
            }
          }
        }
        if (run.parent_run_id === parentId) {
          run.parent_run_id = void 0;
        }
      }
      _setReplicaTraceRoot(replicaKey, traceRootId) {
        const replicaTraceRoots = getContextVar(this, _REPLICA_TRACE_ROOTS_KEY) ?? {};
        replicaTraceRoots[replicaKey] = traceRootId;
        setContextVar(this, _REPLICA_TRACE_ROOTS_KEY, replicaTraceRoots);
        for (const child of this.child_runs) {
          child._setReplicaTraceRoot(replicaKey, traceRootId);
        }
      }
      _remapForProject(params) {
        const { projectName, runtimeEnv, excludeChildRuns = true, reroot = false, distributedParentId, apiUrl, apiKey, workspaceId } = params;
        const baseRun = this._convertToCreate(this, runtimeEnv, excludeChildRuns);
        if (projectName === this.project_name) {
          return {
            ...baseRun,
            session_name: projectName
          };
        }
        if (reroot) {
          if (distributedParentId) {
            this._sliceParentId(distributedParentId, baseRun);
          } else {
            baseRun.parent_run_id = void 0;
            if (baseRun.dotted_order) {
              const segs = baseRun.dotted_order.split(".");
              if (segs.length > 0) {
                baseRun.dotted_order = segs[segs.length - 1];
                baseRun.trace_id = baseRun.id;
              }
            }
          }
          const replicaKey = getReplicaKey({
            projectName,
            apiUrl,
            apiKey,
            workspaceId
          });
          this._setReplicaTraceRoot(replicaKey, baseRun.id);
        }
        let ancestorRerootedTraceId;
        if (!reroot) {
          const replicaTraceRoots = getContextVar(this, _REPLICA_TRACE_ROOTS_KEY) ?? {};
          const replicaKey = getReplicaKey({
            projectName,
            apiUrl,
            apiKey,
            workspaceId
          });
          ancestorRerootedTraceId = replicaTraceRoots[replicaKey];
          if (ancestorRerootedTraceId) {
            baseRun.trace_id = ancestorRerootedTraceId;
            if (baseRun.dotted_order) {
              const segs = baseRun.dotted_order.split(".");
              let rootIdx = null;
              for (let idx = 0; idx < segs.length; idx++) {
                const segId = segs[idx].slice(-TIMESTAMP_LENGTH);
                if (segId === ancestorRerootedTraceId) {
                  rootIdx = idx;
                  break;
                }
              }
              if (rootIdx !== null) {
                const trimmedSegs = segs.slice(rootIdx);
                baseRun.dotted_order = trimmedSegs.join(".");
              }
            }
          }
        }
        const oldId = baseRun.id;
        const newId = v5_default(`${oldId}:${projectName}`, UUID_NAMESPACE_DNS);
        let newTraceId;
        if (baseRun.trace_id) {
          newTraceId = v5_default(`${baseRun.trace_id}:${projectName}`, UUID_NAMESPACE_DNS);
        } else {
          newTraceId = newId;
        }
        let newParentId;
        if (baseRun.parent_run_id) {
          newParentId = v5_default(`${baseRun.parent_run_id}:${projectName}`, UUID_NAMESPACE_DNS);
        }
        let newDottedOrder;
        if (baseRun.dotted_order) {
          const segs = baseRun.dotted_order.split(".");
          const remappedSegs = segs.map((seg) => {
            const segId = seg.slice(-TIMESTAMP_LENGTH);
            const remappedId = v5_default(`${segId}:${projectName}`, UUID_NAMESPACE_DNS);
            return seg.slice(0, -TIMESTAMP_LENGTH) + remappedId;
          });
          newDottedOrder = remappedSegs.join(".");
        }
        return {
          ...baseRun,
          id: newId,
          trace_id: newTraceId,
          parent_run_id: newParentId,
          dotted_order: newDottedOrder,
          session_name: projectName
        };
      }
      async postRun(excludeChildRuns = true) {
        try {
          const runtimeEnv = getRuntimeEnvironment();
          if (this.replicas && this.replicas.length > 0) {
            for (const { projectName, apiKey, apiUrl, workspaceId, reroot } of this.replicas) {
              const runCreate = this._remapForProject({
                projectName: projectName ?? this.project_name,
                runtimeEnv,
                excludeChildRuns: true,
                reroot,
                distributedParentId: this.distributedParentId,
                apiUrl,
                apiKey,
                workspaceId
              });
              await this.client.createRun(runCreate, {
                apiKey,
                apiUrl,
                workspaceId
              });
            }
          } else {
            const runCreate = this._convertToCreate(this, runtimeEnv, excludeChildRuns);
            await this.client.createRun(runCreate);
          }
          if (!excludeChildRuns) {
            warnOnce("Posting with excludeChildRuns=false is deprecated and will be removed in a future version.");
            for (const childRun of this.child_runs) {
              await childRun.postRun(false);
            }
          }
        } catch (error) {
          console.error(`Error in postRun for run ${this.id}:`, error);
        }
      }
      async patchRun(options) {
        if (this.replicas && this.replicas.length > 0) {
          for (const { projectName, apiKey, apiUrl, workspaceId, updates, reroot } of this.replicas) {
            const runData = this._remapForProject({
              projectName: projectName ?? this.project_name,
              runtimeEnv: void 0,
              excludeChildRuns: true,
              reroot,
              distributedParentId: this.distributedParentId,
              apiUrl,
              apiKey,
              workspaceId
            });
            const updatePayload = {
              id: runData.id,
              name: runData.name,
              run_type: runData.run_type,
              start_time: runData.start_time,
              outputs: runData.outputs,
              error: runData.error,
              parent_run_id: runData.parent_run_id,
              session_name: runData.session_name,
              reference_example_id: runData.reference_example_id,
              end_time: runData.end_time,
              dotted_order: runData.dotted_order,
              trace_id: runData.trace_id,
              events: runData.events,
              tags: runData.tags,
              extra: runData.extra,
              attachments: this.attachments,
              ...updates
            };
            if (!options?.excludeInputs) {
              updatePayload.inputs = runData.inputs;
            }
            await this.client.updateRun(runData.id, updatePayload, {
              apiKey,
              apiUrl,
              workspaceId
            });
          }
        } else {
          try {
            const runUpdate = {
              name: this.name,
              run_type: this.run_type,
              start_time: this._serialized_start_time ?? this.start_time,
              end_time: this.end_time,
              error: this.error,
              outputs: this.outputs,
              parent_run_id: this.parent_run?.id ?? this.parent_run_id,
              reference_example_id: this.reference_example_id,
              extra: this.extra,
              events: this.events,
              dotted_order: this.dotted_order,
              trace_id: this.trace_id,
              tags: this.tags,
              attachments: this.attachments,
              session_name: this.project_name
            };
            if (!options?.excludeInputs) {
              runUpdate.inputs = this.inputs;
            }
            await this.client.updateRun(this.id, runUpdate);
          } catch (error) {
            console.error(`Error in patchRun for run ${this.id}`, error);
          }
        }
      }
      toJSON() {
        return this._convertToCreate(this, void 0, false);
      }
      /**
       * Add an event to the run tree.
       * @param event - A single event or string to add
       */
      addEvent(event) {
        if (!this.events) {
          this.events = [];
        }
        if (typeof event === "string") {
          this.events.push({
            name: "event",
            time: (/* @__PURE__ */ new Date()).toISOString(),
            message: event
          });
        } else {
          this.events.push({
            ...event,
            time: event.time ?? (/* @__PURE__ */ new Date()).toISOString()
          });
        }
      }
      static fromRunnableConfig(parentConfig, props) {
        const callbackManager = parentConfig?.callbacks;
        let parentRun;
        let projectName;
        let client2;
        let tracingEnabled = isTracingEnabled();
        if (callbackManager) {
          const parentRunId = callbackManager?.getParentRunId?.() ?? "";
          const langChainTracer = callbackManager?.handlers?.find((handler) => handler?.name == "langchain_tracer");
          parentRun = langChainTracer?.getRun?.(parentRunId);
          projectName = langChainTracer?.projectName;
          client2 = langChainTracer?.client;
          tracingEnabled = tracingEnabled || !!langChainTracer;
        }
        if (!parentRun) {
          return new _RunTree({
            ...props,
            client: client2,
            tracingEnabled,
            project_name: projectName
          });
        }
        const parentRunTree = new _RunTree({
          name: parentRun.name,
          id: parentRun.id,
          trace_id: parentRun.trace_id,
          dotted_order: parentRun.dotted_order,
          client: client2,
          tracingEnabled,
          project_name: projectName,
          tags: [
            ...new Set((parentRun?.tags ?? []).concat(parentConfig?.tags ?? []))
          ],
          extra: {
            metadata: {
              ...parentRun?.extra?.metadata,
              ...parentConfig?.metadata
            }
          }
        });
        return parentRunTree.createChild(props);
      }
      static fromDottedOrder(dottedOrder) {
        return this.fromHeaders({ "langsmith-trace": dottedOrder });
      }
      static fromHeaders(headers, inheritArgs) {
        const rawHeaders = "get" in headers && typeof headers.get === "function" ? {
          "langsmith-trace": headers.get("langsmith-trace"),
          baggage: headers.get("baggage")
        } : headers;
        const headerTrace = rawHeaders["langsmith-trace"];
        if (!headerTrace || typeof headerTrace !== "string")
          return void 0;
        const parentDottedOrder = headerTrace.trim();
        const parsedDottedOrder = parentDottedOrder.split(".").map((part) => {
          const [strTime, uuid] = part.split("Z");
          return { strTime, time: Date.parse(strTime + "Z"), uuid };
        });
        const traceId = parsedDottedOrder[0].uuid;
        const config = {
          ...inheritArgs,
          name: inheritArgs?.["name"] ?? "parent",
          run_type: inheritArgs?.["run_type"] ?? "chain",
          start_time: inheritArgs?.["start_time"] ?? Date.now(),
          id: parsedDottedOrder.at(-1)?.uuid,
          trace_id: traceId,
          dotted_order: parentDottedOrder
        };
        if (rawHeaders["baggage"] && typeof rawHeaders["baggage"] === "string") {
          const baggage = Baggage.fromHeader(rawHeaders["baggage"]);
          config.metadata = baggage.metadata;
          config.tags = baggage.tags;
          config.project_name = baggage.project_name;
          config.replicas = baggage.replicas;
        }
        const runTree = new _RunTree(config);
        runTree.distributedParentId = runTree.id;
        return runTree;
      }
      toHeaders(headers) {
        const result = {
          "langsmith-trace": this.dotted_order,
          baggage: new Baggage(this.extra?.metadata, this.tags, this.project_name, this.replicas).toHeader()
        };
        if (headers) {
          for (const [key, value] of Object.entries(result)) {
            headers.set(key, value);
          }
        }
        return result;
      }
    };
    Object.defineProperty(RunTree, "sharedClient", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: null
    });
  }
});

// node_modules/langsmith/run_trees.js
var init_run_trees2 = __esm({
  "node_modules/langsmith/run_trees.js"() {
    init_run_trees();
  }
});

// node_modules/decamelize/index.js
var require_decamelize = __commonJS({
  "node_modules/decamelize/index.js"(exports2, module2) {
    "use strict";
    module2.exports = function(str, sep) {
      if (typeof str !== "string") {
        throw new TypeError("Expected a string");
      }
      sep = typeof sep === "undefined" ? "_" : sep;
      return str.replace(/([a-z\d])([A-Z])/g, "$1" + sep + "$2").replace(/([A-Z]+)([A-Z][a-z\d]+)/g, "$1" + sep + "$2").toLowerCase();
    };
  }
});

// node_modules/camelcase/index.js
var require_camelcase = __commonJS({
  "node_modules/camelcase/index.js"(exports2, module2) {
    "use strict";
    var UPPERCASE = /[\p{Lu}]/u;
    var LOWERCASE = /[\p{Ll}]/u;
    var LEADING_CAPITAL = /^[\p{Lu}](?![\p{Lu}])/gu;
    var IDENTIFIER = /([\p{Alpha}\p{N}_]|$)/u;
    var SEPARATORS = /[_.\- ]+/;
    var LEADING_SEPARATORS = new RegExp("^" + SEPARATORS.source);
    var SEPARATORS_AND_IDENTIFIER = new RegExp(SEPARATORS.source + IDENTIFIER.source, "gu");
    var NUMBERS_AND_IDENTIFIER = new RegExp("\\d+" + IDENTIFIER.source, "gu");
    var preserveCamelCase = (string, toLowerCase, toUpperCase) => {
      let isLastCharLower = false;
      let isLastCharUpper = false;
      let isLastLastCharUpper = false;
      for (let i = 0; i < string.length; i++) {
        const character = string[i];
        if (isLastCharLower && UPPERCASE.test(character)) {
          string = string.slice(0, i) + "-" + string.slice(i);
          isLastCharLower = false;
          isLastLastCharUpper = isLastCharUpper;
          isLastCharUpper = true;
          i++;
        } else if (isLastCharUpper && isLastLastCharUpper && LOWERCASE.test(character)) {
          string = string.slice(0, i - 1) + "-" + string.slice(i - 1);
          isLastLastCharUpper = isLastCharUpper;
          isLastCharUpper = false;
          isLastCharLower = true;
        } else {
          isLastCharLower = toLowerCase(character) === character && toUpperCase(character) !== character;
          isLastLastCharUpper = isLastCharUpper;
          isLastCharUpper = toUpperCase(character) === character && toLowerCase(character) !== character;
        }
      }
      return string;
    };
    var preserveConsecutiveUppercase = (input, toLowerCase) => {
      LEADING_CAPITAL.lastIndex = 0;
      return input.replace(LEADING_CAPITAL, (m1) => toLowerCase(m1));
    };
    var postProcess = (input, toUpperCase) => {
      SEPARATORS_AND_IDENTIFIER.lastIndex = 0;
      NUMBERS_AND_IDENTIFIER.lastIndex = 0;
      return input.replace(SEPARATORS_AND_IDENTIFIER, (_, identifier) => toUpperCase(identifier)).replace(NUMBERS_AND_IDENTIFIER, (m) => toUpperCase(m));
    };
    var camelCase2 = (input, options) => {
      if (!(typeof input === "string" || Array.isArray(input))) {
        throw new TypeError("Expected the input to be `string | string[]`");
      }
      options = {
        pascalCase: false,
        preserveConsecutiveUppercase: false,
        ...options
      };
      if (Array.isArray(input)) {
        input = input.map((x) => x.trim()).filter((x) => x.length).join("-");
      } else {
        input = input.trim();
      }
      if (input.length === 0) {
        return "";
      }
      const toLowerCase = options.locale === false ? (string) => string.toLowerCase() : (string) => string.toLocaleLowerCase(options.locale);
      const toUpperCase = options.locale === false ? (string) => string.toUpperCase() : (string) => string.toLocaleUpperCase(options.locale);
      if (input.length === 1) {
        return options.pascalCase ? toUpperCase(input) : toLowerCase(input);
      }
      const hasUpperCase = input !== toLowerCase(input);
      if (hasUpperCase) {
        input = preserveCamelCase(input, toLowerCase, toUpperCase);
      }
      input = input.replace(LEADING_SEPARATORS, "");
      if (options.preserveConsecutiveUppercase) {
        input = preserveConsecutiveUppercase(input, toLowerCase);
      } else {
        input = toLowerCase(input);
      }
      if (options.pascalCase) {
        input = toUpperCase(input.charAt(0)) + input.slice(1);
      }
      return postProcess(input, toUpperCase);
    };
    module2.exports = camelCase2;
    module2.exports.default = camelCase2;
  }
});

// node_modules/@langchain/core/dist/load/map_keys.js
function keyToJson(key, map) {
  return map?.[key] || (0, import_decamelize.default)(key);
}
function mapKeys(fields, mapper, map) {
  const mapped = {};
  for (const key in fields) {
    if (Object.hasOwn(fields, key)) {
      mapped[mapper(key, map)] = fields[key];
    }
  }
  return mapped;
}
var import_decamelize, import_camelcase;
var init_map_keys = __esm({
  "node_modules/@langchain/core/dist/load/map_keys.js"() {
    import_decamelize = __toESM(require_decamelize(), 1);
    import_camelcase = __toESM(require_camelcase(), 1);
  }
});

// node_modules/@langchain/core/dist/load/validation.js
function needsEscaping(obj) {
  return "lc" in obj || Object.keys(obj).length === 1 && LC_ESCAPED_KEY in obj;
}
function escapeObject(obj) {
  return { [LC_ESCAPED_KEY]: obj };
}
function isSerializableLike(obj) {
  return obj !== null && typeof obj === "object" && "lc_serializable" in obj && typeof obj.toJSON === "function";
}
function escapeIfNeeded(value) {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    if (isSerializableLike(value)) {
      return value;
    }
    const record = value;
    if (needsEscaping(record)) {
      return escapeObject(record);
    }
    const result = {};
    for (const [key, val] of Object.entries(record)) {
      result[key] = escapeIfNeeded(val);
    }
    return result;
  }
  if (Array.isArray(value)) {
    return value.map((item) => escapeIfNeeded(item));
  }
  return value;
}
var LC_ESCAPED_KEY;
var init_validation = __esm({
  "node_modules/@langchain/core/dist/load/validation.js"() {
    LC_ESCAPED_KEY = "__lc_escaped__";
  }
});

// node_modules/@langchain/core/dist/load/serializable.js
function shallowCopy(obj) {
  return Array.isArray(obj) ? [...obj] : { ...obj };
}
function replaceSecrets(root2, secretsMap) {
  const result = shallowCopy(root2);
  for (const [path2, secretId] of Object.entries(secretsMap)) {
    const [last, ...partsReverse] = path2.split(".").reverse();
    let current = result;
    for (const part of partsReverse.reverse()) {
      if (current[part] === void 0) {
        break;
      }
      current[part] = shallowCopy(current[part]);
      current = current[part];
    }
    if (current[last] !== void 0) {
      current[last] = {
        lc: 1,
        type: "secret",
        id: [secretId]
      };
    }
  }
  return result;
}
function get_lc_unique_name(serializableClass) {
  const parentClass = Object.getPrototypeOf(serializableClass);
  const lcNameIsSubclassed = typeof serializableClass.lc_name === "function" && (typeof parentClass.lc_name !== "function" || serializableClass.lc_name() !== parentClass.lc_name());
  if (lcNameIsSubclassed) {
    return serializableClass.lc_name();
  } else {
    return serializableClass.name;
  }
}
var Serializable;
var init_serializable = __esm({
  "node_modules/@langchain/core/dist/load/serializable.js"() {
    init_map_keys();
    init_validation();
    Serializable = class _Serializable {
      /**
       * The name of the serializable. Override to provide an alias or
       * to preserve the serialized module name in minified environments.
       *
       * Implemented as a static method to support loading logic.
       */
      static lc_name() {
        return this.name;
      }
      /**
       * The final serialized identifier for the module.
       */
      get lc_id() {
        return [
          ...this.lc_namespace,
          get_lc_unique_name(this.constructor)
        ];
      }
      /**
       * A map of secrets, which will be omitted from serialization.
       * Keys are paths to the secret in constructor args, e.g. "foo.bar.baz".
       * Values are the secret ids, which will be used when deserializing.
       */
      get lc_secrets() {
        return void 0;
      }
      /**
       * A map of additional attributes to merge with constructor args.
       * Keys are the attribute names, e.g. "foo".
       * Values are the attribute values, which will be serialized.
       * These attributes need to be accepted by the constructor as arguments.
       */
      get lc_attributes() {
        return void 0;
      }
      /**
       * A map of aliases for constructor args.
       * Keys are the attribute names, e.g. "foo".
       * Values are the alias that will replace the key in serialization.
       * This is used to eg. make argument names match Python.
       */
      get lc_aliases() {
        return void 0;
      }
      /**
       * A manual list of keys that should be serialized.
       * If not overridden, all fields passed into the constructor will be serialized.
       */
      get lc_serializable_keys() {
        return void 0;
      }
      constructor(kwargs, ..._args) {
        Object.defineProperty(this, "lc_serializable", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: false
        });
        Object.defineProperty(this, "lc_kwargs", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        if (this.lc_serializable_keys !== void 0) {
          this.lc_kwargs = Object.fromEntries(Object.entries(kwargs || {}).filter(([key]) => this.lc_serializable_keys?.includes(key)));
        } else {
          this.lc_kwargs = kwargs ?? {};
        }
      }
      toJSON() {
        if (!this.lc_serializable) {
          return this.toJSONNotImplemented();
        }
        if (
          // eslint-disable-next-line no-instanceof/no-instanceof
          this.lc_kwargs instanceof _Serializable || typeof this.lc_kwargs !== "object" || Array.isArray(this.lc_kwargs)
        ) {
          return this.toJSONNotImplemented();
        }
        const aliases = {};
        const secrets = {};
        const kwargs = Object.keys(this.lc_kwargs).reduce((acc, key) => {
          acc[key] = key in this ? this[key] : this.lc_kwargs[key];
          return acc;
        }, {});
        for (let current = Object.getPrototypeOf(this); current; current = Object.getPrototypeOf(current)) {
          Object.assign(aliases, Reflect.get(current, "lc_aliases", this));
          Object.assign(secrets, Reflect.get(current, "lc_secrets", this));
          Object.assign(kwargs, Reflect.get(current, "lc_attributes", this));
        }
        Object.keys(secrets).forEach((keyPath) => {
          let read = this;
          let write = kwargs;
          const [last, ...partsReverse] = keyPath.split(".").reverse();
          for (const key of partsReverse.reverse()) {
            if (!(key in read) || read[key] === void 0)
              return;
            if (!(key in write) || write[key] === void 0) {
              if (typeof read[key] === "object" && read[key] != null) {
                write[key] = {};
              } else if (Array.isArray(read[key])) {
                write[key] = [];
              }
            }
            read = read[key];
            write = write[key];
          }
          if (last in read && read[last] !== void 0) {
            write[last] = write[last] || read[last];
          }
        });
        const escapedKwargs = {};
        for (const [key, value] of Object.entries(kwargs)) {
          escapedKwargs[key] = escapeIfNeeded(value);
        }
        const kwargsWithSecrets = Object.keys(secrets).length ? replaceSecrets(escapedKwargs, secrets) : escapedKwargs;
        const processedKwargs = mapKeys(kwargsWithSecrets, keyToJson, aliases);
        return {
          lc: 1,
          type: "constructor",
          id: this.lc_id,
          kwargs: processedKwargs
        };
      }
      toJSONNotImplemented() {
        return {
          lc: 1,
          type: "not_implemented",
          id: this.lc_id
        };
      }
    };
  }
});

// node_modules/@langchain/core/dist/utils/env.js
function getRuntimeEnvironmentSync() {
  if (runtimeEnvironment2 === void 0) {
    const env2 = getEnv2();
    runtimeEnvironment2 = {
      library: "langchain-js",
      runtime: env2
    };
  }
  return runtimeEnvironment2;
}
function getEnvironmentVariable2(name) {
  try {
    if (typeof process !== "undefined") {
      return process.env?.[name];
    } else if (isDeno2()) {
      return Deno?.env.get(name);
    } else {
      return void 0;
    }
  } catch (e) {
    return void 0;
  }
}
var isBrowser2, isWebWorker2, isJsDom2, isDeno2, isNode2, getEnv2, runtimeEnvironment2;
var init_env3 = __esm({
  "node_modules/@langchain/core/dist/utils/env.js"() {
    isBrowser2 = () => typeof window !== "undefined" && typeof window.document !== "undefined";
    isWebWorker2 = () => typeof globalThis === "object" && globalThis.constructor && globalThis.constructor.name === "DedicatedWorkerGlobalScope";
    isJsDom2 = () => typeof window !== "undefined" && window.name === "nodejs" || typeof navigator !== "undefined" && navigator.userAgent.includes("jsdom");
    isDeno2 = () => typeof Deno !== "undefined";
    isNode2 = () => typeof process !== "undefined" && typeof process.versions !== "undefined" && typeof process.versions.node !== "undefined" && !isDeno2();
    getEnv2 = () => {
      let env2;
      if (isBrowser2()) {
        env2 = "browser";
      } else if (isNode2()) {
        env2 = "node";
      } else if (isWebWorker2()) {
        env2 = "webworker";
      } else if (isJsDom2()) {
        env2 = "jsdom";
      } else if (isDeno2()) {
        env2 = "deno";
      } else {
        env2 = "other";
      }
      return env2;
    };
  }
});

// node_modules/@langchain/core/dist/callbacks/base.js
var BaseCallbackHandlerMethodsClass, BaseCallbackHandler, isBaseCallbackHandler;
var init_base = __esm({
  "node_modules/@langchain/core/dist/callbacks/base.js"() {
    init_esm_node();
    init_serializable();
    init_env3();
    BaseCallbackHandlerMethodsClass = class {
    };
    BaseCallbackHandler = class _BaseCallbackHandler extends BaseCallbackHandlerMethodsClass {
      get lc_namespace() {
        return ["langchain_core", "callbacks", this.name];
      }
      get lc_secrets() {
        return void 0;
      }
      get lc_attributes() {
        return void 0;
      }
      get lc_aliases() {
        return void 0;
      }
      get lc_serializable_keys() {
        return void 0;
      }
      /**
       * The name of the serializable. Override to provide an alias or
       * to preserve the serialized module name in minified environments.
       *
       * Implemented as a static method to support loading logic.
       */
      static lc_name() {
        return this.name;
      }
      /**
       * The final serialized identifier for the module.
       */
      get lc_id() {
        return [
          ...this.lc_namespace,
          get_lc_unique_name(this.constructor)
        ];
      }
      constructor(input) {
        super();
        Object.defineProperty(this, "lc_serializable", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: false
        });
        Object.defineProperty(this, "lc_kwargs", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "ignoreLLM", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: false
        });
        Object.defineProperty(this, "ignoreChain", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: false
        });
        Object.defineProperty(this, "ignoreAgent", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: false
        });
        Object.defineProperty(this, "ignoreRetriever", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: false
        });
        Object.defineProperty(this, "ignoreCustomEvent", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: false
        });
        Object.defineProperty(this, "raiseError", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: false
        });
        Object.defineProperty(this, "awaitHandlers", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: getEnvironmentVariable2("LANGCHAIN_CALLBACKS_BACKGROUND") === "false"
        });
        this.lc_kwargs = input || {};
        if (input) {
          this.ignoreLLM = input.ignoreLLM ?? this.ignoreLLM;
          this.ignoreChain = input.ignoreChain ?? this.ignoreChain;
          this.ignoreAgent = input.ignoreAgent ?? this.ignoreAgent;
          this.ignoreRetriever = input.ignoreRetriever ?? this.ignoreRetriever;
          this.ignoreCustomEvent = input.ignoreCustomEvent ?? this.ignoreCustomEvent;
          this.raiseError = input.raiseError ?? this.raiseError;
          this.awaitHandlers = this.raiseError || (input._awaitHandler ?? this.awaitHandlers);
        }
      }
      copy() {
        return new this.constructor(this);
      }
      toJSON() {
        return Serializable.prototype.toJSON.call(this);
      }
      toJSONNotImplemented() {
        return Serializable.prototype.toJSONNotImplemented.call(this);
      }
      static fromMethods(methods) {
        class Handler extends _BaseCallbackHandler {
          constructor() {
            super();
            Object.defineProperty(this, "name", {
              enumerable: true,
              configurable: true,
              writable: true,
              value: v4_default()
            });
            Object.assign(this, methods);
          }
        }
        return new Handler();
      }
    };
    isBaseCallbackHandler = (x) => {
      const callbackHandler = x;
      return callbackHandler !== void 0 && typeof callbackHandler.copy === "function" && typeof callbackHandler.name === "string" && typeof callbackHandler.awaitHandlers === "boolean";
    };
  }
});

// node_modules/@langchain/core/dist/tracers/base.js
function convertRunToRunTree(run, parentRun) {
  if (!run) {
    return void 0;
  }
  return new RunTree({
    ...run,
    start_time: run._serialized_start_time ?? run.start_time,
    parent_run: convertRunToRunTree(parentRun),
    child_runs: run.child_runs.map((r) => convertRunToRunTree(r)).filter((r) => r !== void 0),
    extra: {
      ...run.extra,
      runtime: getRuntimeEnvironmentSync()
    },
    tracingEnabled: false
  });
}
function _coerceToDict(value, defaultKey) {
  return value && !Array.isArray(value) && typeof value === "object" ? value : { [defaultKey]: value };
}
function isBaseTracer(x) {
  return typeof x._addRunToRunMap === "function";
}
var convertRunTreeToRun, BaseTracer;
var init_base2 = __esm({
  "node_modules/@langchain/core/dist/tracers/base.js"() {
    init_run_trees2();
    init_base();
    init_env3();
    convertRunTreeToRun = (runTree) => {
      if (!runTree) {
        return void 0;
      }
      runTree.events = runTree.events ?? [];
      runTree.child_runs = runTree.child_runs ?? [];
      return runTree;
    };
    BaseTracer = class extends BaseCallbackHandler {
      constructor(_fields) {
        super(...arguments);
        Object.defineProperty(this, "runMap", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: /* @__PURE__ */ new Map()
        });
        Object.defineProperty(this, "runTreeMap", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: /* @__PURE__ */ new Map()
        });
        Object.defineProperty(this, "usesRunTreeMap", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: false
        });
      }
      copy() {
        return this;
      }
      getRunById(runId) {
        if (runId === void 0) {
          return void 0;
        }
        return this.usesRunTreeMap ? convertRunTreeToRun(this.runTreeMap.get(runId)) : this.runMap.get(runId);
      }
      stringifyError(error) {
        if (error instanceof Error) {
          return error.message + (error?.stack ? `

${error.stack}` : "");
        }
        if (typeof error === "string") {
          return error;
        }
        return `${error}`;
      }
      _addChildRun(parentRun, childRun) {
        parentRun.child_runs.push(childRun);
      }
      _addRunToRunMap(run) {
        const { dottedOrder: currentDottedOrder, microsecondPrecisionDatestring } = convertToDottedOrderFormat(new Date(run.start_time).getTime(), run.id, run.execution_order);
        const storedRun = { ...run };
        const parentRun = this.getRunById(storedRun.parent_run_id);
        if (storedRun.parent_run_id !== void 0) {
          if (parentRun) {
            this._addChildRun(parentRun, storedRun);
            parentRun.child_execution_order = Math.max(parentRun.child_execution_order, storedRun.child_execution_order);
            storedRun.trace_id = parentRun.trace_id;
            if (parentRun.dotted_order !== void 0) {
              storedRun.dotted_order = [
                parentRun.dotted_order,
                currentDottedOrder
              ].join(".");
              storedRun._serialized_start_time = microsecondPrecisionDatestring;
            } else {
            }
          } else {
          }
        } else {
          storedRun.trace_id = storedRun.id;
          storedRun.dotted_order = currentDottedOrder;
          storedRun._serialized_start_time = microsecondPrecisionDatestring;
        }
        if (this.usesRunTreeMap) {
          const runTree = convertRunToRunTree(storedRun, parentRun);
          if (runTree !== void 0) {
            this.runTreeMap.set(storedRun.id, runTree);
          }
        } else {
          this.runMap.set(storedRun.id, storedRun);
        }
        return storedRun;
      }
      async _endTrace(run) {
        const parentRun = run.parent_run_id !== void 0 && this.getRunById(run.parent_run_id);
        if (parentRun) {
          parentRun.child_execution_order = Math.max(parentRun.child_execution_order, run.child_execution_order);
        } else {
          await this.persistRun(run);
        }
        await this.onRunUpdate?.(run);
        if (this.usesRunTreeMap) {
          this.runTreeMap.delete(run.id);
        } else {
          this.runMap.delete(run.id);
        }
      }
      _getExecutionOrder(parentRunId) {
        const parentRun = parentRunId !== void 0 && this.getRunById(parentRunId);
        if (!parentRun) {
          return 1;
        }
        return parentRun.child_execution_order + 1;
      }
      /**
       * Create and add a run to the run map for LLM start events.
       * This must sometimes be done synchronously to avoid race conditions
       * when callbacks are backgrounded, so we expose it as a separate method here.
       */
      _createRunForLLMStart(llm, prompts, runId, parentRunId, extraParams, tags, metadata, name) {
        const execution_order = this._getExecutionOrder(parentRunId);
        const start_time = Date.now();
        const finalExtraParams = metadata ? { ...extraParams, metadata } : extraParams;
        const run = {
          id: runId,
          name: name ?? llm.id[llm.id.length - 1],
          parent_run_id: parentRunId,
          start_time,
          serialized: llm,
          events: [
            {
              name: "start",
              time: new Date(start_time).toISOString()
            }
          ],
          inputs: { prompts },
          execution_order,
          child_runs: [],
          child_execution_order: execution_order,
          run_type: "llm",
          extra: finalExtraParams ?? {},
          tags: tags || []
        };
        return this._addRunToRunMap(run);
      }
      async handleLLMStart(llm, prompts, runId, parentRunId, extraParams, tags, metadata, name) {
        const run = this.getRunById(runId) ?? this._createRunForLLMStart(llm, prompts, runId, parentRunId, extraParams, tags, metadata, name);
        await this.onRunCreate?.(run);
        await this.onLLMStart?.(run);
        return run;
      }
      /**
       * Create and add a run to the run map for chat model start events.
       * This must sometimes be done synchronously to avoid race conditions
       * when callbacks are backgrounded, so we expose it as a separate method here.
       */
      _createRunForChatModelStart(llm, messages, runId, parentRunId, extraParams, tags, metadata, name) {
        const execution_order = this._getExecutionOrder(parentRunId);
        const start_time = Date.now();
        const finalExtraParams = metadata ? { ...extraParams, metadata } : extraParams;
        const run = {
          id: runId,
          name: name ?? llm.id[llm.id.length - 1],
          parent_run_id: parentRunId,
          start_time,
          serialized: llm,
          events: [
            {
              name: "start",
              time: new Date(start_time).toISOString()
            }
          ],
          inputs: { messages },
          execution_order,
          child_runs: [],
          child_execution_order: execution_order,
          run_type: "llm",
          extra: finalExtraParams ?? {},
          tags: tags || []
        };
        return this._addRunToRunMap(run);
      }
      async handleChatModelStart(llm, messages, runId, parentRunId, extraParams, tags, metadata, name) {
        const run = this.getRunById(runId) ?? this._createRunForChatModelStart(llm, messages, runId, parentRunId, extraParams, tags, metadata, name);
        await this.onRunCreate?.(run);
        await this.onLLMStart?.(run);
        return run;
      }
      async handleLLMEnd(output, runId, _parentRunId, _tags, extraParams) {
        const run = this.getRunById(runId);
        if (!run || run?.run_type !== "llm") {
          throw new Error("No LLM run to end.");
        }
        run.end_time = Date.now();
        run.outputs = output;
        run.events.push({
          name: "end",
          time: new Date(run.end_time).toISOString()
        });
        run.extra = { ...run.extra, ...extraParams };
        await this.onLLMEnd?.(run);
        await this._endTrace(run);
        return run;
      }
      async handleLLMError(error, runId, _parentRunId, _tags, extraParams) {
        const run = this.getRunById(runId);
        if (!run || run?.run_type !== "llm") {
          throw new Error("No LLM run to end.");
        }
        run.end_time = Date.now();
        run.error = this.stringifyError(error);
        run.events.push({
          name: "error",
          time: new Date(run.end_time).toISOString()
        });
        run.extra = { ...run.extra, ...extraParams };
        await this.onLLMError?.(run);
        await this._endTrace(run);
        return run;
      }
      /**
       * Create and add a run to the run map for chain start events.
       * This must sometimes be done synchronously to avoid race conditions
       * when callbacks are backgrounded, so we expose it as a separate method here.
       */
      _createRunForChainStart(chain, inputs, runId, parentRunId, tags, metadata, runType, name) {
        const execution_order = this._getExecutionOrder(parentRunId);
        const start_time = Date.now();
        const run = {
          id: runId,
          name: name ?? chain.id[chain.id.length - 1],
          parent_run_id: parentRunId,
          start_time,
          serialized: chain,
          events: [
            {
              name: "start",
              time: new Date(start_time).toISOString()
            }
          ],
          inputs,
          execution_order,
          child_execution_order: execution_order,
          run_type: runType ?? "chain",
          child_runs: [],
          extra: metadata ? { metadata } : {},
          tags: tags || []
        };
        return this._addRunToRunMap(run);
      }
      async handleChainStart(chain, inputs, runId, parentRunId, tags, metadata, runType, name) {
        const run = this.getRunById(runId) ?? this._createRunForChainStart(chain, inputs, runId, parentRunId, tags, metadata, runType, name);
        await this.onRunCreate?.(run);
        await this.onChainStart?.(run);
        return run;
      }
      async handleChainEnd(outputs, runId, _parentRunId, _tags, kwargs) {
        const run = this.getRunById(runId);
        if (!run) {
          throw new Error("No chain run to end.");
        }
        run.end_time = Date.now();
        run.outputs = _coerceToDict(outputs, "output");
        run.events.push({
          name: "end",
          time: new Date(run.end_time).toISOString()
        });
        if (kwargs?.inputs !== void 0) {
          run.inputs = _coerceToDict(kwargs.inputs, "input");
        }
        await this.onChainEnd?.(run);
        await this._endTrace(run);
        return run;
      }
      async handleChainError(error, runId, _parentRunId, _tags, kwargs) {
        const run = this.getRunById(runId);
        if (!run) {
          throw new Error("No chain run to end.");
        }
        run.end_time = Date.now();
        run.error = this.stringifyError(error);
        run.events.push({
          name: "error",
          time: new Date(run.end_time).toISOString()
        });
        if (kwargs?.inputs !== void 0) {
          run.inputs = _coerceToDict(kwargs.inputs, "input");
        }
        await this.onChainError?.(run);
        await this._endTrace(run);
        return run;
      }
      /**
       * Create and add a run to the run map for tool start events.
       * This must sometimes be done synchronously to avoid race conditions
       * when callbacks are backgrounded, so we expose it as a separate method here.
       */
      _createRunForToolStart(tool, input, runId, parentRunId, tags, metadata, name) {
        const execution_order = this._getExecutionOrder(parentRunId);
        const start_time = Date.now();
        const run = {
          id: runId,
          name: name ?? tool.id[tool.id.length - 1],
          parent_run_id: parentRunId,
          start_time,
          serialized: tool,
          events: [
            {
              name: "start",
              time: new Date(start_time).toISOString()
            }
          ],
          inputs: { input },
          execution_order,
          child_execution_order: execution_order,
          run_type: "tool",
          child_runs: [],
          extra: metadata ? { metadata } : {},
          tags: tags || []
        };
        return this._addRunToRunMap(run);
      }
      async handleToolStart(tool, input, runId, parentRunId, tags, metadata, name) {
        const run = this.getRunById(runId) ?? this._createRunForToolStart(tool, input, runId, parentRunId, tags, metadata, name);
        await this.onRunCreate?.(run);
        await this.onToolStart?.(run);
        return run;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async handleToolEnd(output, runId) {
        const run = this.getRunById(runId);
        if (!run || run?.run_type !== "tool") {
          throw new Error("No tool run to end");
        }
        run.end_time = Date.now();
        run.outputs = { output };
        run.events.push({
          name: "end",
          time: new Date(run.end_time).toISOString()
        });
        await this.onToolEnd?.(run);
        await this._endTrace(run);
        return run;
      }
      async handleToolError(error, runId) {
        const run = this.getRunById(runId);
        if (!run || run?.run_type !== "tool") {
          throw new Error("No tool run to end");
        }
        run.end_time = Date.now();
        run.error = this.stringifyError(error);
        run.events.push({
          name: "error",
          time: new Date(run.end_time).toISOString()
        });
        await this.onToolError?.(run);
        await this._endTrace(run);
        return run;
      }
      async handleAgentAction(action, runId) {
        const run = this.getRunById(runId);
        if (!run || run?.run_type !== "chain") {
          return;
        }
        const agentRun = run;
        agentRun.actions = agentRun.actions || [];
        agentRun.actions.push(action);
        agentRun.events.push({
          name: "agent_action",
          time: (/* @__PURE__ */ new Date()).toISOString(),
          kwargs: { action }
        });
        await this.onAgentAction?.(run);
      }
      async handleAgentEnd(action, runId) {
        const run = this.getRunById(runId);
        if (!run || run?.run_type !== "chain") {
          return;
        }
        run.events.push({
          name: "agent_end",
          time: (/* @__PURE__ */ new Date()).toISOString(),
          kwargs: { action }
        });
        await this.onAgentEnd?.(run);
      }
      /**
       * Create and add a run to the run map for retriever start events.
       * This must sometimes be done synchronously to avoid race conditions
       * when callbacks are backgrounded, so we expose it as a separate method here.
       */
      _createRunForRetrieverStart(retriever, query, runId, parentRunId, tags, metadata, name) {
        const execution_order = this._getExecutionOrder(parentRunId);
        const start_time = Date.now();
        const run = {
          id: runId,
          name: name ?? retriever.id[retriever.id.length - 1],
          parent_run_id: parentRunId,
          start_time,
          serialized: retriever,
          events: [
            {
              name: "start",
              time: new Date(start_time).toISOString()
            }
          ],
          inputs: { query },
          execution_order,
          child_execution_order: execution_order,
          run_type: "retriever",
          child_runs: [],
          extra: metadata ? { metadata } : {},
          tags: tags || []
        };
        return this._addRunToRunMap(run);
      }
      async handleRetrieverStart(retriever, query, runId, parentRunId, tags, metadata, name) {
        const run = this.getRunById(runId) ?? this._createRunForRetrieverStart(retriever, query, runId, parentRunId, tags, metadata, name);
        await this.onRunCreate?.(run);
        await this.onRetrieverStart?.(run);
        return run;
      }
      async handleRetrieverEnd(documents, runId) {
        const run = this.getRunById(runId);
        if (!run || run?.run_type !== "retriever") {
          throw new Error("No retriever run to end");
        }
        run.end_time = Date.now();
        run.outputs = { documents };
        run.events.push({
          name: "end",
          time: new Date(run.end_time).toISOString()
        });
        await this.onRetrieverEnd?.(run);
        await this._endTrace(run);
        return run;
      }
      async handleRetrieverError(error, runId) {
        const run = this.getRunById(runId);
        if (!run || run?.run_type !== "retriever") {
          throw new Error("No retriever run to end");
        }
        run.end_time = Date.now();
        run.error = this.stringifyError(error);
        run.events.push({
          name: "error",
          time: new Date(run.end_time).toISOString()
        });
        await this.onRetrieverError?.(run);
        await this._endTrace(run);
        return run;
      }
      async handleText(text, runId) {
        const run = this.getRunById(runId);
        if (!run || run?.run_type !== "chain") {
          return;
        }
        run.events.push({
          name: "text",
          time: (/* @__PURE__ */ new Date()).toISOString(),
          kwargs: { text }
        });
        await this.onText?.(run);
      }
      async handleLLMNewToken(token, idx, runId, _parentRunId, _tags, fields) {
        const run = this.getRunById(runId);
        if (!run || run?.run_type !== "llm") {
          throw new Error(`Invalid "runId" provided to "handleLLMNewToken" callback.`);
        }
        run.events.push({
          name: "new_token",
          time: (/* @__PURE__ */ new Date()).toISOString(),
          kwargs: { token, idx, chunk: fields?.chunk }
        });
        await this.onLLMNewToken?.(run, token, { chunk: fields?.chunk });
        return run;
      }
    };
  }
});

// node_modules/ansi-styles/index.js
var require_ansi_styles = __commonJS({
  "node_modules/ansi-styles/index.js"(exports2, module2) {
    "use strict";
    var ANSI_BACKGROUND_OFFSET = 10;
    var wrapAnsi256 = (offset = 0) => (code) => `\x1B[${38 + offset};5;${code}m`;
    var wrapAnsi16m = (offset = 0) => (red, green, blue) => `\x1B[${38 + offset};2;${red};${green};${blue}m`;
    function assembleStyles() {
      const codes = /* @__PURE__ */ new Map();
      const styles2 = {
        modifier: {
          reset: [0, 0],
          // 21 isn't widely supported and 22 does the same thing
          bold: [1, 22],
          dim: [2, 22],
          italic: [3, 23],
          underline: [4, 24],
          overline: [53, 55],
          inverse: [7, 27],
          hidden: [8, 28],
          strikethrough: [9, 29]
        },
        color: {
          black: [30, 39],
          red: [31, 39],
          green: [32, 39],
          yellow: [33, 39],
          blue: [34, 39],
          magenta: [35, 39],
          cyan: [36, 39],
          white: [37, 39],
          // Bright color
          blackBright: [90, 39],
          redBright: [91, 39],
          greenBright: [92, 39],
          yellowBright: [93, 39],
          blueBright: [94, 39],
          magentaBright: [95, 39],
          cyanBright: [96, 39],
          whiteBright: [97, 39]
        },
        bgColor: {
          bgBlack: [40, 49],
          bgRed: [41, 49],
          bgGreen: [42, 49],
          bgYellow: [43, 49],
          bgBlue: [44, 49],
          bgMagenta: [45, 49],
          bgCyan: [46, 49],
          bgWhite: [47, 49],
          // Bright color
          bgBlackBright: [100, 49],
          bgRedBright: [101, 49],
          bgGreenBright: [102, 49],
          bgYellowBright: [103, 49],
          bgBlueBright: [104, 49],
          bgMagentaBright: [105, 49],
          bgCyanBright: [106, 49],
          bgWhiteBright: [107, 49]
        }
      };
      styles2.color.gray = styles2.color.blackBright;
      styles2.bgColor.bgGray = styles2.bgColor.bgBlackBright;
      styles2.color.grey = styles2.color.blackBright;
      styles2.bgColor.bgGrey = styles2.bgColor.bgBlackBright;
      for (const [groupName, group] of Object.entries(styles2)) {
        for (const [styleName, style] of Object.entries(group)) {
          styles2[styleName] = {
            open: `\x1B[${style[0]}m`,
            close: `\x1B[${style[1]}m`
          };
          group[styleName] = styles2[styleName];
          codes.set(style[0], style[1]);
        }
        Object.defineProperty(styles2, groupName, {
          value: group,
          enumerable: false
        });
      }
      Object.defineProperty(styles2, "codes", {
        value: codes,
        enumerable: false
      });
      styles2.color.close = "\x1B[39m";
      styles2.bgColor.close = "\x1B[49m";
      styles2.color.ansi256 = wrapAnsi256();
      styles2.color.ansi16m = wrapAnsi16m();
      styles2.bgColor.ansi256 = wrapAnsi256(ANSI_BACKGROUND_OFFSET);
      styles2.bgColor.ansi16m = wrapAnsi16m(ANSI_BACKGROUND_OFFSET);
      Object.defineProperties(styles2, {
        rgbToAnsi256: {
          value: (red, green, blue) => {
            if (red === green && green === blue) {
              if (red < 8) {
                return 16;
              }
              if (red > 248) {
                return 231;
              }
              return Math.round((red - 8) / 247 * 24) + 232;
            }
            return 16 + 36 * Math.round(red / 255 * 5) + 6 * Math.round(green / 255 * 5) + Math.round(blue / 255 * 5);
          },
          enumerable: false
        },
        hexToRgb: {
          value: (hex) => {
            const matches = /(?<colorString>[a-f\d]{6}|[a-f\d]{3})/i.exec(hex.toString(16));
            if (!matches) {
              return [0, 0, 0];
            }
            let { colorString } = matches.groups;
            if (colorString.length === 3) {
              colorString = colorString.split("").map((character) => character + character).join("");
            }
            const integer = Number.parseInt(colorString, 16);
            return [
              integer >> 16 & 255,
              integer >> 8 & 255,
              integer & 255
            ];
          },
          enumerable: false
        },
        hexToAnsi256: {
          value: (hex) => styles2.rgbToAnsi256(...styles2.hexToRgb(hex)),
          enumerable: false
        }
      });
      return styles2;
    }
    Object.defineProperty(module2, "exports", {
      enumerable: true,
      get: assembleStyles
    });
  }
});

// node_modules/@langchain/core/dist/tracers/console.js
function wrap(style, text) {
  return `${style.open}${text}${style.close}`;
}
function tryJsonStringify(obj, fallback) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (err) {
    return fallback;
  }
}
function formatKVMapItem(value) {
  if (typeof value === "string") {
    return value.trim();
  }
  if (value === null || value === void 0) {
    return value;
  }
  return tryJsonStringify(value, value.toString());
}
function elapsed(run) {
  if (!run.end_time)
    return "";
  const elapsed2 = run.end_time - run.start_time;
  if (elapsed2 < 1e3) {
    return `${elapsed2}ms`;
  }
  return `${(elapsed2 / 1e3).toFixed(2)}s`;
}
var import_ansi_styles, color, ConsoleCallbackHandler;
var init_console = __esm({
  "node_modules/@langchain/core/dist/tracers/console.js"() {
    import_ansi_styles = __toESM(require_ansi_styles(), 1);
    init_base2();
    ({ color } = import_ansi_styles.default);
    ConsoleCallbackHandler = class extends BaseTracer {
      constructor() {
        super(...arguments);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "console_callback_handler"
        });
      }
      /**
       * Method used to persist the run. In this case, it simply returns a
       * resolved promise as there's no persistence logic.
       * @param _run The run to persist.
       * @returns A resolved promise.
       */
      persistRun(_run) {
        return Promise.resolve();
      }
      // utility methods
      /**
       * Method used to get all the parent runs of a given run.
       * @param run The run whose parents are to be retrieved.
       * @returns An array of parent runs.
       */
      getParents(run) {
        const parents = [];
        let currentRun = run;
        while (currentRun.parent_run_id) {
          const parent = this.runMap.get(currentRun.parent_run_id);
          if (parent) {
            parents.push(parent);
            currentRun = parent;
          } else {
            break;
          }
        }
        return parents;
      }
      /**
       * Method used to get a string representation of the run's lineage, which
       * is used in logging.
       * @param run The run whose lineage is to be retrieved.
       * @returns A string representation of the run's lineage.
       */
      getBreadcrumbs(run) {
        const parents = this.getParents(run).reverse();
        const string = [...parents, run].map((parent, i, arr2) => {
          const name = `${parent.execution_order}:${parent.run_type}:${parent.name}`;
          return i === arr2.length - 1 ? wrap(import_ansi_styles.default.bold, name) : name;
        }).join(" > ");
        return wrap(color.grey, string);
      }
      // logging methods
      /**
       * Method used to log the start of a chain run.
       * @param run The chain run that has started.
       * @returns void
       */
      onChainStart(run) {
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.green, "[chain/start]")} [${crumbs}] Entering Chain run with input: ${tryJsonStringify(run.inputs, "[inputs]")}`);
      }
      /**
       * Method used to log the end of a chain run.
       * @param run The chain run that has ended.
       * @returns void
       */
      onChainEnd(run) {
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.cyan, "[chain/end]")} [${crumbs}] [${elapsed(run)}] Exiting Chain run with output: ${tryJsonStringify(run.outputs, "[outputs]")}`);
      }
      /**
       * Method used to log any errors of a chain run.
       * @param run The chain run that has errored.
       * @returns void
       */
      onChainError(run) {
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.red, "[chain/error]")} [${crumbs}] [${elapsed(run)}] Chain run errored with error: ${tryJsonStringify(run.error, "[error]")}`);
      }
      /**
       * Method used to log the start of an LLM run.
       * @param run The LLM run that has started.
       * @returns void
       */
      onLLMStart(run) {
        const crumbs = this.getBreadcrumbs(run);
        const inputs = "prompts" in run.inputs ? { prompts: run.inputs.prompts.map((p) => p.trim()) } : run.inputs;
        console.log(`${wrap(color.green, "[llm/start]")} [${crumbs}] Entering LLM run with input: ${tryJsonStringify(inputs, "[inputs]")}`);
      }
      /**
       * Method used to log the end of an LLM run.
       * @param run The LLM run that has ended.
       * @returns void
       */
      onLLMEnd(run) {
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.cyan, "[llm/end]")} [${crumbs}] [${elapsed(run)}] Exiting LLM run with output: ${tryJsonStringify(run.outputs, "[response]")}`);
      }
      /**
       * Method used to log any errors of an LLM run.
       * @param run The LLM run that has errored.
       * @returns void
       */
      onLLMError(run) {
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.red, "[llm/error]")} [${crumbs}] [${elapsed(run)}] LLM run errored with error: ${tryJsonStringify(run.error, "[error]")}`);
      }
      /**
       * Method used to log the start of a tool run.
       * @param run The tool run that has started.
       * @returns void
       */
      onToolStart(run) {
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.green, "[tool/start]")} [${crumbs}] Entering Tool run with input: "${formatKVMapItem(run.inputs.input)}"`);
      }
      /**
       * Method used to log the end of a tool run.
       * @param run The tool run that has ended.
       * @returns void
       */
      onToolEnd(run) {
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.cyan, "[tool/end]")} [${crumbs}] [${elapsed(run)}] Exiting Tool run with output: "${formatKVMapItem(run.outputs?.output)}"`);
      }
      /**
       * Method used to log any errors of a tool run.
       * @param run The tool run that has errored.
       * @returns void
       */
      onToolError(run) {
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.red, "[tool/error]")} [${crumbs}] [${elapsed(run)}] Tool run errored with error: ${tryJsonStringify(run.error, "[error]")}`);
      }
      /**
       * Method used to log the start of a retriever run.
       * @param run The retriever run that has started.
       * @returns void
       */
      onRetrieverStart(run) {
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.green, "[retriever/start]")} [${crumbs}] Entering Retriever run with input: ${tryJsonStringify(run.inputs, "[inputs]")}`);
      }
      /**
       * Method used to log the end of a retriever run.
       * @param run The retriever run that has ended.
       * @returns void
       */
      onRetrieverEnd(run) {
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.cyan, "[retriever/end]")} [${crumbs}] [${elapsed(run)}] Exiting Retriever run with output: ${tryJsonStringify(run.outputs, "[outputs]")}`);
      }
      /**
       * Method used to log any errors of a retriever run.
       * @param run The retriever run that has errored.
       * @returns void
       */
      onRetrieverError(run) {
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.red, "[retriever/error]")} [${crumbs}] [${elapsed(run)}] Retriever run errored with error: ${tryJsonStringify(run.error, "[error]")}`);
      }
      /**
       * Method used to log the action selected by the agent.
       * @param run The run in which the agent action occurred.
       * @returns void
       */
      onAgentAction(run) {
        const agentRun = run;
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.blue, "[agent/action]")} [${crumbs}] Agent selected action: ${tryJsonStringify(agentRun.actions[agentRun.actions.length - 1], "[action]")}`);
      }
    };
  }
});

// node_modules/@langchain/core/dist/errors/index.js
function addLangChainErrorFields(error, lc_error_code) {
  error.lc_error_code = lc_error_code;
  error.message = `${error.message}

Troubleshooting URL: https://js.langchain.com/docs/troubleshooting/errors/${lc_error_code}/
`;
  return error;
}
var init_errors = __esm({
  "node_modules/@langchain/core/dist/errors/index.js"() {
  }
});

// node_modules/@langchain/core/dist/tools/utils.js
function _isToolCall(toolCall) {
  return !!(toolCall && typeof toolCall === "object" && "type" in toolCall && toolCall.type === "tool_call");
}
function _configHasToolCallId(config) {
  return !!(config && typeof config === "object" && "toolCall" in config && config.toolCall != null && typeof config.toolCall === "object" && "id" in config.toolCall && typeof config.toolCall.id === "string");
}
var ToolInputParsingException;
var init_utils = __esm({
  "node_modules/@langchain/core/dist/tools/utils.js"() {
    ToolInputParsingException = class extends Error {
      constructor(message, output) {
        super(message);
        Object.defineProperty(this, "output", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.output = output;
      }
    };
  }
});

// node_modules/@langchain/core/dist/utils/json.js
function parsePartialJson(s) {
  if (typeof s === "undefined") {
    return null;
  }
  try {
    return JSON.parse(s);
  } catch (error) {
  }
  let new_s = "";
  const stack = [];
  let isInsideString = false;
  let escaped = false;
  for (let char of s) {
    if (isInsideString) {
      if (char === '"' && !escaped) {
        isInsideString = false;
      } else if (char === "\n" && !escaped) {
        char = "\\n";
      } else if (char === "\\") {
        escaped = !escaped;
      } else {
        escaped = false;
      }
    } else {
      if (char === '"') {
        isInsideString = true;
        escaped = false;
      } else if (char === "{") {
        stack.push("}");
      } else if (char === "[") {
        stack.push("]");
      } else if (char === "}" || char === "]") {
        if (stack && stack[stack.length - 1] === char) {
          stack.pop();
        } else {
          return null;
        }
      }
    }
    new_s += char;
  }
  if (isInsideString) {
    new_s += '"';
  }
  for (let i = stack.length - 1; i >= 0; i -= 1) {
    new_s += stack[i];
  }
  try {
    return JSON.parse(new_s);
  } catch (error) {
    return null;
  }
}
var init_json = __esm({
  "node_modules/@langchain/core/dist/utils/json.js"() {
  }
});

// node_modules/@langchain/core/dist/messages/content_blocks.js
function isDataContentBlock(content_block) {
  return typeof content_block === "object" && content_block !== null && "type" in content_block && typeof content_block.type === "string" && "source_type" in content_block && (content_block.source_type === "url" || content_block.source_type === "base64" || content_block.source_type === "text" || content_block.source_type === "id");
}
var init_content_blocks = __esm({
  "node_modules/@langchain/core/dist/messages/content_blocks.js"() {
  }
});

// node_modules/@langchain/core/dist/messages/base.js
function mergeContent(firstContent, secondContent) {
  if (typeof firstContent === "string") {
    if (firstContent === "") {
      return secondContent;
    }
    if (typeof secondContent === "string") {
      return firstContent + secondContent;
    } else if (Array.isArray(secondContent) && secondContent.some((c) => isDataContentBlock(c))) {
      return [
        {
          type: "text",
          source_type: "text",
          text: firstContent
        },
        ...secondContent
      ];
    } else {
      return [{ type: "text", text: firstContent }, ...secondContent];
    }
  } else if (Array.isArray(secondContent)) {
    return _mergeLists(firstContent, secondContent) ?? [
      ...firstContent,
      ...secondContent
    ];
  } else {
    if (secondContent === "") {
      return firstContent;
    } else if (Array.isArray(firstContent) && firstContent.some((c) => isDataContentBlock(c))) {
      return [
        ...firstContent,
        {
          type: "file",
          source_type: "text",
          text: secondContent
        }
      ];
    } else {
      return [...firstContent, { type: "text", text: secondContent }];
    }
  }
}
function stringifyWithDepthLimit(obj, depthLimit) {
  function helper(obj2, currentDepth) {
    if (typeof obj2 !== "object" || obj2 === null || obj2 === void 0) {
      return obj2;
    }
    if (currentDepth >= depthLimit) {
      if (Array.isArray(obj2)) {
        return "[Array]";
      }
      return "[Object]";
    }
    if (Array.isArray(obj2)) {
      return obj2.map((item) => helper(item, currentDepth + 1));
    }
    const result = {};
    for (const key of Object.keys(obj2)) {
      result[key] = helper(obj2[key], currentDepth + 1);
    }
    return result;
  }
  return JSON.stringify(helper(obj, 0), null, 2);
}
function _mergeDicts(left, right) {
  const merged = { ...left };
  for (const [key, value] of Object.entries(right)) {
    if (merged[key] == null) {
      merged[key] = value;
    } else if (value == null) {
      continue;
    } else if (typeof merged[key] !== typeof value || Array.isArray(merged[key]) !== Array.isArray(value)) {
      throw new Error(`field[${key}] already exists in the message chunk, but with a different type.`);
    } else if (typeof merged[key] === "string") {
      if (key === "type") {
        continue;
      } else if (["id", "name", "output_version", "model_provider"].includes(key)) {
        merged[key] = value;
      } else {
        merged[key] += value;
      }
    } else if (typeof merged[key] === "object" && !Array.isArray(merged[key])) {
      merged[key] = _mergeDicts(merged[key], value);
    } else if (Array.isArray(merged[key])) {
      merged[key] = _mergeLists(merged[key], value);
    } else if (merged[key] === value) {
      continue;
    } else {
      console.warn(`field[${key}] already exists in this message chunk and value has unsupported type.`);
    }
  }
  return merged;
}
function _mergeLists(left, right) {
  if (left === void 0 && right === void 0) {
    return void 0;
  } else if (left === void 0 || right === void 0) {
    return left || right;
  } else {
    const merged = [...left];
    for (const item of right) {
      if (typeof item === "object" && item !== null && "index" in item && typeof item.index === "number") {
        const toMerge = merged.findIndex((leftItem) => {
          const isObject = typeof leftItem === "object";
          const indiciesMatch = "index" in leftItem && leftItem.index === item.index;
          const idsMatch = "id" in leftItem && "id" in item && leftItem?.id === item?.id;
          const eitherItemMissingID = !("id" in leftItem) || !leftItem?.id || !("id" in item) || !item?.id;
          return isObject && indiciesMatch && (idsMatch || eitherItemMissingID);
        });
        if (toMerge !== -1 && typeof merged[toMerge] === "object" && merged[toMerge] !== null) {
          merged[toMerge] = _mergeDicts(merged[toMerge], item);
        } else {
          merged.push(item);
        }
      } else if (typeof item === "object" && item !== null && "text" in item && item.text === "") {
        continue;
      } else {
        merged.push(item);
      }
    }
    return merged;
  }
}
function _isMessageFieldWithRole(x) {
  return typeof x.role === "string";
}
function isBaseMessage(messageLike) {
  return typeof messageLike?._getType === "function";
}
var BaseMessage, BaseMessageChunk;
var init_base3 = __esm({
  "node_modules/@langchain/core/dist/messages/base.js"() {
    init_serializable();
    init_content_blocks();
    BaseMessage = class extends Serializable {
      get lc_aliases() {
        return {
          additional_kwargs: "additional_kwargs",
          response_metadata: "response_metadata"
        };
      }
      /**
       * Get text content of the message.
       */
      get text() {
        if (typeof this.content === "string") {
          return this.content;
        }
        if (!Array.isArray(this.content))
          return "";
        return this.content.map((c) => {
          if (typeof c === "string")
            return c;
          if (c.type === "text")
            return c.text;
          return "";
        }).join("");
      }
      /** The type of the message. */
      getType() {
        return this._getType();
      }
      constructor(fields, kwargs) {
        if (typeof fields === "string") {
          fields = {
            content: fields,
            additional_kwargs: kwargs,
            response_metadata: {}
          };
        }
        if (!fields.additional_kwargs) {
          fields.additional_kwargs = {};
        }
        if (!fields.response_metadata) {
          fields.response_metadata = {};
        }
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ["langchain_core", "messages"]
        });
        Object.defineProperty(this, "lc_serializable", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        Object.defineProperty(this, "content", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "additional_kwargs", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "response_metadata", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "id", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.name = fields.name;
        this.content = fields.content;
        this.additional_kwargs = fields.additional_kwargs;
        this.response_metadata = fields.response_metadata;
        this.id = fields.id;
      }
      toDict() {
        return {
          type: this._getType(),
          data: this.toJSON().kwargs
        };
      }
      static lc_name() {
        return "BaseMessage";
      }
      // Can't be protected for silly reasons
      get _printableFields() {
        return {
          id: this.id,
          content: this.content,
          name: this.name,
          additional_kwargs: this.additional_kwargs,
          response_metadata: this.response_metadata
        };
      }
      // this private method is used to update the ID for the runtime
      // value as well as in lc_kwargs for serialisation
      _updateId(value) {
        this.id = value;
        this.lc_kwargs.id = value;
      }
      get [Symbol.toStringTag]() {
        return this.constructor.lc_name();
      }
      // Override the default behavior of console.log
      [/* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom")](depth) {
        if (depth === null) {
          return this;
        }
        const printable = stringifyWithDepthLimit(this._printableFields, Math.max(4, depth));
        return `${this.constructor.lc_name()} ${printable}`;
      }
    };
    BaseMessageChunk = class extends BaseMessage {
    };
  }
});

// node_modules/@langchain/core/dist/messages/tool.js
function isDirectToolOutput(x) {
  return x != null && typeof x === "object" && "lc_direct_tool_output" in x && x.lc_direct_tool_output === true;
}
function defaultToolCallParser(rawToolCalls) {
  const toolCalls = [];
  const invalidToolCalls = [];
  for (const toolCall of rawToolCalls) {
    if (!toolCall.function) {
      continue;
    } else {
      const functionName = toolCall.function.name;
      try {
        const functionArgs = JSON.parse(toolCall.function.arguments);
        const parsed = {
          name: functionName || "",
          args: functionArgs || {},
          id: toolCall.id
        };
        toolCalls.push(parsed);
      } catch (error) {
        invalidToolCalls.push({
          name: functionName,
          args: toolCall.function.arguments,
          id: toolCall.id,
          error: "Malformed args."
        });
      }
    }
  }
  return [toolCalls, invalidToolCalls];
}
var ToolMessage;
var init_tool = __esm({
  "node_modules/@langchain/core/dist/messages/tool.js"() {
    init_base3();
    ToolMessage = class extends BaseMessage {
      static lc_name() {
        return "ToolMessage";
      }
      get lc_aliases() {
        return { tool_call_id: "tool_call_id" };
      }
      constructor(fields, tool_call_id, name) {
        if (typeof fields === "string") {
          fields = { content: fields, name, tool_call_id };
        }
        super(fields);
        Object.defineProperty(this, "lc_direct_tool_output", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        Object.defineProperty(this, "status", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "tool_call_id", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "metadata", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "artifact", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.tool_call_id = fields.tool_call_id;
        this.artifact = fields.artifact;
        this.status = fields.status;
        this.metadata = fields.metadata;
      }
      _getType() {
        return "tool";
      }
      static isInstance(message) {
        return message._getType() === "tool";
      }
      get _printableFields() {
        return {
          ...super._printableFields,
          tool_call_id: this.tool_call_id,
          artifact: this.artifact
        };
      }
    };
  }
});

// node_modules/@langchain/core/dist/messages/ai.js
var AIMessage, AIMessageChunk;
var init_ai = __esm({
  "node_modules/@langchain/core/dist/messages/ai.js"() {
    init_json();
    init_base3();
    init_tool();
    AIMessage = class extends BaseMessage {
      get lc_aliases() {
        return {
          ...super.lc_aliases,
          tool_calls: "tool_calls",
          invalid_tool_calls: "invalid_tool_calls"
        };
      }
      constructor(fields, kwargs) {
        let initParams;
        if (typeof fields === "string") {
          initParams = {
            content: fields,
            tool_calls: [],
            invalid_tool_calls: [],
            additional_kwargs: kwargs ?? {}
          };
        } else {
          initParams = fields;
          const rawToolCalls = initParams.additional_kwargs?.tool_calls;
          const toolCalls = initParams.tool_calls;
          if (!(rawToolCalls == null) && rawToolCalls.length > 0 && (toolCalls === void 0 || toolCalls.length === 0)) {
            console.warn([
              "New LangChain packages are available that more efficiently handle",
              "tool calling.\n\nPlease upgrade your packages to versions that set",
              "message tool calls. e.g., `yarn add @langchain/anthropic`,",
              "yarn add @langchain/openai`, etc."
            ].join(" "));
          }
          try {
            if (!(rawToolCalls == null) && toolCalls === void 0) {
              const [toolCalls2, invalidToolCalls] = defaultToolCallParser(rawToolCalls);
              initParams.tool_calls = toolCalls2 ?? [];
              initParams.invalid_tool_calls = invalidToolCalls ?? [];
            } else {
              initParams.tool_calls = initParams.tool_calls ?? [];
              initParams.invalid_tool_calls = initParams.invalid_tool_calls ?? [];
            }
          } catch (e) {
            initParams.tool_calls = [];
            initParams.invalid_tool_calls = [];
          }
        }
        super(initParams);
        Object.defineProperty(this, "tool_calls", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: []
        });
        Object.defineProperty(this, "invalid_tool_calls", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: []
        });
        Object.defineProperty(this, "usage_metadata", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        if (typeof initParams !== "string") {
          this.tool_calls = initParams.tool_calls ?? this.tool_calls;
          this.invalid_tool_calls = initParams.invalid_tool_calls ?? this.invalid_tool_calls;
        }
        this.usage_metadata = initParams.usage_metadata;
      }
      static lc_name() {
        return "AIMessage";
      }
      _getType() {
        return "ai";
      }
      get _printableFields() {
        return {
          ...super._printableFields,
          tool_calls: this.tool_calls,
          invalid_tool_calls: this.invalid_tool_calls,
          usage_metadata: this.usage_metadata
        };
      }
    };
    AIMessageChunk = class _AIMessageChunk extends BaseMessageChunk {
      constructor(fields) {
        let initParams;
        if (typeof fields === "string") {
          initParams = {
            content: fields,
            tool_calls: [],
            invalid_tool_calls: [],
            tool_call_chunks: []
          };
        } else if (fields.tool_call_chunks === void 0 || fields.tool_call_chunks.length === 0) {
          initParams = {
            ...fields,
            tool_calls: fields.tool_calls ?? [],
            invalid_tool_calls: [],
            tool_call_chunks: [],
            usage_metadata: fields.usage_metadata !== void 0 ? fields.usage_metadata : void 0
          };
        } else {
          const toolCallChunks = fields.tool_call_chunks ?? [];
          const groupedToolCallChunks = toolCallChunks.reduce((acc, chunk) => {
            const matchedChunkIndex = acc.findIndex(([match]) => {
              if ("id" in chunk && chunk.id && "index" in chunk && chunk.index !== void 0) {
                return chunk.id === match.id && chunk.index === match.index;
              }
              if ("id" in chunk && chunk.id) {
                return chunk.id === match.id;
              }
              if ("index" in chunk && chunk.index !== void 0) {
                return chunk.index === match.index;
              }
              return false;
            });
            if (matchedChunkIndex !== -1) {
              acc[matchedChunkIndex].push(chunk);
            } else {
              acc.push([chunk]);
            }
            return acc;
          }, []);
          const toolCalls = [];
          const invalidToolCalls = [];
          for (const chunks of groupedToolCallChunks) {
            let parsedArgs = {};
            const name = chunks[0]?.name ?? "";
            const joinedArgs = chunks.map((c) => c.args || "").join("");
            const argsStr = joinedArgs.length ? joinedArgs : "{}";
            const id = chunks[0]?.id;
            try {
              parsedArgs = parsePartialJson(argsStr);
              if (!id || parsedArgs === null || typeof parsedArgs !== "object" || Array.isArray(parsedArgs)) {
                throw new Error("Malformed tool call chunk args.");
              }
              toolCalls.push({
                name,
                args: parsedArgs,
                id,
                type: "tool_call"
              });
            } catch (e) {
              invalidToolCalls.push({
                name,
                args: argsStr,
                id,
                error: "Malformed args.",
                type: "invalid_tool_call"
              });
            }
          }
          initParams = {
            ...fields,
            tool_calls: toolCalls,
            invalid_tool_calls: invalidToolCalls,
            usage_metadata: fields.usage_metadata !== void 0 ? fields.usage_metadata : void 0
          };
        }
        super(initParams);
        Object.defineProperty(this, "tool_calls", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: []
        });
        Object.defineProperty(this, "invalid_tool_calls", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: []
        });
        Object.defineProperty(this, "tool_call_chunks", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: []
        });
        Object.defineProperty(this, "usage_metadata", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.tool_call_chunks = initParams.tool_call_chunks ?? this.tool_call_chunks;
        this.tool_calls = initParams.tool_calls ?? this.tool_calls;
        this.invalid_tool_calls = initParams.invalid_tool_calls ?? this.invalid_tool_calls;
        this.usage_metadata = initParams.usage_metadata;
      }
      get lc_aliases() {
        return {
          ...super.lc_aliases,
          tool_calls: "tool_calls",
          invalid_tool_calls: "invalid_tool_calls",
          tool_call_chunks: "tool_call_chunks"
        };
      }
      static lc_name() {
        return "AIMessageChunk";
      }
      _getType() {
        return "ai";
      }
      get _printableFields() {
        return {
          ...super._printableFields,
          tool_calls: this.tool_calls,
          tool_call_chunks: this.tool_call_chunks,
          invalid_tool_calls: this.invalid_tool_calls,
          usage_metadata: this.usage_metadata
        };
      }
      concat(chunk) {
        const combinedFields = {
          content: mergeContent(this.content, chunk.content),
          additional_kwargs: _mergeDicts(this.additional_kwargs, chunk.additional_kwargs),
          response_metadata: _mergeDicts(this.response_metadata, chunk.response_metadata),
          tool_call_chunks: [],
          id: this.id ?? chunk.id
        };
        if (this.tool_call_chunks !== void 0 || chunk.tool_call_chunks !== void 0) {
          const rawToolCalls = _mergeLists(this.tool_call_chunks, chunk.tool_call_chunks);
          if (rawToolCalls !== void 0 && rawToolCalls.length > 0) {
            combinedFields.tool_call_chunks = rawToolCalls;
          }
        }
        if (this.usage_metadata !== void 0 || chunk.usage_metadata !== void 0) {
          const inputTokenDetails = {
            ...(this.usage_metadata?.input_token_details?.audio !== void 0 || chunk.usage_metadata?.input_token_details?.audio !== void 0) && {
              audio: (this.usage_metadata?.input_token_details?.audio ?? 0) + (chunk.usage_metadata?.input_token_details?.audio ?? 0)
            },
            ...(this.usage_metadata?.input_token_details?.cache_read !== void 0 || chunk.usage_metadata?.input_token_details?.cache_read !== void 0) && {
              cache_read: (this.usage_metadata?.input_token_details?.cache_read ?? 0) + (chunk.usage_metadata?.input_token_details?.cache_read ?? 0)
            },
            ...(this.usage_metadata?.input_token_details?.cache_creation !== void 0 || chunk.usage_metadata?.input_token_details?.cache_creation !== void 0) && {
              cache_creation: (this.usage_metadata?.input_token_details?.cache_creation ?? 0) + (chunk.usage_metadata?.input_token_details?.cache_creation ?? 0)
            }
          };
          const outputTokenDetails = {
            ...(this.usage_metadata?.output_token_details?.audio !== void 0 || chunk.usage_metadata?.output_token_details?.audio !== void 0) && {
              audio: (this.usage_metadata?.output_token_details?.audio ?? 0) + (chunk.usage_metadata?.output_token_details?.audio ?? 0)
            },
            ...(this.usage_metadata?.output_token_details?.reasoning !== void 0 || chunk.usage_metadata?.output_token_details?.reasoning !== void 0) && {
              reasoning: (this.usage_metadata?.output_token_details?.reasoning ?? 0) + (chunk.usage_metadata?.output_token_details?.reasoning ?? 0)
            }
          };
          const left = this.usage_metadata ?? {
            input_tokens: 0,
            output_tokens: 0,
            total_tokens: 0
          };
          const right = chunk.usage_metadata ?? {
            input_tokens: 0,
            output_tokens: 0,
            total_tokens: 0
          };
          const usage_metadata = {
            input_tokens: left.input_tokens + right.input_tokens,
            output_tokens: left.output_tokens + right.output_tokens,
            total_tokens: left.total_tokens + right.total_tokens,
            // Do not include `input_token_details` / `output_token_details` keys in combined fields
            // unless their values are defined.
            ...Object.keys(inputTokenDetails).length > 0 && {
              input_token_details: inputTokenDetails
            },
            ...Object.keys(outputTokenDetails).length > 0 && {
              output_token_details: outputTokenDetails
            }
          };
          combinedFields.usage_metadata = usage_metadata;
        }
        return new _AIMessageChunk(combinedFields);
      }
    };
  }
});

// node_modules/@langchain/core/dist/messages/chat.js
var ChatMessage;
var init_chat = __esm({
  "node_modules/@langchain/core/dist/messages/chat.js"() {
    init_base3();
    ChatMessage = class _ChatMessage extends BaseMessage {
      static lc_name() {
        return "ChatMessage";
      }
      static _chatMessageClass() {
        return _ChatMessage;
      }
      constructor(fields, role) {
        if (typeof fields === "string") {
          fields = { content: fields, role };
        }
        super(fields);
        Object.defineProperty(this, "role", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.role = fields.role;
      }
      _getType() {
        return "generic";
      }
      static isInstance(message) {
        return message._getType() === "generic";
      }
      get _printableFields() {
        return {
          ...super._printableFields,
          role: this.role
        };
      }
    };
  }
});

// node_modules/@langchain/core/dist/messages/function.js
var init_function = __esm({
  "node_modules/@langchain/core/dist/messages/function.js"() {
    init_base3();
  }
});

// node_modules/@langchain/core/dist/messages/human.js
var HumanMessage;
var init_human = __esm({
  "node_modules/@langchain/core/dist/messages/human.js"() {
    init_base3();
    HumanMessage = class extends BaseMessage {
      static lc_name() {
        return "HumanMessage";
      }
      _getType() {
        return "human";
      }
      constructor(fields, kwargs) {
        super(fields, kwargs);
      }
    };
  }
});

// node_modules/@langchain/core/dist/messages/modifier.js
var RemoveMessage;
var init_modifier = __esm({
  "node_modules/@langchain/core/dist/messages/modifier.js"() {
    init_base3();
    RemoveMessage = class extends BaseMessage {
      constructor(fields) {
        super({
          ...fields,
          content: ""
        });
        Object.defineProperty(this, "id", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.id = fields.id;
      }
      _getType() {
        return "remove";
      }
      get _printableFields() {
        return {
          ...super._printableFields,
          id: this.id
        };
      }
    };
  }
});

// node_modules/@langchain/core/dist/messages/system.js
var SystemMessage;
var init_system = __esm({
  "node_modules/@langchain/core/dist/messages/system.js"() {
    init_base3();
    SystemMessage = class extends BaseMessage {
      static lc_name() {
        return "SystemMessage";
      }
      _getType() {
        return "system";
      }
      constructor(fields, kwargs) {
        super(fields, kwargs);
      }
    };
  }
});

// node_modules/@langchain/core/dist/messages/utils.js
function _coerceToolCall(toolCall) {
  if (_isToolCall(toolCall)) {
    return toolCall;
  } else if (typeof toolCall.id === "string" && toolCall.type === "function" && typeof toolCall.function === "object" && toolCall.function !== null && "arguments" in toolCall.function && typeof toolCall.function.arguments === "string" && "name" in toolCall.function && typeof toolCall.function.name === "string") {
    return {
      id: toolCall.id,
      args: JSON.parse(toolCall.function.arguments),
      name: toolCall.function.name,
      type: "tool_call"
    };
  } else {
    return toolCall;
  }
}
function isSerializedConstructor(x) {
  return typeof x === "object" && x != null && x.lc === 1 && Array.isArray(x.id) && x.kwargs != null && typeof x.kwargs === "object";
}
function _constructMessageFromParams(params) {
  let type;
  let rest;
  if (isSerializedConstructor(params)) {
    const className = params.id.at(-1);
    if (className === "HumanMessage" || className === "HumanMessageChunk") {
      type = "user";
    } else if (className === "AIMessage" || className === "AIMessageChunk") {
      type = "assistant";
    } else if (className === "SystemMessage" || className === "SystemMessageChunk") {
      type = "system";
    } else if (className === "FunctionMessage" || className === "FunctionMessageChunk") {
      type = "function";
    } else if (className === "ToolMessage" || className === "ToolMessageChunk") {
      type = "tool";
    } else {
      type = "unknown";
    }
    rest = params.kwargs;
  } else {
    const { type: extractedType, ...otherParams } = params;
    type = extractedType;
    rest = otherParams;
  }
  if (type === "human" || type === "user") {
    return new HumanMessage(rest);
  } else if (type === "ai" || type === "assistant") {
    const { tool_calls: rawToolCalls, ...other } = rest;
    if (!Array.isArray(rawToolCalls)) {
      return new AIMessage(rest);
    }
    const tool_calls = rawToolCalls.map(_coerceToolCall);
    return new AIMessage({ ...other, tool_calls });
  } else if (type === "system") {
    return new SystemMessage(rest);
  } else if (type === "developer") {
    return new SystemMessage({
      ...rest,
      additional_kwargs: {
        ...rest.additional_kwargs,
        __openai_role__: "developer"
      }
    });
  } else if (type === "tool" && "tool_call_id" in rest) {
    return new ToolMessage({
      ...rest,
      content: rest.content,
      tool_call_id: rest.tool_call_id,
      name: rest.name
    });
  } else if (type === "remove" && "id" in rest && typeof rest.id === "string") {
    return new RemoveMessage({ ...rest, id: rest.id });
  } else {
    const error = addLangChainErrorFields(new Error(`Unable to coerce message from array: only human, AI, system, developer, or tool message coercion is currently supported.

Received: ${JSON.stringify(params, null, 2)}`), "MESSAGE_COERCION_FAILURE");
    throw error;
  }
}
function coerceMessageLikeToMessage(messageLike) {
  if (typeof messageLike === "string") {
    return new HumanMessage(messageLike);
  } else if (isBaseMessage(messageLike)) {
    return messageLike;
  }
  if (Array.isArray(messageLike)) {
    const [type, content] = messageLike;
    return _constructMessageFromParams({ type, content });
  } else if (_isMessageFieldWithRole(messageLike)) {
    const { role: type, ...rest } = messageLike;
    return _constructMessageFromParams({ ...rest, type });
  } else {
    return _constructMessageFromParams(messageLike);
  }
}
function getBufferString(messages, humanPrefix = "Human", aiPrefix = "AI") {
  const string_messages = [];
  for (const m of messages) {
    let role;
    if (m._getType() === "human") {
      role = humanPrefix;
    } else if (m._getType() === "ai") {
      role = aiPrefix;
    } else if (m._getType() === "system") {
      role = "System";
    } else if (m._getType() === "function") {
      role = "Function";
    } else if (m._getType() === "tool") {
      role = "Tool";
    } else if (m._getType() === "generic") {
      role = m.role;
    } else {
      throw new Error(`Got unsupported message type: ${m._getType()}`);
    }
    const nameStr = m.name ? `${m.name}, ` : "";
    const readableContent = typeof m.content === "string" ? m.content : JSON.stringify(m.content, null, 2);
    string_messages.push(`${role}: ${nameStr}${readableContent}`);
  }
  return string_messages.join("\n");
}
var init_utils2 = __esm({
  "node_modules/@langchain/core/dist/messages/utils.js"() {
    init_errors();
    init_utils();
    init_ai();
    init_base3();
    init_chat();
    init_function();
    init_human();
    init_modifier();
    init_system();
    init_tool();
  }
});

// node_modules/langsmith/index.js
var init_langsmith = __esm({
  "node_modules/langsmith/index.js"() {
    init_dist();
  }
});

// node_modules/@langchain/core/dist/singletons/tracer.js
var client, getDefaultLangChainClientSingleton;
var init_tracer = __esm({
  "node_modules/@langchain/core/dist/singletons/tracer.js"() {
    init_langsmith();
    init_env3();
    getDefaultLangChainClientSingleton = () => {
      if (client === void 0) {
        const clientParams = getEnvironmentVariable2("LANGCHAIN_CALLBACKS_BACKGROUND") === "false" ? {
          // LangSmith has its own backgrounding system
          blockOnRootRunFinalization: true
        } : {};
        client = new Client(clientParams);
      }
      return client;
    };
  }
});

// node_modules/@langchain/core/dist/tracers/tracer_langchain.js
var LangChainTracer;
var init_tracer_langchain = __esm({
  "node_modules/@langchain/core/dist/tracers/tracer_langchain.js"() {
    init_langsmith();
    init_run_trees2();
    init_traceable2();
    init_base2();
    init_tracer();
    LangChainTracer = class _LangChainTracer extends BaseTracer {
      constructor(fields = {}) {
        super(fields);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "langchain_tracer"
        });
        Object.defineProperty(this, "projectName", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "exampleId", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "client", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "replicas", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "usesRunTreeMap", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        const { exampleId, projectName, client: client2, replicas } = fields;
        this.projectName = projectName ?? getDefaultProjectName();
        this.replicas = replicas;
        this.exampleId = exampleId;
        this.client = client2 ?? getDefaultLangChainClientSingleton();
        const traceableTree = _LangChainTracer.getTraceableRunTree();
        if (traceableTree) {
          this.updateFromRunTree(traceableTree);
        }
      }
      async persistRun(_run) {
      }
      async onRunCreate(run) {
        const runTree = this.getRunTreeWithTracingConfig(run.id);
        await runTree?.postRun();
      }
      async onRunUpdate(run) {
        const runTree = this.getRunTreeWithTracingConfig(run.id);
        await runTree?.patchRun();
      }
      getRun(id) {
        return this.runTreeMap.get(id);
      }
      updateFromRunTree(runTree) {
        this.runTreeMap.set(runTree.id, runTree);
        let rootRun = runTree;
        const visited = /* @__PURE__ */ new Set();
        while (rootRun.parent_run) {
          if (visited.has(rootRun.id))
            break;
          visited.add(rootRun.id);
          if (!rootRun.parent_run)
            break;
          rootRun = rootRun.parent_run;
        }
        visited.clear();
        const queue2 = [rootRun];
        while (queue2.length > 0) {
          const current = queue2.shift();
          if (!current || visited.has(current.id))
            continue;
          visited.add(current.id);
          this.runTreeMap.set(current.id, current);
          if (current.child_runs) {
            queue2.push(...current.child_runs);
          }
        }
        this.client = runTree.client ?? this.client;
        this.replicas = runTree.replicas ?? this.replicas;
        this.projectName = runTree.project_name ?? this.projectName;
        this.exampleId = runTree.reference_example_id ?? this.exampleId;
      }
      getRunTreeWithTracingConfig(id) {
        const runTree = this.runTreeMap.get(id);
        if (!runTree)
          return void 0;
        return new RunTree({
          ...runTree,
          client: this.client,
          project_name: this.projectName,
          replicas: this.replicas,
          reference_example_id: this.exampleId,
          tracingEnabled: true
        });
      }
      static getTraceableRunTree() {
        try {
          return (
            // The type cast here provides forward compatibility. Old versions of LangSmith will just
            // ignore the permitAbsentRunTree arg.
            getCurrentRunTree(true)
          );
        } catch {
          return void 0;
        }
      }
    };
  }
});

// node_modules/@langchain/core/dist/singletons/async_local_storage/globals.js
var TRACING_ALS_KEY2, _CONTEXT_VARIABLES_KEY, setGlobalAsyncLocalStorageInstance, getGlobalAsyncLocalStorageInstance;
var init_globals = __esm({
  "node_modules/@langchain/core/dist/singletons/async_local_storage/globals.js"() {
    TRACING_ALS_KEY2 = /* @__PURE__ */ Symbol.for("ls:tracing_async_local_storage");
    _CONTEXT_VARIABLES_KEY = /* @__PURE__ */ Symbol.for("lc:context_variables");
    setGlobalAsyncLocalStorageInstance = (instance) => {
      globalThis[TRACING_ALS_KEY2] = instance;
    };
    getGlobalAsyncLocalStorageInstance = () => {
      return globalThis[TRACING_ALS_KEY2];
    };
  }
});

// node_modules/@langchain/core/dist/singletons/callbacks.js
function createQueue() {
  const PQueue = "default" in import_p_queue2.default ? import_p_queue2.default.default : import_p_queue2.default;
  return new PQueue({
    autoStart: true,
    concurrency: 1
  });
}
function getQueue() {
  if (typeof queue === "undefined") {
    queue = createQueue();
  }
  return queue;
}
async function consumeCallback(promiseFn, wait) {
  if (wait === true) {
    const asyncLocalStorageInstance = getGlobalAsyncLocalStorageInstance();
    if (asyncLocalStorageInstance !== void 0) {
      await asyncLocalStorageInstance.run(void 0, async () => promiseFn());
    } else {
      await promiseFn();
    }
  } else {
    queue = getQueue();
    void queue.add(async () => {
      const asyncLocalStorageInstance = getGlobalAsyncLocalStorageInstance();
      if (asyncLocalStorageInstance !== void 0) {
        await asyncLocalStorageInstance.run(void 0, async () => promiseFn());
      } else {
        await promiseFn();
      }
    });
  }
}
var import_p_queue2, queue;
var init_callbacks = __esm({
  "node_modules/@langchain/core/dist/singletons/callbacks.js"() {
    import_p_queue2 = __toESM(require_dist(), 1);
    init_globals();
    init_tracer();
  }
});

// node_modules/@langchain/core/dist/callbacks/promises.js
var init_promises = __esm({
  "node_modules/@langchain/core/dist/callbacks/promises.js"() {
    init_callbacks();
  }
});

// node_modules/@langchain/core/dist/utils/callbacks.js
var isTracingEnabled2;
var init_callbacks2 = __esm({
  "node_modules/@langchain/core/dist/utils/callbacks.js"() {
    init_env3();
    isTracingEnabled2 = (tracingEnabled) => {
      if (tracingEnabled !== void 0) {
        return tracingEnabled;
      }
      const envVars = [
        "LANGSMITH_TRACING_V2",
        "LANGCHAIN_TRACING_V2",
        "LANGSMITH_TRACING",
        "LANGCHAIN_TRACING"
      ];
      return !!envVars.find((envVar) => getEnvironmentVariable2(envVar) === "true");
    };
  }
});

// node_modules/@langchain/core/dist/singletons/async_local_storage/context.js
function getContextVariable(name) {
  const asyncLocalStorageInstance = getGlobalAsyncLocalStorageInstance();
  if (asyncLocalStorageInstance === void 0) {
    return void 0;
  }
  const runTree = asyncLocalStorageInstance.getStore();
  return runTree?.[_CONTEXT_VARIABLES_KEY]?.[name];
}
var LC_CONFIGURE_HOOKS_KEY, _getConfigureHooks;
var init_context = __esm({
  "node_modules/@langchain/core/dist/singletons/async_local_storage/context.js"() {
    init_run_trees2();
    init_globals();
    LC_CONFIGURE_HOOKS_KEY = /* @__PURE__ */ Symbol("lc:configure_hooks");
    _getConfigureHooks = () => getContextVariable(LC_CONFIGURE_HOOKS_KEY) || [];
  }
});

// node_modules/@langchain/core/dist/callbacks/manager.js
function parseCallbackConfigArg(arg) {
  if (!arg) {
    return {};
  } else if (Array.isArray(arg) || "name" in arg) {
    return { callbacks: arg };
  } else {
    return arg;
  }
}
function ensureHandler(handler) {
  if ("name" in handler) {
    return handler;
  }
  return BaseCallbackHandler.fromMethods(handler);
}
var BaseCallbackManager, BaseRunManager, CallbackManagerForRetrieverRun, CallbackManagerForLLMRun, CallbackManagerForChainRun, CallbackManagerForToolRun, CallbackManager;
var init_manager = __esm({
  "node_modules/@langchain/core/dist/callbacks/manager.js"() {
    init_esm_node();
    init_base();
    init_console();
    init_utils2();
    init_env3();
    init_tracer_langchain();
    init_promises();
    init_callbacks2();
    init_base2();
    init_context();
    BaseCallbackManager = class {
      setHandler(handler) {
        return this.setHandlers([handler]);
      }
    };
    BaseRunManager = class {
      constructor(runId, handlers, inheritableHandlers, tags, inheritableTags, metadata, inheritableMetadata, _parentRunId) {
        Object.defineProperty(this, "runId", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: runId
        });
        Object.defineProperty(this, "handlers", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: handlers
        });
        Object.defineProperty(this, "inheritableHandlers", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: inheritableHandlers
        });
        Object.defineProperty(this, "tags", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: tags
        });
        Object.defineProperty(this, "inheritableTags", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: inheritableTags
        });
        Object.defineProperty(this, "metadata", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: metadata
        });
        Object.defineProperty(this, "inheritableMetadata", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: inheritableMetadata
        });
        Object.defineProperty(this, "_parentRunId", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _parentRunId
        });
      }
      get parentRunId() {
        return this._parentRunId;
      }
      async handleText(text) {
        await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
          try {
            await handler.handleText?.(text, this.runId, this._parentRunId, this.tags);
          } catch (err) {
            const logFunction = handler.raiseError ? console.error : console.warn;
            logFunction(`Error in handler ${handler.constructor.name}, handleText: ${err}`);
            if (handler.raiseError) {
              throw err;
            }
          }
        }, handler.awaitHandlers)));
      }
      async handleCustomEvent(eventName, data, _runId, _tags, _metadata) {
        await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
          try {
            await handler.handleCustomEvent?.(eventName, data, this.runId, this.tags, this.metadata);
          } catch (err) {
            const logFunction = handler.raiseError ? console.error : console.warn;
            logFunction(`Error in handler ${handler.constructor.name}, handleCustomEvent: ${err}`);
            if (handler.raiseError) {
              throw err;
            }
          }
        }, handler.awaitHandlers)));
      }
    };
    CallbackManagerForRetrieverRun = class extends BaseRunManager {
      getChild(tag) {
        const manager = new CallbackManager(this.runId);
        manager.setHandlers(this.inheritableHandlers);
        manager.addTags(this.inheritableTags);
        manager.addMetadata(this.inheritableMetadata);
        if (tag) {
          manager.addTags([tag], false);
        }
        return manager;
      }
      async handleRetrieverEnd(documents) {
        await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
          if (!handler.ignoreRetriever) {
            try {
              await handler.handleRetrieverEnd?.(documents, this.runId, this._parentRunId, this.tags);
            } catch (err) {
              const logFunction = handler.raiseError ? console.error : console.warn;
              logFunction(`Error in handler ${handler.constructor.name}, handleRetriever`);
              if (handler.raiseError) {
                throw err;
              }
            }
          }
        }, handler.awaitHandlers)));
      }
      async handleRetrieverError(err) {
        await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
          if (!handler.ignoreRetriever) {
            try {
              await handler.handleRetrieverError?.(err, this.runId, this._parentRunId, this.tags);
            } catch (error) {
              const logFunction = handler.raiseError ? console.error : console.warn;
              logFunction(`Error in handler ${handler.constructor.name}, handleRetrieverError: ${error}`);
              if (handler.raiseError) {
                throw err;
              }
            }
          }
        }, handler.awaitHandlers)));
      }
    };
    CallbackManagerForLLMRun = class extends BaseRunManager {
      async handleLLMNewToken(token, idx, _runId, _parentRunId, _tags, fields) {
        await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
          if (!handler.ignoreLLM) {
            try {
              await handler.handleLLMNewToken?.(token, idx ?? { prompt: 0, completion: 0 }, this.runId, this._parentRunId, this.tags, fields);
            } catch (err) {
              const logFunction = handler.raiseError ? console.error : console.warn;
              logFunction(`Error in handler ${handler.constructor.name}, handleLLMNewToken: ${err}`);
              if (handler.raiseError) {
                throw err;
              }
            }
          }
        }, handler.awaitHandlers)));
      }
      async handleLLMError(err, _runId, _parentRunId, _tags, extraParams) {
        await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
          if (!handler.ignoreLLM) {
            try {
              await handler.handleLLMError?.(err, this.runId, this._parentRunId, this.tags, extraParams);
            } catch (err2) {
              const logFunction = handler.raiseError ? console.error : console.warn;
              logFunction(`Error in handler ${handler.constructor.name}, handleLLMError: ${err2}`);
              if (handler.raiseError) {
                throw err2;
              }
            }
          }
        }, handler.awaitHandlers)));
      }
      async handleLLMEnd(output, _runId, _parentRunId, _tags, extraParams) {
        await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
          if (!handler.ignoreLLM) {
            try {
              await handler.handleLLMEnd?.(output, this.runId, this._parentRunId, this.tags, extraParams);
            } catch (err) {
              const logFunction = handler.raiseError ? console.error : console.warn;
              logFunction(`Error in handler ${handler.constructor.name}, handleLLMEnd: ${err}`);
              if (handler.raiseError) {
                throw err;
              }
            }
          }
        }, handler.awaitHandlers)));
      }
    };
    CallbackManagerForChainRun = class extends BaseRunManager {
      getChild(tag) {
        const manager = new CallbackManager(this.runId);
        manager.setHandlers(this.inheritableHandlers);
        manager.addTags(this.inheritableTags);
        manager.addMetadata(this.inheritableMetadata);
        if (tag) {
          manager.addTags([tag], false);
        }
        return manager;
      }
      async handleChainError(err, _runId, _parentRunId, _tags, kwargs) {
        await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
          if (!handler.ignoreChain) {
            try {
              await handler.handleChainError?.(err, this.runId, this._parentRunId, this.tags, kwargs);
            } catch (err2) {
              const logFunction = handler.raiseError ? console.error : console.warn;
              logFunction(`Error in handler ${handler.constructor.name}, handleChainError: ${err2}`);
              if (handler.raiseError) {
                throw err2;
              }
            }
          }
        }, handler.awaitHandlers)));
      }
      async handleChainEnd(output, _runId, _parentRunId, _tags, kwargs) {
        await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
          if (!handler.ignoreChain) {
            try {
              await handler.handleChainEnd?.(output, this.runId, this._parentRunId, this.tags, kwargs);
            } catch (err) {
              const logFunction = handler.raiseError ? console.error : console.warn;
              logFunction(`Error in handler ${handler.constructor.name}, handleChainEnd: ${err}`);
              if (handler.raiseError) {
                throw err;
              }
            }
          }
        }, handler.awaitHandlers)));
      }
      async handleAgentAction(action) {
        await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
          if (!handler.ignoreAgent) {
            try {
              await handler.handleAgentAction?.(action, this.runId, this._parentRunId, this.tags);
            } catch (err) {
              const logFunction = handler.raiseError ? console.error : console.warn;
              logFunction(`Error in handler ${handler.constructor.name}, handleAgentAction: ${err}`);
              if (handler.raiseError) {
                throw err;
              }
            }
          }
        }, handler.awaitHandlers)));
      }
      async handleAgentEnd(action) {
        await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
          if (!handler.ignoreAgent) {
            try {
              await handler.handleAgentEnd?.(action, this.runId, this._parentRunId, this.tags);
            } catch (err) {
              const logFunction = handler.raiseError ? console.error : console.warn;
              logFunction(`Error in handler ${handler.constructor.name}, handleAgentEnd: ${err}`);
              if (handler.raiseError) {
                throw err;
              }
            }
          }
        }, handler.awaitHandlers)));
      }
    };
    CallbackManagerForToolRun = class extends BaseRunManager {
      getChild(tag) {
        const manager = new CallbackManager(this.runId);
        manager.setHandlers(this.inheritableHandlers);
        manager.addTags(this.inheritableTags);
        manager.addMetadata(this.inheritableMetadata);
        if (tag) {
          manager.addTags([tag], false);
        }
        return manager;
      }
      async handleToolError(err) {
        await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
          if (!handler.ignoreAgent) {
            try {
              await handler.handleToolError?.(err, this.runId, this._parentRunId, this.tags);
            } catch (err2) {
              const logFunction = handler.raiseError ? console.error : console.warn;
              logFunction(`Error in handler ${handler.constructor.name}, handleToolError: ${err2}`);
              if (handler.raiseError) {
                throw err2;
              }
            }
          }
        }, handler.awaitHandlers)));
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async handleToolEnd(output) {
        await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
          if (!handler.ignoreAgent) {
            try {
              await handler.handleToolEnd?.(output, this.runId, this._parentRunId, this.tags);
            } catch (err) {
              const logFunction = handler.raiseError ? console.error : console.warn;
              logFunction(`Error in handler ${handler.constructor.name}, handleToolEnd: ${err}`);
              if (handler.raiseError) {
                throw err;
              }
            }
          }
        }, handler.awaitHandlers)));
      }
    };
    CallbackManager = class _CallbackManager extends BaseCallbackManager {
      constructor(parentRunId, options) {
        super();
        Object.defineProperty(this, "handlers", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: []
        });
        Object.defineProperty(this, "inheritableHandlers", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: []
        });
        Object.defineProperty(this, "tags", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: []
        });
        Object.defineProperty(this, "inheritableTags", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: []
        });
        Object.defineProperty(this, "metadata", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: {}
        });
        Object.defineProperty(this, "inheritableMetadata", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: {}
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "callback_manager"
        });
        Object.defineProperty(this, "_parentRunId", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.handlers = options?.handlers ?? this.handlers;
        this.inheritableHandlers = options?.inheritableHandlers ?? this.inheritableHandlers;
        this.tags = options?.tags ?? this.tags;
        this.inheritableTags = options?.inheritableTags ?? this.inheritableTags;
        this.metadata = options?.metadata ?? this.metadata;
        this.inheritableMetadata = options?.inheritableMetadata ?? this.inheritableMetadata;
        this._parentRunId = parentRunId;
      }
      /**
       * Gets the parent run ID, if any.
       *
       * @returns The parent run ID.
       */
      getParentRunId() {
        return this._parentRunId;
      }
      async handleLLMStart(llm, prompts, runId = void 0, _parentRunId = void 0, extraParams = void 0, _tags = void 0, _metadata = void 0, runName = void 0) {
        return Promise.all(prompts.map(async (prompt, idx) => {
          const runId_ = idx === 0 && runId ? runId : v4_default();
          await Promise.all(this.handlers.map((handler) => {
            if (handler.ignoreLLM) {
              return;
            }
            if (isBaseTracer(handler)) {
              handler._createRunForLLMStart(llm, [prompt], runId_, this._parentRunId, extraParams, this.tags, this.metadata, runName);
            }
            return consumeCallback(async () => {
              try {
                await handler.handleLLMStart?.(llm, [prompt], runId_, this._parentRunId, extraParams, this.tags, this.metadata, runName);
              } catch (err) {
                const logFunction = handler.raiseError ? console.error : console.warn;
                logFunction(`Error in handler ${handler.constructor.name}, handleLLMStart: ${err}`);
                if (handler.raiseError) {
                  throw err;
                }
              }
            }, handler.awaitHandlers);
          }));
          return new CallbackManagerForLLMRun(runId_, this.handlers, this.inheritableHandlers, this.tags, this.inheritableTags, this.metadata, this.inheritableMetadata, this._parentRunId);
        }));
      }
      async handleChatModelStart(llm, messages, runId = void 0, _parentRunId = void 0, extraParams = void 0, _tags = void 0, _metadata = void 0, runName = void 0) {
        return Promise.all(messages.map(async (messageGroup, idx) => {
          const runId_ = idx === 0 && runId ? runId : v4_default();
          await Promise.all(this.handlers.map((handler) => {
            if (handler.ignoreLLM) {
              return;
            }
            if (isBaseTracer(handler)) {
              handler._createRunForChatModelStart(llm, [messageGroup], runId_, this._parentRunId, extraParams, this.tags, this.metadata, runName);
            }
            return consumeCallback(async () => {
              try {
                if (handler.handleChatModelStart) {
                  await handler.handleChatModelStart?.(llm, [messageGroup], runId_, this._parentRunId, extraParams, this.tags, this.metadata, runName);
                } else if (handler.handleLLMStart) {
                  const messageString = getBufferString(messageGroup);
                  await handler.handleLLMStart?.(llm, [messageString], runId_, this._parentRunId, extraParams, this.tags, this.metadata, runName);
                }
              } catch (err) {
                const logFunction = handler.raiseError ? console.error : console.warn;
                logFunction(`Error in handler ${handler.constructor.name}, handleLLMStart: ${err}`);
                if (handler.raiseError) {
                  throw err;
                }
              }
            }, handler.awaitHandlers);
          }));
          return new CallbackManagerForLLMRun(runId_, this.handlers, this.inheritableHandlers, this.tags, this.inheritableTags, this.metadata, this.inheritableMetadata, this._parentRunId);
        }));
      }
      async handleChainStart(chain, inputs, runId = v4_default(), runType = void 0, _tags = void 0, _metadata = void 0, runName = void 0) {
        await Promise.all(this.handlers.map((handler) => {
          if (handler.ignoreChain) {
            return;
          }
          if (isBaseTracer(handler)) {
            handler._createRunForChainStart(chain, inputs, runId, this._parentRunId, this.tags, this.metadata, runType, runName);
          }
          return consumeCallback(async () => {
            try {
              await handler.handleChainStart?.(chain, inputs, runId, this._parentRunId, this.tags, this.metadata, runType, runName);
            } catch (err) {
              const logFunction = handler.raiseError ? console.error : console.warn;
              logFunction(`Error in handler ${handler.constructor.name}, handleChainStart: ${err}`);
              if (handler.raiseError) {
                throw err;
              }
            }
          }, handler.awaitHandlers);
        }));
        return new CallbackManagerForChainRun(runId, this.handlers, this.inheritableHandlers, this.tags, this.inheritableTags, this.metadata, this.inheritableMetadata, this._parentRunId);
      }
      async handleToolStart(tool, input, runId = v4_default(), _parentRunId = void 0, _tags = void 0, _metadata = void 0, runName = void 0) {
        await Promise.all(this.handlers.map((handler) => {
          if (handler.ignoreAgent) {
            return;
          }
          if (isBaseTracer(handler)) {
            handler._createRunForToolStart(tool, input, runId, this._parentRunId, this.tags, this.metadata, runName);
          }
          return consumeCallback(async () => {
            try {
              await handler.handleToolStart?.(tool, input, runId, this._parentRunId, this.tags, this.metadata, runName);
            } catch (err) {
              const logFunction = handler.raiseError ? console.error : console.warn;
              logFunction(`Error in handler ${handler.constructor.name}, handleToolStart: ${err}`);
              if (handler.raiseError) {
                throw err;
              }
            }
          }, handler.awaitHandlers);
        }));
        return new CallbackManagerForToolRun(runId, this.handlers, this.inheritableHandlers, this.tags, this.inheritableTags, this.metadata, this.inheritableMetadata, this._parentRunId);
      }
      async handleRetrieverStart(retriever, query, runId = v4_default(), _parentRunId = void 0, _tags = void 0, _metadata = void 0, runName = void 0) {
        await Promise.all(this.handlers.map((handler) => {
          if (handler.ignoreRetriever) {
            return;
          }
          if (isBaseTracer(handler)) {
            handler._createRunForRetrieverStart(retriever, query, runId, this._parentRunId, this.tags, this.metadata, runName);
          }
          return consumeCallback(async () => {
            try {
              await handler.handleRetrieverStart?.(retriever, query, runId, this._parentRunId, this.tags, this.metadata, runName);
            } catch (err) {
              const logFunction = handler.raiseError ? console.error : console.warn;
              logFunction(`Error in handler ${handler.constructor.name}, handleRetrieverStart: ${err}`);
              if (handler.raiseError) {
                throw err;
              }
            }
          }, handler.awaitHandlers);
        }));
        return new CallbackManagerForRetrieverRun(runId, this.handlers, this.inheritableHandlers, this.tags, this.inheritableTags, this.metadata, this.inheritableMetadata, this._parentRunId);
      }
      async handleCustomEvent(eventName, data, runId, _tags, _metadata) {
        await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
          if (!handler.ignoreCustomEvent) {
            try {
              await handler.handleCustomEvent?.(eventName, data, runId, this.tags, this.metadata);
            } catch (err) {
              const logFunction = handler.raiseError ? console.error : console.warn;
              logFunction(`Error in handler ${handler.constructor.name}, handleCustomEvent: ${err}`);
              if (handler.raiseError) {
                throw err;
              }
            }
          }
        }, handler.awaitHandlers)));
      }
      addHandler(handler, inherit = true) {
        this.handlers.push(handler);
        if (inherit) {
          this.inheritableHandlers.push(handler);
        }
      }
      removeHandler(handler) {
        this.handlers = this.handlers.filter((_handler) => _handler !== handler);
        this.inheritableHandlers = this.inheritableHandlers.filter((_handler) => _handler !== handler);
      }
      setHandlers(handlers, inherit = true) {
        this.handlers = [];
        this.inheritableHandlers = [];
        for (const handler of handlers) {
          this.addHandler(handler, inherit);
        }
      }
      addTags(tags, inherit = true) {
        this.removeTags(tags);
        this.tags.push(...tags);
        if (inherit) {
          this.inheritableTags.push(...tags);
        }
      }
      removeTags(tags) {
        this.tags = this.tags.filter((tag) => !tags.includes(tag));
        this.inheritableTags = this.inheritableTags.filter((tag) => !tags.includes(tag));
      }
      addMetadata(metadata, inherit = true) {
        this.metadata = { ...this.metadata, ...metadata };
        if (inherit) {
          this.inheritableMetadata = { ...this.inheritableMetadata, ...metadata };
        }
      }
      removeMetadata(metadata) {
        for (const key of Object.keys(metadata)) {
          delete this.metadata[key];
          delete this.inheritableMetadata[key];
        }
      }
      copy(additionalHandlers = [], inherit = true) {
        const manager = new _CallbackManager(this._parentRunId);
        for (const handler of this.handlers) {
          const inheritable = this.inheritableHandlers.includes(handler);
          manager.addHandler(handler, inheritable);
        }
        for (const tag of this.tags) {
          const inheritable = this.inheritableTags.includes(tag);
          manager.addTags([tag], inheritable);
        }
        for (const key of Object.keys(this.metadata)) {
          const inheritable = Object.keys(this.inheritableMetadata).includes(key);
          manager.addMetadata({ [key]: this.metadata[key] }, inheritable);
        }
        for (const handler of additionalHandlers) {
          if (
            // Prevent multiple copies of console_callback_handler
            manager.handlers.filter((h) => h.name === "console_callback_handler").some((h) => h.name === handler.name)
          ) {
            continue;
          }
          manager.addHandler(handler, inherit);
        }
        return manager;
      }
      static fromHandlers(handlers) {
        class Handler extends BaseCallbackHandler {
          constructor() {
            super();
            Object.defineProperty(this, "name", {
              enumerable: true,
              configurable: true,
              writable: true,
              value: v4_default()
            });
            Object.assign(this, handlers);
          }
        }
        const manager = new this();
        manager.addHandler(new Handler());
        return manager;
      }
      static configure(inheritableHandlers, localHandlers, inheritableTags, localTags, inheritableMetadata, localMetadata, options) {
        return this._configureSync(inheritableHandlers, localHandlers, inheritableTags, localTags, inheritableMetadata, localMetadata, options);
      }
      // TODO: Deprecate async method in favor of this one.
      static _configureSync(inheritableHandlers, localHandlers, inheritableTags, localTags, inheritableMetadata, localMetadata, options) {
        let callbackManager;
        if (inheritableHandlers || localHandlers) {
          if (Array.isArray(inheritableHandlers) || !inheritableHandlers) {
            callbackManager = new _CallbackManager();
            callbackManager.setHandlers(inheritableHandlers?.map(ensureHandler) ?? [], true);
          } else {
            callbackManager = inheritableHandlers;
          }
          callbackManager = callbackManager.copy(Array.isArray(localHandlers) ? localHandlers.map(ensureHandler) : localHandlers?.handlers, false);
        }
        const verboseEnabled = getEnvironmentVariable2("LANGCHAIN_VERBOSE") === "true" || options?.verbose;
        const tracingV2Enabled = LangChainTracer.getTraceableRunTree()?.tracingEnabled || isTracingEnabled2();
        const tracingEnabled = tracingV2Enabled || (getEnvironmentVariable2("LANGCHAIN_TRACING") ?? false);
        if (verboseEnabled || tracingEnabled) {
          if (!callbackManager) {
            callbackManager = new _CallbackManager();
          }
          if (verboseEnabled && !callbackManager.handlers.some((handler) => handler.name === ConsoleCallbackHandler.prototype.name)) {
            const consoleHandler = new ConsoleCallbackHandler();
            callbackManager.addHandler(consoleHandler, true);
          }
          if (tracingEnabled && !callbackManager.handlers.some((handler) => handler.name === "langchain_tracer")) {
            if (tracingV2Enabled) {
              const tracerV2 = new LangChainTracer();
              callbackManager.addHandler(tracerV2, true);
            }
          }
          if (tracingV2Enabled) {
            const implicitRunTree = LangChainTracer.getTraceableRunTree();
            if (implicitRunTree && callbackManager._parentRunId === void 0) {
              callbackManager._parentRunId = implicitRunTree.id;
              const tracerV2 = callbackManager.handlers.find((handler) => handler.name === "langchain_tracer");
              tracerV2?.updateFromRunTree(implicitRunTree);
            }
          }
        }
        for (const { contextVar, inheritable = true, handlerClass, envVar } of _getConfigureHooks()) {
          const createIfNotInContext = envVar && getEnvironmentVariable2(envVar) === "true" && handlerClass;
          let handler;
          const contextVarValue = contextVar !== void 0 ? getContextVariable(contextVar) : void 0;
          if (contextVarValue && isBaseCallbackHandler(contextVarValue)) {
            handler = contextVarValue;
          } else if (createIfNotInContext) {
            handler = new handlerClass({});
          }
          if (handler !== void 0) {
            if (!callbackManager) {
              callbackManager = new _CallbackManager();
            }
            if (!callbackManager.handlers.some((h) => h.name === handler.name)) {
              callbackManager.addHandler(handler, inheritable);
            }
          }
        }
        if (inheritableTags || localTags) {
          if (callbackManager) {
            callbackManager.addTags(inheritableTags ?? []);
            callbackManager.addTags(localTags ?? [], false);
          }
        }
        if (inheritableMetadata || localMetadata) {
          if (callbackManager) {
            callbackManager.addMetadata(inheritableMetadata ?? {});
            callbackManager.addMetadata(localMetadata ?? {}, false);
          }
        }
        return callbackManager;
      }
    };
  }
});

// node_modules/@langchain/core/dist/singletons/async_local_storage/index.js
var MockAsyncLocalStorage2, mockAsyncLocalStorage2, LC_CHILD_KEY, AsyncLocalStorageProvider2, AsyncLocalStorageProviderSingleton2;
var init_async_local_storage = __esm({
  "node_modules/@langchain/core/dist/singletons/async_local_storage/index.js"() {
    init_langsmith();
    init_globals();
    init_manager();
    MockAsyncLocalStorage2 = class {
      getStore() {
        return void 0;
      }
      run(_store, callback) {
        return callback();
      }
      enterWith(_store) {
        return void 0;
      }
    };
    mockAsyncLocalStorage2 = new MockAsyncLocalStorage2();
    LC_CHILD_KEY = /* @__PURE__ */ Symbol.for("lc:child_config");
    AsyncLocalStorageProvider2 = class {
      getInstance() {
        return getGlobalAsyncLocalStorageInstance() ?? mockAsyncLocalStorage2;
      }
      getRunnableConfig() {
        const storage = this.getInstance();
        return storage.getStore()?.extra?.[LC_CHILD_KEY];
      }
      runWithConfig(config, callback, avoidCreatingRootRunTree) {
        const callbackManager = CallbackManager._configureSync(config?.callbacks, void 0, config?.tags, void 0, config?.metadata);
        const storage = this.getInstance();
        const previousValue = storage.getStore();
        const parentRunId = callbackManager?.getParentRunId();
        const langChainTracer = callbackManager?.handlers?.find((handler) => handler?.name === "langchain_tracer");
        let runTree;
        if (langChainTracer && parentRunId) {
          runTree = langChainTracer.getRunTreeWithTracingConfig(parentRunId);
        } else if (!avoidCreatingRootRunTree) {
          runTree = new RunTree({
            name: "<runnable_lambda>",
            tracingEnabled: false
          });
        }
        if (runTree) {
          runTree.extra = { ...runTree.extra, [LC_CHILD_KEY]: config };
        }
        if (previousValue !== void 0 && previousValue[_CONTEXT_VARIABLES_KEY] !== void 0) {
          if (runTree === void 0) {
            runTree = {};
          }
          runTree[_CONTEXT_VARIABLES_KEY] = previousValue[_CONTEXT_VARIABLES_KEY];
        }
        return storage.run(runTree, callback);
      }
      initializeGlobalInstance(instance) {
        if (getGlobalAsyncLocalStorageInstance() === void 0) {
          setGlobalAsyncLocalStorageInstance(instance);
        }
      }
    };
    AsyncLocalStorageProviderSingleton2 = new AsyncLocalStorageProvider2();
  }
});

// node_modules/@langchain/core/dist/singletons/index.js
var init_singletons = __esm({
  "node_modules/@langchain/core/dist/singletons/index.js"() {
    init_async_local_storage();
    init_globals();
  }
});

// node_modules/@langchain/core/dist/runnables/config.js
async function getCallbackManagerForConfig(config) {
  return CallbackManager._configureSync(config?.callbacks, void 0, config?.tags, void 0, config?.metadata);
}
function mergeConfigs(...configs) {
  const copy = {};
  for (const options of configs.filter((c) => !!c)) {
    for (const key of Object.keys(options)) {
      if (key === "metadata") {
        copy[key] = { ...copy[key], ...options[key] };
      } else if (key === "tags") {
        const baseKeys = copy[key] ?? [];
        copy[key] = [...new Set(baseKeys.concat(options[key] ?? []))];
      } else if (key === "configurable") {
        copy[key] = { ...copy[key], ...options[key] };
      } else if (key === "timeout") {
        if (copy.timeout === void 0) {
          copy.timeout = options.timeout;
        } else if (options.timeout !== void 0) {
          copy.timeout = Math.min(copy.timeout, options.timeout);
        }
      } else if (key === "signal") {
        if (copy.signal === void 0) {
          copy.signal = options.signal;
        } else if (options.signal !== void 0) {
          if ("any" in AbortSignal) {
            copy.signal = AbortSignal.any([
              copy.signal,
              options.signal
            ]);
          } else {
            copy.signal = options.signal;
          }
        }
      } else if (key === "callbacks") {
        const baseCallbacks = copy.callbacks;
        const providedCallbacks = options.callbacks;
        if (Array.isArray(providedCallbacks)) {
          if (!baseCallbacks) {
            copy.callbacks = providedCallbacks;
          } else if (Array.isArray(baseCallbacks)) {
            copy.callbacks = baseCallbacks.concat(providedCallbacks);
          } else {
            const manager = baseCallbacks.copy();
            for (const callback of providedCallbacks) {
              manager.addHandler(ensureHandler(callback), true);
            }
            copy.callbacks = manager;
          }
        } else if (providedCallbacks) {
          if (!baseCallbacks) {
            copy.callbacks = providedCallbacks;
          } else if (Array.isArray(baseCallbacks)) {
            const manager = providedCallbacks.copy();
            for (const callback of baseCallbacks) {
              manager.addHandler(ensureHandler(callback), true);
            }
            copy.callbacks = manager;
          } else {
            copy.callbacks = new CallbackManager(providedCallbacks._parentRunId, {
              handlers: baseCallbacks.handlers.concat(providedCallbacks.handlers),
              inheritableHandlers: baseCallbacks.inheritableHandlers.concat(providedCallbacks.inheritableHandlers),
              tags: Array.from(new Set(baseCallbacks.tags.concat(providedCallbacks.tags))),
              inheritableTags: Array.from(new Set(baseCallbacks.inheritableTags.concat(providedCallbacks.inheritableTags))),
              metadata: {
                ...baseCallbacks.metadata,
                ...providedCallbacks.metadata
              }
            });
          }
        }
      } else {
        const typedKey = key;
        copy[typedKey] = options[typedKey] ?? copy[typedKey];
      }
    }
  }
  return copy;
}
function ensureConfig(config) {
  const implicitConfig = AsyncLocalStorageProviderSingleton2.getRunnableConfig();
  let empty = {
    tags: [],
    metadata: {},
    recursionLimit: 25,
    runId: void 0
  };
  if (implicitConfig) {
    const { runId, runName, ...rest } = implicitConfig;
    empty = Object.entries(rest).reduce(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (currentConfig, [key, value]) => {
        if (value !== void 0) {
          currentConfig[key] = value;
        }
        return currentConfig;
      },
      empty
    );
  }
  if (config) {
    empty = Object.entries(config).reduce(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (currentConfig, [key, value]) => {
        if (value !== void 0) {
          currentConfig[key] = value;
        }
        return currentConfig;
      },
      empty
    );
  }
  if (empty?.configurable) {
    for (const key of Object.keys(empty.configurable)) {
      if (PRIMITIVES.has(typeof empty.configurable[key]) && !empty.metadata?.[key]) {
        if (!empty.metadata) {
          empty.metadata = {};
        }
        empty.metadata[key] = empty.configurable[key];
      }
    }
  }
  if (empty.timeout !== void 0) {
    if (empty.timeout <= 0) {
      throw new Error("Timeout must be a positive number");
    }
    const timeoutSignal = AbortSignal.timeout(empty.timeout);
    if (empty.signal !== void 0) {
      if ("any" in AbortSignal) {
        empty.signal = AbortSignal.any([empty.signal, timeoutSignal]);
      }
    } else {
      empty.signal = timeoutSignal;
    }
    delete empty.timeout;
  }
  return empty;
}
function patchConfig(config = {}, { callbacks, maxConcurrency, recursionLimit, runName, configurable, runId } = {}) {
  const newConfig = ensureConfig(config);
  if (callbacks !== void 0) {
    delete newConfig.runName;
    newConfig.callbacks = callbacks;
  }
  if (recursionLimit !== void 0) {
    newConfig.recursionLimit = recursionLimit;
  }
  if (maxConcurrency !== void 0) {
    newConfig.maxConcurrency = maxConcurrency;
  }
  if (runName !== void 0) {
    newConfig.runName = runName;
  }
  if (configurable !== void 0) {
    newConfig.configurable = { ...newConfig.configurable, ...configurable };
  }
  if (runId !== void 0) {
    delete newConfig.runId;
  }
  return newConfig;
}
function pickRunnableConfigKeys(config) {
  return config ? {
    configurable: config.configurable,
    recursionLimit: config.recursionLimit,
    callbacks: config.callbacks,
    tags: config.tags,
    metadata: config.metadata,
    maxConcurrency: config.maxConcurrency,
    timeout: config.timeout,
    signal: config.signal
  } : void 0;
}
var DEFAULT_RECURSION_LIMIT, PRIMITIVES;
var init_config = __esm({
  "node_modules/@langchain/core/dist/runnables/config.js"() {
    init_manager();
    init_singletons();
    DEFAULT_RECURSION_LIMIT = 25;
    PRIMITIVES = /* @__PURE__ */ new Set(["string", "number", "boolean"]);
  }
});

// node_modules/@langchain/core/dist/utils/signal.js
async function raceWithSignal(promise, signal) {
  if (signal === void 0) {
    return promise;
  }
  let listener;
  return Promise.race([
    promise.catch((err) => {
      if (!signal?.aborted) {
        throw err;
      } else {
        return void 0;
      }
    }),
    new Promise((_, reject) => {
      listener = () => {
        reject(new Error("Aborted"));
      };
      signal.addEventListener("abort", listener);
      if (signal.aborted) {
        reject(new Error("Aborted"));
      }
    })
  ]).finally(() => signal.removeEventListener("abort", listener));
}
var init_signal = __esm({
  "node_modules/@langchain/core/dist/utils/signal.js"() {
  }
});

// node_modules/@langchain/core/dist/utils/stream.js
function atee(iter, length = 2) {
  const buffers = Array.from({ length }, () => []);
  return buffers.map(async function* makeIter(buffer) {
    while (true) {
      if (buffer.length === 0) {
        const result = await iter.next();
        for (const buffer2 of buffers) {
          buffer2.push(result);
        }
      } else if (buffer[0].done) {
        return;
      } else {
        yield buffer.shift().value;
      }
    }
  });
}
function concat(first, second) {
  if (Array.isArray(first) && Array.isArray(second)) {
    return first.concat(second);
  } else if (typeof first === "string" && typeof second === "string") {
    return first + second;
  } else if (typeof first === "number" && typeof second === "number") {
    return first + second;
  } else if (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    "concat" in first && // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof first.concat === "function"
  ) {
    return first.concat(second);
  } else if (typeof first === "object" && typeof second === "object") {
    const chunk = { ...first };
    for (const [key, value] of Object.entries(second)) {
      if (key in chunk && !Array.isArray(chunk[key])) {
        chunk[key] = concat(chunk[key], value);
      } else {
        chunk[key] = value;
      }
    }
    return chunk;
  } else {
    throw new Error(`Cannot concat ${typeof first} and ${typeof second}`);
  }
}
async function pipeGeneratorWithSetup(to, generator, startSetup, signal, ...args) {
  const gen = new AsyncGeneratorWithSetup({
    generator,
    startSetup,
    signal
  });
  const setup = await gen.setup;
  return { output: to(gen, setup, ...args), setup };
}
var IterableReadableStream, AsyncGeneratorWithSetup;
var init_stream = __esm({
  "node_modules/@langchain/core/dist/utils/stream.js"() {
    init_config();
    init_singletons();
    init_signal();
    IterableReadableStream = class _IterableReadableStream extends ReadableStream {
      constructor() {
        super(...arguments);
        Object.defineProperty(this, "reader", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
      }
      ensureReader() {
        if (!this.reader) {
          this.reader = this.getReader();
        }
      }
      async next() {
        this.ensureReader();
        try {
          const result = await this.reader.read();
          if (result.done) {
            this.reader.releaseLock();
            return {
              done: true,
              value: void 0
            };
          } else {
            return {
              done: false,
              value: result.value
            };
          }
        } catch (e) {
          this.reader.releaseLock();
          throw e;
        }
      }
      async return() {
        this.ensureReader();
        if (this.locked) {
          const cancelPromise = this.reader.cancel();
          this.reader.releaseLock();
          await cancelPromise;
        }
        return { done: true, value: void 0 };
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async throw(e) {
        this.ensureReader();
        if (this.locked) {
          const cancelPromise = this.reader.cancel();
          this.reader.releaseLock();
          await cancelPromise;
        }
        throw e;
      }
      [Symbol.asyncIterator]() {
        return this;
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore Not present in Node 18 types, required in latest Node 22
      async [Symbol.asyncDispose]() {
        await this.return();
      }
      static fromReadableStream(stream) {
        const reader = stream.getReader();
        return new _IterableReadableStream({
          start(controller) {
            return pump();
            function pump() {
              return reader.read().then(({ done, value }) => {
                if (done) {
                  controller.close();
                  return;
                }
                controller.enqueue(value);
                return pump();
              });
            }
          },
          cancel() {
            reader.releaseLock();
          }
        });
      }
      static fromAsyncGenerator(generator) {
        return new _IterableReadableStream({
          async pull(controller) {
            const { value, done } = await generator.next();
            if (done) {
              controller.close();
            }
            controller.enqueue(value);
          },
          async cancel(reason) {
            await generator.return(reason);
          }
        });
      }
    };
    AsyncGeneratorWithSetup = class {
      constructor(params) {
        Object.defineProperty(this, "generator", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "setup", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "config", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "signal", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "firstResult", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "firstResultUsed", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: false
        });
        this.generator = params.generator;
        this.config = params.config;
        this.signal = params.signal ?? this.config?.signal;
        this.setup = new Promise((resolve, reject) => {
          void AsyncLocalStorageProviderSingleton2.runWithConfig(pickRunnableConfigKeys(params.config), async () => {
            this.firstResult = params.generator.next();
            if (params.startSetup) {
              this.firstResult.then(params.startSetup).then(resolve, reject);
            } else {
              this.firstResult.then((_result) => resolve(void 0), reject);
            }
          }, true);
        });
      }
      async next(...args) {
        this.signal?.throwIfAborted();
        if (!this.firstResultUsed) {
          this.firstResultUsed = true;
          return this.firstResult;
        }
        return AsyncLocalStorageProviderSingleton2.runWithConfig(pickRunnableConfigKeys(this.config), this.signal ? async () => {
          return raceWithSignal(this.generator.next(...args), this.signal);
        } : async () => {
          return this.generator.next(...args);
        }, true);
      }
      async return(value) {
        return this.generator.return(value);
      }
      async throw(e) {
        return this.generator.throw(e);
      }
      [Symbol.asyncIterator]() {
        return this;
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore Not present in Node 18 types, required in latest Node 22
      async [Symbol.asyncDispose]() {
        await this.return();
      }
    };
  }
});

// node_modules/@langchain/core/dist/tracers/log_stream.js
async function _getStandardizedInputs(run, schemaFormat) {
  if (schemaFormat === "original") {
    throw new Error("Do not assign inputs with original schema drop the key for now. When inputs are added to streamLog they should be added with standardized schema for streaming events.");
  }
  const { inputs } = run;
  if (["retriever", "llm", "prompt"].includes(run.run_type)) {
    return inputs;
  }
  if (Object.keys(inputs).length === 1 && inputs?.input === "") {
    return void 0;
  }
  return inputs.input;
}
async function _getStandardizedOutputs(run, schemaFormat) {
  const { outputs } = run;
  if (schemaFormat === "original") {
    return outputs;
  }
  if (["retriever", "llm", "prompt"].includes(run.run_type)) {
    return outputs;
  }
  if (outputs !== void 0 && Object.keys(outputs).length === 1 && outputs?.output !== void 0) {
    return outputs.output;
  }
  return outputs;
}
function isChatGenerationChunk(x) {
  return x !== void 0 && x.message !== void 0;
}
var RunLogPatch, RunLog, isLogStreamHandler, LogStreamCallbackHandler;
var init_log_stream = __esm({
  "node_modules/@langchain/core/dist/tracers/log_stream.js"() {
    init_fast_json_patch();
    init_base2();
    init_stream();
    init_ai();
    RunLogPatch = class {
      constructor(fields) {
        Object.defineProperty(this, "ops", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.ops = fields.ops ?? [];
      }
      concat(other) {
        const ops = this.ops.concat(other.ops);
        const states = applyPatch({}, ops);
        return new RunLog({
          ops,
          state: states[states.length - 1].newDocument
        });
      }
    };
    RunLog = class _RunLog extends RunLogPatch {
      constructor(fields) {
        super(fields);
        Object.defineProperty(this, "state", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.state = fields.state;
      }
      concat(other) {
        const ops = this.ops.concat(other.ops);
        const states = applyPatch(this.state, other.ops);
        return new _RunLog({ ops, state: states[states.length - 1].newDocument });
      }
      static fromRunLogPatch(patch) {
        const states = applyPatch({}, patch.ops);
        return new _RunLog({
          ops: patch.ops,
          state: states[states.length - 1].newDocument
        });
      }
    };
    isLogStreamHandler = (handler) => handler.name === "log_stream_tracer";
    LogStreamCallbackHandler = class extends BaseTracer {
      constructor(fields) {
        super({ _awaitHandler: true, ...fields });
        Object.defineProperty(this, "autoClose", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        Object.defineProperty(this, "includeNames", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "includeTypes", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "includeTags", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "excludeNames", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "excludeTypes", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "excludeTags", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "_schemaFormat", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "original"
        });
        Object.defineProperty(this, "rootId", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "keyMapByRunId", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: {}
        });
        Object.defineProperty(this, "counterMapByRunName", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: {}
        });
        Object.defineProperty(this, "transformStream", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "writer", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "receiveStream", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "log_stream_tracer"
        });
        Object.defineProperty(this, "lc_prefer_streaming", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        this.autoClose = fields?.autoClose ?? true;
        this.includeNames = fields?.includeNames;
        this.includeTypes = fields?.includeTypes;
        this.includeTags = fields?.includeTags;
        this.excludeNames = fields?.excludeNames;
        this.excludeTypes = fields?.excludeTypes;
        this.excludeTags = fields?.excludeTags;
        this._schemaFormat = fields?._schemaFormat ?? this._schemaFormat;
        this.transformStream = new TransformStream();
        this.writer = this.transformStream.writable.getWriter();
        this.receiveStream = IterableReadableStream.fromReadableStream(this.transformStream.readable);
      }
      [Symbol.asyncIterator]() {
        return this.receiveStream;
      }
      async persistRun(_run) {
      }
      _includeRun(run) {
        if (run.id === this.rootId) {
          return false;
        }
        const runTags = run.tags ?? [];
        let include = this.includeNames === void 0 && this.includeTags === void 0 && this.includeTypes === void 0;
        if (this.includeNames !== void 0) {
          include = include || this.includeNames.includes(run.name);
        }
        if (this.includeTypes !== void 0) {
          include = include || this.includeTypes.includes(run.run_type);
        }
        if (this.includeTags !== void 0) {
          include = include || runTags.find((tag) => this.includeTags?.includes(tag)) !== void 0;
        }
        if (this.excludeNames !== void 0) {
          include = include && !this.excludeNames.includes(run.name);
        }
        if (this.excludeTypes !== void 0) {
          include = include && !this.excludeTypes.includes(run.run_type);
        }
        if (this.excludeTags !== void 0) {
          include = include && runTags.every((tag) => !this.excludeTags?.includes(tag));
        }
        return include;
      }
      async *tapOutputIterable(runId, output) {
        for await (const chunk of output) {
          if (runId !== this.rootId) {
            const key = this.keyMapByRunId[runId];
            if (key) {
              await this.writer.write(new RunLogPatch({
                ops: [
                  {
                    op: "add",
                    path: `/logs/${key}/streamed_output/-`,
                    value: chunk
                  }
                ]
              }));
            }
          }
          yield chunk;
        }
      }
      async onRunCreate(run) {
        if (this.rootId === void 0) {
          this.rootId = run.id;
          await this.writer.write(new RunLogPatch({
            ops: [
              {
                op: "replace",
                path: "",
                value: {
                  id: run.id,
                  name: run.name,
                  type: run.run_type,
                  streamed_output: [],
                  final_output: void 0,
                  logs: {}
                }
              }
            ]
          }));
        }
        if (!this._includeRun(run)) {
          return;
        }
        if (this.counterMapByRunName[run.name] === void 0) {
          this.counterMapByRunName[run.name] = 0;
        }
        this.counterMapByRunName[run.name] += 1;
        const count = this.counterMapByRunName[run.name];
        this.keyMapByRunId[run.id] = count === 1 ? run.name : `${run.name}:${count}`;
        const logEntry = {
          id: run.id,
          name: run.name,
          type: run.run_type,
          tags: run.tags ?? [],
          metadata: run.extra?.metadata ?? {},
          start_time: new Date(run.start_time).toISOString(),
          streamed_output: [],
          streamed_output_str: [],
          final_output: void 0,
          end_time: void 0
        };
        if (this._schemaFormat === "streaming_events") {
          logEntry.inputs = await _getStandardizedInputs(run, this._schemaFormat);
        }
        await this.writer.write(new RunLogPatch({
          ops: [
            {
              op: "add",
              path: `/logs/${this.keyMapByRunId[run.id]}`,
              value: logEntry
            }
          ]
        }));
      }
      async onRunUpdate(run) {
        try {
          const runName = this.keyMapByRunId[run.id];
          if (runName === void 0) {
            return;
          }
          const ops = [];
          if (this._schemaFormat === "streaming_events") {
            ops.push({
              op: "replace",
              path: `/logs/${runName}/inputs`,
              value: await _getStandardizedInputs(run, this._schemaFormat)
            });
          }
          ops.push({
            op: "add",
            path: `/logs/${runName}/final_output`,
            value: await _getStandardizedOutputs(run, this._schemaFormat)
          });
          if (run.end_time !== void 0) {
            ops.push({
              op: "add",
              path: `/logs/${runName}/end_time`,
              value: new Date(run.end_time).toISOString()
            });
          }
          const patch = new RunLogPatch({ ops });
          await this.writer.write(patch);
        } finally {
          if (run.id === this.rootId) {
            const patch = new RunLogPatch({
              ops: [
                {
                  op: "replace",
                  path: "/final_output",
                  value: await _getStandardizedOutputs(run, this._schemaFormat)
                }
              ]
            });
            await this.writer.write(patch);
            if (this.autoClose) {
              await this.writer.close();
            }
          }
        }
      }
      async onLLMNewToken(run, token, kwargs) {
        const runName = this.keyMapByRunId[run.id];
        if (runName === void 0) {
          return;
        }
        const isChatModel = run.inputs.messages !== void 0;
        let streamedOutputValue;
        if (isChatModel) {
          if (isChatGenerationChunk(kwargs?.chunk)) {
            streamedOutputValue = kwargs?.chunk;
          } else {
            streamedOutputValue = new AIMessageChunk({
              id: `run-${run.id}`,
              content: token
            });
          }
        } else {
          streamedOutputValue = token;
        }
        const patch = new RunLogPatch({
          ops: [
            {
              op: "add",
              path: `/logs/${runName}/streamed_output_str/-`,
              value: token
            },
            {
              op: "add",
              path: `/logs/${runName}/streamed_output/-`,
              value: streamedOutputValue
            }
          ]
        });
        await this.writer.write(patch);
      }
    };
  }
});

// node_modules/@langchain/core/dist/outputs.js
var GenerationChunk;
var init_outputs = __esm({
  "node_modules/@langchain/core/dist/outputs.js"() {
    GenerationChunk = class _GenerationChunk {
      constructor(fields) {
        Object.defineProperty(this, "text", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "generationInfo", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.text = fields.text;
        this.generationInfo = fields.generationInfo;
      }
      concat(chunk) {
        return new _GenerationChunk({
          text: this.text + chunk.text,
          generationInfo: {
            ...this.generationInfo,
            ...chunk.generationInfo
          }
        });
      }
    };
  }
});

// node_modules/@langchain/core/dist/tracers/event_stream.js
function assignName({ name, serialized }) {
  if (name !== void 0) {
    return name;
  }
  if (serialized?.name !== void 0) {
    return serialized.name;
  } else if (serialized?.id !== void 0 && Array.isArray(serialized?.id)) {
    return serialized.id[serialized.id.length - 1];
  }
  return "Unnamed";
}
var isStreamEventsHandler, EventStreamCallbackHandler;
var init_event_stream = __esm({
  "node_modules/@langchain/core/dist/tracers/event_stream.js"() {
    init_base2();
    init_stream();
    init_ai();
    init_outputs();
    isStreamEventsHandler = (handler) => handler.name === "event_stream_tracer";
    EventStreamCallbackHandler = class extends BaseTracer {
      constructor(fields) {
        super({ _awaitHandler: true, ...fields });
        Object.defineProperty(this, "autoClose", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        Object.defineProperty(this, "includeNames", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "includeTypes", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "includeTags", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "excludeNames", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "excludeTypes", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "excludeTags", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "runInfoMap", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: /* @__PURE__ */ new Map()
        });
        Object.defineProperty(this, "tappedPromises", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: /* @__PURE__ */ new Map()
        });
        Object.defineProperty(this, "transformStream", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "writer", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "receiveStream", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "event_stream_tracer"
        });
        Object.defineProperty(this, "lc_prefer_streaming", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        this.autoClose = fields?.autoClose ?? true;
        this.includeNames = fields?.includeNames;
        this.includeTypes = fields?.includeTypes;
        this.includeTags = fields?.includeTags;
        this.excludeNames = fields?.excludeNames;
        this.excludeTypes = fields?.excludeTypes;
        this.excludeTags = fields?.excludeTags;
        this.transformStream = new TransformStream();
        this.writer = this.transformStream.writable.getWriter();
        this.receiveStream = IterableReadableStream.fromReadableStream(this.transformStream.readable);
      }
      [Symbol.asyncIterator]() {
        return this.receiveStream;
      }
      async persistRun(_run) {
      }
      _includeRun(run) {
        const runTags = run.tags ?? [];
        let include = this.includeNames === void 0 && this.includeTags === void 0 && this.includeTypes === void 0;
        if (this.includeNames !== void 0) {
          include = include || this.includeNames.includes(run.name);
        }
        if (this.includeTypes !== void 0) {
          include = include || this.includeTypes.includes(run.runType);
        }
        if (this.includeTags !== void 0) {
          include = include || runTags.find((tag) => this.includeTags?.includes(tag)) !== void 0;
        }
        if (this.excludeNames !== void 0) {
          include = include && !this.excludeNames.includes(run.name);
        }
        if (this.excludeTypes !== void 0) {
          include = include && !this.excludeTypes.includes(run.runType);
        }
        if (this.excludeTags !== void 0) {
          include = include && runTags.every((tag) => !this.excludeTags?.includes(tag));
        }
        return include;
      }
      async *tapOutputIterable(runId, outputStream) {
        const firstChunk = await outputStream.next();
        if (firstChunk.done) {
          return;
        }
        const runInfo = this.runInfoMap.get(runId);
        if (runInfo === void 0) {
          yield firstChunk.value;
          return;
        }
        function _formatOutputChunk(eventType, data) {
          if (eventType === "llm" && typeof data === "string") {
            return new GenerationChunk({ text: data });
          }
          return data;
        }
        let tappedPromise = this.tappedPromises.get(runId);
        if (tappedPromise === void 0) {
          let tappedPromiseResolver;
          tappedPromise = new Promise((resolve) => {
            tappedPromiseResolver = resolve;
          });
          this.tappedPromises.set(runId, tappedPromise);
          try {
            const event = {
              event: `on_${runInfo.runType}_stream`,
              run_id: runId,
              name: runInfo.name,
              tags: runInfo.tags,
              metadata: runInfo.metadata,
              data: {}
            };
            await this.send({
              ...event,
              data: {
                chunk: _formatOutputChunk(runInfo.runType, firstChunk.value)
              }
            }, runInfo);
            yield firstChunk.value;
            for await (const chunk of outputStream) {
              if (runInfo.runType !== "tool" && runInfo.runType !== "retriever") {
                await this.send({
                  ...event,
                  data: {
                    chunk: _formatOutputChunk(runInfo.runType, chunk)
                  }
                }, runInfo);
              }
              yield chunk;
            }
          } finally {
            tappedPromiseResolver();
          }
        } else {
          yield firstChunk.value;
          for await (const chunk of outputStream) {
            yield chunk;
          }
        }
      }
      async send(payload, run) {
        if (this._includeRun(run)) {
          await this.writer.write(payload);
        }
      }
      async sendEndEvent(payload, run) {
        const tappedPromise = this.tappedPromises.get(payload.run_id);
        if (tappedPromise !== void 0) {
          void tappedPromise.then(() => {
            void this.send(payload, run);
          });
        } else {
          await this.send(payload, run);
        }
      }
      async onLLMStart(run) {
        const runName = assignName(run);
        const runType = run.inputs.messages !== void 0 ? "chat_model" : "llm";
        const runInfo = {
          tags: run.tags ?? [],
          metadata: run.extra?.metadata ?? {},
          name: runName,
          runType,
          inputs: run.inputs
        };
        this.runInfoMap.set(run.id, runInfo);
        const eventName = `on_${runType}_start`;
        await this.send({
          event: eventName,
          data: {
            input: run.inputs
          },
          name: runName,
          tags: run.tags ?? [],
          run_id: run.id,
          metadata: run.extra?.metadata ?? {}
        }, runInfo);
      }
      async onLLMNewToken(run, token, kwargs) {
        const runInfo = this.runInfoMap.get(run.id);
        let chunk;
        let eventName;
        if (runInfo === void 0) {
          throw new Error(`onLLMNewToken: Run ID ${run.id} not found in run map.`);
        }
        if (this.runInfoMap.size === 1) {
          return;
        }
        if (runInfo.runType === "chat_model") {
          eventName = "on_chat_model_stream";
          if (kwargs?.chunk === void 0) {
            chunk = new AIMessageChunk({ content: token, id: `run-${run.id}` });
          } else {
            chunk = kwargs.chunk.message;
          }
        } else if (runInfo.runType === "llm") {
          eventName = "on_llm_stream";
          if (kwargs?.chunk === void 0) {
            chunk = new GenerationChunk({ text: token });
          } else {
            chunk = kwargs.chunk;
          }
        } else {
          throw new Error(`Unexpected run type ${runInfo.runType}`);
        }
        await this.send({
          event: eventName,
          data: {
            chunk
          },
          run_id: run.id,
          name: runInfo.name,
          tags: runInfo.tags,
          metadata: runInfo.metadata
        }, runInfo);
      }
      async onLLMEnd(run) {
        const runInfo = this.runInfoMap.get(run.id);
        this.runInfoMap.delete(run.id);
        let eventName;
        if (runInfo === void 0) {
          throw new Error(`onLLMEnd: Run ID ${run.id} not found in run map.`);
        }
        const generations = run.outputs?.generations;
        let output;
        if (runInfo.runType === "chat_model") {
          for (const generation of generations ?? []) {
            if (output !== void 0) {
              break;
            }
            output = generation[0]?.message;
          }
          eventName = "on_chat_model_end";
        } else if (runInfo.runType === "llm") {
          output = {
            generations: generations?.map((generation) => {
              return generation.map((chunk) => {
                return {
                  text: chunk.text,
                  generationInfo: chunk.generationInfo
                };
              });
            }),
            llmOutput: run.outputs?.llmOutput ?? {}
          };
          eventName = "on_llm_end";
        } else {
          throw new Error(`onLLMEnd: Unexpected run type: ${runInfo.runType}`);
        }
        await this.sendEndEvent({
          event: eventName,
          data: {
            output,
            input: runInfo.inputs
          },
          run_id: run.id,
          name: runInfo.name,
          tags: runInfo.tags,
          metadata: runInfo.metadata
        }, runInfo);
      }
      async onChainStart(run) {
        const runName = assignName(run);
        const runType = run.run_type ?? "chain";
        const runInfo = {
          tags: run.tags ?? [],
          metadata: run.extra?.metadata ?? {},
          name: runName,
          runType: run.run_type
        };
        let eventData = {};
        if (run.inputs.input === "" && Object.keys(run.inputs).length === 1) {
          eventData = {};
          runInfo.inputs = {};
        } else if (run.inputs.input !== void 0) {
          eventData.input = run.inputs.input;
          runInfo.inputs = run.inputs.input;
        } else {
          eventData.input = run.inputs;
          runInfo.inputs = run.inputs;
        }
        this.runInfoMap.set(run.id, runInfo);
        await this.send({
          event: `on_${runType}_start`,
          data: eventData,
          name: runName,
          tags: run.tags ?? [],
          run_id: run.id,
          metadata: run.extra?.metadata ?? {}
        }, runInfo);
      }
      async onChainEnd(run) {
        const runInfo = this.runInfoMap.get(run.id);
        this.runInfoMap.delete(run.id);
        if (runInfo === void 0) {
          throw new Error(`onChainEnd: Run ID ${run.id} not found in run map.`);
        }
        const eventName = `on_${run.run_type}_end`;
        const inputs = run.inputs ?? runInfo.inputs ?? {};
        const outputs = run.outputs?.output ?? run.outputs;
        const data = {
          output: outputs,
          input: inputs
        };
        if (inputs.input && Object.keys(inputs).length === 1) {
          data.input = inputs.input;
          runInfo.inputs = inputs.input;
        }
        await this.sendEndEvent({
          event: eventName,
          data,
          run_id: run.id,
          name: runInfo.name,
          tags: runInfo.tags,
          metadata: runInfo.metadata ?? {}
        }, runInfo);
      }
      async onToolStart(run) {
        const runName = assignName(run);
        const runInfo = {
          tags: run.tags ?? [],
          metadata: run.extra?.metadata ?? {},
          name: runName,
          runType: "tool",
          inputs: run.inputs ?? {}
        };
        this.runInfoMap.set(run.id, runInfo);
        await this.send({
          event: "on_tool_start",
          data: {
            input: run.inputs ?? {}
          },
          name: runName,
          run_id: run.id,
          tags: run.tags ?? [],
          metadata: run.extra?.metadata ?? {}
        }, runInfo);
      }
      async onToolEnd(run) {
        const runInfo = this.runInfoMap.get(run.id);
        this.runInfoMap.delete(run.id);
        if (runInfo === void 0) {
          throw new Error(`onToolEnd: Run ID ${run.id} not found in run map.`);
        }
        if (runInfo.inputs === void 0) {
          throw new Error(`onToolEnd: Run ID ${run.id} is a tool call, and is expected to have traced inputs.`);
        }
        const output = run.outputs?.output === void 0 ? run.outputs : run.outputs.output;
        await this.sendEndEvent({
          event: "on_tool_end",
          data: {
            output,
            input: runInfo.inputs
          },
          run_id: run.id,
          name: runInfo.name,
          tags: runInfo.tags,
          metadata: runInfo.metadata
        }, runInfo);
      }
      async onRetrieverStart(run) {
        const runName = assignName(run);
        const runType = "retriever";
        const runInfo = {
          tags: run.tags ?? [],
          metadata: run.extra?.metadata ?? {},
          name: runName,
          runType,
          inputs: {
            query: run.inputs.query
          }
        };
        this.runInfoMap.set(run.id, runInfo);
        await this.send({
          event: "on_retriever_start",
          data: {
            input: {
              query: run.inputs.query
            }
          },
          name: runName,
          tags: run.tags ?? [],
          run_id: run.id,
          metadata: run.extra?.metadata ?? {}
        }, runInfo);
      }
      async onRetrieverEnd(run) {
        const runInfo = this.runInfoMap.get(run.id);
        this.runInfoMap.delete(run.id);
        if (runInfo === void 0) {
          throw new Error(`onRetrieverEnd: Run ID ${run.id} not found in run map.`);
        }
        await this.sendEndEvent({
          event: "on_retriever_end",
          data: {
            output: run.outputs?.documents ?? run.outputs,
            input: runInfo.inputs
          },
          run_id: run.id,
          name: runInfo.name,
          tags: runInfo.tags,
          metadata: runInfo.metadata
        }, runInfo);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async handleCustomEvent(eventName, data, runId) {
        const runInfo = this.runInfoMap.get(runId);
        if (runInfo === void 0) {
          throw new Error(`handleCustomEvent: Run ID ${runId} not found in run map.`);
        }
        await this.send({
          event: "on_custom_event",
          run_id: runId,
          name: eventName,
          tags: runInfo.tags,
          metadata: runInfo.metadata,
          data
        }, runInfo);
      }
      async finish() {
        const pendingPromises = [...this.tappedPromises.values()];
        void Promise.all(pendingPromises).finally(() => {
          void this.writer.close();
        });
      }
    };
  }
});

// node_modules/@langchain/core/dist/utils/async_caller.js
var import_p_retry2, import_p_queue3, STATUS_NO_RETRY, defaultFailedAttemptHandler, AsyncCaller2;
var init_async_caller2 = __esm({
  "node_modules/@langchain/core/dist/utils/async_caller.js"() {
    import_p_retry2 = __toESM(require_p_retry(), 1);
    import_p_queue3 = __toESM(require_dist(), 1);
    STATUS_NO_RETRY = [
      400,
      // Bad Request
      401,
      // Unauthorized
      402,
      // Payment Required
      403,
      // Forbidden
      404,
      // Not Found
      405,
      // Method Not Allowed
      406,
      // Not Acceptable
      407,
      // Proxy Authentication Required
      409
      // Conflict
    ];
    defaultFailedAttemptHandler = (error) => {
      if (error.message.startsWith("Cancel") || error.message.startsWith("AbortError") || error.name === "AbortError") {
        throw error;
      }
      if (error?.code === "ECONNABORTED") {
        throw error;
      }
      const status = (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error?.response?.status ?? error?.status
      );
      if (status && STATUS_NO_RETRY.includes(+status)) {
        throw error;
      }
      if (error?.error?.code === "insufficient_quota") {
        const err = new Error(error?.message);
        err.name = "InsufficientQuotaError";
        throw err;
      }
    };
    AsyncCaller2 = class {
      constructor(params) {
        Object.defineProperty(this, "maxConcurrency", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "maxRetries", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "onFailedAttempt", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "queue", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.maxConcurrency = params.maxConcurrency ?? Infinity;
        this.maxRetries = params.maxRetries ?? 6;
        this.onFailedAttempt = params.onFailedAttempt ?? defaultFailedAttemptHandler;
        const PQueue = "default" in import_p_queue3.default ? import_p_queue3.default.default : import_p_queue3.default;
        this.queue = new PQueue({ concurrency: this.maxConcurrency });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      call(callable, ...args) {
        return this.queue.add(() => (0, import_p_retry2.default)(() => callable(...args).catch((error) => {
          if (error instanceof Error) {
            throw error;
          } else {
            throw new Error(error);
          }
        }), {
          onFailedAttempt: this.onFailedAttempt,
          retries: this.maxRetries,
          randomize: true
          // If needed we can change some of the defaults here,
          // but they're quite sensible.
        }), { throwOnTimeout: true });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      callWithOptions(options, callable, ...args) {
        if (options.signal) {
          return Promise.race([
            this.call(callable, ...args),
            new Promise((_, reject) => {
              options.signal?.addEventListener("abort", () => {
                reject(new Error("AbortError"));
              });
            })
          ]);
        }
        return this.call(callable, ...args);
      }
      fetch(...args) {
        return this.call(() => fetch(...args).then((res) => res.ok ? res : Promise.reject(res)));
      }
    };
  }
});

// node_modules/@langchain/core/dist/tracers/root_listener.js
var RootListenersTracer;
var init_root_listener = __esm({
  "node_modules/@langchain/core/dist/tracers/root_listener.js"() {
    init_base2();
    RootListenersTracer = class extends BaseTracer {
      constructor({ config, onStart, onEnd, onError }) {
        super({ _awaitHandler: true });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "RootListenersTracer"
        });
        Object.defineProperty(this, "rootId", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "config", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "argOnStart", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "argOnEnd", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "argOnError", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.config = config;
        this.argOnStart = onStart;
        this.argOnEnd = onEnd;
        this.argOnError = onError;
      }
      /**
       * This is a legacy method only called once for an entire run tree
       * therefore not useful here
       * @param {Run} _ Not used
       */
      persistRun(_) {
        return Promise.resolve();
      }
      async onRunCreate(run) {
        if (this.rootId) {
          return;
        }
        this.rootId = run.id;
        if (this.argOnStart) {
          await this.argOnStart(run, this.config);
        }
      }
      async onRunUpdate(run) {
        if (run.id !== this.rootId) {
          return;
        }
        if (!run.error) {
          if (this.argOnEnd) {
            await this.argOnEnd(run, this.config);
          }
        } else if (this.argOnError) {
          await this.argOnError(run, this.config);
        }
      }
    };
  }
});

// node_modules/@langchain/core/dist/runnables/utils.js
function isRunnableInterface(thing) {
  return thing ? thing.lc_runnable : false;
}
var _RootEventFilter;
var init_utils3 = __esm({
  "node_modules/@langchain/core/dist/runnables/utils.js"() {
    _RootEventFilter = class {
      constructor(fields) {
        Object.defineProperty(this, "includeNames", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "includeTypes", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "includeTags", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "excludeNames", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "excludeTypes", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "excludeTags", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.includeNames = fields.includeNames;
        this.includeTypes = fields.includeTypes;
        this.includeTags = fields.includeTags;
        this.excludeNames = fields.excludeNames;
        this.excludeTypes = fields.excludeTypes;
        this.excludeTags = fields.excludeTags;
      }
      includeEvent(event, rootType) {
        let include = this.includeNames === void 0 && this.includeTypes === void 0 && this.includeTags === void 0;
        const eventTags = event.tags ?? [];
        if (this.includeNames !== void 0) {
          include = include || this.includeNames.includes(event.name);
        }
        if (this.includeTypes !== void 0) {
          include = include || this.includeTypes.includes(rootType);
        }
        if (this.includeTags !== void 0) {
          include = include || eventTags.some((tag) => this.includeTags?.includes(tag));
        }
        if (this.excludeNames !== void 0) {
          include = include && !this.excludeNames.includes(event.name);
        }
        if (this.excludeTypes !== void 0) {
          include = include && !this.excludeTypes.includes(rootType);
        }
        if (this.excludeTags !== void 0) {
          include = include && eventTags.every((tag) => !this.excludeTags?.includes(tag));
        }
        return include;
      }
    };
  }
});

// node_modules/@langchain/core/dist/runnables/graph_mermaid.js
function _escapeNodeLabel(nodeLabel) {
  return nodeLabel.replace(/[^a-zA-Z-_0-9]/g, "_");
}
function _generateMermaidGraphStyles(nodeColors) {
  let styles2 = "";
  for (const [className, color2] of Object.entries(nodeColors)) {
    styles2 += `	classDef ${className} ${color2};
`;
  }
  return styles2;
}
function drawMermaid(nodes, edges, config) {
  const { firstNode, lastNode, nodeColors, withStyles = true, curveStyle = "linear", wrapLabelNWords = 9 } = config ?? {};
  let mermaidGraph = withStyles ? `%%{init: {'flowchart': {'curve': '${curveStyle}'}}}%%
graph TD;
` : "graph TD;\n";
  if (withStyles) {
    const defaultClassLabel = "default";
    const formatDict = {
      [defaultClassLabel]: "{0}({1})"
    };
    if (firstNode !== void 0) {
      formatDict[firstNode] = "{0}([{1}]):::first";
    }
    if (lastNode !== void 0) {
      formatDict[lastNode] = "{0}([{1}]):::last";
    }
    for (const [key, node] of Object.entries(nodes)) {
      const nodeName = node.name.split(":").pop() ?? "";
      const label = MARKDOWN_SPECIAL_CHARS.some((char) => nodeName.startsWith(char) && nodeName.endsWith(char)) ? `<p>${nodeName}</p>` : nodeName;
      let finalLabel = label;
      if (Object.keys(node.metadata ?? {}).length) {
        finalLabel += `<hr/><small><em>${Object.entries(node.metadata ?? {}).map(([k, v]) => `${k} = ${v}`).join("\n")}</em></small>`;
      }
      const nodeLabel = (formatDict[key] ?? formatDict[defaultClassLabel]).replace("{0}", _escapeNodeLabel(key)).replace("{1}", finalLabel);
      mermaidGraph += `	${nodeLabel}
`;
    }
  }
  const edgeGroups = {};
  for (const edge of edges) {
    const srcParts = edge.source.split(":");
    const tgtParts = edge.target.split(":");
    const commonPrefix = srcParts.filter((src, i) => src === tgtParts[i]).join(":");
    if (!edgeGroups[commonPrefix]) {
      edgeGroups[commonPrefix] = [];
    }
    edgeGroups[commonPrefix].push(edge);
  }
  const seenSubgraphs = /* @__PURE__ */ new Set();
  function addSubgraph(edges2, prefix) {
    const selfLoop = edges2.length === 1 && edges2[0].source === edges2[0].target;
    if (prefix && !selfLoop) {
      const subgraph = prefix.split(":").pop();
      if (seenSubgraphs.has(subgraph)) {
        throw new Error(`Found duplicate subgraph '${subgraph}' -- this likely means that you're reusing a subgraph node with the same name. Please adjust your graph to have subgraph nodes with unique names.`);
      }
      seenSubgraphs.add(subgraph);
      mermaidGraph += `	subgraph ${subgraph}
`;
    }
    for (const edge of edges2) {
      const { source, target, data, conditional } = edge;
      let edgeLabel = "";
      if (data !== void 0) {
        let edgeData = data;
        const words = edgeData.split(" ");
        if (words.length > wrapLabelNWords) {
          edgeData = Array.from({ length: Math.ceil(words.length / wrapLabelNWords) }, (_, i) => words.slice(i * wrapLabelNWords, (i + 1) * wrapLabelNWords).join(" ")).join("&nbsp;<br>&nbsp;");
        }
        edgeLabel = conditional ? ` -. &nbsp;${edgeData}&nbsp; .-> ` : ` -- &nbsp;${edgeData}&nbsp; --> `;
      } else {
        edgeLabel = conditional ? " -.-> " : " --> ";
      }
      mermaidGraph += `	${_escapeNodeLabel(source)}${edgeLabel}${_escapeNodeLabel(target)};
`;
    }
    for (const nestedPrefix in edgeGroups) {
      if (nestedPrefix.startsWith(`${prefix}:`) && nestedPrefix !== prefix) {
        addSubgraph(edgeGroups[nestedPrefix], nestedPrefix);
      }
    }
    if (prefix && !selfLoop) {
      mermaidGraph += "	end\n";
    }
  }
  addSubgraph(edgeGroups[""] ?? [], "");
  for (const prefix in edgeGroups) {
    if (!prefix.includes(":") && prefix !== "") {
      addSubgraph(edgeGroups[prefix], prefix);
    }
  }
  if (withStyles) {
    mermaidGraph += _generateMermaidGraphStyles(nodeColors ?? {});
  }
  return mermaidGraph;
}
async function drawMermaidPng(mermaidSyntax, config) {
  return drawMermaidImage(mermaidSyntax, {
    ...config,
    imageType: "png"
  });
}
async function drawMermaidImage(mermaidSyntax, config) {
  let backgroundColor = config?.backgroundColor ?? "white";
  const imageType = config?.imageType ?? "png";
  const mermaidSyntaxEncoded = btoa(mermaidSyntax);
  if (backgroundColor !== void 0) {
    const hexColorPattern = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
    if (!hexColorPattern.test(backgroundColor)) {
      backgroundColor = `!${backgroundColor}`;
    }
  }
  const imageUrl = `https://mermaid.ink/img/${mermaidSyntaxEncoded}?bgColor=${backgroundColor}&type=${imageType}`;
  const res = await fetch(imageUrl);
  if (!res.ok) {
    throw new Error([
      `Failed to render the graph using the Mermaid.INK API.`,
      `Status code: ${res.status}`,
      `Status text: ${res.statusText}`
    ].join("\n"));
  }
  const content = await res.blob();
  return content;
}
var MARKDOWN_SPECIAL_CHARS;
var init_graph_mermaid = __esm({
  "node_modules/@langchain/core/dist/runnables/graph_mermaid.js"() {
    MARKDOWN_SPECIAL_CHARS = ["*", "_", "`"];
  }
});

// node_modules/zod-to-json-schema/dist/esm/Options.js
var ignoreOverride, defaultOptions2, getDefaultOptions;
var init_Options = __esm({
  "node_modules/zod-to-json-schema/dist/esm/Options.js"() {
    ignoreOverride = /* @__PURE__ */ Symbol("Let zodToJsonSchema decide on which parser to use");
    defaultOptions2 = {
      name: void 0,
      $refStrategy: "root",
      basePath: ["#"],
      effectStrategy: "input",
      pipeStrategy: "all",
      dateStrategy: "format:date-time",
      mapStrategy: "entries",
      removeAdditionalStrategy: "passthrough",
      allowedAdditionalProperties: true,
      rejectedAdditionalProperties: false,
      definitionPath: "definitions",
      target: "jsonSchema7",
      strictUnions: false,
      definitions: {},
      errorMessages: false,
      markdownDescription: false,
      patternStrategy: "escape",
      applyRegexFlags: false,
      emailStrategy: "format:email",
      base64Strategy: "contentEncoding:base64",
      nameStrategy: "ref",
      openAiAnyTypeName: "OpenAiAnyType"
    };
    getDefaultOptions = (options) => typeof options === "string" ? {
      ...defaultOptions2,
      name: options
    } : {
      ...defaultOptions2,
      ...options
    };
  }
});

// node_modules/zod-to-json-schema/dist/esm/Refs.js
var getRefs;
var init_Refs = __esm({
  "node_modules/zod-to-json-schema/dist/esm/Refs.js"() {
    init_Options();
    getRefs = (options) => {
      const _options = getDefaultOptions(options);
      const currentPath = _options.name !== void 0 ? [..._options.basePath, _options.definitionPath, _options.name] : _options.basePath;
      return {
        ..._options,
        flags: { hasReferencedOpenAiAnyType: false },
        currentPath,
        propertyPath: void 0,
        seen: new Map(Object.entries(_options.definitions).map(([name, def]) => [
          def._def,
          {
            def: def._def,
            path: [..._options.basePath, _options.definitionPath, name],
            // Resolution of references will be forced even though seen, so it's ok that the schema is undefined here for now.
            jsonSchema: void 0
          }
        ]))
      };
    };
  }
});

// node_modules/zod-to-json-schema/dist/esm/errorMessages.js
function addErrorMessage(res, key, errorMessage, refs) {
  if (!refs?.errorMessages)
    return;
  if (errorMessage) {
    res.errorMessage = {
      ...res.errorMessage,
      [key]: errorMessage
    };
  }
}
function setResponseValueAndErrors(res, key, value, errorMessage, refs) {
  res[key] = value;
  addErrorMessage(res, key, errorMessage, refs);
}
var init_errorMessages = __esm({
  "node_modules/zod-to-json-schema/dist/esm/errorMessages.js"() {
  }
});

// node_modules/zod-to-json-schema/dist/esm/getRelativePath.js
var getRelativePath;
var init_getRelativePath = __esm({
  "node_modules/zod-to-json-schema/dist/esm/getRelativePath.js"() {
    getRelativePath = (pathA, pathB) => {
      let i = 0;
      for (; i < pathA.length && i < pathB.length; i++) {
        if (pathA[i] !== pathB[i])
          break;
      }
      return [(pathA.length - i).toString(), ...pathB.slice(i)].join("/");
    };
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/any.js
function parseAnyDef(refs) {
  if (refs.target !== "openAi") {
    return {};
  }
  const anyDefinitionPath = [
    ...refs.basePath,
    refs.definitionPath,
    refs.openAiAnyTypeName
  ];
  refs.flags.hasReferencedOpenAiAnyType = true;
  return {
    $ref: refs.$refStrategy === "relative" ? getRelativePath(anyDefinitionPath, refs.currentPath) : anyDefinitionPath.join("/")
  };
}
var init_any = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/any.js"() {
    init_getRelativePath();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/array.js
function parseArrayDef(def, refs) {
  const res = {
    type: "array"
  };
  if (def.type?._def && def.type?._def?.typeName !== import_v3.ZodFirstPartyTypeKind.ZodAny) {
    res.items = parseDef(def.type._def, {
      ...refs,
      currentPath: [...refs.currentPath, "items"]
    });
  }
  if (def.minLength) {
    setResponseValueAndErrors(res, "minItems", def.minLength.value, def.minLength.message, refs);
  }
  if (def.maxLength) {
    setResponseValueAndErrors(res, "maxItems", def.maxLength.value, def.maxLength.message, refs);
  }
  if (def.exactLength) {
    setResponseValueAndErrors(res, "minItems", def.exactLength.value, def.exactLength.message, refs);
    setResponseValueAndErrors(res, "maxItems", def.exactLength.value, def.exactLength.message, refs);
  }
  return res;
}
var import_v3;
var init_array = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/array.js"() {
    import_v3 = require("zod/v3");
    init_errorMessages();
    init_parseDef();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/bigint.js
function parseBigintDef(def, refs) {
  const res = {
    type: "integer",
    format: "int64"
  };
  if (!def.checks)
    return res;
  for (const check of def.checks) {
    switch (check.kind) {
      case "min":
        if (refs.target === "jsonSchema7") {
          if (check.inclusive) {
            setResponseValueAndErrors(res, "minimum", check.value, check.message, refs);
          } else {
            setResponseValueAndErrors(res, "exclusiveMinimum", check.value, check.message, refs);
          }
        } else {
          if (!check.inclusive) {
            res.exclusiveMinimum = true;
          }
          setResponseValueAndErrors(res, "minimum", check.value, check.message, refs);
        }
        break;
      case "max":
        if (refs.target === "jsonSchema7") {
          if (check.inclusive) {
            setResponseValueAndErrors(res, "maximum", check.value, check.message, refs);
          } else {
            setResponseValueAndErrors(res, "exclusiveMaximum", check.value, check.message, refs);
          }
        } else {
          if (!check.inclusive) {
            res.exclusiveMaximum = true;
          }
          setResponseValueAndErrors(res, "maximum", check.value, check.message, refs);
        }
        break;
      case "multipleOf":
        setResponseValueAndErrors(res, "multipleOf", check.value, check.message, refs);
        break;
    }
  }
  return res;
}
var init_bigint = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/bigint.js"() {
    init_errorMessages();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/boolean.js
function parseBooleanDef() {
  return {
    type: "boolean"
  };
}
var init_boolean = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/boolean.js"() {
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/branded.js
function parseBrandedDef(_def, refs) {
  return parseDef(_def.type._def, refs);
}
var init_branded = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/branded.js"() {
    init_parseDef();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/catch.js
var parseCatchDef;
var init_catch = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/catch.js"() {
    init_parseDef();
    parseCatchDef = (def, refs) => {
      return parseDef(def.innerType._def, refs);
    };
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/date.js
function parseDateDef(def, refs, overrideDateStrategy) {
  const strategy = overrideDateStrategy ?? refs.dateStrategy;
  if (Array.isArray(strategy)) {
    return {
      anyOf: strategy.map((item, i) => parseDateDef(def, refs, item))
    };
  }
  switch (strategy) {
    case "string":
    case "format:date-time":
      return {
        type: "string",
        format: "date-time"
      };
    case "format:date":
      return {
        type: "string",
        format: "date"
      };
    case "integer":
      return integerDateParser(def, refs);
  }
}
var integerDateParser;
var init_date = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/date.js"() {
    init_errorMessages();
    integerDateParser = (def, refs) => {
      const res = {
        type: "integer",
        format: "unix-time"
      };
      if (refs.target === "openApi3") {
        return res;
      }
      for (const check of def.checks) {
        switch (check.kind) {
          case "min":
            setResponseValueAndErrors(
              res,
              "minimum",
              check.value,
              // This is in milliseconds
              check.message,
              refs
            );
            break;
          case "max":
            setResponseValueAndErrors(
              res,
              "maximum",
              check.value,
              // This is in milliseconds
              check.message,
              refs
            );
            break;
        }
      }
      return res;
    };
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/default.js
function parseDefaultDef(_def, refs) {
  return {
    ...parseDef(_def.innerType._def, refs),
    default: _def.defaultValue()
  };
}
var init_default = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/default.js"() {
    init_parseDef();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/effects.js
function parseEffectsDef(_def, refs) {
  return refs.effectStrategy === "input" ? parseDef(_def.schema._def, refs) : parseAnyDef(refs);
}
var init_effects = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/effects.js"() {
    init_parseDef();
    init_any();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/enum.js
function parseEnumDef(def) {
  return {
    type: "string",
    enum: Array.from(def.values)
  };
}
var init_enum = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/enum.js"() {
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/intersection.js
function parseIntersectionDef(def, refs) {
  const allOf = [
    parseDef(def.left._def, {
      ...refs,
      currentPath: [...refs.currentPath, "allOf", "0"]
    }),
    parseDef(def.right._def, {
      ...refs,
      currentPath: [...refs.currentPath, "allOf", "1"]
    })
  ].filter((x) => !!x);
  let unevaluatedProperties = refs.target === "jsonSchema2019-09" ? { unevaluatedProperties: false } : void 0;
  const mergedAllOf = [];
  allOf.forEach((schema) => {
    if (isJsonSchema7AllOfType(schema)) {
      mergedAllOf.push(...schema.allOf);
      if (schema.unevaluatedProperties === void 0) {
        unevaluatedProperties = void 0;
      }
    } else {
      let nestedSchema = schema;
      if ("additionalProperties" in schema && schema.additionalProperties === false) {
        const { additionalProperties, ...rest } = schema;
        nestedSchema = rest;
      } else {
        unevaluatedProperties = void 0;
      }
      mergedAllOf.push(nestedSchema);
    }
  });
  return mergedAllOf.length ? {
    allOf: mergedAllOf,
    ...unevaluatedProperties
  } : void 0;
}
var isJsonSchema7AllOfType;
var init_intersection = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/intersection.js"() {
    init_parseDef();
    isJsonSchema7AllOfType = (type) => {
      if ("type" in type && type.type === "string")
        return false;
      return "allOf" in type;
    };
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/literal.js
function parseLiteralDef(def, refs) {
  const parsedType = typeof def.value;
  if (parsedType !== "bigint" && parsedType !== "number" && parsedType !== "boolean" && parsedType !== "string") {
    return {
      type: Array.isArray(def.value) ? "array" : "object"
    };
  }
  if (refs.target === "openApi3") {
    return {
      type: parsedType === "bigint" ? "integer" : parsedType,
      enum: [def.value]
    };
  }
  return {
    type: parsedType === "bigint" ? "integer" : parsedType,
    const: def.value
  };
}
var init_literal = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/literal.js"() {
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/string.js
function parseStringDef(def, refs) {
  const res = {
    type: "string"
  };
  if (def.checks) {
    for (const check of def.checks) {
      switch (check.kind) {
        case "min":
          setResponseValueAndErrors(res, "minLength", typeof res.minLength === "number" ? Math.max(res.minLength, check.value) : check.value, check.message, refs);
          break;
        case "max":
          setResponseValueAndErrors(res, "maxLength", typeof res.maxLength === "number" ? Math.min(res.maxLength, check.value) : check.value, check.message, refs);
          break;
        case "email":
          switch (refs.emailStrategy) {
            case "format:email":
              addFormat(res, "email", check.message, refs);
              break;
            case "format:idn-email":
              addFormat(res, "idn-email", check.message, refs);
              break;
            case "pattern:zod":
              addPattern(res, zodPatterns.email, check.message, refs);
              break;
          }
          break;
        case "url":
          addFormat(res, "uri", check.message, refs);
          break;
        case "uuid":
          addFormat(res, "uuid", check.message, refs);
          break;
        case "regex":
          addPattern(res, check.regex, check.message, refs);
          break;
        case "cuid":
          addPattern(res, zodPatterns.cuid, check.message, refs);
          break;
        case "cuid2":
          addPattern(res, zodPatterns.cuid2, check.message, refs);
          break;
        case "startsWith":
          addPattern(res, RegExp(`^${escapeLiteralCheckValue(check.value, refs)}`), check.message, refs);
          break;
        case "endsWith":
          addPattern(res, RegExp(`${escapeLiteralCheckValue(check.value, refs)}$`), check.message, refs);
          break;
        case "datetime":
          addFormat(res, "date-time", check.message, refs);
          break;
        case "date":
          addFormat(res, "date", check.message, refs);
          break;
        case "time":
          addFormat(res, "time", check.message, refs);
          break;
        case "duration":
          addFormat(res, "duration", check.message, refs);
          break;
        case "length":
          setResponseValueAndErrors(res, "minLength", typeof res.minLength === "number" ? Math.max(res.minLength, check.value) : check.value, check.message, refs);
          setResponseValueAndErrors(res, "maxLength", typeof res.maxLength === "number" ? Math.min(res.maxLength, check.value) : check.value, check.message, refs);
          break;
        case "includes": {
          addPattern(res, RegExp(escapeLiteralCheckValue(check.value, refs)), check.message, refs);
          break;
        }
        case "ip": {
          if (check.version !== "v6") {
            addFormat(res, "ipv4", check.message, refs);
          }
          if (check.version !== "v4") {
            addFormat(res, "ipv6", check.message, refs);
          }
          break;
        }
        case "base64url":
          addPattern(res, zodPatterns.base64url, check.message, refs);
          break;
        case "jwt":
          addPattern(res, zodPatterns.jwt, check.message, refs);
          break;
        case "cidr": {
          if (check.version !== "v6") {
            addPattern(res, zodPatterns.ipv4Cidr, check.message, refs);
          }
          if (check.version !== "v4") {
            addPattern(res, zodPatterns.ipv6Cidr, check.message, refs);
          }
          break;
        }
        case "emoji":
          addPattern(res, zodPatterns.emoji(), check.message, refs);
          break;
        case "ulid": {
          addPattern(res, zodPatterns.ulid, check.message, refs);
          break;
        }
        case "base64": {
          switch (refs.base64Strategy) {
            case "format:binary": {
              addFormat(res, "binary", check.message, refs);
              break;
            }
            case "contentEncoding:base64": {
              setResponseValueAndErrors(res, "contentEncoding", "base64", check.message, refs);
              break;
            }
            case "pattern:zod": {
              addPattern(res, zodPatterns.base64, check.message, refs);
              break;
            }
          }
          break;
        }
        case "nanoid": {
          addPattern(res, zodPatterns.nanoid, check.message, refs);
        }
        case "toLowerCase":
        case "toUpperCase":
        case "trim":
          break;
        default:
          /* @__PURE__ */ ((_) => {
          })(check);
      }
    }
  }
  return res;
}
function escapeLiteralCheckValue(literal, refs) {
  return refs.patternStrategy === "escape" ? escapeNonAlphaNumeric(literal) : literal;
}
function escapeNonAlphaNumeric(source) {
  let result = "";
  for (let i = 0; i < source.length; i++) {
    if (!ALPHA_NUMERIC.has(source[i])) {
      result += "\\";
    }
    result += source[i];
  }
  return result;
}
function addFormat(schema, value, message, refs) {
  if (schema.format || schema.anyOf?.some((x) => x.format)) {
    if (!schema.anyOf) {
      schema.anyOf = [];
    }
    if (schema.format) {
      schema.anyOf.push({
        format: schema.format,
        ...schema.errorMessage && refs.errorMessages && {
          errorMessage: { format: schema.errorMessage.format }
        }
      });
      delete schema.format;
      if (schema.errorMessage) {
        delete schema.errorMessage.format;
        if (Object.keys(schema.errorMessage).length === 0) {
          delete schema.errorMessage;
        }
      }
    }
    schema.anyOf.push({
      format: value,
      ...message && refs.errorMessages && { errorMessage: { format: message } }
    });
  } else {
    setResponseValueAndErrors(schema, "format", value, message, refs);
  }
}
function addPattern(schema, regex2, message, refs) {
  if (schema.pattern || schema.allOf?.some((x) => x.pattern)) {
    if (!schema.allOf) {
      schema.allOf = [];
    }
    if (schema.pattern) {
      schema.allOf.push({
        pattern: schema.pattern,
        ...schema.errorMessage && refs.errorMessages && {
          errorMessage: { pattern: schema.errorMessage.pattern }
        }
      });
      delete schema.pattern;
      if (schema.errorMessage) {
        delete schema.errorMessage.pattern;
        if (Object.keys(schema.errorMessage).length === 0) {
          delete schema.errorMessage;
        }
      }
    }
    schema.allOf.push({
      pattern: stringifyRegExpWithFlags(regex2, refs),
      ...message && refs.errorMessages && { errorMessage: { pattern: message } }
    });
  } else {
    setResponseValueAndErrors(schema, "pattern", stringifyRegExpWithFlags(regex2, refs), message, refs);
  }
}
function stringifyRegExpWithFlags(regex2, refs) {
  if (!refs.applyRegexFlags || !regex2.flags) {
    return regex2.source;
  }
  const flags = {
    i: regex2.flags.includes("i"),
    m: regex2.flags.includes("m"),
    s: regex2.flags.includes("s")
    // `.` matches newlines
  };
  const source = flags.i ? regex2.source.toLowerCase() : regex2.source;
  let pattern = "";
  let isEscaped = false;
  let inCharGroup = false;
  let inCharRange = false;
  for (let i = 0; i < source.length; i++) {
    if (isEscaped) {
      pattern += source[i];
      isEscaped = false;
      continue;
    }
    if (flags.i) {
      if (inCharGroup) {
        if (source[i].match(/[a-z]/)) {
          if (inCharRange) {
            pattern += source[i];
            pattern += `${source[i - 2]}-${source[i]}`.toUpperCase();
            inCharRange = false;
          } else if (source[i + 1] === "-" && source[i + 2]?.match(/[a-z]/)) {
            pattern += source[i];
            inCharRange = true;
          } else {
            pattern += `${source[i]}${source[i].toUpperCase()}`;
          }
          continue;
        }
      } else if (source[i].match(/[a-z]/)) {
        pattern += `[${source[i]}${source[i].toUpperCase()}]`;
        continue;
      }
    }
    if (flags.m) {
      if (source[i] === "^") {
        pattern += `(^|(?<=[\r
]))`;
        continue;
      } else if (source[i] === "$") {
        pattern += `($|(?=[\r
]))`;
        continue;
      }
    }
    if (flags.s && source[i] === ".") {
      pattern += inCharGroup ? `${source[i]}\r
` : `[${source[i]}\r
]`;
      continue;
    }
    pattern += source[i];
    if (source[i] === "\\") {
      isEscaped = true;
    } else if (inCharGroup && source[i] === "]") {
      inCharGroup = false;
    } else if (!inCharGroup && source[i] === "[") {
      inCharGroup = true;
    }
  }
  try {
    new RegExp(pattern);
  } catch {
    console.warn(`Could not convert regex pattern at ${refs.currentPath.join("/")} to a flag-independent form! Falling back to the flag-ignorant source`);
    return regex2.source;
  }
  return pattern;
}
var emojiRegex, zodPatterns, ALPHA_NUMERIC;
var init_string = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/string.js"() {
    init_errorMessages();
    emojiRegex = void 0;
    zodPatterns = {
      /**
       * `c` was changed to `[cC]` to replicate /i flag
       */
      cuid: /^[cC][^\s-]{8,}$/,
      cuid2: /^[0-9a-z]+$/,
      ulid: /^[0-9A-HJKMNP-TV-Z]{26}$/,
      /**
       * `a-z` was added to replicate /i flag
       */
      email: /^(?!\.)(?!.*\.\.)([a-zA-Z0-9_'+\-\.]*)[a-zA-Z0-9_+-]@([a-zA-Z0-9][a-zA-Z0-9\-]*\.)+[a-zA-Z]{2,}$/,
      /**
       * Constructed a valid Unicode RegExp
       *
       * Lazily instantiate since this type of regex isn't supported
       * in all envs (e.g. React Native).
       *
       * See:
       * https://github.com/colinhacks/zod/issues/2433
       * Fix in Zod:
       * https://github.com/colinhacks/zod/commit/9340fd51e48576a75adc919bff65dbc4a5d4c99b
       */
      emoji: () => {
        if (emojiRegex === void 0) {
          emojiRegex = RegExp("^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$", "u");
        }
        return emojiRegex;
      },
      /**
       * Unused
       */
      uuid: /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/,
      /**
       * Unused
       */
      ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,
      ipv4Cidr: /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/,
      /**
       * Unused
       */
      ipv6: /^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/,
      ipv6Cidr: /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,
      base64: /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/,
      base64url: /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/,
      nanoid: /^[a-zA-Z0-9_-]{21}$/,
      jwt: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/
    };
    ALPHA_NUMERIC = new Set("ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvxyz0123456789");
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/record.js
function parseRecordDef(def, refs) {
  if (refs.target === "openAi") {
    console.warn("Warning: OpenAI may not support records in schemas! Try an array of key-value pairs instead.");
  }
  if (refs.target === "openApi3" && def.keyType?._def.typeName === import_v32.ZodFirstPartyTypeKind.ZodEnum) {
    return {
      type: "object",
      required: def.keyType._def.values,
      properties: def.keyType._def.values.reduce((acc, key) => ({
        ...acc,
        [key]: parseDef(def.valueType._def, {
          ...refs,
          currentPath: [...refs.currentPath, "properties", key]
        }) ?? parseAnyDef(refs)
      }), {}),
      additionalProperties: refs.rejectedAdditionalProperties
    };
  }
  const schema = {
    type: "object",
    additionalProperties: parseDef(def.valueType._def, {
      ...refs,
      currentPath: [...refs.currentPath, "additionalProperties"]
    }) ?? refs.allowedAdditionalProperties
  };
  if (refs.target === "openApi3") {
    return schema;
  }
  if (def.keyType?._def.typeName === import_v32.ZodFirstPartyTypeKind.ZodString && def.keyType._def.checks?.length) {
    const { type, ...keyType } = parseStringDef(def.keyType._def, refs);
    return {
      ...schema,
      propertyNames: keyType
    };
  } else if (def.keyType?._def.typeName === import_v32.ZodFirstPartyTypeKind.ZodEnum) {
    return {
      ...schema,
      propertyNames: {
        enum: def.keyType._def.values
      }
    };
  } else if (def.keyType?._def.typeName === import_v32.ZodFirstPartyTypeKind.ZodBranded && def.keyType._def.type._def.typeName === import_v32.ZodFirstPartyTypeKind.ZodString && def.keyType._def.type._def.checks?.length) {
    const { type, ...keyType } = parseBrandedDef(def.keyType._def, refs);
    return {
      ...schema,
      propertyNames: keyType
    };
  }
  return schema;
}
var import_v32;
var init_record = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/record.js"() {
    import_v32 = require("zod/v3");
    init_parseDef();
    init_string();
    init_branded();
    init_any();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/map.js
function parseMapDef(def, refs) {
  if (refs.mapStrategy === "record") {
    return parseRecordDef(def, refs);
  }
  const keys = parseDef(def.keyType._def, {
    ...refs,
    currentPath: [...refs.currentPath, "items", "items", "0"]
  }) || parseAnyDef(refs);
  const values = parseDef(def.valueType._def, {
    ...refs,
    currentPath: [...refs.currentPath, "items", "items", "1"]
  }) || parseAnyDef(refs);
  return {
    type: "array",
    maxItems: 125,
    items: {
      type: "array",
      items: [keys, values],
      minItems: 2,
      maxItems: 2
    }
  };
}
var init_map = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/map.js"() {
    init_parseDef();
    init_record();
    init_any();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/nativeEnum.js
function parseNativeEnumDef(def) {
  const object = def.values;
  const actualKeys = Object.keys(def.values).filter((key) => {
    return typeof object[object[key]] !== "number";
  });
  const actualValues = actualKeys.map((key) => object[key]);
  const parsedTypes = Array.from(new Set(actualValues.map((values) => typeof values)));
  return {
    type: parsedTypes.length === 1 ? parsedTypes[0] === "string" ? "string" : "number" : ["string", "number"],
    enum: actualValues
  };
}
var init_nativeEnum = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/nativeEnum.js"() {
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/never.js
function parseNeverDef(refs) {
  return refs.target === "openAi" ? void 0 : {
    not: parseAnyDef({
      ...refs,
      currentPath: [...refs.currentPath, "not"]
    })
  };
}
var init_never = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/never.js"() {
    init_any();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/null.js
function parseNullDef(refs) {
  return refs.target === "openApi3" ? {
    enum: ["null"],
    nullable: true
  } : {
    type: "null"
  };
}
var init_null = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/null.js"() {
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/union.js
function parseUnionDef(def, refs) {
  if (refs.target === "openApi3")
    return asAnyOf(def, refs);
  const options = def.options instanceof Map ? Array.from(def.options.values()) : def.options;
  if (options.every((x) => x._def.typeName in primitiveMappings && (!x._def.checks || !x._def.checks.length))) {
    const types = options.reduce((types2, x) => {
      const type = primitiveMappings[x._def.typeName];
      return type && !types2.includes(type) ? [...types2, type] : types2;
    }, []);
    return {
      type: types.length > 1 ? types : types[0]
    };
  } else if (options.every((x) => x._def.typeName === "ZodLiteral" && !x.description)) {
    const types = options.reduce((acc, x) => {
      const type = typeof x._def.value;
      switch (type) {
        case "string":
        case "number":
        case "boolean":
          return [...acc, type];
        case "bigint":
          return [...acc, "integer"];
        case "object":
          if (x._def.value === null)
            return [...acc, "null"];
        case "symbol":
        case "undefined":
        case "function":
        default:
          return acc;
      }
    }, []);
    if (types.length === options.length) {
      const uniqueTypes = types.filter((x, i, a) => a.indexOf(x) === i);
      return {
        type: uniqueTypes.length > 1 ? uniqueTypes : uniqueTypes[0],
        enum: options.reduce((acc, x) => {
          return acc.includes(x._def.value) ? acc : [...acc, x._def.value];
        }, [])
      };
    }
  } else if (options.every((x) => x._def.typeName === "ZodEnum")) {
    return {
      type: "string",
      enum: options.reduce((acc, x) => [
        ...acc,
        ...x._def.values.filter((x2) => !acc.includes(x2))
      ], [])
    };
  }
  return asAnyOf(def, refs);
}
var primitiveMappings, asAnyOf;
var init_union = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/union.js"() {
    init_parseDef();
    primitiveMappings = {
      ZodString: "string",
      ZodNumber: "number",
      ZodBigInt: "integer",
      ZodBoolean: "boolean",
      ZodNull: "null"
    };
    asAnyOf = (def, refs) => {
      const anyOf = (def.options instanceof Map ? Array.from(def.options.values()) : def.options).map((x, i) => parseDef(x._def, {
        ...refs,
        currentPath: [...refs.currentPath, "anyOf", `${i}`]
      })).filter((x) => !!x && (!refs.strictUnions || typeof x === "object" && Object.keys(x).length > 0));
      return anyOf.length ? { anyOf } : void 0;
    };
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/nullable.js
function parseNullableDef(def, refs) {
  if (["ZodString", "ZodNumber", "ZodBigInt", "ZodBoolean", "ZodNull"].includes(def.innerType._def.typeName) && (!def.innerType._def.checks || !def.innerType._def.checks.length)) {
    if (refs.target === "openApi3") {
      return {
        type: primitiveMappings[def.innerType._def.typeName],
        nullable: true
      };
    }
    return {
      type: [
        primitiveMappings[def.innerType._def.typeName],
        "null"
      ]
    };
  }
  if (refs.target === "openApi3") {
    const base2 = parseDef(def.innerType._def, {
      ...refs,
      currentPath: [...refs.currentPath]
    });
    if (base2 && "$ref" in base2)
      return { allOf: [base2], nullable: true };
    return base2 && { ...base2, nullable: true };
  }
  const base = parseDef(def.innerType._def, {
    ...refs,
    currentPath: [...refs.currentPath, "anyOf", "0"]
  });
  return base && { anyOf: [base, { type: "null" }] };
}
var init_nullable = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/nullable.js"() {
    init_parseDef();
    init_union();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/number.js
function parseNumberDef(def, refs) {
  const res = {
    type: "number"
  };
  if (!def.checks)
    return res;
  for (const check of def.checks) {
    switch (check.kind) {
      case "int":
        res.type = "integer";
        addErrorMessage(res, "type", check.message, refs);
        break;
      case "min":
        if (refs.target === "jsonSchema7") {
          if (check.inclusive) {
            setResponseValueAndErrors(res, "minimum", check.value, check.message, refs);
          } else {
            setResponseValueAndErrors(res, "exclusiveMinimum", check.value, check.message, refs);
          }
        } else {
          if (!check.inclusive) {
            res.exclusiveMinimum = true;
          }
          setResponseValueAndErrors(res, "minimum", check.value, check.message, refs);
        }
        break;
      case "max":
        if (refs.target === "jsonSchema7") {
          if (check.inclusive) {
            setResponseValueAndErrors(res, "maximum", check.value, check.message, refs);
          } else {
            setResponseValueAndErrors(res, "exclusiveMaximum", check.value, check.message, refs);
          }
        } else {
          if (!check.inclusive) {
            res.exclusiveMaximum = true;
          }
          setResponseValueAndErrors(res, "maximum", check.value, check.message, refs);
        }
        break;
      case "multipleOf":
        setResponseValueAndErrors(res, "multipleOf", check.value, check.message, refs);
        break;
    }
  }
  return res;
}
var init_number = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/number.js"() {
    init_errorMessages();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/object.js
function parseObjectDef(def, refs) {
  const forceOptionalIntoNullable = refs.target === "openAi";
  const result = {
    type: "object",
    properties: {}
  };
  const required = [];
  const shape = def.shape();
  for (const propName in shape) {
    let propDef = shape[propName];
    if (propDef === void 0 || propDef._def === void 0) {
      continue;
    }
    let propOptional = safeIsOptional(propDef);
    if (propOptional && forceOptionalIntoNullable) {
      if (propDef._def.typeName === "ZodOptional") {
        propDef = propDef._def.innerType;
      }
      if (!propDef.isNullable()) {
        propDef = propDef.nullable();
      }
      propOptional = false;
    }
    const parsedDef = parseDef(propDef._def, {
      ...refs,
      currentPath: [...refs.currentPath, "properties", propName],
      propertyPath: [...refs.currentPath, "properties", propName]
    });
    if (parsedDef === void 0) {
      continue;
    }
    result.properties[propName] = parsedDef;
    if (!propOptional) {
      required.push(propName);
    }
  }
  if (required.length) {
    result.required = required;
  }
  const additionalProperties = decideAdditionalProperties(def, refs);
  if (additionalProperties !== void 0) {
    result.additionalProperties = additionalProperties;
  }
  return result;
}
function decideAdditionalProperties(def, refs) {
  if (def.catchall._def.typeName !== "ZodNever") {
    return parseDef(def.catchall._def, {
      ...refs,
      currentPath: [...refs.currentPath, "additionalProperties"]
    });
  }
  switch (def.unknownKeys) {
    case "passthrough":
      return refs.allowedAdditionalProperties;
    case "strict":
      return refs.rejectedAdditionalProperties;
    case "strip":
      return refs.removeAdditionalStrategy === "strict" ? refs.allowedAdditionalProperties : refs.rejectedAdditionalProperties;
  }
}
function safeIsOptional(schema) {
  try {
    return schema.isOptional();
  } catch {
    return true;
  }
}
var init_object = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/object.js"() {
    init_parseDef();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/optional.js
var parseOptionalDef;
var init_optional = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/optional.js"() {
    init_parseDef();
    init_any();
    parseOptionalDef = (def, refs) => {
      if (refs.currentPath.toString() === refs.propertyPath?.toString()) {
        return parseDef(def.innerType._def, refs);
      }
      const innerSchema = parseDef(def.innerType._def, {
        ...refs,
        currentPath: [...refs.currentPath, "anyOf", "1"]
      });
      return innerSchema ? {
        anyOf: [
          {
            not: parseAnyDef(refs)
          },
          innerSchema
        ]
      } : parseAnyDef(refs);
    };
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/pipeline.js
var parsePipelineDef;
var init_pipeline = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/pipeline.js"() {
    init_parseDef();
    parsePipelineDef = (def, refs) => {
      if (refs.pipeStrategy === "input") {
        return parseDef(def.in._def, refs);
      } else if (refs.pipeStrategy === "output") {
        return parseDef(def.out._def, refs);
      }
      const a = parseDef(def.in._def, {
        ...refs,
        currentPath: [...refs.currentPath, "allOf", "0"]
      });
      const b = parseDef(def.out._def, {
        ...refs,
        currentPath: [...refs.currentPath, "allOf", a ? "1" : "0"]
      });
      return {
        allOf: [a, b].filter((x) => x !== void 0)
      };
    };
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/promise.js
function parsePromiseDef(def, refs) {
  return parseDef(def.type._def, refs);
}
var init_promise = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/promise.js"() {
    init_parseDef();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/set.js
function parseSetDef(def, refs) {
  const items = parseDef(def.valueType._def, {
    ...refs,
    currentPath: [...refs.currentPath, "items"]
  });
  const schema = {
    type: "array",
    uniqueItems: true,
    items
  };
  if (def.minSize) {
    setResponseValueAndErrors(schema, "minItems", def.minSize.value, def.minSize.message, refs);
  }
  if (def.maxSize) {
    setResponseValueAndErrors(schema, "maxItems", def.maxSize.value, def.maxSize.message, refs);
  }
  return schema;
}
var init_set = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/set.js"() {
    init_errorMessages();
    init_parseDef();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/tuple.js
function parseTupleDef(def, refs) {
  if (def.rest) {
    return {
      type: "array",
      minItems: def.items.length,
      items: def.items.map((x, i) => parseDef(x._def, {
        ...refs,
        currentPath: [...refs.currentPath, "items", `${i}`]
      })).reduce((acc, x) => x === void 0 ? acc : [...acc, x], []),
      additionalItems: parseDef(def.rest._def, {
        ...refs,
        currentPath: [...refs.currentPath, "additionalItems"]
      })
    };
  } else {
    return {
      type: "array",
      minItems: def.items.length,
      maxItems: def.items.length,
      items: def.items.map((x, i) => parseDef(x._def, {
        ...refs,
        currentPath: [...refs.currentPath, "items", `${i}`]
      })).reduce((acc, x) => x === void 0 ? acc : [...acc, x], [])
    };
  }
}
var init_tuple = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/tuple.js"() {
    init_parseDef();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/undefined.js
function parseUndefinedDef(refs) {
  return {
    not: parseAnyDef(refs)
  };
}
var init_undefined = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/undefined.js"() {
    init_any();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/unknown.js
function parseUnknownDef(refs) {
  return parseAnyDef(refs);
}
var init_unknown = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/unknown.js"() {
    init_any();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/readonly.js
var parseReadonlyDef;
var init_readonly = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/readonly.js"() {
    init_parseDef();
    parseReadonlyDef = (def, refs) => {
      return parseDef(def.innerType._def, refs);
    };
  }
});

// node_modules/zod-to-json-schema/dist/esm/selectParser.js
var import_v33, selectParser;
var init_selectParser = __esm({
  "node_modules/zod-to-json-schema/dist/esm/selectParser.js"() {
    import_v33 = require("zod/v3");
    init_any();
    init_array();
    init_bigint();
    init_boolean();
    init_branded();
    init_catch();
    init_date();
    init_default();
    init_effects();
    init_enum();
    init_intersection();
    init_literal();
    init_map();
    init_nativeEnum();
    init_never();
    init_null();
    init_nullable();
    init_number();
    init_object();
    init_optional();
    init_pipeline();
    init_promise();
    init_record();
    init_set();
    init_string();
    init_tuple();
    init_undefined();
    init_union();
    init_unknown();
    init_readonly();
    selectParser = (def, typeName, refs) => {
      switch (typeName) {
        case import_v33.ZodFirstPartyTypeKind.ZodString:
          return parseStringDef(def, refs);
        case import_v33.ZodFirstPartyTypeKind.ZodNumber:
          return parseNumberDef(def, refs);
        case import_v33.ZodFirstPartyTypeKind.ZodObject:
          return parseObjectDef(def, refs);
        case import_v33.ZodFirstPartyTypeKind.ZodBigInt:
          return parseBigintDef(def, refs);
        case import_v33.ZodFirstPartyTypeKind.ZodBoolean:
          return parseBooleanDef();
        case import_v33.ZodFirstPartyTypeKind.ZodDate:
          return parseDateDef(def, refs);
        case import_v33.ZodFirstPartyTypeKind.ZodUndefined:
          return parseUndefinedDef(refs);
        case import_v33.ZodFirstPartyTypeKind.ZodNull:
          return parseNullDef(refs);
        case import_v33.ZodFirstPartyTypeKind.ZodArray:
          return parseArrayDef(def, refs);
        case import_v33.ZodFirstPartyTypeKind.ZodUnion:
        case import_v33.ZodFirstPartyTypeKind.ZodDiscriminatedUnion:
          return parseUnionDef(def, refs);
        case import_v33.ZodFirstPartyTypeKind.ZodIntersection:
          return parseIntersectionDef(def, refs);
        case import_v33.ZodFirstPartyTypeKind.ZodTuple:
          return parseTupleDef(def, refs);
        case import_v33.ZodFirstPartyTypeKind.ZodRecord:
          return parseRecordDef(def, refs);
        case import_v33.ZodFirstPartyTypeKind.ZodLiteral:
          return parseLiteralDef(def, refs);
        case import_v33.ZodFirstPartyTypeKind.ZodEnum:
          return parseEnumDef(def);
        case import_v33.ZodFirstPartyTypeKind.ZodNativeEnum:
          return parseNativeEnumDef(def);
        case import_v33.ZodFirstPartyTypeKind.ZodNullable:
          return parseNullableDef(def, refs);
        case import_v33.ZodFirstPartyTypeKind.ZodOptional:
          return parseOptionalDef(def, refs);
        case import_v33.ZodFirstPartyTypeKind.ZodMap:
          return parseMapDef(def, refs);
        case import_v33.ZodFirstPartyTypeKind.ZodSet:
          return parseSetDef(def, refs);
        case import_v33.ZodFirstPartyTypeKind.ZodLazy:
          return () => def.getter()._def;
        case import_v33.ZodFirstPartyTypeKind.ZodPromise:
          return parsePromiseDef(def, refs);
        case import_v33.ZodFirstPartyTypeKind.ZodNaN:
        case import_v33.ZodFirstPartyTypeKind.ZodNever:
          return parseNeverDef(refs);
        case import_v33.ZodFirstPartyTypeKind.ZodEffects:
          return parseEffectsDef(def, refs);
        case import_v33.ZodFirstPartyTypeKind.ZodAny:
          return parseAnyDef(refs);
        case import_v33.ZodFirstPartyTypeKind.ZodUnknown:
          return parseUnknownDef(refs);
        case import_v33.ZodFirstPartyTypeKind.ZodDefault:
          return parseDefaultDef(def, refs);
        case import_v33.ZodFirstPartyTypeKind.ZodBranded:
          return parseBrandedDef(def, refs);
        case import_v33.ZodFirstPartyTypeKind.ZodReadonly:
          return parseReadonlyDef(def, refs);
        case import_v33.ZodFirstPartyTypeKind.ZodCatch:
          return parseCatchDef(def, refs);
        case import_v33.ZodFirstPartyTypeKind.ZodPipeline:
          return parsePipelineDef(def, refs);
        case import_v33.ZodFirstPartyTypeKind.ZodFunction:
        case import_v33.ZodFirstPartyTypeKind.ZodVoid:
        case import_v33.ZodFirstPartyTypeKind.ZodSymbol:
          return void 0;
        default:
          return /* @__PURE__ */ ((_) => void 0)(typeName);
      }
    };
  }
});

// node_modules/zod-to-json-schema/dist/esm/parseDef.js
function parseDef(def, refs, forceResolution = false) {
  const seenItem = refs.seen.get(def);
  if (refs.override) {
    const overrideResult = refs.override?.(def, refs, seenItem, forceResolution);
    if (overrideResult !== ignoreOverride) {
      return overrideResult;
    }
  }
  if (seenItem && !forceResolution) {
    const seenSchema = get$ref(seenItem, refs);
    if (seenSchema !== void 0) {
      return seenSchema;
    }
  }
  const newItem = { def, path: refs.currentPath, jsonSchema: void 0 };
  refs.seen.set(def, newItem);
  const jsonSchemaOrGetter = selectParser(def, def.typeName, refs);
  const jsonSchema = typeof jsonSchemaOrGetter === "function" ? parseDef(jsonSchemaOrGetter(), refs) : jsonSchemaOrGetter;
  if (jsonSchema) {
    addMeta(def, refs, jsonSchema);
  }
  if (refs.postProcess) {
    const postProcessResult = refs.postProcess(jsonSchema, def, refs);
    newItem.jsonSchema = jsonSchema;
    return postProcessResult;
  }
  newItem.jsonSchema = jsonSchema;
  return jsonSchema;
}
var get$ref, addMeta;
var init_parseDef = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parseDef.js"() {
    init_Options();
    init_selectParser();
    init_getRelativePath();
    init_any();
    get$ref = (item, refs) => {
      switch (refs.$refStrategy) {
        case "root":
          return { $ref: item.path.join("/") };
        case "relative":
          return { $ref: getRelativePath(refs.currentPath, item.path) };
        case "none":
        case "seen": {
          if (item.path.length < refs.currentPath.length && item.path.every((value, index) => refs.currentPath[index] === value)) {
            console.warn(`Recursive reference detected at ${refs.currentPath.join("/")}! Defaulting to any`);
            return parseAnyDef(refs);
          }
          return refs.$refStrategy === "seen" ? parseAnyDef(refs) : void 0;
        }
      }
    };
    addMeta = (def, refs, jsonSchema) => {
      if (def.description) {
        jsonSchema.description = def.description;
        if (refs.markdownDescription) {
          jsonSchema.markdownDescription = def.description;
        }
      }
      return jsonSchema;
    };
  }
});

// node_modules/zod-to-json-schema/dist/esm/parseTypes.js
var init_parseTypes = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parseTypes.js"() {
  }
});

// node_modules/zod-to-json-schema/dist/esm/zodToJsonSchema.js
var zodToJsonSchema;
var init_zodToJsonSchema = __esm({
  "node_modules/zod-to-json-schema/dist/esm/zodToJsonSchema.js"() {
    init_parseDef();
    init_Refs();
    init_any();
    zodToJsonSchema = (schema, options) => {
      const refs = getRefs(options);
      let definitions = typeof options === "object" && options.definitions ? Object.entries(options.definitions).reduce((acc, [name2, schema2]) => ({
        ...acc,
        [name2]: parseDef(schema2._def, {
          ...refs,
          currentPath: [...refs.basePath, refs.definitionPath, name2]
        }, true) ?? parseAnyDef(refs)
      }), {}) : void 0;
      const name = typeof options === "string" ? options : options?.nameStrategy === "title" ? void 0 : options?.name;
      const main = parseDef(schema._def, name === void 0 ? refs : {
        ...refs,
        currentPath: [...refs.basePath, refs.definitionPath, name]
      }, false) ?? parseAnyDef(refs);
      const title = typeof options === "object" && options.name !== void 0 && options.nameStrategy === "title" ? options.name : void 0;
      if (title !== void 0) {
        main.title = title;
      }
      if (refs.flags.hasReferencedOpenAiAnyType) {
        if (!definitions) {
          definitions = {};
        }
        if (!definitions[refs.openAiAnyTypeName]) {
          definitions[refs.openAiAnyTypeName] = {
            // Skipping "object" as no properties can be defined and additionalProperties must be "false"
            type: ["string", "number", "integer", "boolean", "array", "null"],
            items: {
              $ref: refs.$refStrategy === "relative" ? "1" : [
                ...refs.basePath,
                refs.definitionPath,
                refs.openAiAnyTypeName
              ].join("/")
            }
          };
        }
      }
      const combined = name === void 0 ? definitions ? {
        ...main,
        [refs.definitionPath]: definitions
      } : main : {
        $ref: [
          ...refs.$refStrategy === "relative" ? [] : refs.basePath,
          refs.definitionPath,
          name
        ].join("/"),
        [refs.definitionPath]: {
          ...definitions,
          [name]: main
        }
      };
      if (refs.target === "jsonSchema7") {
        combined.$schema = "http://json-schema.org/draft-07/schema#";
      } else if (refs.target === "jsonSchema2019-09" || refs.target === "openAi") {
        combined.$schema = "https://json-schema.org/draft/2019-09/schema#";
      }
      if (refs.target === "openAi" && ("anyOf" in combined || "oneOf" in combined || "allOf" in combined || "type" in combined && Array.isArray(combined.type))) {
        console.warn("Warning: OpenAI may not support schemas with unions as roots! Try wrapping it in an object property.");
      }
      return combined;
    };
  }
});

// node_modules/zod-to-json-schema/dist/esm/index.js
var init_esm = __esm({
  "node_modules/zod-to-json-schema/dist/esm/index.js"() {
    init_Options();
    init_Refs();
    init_errorMessages();
    init_getRelativePath();
    init_parseDef();
    init_parseTypes();
    init_any();
    init_array();
    init_bigint();
    init_boolean();
    init_branded();
    init_catch();
    init_date();
    init_default();
    init_effects();
    init_enum();
    init_intersection();
    init_literal();
    init_map();
    init_nativeEnum();
    init_never();
    init_null();
    init_nullable();
    init_number();
    init_object();
    init_optional();
    init_pipeline();
    init_promise();
    init_readonly();
    init_record();
    init_set();
    init_string();
    init_tuple();
    init_undefined();
    init_union();
    init_unknown();
    init_selectParser();
    init_zodToJsonSchema();
    init_zodToJsonSchema();
  }
});

// node_modules/@cfworker/json-schema/dist/esm/deep-compare-strict.js
function deepCompareStrict(a, b) {
  const typeofa = typeof a;
  if (typeofa !== typeof b) {
    return false;
  }
  if (Array.isArray(a)) {
    if (!Array.isArray(b)) {
      return false;
    }
    const length = a.length;
    if (length !== b.length) {
      return false;
    }
    for (let i = 0; i < length; i++) {
      if (!deepCompareStrict(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }
  if (typeofa === "object") {
    if (!a || !b) {
      return a === b;
    }
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    const length = aKeys.length;
    if (length !== bKeys.length) {
      return false;
    }
    for (const k of aKeys) {
      if (!deepCompareStrict(a[k], b[k])) {
        return false;
      }
    }
    return true;
  }
  return a === b;
}
var init_deep_compare_strict = __esm({
  "node_modules/@cfworker/json-schema/dist/esm/deep-compare-strict.js"() {
  }
});

// node_modules/@cfworker/json-schema/dist/esm/pointer.js
function encodePointer(p) {
  return encodeURI(escapePointer(p));
}
function escapePointer(p) {
  return p.replace(/~/g, "~0").replace(/\//g, "~1");
}
var init_pointer = __esm({
  "node_modules/@cfworker/json-schema/dist/esm/pointer.js"() {
  }
});

// node_modules/@cfworker/json-schema/dist/esm/dereference.js
function dereference(schema, lookup2 = /* @__PURE__ */ Object.create(null), baseURI = initialBaseURI, basePointer = "") {
  if (schema && typeof schema === "object" && !Array.isArray(schema)) {
    const id = schema.$id || schema.id;
    if (id) {
      const url = new URL(id, baseURI.href);
      if (url.hash.length > 1) {
        lookup2[url.href] = schema;
      } else {
        url.hash = "";
        if (basePointer === "") {
          baseURI = url;
        } else {
          dereference(schema, lookup2, baseURI);
        }
      }
    }
  } else if (schema !== true && schema !== false) {
    return lookup2;
  }
  const schemaURI = baseURI.href + (basePointer ? "#" + basePointer : "");
  if (lookup2[schemaURI] !== void 0) {
    throw new Error(`Duplicate schema URI "${schemaURI}".`);
  }
  lookup2[schemaURI] = schema;
  if (schema === true || schema === false) {
    return lookup2;
  }
  if (schema.__absolute_uri__ === void 0) {
    Object.defineProperty(schema, "__absolute_uri__", {
      enumerable: false,
      value: schemaURI
    });
  }
  if (schema.$ref && schema.__absolute_ref__ === void 0) {
    const url = new URL(schema.$ref, baseURI.href);
    url.hash = url.hash;
    Object.defineProperty(schema, "__absolute_ref__", {
      enumerable: false,
      value: url.href
    });
  }
  if (schema.$recursiveRef && schema.__absolute_recursive_ref__ === void 0) {
    const url = new URL(schema.$recursiveRef, baseURI.href);
    url.hash = url.hash;
    Object.defineProperty(schema, "__absolute_recursive_ref__", {
      enumerable: false,
      value: url.href
    });
  }
  if (schema.$anchor) {
    const url = new URL("#" + schema.$anchor, baseURI.href);
    lookup2[url.href] = schema;
  }
  for (let key in schema) {
    if (ignoredKeyword[key]) {
      continue;
    }
    const keyBase = `${basePointer}/${encodePointer(key)}`;
    const subSchema = schema[key];
    if (Array.isArray(subSchema)) {
      if (schemaArrayKeyword[key]) {
        const length = subSchema.length;
        for (let i = 0; i < length; i++) {
          dereference(subSchema[i], lookup2, baseURI, `${keyBase}/${i}`);
        }
      }
    } else if (schemaMapKeyword[key]) {
      for (let subKey in subSchema) {
        dereference(subSchema[subKey], lookup2, baseURI, `${keyBase}/${encodePointer(subKey)}`);
      }
    } else {
      dereference(subSchema, lookup2, baseURI, keyBase);
    }
  }
  return lookup2;
}
var schemaArrayKeyword, schemaMapKeyword, ignoredKeyword, initialBaseURI;
var init_dereference = __esm({
  "node_modules/@cfworker/json-schema/dist/esm/dereference.js"() {
    init_pointer();
    schemaArrayKeyword = {
      prefixItems: true,
      items: true,
      allOf: true,
      anyOf: true,
      oneOf: true
    };
    schemaMapKeyword = {
      $defs: true,
      definitions: true,
      properties: true,
      patternProperties: true,
      dependentSchemas: true
    };
    ignoredKeyword = {
      id: true,
      $id: true,
      $ref: true,
      $schema: true,
      $anchor: true,
      $vocabulary: true,
      $comment: true,
      default: true,
      enum: true,
      const: true,
      required: true,
      type: true,
      maximum: true,
      minimum: true,
      exclusiveMaximum: true,
      exclusiveMinimum: true,
      multipleOf: true,
      maxLength: true,
      minLength: true,
      pattern: true,
      format: true,
      maxItems: true,
      minItems: true,
      uniqueItems: true,
      maxProperties: true,
      minProperties: true
    };
    initialBaseURI = typeof self !== "undefined" && self.location && self.location.origin !== "null" ? new URL(self.location.origin + self.location.pathname + location.search) : new URL("https://github.com/cfworker");
  }
});

// node_modules/@cfworker/json-schema/dist/esm/format.js
function bind(r) {
  return r.test.bind(r);
}
function isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}
function date(str) {
  const matches = str.match(DATE);
  if (!matches)
    return false;
  const year = +matches[1];
  const month = +matches[2];
  const day = +matches[3];
  return month >= 1 && month <= 12 && day >= 1 && day <= (month == 2 && isLeapYear(year) ? 29 : DAYS[month]);
}
function time(full, str) {
  const matches = str.match(TIME);
  if (!matches)
    return false;
  const hour = +matches[1];
  const minute = +matches[2];
  const second = +matches[3];
  const timeZone = !!matches[5];
  return (hour <= 23 && minute <= 59 && second <= 59 || hour == 23 && minute == 59 && second == 60) && (!full || timeZone);
}
function date_time(str) {
  const dateTime = str.split(DATE_TIME_SEPARATOR);
  return dateTime.length == 2 && date(dateTime[0]) && time(true, dateTime[1]);
}
function uri(str) {
  return NOT_URI_FRAGMENT.test(str) && URI_PATTERN.test(str);
}
function regex(str) {
  if (Z_ANCHOR.test(str))
    return false;
  try {
    new RegExp(str, "u");
    return true;
  } catch (e) {
    return false;
  }
}
var DATE, DAYS, TIME, HOSTNAME, URIREF, URITEMPLATE, URL_, UUID, JSON_POINTER, JSON_POINTER_URI_FRAGMENT, RELATIVE_JSON_POINTER, EMAIL, IPV4, IPV6, DURATION, format, DATE_TIME_SEPARATOR, NOT_URI_FRAGMENT, URI_PATTERN, Z_ANCHOR;
var init_format = __esm({
  "node_modules/@cfworker/json-schema/dist/esm/format.js"() {
    DATE = /^(\d\d\d\d)-(\d\d)-(\d\d)$/;
    DAYS = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    TIME = /^(\d\d):(\d\d):(\d\d)(\.\d+)?(z|[+-]\d\d(?::?\d\d)?)?$/i;
    HOSTNAME = /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i;
    URIREF = /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
    URITEMPLATE = /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i;
    URL_ = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u{00a1}-\u{ffff}0-9]+-?)*[a-z\u{00a1}-\u{ffff}0-9]+)(?:\.(?:[a-z\u{00a1}-\u{ffff}0-9]+-?)*[a-z\u{00a1}-\u{ffff}0-9]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu;
    UUID = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
    JSON_POINTER = /^(?:\/(?:[^~/]|~0|~1)*)*$/;
    JSON_POINTER_URI_FRAGMENT = /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i;
    RELATIVE_JSON_POINTER = /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/;
    EMAIL = (input) => {
      if (input[0] === '"')
        return false;
      const [name, host, ...rest] = input.split("@");
      if (!name || !host || rest.length !== 0 || name.length > 64 || host.length > 253)
        return false;
      if (name[0] === "." || name.endsWith(".") || name.includes(".."))
        return false;
      if (!/^[a-z0-9.-]+$/i.test(host) || !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(name))
        return false;
      return host.split(".").every((part) => /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/i.test(part));
    };
    IPV4 = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
    IPV6 = /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i;
    DURATION = (input) => input.length > 1 && input.length < 80 && (/^P\d+([.,]\d+)?W$/.test(input) || /^P[\dYMDTHS]*(\d[.,]\d+)?[YMDHS]$/.test(input) && /^P([.,\d]+Y)?([.,\d]+M)?([.,\d]+D)?(T([.,\d]+H)?([.,\d]+M)?([.,\d]+S)?)?$/.test(input));
    format = {
      date,
      time: time.bind(void 0, false),
      "date-time": date_time,
      duration: DURATION,
      uri,
      "uri-reference": bind(URIREF),
      "uri-template": bind(URITEMPLATE),
      url: bind(URL_),
      email: EMAIL,
      hostname: bind(HOSTNAME),
      ipv4: bind(IPV4),
      ipv6: bind(IPV6),
      regex,
      uuid: bind(UUID),
      "json-pointer": bind(JSON_POINTER),
      "json-pointer-uri-fragment": bind(JSON_POINTER_URI_FRAGMENT),
      "relative-json-pointer": bind(RELATIVE_JSON_POINTER)
    };
    DATE_TIME_SEPARATOR = /t|\s/i;
    NOT_URI_FRAGMENT = /\/|:/;
    URI_PATTERN = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
    Z_ANCHOR = /[^\\]\\Z/;
  }
});

// node_modules/@cfworker/json-schema/dist/esm/types.js
var OutputFormat;
var init_types = __esm({
  "node_modules/@cfworker/json-schema/dist/esm/types.js"() {
    (function(OutputFormat2) {
      OutputFormat2[OutputFormat2["Flag"] = 1] = "Flag";
      OutputFormat2[OutputFormat2["Basic"] = 2] = "Basic";
      OutputFormat2[OutputFormat2["Detailed"] = 4] = "Detailed";
    })(OutputFormat || (OutputFormat = {}));
  }
});

// node_modules/@cfworker/json-schema/dist/esm/ucs2-length.js
function ucs2length(s) {
  let result = 0;
  let length = s.length;
  let index = 0;
  let charCode;
  while (index < length) {
    result++;
    charCode = s.charCodeAt(index++);
    if (charCode >= 55296 && charCode <= 56319 && index < length) {
      charCode = s.charCodeAt(index);
      if ((charCode & 64512) == 56320) {
        index++;
      }
    }
  }
  return result;
}
var init_ucs2_length = __esm({
  "node_modules/@cfworker/json-schema/dist/esm/ucs2-length.js"() {
  }
});

// node_modules/@cfworker/json-schema/dist/esm/validate.js
function validate3(instance, schema, draft = "2019-09", lookup2 = dereference(schema), shortCircuit = true, recursiveAnchor = null, instanceLocation = "#", schemaLocation = "#", evaluated = /* @__PURE__ */ Object.create(null)) {
  if (schema === true) {
    return { valid: true, errors: [] };
  }
  if (schema === false) {
    return {
      valid: false,
      errors: [
        {
          instanceLocation,
          keyword: "false",
          keywordLocation: instanceLocation,
          error: "False boolean schema."
        }
      ]
    };
  }
  const rawInstanceType = typeof instance;
  let instanceType;
  switch (rawInstanceType) {
    case "boolean":
    case "number":
    case "string":
      instanceType = rawInstanceType;
      break;
    case "object":
      if (instance === null) {
        instanceType = "null";
      } else if (Array.isArray(instance)) {
        instanceType = "array";
      } else {
        instanceType = "object";
      }
      break;
    default:
      throw new Error(`Instances of "${rawInstanceType}" type are not supported.`);
  }
  const { $ref, $recursiveRef, $recursiveAnchor, type: $type, const: $const, enum: $enum, required: $required, not: $not, anyOf: $anyOf, allOf: $allOf, oneOf: $oneOf, if: $if, then: $then, else: $else, format: $format, properties: $properties, patternProperties: $patternProperties, additionalProperties: $additionalProperties, unevaluatedProperties: $unevaluatedProperties, minProperties: $minProperties, maxProperties: $maxProperties, propertyNames: $propertyNames, dependentRequired: $dependentRequired, dependentSchemas: $dependentSchemas, dependencies: $dependencies, prefixItems: $prefixItems, items: $items, additionalItems: $additionalItems, unevaluatedItems: $unevaluatedItems, contains: $contains, minContains: $minContains, maxContains: $maxContains, minItems: $minItems, maxItems: $maxItems, uniqueItems: $uniqueItems, minimum: $minimum, maximum: $maximum, exclusiveMinimum: $exclusiveMinimum, exclusiveMaximum: $exclusiveMaximum, multipleOf: $multipleOf, minLength: $minLength, maxLength: $maxLength, pattern: $pattern, __absolute_ref__, __absolute_recursive_ref__ } = schema;
  const errors2 = [];
  if ($recursiveAnchor === true && recursiveAnchor === null) {
    recursiveAnchor = schema;
  }
  if ($recursiveRef === "#") {
    const refSchema = recursiveAnchor === null ? lookup2[__absolute_recursive_ref__] : recursiveAnchor;
    const keywordLocation = `${schemaLocation}/$recursiveRef`;
    const result = validate3(instance, recursiveAnchor === null ? schema : recursiveAnchor, draft, lookup2, shortCircuit, refSchema, instanceLocation, keywordLocation, evaluated);
    if (!result.valid) {
      errors2.push({
        instanceLocation,
        keyword: "$recursiveRef",
        keywordLocation,
        error: "A subschema had errors."
      }, ...result.errors);
    }
  }
  if ($ref !== void 0) {
    const uri2 = __absolute_ref__ || $ref;
    const refSchema = lookup2[uri2];
    if (refSchema === void 0) {
      let message = `Unresolved $ref "${$ref}".`;
      if (__absolute_ref__ && __absolute_ref__ !== $ref) {
        message += `  Absolute URI "${__absolute_ref__}".`;
      }
      message += `
Known schemas:
- ${Object.keys(lookup2).join("\n- ")}`;
      throw new Error(message);
    }
    const keywordLocation = `${schemaLocation}/$ref`;
    const result = validate3(instance, refSchema, draft, lookup2, shortCircuit, recursiveAnchor, instanceLocation, keywordLocation, evaluated);
    if (!result.valid) {
      errors2.push({
        instanceLocation,
        keyword: "$ref",
        keywordLocation,
        error: "A subschema had errors."
      }, ...result.errors);
    }
    if (draft === "4" || draft === "7") {
      return { valid: errors2.length === 0, errors: errors2 };
    }
  }
  if (Array.isArray($type)) {
    let length = $type.length;
    let valid = false;
    for (let i = 0; i < length; i++) {
      if (instanceType === $type[i] || $type[i] === "integer" && instanceType === "number" && instance % 1 === 0 && instance === instance) {
        valid = true;
        break;
      }
    }
    if (!valid) {
      errors2.push({
        instanceLocation,
        keyword: "type",
        keywordLocation: `${schemaLocation}/type`,
        error: `Instance type "${instanceType}" is invalid. Expected "${$type.join('", "')}".`
      });
    }
  } else if ($type === "integer") {
    if (instanceType !== "number" || instance % 1 || instance !== instance) {
      errors2.push({
        instanceLocation,
        keyword: "type",
        keywordLocation: `${schemaLocation}/type`,
        error: `Instance type "${instanceType}" is invalid. Expected "${$type}".`
      });
    }
  } else if ($type !== void 0 && instanceType !== $type) {
    errors2.push({
      instanceLocation,
      keyword: "type",
      keywordLocation: `${schemaLocation}/type`,
      error: `Instance type "${instanceType}" is invalid. Expected "${$type}".`
    });
  }
  if ($const !== void 0) {
    if (instanceType === "object" || instanceType === "array") {
      if (!deepCompareStrict(instance, $const)) {
        errors2.push({
          instanceLocation,
          keyword: "const",
          keywordLocation: `${schemaLocation}/const`,
          error: `Instance does not match ${JSON.stringify($const)}.`
        });
      }
    } else if (instance !== $const) {
      errors2.push({
        instanceLocation,
        keyword: "const",
        keywordLocation: `${schemaLocation}/const`,
        error: `Instance does not match ${JSON.stringify($const)}.`
      });
    }
  }
  if ($enum !== void 0) {
    if (instanceType === "object" || instanceType === "array") {
      if (!$enum.some((value) => deepCompareStrict(instance, value))) {
        errors2.push({
          instanceLocation,
          keyword: "enum",
          keywordLocation: `${schemaLocation}/enum`,
          error: `Instance does not match any of ${JSON.stringify($enum)}.`
        });
      }
    } else if (!$enum.some((value) => instance === value)) {
      errors2.push({
        instanceLocation,
        keyword: "enum",
        keywordLocation: `${schemaLocation}/enum`,
        error: `Instance does not match any of ${JSON.stringify($enum)}.`
      });
    }
  }
  if ($not !== void 0) {
    const keywordLocation = `${schemaLocation}/not`;
    const result = validate3(instance, $not, draft, lookup2, shortCircuit, recursiveAnchor, instanceLocation, keywordLocation);
    if (result.valid) {
      errors2.push({
        instanceLocation,
        keyword: "not",
        keywordLocation,
        error: 'Instance matched "not" schema.'
      });
    }
  }
  let subEvaluateds = [];
  if ($anyOf !== void 0) {
    const keywordLocation = `${schemaLocation}/anyOf`;
    const errorsLength = errors2.length;
    let anyValid = false;
    for (let i = 0; i < $anyOf.length; i++) {
      const subSchema = $anyOf[i];
      const subEvaluated = Object.create(evaluated);
      const result = validate3(instance, subSchema, draft, lookup2, shortCircuit, $recursiveAnchor === true ? recursiveAnchor : null, instanceLocation, `${keywordLocation}/${i}`, subEvaluated);
      errors2.push(...result.errors);
      anyValid = anyValid || result.valid;
      if (result.valid) {
        subEvaluateds.push(subEvaluated);
      }
    }
    if (anyValid) {
      errors2.length = errorsLength;
    } else {
      errors2.splice(errorsLength, 0, {
        instanceLocation,
        keyword: "anyOf",
        keywordLocation,
        error: "Instance does not match any subschemas."
      });
    }
  }
  if ($allOf !== void 0) {
    const keywordLocation = `${schemaLocation}/allOf`;
    const errorsLength = errors2.length;
    let allValid = true;
    for (let i = 0; i < $allOf.length; i++) {
      const subSchema = $allOf[i];
      const subEvaluated = Object.create(evaluated);
      const result = validate3(instance, subSchema, draft, lookup2, shortCircuit, $recursiveAnchor === true ? recursiveAnchor : null, instanceLocation, `${keywordLocation}/${i}`, subEvaluated);
      errors2.push(...result.errors);
      allValid = allValid && result.valid;
      if (result.valid) {
        subEvaluateds.push(subEvaluated);
      }
    }
    if (allValid) {
      errors2.length = errorsLength;
    } else {
      errors2.splice(errorsLength, 0, {
        instanceLocation,
        keyword: "allOf",
        keywordLocation,
        error: `Instance does not match every subschema.`
      });
    }
  }
  if ($oneOf !== void 0) {
    const keywordLocation = `${schemaLocation}/oneOf`;
    const errorsLength = errors2.length;
    const matches = $oneOf.filter((subSchema, i) => {
      const subEvaluated = Object.create(evaluated);
      const result = validate3(instance, subSchema, draft, lookup2, shortCircuit, $recursiveAnchor === true ? recursiveAnchor : null, instanceLocation, `${keywordLocation}/${i}`, subEvaluated);
      errors2.push(...result.errors);
      if (result.valid) {
        subEvaluateds.push(subEvaluated);
      }
      return result.valid;
    }).length;
    if (matches === 1) {
      errors2.length = errorsLength;
    } else {
      errors2.splice(errorsLength, 0, {
        instanceLocation,
        keyword: "oneOf",
        keywordLocation,
        error: `Instance does not match exactly one subschema (${matches} matches).`
      });
    }
  }
  if (instanceType === "object" || instanceType === "array") {
    Object.assign(evaluated, ...subEvaluateds);
  }
  if ($if !== void 0) {
    const keywordLocation = `${schemaLocation}/if`;
    const conditionResult = validate3(instance, $if, draft, lookup2, shortCircuit, recursiveAnchor, instanceLocation, keywordLocation, evaluated).valid;
    if (conditionResult) {
      if ($then !== void 0) {
        const thenResult = validate3(instance, $then, draft, lookup2, shortCircuit, recursiveAnchor, instanceLocation, `${schemaLocation}/then`, evaluated);
        if (!thenResult.valid) {
          errors2.push({
            instanceLocation,
            keyword: "if",
            keywordLocation,
            error: `Instance does not match "then" schema.`
          }, ...thenResult.errors);
        }
      }
    } else if ($else !== void 0) {
      const elseResult = validate3(instance, $else, draft, lookup2, shortCircuit, recursiveAnchor, instanceLocation, `${schemaLocation}/else`, evaluated);
      if (!elseResult.valid) {
        errors2.push({
          instanceLocation,
          keyword: "if",
          keywordLocation,
          error: `Instance does not match "else" schema.`
        }, ...elseResult.errors);
      }
    }
  }
  if (instanceType === "object") {
    if ($required !== void 0) {
      for (const key of $required) {
        if (!(key in instance)) {
          errors2.push({
            instanceLocation,
            keyword: "required",
            keywordLocation: `${schemaLocation}/required`,
            error: `Instance does not have required property "${key}".`
          });
        }
      }
    }
    const keys = Object.keys(instance);
    if ($minProperties !== void 0 && keys.length < $minProperties) {
      errors2.push({
        instanceLocation,
        keyword: "minProperties",
        keywordLocation: `${schemaLocation}/minProperties`,
        error: `Instance does not have at least ${$minProperties} properties.`
      });
    }
    if ($maxProperties !== void 0 && keys.length > $maxProperties) {
      errors2.push({
        instanceLocation,
        keyword: "maxProperties",
        keywordLocation: `${schemaLocation}/maxProperties`,
        error: `Instance does not have at least ${$maxProperties} properties.`
      });
    }
    if ($propertyNames !== void 0) {
      const keywordLocation = `${schemaLocation}/propertyNames`;
      for (const key in instance) {
        const subInstancePointer = `${instanceLocation}/${encodePointer(key)}`;
        const result = validate3(key, $propertyNames, draft, lookup2, shortCircuit, recursiveAnchor, subInstancePointer, keywordLocation);
        if (!result.valid) {
          errors2.push({
            instanceLocation,
            keyword: "propertyNames",
            keywordLocation,
            error: `Property name "${key}" does not match schema.`
          }, ...result.errors);
        }
      }
    }
    if ($dependentRequired !== void 0) {
      const keywordLocation = `${schemaLocation}/dependantRequired`;
      for (const key in $dependentRequired) {
        if (key in instance) {
          const required = $dependentRequired[key];
          for (const dependantKey of required) {
            if (!(dependantKey in instance)) {
              errors2.push({
                instanceLocation,
                keyword: "dependentRequired",
                keywordLocation,
                error: `Instance has "${key}" but does not have "${dependantKey}".`
              });
            }
          }
        }
      }
    }
    if ($dependentSchemas !== void 0) {
      for (const key in $dependentSchemas) {
        const keywordLocation = `${schemaLocation}/dependentSchemas`;
        if (key in instance) {
          const result = validate3(instance, $dependentSchemas[key], draft, lookup2, shortCircuit, recursiveAnchor, instanceLocation, `${keywordLocation}/${encodePointer(key)}`, evaluated);
          if (!result.valid) {
            errors2.push({
              instanceLocation,
              keyword: "dependentSchemas",
              keywordLocation,
              error: `Instance has "${key}" but does not match dependant schema.`
            }, ...result.errors);
          }
        }
      }
    }
    if ($dependencies !== void 0) {
      const keywordLocation = `${schemaLocation}/dependencies`;
      for (const key in $dependencies) {
        if (key in instance) {
          const propsOrSchema = $dependencies[key];
          if (Array.isArray(propsOrSchema)) {
            for (const dependantKey of propsOrSchema) {
              if (!(dependantKey in instance)) {
                errors2.push({
                  instanceLocation,
                  keyword: "dependencies",
                  keywordLocation,
                  error: `Instance has "${key}" but does not have "${dependantKey}".`
                });
              }
            }
          } else {
            const result = validate3(instance, propsOrSchema, draft, lookup2, shortCircuit, recursiveAnchor, instanceLocation, `${keywordLocation}/${encodePointer(key)}`);
            if (!result.valid) {
              errors2.push({
                instanceLocation,
                keyword: "dependencies",
                keywordLocation,
                error: `Instance has "${key}" but does not match dependant schema.`
              }, ...result.errors);
            }
          }
        }
      }
    }
    const thisEvaluated = /* @__PURE__ */ Object.create(null);
    let stop = false;
    if ($properties !== void 0) {
      const keywordLocation = `${schemaLocation}/properties`;
      for (const key in $properties) {
        if (!(key in instance)) {
          continue;
        }
        const subInstancePointer = `${instanceLocation}/${encodePointer(key)}`;
        const result = validate3(instance[key], $properties[key], draft, lookup2, shortCircuit, recursiveAnchor, subInstancePointer, `${keywordLocation}/${encodePointer(key)}`);
        if (result.valid) {
          evaluated[key] = thisEvaluated[key] = true;
        } else {
          stop = shortCircuit;
          errors2.push({
            instanceLocation,
            keyword: "properties",
            keywordLocation,
            error: `Property "${key}" does not match schema.`
          }, ...result.errors);
          if (stop)
            break;
        }
      }
    }
    if (!stop && $patternProperties !== void 0) {
      const keywordLocation = `${schemaLocation}/patternProperties`;
      for (const pattern in $patternProperties) {
        const regex2 = new RegExp(pattern, "u");
        const subSchema = $patternProperties[pattern];
        for (const key in instance) {
          if (!regex2.test(key)) {
            continue;
          }
          const subInstancePointer = `${instanceLocation}/${encodePointer(key)}`;
          const result = validate3(instance[key], subSchema, draft, lookup2, shortCircuit, recursiveAnchor, subInstancePointer, `${keywordLocation}/${encodePointer(pattern)}`);
          if (result.valid) {
            evaluated[key] = thisEvaluated[key] = true;
          } else {
            stop = shortCircuit;
            errors2.push({
              instanceLocation,
              keyword: "patternProperties",
              keywordLocation,
              error: `Property "${key}" matches pattern "${pattern}" but does not match associated schema.`
            }, ...result.errors);
          }
        }
      }
    }
    if (!stop && $additionalProperties !== void 0) {
      const keywordLocation = `${schemaLocation}/additionalProperties`;
      for (const key in instance) {
        if (thisEvaluated[key]) {
          continue;
        }
        const subInstancePointer = `${instanceLocation}/${encodePointer(key)}`;
        const result = validate3(instance[key], $additionalProperties, draft, lookup2, shortCircuit, recursiveAnchor, subInstancePointer, keywordLocation);
        if (result.valid) {
          evaluated[key] = true;
        } else {
          stop = shortCircuit;
          errors2.push({
            instanceLocation,
            keyword: "additionalProperties",
            keywordLocation,
            error: `Property "${key}" does not match additional properties schema.`
          }, ...result.errors);
        }
      }
    } else if (!stop && $unevaluatedProperties !== void 0) {
      const keywordLocation = `${schemaLocation}/unevaluatedProperties`;
      for (const key in instance) {
        if (!evaluated[key]) {
          const subInstancePointer = `${instanceLocation}/${encodePointer(key)}`;
          const result = validate3(instance[key], $unevaluatedProperties, draft, lookup2, shortCircuit, recursiveAnchor, subInstancePointer, keywordLocation);
          if (result.valid) {
            evaluated[key] = true;
          } else {
            errors2.push({
              instanceLocation,
              keyword: "unevaluatedProperties",
              keywordLocation,
              error: `Property "${key}" does not match unevaluated properties schema.`
            }, ...result.errors);
          }
        }
      }
    }
  } else if (instanceType === "array") {
    if ($maxItems !== void 0 && instance.length > $maxItems) {
      errors2.push({
        instanceLocation,
        keyword: "maxItems",
        keywordLocation: `${schemaLocation}/maxItems`,
        error: `Array has too many items (${instance.length} > ${$maxItems}).`
      });
    }
    if ($minItems !== void 0 && instance.length < $minItems) {
      errors2.push({
        instanceLocation,
        keyword: "minItems",
        keywordLocation: `${schemaLocation}/minItems`,
        error: `Array has too few items (${instance.length} < ${$minItems}).`
      });
    }
    const length = instance.length;
    let i = 0;
    let stop = false;
    if ($prefixItems !== void 0) {
      const keywordLocation = `${schemaLocation}/prefixItems`;
      const length2 = Math.min($prefixItems.length, length);
      for (; i < length2; i++) {
        const result = validate3(instance[i], $prefixItems[i], draft, lookup2, shortCircuit, recursiveAnchor, `${instanceLocation}/${i}`, `${keywordLocation}/${i}`);
        evaluated[i] = true;
        if (!result.valid) {
          stop = shortCircuit;
          errors2.push({
            instanceLocation,
            keyword: "prefixItems",
            keywordLocation,
            error: `Items did not match schema.`
          }, ...result.errors);
          if (stop)
            break;
        }
      }
    }
    if ($items !== void 0) {
      const keywordLocation = `${schemaLocation}/items`;
      if (Array.isArray($items)) {
        const length2 = Math.min($items.length, length);
        for (; i < length2; i++) {
          const result = validate3(instance[i], $items[i], draft, lookup2, shortCircuit, recursiveAnchor, `${instanceLocation}/${i}`, `${keywordLocation}/${i}`);
          evaluated[i] = true;
          if (!result.valid) {
            stop = shortCircuit;
            errors2.push({
              instanceLocation,
              keyword: "items",
              keywordLocation,
              error: `Items did not match schema.`
            }, ...result.errors);
            if (stop)
              break;
          }
        }
      } else {
        for (; i < length; i++) {
          const result = validate3(instance[i], $items, draft, lookup2, shortCircuit, recursiveAnchor, `${instanceLocation}/${i}`, keywordLocation);
          evaluated[i] = true;
          if (!result.valid) {
            stop = shortCircuit;
            errors2.push({
              instanceLocation,
              keyword: "items",
              keywordLocation,
              error: `Items did not match schema.`
            }, ...result.errors);
            if (stop)
              break;
          }
        }
      }
      if (!stop && $additionalItems !== void 0) {
        const keywordLocation2 = `${schemaLocation}/additionalItems`;
        for (; i < length; i++) {
          const result = validate3(instance[i], $additionalItems, draft, lookup2, shortCircuit, recursiveAnchor, `${instanceLocation}/${i}`, keywordLocation2);
          evaluated[i] = true;
          if (!result.valid) {
            stop = shortCircuit;
            errors2.push({
              instanceLocation,
              keyword: "additionalItems",
              keywordLocation: keywordLocation2,
              error: `Items did not match additional items schema.`
            }, ...result.errors);
          }
        }
      }
    }
    if ($contains !== void 0) {
      if (length === 0 && $minContains === void 0) {
        errors2.push({
          instanceLocation,
          keyword: "contains",
          keywordLocation: `${schemaLocation}/contains`,
          error: `Array is empty. It must contain at least one item matching the schema.`
        });
      } else if ($minContains !== void 0 && length < $minContains) {
        errors2.push({
          instanceLocation,
          keyword: "minContains",
          keywordLocation: `${schemaLocation}/minContains`,
          error: `Array has less items (${length}) than minContains (${$minContains}).`
        });
      } else {
        const keywordLocation = `${schemaLocation}/contains`;
        const errorsLength = errors2.length;
        let contained = 0;
        for (let j = 0; j < length; j++) {
          const result = validate3(instance[j], $contains, draft, lookup2, shortCircuit, recursiveAnchor, `${instanceLocation}/${j}`, keywordLocation);
          if (result.valid) {
            evaluated[j] = true;
            contained++;
          } else {
            errors2.push(...result.errors);
          }
        }
        if (contained >= ($minContains || 0)) {
          errors2.length = errorsLength;
        }
        if ($minContains === void 0 && $maxContains === void 0 && contained === 0) {
          errors2.splice(errorsLength, 0, {
            instanceLocation,
            keyword: "contains",
            keywordLocation,
            error: `Array does not contain item matching schema.`
          });
        } else if ($minContains !== void 0 && contained < $minContains) {
          errors2.push({
            instanceLocation,
            keyword: "minContains",
            keywordLocation: `${schemaLocation}/minContains`,
            error: `Array must contain at least ${$minContains} items matching schema. Only ${contained} items were found.`
          });
        } else if ($maxContains !== void 0 && contained > $maxContains) {
          errors2.push({
            instanceLocation,
            keyword: "maxContains",
            keywordLocation: `${schemaLocation}/maxContains`,
            error: `Array may contain at most ${$maxContains} items matching schema. ${contained} items were found.`
          });
        }
      }
    }
    if (!stop && $unevaluatedItems !== void 0) {
      const keywordLocation = `${schemaLocation}/unevaluatedItems`;
      for (i; i < length; i++) {
        if (evaluated[i]) {
          continue;
        }
        const result = validate3(instance[i], $unevaluatedItems, draft, lookup2, shortCircuit, recursiveAnchor, `${instanceLocation}/${i}`, keywordLocation);
        evaluated[i] = true;
        if (!result.valid) {
          errors2.push({
            instanceLocation,
            keyword: "unevaluatedItems",
            keywordLocation,
            error: `Items did not match unevaluated items schema.`
          }, ...result.errors);
        }
      }
    }
    if ($uniqueItems) {
      for (let j = 0; j < length; j++) {
        const a = instance[j];
        const ao = typeof a === "object" && a !== null;
        for (let k = 0; k < length; k++) {
          if (j === k) {
            continue;
          }
          const b = instance[k];
          const bo = typeof b === "object" && b !== null;
          if (a === b || ao && bo && deepCompareStrict(a, b)) {
            errors2.push({
              instanceLocation,
              keyword: "uniqueItems",
              keywordLocation: `${schemaLocation}/uniqueItems`,
              error: `Duplicate items at indexes ${j} and ${k}.`
            });
            j = Number.MAX_SAFE_INTEGER;
            k = Number.MAX_SAFE_INTEGER;
          }
        }
      }
    }
  } else if (instanceType === "number") {
    if (draft === "4") {
      if ($minimum !== void 0 && ($exclusiveMinimum === true && instance <= $minimum || instance < $minimum)) {
        errors2.push({
          instanceLocation,
          keyword: "minimum",
          keywordLocation: `${schemaLocation}/minimum`,
          error: `${instance} is less than ${$exclusiveMinimum ? "or equal to " : ""} ${$minimum}.`
        });
      }
      if ($maximum !== void 0 && ($exclusiveMaximum === true && instance >= $maximum || instance > $maximum)) {
        errors2.push({
          instanceLocation,
          keyword: "maximum",
          keywordLocation: `${schemaLocation}/maximum`,
          error: `${instance} is greater than ${$exclusiveMaximum ? "or equal to " : ""} ${$maximum}.`
        });
      }
    } else {
      if ($minimum !== void 0 && instance < $minimum) {
        errors2.push({
          instanceLocation,
          keyword: "minimum",
          keywordLocation: `${schemaLocation}/minimum`,
          error: `${instance} is less than ${$minimum}.`
        });
      }
      if ($maximum !== void 0 && instance > $maximum) {
        errors2.push({
          instanceLocation,
          keyword: "maximum",
          keywordLocation: `${schemaLocation}/maximum`,
          error: `${instance} is greater than ${$maximum}.`
        });
      }
      if ($exclusiveMinimum !== void 0 && instance <= $exclusiveMinimum) {
        errors2.push({
          instanceLocation,
          keyword: "exclusiveMinimum",
          keywordLocation: `${schemaLocation}/exclusiveMinimum`,
          error: `${instance} is less than ${$exclusiveMinimum}.`
        });
      }
      if ($exclusiveMaximum !== void 0 && instance >= $exclusiveMaximum) {
        errors2.push({
          instanceLocation,
          keyword: "exclusiveMaximum",
          keywordLocation: `${schemaLocation}/exclusiveMaximum`,
          error: `${instance} is greater than or equal to ${$exclusiveMaximum}.`
        });
      }
    }
    if ($multipleOf !== void 0) {
      const remainder = instance % $multipleOf;
      if (Math.abs(0 - remainder) >= 11920929e-14 && Math.abs($multipleOf - remainder) >= 11920929e-14) {
        errors2.push({
          instanceLocation,
          keyword: "multipleOf",
          keywordLocation: `${schemaLocation}/multipleOf`,
          error: `${instance} is not a multiple of ${$multipleOf}.`
        });
      }
    }
  } else if (instanceType === "string") {
    const length = $minLength === void 0 && $maxLength === void 0 ? 0 : ucs2length(instance);
    if ($minLength !== void 0 && length < $minLength) {
      errors2.push({
        instanceLocation,
        keyword: "minLength",
        keywordLocation: `${schemaLocation}/minLength`,
        error: `String is too short (${length} < ${$minLength}).`
      });
    }
    if ($maxLength !== void 0 && length > $maxLength) {
      errors2.push({
        instanceLocation,
        keyword: "maxLength",
        keywordLocation: `${schemaLocation}/maxLength`,
        error: `String is too long (${length} > ${$maxLength}).`
      });
    }
    if ($pattern !== void 0 && !new RegExp($pattern, "u").test(instance)) {
      errors2.push({
        instanceLocation,
        keyword: "pattern",
        keywordLocation: `${schemaLocation}/pattern`,
        error: `String does not match pattern.`
      });
    }
    if ($format !== void 0 && format[$format] && !format[$format](instance)) {
      errors2.push({
        instanceLocation,
        keyword: "format",
        keywordLocation: `${schemaLocation}/format`,
        error: `String does not match format "${$format}".`
      });
    }
  }
  return { valid: errors2.length === 0, errors: errors2 };
}
var init_validate2 = __esm({
  "node_modules/@cfworker/json-schema/dist/esm/validate.js"() {
    init_deep_compare_strict();
    init_dereference();
    init_format();
    init_pointer();
    init_ucs2_length();
  }
});

// node_modules/@cfworker/json-schema/dist/esm/validator.js
var init_validator = __esm({
  "node_modules/@cfworker/json-schema/dist/esm/validator.js"() {
    init_dereference();
    init_validate2();
  }
});

// node_modules/@cfworker/json-schema/dist/esm/index.js
var init_esm2 = __esm({
  "node_modules/@cfworker/json-schema/dist/esm/index.js"() {
    init_deep_compare_strict();
    init_dereference();
    init_format();
    init_pointer();
    init_types();
    init_ucs2_length();
    init_validate2();
    init_validator();
  }
});

// node_modules/@langchain/core/dist/utils/types/zod.js
function isZodSchemaV4(schema) {
  if (typeof schema !== "object" || schema === null) {
    return false;
  }
  const obj = schema;
  if (!("_zod" in obj)) {
    return false;
  }
  const zod = obj._zod;
  return typeof zod === "object" && zod !== null && "def" in zod;
}
function isZodSchemaV3(schema) {
  if (typeof schema !== "object" || schema === null) {
    return false;
  }
  const obj = schema;
  if (!("_def" in obj) || "_zod" in obj) {
    return false;
  }
  const def = obj._def;
  return typeof def === "object" && def != null && "typeName" in def;
}
function isInteropZodSchema(input) {
  if (!input) {
    return false;
  }
  if (typeof input !== "object") {
    return false;
  }
  if (Array.isArray(input)) {
    return false;
  }
  if (isZodSchemaV4(input) || isZodSchemaV3(input)) {
    return true;
  }
  return false;
}
async function interopParseAsync(schema, input) {
  if (isZodSchemaV4(schema)) {
    return (0, import_core2.parse)(schema, input);
  }
  if (isZodSchemaV3(schema)) {
    return schema.parse(input);
  }
  throw new Error("Schema must be an instance of z3.ZodType or z4.$ZodType");
}
function getSchemaDescription(schema) {
  if (isZodSchemaV4(schema)) {
    return import_core2.globalRegistry.get(schema)?.description;
  }
  if (isZodSchemaV3(schema)) {
    return schema.description;
  }
  if ("description" in schema && typeof schema.description === "string") {
    return schema.description;
  }
  return void 0;
}
function isSimpleStringZodSchema(schema) {
  if (!isInteropZodSchema(schema)) {
    return false;
  }
  if (isZodSchemaV3(schema)) {
    const def = schema._def;
    return def.typeName === "ZodString";
  }
  if (isZodSchemaV4(schema)) {
    const def = schema._zod.def;
    return def.type === "string";
  }
  return false;
}
function isZodObjectV4(obj) {
  if (!isZodSchemaV4(obj))
    return false;
  if (typeof obj === "object" && obj !== null && "_zod" in obj && typeof obj._zod === "object" && obj._zod !== null && "def" in obj._zod && typeof obj._zod.def === "object" && obj._zod.def !== null && "type" in obj._zod.def && obj._zod.def.type === "object") {
    return true;
  }
  return false;
}
function isZodArrayV4(obj) {
  if (!isZodSchemaV4(obj))
    return false;
  if (typeof obj === "object" && obj !== null && "_zod" in obj && typeof obj._zod === "object" && obj._zod !== null && "def" in obj._zod && typeof obj._zod.def === "object" && obj._zod.def !== null && "type" in obj._zod.def && obj._zod.def.type === "array") {
    return true;
  }
  return false;
}
function interopZodObjectStrict(schema, recursive = false) {
  if (isZodSchemaV3(schema)) {
    return schema.strict();
  }
  if (isZodObjectV4(schema)) {
    const outputShape = schema._zod.def.shape;
    if (recursive) {
      for (const [key, keySchema] of Object.entries(schema._zod.def.shape)) {
        if (isZodObjectV4(keySchema)) {
          const outputSchema = interopZodObjectStrict(keySchema, recursive);
          outputShape[key] = outputSchema;
        } else if (isZodArrayV4(keySchema)) {
          let elementSchema = keySchema._zod.def.element;
          if (isZodObjectV4(elementSchema)) {
            elementSchema = interopZodObjectStrict(elementSchema, recursive);
          }
          outputShape[key] = (0, import_core2.clone)(keySchema, {
            ...keySchema._zod.def,
            element: elementSchema
          });
        } else {
          outputShape[key] = keySchema;
        }
        const meta2 = import_core2.globalRegistry.get(keySchema);
        if (meta2)
          import_core2.globalRegistry.add(outputShape[key], meta2);
      }
    }
    const modifiedSchema = (0, import_core2.clone)(schema, {
      ...schema._zod.def,
      shape: outputShape,
      catchall: (0, import_core2._never)(import_core2.$ZodNever)
    });
    const meta = import_core2.globalRegistry.get(schema);
    if (meta)
      import_core2.globalRegistry.add(modifiedSchema, meta);
    return modifiedSchema;
  }
  throw new Error("Schema must be an instance of z3.ZodObject or z4.$ZodObject");
}
function isZodTransformV3(schema) {
  return isZodSchemaV3(schema) && "typeName" in schema._def && schema._def.typeName === "ZodEffects";
}
function isZodTransformV4(schema) {
  return isZodSchemaV4(schema) && schema._zod.def.type === "pipe";
}
function interopZodTransformInputSchema(schema, recursive = false) {
  if (isZodSchemaV3(schema)) {
    if (isZodTransformV3(schema)) {
      return interopZodTransformInputSchema(schema._def.schema, recursive);
    }
    return schema;
  }
  if (isZodSchemaV4(schema)) {
    let outputSchema = schema;
    if (isZodTransformV4(schema)) {
      outputSchema = interopZodTransformInputSchema(schema._zod.def.in, recursive);
    }
    if (recursive) {
      if (isZodObjectV4(outputSchema)) {
        const outputShape = outputSchema._zod.def.shape;
        for (const [key, keySchema] of Object.entries(outputSchema._zod.def.shape)) {
          outputShape[key] = interopZodTransformInputSchema(keySchema, recursive);
        }
        outputSchema = (0, import_core2.clone)(outputSchema, {
          ...outputSchema._zod.def,
          shape: outputShape
        });
      } else if (isZodArrayV4(outputSchema)) {
        const elementSchema = interopZodTransformInputSchema(outputSchema._zod.def.element, recursive);
        outputSchema = (0, import_core2.clone)(outputSchema, {
          ...outputSchema._zod.def,
          element: elementSchema
        });
      }
    }
    const meta = import_core2.globalRegistry.get(schema);
    if (meta)
      import_core2.globalRegistry.add(outputSchema, meta);
    return outputSchema;
  }
  throw new Error("Schema must be an instance of z3.ZodType or z4.$ZodType");
}
var import_core2;
var init_zod = __esm({
  "node_modules/@langchain/core/dist/utils/types/zod.js"() {
    import_core2 = require("zod/v4/core");
  }
});

// node_modules/@langchain/core/dist/utils/json_schema.js
function toJsonSchema(schema) {
  if (isZodSchemaV4(schema)) {
    const inputSchema = interopZodTransformInputSchema(schema, true);
    if (isZodObjectV4(inputSchema)) {
      const strictSchema = interopZodObjectStrict(inputSchema, true);
      return (0, import_core3.toJSONSchema)(strictSchema);
    } else {
      return (0, import_core3.toJSONSchema)(schema);
    }
  }
  if (isZodSchemaV3(schema)) {
    return zodToJsonSchema(schema);
  }
  return schema;
}
var import_core3;
var init_json_schema = __esm({
  "node_modules/@langchain/core/dist/utils/json_schema.js"() {
    import_core3 = require("zod/v4/core");
    init_esm();
    init_esm2();
    init_zod();
    init_esm2();
  }
});

// node_modules/@langchain/core/dist/runnables/graph.js
function nodeDataStr(id, data) {
  if (id !== void 0 && !validate_default(id)) {
    return id;
  } else if (isRunnableInterface(data)) {
    try {
      let dataStr = data.getName();
      dataStr = dataStr.startsWith("Runnable") ? dataStr.slice("Runnable".length) : dataStr;
      return dataStr;
    } catch (error) {
      return data.getName();
    }
  } else {
    return data.name ?? "UnknownSchema";
  }
}
function nodeDataJson(node) {
  if (isRunnableInterface(node.data)) {
    return {
      type: "runnable",
      data: {
        id: node.data.lc_id,
        name: node.data.getName()
      }
    };
  } else {
    return {
      type: "schema",
      data: { ...toJsonSchema(node.data.schema), title: node.data.name }
    };
  }
}
function _firstNode(graph, exclude = []) {
  const targets = new Set(graph.edges.filter((edge) => !exclude.includes(edge.source)).map((edge) => edge.target));
  const found = [];
  for (const node of Object.values(graph.nodes)) {
    if (!exclude.includes(node.id) && !targets.has(node.id)) {
      found.push(node);
    }
  }
  return found.length === 1 ? found[0] : void 0;
}
function _lastNode(graph, exclude = []) {
  const sources = new Set(graph.edges.filter((edge) => !exclude.includes(edge.target)).map((edge) => edge.source));
  const found = [];
  for (const node of Object.values(graph.nodes)) {
    if (!exclude.includes(node.id) && !sources.has(node.id)) {
      found.push(node);
    }
  }
  return found.length === 1 ? found[0] : void 0;
}
var Graph;
var init_graph = __esm({
  "node_modules/@langchain/core/dist/runnables/graph.js"() {
    init_esm_node();
    init_utils3();
    init_graph_mermaid();
    init_json_schema();
    Graph = class _Graph {
      constructor(params) {
        Object.defineProperty(this, "nodes", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: {}
        });
        Object.defineProperty(this, "edges", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: []
        });
        this.nodes = params?.nodes ?? this.nodes;
        this.edges = params?.edges ?? this.edges;
      }
      // Convert the graph to a JSON-serializable format.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toJSON() {
        const stableNodeIds = {};
        Object.values(this.nodes).forEach((node, i) => {
          stableNodeIds[node.id] = validate_default(node.id) ? i : node.id;
        });
        return {
          nodes: Object.values(this.nodes).map((node) => ({
            id: stableNodeIds[node.id],
            ...nodeDataJson(node)
          })),
          edges: this.edges.map((edge) => {
            const item = {
              source: stableNodeIds[edge.source],
              target: stableNodeIds[edge.target]
            };
            if (typeof edge.data !== "undefined") {
              item.data = edge.data;
            }
            if (typeof edge.conditional !== "undefined") {
              item.conditional = edge.conditional;
            }
            return item;
          })
        };
      }
      addNode(data, id, metadata) {
        if (id !== void 0 && this.nodes[id] !== void 0) {
          throw new Error(`Node with id ${id} already exists`);
        }
        const nodeId = id ?? v4_default();
        const node = {
          id: nodeId,
          data,
          name: nodeDataStr(id, data),
          metadata
        };
        this.nodes[nodeId] = node;
        return node;
      }
      removeNode(node) {
        delete this.nodes[node.id];
        this.edges = this.edges.filter((edge) => edge.source !== node.id && edge.target !== node.id);
      }
      addEdge(source, target, data, conditional) {
        if (this.nodes[source.id] === void 0) {
          throw new Error(`Source node ${source.id} not in graph`);
        }
        if (this.nodes[target.id] === void 0) {
          throw new Error(`Target node ${target.id} not in graph`);
        }
        const edge = {
          source: source.id,
          target: target.id,
          data,
          conditional
        };
        this.edges.push(edge);
        return edge;
      }
      firstNode() {
        return _firstNode(this);
      }
      lastNode() {
        return _lastNode(this);
      }
      /**
       * Add all nodes and edges from another graph.
       * Note this doesn't check for duplicates, nor does it connect the graphs.
       */
      extend(graph, prefix = "") {
        let finalPrefix = prefix;
        const nodeIds = Object.values(graph.nodes).map((node) => node.id);
        if (nodeIds.every(validate_default)) {
          finalPrefix = "";
        }
        const prefixed = (id) => {
          return finalPrefix ? `${finalPrefix}:${id}` : id;
        };
        Object.entries(graph.nodes).forEach(([key, value]) => {
          this.nodes[prefixed(key)] = { ...value, id: prefixed(key) };
        });
        const newEdges = graph.edges.map((edge) => {
          return {
            ...edge,
            source: prefixed(edge.source),
            target: prefixed(edge.target)
          };
        });
        this.edges = [...this.edges, ...newEdges];
        const first = graph.firstNode();
        const last = graph.lastNode();
        return [
          first ? { id: prefixed(first.id), data: first.data } : void 0,
          last ? { id: prefixed(last.id), data: last.data } : void 0
        ];
      }
      trimFirstNode() {
        const firstNode = this.firstNode();
        if (firstNode && _firstNode(this, [firstNode.id])) {
          this.removeNode(firstNode);
        }
      }
      trimLastNode() {
        const lastNode = this.lastNode();
        if (lastNode && _lastNode(this, [lastNode.id])) {
          this.removeNode(lastNode);
        }
      }
      /**
       * Return a new graph with all nodes re-identified,
       * using their unique, readable names where possible.
       */
      reid() {
        const nodeLabels = Object.fromEntries(Object.values(this.nodes).map((node) => [node.id, node.name]));
        const nodeLabelCounts = /* @__PURE__ */ new Map();
        Object.values(nodeLabels).forEach((label) => {
          nodeLabelCounts.set(label, (nodeLabelCounts.get(label) || 0) + 1);
        });
        const getNodeId = (nodeId) => {
          const label = nodeLabels[nodeId];
          if (validate_default(nodeId) && nodeLabelCounts.get(label) === 1) {
            return label;
          } else {
            return nodeId;
          }
        };
        return new _Graph({
          nodes: Object.fromEntries(Object.entries(this.nodes).map(([id, node]) => [
            getNodeId(id),
            { ...node, id: getNodeId(id) }
          ])),
          edges: this.edges.map((edge) => ({
            ...edge,
            source: getNodeId(edge.source),
            target: getNodeId(edge.target)
          }))
        });
      }
      drawMermaid(params) {
        const { withStyles, curveStyle, nodeColors = {
          default: "fill:#f2f0ff,line-height:1.2",
          first: "fill-opacity:0",
          last: "fill:#bfb6fc"
        }, wrapLabelNWords } = params ?? {};
        const graph = this.reid();
        const firstNode = graph.firstNode();
        const lastNode = graph.lastNode();
        return drawMermaid(graph.nodes, graph.edges, {
          firstNode: firstNode?.id,
          lastNode: lastNode?.id,
          withStyles,
          curveStyle,
          nodeColors,
          wrapLabelNWords
        });
      }
      async drawMermaidPng(params) {
        const mermaidSyntax = this.drawMermaid(params);
        return drawMermaidPng(mermaidSyntax, {
          backgroundColor: params?.backgroundColor
        });
      }
    };
  }
});

// node_modules/@langchain/core/dist/runnables/wrappers.js
function convertToHttpEventStream(stream) {
  const encoder2 = new TextEncoder();
  const finalStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        controller.enqueue(encoder2.encode(`event: data
data: ${JSON.stringify(chunk)}

`));
      }
      controller.enqueue(encoder2.encode("event: end\n\n"));
      controller.close();
    }
  });
  return IterableReadableStream.fromReadableStream(finalStream);
}
var init_wrappers = __esm({
  "node_modules/@langchain/core/dist/runnables/wrappers.js"() {
    init_stream();
  }
});

// node_modules/@langchain/core/dist/runnables/iter.js
function isIterableIterator(thing) {
  return typeof thing === "object" && thing !== null && typeof thing[Symbol.iterator] === "function" && // avoid detecting array/set as iterator
  typeof thing.next === "function";
}
function isAsyncIterable(thing) {
  return typeof thing === "object" && thing !== null && typeof thing[Symbol.asyncIterator] === "function";
}
function* consumeIteratorInContext(context, iter) {
  while (true) {
    const { value, done } = AsyncLocalStorageProviderSingleton2.runWithConfig(pickRunnableConfigKeys(context), iter.next.bind(iter), true);
    if (done) {
      break;
    } else {
      yield value;
    }
  }
}
async function* consumeAsyncIterableInContext(context, iter) {
  const iterator = iter[Symbol.asyncIterator]();
  while (true) {
    const { value, done } = await AsyncLocalStorageProviderSingleton2.runWithConfig(pickRunnableConfigKeys(context), iterator.next.bind(iter), true);
    if (done) {
      break;
    } else {
      yield value;
    }
  }
}
var isIterator;
var init_iter = __esm({
  "node_modules/@langchain/core/dist/runnables/iter.js"() {
    init_singletons();
    init_config();
    isIterator = (x) => x != null && typeof x === "object" && "next" in x && typeof x.next === "function";
  }
});

// node_modules/@langchain/core/dist/runnables/base.js
function _coerceToDict2(value, defaultKey) {
  return value && !Array.isArray(value) && // eslint-disable-next-line no-instanceof/no-instanceof
  !(value instanceof Date) && typeof value === "object" ? value : { [defaultKey]: value };
}
function assertNonTraceableFunction(func) {
  if (isTraceableFunction(func)) {
    throw new Error("RunnableLambda requires a function that is not wrapped in traceable higher-order function. This shouldn't happen.");
  }
}
function _coerceToRunnable(coerceable) {
  if (typeof coerceable === "function") {
    return new RunnableLambda({ func: coerceable });
  } else if (Runnable.isRunnable(coerceable)) {
    return coerceable;
  } else if (!Array.isArray(coerceable) && typeof coerceable === "object") {
    const runnables = {};
    for (const [key, value] of Object.entries(coerceable)) {
      runnables[key] = _coerceToRunnable(value);
    }
    return new RunnableMap({
      steps: runnables
    });
  } else {
    throw new Error(`Expected a Runnable, function or object.
Instead got an unsupported type.`);
  }
}
function convertRunnableToTool(runnable, fields) {
  const name = fields.name ?? runnable.getName();
  const description = fields.description ?? getSchemaDescription(fields.schema);
  if (isSimpleStringZodSchema(fields.schema)) {
    return new RunnableToolLike({
      name,
      description,
      schema: import_v34.z.object({ input: import_v34.z.string() }).transform((input) => input.input),
      bound: runnable
    });
  }
  return new RunnableToolLike({
    name,
    description,
    schema: fields.schema,
    bound: runnable
  });
}
var import_v34, import_p_retry3, Runnable, RunnableBinding, RunnableEach, RunnableRetry, RunnableSequence, RunnableMap, RunnableTraceable, RunnableLambda, RunnableWithFallbacks, RunnableAssign, RunnablePick, RunnableToolLike;
var init_base4 = __esm({
  "node_modules/@langchain/core/dist/runnables/base.js"() {
    import_v34 = require("zod/v3");
    import_p_retry3 = __toESM(require_p_retry(), 1);
    init_esm_node();
    init_traceable2();
    init_log_stream();
    init_event_stream();
    init_serializable();
    init_stream();
    init_signal();
    init_config();
    init_async_caller2();
    init_root_listener();
    init_utils3();
    init_singletons();
    init_graph();
    init_wrappers();
    init_iter();
    init_utils();
    init_zod();
    Runnable = class extends Serializable {
      constructor() {
        super(...arguments);
        Object.defineProperty(this, "lc_runnable", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
      }
      getName(suffix) {
        const name = (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          this.name ?? this.constructor.lc_name() ?? this.constructor.name
        );
        return suffix ? `${name}${suffix}` : name;
      }
      /**
       * Bind arguments to a Runnable, returning a new Runnable.
       * @param kwargs
       * @returns A new RunnableBinding that, when invoked, will apply the bound args.
       *
       * @deprecated Use {@link withConfig} instead. This will be removed in the next breaking release.
       */
      bind(kwargs) {
        return new RunnableBinding({ bound: this, kwargs, config: {} });
      }
      /**
       * Return a new Runnable that maps a list of inputs to a list of outputs,
       * by calling invoke() with each input.
       *
       * @deprecated This will be removed in the next breaking release.
       */
      map() {
        return new RunnableEach({ bound: this });
      }
      /**
       * Add retry logic to an existing runnable.
       * @param fields.stopAfterAttempt The number of attempts to retry.
       * @param fields.onFailedAttempt A function that is called when a retry fails.
       * @returns A new RunnableRetry that, when invoked, will retry according to the parameters.
       */
      withRetry(fields) {
        return new RunnableRetry({
          bound: this,
          kwargs: {},
          config: {},
          maxAttemptNumber: fields?.stopAfterAttempt,
          ...fields
        });
      }
      /**
       * Bind config to a Runnable, returning a new Runnable.
       * @param config New configuration parameters to attach to the new runnable.
       * @returns A new RunnableBinding with a config matching what's passed.
       */
      withConfig(config) {
        return new RunnableBinding({
          bound: this,
          config,
          kwargs: {}
        });
      }
      /**
       * Create a new runnable from the current one that will try invoking
       * other passed fallback runnables if the initial invocation fails.
       * @param fields.fallbacks Other runnables to call if the runnable errors.
       * @returns A new RunnableWithFallbacks.
       */
      withFallbacks(fields) {
        const fallbacks = Array.isArray(fields) ? fields : fields.fallbacks;
        return new RunnableWithFallbacks({
          runnable: this,
          fallbacks
        });
      }
      _getOptionsList(options, length = 0) {
        if (Array.isArray(options) && options.length !== length) {
          throw new Error(`Passed "options" must be an array with the same length as the inputs, but got ${options.length} options for ${length} inputs`);
        }
        if (Array.isArray(options)) {
          return options.map(ensureConfig);
        }
        if (length > 1 && !Array.isArray(options) && options.runId) {
          console.warn("Provided runId will be used only for the first element of the batch.");
          const subsequent = Object.fromEntries(Object.entries(options).filter(([key]) => key !== "runId"));
          return Array.from({ length }, (_, i) => ensureConfig(i === 0 ? options : subsequent));
        }
        return Array.from({ length }, () => ensureConfig(options));
      }
      async batch(inputs, options, batchOptions) {
        const configList = this._getOptionsList(options ?? {}, inputs.length);
        const maxConcurrency = configList[0]?.maxConcurrency ?? batchOptions?.maxConcurrency;
        const caller = new AsyncCaller2({
          maxConcurrency,
          onFailedAttempt: (e) => {
            throw e;
          }
        });
        const batchCalls = inputs.map((input, i) => caller.call(async () => {
          try {
            const result = await this.invoke(input, configList[i]);
            return result;
          } catch (e) {
            if (batchOptions?.returnExceptions) {
              return e;
            }
            throw e;
          }
        }));
        return Promise.all(batchCalls);
      }
      /**
       * Default streaming implementation.
       * Subclasses should override this method if they support streaming output.
       * @param input
       * @param options
       */
      async *_streamIterator(input, options) {
        yield this.invoke(input, options);
      }
      /**
       * Stream output in chunks.
       * @param input
       * @param options
       * @returns A readable stream that is also an iterable.
       */
      async stream(input, options) {
        const config = ensureConfig(options);
        const wrappedGenerator = new AsyncGeneratorWithSetup({
          generator: this._streamIterator(input, config),
          config
        });
        await wrappedGenerator.setup;
        return IterableReadableStream.fromAsyncGenerator(wrappedGenerator);
      }
      _separateRunnableConfigFromCallOptions(options) {
        let runnableConfig;
        if (options === void 0) {
          runnableConfig = ensureConfig(options);
        } else {
          runnableConfig = ensureConfig({
            callbacks: options.callbacks,
            tags: options.tags,
            metadata: options.metadata,
            runName: options.runName,
            configurable: options.configurable,
            recursionLimit: options.recursionLimit,
            maxConcurrency: options.maxConcurrency,
            runId: options.runId,
            timeout: options.timeout,
            signal: options.signal
          });
        }
        const callOptions = { ...options };
        delete callOptions.callbacks;
        delete callOptions.tags;
        delete callOptions.metadata;
        delete callOptions.runName;
        delete callOptions.configurable;
        delete callOptions.recursionLimit;
        delete callOptions.maxConcurrency;
        delete callOptions.runId;
        delete callOptions.timeout;
        delete callOptions.signal;
        return [runnableConfig, callOptions];
      }
      async _callWithConfig(func, input, options) {
        const config = ensureConfig(options);
        const callbackManager_ = await getCallbackManagerForConfig(config);
        const runManager = await callbackManager_?.handleChainStart(this.toJSON(), _coerceToDict2(input, "input"), config.runId, config?.runType, void 0, void 0, config?.runName ?? this.getName());
        delete config.runId;
        let output;
        try {
          const promise = func.call(this, input, config, runManager);
          output = await raceWithSignal(promise, options?.signal);
        } catch (e) {
          await runManager?.handleChainError(e);
          throw e;
        }
        await runManager?.handleChainEnd(_coerceToDict2(output, "output"));
        return output;
      }
      /**
       * Internal method that handles batching and configuration for a runnable
       * It takes a function, input values, and optional configuration, and
       * returns a promise that resolves to the output values.
       * @param func The function to be executed for each input value.
       * @param input The input values to be processed.
       * @param config Optional configuration for the function execution.
       * @returns A promise that resolves to the output values.
       */
      async _batchWithConfig(func, inputs, options, batchOptions) {
        const optionsList = this._getOptionsList(options ?? {}, inputs.length);
        const callbackManagers = await Promise.all(optionsList.map(getCallbackManagerForConfig));
        const runManagers = await Promise.all(callbackManagers.map(async (callbackManager, i) => {
          const handleStartRes = await callbackManager?.handleChainStart(this.toJSON(), _coerceToDict2(inputs[i], "input"), optionsList[i].runId, optionsList[i].runType, void 0, void 0, optionsList[i].runName ?? this.getName());
          delete optionsList[i].runId;
          return handleStartRes;
        }));
        let outputs;
        try {
          const promise = func.call(this, inputs, optionsList, runManagers, batchOptions);
          outputs = await raceWithSignal(promise, optionsList?.[0]?.signal);
        } catch (e) {
          await Promise.all(runManagers.map((runManager) => runManager?.handleChainError(e)));
          throw e;
        }
        await Promise.all(runManagers.map((runManager) => runManager?.handleChainEnd(_coerceToDict2(outputs, "output"))));
        return outputs;
      }
      /** @internal */
      _concatOutputChunks(first, second) {
        return concat(first, second);
      }
      /**
       * Helper method to transform an Iterator of Input values into an Iterator of
       * Output values, with callbacks.
       * Use this to implement `stream()` or `transform()` in Runnable subclasses.
       */
      async *_transformStreamWithConfig(inputGenerator, transformer, options) {
        let finalInput;
        let finalInputSupported = true;
        let finalOutput;
        let finalOutputSupported = true;
        const config = ensureConfig(options);
        const callbackManager_ = await getCallbackManagerForConfig(config);
        const outerThis = this;
        async function* wrapInputForTracing() {
          for await (const chunk of inputGenerator) {
            if (finalInputSupported) {
              if (finalInput === void 0) {
                finalInput = chunk;
              } else {
                try {
                  finalInput = outerThis._concatOutputChunks(
                    finalInput,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    chunk
                  );
                } catch {
                  finalInput = void 0;
                  finalInputSupported = false;
                }
              }
            }
            yield chunk;
          }
        }
        let runManager;
        try {
          const pipe = await pipeGeneratorWithSetup(transformer.bind(this), wrapInputForTracing(), async () => callbackManager_?.handleChainStart(this.toJSON(), { input: "" }, config.runId, config.runType, void 0, void 0, config.runName ?? this.getName()), options?.signal, config);
          delete config.runId;
          runManager = pipe.setup;
          const streamEventsHandler = runManager?.handlers.find(isStreamEventsHandler);
          let iterator = pipe.output;
          if (streamEventsHandler !== void 0 && runManager !== void 0) {
            iterator = streamEventsHandler.tapOutputIterable(runManager.runId, iterator);
          }
          const streamLogHandler = runManager?.handlers.find(isLogStreamHandler);
          if (streamLogHandler !== void 0 && runManager !== void 0) {
            iterator = streamLogHandler.tapOutputIterable(runManager.runId, iterator);
          }
          for await (const chunk of iterator) {
            yield chunk;
            if (finalOutputSupported) {
              if (finalOutput === void 0) {
                finalOutput = chunk;
              } else {
                try {
                  finalOutput = this._concatOutputChunks(
                    finalOutput,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    chunk
                  );
                } catch {
                  finalOutput = void 0;
                  finalOutputSupported = false;
                }
              }
            }
          }
        } catch (e) {
          await runManager?.handleChainError(e, void 0, void 0, void 0, {
            inputs: _coerceToDict2(finalInput, "input")
          });
          throw e;
        }
        await runManager?.handleChainEnd(finalOutput ?? {}, void 0, void 0, void 0, { inputs: _coerceToDict2(finalInput, "input") });
      }
      getGraph(_) {
        const graph = new Graph();
        const inputNode = graph.addNode({
          name: `${this.getName()}Input`,
          schema: import_v34.z.any()
        });
        const runnableNode = graph.addNode(this);
        const outputNode = graph.addNode({
          name: `${this.getName()}Output`,
          schema: import_v34.z.any()
        });
        graph.addEdge(inputNode, runnableNode);
        graph.addEdge(runnableNode, outputNode);
        return graph;
      }
      /**
       * Create a new runnable sequence that runs each individual runnable in series,
       * piping the output of one runnable into another runnable or runnable-like.
       * @param coerceable A runnable, function, or object whose values are functions or runnables.
       * @returns A new runnable sequence.
       */
      pipe(coerceable) {
        return new RunnableSequence({
          first: this,
          last: _coerceToRunnable(coerceable)
        });
      }
      /**
       * Pick keys from the dict output of this runnable. Returns a new runnable.
       */
      pick(keys) {
        return this.pipe(new RunnablePick(keys));
      }
      /**
       * Assigns new fields to the dict output of this runnable. Returns a new runnable.
       */
      assign(mapping) {
        return this.pipe(
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          new RunnableAssign(
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            new RunnableMap({ steps: mapping })
          )
        );
      }
      /**
       * Default implementation of transform, which buffers input and then calls stream.
       * Subclasses should override this method if they can start producing output while
       * input is still being generated.
       * @param generator
       * @param options
       */
      async *transform(generator, options) {
        let finalChunk;
        for await (const chunk of generator) {
          if (finalChunk === void 0) {
            finalChunk = chunk;
          } else {
            finalChunk = this._concatOutputChunks(finalChunk, chunk);
          }
        }
        yield* this._streamIterator(finalChunk, ensureConfig(options));
      }
      /**
       * Stream all output from a runnable, as reported to the callback system.
       * This includes all inner runs of LLMs, Retrievers, Tools, etc.
       * Output is streamed as Log objects, which include a list of
       * jsonpatch ops that describe how the state of the run has changed in each
       * step, and the final state of the run.
       * The jsonpatch ops can be applied in order to construct state.
       * @param input
       * @param options
       * @param streamOptions
       */
      async *streamLog(input, options, streamOptions) {
        const logStreamCallbackHandler = new LogStreamCallbackHandler({
          ...streamOptions,
          autoClose: false,
          _schemaFormat: "original"
        });
        const config = ensureConfig(options);
        yield* this._streamLog(input, logStreamCallbackHandler, config);
      }
      async *_streamLog(input, logStreamCallbackHandler, config) {
        const { callbacks } = config;
        if (callbacks === void 0) {
          config.callbacks = [logStreamCallbackHandler];
        } else if (Array.isArray(callbacks)) {
          config.callbacks = callbacks.concat([logStreamCallbackHandler]);
        } else {
          const copiedCallbacks = callbacks.copy();
          copiedCallbacks.addHandler(logStreamCallbackHandler, true);
          config.callbacks = copiedCallbacks;
        }
        const runnableStreamPromise = this.stream(input, config);
        async function consumeRunnableStream() {
          try {
            const runnableStream = await runnableStreamPromise;
            for await (const chunk of runnableStream) {
              const patch = new RunLogPatch({
                ops: [
                  {
                    op: "add",
                    path: "/streamed_output/-",
                    value: chunk
                  }
                ]
              });
              await logStreamCallbackHandler.writer.write(patch);
            }
          } finally {
            await logStreamCallbackHandler.writer.close();
          }
        }
        const runnableStreamConsumePromise = consumeRunnableStream();
        try {
          for await (const log of logStreamCallbackHandler) {
            yield log;
          }
        } finally {
          await runnableStreamConsumePromise;
        }
      }
      streamEvents(input, options, streamOptions) {
        let stream;
        if (options.version === "v1") {
          stream = this._streamEventsV1(input, options, streamOptions);
        } else if (options.version === "v2") {
          stream = this._streamEventsV2(input, options, streamOptions);
        } else {
          throw new Error(`Only versions "v1" and "v2" of the schema are currently supported.`);
        }
        if (options.encoding === "text/event-stream") {
          return convertToHttpEventStream(stream);
        } else {
          return IterableReadableStream.fromAsyncGenerator(stream);
        }
      }
      async *_streamEventsV2(input, options, streamOptions) {
        const eventStreamer = new EventStreamCallbackHandler({
          ...streamOptions,
          autoClose: false
        });
        const config = ensureConfig(options);
        const runId = config.runId ?? v4_default();
        config.runId = runId;
        const callbacks = config.callbacks;
        if (callbacks === void 0) {
          config.callbacks = [eventStreamer];
        } else if (Array.isArray(callbacks)) {
          config.callbacks = callbacks.concat(eventStreamer);
        } else {
          const copiedCallbacks = callbacks.copy();
          copiedCallbacks.addHandler(eventStreamer, true);
          config.callbacks = copiedCallbacks;
        }
        const abortController = new AbortController();
        const outerThis = this;
        async function consumeRunnableStream() {
          let signal;
          let listener = null;
          try {
            if (options?.signal) {
              if ("any" in AbortSignal) {
                signal = AbortSignal.any([
                  abortController.signal,
                  options.signal
                ]);
              } else {
                signal = options.signal;
                listener = () => {
                  abortController.abort();
                };
                options.signal.addEventListener("abort", listener, { once: true });
              }
            } else {
              signal = abortController.signal;
            }
            const runnableStream = await outerThis.stream(input, {
              ...config,
              signal
            });
            const tappedStream = eventStreamer.tapOutputIterable(runId, runnableStream);
            for await (const _ of tappedStream) {
              if (abortController.signal.aborted)
                break;
            }
          } finally {
            await eventStreamer.finish();
            if (signal && listener) {
              signal.removeEventListener("abort", listener);
            }
          }
        }
        const runnableStreamConsumePromise = consumeRunnableStream();
        let firstEventSent = false;
        let firstEventRunId;
        try {
          for await (const event of eventStreamer) {
            if (!firstEventSent) {
              event.data.input = input;
              firstEventSent = true;
              firstEventRunId = event.run_id;
              yield event;
              continue;
            }
            if (event.run_id === firstEventRunId && event.event.endsWith("_end")) {
              if (event.data?.input) {
                delete event.data.input;
              }
            }
            yield event;
          }
        } finally {
          abortController.abort();
          await runnableStreamConsumePromise;
        }
      }
      async *_streamEventsV1(input, options, streamOptions) {
        let runLog;
        let hasEncounteredStartEvent = false;
        const config = ensureConfig(options);
        const rootTags = config.tags ?? [];
        const rootMetadata = config.metadata ?? {};
        const rootName = config.runName ?? this.getName();
        const logStreamCallbackHandler = new LogStreamCallbackHandler({
          ...streamOptions,
          autoClose: false,
          _schemaFormat: "streaming_events"
        });
        const rootEventFilter = new _RootEventFilter({
          ...streamOptions
        });
        const logStream = this._streamLog(input, logStreamCallbackHandler, config);
        for await (const log of logStream) {
          if (!runLog) {
            runLog = RunLog.fromRunLogPatch(log);
          } else {
            runLog = runLog.concat(log);
          }
          if (runLog.state === void 0) {
            throw new Error(`Internal error: "streamEvents" state is missing. Please open a bug report.`);
          }
          if (!hasEncounteredStartEvent) {
            hasEncounteredStartEvent = true;
            const state3 = { ...runLog.state };
            const event = {
              run_id: state3.id,
              event: `on_${state3.type}_start`,
              name: rootName,
              tags: rootTags,
              metadata: rootMetadata,
              data: {
                input
              }
            };
            if (rootEventFilter.includeEvent(event, state3.type)) {
              yield event;
            }
          }
          const paths = log.ops.filter((op) => op.path.startsWith("/logs/")).map((op) => op.path.split("/")[2]);
          const dedupedPaths = [...new Set(paths)];
          for (const path2 of dedupedPaths) {
            let eventType;
            let data = {};
            const logEntry = runLog.state.logs[path2];
            if (logEntry.end_time === void 0) {
              if (logEntry.streamed_output.length > 0) {
                eventType = "stream";
              } else {
                eventType = "start";
              }
            } else {
              eventType = "end";
            }
            if (eventType === "start") {
              if (logEntry.inputs !== void 0) {
                data.input = logEntry.inputs;
              }
            } else if (eventType === "end") {
              if (logEntry.inputs !== void 0) {
                data.input = logEntry.inputs;
              }
              data.output = logEntry.final_output;
            } else if (eventType === "stream") {
              const chunkCount = logEntry.streamed_output.length;
              if (chunkCount !== 1) {
                throw new Error(`Expected exactly one chunk of streamed output, got ${chunkCount} instead. Encountered in: "${logEntry.name}"`);
              }
              data = { chunk: logEntry.streamed_output[0] };
              logEntry.streamed_output = [];
            }
            yield {
              event: `on_${logEntry.type}_${eventType}`,
              name: logEntry.name,
              run_id: logEntry.id,
              tags: logEntry.tags,
              metadata: logEntry.metadata,
              data
            };
          }
          const { state: state2 } = runLog;
          if (state2.streamed_output.length > 0) {
            const chunkCount = state2.streamed_output.length;
            if (chunkCount !== 1) {
              throw new Error(`Expected exactly one chunk of streamed output, got ${chunkCount} instead. Encountered in: "${state2.name}"`);
            }
            const data = { chunk: state2.streamed_output[0] };
            state2.streamed_output = [];
            const event = {
              event: `on_${state2.type}_stream`,
              run_id: state2.id,
              tags: rootTags,
              metadata: rootMetadata,
              name: rootName,
              data
            };
            if (rootEventFilter.includeEvent(event, state2.type)) {
              yield event;
            }
          }
        }
        const state = runLog?.state;
        if (state !== void 0) {
          const event = {
            event: `on_${state.type}_end`,
            name: rootName,
            run_id: state.id,
            tags: rootTags,
            metadata: rootMetadata,
            data: {
              output: state.final_output
            }
          };
          if (rootEventFilter.includeEvent(event, state.type))
            yield event;
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      static isRunnable(thing) {
        return isRunnableInterface(thing);
      }
      /**
       * Bind lifecycle listeners to a Runnable, returning a new Runnable.
       * The Run object contains information about the run, including its id,
       * type, input, output, error, startTime, endTime, and any tags or metadata
       * added to the run.
       *
       * @param {Object} params - The object containing the callback functions.
       * @param {(run: Run) => void} params.onStart - Called before the runnable starts running, with the Run object.
       * @param {(run: Run) => void} params.onEnd - Called after the runnable finishes running, with the Run object.
       * @param {(run: Run) => void} params.onError - Called if the runnable throws an error, with the Run object.
       */
      withListeners({ onStart, onEnd, onError }) {
        return new RunnableBinding({
          bound: this,
          config: {},
          configFactories: [
            (config) => ({
              callbacks: [
                new RootListenersTracer({
                  config,
                  onStart,
                  onEnd,
                  onError
                })
              ]
            })
          ]
        });
      }
      /**
       * Convert a runnable to a tool. Return a new instance of `RunnableToolLike`
       * which contains the runnable, name, description and schema.
       *
       * @template {T extends RunInput = RunInput} RunInput - The input type of the runnable. Should be the same as the `RunInput` type of the runnable.
       *
       * @param fields
       * @param {string | undefined} [fields.name] The name of the tool. If not provided, it will default to the name of the runnable.
       * @param {string | undefined} [fields.description] The description of the tool. Falls back to the description on the Zod schema if not provided, or undefined if neither are provided.
       * @param {z.ZodType<T>} [fields.schema] The Zod schema for the input of the tool. Infers the Zod type from the input type of the runnable.
       * @returns {RunnableToolLike<z.ZodType<T>, RunOutput>} An instance of `RunnableToolLike` which is a runnable that can be used as a tool.
       */
      asTool(fields) {
        return convertRunnableToTool(this, fields);
      }
    };
    RunnableBinding = class _RunnableBinding extends Runnable {
      static lc_name() {
        return "RunnableBinding";
      }
      constructor(fields) {
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ["langchain_core", "runnables"]
        });
        Object.defineProperty(this, "lc_serializable", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        Object.defineProperty(this, "bound", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "config", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "kwargs", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "configFactories", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.bound = fields.bound;
        this.kwargs = fields.kwargs;
        this.config = fields.config;
        this.configFactories = fields.configFactories;
      }
      getName(suffix) {
        return this.bound.getName(suffix);
      }
      async _mergeConfig(...options) {
        const config = mergeConfigs(this.config, ...options);
        return mergeConfigs(config, ...this.configFactories ? await Promise.all(this.configFactories.map(async (configFactory) => await configFactory(config))) : []);
      }
      /**
       * Binds the runnable with the specified arguments.
       * @param kwargs The arguments to bind the runnable with.
       * @returns A new instance of the `RunnableBinding` class that is bound with the specified arguments.
       *
       * @deprecated Use {@link withConfig} instead. This will be removed in the next breaking release.
       */
      bind(kwargs) {
        return new this.constructor({
          bound: this.bound,
          kwargs: { ...this.kwargs, ...kwargs },
          config: this.config
        });
      }
      withConfig(config) {
        return new this.constructor({
          bound: this.bound,
          kwargs: this.kwargs,
          config: { ...this.config, ...config }
        });
      }
      withRetry(fields) {
        return new RunnableRetry({
          bound: this.bound,
          kwargs: this.kwargs,
          config: this.config,
          maxAttemptNumber: fields?.stopAfterAttempt,
          ...fields
        });
      }
      async invoke(input, options) {
        return this.bound.invoke(input, await this._mergeConfig(ensureConfig(options), this.kwargs));
      }
      async batch(inputs, options, batchOptions) {
        const mergedOptions = Array.isArray(options) ? await Promise.all(options.map(async (individualOption) => this._mergeConfig(ensureConfig(individualOption), this.kwargs))) : await this._mergeConfig(ensureConfig(options), this.kwargs);
        return this.bound.batch(inputs, mergedOptions, batchOptions);
      }
      /** @internal */
      _concatOutputChunks(first, second) {
        return this.bound._concatOutputChunks(first, second);
      }
      async *_streamIterator(input, options) {
        yield* this.bound._streamIterator(input, await this._mergeConfig(ensureConfig(options), this.kwargs));
      }
      async stream(input, options) {
        return this.bound.stream(input, await this._mergeConfig(ensureConfig(options), this.kwargs));
      }
      async *transform(generator, options) {
        yield* this.bound.transform(generator, await this._mergeConfig(ensureConfig(options), this.kwargs));
      }
      streamEvents(input, options, streamOptions) {
        const outerThis = this;
        const generator = async function* () {
          yield* outerThis.bound.streamEvents(input, {
            ...await outerThis._mergeConfig(ensureConfig(options), outerThis.kwargs),
            version: options.version
          }, streamOptions);
        };
        return IterableReadableStream.fromAsyncGenerator(generator());
      }
      static isRunnableBinding(thing) {
        return thing.bound && Runnable.isRunnable(thing.bound);
      }
      /**
       * Bind lifecycle listeners to a Runnable, returning a new Runnable.
       * The Run object contains information about the run, including its id,
       * type, input, output, error, startTime, endTime, and any tags or metadata
       * added to the run.
       *
       * @param {Object} params - The object containing the callback functions.
       * @param {(run: Run) => void} params.onStart - Called before the runnable starts running, with the Run object.
       * @param {(run: Run) => void} params.onEnd - Called after the runnable finishes running, with the Run object.
       * @param {(run: Run) => void} params.onError - Called if the runnable throws an error, with the Run object.
       */
      withListeners({ onStart, onEnd, onError }) {
        return new _RunnableBinding({
          bound: this.bound,
          kwargs: this.kwargs,
          config: this.config,
          configFactories: [
            (config) => ({
              callbacks: [
                new RootListenersTracer({
                  config,
                  onStart,
                  onEnd,
                  onError
                })
              ]
            })
          ]
        });
      }
    };
    RunnableEach = class _RunnableEach extends Runnable {
      static lc_name() {
        return "RunnableEach";
      }
      constructor(fields) {
        super(fields);
        Object.defineProperty(this, "lc_serializable", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        Object.defineProperty(this, "lc_namespace", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ["langchain_core", "runnables"]
        });
        Object.defineProperty(this, "bound", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.bound = fields.bound;
      }
      /**
       * Binds the runnable with the specified arguments.
       * @param kwargs The arguments to bind the runnable with.
       * @returns A new instance of the `RunnableEach` class that is bound with the specified arguments.
       *
       * @deprecated Use {@link withConfig} instead. This will be removed in the next breaking release.
       */
      bind(kwargs) {
        return new _RunnableEach({
          bound: this.bound.bind(kwargs)
        });
      }
      /**
       * Invokes the runnable with the specified input and configuration.
       * @param input The input to invoke the runnable with.
       * @param config The configuration to invoke the runnable with.
       * @returns A promise that resolves to the output of the runnable.
       */
      async invoke(inputs, config) {
        return this._callWithConfig(this._invoke.bind(this), inputs, config);
      }
      /**
       * A helper method that is used to invoke the runnable with the specified input and configuration.
       * @param input The input to invoke the runnable with.
       * @param config The configuration to invoke the runnable with.
       * @returns A promise that resolves to the output of the runnable.
       */
      async _invoke(inputs, config, runManager) {
        return this.bound.batch(inputs, patchConfig(config, { callbacks: runManager?.getChild() }));
      }
      /**
       * Bind lifecycle listeners to a Runnable, returning a new Runnable.
       * The Run object contains information about the run, including its id,
       * type, input, output, error, startTime, endTime, and any tags or metadata
       * added to the run.
       *
       * @param {Object} params - The object containing the callback functions.
       * @param {(run: Run) => void} params.onStart - Called before the runnable starts running, with the Run object.
       * @param {(run: Run) => void} params.onEnd - Called after the runnable finishes running, with the Run object.
       * @param {(run: Run) => void} params.onError - Called if the runnable throws an error, with the Run object.
       */
      withListeners({ onStart, onEnd, onError }) {
        return new _RunnableEach({
          bound: this.bound.withListeners({ onStart, onEnd, onError })
        });
      }
    };
    RunnableRetry = class extends RunnableBinding {
      static lc_name() {
        return "RunnableRetry";
      }
      constructor(fields) {
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ["langchain_core", "runnables"]
        });
        Object.defineProperty(this, "maxAttemptNumber", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: 3
        });
        Object.defineProperty(this, "onFailedAttempt", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: () => {
          }
        });
        this.maxAttemptNumber = fields.maxAttemptNumber ?? this.maxAttemptNumber;
        this.onFailedAttempt = fields.onFailedAttempt ?? this.onFailedAttempt;
      }
      _patchConfigForRetry(attempt, config, runManager) {
        const tag = attempt > 1 ? `retry:attempt:${attempt}` : void 0;
        return patchConfig(config, { callbacks: runManager?.getChild(tag) });
      }
      async _invoke(input, config, runManager) {
        return (0, import_p_retry3.default)((attemptNumber) => super.invoke(input, this._patchConfigForRetry(attemptNumber, config, runManager)), {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onFailedAttempt: (error) => this.onFailedAttempt(error, input),
          retries: Math.max(this.maxAttemptNumber - 1, 0),
          randomize: true
        });
      }
      /**
       * Method that invokes the runnable with the specified input, run manager,
       * and config. It handles the retry logic by catching any errors and
       * recursively invoking itself with the updated config for the next retry
       * attempt.
       * @param input The input for the runnable.
       * @param runManager The run manager for the runnable.
       * @param config The config for the runnable.
       * @returns A promise that resolves to the output of the runnable.
       */
      async invoke(input, config) {
        return this._callWithConfig(this._invoke.bind(this), input, config);
      }
      async _batch(inputs, configs, runManagers, batchOptions) {
        const resultsMap = {};
        try {
          await (0, import_p_retry3.default)(async (attemptNumber) => {
            const remainingIndexes = inputs.map((_, i) => i).filter((i) => resultsMap[i.toString()] === void 0 || // eslint-disable-next-line no-instanceof/no-instanceof
            resultsMap[i.toString()] instanceof Error);
            const remainingInputs = remainingIndexes.map((i) => inputs[i]);
            const patchedConfigs = remainingIndexes.map((i) => this._patchConfigForRetry(attemptNumber, configs?.[i], runManagers?.[i]));
            const results = await super.batch(remainingInputs, patchedConfigs, {
              ...batchOptions,
              returnExceptions: true
            });
            let firstException;
            for (let i = 0; i < results.length; i += 1) {
              const result = results[i];
              const resultMapIndex = remainingIndexes[i];
              if (result instanceof Error) {
                if (firstException === void 0) {
                  firstException = result;
                  firstException.input = remainingInputs[i];
                }
              }
              resultsMap[resultMapIndex.toString()] = result;
            }
            if (firstException) {
              throw firstException;
            }
            return results;
          }, {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onFailedAttempt: (error) => this.onFailedAttempt(error, error.input),
            retries: Math.max(this.maxAttemptNumber - 1, 0),
            randomize: true
          });
        } catch (e) {
          if (batchOptions?.returnExceptions !== true) {
            throw e;
          }
        }
        return Object.keys(resultsMap).sort((a, b) => parseInt(a, 10) - parseInt(b, 10)).map((key) => resultsMap[parseInt(key, 10)]);
      }
      async batch(inputs, options, batchOptions) {
        return this._batchWithConfig(this._batch.bind(this), inputs, options, batchOptions);
      }
    };
    RunnableSequence = class _RunnableSequence extends Runnable {
      static lc_name() {
        return "RunnableSequence";
      }
      constructor(fields) {
        super(fields);
        Object.defineProperty(this, "first", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "middle", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: []
        });
        Object.defineProperty(this, "last", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "omitSequenceTags", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: false
        });
        Object.defineProperty(this, "lc_serializable", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        Object.defineProperty(this, "lc_namespace", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ["langchain_core", "runnables"]
        });
        this.first = fields.first;
        this.middle = fields.middle ?? this.middle;
        this.last = fields.last;
        this.name = fields.name;
        this.omitSequenceTags = fields.omitSequenceTags ?? this.omitSequenceTags;
      }
      get steps() {
        return [this.first, ...this.middle, this.last];
      }
      async invoke(input, options) {
        const config = ensureConfig(options);
        const callbackManager_ = await getCallbackManagerForConfig(config);
        const runManager = await callbackManager_?.handleChainStart(this.toJSON(), _coerceToDict2(input, "input"), config.runId, void 0, void 0, void 0, config?.runName);
        delete config.runId;
        let nextStepInput = input;
        let finalOutput;
        try {
          const initialSteps = [this.first, ...this.middle];
          for (let i = 0; i < initialSteps.length; i += 1) {
            const step = initialSteps[i];
            const promise = step.invoke(nextStepInput, patchConfig(config, {
              callbacks: runManager?.getChild(this.omitSequenceTags ? void 0 : `seq:step:${i + 1}`)
            }));
            nextStepInput = await raceWithSignal(promise, options?.signal);
          }
          if (options?.signal?.aborted) {
            throw new Error("Aborted");
          }
          finalOutput = await this.last.invoke(nextStepInput, patchConfig(config, {
            callbacks: runManager?.getChild(this.omitSequenceTags ? void 0 : `seq:step:${this.steps.length}`)
          }));
        } catch (e) {
          await runManager?.handleChainError(e);
          throw e;
        }
        await runManager?.handleChainEnd(_coerceToDict2(finalOutput, "output"));
        return finalOutput;
      }
      async batch(inputs, options, batchOptions) {
        const configList = this._getOptionsList(options ?? {}, inputs.length);
        const callbackManagers = await Promise.all(configList.map(getCallbackManagerForConfig));
        const runManagers = await Promise.all(callbackManagers.map(async (callbackManager, i) => {
          const handleStartRes = await callbackManager?.handleChainStart(this.toJSON(), _coerceToDict2(inputs[i], "input"), configList[i].runId, void 0, void 0, void 0, configList[i].runName);
          delete configList[i].runId;
          return handleStartRes;
        }));
        let nextStepInputs = inputs;
        try {
          for (let i = 0; i < this.steps.length; i += 1) {
            const step = this.steps[i];
            const promise = step.batch(nextStepInputs, runManagers.map((runManager, j) => {
              const childRunManager = runManager?.getChild(this.omitSequenceTags ? void 0 : `seq:step:${i + 1}`);
              return patchConfig(configList[j], { callbacks: childRunManager });
            }), batchOptions);
            nextStepInputs = await raceWithSignal(promise, configList[0]?.signal);
          }
        } catch (e) {
          await Promise.all(runManagers.map((runManager) => runManager?.handleChainError(e)));
          throw e;
        }
        await Promise.all(runManagers.map((runManager) => runManager?.handleChainEnd(_coerceToDict2(nextStepInputs, "output"))));
        return nextStepInputs;
      }
      /** @internal */
      _concatOutputChunks(first, second) {
        return this.last._concatOutputChunks(first, second);
      }
      async *_streamIterator(input, options) {
        const callbackManager_ = await getCallbackManagerForConfig(options);
        const { runId, ...otherOptions } = options ?? {};
        const runManager = await callbackManager_?.handleChainStart(this.toJSON(), _coerceToDict2(input, "input"), runId, void 0, void 0, void 0, otherOptions?.runName);
        const steps = [this.first, ...this.middle, this.last];
        let concatSupported = true;
        let finalOutput;
        async function* inputGenerator() {
          yield input;
        }
        try {
          let finalGenerator = steps[0].transform(inputGenerator(), patchConfig(otherOptions, {
            callbacks: runManager?.getChild(this.omitSequenceTags ? void 0 : `seq:step:1`)
          }));
          for (let i = 1; i < steps.length; i += 1) {
            const step = steps[i];
            finalGenerator = await step.transform(finalGenerator, patchConfig(otherOptions, {
              callbacks: runManager?.getChild(this.omitSequenceTags ? void 0 : `seq:step:${i + 1}`)
            }));
          }
          for await (const chunk of finalGenerator) {
            options?.signal?.throwIfAborted();
            yield chunk;
            if (concatSupported) {
              if (finalOutput === void 0) {
                finalOutput = chunk;
              } else {
                try {
                  finalOutput = this._concatOutputChunks(finalOutput, chunk);
                } catch (e) {
                  finalOutput = void 0;
                  concatSupported = false;
                }
              }
            }
          }
        } catch (e) {
          await runManager?.handleChainError(e);
          throw e;
        }
        await runManager?.handleChainEnd(_coerceToDict2(finalOutput, "output"));
      }
      getGraph(config) {
        const graph = new Graph();
        let currentLastNode = null;
        this.steps.forEach((step, index) => {
          const stepGraph = step.getGraph(config);
          if (index !== 0) {
            stepGraph.trimFirstNode();
          }
          if (index !== this.steps.length - 1) {
            stepGraph.trimLastNode();
          }
          graph.extend(stepGraph);
          const stepFirstNode = stepGraph.firstNode();
          if (!stepFirstNode) {
            throw new Error(`Runnable ${step} has no first node`);
          }
          if (currentLastNode) {
            graph.addEdge(currentLastNode, stepFirstNode);
          }
          currentLastNode = stepGraph.lastNode();
        });
        return graph;
      }
      pipe(coerceable) {
        if (_RunnableSequence.isRunnableSequence(coerceable)) {
          return new _RunnableSequence({
            first: this.first,
            middle: this.middle.concat([
              this.last,
              coerceable.first,
              ...coerceable.middle
            ]),
            last: coerceable.last,
            name: this.name ?? coerceable.name
          });
        } else {
          return new _RunnableSequence({
            first: this.first,
            middle: [...this.middle, this.last],
            last: _coerceToRunnable(coerceable),
            name: this.name
          });
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      static isRunnableSequence(thing) {
        return Array.isArray(thing.middle) && Runnable.isRunnable(thing);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      static from([first, ...runnables], nameOrFields) {
        let extra = {};
        if (typeof nameOrFields === "string") {
          extra.name = nameOrFields;
        } else if (nameOrFields !== void 0) {
          extra = nameOrFields;
        }
        return new _RunnableSequence({
          ...extra,
          first: _coerceToRunnable(first),
          middle: runnables.slice(0, -1).map(_coerceToRunnable),
          last: _coerceToRunnable(runnables[runnables.length - 1])
        });
      }
    };
    RunnableMap = class _RunnableMap extends Runnable {
      static lc_name() {
        return "RunnableMap";
      }
      getStepsKeys() {
        return Object.keys(this.steps);
      }
      constructor(fields) {
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ["langchain_core", "runnables"]
        });
        Object.defineProperty(this, "lc_serializable", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        Object.defineProperty(this, "steps", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.steps = {};
        for (const [key, value] of Object.entries(fields.steps)) {
          this.steps[key] = _coerceToRunnable(value);
        }
      }
      static from(steps) {
        return new _RunnableMap({ steps });
      }
      async invoke(input, options) {
        const config = ensureConfig(options);
        const callbackManager_ = await getCallbackManagerForConfig(config);
        const runManager = await callbackManager_?.handleChainStart(this.toJSON(), {
          input
        }, config.runId, void 0, void 0, void 0, config?.runName);
        delete config.runId;
        const output = {};
        try {
          const promises = Object.entries(this.steps).map(async ([key, runnable]) => {
            output[key] = await runnable.invoke(input, patchConfig(config, {
              callbacks: runManager?.getChild(`map:key:${key}`)
            }));
          });
          await raceWithSignal(Promise.all(promises), options?.signal);
        } catch (e) {
          await runManager?.handleChainError(e);
          throw e;
        }
        await runManager?.handleChainEnd(output);
        return output;
      }
      async *_transform(generator, runManager, options) {
        const steps = { ...this.steps };
        const inputCopies = atee(generator, Object.keys(steps).length);
        const tasks = new Map(Object.entries(steps).map(([key, runnable], i) => {
          const gen = runnable.transform(inputCopies[i], patchConfig(options, {
            callbacks: runManager?.getChild(`map:key:${key}`)
          }));
          return [key, gen.next().then((result) => ({ key, gen, result }))];
        }));
        while (tasks.size) {
          const promise = Promise.race(tasks.values());
          const { key, result, gen } = await raceWithSignal(promise, options?.signal);
          tasks.delete(key);
          if (!result.done) {
            yield { [key]: result.value };
            tasks.set(key, gen.next().then((result2) => ({ key, gen, result: result2 })));
          }
        }
      }
      transform(generator, options) {
        return this._transformStreamWithConfig(generator, this._transform.bind(this), options);
      }
      async stream(input, options) {
        async function* generator() {
          yield input;
        }
        const config = ensureConfig(options);
        const wrappedGenerator = new AsyncGeneratorWithSetup({
          generator: this.transform(generator(), config),
          config
        });
        await wrappedGenerator.setup;
        return IterableReadableStream.fromAsyncGenerator(wrappedGenerator);
      }
    };
    RunnableTraceable = class _RunnableTraceable extends Runnable {
      constructor(fields) {
        super(fields);
        Object.defineProperty(this, "lc_serializable", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: false
        });
        Object.defineProperty(this, "lc_namespace", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ["langchain_core", "runnables"]
        });
        Object.defineProperty(this, "func", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        if (!isTraceableFunction(fields.func)) {
          throw new Error("RunnableTraceable requires a function that is wrapped in traceable higher-order function");
        }
        this.func = fields.func;
      }
      async invoke(input, options) {
        const [config] = this._getOptionsList(options ?? {}, 1);
        const callbacks = await getCallbackManagerForConfig(config);
        const promise = this.func(patchConfig(config, { callbacks }), input);
        return raceWithSignal(promise, config?.signal);
      }
      async *_streamIterator(input, options) {
        const [config] = this._getOptionsList(options ?? {}, 1);
        const result = await this.invoke(input, options);
        if (isAsyncIterable(result)) {
          for await (const item of result) {
            config?.signal?.throwIfAborted();
            yield item;
          }
          return;
        }
        if (isIterator(result)) {
          while (true) {
            config?.signal?.throwIfAborted();
            const state = result.next();
            if (state.done)
              break;
            yield state.value;
          }
          return;
        }
        yield result;
      }
      static from(func) {
        return new _RunnableTraceable({ func });
      }
    };
    RunnableLambda = class _RunnableLambda extends Runnable {
      static lc_name() {
        return "RunnableLambda";
      }
      constructor(fields) {
        if (isTraceableFunction(fields.func)) {
          return RunnableTraceable.from(fields.func);
        }
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ["langchain_core", "runnables"]
        });
        Object.defineProperty(this, "func", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        assertNonTraceableFunction(fields.func);
        this.func = fields.func;
      }
      static from(func) {
        return new _RunnableLambda({
          func
        });
      }
      async _invoke(input, config, runManager) {
        return new Promise((resolve, reject) => {
          const childConfig = patchConfig(config, {
            callbacks: runManager?.getChild(),
            recursionLimit: (config?.recursionLimit ?? DEFAULT_RECURSION_LIMIT) - 1
          });
          void AsyncLocalStorageProviderSingleton2.runWithConfig(pickRunnableConfigKeys(childConfig), async () => {
            try {
              let output = await this.func(input, {
                ...childConfig
              });
              if (output && Runnable.isRunnable(output)) {
                if (config?.recursionLimit === 0) {
                  throw new Error("Recursion limit reached.");
                }
                output = await output.invoke(input, {
                  ...childConfig,
                  recursionLimit: (childConfig.recursionLimit ?? DEFAULT_RECURSION_LIMIT) - 1
                });
              } else if (isAsyncIterable(output)) {
                let finalOutput;
                for await (const chunk of consumeAsyncIterableInContext(childConfig, output)) {
                  config?.signal?.throwIfAborted();
                  if (finalOutput === void 0) {
                    finalOutput = chunk;
                  } else {
                    try {
                      finalOutput = this._concatOutputChunks(
                        finalOutput,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        chunk
                      );
                    } catch (e) {
                      finalOutput = chunk;
                    }
                  }
                }
                output = finalOutput;
              } else if (isIterableIterator(output)) {
                let finalOutput;
                for (const chunk of consumeIteratorInContext(childConfig, output)) {
                  config?.signal?.throwIfAborted();
                  if (finalOutput === void 0) {
                    finalOutput = chunk;
                  } else {
                    try {
                      finalOutput = this._concatOutputChunks(
                        finalOutput,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        chunk
                      );
                    } catch (e) {
                      finalOutput = chunk;
                    }
                  }
                }
                output = finalOutput;
              }
              resolve(output);
            } catch (e) {
              reject(e);
            }
          });
        });
      }
      async invoke(input, options) {
        return this._callWithConfig(this._invoke.bind(this), input, options);
      }
      async *_transform(generator, runManager, config) {
        let finalChunk;
        for await (const chunk of generator) {
          if (finalChunk === void 0) {
            finalChunk = chunk;
          } else {
            try {
              finalChunk = this._concatOutputChunks(finalChunk, chunk);
            } catch (e) {
              finalChunk = chunk;
            }
          }
        }
        const childConfig = patchConfig(config, {
          callbacks: runManager?.getChild(),
          recursionLimit: (config?.recursionLimit ?? DEFAULT_RECURSION_LIMIT) - 1
        });
        const output = await new Promise((resolve, reject) => {
          void AsyncLocalStorageProviderSingleton2.runWithConfig(pickRunnableConfigKeys(childConfig), async () => {
            try {
              const res = await this.func(finalChunk, {
                ...childConfig,
                config: childConfig
              });
              resolve(res);
            } catch (e) {
              reject(e);
            }
          });
        });
        if (output && Runnable.isRunnable(output)) {
          if (config?.recursionLimit === 0) {
            throw new Error("Recursion limit reached.");
          }
          const stream = await output.stream(finalChunk, childConfig);
          for await (const chunk of stream) {
            yield chunk;
          }
        } else if (isAsyncIterable(output)) {
          for await (const chunk of consumeAsyncIterableInContext(childConfig, output)) {
            config?.signal?.throwIfAborted();
            yield chunk;
          }
        } else if (isIterableIterator(output)) {
          for (const chunk of consumeIteratorInContext(childConfig, output)) {
            config?.signal?.throwIfAborted();
            yield chunk;
          }
        } else {
          yield output;
        }
      }
      transform(generator, options) {
        return this._transformStreamWithConfig(generator, this._transform.bind(this), options);
      }
      async stream(input, options) {
        async function* generator() {
          yield input;
        }
        const config = ensureConfig(options);
        const wrappedGenerator = new AsyncGeneratorWithSetup({
          generator: this.transform(generator(), config),
          config
        });
        await wrappedGenerator.setup;
        return IterableReadableStream.fromAsyncGenerator(wrappedGenerator);
      }
    };
    RunnableWithFallbacks = class extends Runnable {
      static lc_name() {
        return "RunnableWithFallbacks";
      }
      constructor(fields) {
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ["langchain_core", "runnables"]
        });
        Object.defineProperty(this, "lc_serializable", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        Object.defineProperty(this, "runnable", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "fallbacks", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.runnable = fields.runnable;
        this.fallbacks = fields.fallbacks;
      }
      *runnables() {
        yield this.runnable;
        for (const fallback of this.fallbacks) {
          yield fallback;
        }
      }
      async invoke(input, options) {
        const config = ensureConfig(options);
        const callbackManager_ = await getCallbackManagerForConfig(config);
        const { runId, ...otherConfigFields } = config;
        const runManager = await callbackManager_?.handleChainStart(this.toJSON(), _coerceToDict2(input, "input"), runId, void 0, void 0, void 0, otherConfigFields?.runName);
        const childConfig = patchConfig(otherConfigFields, {
          callbacks: runManager?.getChild()
        });
        const res = await AsyncLocalStorageProviderSingleton2.runWithConfig(childConfig, async () => {
          let firstError;
          for (const runnable of this.runnables()) {
            config?.signal?.throwIfAborted();
            try {
              const output = await runnable.invoke(input, childConfig);
              await runManager?.handleChainEnd(_coerceToDict2(output, "output"));
              return output;
            } catch (e) {
              if (firstError === void 0) {
                firstError = e;
              }
            }
          }
          if (firstError === void 0) {
            throw new Error("No error stored at end of fallback.");
          }
          await runManager?.handleChainError(firstError);
          throw firstError;
        });
        return res;
      }
      async *_streamIterator(input, options) {
        const config = ensureConfig(options);
        const callbackManager_ = await getCallbackManagerForConfig(config);
        const { runId, ...otherConfigFields } = config;
        const runManager = await callbackManager_?.handleChainStart(this.toJSON(), _coerceToDict2(input, "input"), runId, void 0, void 0, void 0, otherConfigFields?.runName);
        let firstError;
        let stream;
        for (const runnable of this.runnables()) {
          config?.signal?.throwIfAborted();
          const childConfig = patchConfig(otherConfigFields, {
            callbacks: runManager?.getChild()
          });
          try {
            const originalStream = await runnable.stream(input, childConfig);
            stream = consumeAsyncIterableInContext(childConfig, originalStream);
            break;
          } catch (e) {
            if (firstError === void 0) {
              firstError = e;
            }
          }
        }
        if (stream === void 0) {
          const error = firstError ?? new Error("No error stored at end of fallback.");
          await runManager?.handleChainError(error);
          throw error;
        }
        let output;
        try {
          for await (const chunk of stream) {
            yield chunk;
            try {
              output = output === void 0 ? output : this._concatOutputChunks(output, chunk);
            } catch (e) {
              output = void 0;
            }
          }
        } catch (e) {
          await runManager?.handleChainError(e);
          throw e;
        }
        await runManager?.handleChainEnd(_coerceToDict2(output, "output"));
      }
      async batch(inputs, options, batchOptions) {
        if (batchOptions?.returnExceptions) {
          throw new Error("Not implemented.");
        }
        const configList = this._getOptionsList(options ?? {}, inputs.length);
        const callbackManagers = await Promise.all(configList.map((config) => getCallbackManagerForConfig(config)));
        const runManagers = await Promise.all(callbackManagers.map(async (callbackManager, i) => {
          const handleStartRes = await callbackManager?.handleChainStart(this.toJSON(), _coerceToDict2(inputs[i], "input"), configList[i].runId, void 0, void 0, void 0, configList[i].runName);
          delete configList[i].runId;
          return handleStartRes;
        }));
        let firstError;
        for (const runnable of this.runnables()) {
          configList[0].signal?.throwIfAborted();
          try {
            const outputs = await runnable.batch(inputs, runManagers.map((runManager, j) => patchConfig(configList[j], {
              callbacks: runManager?.getChild()
            })), batchOptions);
            await Promise.all(runManagers.map((runManager, i) => runManager?.handleChainEnd(_coerceToDict2(outputs[i], "output"))));
            return outputs;
          } catch (e) {
            if (firstError === void 0) {
              firstError = e;
            }
          }
        }
        if (!firstError) {
          throw new Error("No error stored at end of fallbacks.");
        }
        await Promise.all(runManagers.map((runManager) => runManager?.handleChainError(firstError)));
        throw firstError;
      }
    };
    RunnableAssign = class extends Runnable {
      static lc_name() {
        return "RunnableAssign";
      }
      constructor(fields) {
        if (fields instanceof RunnableMap) {
          fields = { mapper: fields };
        }
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ["langchain_core", "runnables"]
        });
        Object.defineProperty(this, "lc_serializable", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        Object.defineProperty(this, "mapper", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.mapper = fields.mapper;
      }
      async invoke(input, options) {
        const mapperResult = await this.mapper.invoke(input, options);
        return {
          ...input,
          ...mapperResult
        };
      }
      async *_transform(generator, runManager, options) {
        const mapperKeys = this.mapper.getStepsKeys();
        const [forPassthrough, forMapper] = atee(generator);
        const mapperOutput = this.mapper.transform(forMapper, patchConfig(options, { callbacks: runManager?.getChild() }));
        const firstMapperChunkPromise = mapperOutput.next();
        for await (const chunk of forPassthrough) {
          if (typeof chunk !== "object" || Array.isArray(chunk)) {
            throw new Error(`RunnableAssign can only be used with objects as input, got ${typeof chunk}`);
          }
          const filtered = Object.fromEntries(Object.entries(chunk).filter(([key]) => !mapperKeys.includes(key)));
          if (Object.keys(filtered).length > 0) {
            yield filtered;
          }
        }
        yield (await firstMapperChunkPromise).value;
        for await (const chunk of mapperOutput) {
          yield chunk;
        }
      }
      transform(generator, options) {
        return this._transformStreamWithConfig(generator, this._transform.bind(this), options);
      }
      async stream(input, options) {
        async function* generator() {
          yield input;
        }
        const config = ensureConfig(options);
        const wrappedGenerator = new AsyncGeneratorWithSetup({
          generator: this.transform(generator(), config),
          config
        });
        await wrappedGenerator.setup;
        return IterableReadableStream.fromAsyncGenerator(wrappedGenerator);
      }
    };
    RunnablePick = class extends Runnable {
      static lc_name() {
        return "RunnablePick";
      }
      constructor(fields) {
        if (typeof fields === "string" || Array.isArray(fields)) {
          fields = { keys: fields };
        }
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ["langchain_core", "runnables"]
        });
        Object.defineProperty(this, "lc_serializable", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        Object.defineProperty(this, "keys", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.keys = fields.keys;
      }
      async _pick(input) {
        if (typeof this.keys === "string") {
          return input[this.keys];
        } else {
          const picked = this.keys.map((key) => [key, input[key]]).filter((v) => v[1] !== void 0);
          return picked.length === 0 ? void 0 : Object.fromEntries(picked);
        }
      }
      async invoke(input, options) {
        return this._callWithConfig(this._pick.bind(this), input, options);
      }
      async *_transform(generator) {
        for await (const chunk of generator) {
          const picked = await this._pick(chunk);
          if (picked !== void 0) {
            yield picked;
          }
        }
      }
      transform(generator, options) {
        return this._transformStreamWithConfig(generator, this._transform.bind(this), options);
      }
      async stream(input, options) {
        async function* generator() {
          yield input;
        }
        const config = ensureConfig(options);
        const wrappedGenerator = new AsyncGeneratorWithSetup({
          generator: this.transform(generator(), config),
          config
        });
        await wrappedGenerator.setup;
        return IterableReadableStream.fromAsyncGenerator(wrappedGenerator);
      }
    };
    RunnableToolLike = class extends RunnableBinding {
      constructor(fields) {
        const sequence = RunnableSequence.from([
          RunnableLambda.from(async (input) => {
            let toolInput;
            if (_isToolCall(input)) {
              try {
                toolInput = await interopParseAsync(this.schema, input.args);
              } catch (e) {
                throw new ToolInputParsingException(`Received tool input did not match expected schema`, JSON.stringify(input.args));
              }
            } else {
              toolInput = input;
            }
            return toolInput;
          }).withConfig({ runName: `${fields.name}:parse_input` }),
          fields.bound
        ]).withConfig({ runName: fields.name });
        super({
          bound: sequence,
          config: fields.config ?? {}
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "description", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "schema", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.name = fields.name;
        this.description = fields.description;
        this.schema = fields.schema;
      }
      static lc_name() {
        return "RunnableToolLike";
      }
    };
  }
});

// node_modules/@langchain/core/dist/prompt_values.js
var BasePromptValue, StringPromptValue, ChatPromptValue, ImagePromptValue;
var init_prompt_values = __esm({
  "node_modules/@langchain/core/dist/prompt_values.js"() {
    init_serializable();
    init_human();
    init_utils2();
    BasePromptValue = class extends Serializable {
    };
    StringPromptValue = class extends BasePromptValue {
      static lc_name() {
        return "StringPromptValue";
      }
      constructor(value) {
        super({ value });
        Object.defineProperty(this, "lc_namespace", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ["langchain_core", "prompt_values"]
        });
        Object.defineProperty(this, "lc_serializable", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        Object.defineProperty(this, "value", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.value = value;
      }
      toString() {
        return this.value;
      }
      toChatMessages() {
        return [new HumanMessage(this.value)];
      }
    };
    ChatPromptValue = class extends BasePromptValue {
      static lc_name() {
        return "ChatPromptValue";
      }
      constructor(fields) {
        if (Array.isArray(fields)) {
          fields = { messages: fields };
        }
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ["langchain_core", "prompt_values"]
        });
        Object.defineProperty(this, "lc_serializable", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        Object.defineProperty(this, "messages", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.messages = fields.messages;
      }
      toString() {
        return getBufferString(this.messages);
      }
      toChatMessages() {
        return this.messages;
      }
    };
    ImagePromptValue = class extends BasePromptValue {
      static lc_name() {
        return "ImagePromptValue";
      }
      constructor(fields) {
        if (!("imageUrl" in fields)) {
          fields = { imageUrl: fields };
        }
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ["langchain_core", "prompt_values"]
        });
        Object.defineProperty(this, "lc_serializable", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        Object.defineProperty(this, "imageUrl", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "value", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.imageUrl = fields.imageUrl;
      }
      toString() {
        return this.imageUrl.url;
      }
      toChatMessages() {
        return [
          new HumanMessage({
            content: [
              {
                type: "image_url",
                image_url: {
                  detail: this.imageUrl.detail,
                  url: this.imageUrl.url
                }
              }
            ]
          })
        ];
      }
    };
  }
});

// node_modules/@langchain/core/dist/prompts/string.js
var BaseStringPromptTemplate;
var init_string2 = __esm({
  "node_modules/@langchain/core/dist/prompts/string.js"() {
    init_prompt_values();
    init_base5();
    BaseStringPromptTemplate = class extends BasePromptTemplate {
      /**
       * Formats the prompt given the input values and returns a formatted
       * prompt value.
       * @param values The input values to format the prompt.
       * @returns A Promise that resolves to a formatted prompt value.
       */
      async formatPromptValue(values) {
        const formattedPrompt = await this.format(values);
        return new StringPromptValue(formattedPrompt);
      }
    };
  }
});

// node_modules/mustache/mustache.mjs
function isFunction(object) {
  return typeof object === "function";
}
function typeStr(obj) {
  return isArray(obj) ? "array" : typeof obj;
}
function escapeRegExp(string) {
  return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
}
function hasProperty(obj, propName) {
  return obj != null && typeof obj === "object" && propName in obj;
}
function primitiveHasOwnProperty(primitive, propName) {
  return primitive != null && typeof primitive !== "object" && primitive.hasOwnProperty && primitive.hasOwnProperty(propName);
}
function testRegExp(re, string) {
  return regExpTest.call(re, string);
}
function isWhitespace(string) {
  return !testRegExp(nonSpaceRe, string);
}
function escapeHtml(string) {
  return String(string).replace(/[&<>"'`=\/]/g, function fromEntityMap(s) {
    return entityMap[s];
  });
}
function parseTemplate(template, tags) {
  if (!template)
    return [];
  var lineHasNonSpace = false;
  var sections = [];
  var tokens = [];
  var spaces = [];
  var hasTag = false;
  var nonSpace = false;
  var indentation = "";
  var tagIndex = 0;
  function stripSpace() {
    if (hasTag && !nonSpace) {
      while (spaces.length)
        delete tokens[spaces.pop()];
    } else {
      spaces = [];
    }
    hasTag = false;
    nonSpace = false;
  }
  var openingTagRe, closingTagRe, closingCurlyRe;
  function compileTags(tagsToCompile) {
    if (typeof tagsToCompile === "string")
      tagsToCompile = tagsToCompile.split(spaceRe, 2);
    if (!isArray(tagsToCompile) || tagsToCompile.length !== 2)
      throw new Error("Invalid tags: " + tagsToCompile);
    openingTagRe = new RegExp(escapeRegExp(tagsToCompile[0]) + "\\s*");
    closingTagRe = new RegExp("\\s*" + escapeRegExp(tagsToCompile[1]));
    closingCurlyRe = new RegExp("\\s*" + escapeRegExp("}" + tagsToCompile[1]));
  }
  compileTags(tags || mustache.tags);
  var scanner = new Scanner(template);
  var start, type, value, chr, token, openSection;
  while (!scanner.eos()) {
    start = scanner.pos;
    value = scanner.scanUntil(openingTagRe);
    if (value) {
      for (var i = 0, valueLength = value.length; i < valueLength; ++i) {
        chr = value.charAt(i);
        if (isWhitespace(chr)) {
          spaces.push(tokens.length);
          indentation += chr;
        } else {
          nonSpace = true;
          lineHasNonSpace = true;
          indentation += " ";
        }
        tokens.push(["text", chr, start, start + 1]);
        start += 1;
        if (chr === "\n") {
          stripSpace();
          indentation = "";
          tagIndex = 0;
          lineHasNonSpace = false;
        }
      }
    }
    if (!scanner.scan(openingTagRe))
      break;
    hasTag = true;
    type = scanner.scan(tagRe) || "name";
    scanner.scan(whiteRe);
    if (type === "=") {
      value = scanner.scanUntil(equalsRe);
      scanner.scan(equalsRe);
      scanner.scanUntil(closingTagRe);
    } else if (type === "{") {
      value = scanner.scanUntil(closingCurlyRe);
      scanner.scan(curlyRe);
      scanner.scanUntil(closingTagRe);
      type = "&";
    } else {
      value = scanner.scanUntil(closingTagRe);
    }
    if (!scanner.scan(closingTagRe))
      throw new Error("Unclosed tag at " + scanner.pos);
    if (type == ">") {
      token = [type, value, start, scanner.pos, indentation, tagIndex, lineHasNonSpace];
    } else {
      token = [type, value, start, scanner.pos];
    }
    tagIndex++;
    tokens.push(token);
    if (type === "#" || type === "^") {
      sections.push(token);
    } else if (type === "/") {
      openSection = sections.pop();
      if (!openSection)
        throw new Error('Unopened section "' + value + '" at ' + start);
      if (openSection[1] !== value)
        throw new Error('Unclosed section "' + openSection[1] + '" at ' + start);
    } else if (type === "name" || type === "{" || type === "&") {
      nonSpace = true;
    } else if (type === "=") {
      compileTags(value);
    }
  }
  stripSpace();
  openSection = sections.pop();
  if (openSection)
    throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos);
  return nestTokens(squashTokens(tokens));
}
function squashTokens(tokens) {
  var squashedTokens = [];
  var token, lastToken;
  for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
    token = tokens[i];
    if (token) {
      if (token[0] === "text" && lastToken && lastToken[0] === "text") {
        lastToken[1] += token[1];
        lastToken[3] = token[3];
      } else {
        squashedTokens.push(token);
        lastToken = token;
      }
    }
  }
  return squashedTokens;
}
function nestTokens(tokens) {
  var nestedTokens = [];
  var collector = nestedTokens;
  var sections = [];
  var token, section;
  for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
    token = tokens[i];
    switch (token[0]) {
      case "#":
      case "^":
        collector.push(token);
        sections.push(token);
        collector = token[4] = [];
        break;
      case "/":
        section = sections.pop();
        section[5] = token[2];
        collector = sections.length > 0 ? sections[sections.length - 1][4] : nestedTokens;
        break;
      default:
        collector.push(token);
    }
  }
  return nestedTokens;
}
function Scanner(string) {
  this.string = string;
  this.tail = string;
  this.pos = 0;
}
function Context(view, parentContext) {
  this.view = view;
  this.cache = { ".": this.view };
  this.parent = parentContext;
}
function Writer() {
  this.templateCache = {
    _cache: {},
    set: function set(key, value) {
      this._cache[key] = value;
    },
    get: function get(key) {
      return this._cache[key];
    },
    clear: function clear() {
      this._cache = {};
    }
  };
}
var objectToString2, isArray, regExpTest, nonSpaceRe, entityMap, whiteRe, spaceRe, equalsRe, curlyRe, tagRe, mustache, defaultWriter, mustache_default;
var init_mustache = __esm({
  "node_modules/mustache/mustache.mjs"() {
    objectToString2 = Object.prototype.toString;
    isArray = Array.isArray || function isArrayPolyfill(object) {
      return objectToString2.call(object) === "[object Array]";
    };
    regExpTest = RegExp.prototype.test;
    nonSpaceRe = /\S/;
    entityMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
      "/": "&#x2F;",
      "`": "&#x60;",
      "=": "&#x3D;"
    };
    whiteRe = /\s*/;
    spaceRe = /\s+/;
    equalsRe = /\s*=/;
    curlyRe = /\s*\}/;
    tagRe = /#|\^|\/|>|\{|&|=|!/;
    Scanner.prototype.eos = function eos() {
      return this.tail === "";
    };
    Scanner.prototype.scan = function scan(re) {
      var match = this.tail.match(re);
      if (!match || match.index !== 0)
        return "";
      var string = match[0];
      this.tail = this.tail.substring(string.length);
      this.pos += string.length;
      return string;
    };
    Scanner.prototype.scanUntil = function scanUntil(re) {
      var index = this.tail.search(re), match;
      switch (index) {
        case -1:
          match = this.tail;
          this.tail = "";
          break;
        case 0:
          match = "";
          break;
        default:
          match = this.tail.substring(0, index);
          this.tail = this.tail.substring(index);
      }
      this.pos += match.length;
      return match;
    };
    Context.prototype.push = function push(view) {
      return new Context(view, this);
    };
    Context.prototype.lookup = function lookup(name) {
      var cache = this.cache;
      var value;
      if (cache.hasOwnProperty(name)) {
        value = cache[name];
      } else {
        var context = this, intermediateValue, names, index, lookupHit = false;
        while (context) {
          if (name.indexOf(".") > 0) {
            intermediateValue = context.view;
            names = name.split(".");
            index = 0;
            while (intermediateValue != null && index < names.length) {
              if (index === names.length - 1)
                lookupHit = hasProperty(intermediateValue, names[index]) || primitiveHasOwnProperty(intermediateValue, names[index]);
              intermediateValue = intermediateValue[names[index++]];
            }
          } else {
            intermediateValue = context.view[name];
            lookupHit = hasProperty(context.view, name);
          }
          if (lookupHit) {
            value = intermediateValue;
            break;
          }
          context = context.parent;
        }
        cache[name] = value;
      }
      if (isFunction(value))
        value = value.call(this.view);
      return value;
    };
    Writer.prototype.clearCache = function clearCache() {
      if (typeof this.templateCache !== "undefined") {
        this.templateCache.clear();
      }
    };
    Writer.prototype.parse = function parse3(template, tags) {
      var cache = this.templateCache;
      var cacheKey = template + ":" + (tags || mustache.tags).join(":");
      var isCacheEnabled = typeof cache !== "undefined";
      var tokens = isCacheEnabled ? cache.get(cacheKey) : void 0;
      if (tokens == void 0) {
        tokens = parseTemplate(template, tags);
        isCacheEnabled && cache.set(cacheKey, tokens);
      }
      return tokens;
    };
    Writer.prototype.render = function render(template, view, partials, config) {
      var tags = this.getConfigTags(config);
      var tokens = this.parse(template, tags);
      var context = view instanceof Context ? view : new Context(view, void 0);
      return this.renderTokens(tokens, context, partials, template, config);
    };
    Writer.prototype.renderTokens = function renderTokens(tokens, context, partials, originalTemplate, config) {
      var buffer = "";
      var token, symbol, value;
      for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
        value = void 0;
        token = tokens[i];
        symbol = token[0];
        if (symbol === "#") value = this.renderSection(token, context, partials, originalTemplate, config);
        else if (symbol === "^") value = this.renderInverted(token, context, partials, originalTemplate, config);
        else if (symbol === ">") value = this.renderPartial(token, context, partials, config);
        else if (symbol === "&") value = this.unescapedValue(token, context);
        else if (symbol === "name") value = this.escapedValue(token, context, config);
        else if (symbol === "text") value = this.rawValue(token);
        if (value !== void 0)
          buffer += value;
      }
      return buffer;
    };
    Writer.prototype.renderSection = function renderSection(token, context, partials, originalTemplate, config) {
      var self2 = this;
      var buffer = "";
      var value = context.lookup(token[1]);
      function subRender(template) {
        return self2.render(template, context, partials, config);
      }
      if (!value) return;
      if (isArray(value)) {
        for (var j = 0, valueLength = value.length; j < valueLength; ++j) {
          buffer += this.renderTokens(token[4], context.push(value[j]), partials, originalTemplate, config);
        }
      } else if (typeof value === "object" || typeof value === "string" || typeof value === "number") {
        buffer += this.renderTokens(token[4], context.push(value), partials, originalTemplate, config);
      } else if (isFunction(value)) {
        if (typeof originalTemplate !== "string")
          throw new Error("Cannot use higher-order sections without the original template");
        value = value.call(context.view, originalTemplate.slice(token[3], token[5]), subRender);
        if (value != null)
          buffer += value;
      } else {
        buffer += this.renderTokens(token[4], context, partials, originalTemplate, config);
      }
      return buffer;
    };
    Writer.prototype.renderInverted = function renderInverted(token, context, partials, originalTemplate, config) {
      var value = context.lookup(token[1]);
      if (!value || isArray(value) && value.length === 0)
        return this.renderTokens(token[4], context, partials, originalTemplate, config);
    };
    Writer.prototype.indentPartial = function indentPartial(partial, indentation, lineHasNonSpace) {
      var filteredIndentation = indentation.replace(/[^ \t]/g, "");
      var partialByNl = partial.split("\n");
      for (var i = 0; i < partialByNl.length; i++) {
        if (partialByNl[i].length && (i > 0 || !lineHasNonSpace)) {
          partialByNl[i] = filteredIndentation + partialByNl[i];
        }
      }
      return partialByNl.join("\n");
    };
    Writer.prototype.renderPartial = function renderPartial(token, context, partials, config) {
      if (!partials) return;
      var tags = this.getConfigTags(config);
      var value = isFunction(partials) ? partials(token[1]) : partials[token[1]];
      if (value != null) {
        var lineHasNonSpace = token[6];
        var tagIndex = token[5];
        var indentation = token[4];
        var indentedValue = value;
        if (tagIndex == 0 && indentation) {
          indentedValue = this.indentPartial(value, indentation, lineHasNonSpace);
        }
        var tokens = this.parse(indentedValue, tags);
        return this.renderTokens(tokens, context, partials, indentedValue, config);
      }
    };
    Writer.prototype.unescapedValue = function unescapedValue(token, context) {
      var value = context.lookup(token[1]);
      if (value != null)
        return value;
    };
    Writer.prototype.escapedValue = function escapedValue(token, context, config) {
      var escape = this.getConfigEscape(config) || mustache.escape;
      var value = context.lookup(token[1]);
      if (value != null)
        return typeof value === "number" && escape === mustache.escape ? String(value) : escape(value);
    };
    Writer.prototype.rawValue = function rawValue(token) {
      return token[1];
    };
    Writer.prototype.getConfigTags = function getConfigTags(config) {
      if (isArray(config)) {
        return config;
      } else if (config && typeof config === "object") {
        return config.tags;
      } else {
        return void 0;
      }
    };
    Writer.prototype.getConfigEscape = function getConfigEscape(config) {
      if (config && typeof config === "object" && !isArray(config)) {
        return config.escape;
      } else {
        return void 0;
      }
    };
    mustache = {
      name: "mustache.js",
      version: "4.2.0",
      tags: ["{{", "}}"],
      clearCache: void 0,
      escape: void 0,
      parse: void 0,
      render: void 0,
      Scanner: void 0,
      Context: void 0,
      Writer: void 0,
      /**
       * Allows a user to override the default caching strategy, by providing an
       * object with set, get and clear methods. This can also be used to disable
       * the cache by setting it to the literal `undefined`.
       */
      set templateCache(cache) {
        defaultWriter.templateCache = cache;
      },
      /**
       * Gets the default or overridden caching object from the default writer.
       */
      get templateCache() {
        return defaultWriter.templateCache;
      }
    };
    defaultWriter = new Writer();
    mustache.clearCache = function clearCache2() {
      return defaultWriter.clearCache();
    };
    mustache.parse = function parse4(template, tags) {
      return defaultWriter.parse(template, tags);
    };
    mustache.render = function render2(template, view, partials, config) {
      if (typeof template !== "string") {
        throw new TypeError('Invalid template! Template should be a "string" but "' + typeStr(template) + '" was given as the first argument for mustache#render(template, view, partials)');
      }
      return defaultWriter.render(template, view, partials, config);
    };
    mustache.escape = escapeHtml;
    mustache.Scanner = Scanner;
    mustache.Context = Context;
    mustache.Writer = Writer;
    mustache_default = mustache;
  }
});

// node_modules/@langchain/core/dist/prompts/template.js
function configureMustache() {
  mustache_default.escape = (text) => text;
}
var parseFString, mustacheTemplateToNodes, parseMustache, interpolateFString, interpolateMustache, DEFAULT_FORMATTER_MAPPING, DEFAULT_PARSER_MAPPING, renderTemplate, parseTemplate2, checkValidTemplate;
var init_template = __esm({
  "node_modules/@langchain/core/dist/prompts/template.js"() {
    init_mustache();
    init_errors();
    parseFString = (template) => {
      const chars = template.split("");
      const nodes = [];
      const nextBracket = (bracket, start) => {
        for (let i2 = start; i2 < chars.length; i2 += 1) {
          if (bracket.includes(chars[i2])) {
            return i2;
          }
        }
        return -1;
      };
      let i = 0;
      while (i < chars.length) {
        if (chars[i] === "{" && i + 1 < chars.length && chars[i + 1] === "{") {
          nodes.push({ type: "literal", text: "{" });
          i += 2;
        } else if (chars[i] === "}" && i + 1 < chars.length && chars[i + 1] === "}") {
          nodes.push({ type: "literal", text: "}" });
          i += 2;
        } else if (chars[i] === "{") {
          const j = nextBracket("}", i);
          if (j < 0) {
            throw new Error("Unclosed '{' in template.");
          }
          nodes.push({
            type: "variable",
            name: chars.slice(i + 1, j).join("")
          });
          i = j + 1;
        } else if (chars[i] === "}") {
          throw new Error("Single '}' in template.");
        } else {
          const next = nextBracket("{}", i);
          const text = (next < 0 ? chars.slice(i) : chars.slice(i, next)).join("");
          nodes.push({ type: "literal", text });
          i = next < 0 ? chars.length : next;
        }
      }
      return nodes;
    };
    mustacheTemplateToNodes = (template, context = []) => {
      const nodes = [];
      for (const temp of template) {
        if (temp[0] === "name") {
          const name = temp[1].includes(".") ? temp[1].split(".")[0] : temp[1];
          nodes.push({ type: "variable", name });
        } else if (["#", "&", "^", ">"].includes(temp[0])) {
          nodes.push({ type: "variable", name: temp[1] });
          if (temp[0] === "#" && temp.length > 4 && Array.isArray(temp[4])) {
            const newContext = [...context, temp[1]];
            const nestedNodes = mustacheTemplateToNodes(temp[4], newContext);
            nodes.push(...nestedNodes);
          }
        } else {
          nodes.push({ type: "literal", text: temp[1] });
        }
      }
      return nodes;
    };
    parseMustache = (template) => {
      configureMustache();
      const parsed = mustache_default.parse(template);
      return mustacheTemplateToNodes(parsed);
    };
    interpolateFString = (template, values) => {
      return parseFString(template).reduce((res, node) => {
        if (node.type === "variable") {
          if (node.name in values) {
            const stringValue = typeof values[node.name] === "string" ? values[node.name] : JSON.stringify(values[node.name]);
            return res + stringValue;
          }
          throw new Error(`(f-string) Missing value for input ${node.name}`);
        }
        return res + node.text;
      }, "");
    };
    interpolateMustache = (template, values) => {
      configureMustache();
      return mustache_default.render(template, values);
    };
    DEFAULT_FORMATTER_MAPPING = {
      "f-string": interpolateFString,
      mustache: interpolateMustache
    };
    DEFAULT_PARSER_MAPPING = {
      "f-string": parseFString,
      mustache: parseMustache
    };
    renderTemplate = (template, templateFormat, inputValues) => {
      try {
        return DEFAULT_FORMATTER_MAPPING[templateFormat](template, inputValues);
      } catch (e) {
        const error = addLangChainErrorFields(e, "INVALID_PROMPT_INPUT");
        throw error;
      }
    };
    parseTemplate2 = (template, templateFormat) => DEFAULT_PARSER_MAPPING[templateFormat](template);
    checkValidTemplate = (template, templateFormat, inputVariables) => {
      if (!(templateFormat in DEFAULT_FORMATTER_MAPPING)) {
        const validFormats = Object.keys(DEFAULT_FORMATTER_MAPPING);
        throw new Error(`Invalid template format. Got \`${templateFormat}\`;
                         should be one of ${validFormats}`);
      }
      try {
        const dummyInputs = inputVariables.reduce((acc, v) => {
          acc[v] = "foo";
          return acc;
        }, {});
        if (Array.isArray(template)) {
          template.forEach((message) => {
            if (message.type === "text") {
              renderTemplate(message.text, templateFormat, dummyInputs);
            } else if (message.type === "image_url") {
              if (typeof message.image_url === "string") {
                renderTemplate(message.image_url, templateFormat, dummyInputs);
              } else {
                const imageUrl = message.image_url.url;
                renderTemplate(imageUrl, templateFormat, dummyInputs);
              }
            } else {
              throw new Error(`Invalid message template received. ${JSON.stringify(message, null, 2)}`);
            }
          });
        } else {
          renderTemplate(template, templateFormat, dummyInputs);
        }
      } catch (e) {
        throw new Error(`Invalid prompt schema: ${e.message}`);
      }
    };
  }
});

// node_modules/@langchain/core/dist/prompts/prompt.js
var prompt_exports = {};
__export(prompt_exports, {
  PromptTemplate: () => PromptTemplate
});
var PromptTemplate;
var init_prompt = __esm({
  "node_modules/@langchain/core/dist/prompts/prompt.js"() {
    init_string2();
    init_template();
    PromptTemplate = class _PromptTemplate extends BaseStringPromptTemplate {
      static lc_name() {
        return "PromptTemplate";
      }
      constructor(input) {
        super(input);
        Object.defineProperty(this, "template", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "templateFormat", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "f-string"
        });
        Object.defineProperty(this, "validateTemplate", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        Object.defineProperty(this, "additionalContentFields", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        if (input.templateFormat === "mustache" && input.validateTemplate === void 0) {
          this.validateTemplate = false;
        }
        Object.assign(this, input);
        if (this.validateTemplate) {
          if (this.templateFormat === "mustache") {
            throw new Error("Mustache templates cannot be validated.");
          }
          let totalInputVariables = this.inputVariables;
          if (this.partialVariables) {
            totalInputVariables = totalInputVariables.concat(Object.keys(this.partialVariables));
          }
          checkValidTemplate(this.template, this.templateFormat, totalInputVariables);
        }
      }
      _getPromptType() {
        return "prompt";
      }
      /**
       * Formats the prompt template with the provided values.
       * @param values The values to be used to format the prompt template.
       * @returns A promise that resolves to a string which is the formatted prompt.
       */
      async format(values) {
        const allValues = await this.mergePartialAndUserVariables(values);
        return renderTemplate(this.template, this.templateFormat, allValues);
      }
      /**
       * Take examples in list format with prefix and suffix to create a prompt.
       *
       * Intended to be used a a way to dynamically create a prompt from examples.
       *
       * @param examples - List of examples to use in the prompt.
       * @param suffix - String to go after the list of examples. Should generally set up the user's input.
       * @param inputVariables - A list of variable names the final prompt template will expect
       * @param exampleSeparator - The separator to use in between examples
       * @param prefix - String that should go before any examples. Generally includes examples.
       *
       * @returns The final prompt template generated.
       */
      static fromExamples(examples, suffix, inputVariables, exampleSeparator = "\n\n", prefix = "") {
        const template = [prefix, ...examples, suffix].join(exampleSeparator);
        return new _PromptTemplate({
          inputVariables,
          template
        });
      }
      static fromTemplate(template, options) {
        const { templateFormat = "f-string", ...rest } = options ?? {};
        const names = /* @__PURE__ */ new Set();
        parseTemplate2(template, templateFormat).forEach((node) => {
          if (node.type === "variable") {
            names.add(node.name);
          }
        });
        return new _PromptTemplate({
          // Rely on extracted types
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          inputVariables: [...names],
          templateFormat,
          template,
          ...rest
        });
      }
      /**
       * Partially applies values to the prompt template.
       * @param values The values to be partially applied to the prompt template.
       * @returns A new instance of PromptTemplate with the partially applied values.
       */
      async partial(values) {
        const newInputVariables = this.inputVariables.filter((iv) => !(iv in values));
        const newPartialVariables = {
          ...this.partialVariables ?? {},
          ...values
        };
        const promptDict = {
          ...this,
          inputVariables: newInputVariables,
          partialVariables: newPartialVariables
        };
        return new _PromptTemplate(promptDict);
      }
      serialize() {
        if (this.outputParser !== void 0) {
          throw new Error("Cannot serialize a prompt template with an output parser");
        }
        return {
          _type: this._getPromptType(),
          input_variables: this.inputVariables,
          template: this.template,
          template_format: this.templateFormat
        };
      }
      static async deserialize(data) {
        if (!data.template) {
          throw new Error("Prompt template must have a template");
        }
        const res = new _PromptTemplate({
          inputVariables: data.input_variables,
          template: data.template,
          templateFormat: data.template_format
        });
        return res;
      }
    };
  }
});

// node_modules/@langchain/core/dist/messages/transformers.js
var init_transformers = __esm({
  "node_modules/@langchain/core/dist/messages/transformers.js"() {
    init_base4();
    init_ai();
    init_base3();
    init_chat();
    init_function();
    init_human();
    init_modifier();
    init_system();
    init_tool();
    init_utils2();
  }
});

// node_modules/@langchain/core/dist/messages/index.js
var init_messages2 = __esm({
  "node_modules/@langchain/core/dist/messages/index.js"() {
    init_ai();
    init_base3();
    init_chat();
    init_function();
    init_human();
    init_system();
    init_utils2();
    init_transformers();
    init_modifier();
    init_content_blocks();
    init_tool();
  }
});

// node_modules/@langchain/core/dist/prompts/image.js
var ImagePromptTemplate;
var init_image = __esm({
  "node_modules/@langchain/core/dist/prompts/image.js"() {
    init_prompt_values();
    init_base5();
    init_template();
    ImagePromptTemplate = class _ImagePromptTemplate extends BasePromptTemplate {
      static lc_name() {
        return "ImagePromptTemplate";
      }
      constructor(input) {
        super(input);
        Object.defineProperty(this, "lc_namespace", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ["langchain_core", "prompts", "image"]
        });
        Object.defineProperty(this, "template", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "templateFormat", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "f-string"
        });
        Object.defineProperty(this, "validateTemplate", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        Object.defineProperty(this, "additionalContentFields", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.template = input.template;
        this.templateFormat = input.templateFormat ?? this.templateFormat;
        this.validateTemplate = input.validateTemplate ?? this.validateTemplate;
        this.additionalContentFields = input.additionalContentFields;
        if (this.validateTemplate) {
          let totalInputVariables = this.inputVariables;
          if (this.partialVariables) {
            totalInputVariables = totalInputVariables.concat(Object.keys(this.partialVariables));
          }
          checkValidTemplate([
            { type: "image_url", image_url: this.template }
          ], this.templateFormat, totalInputVariables);
        }
      }
      _getPromptType() {
        return "prompt";
      }
      /**
       * Partially applies values to the prompt template.
       * @param values The values to be partially applied to the prompt template.
       * @returns A new instance of ImagePromptTemplate with the partially applied values.
       */
      async partial(values) {
        const newInputVariables = this.inputVariables.filter((iv) => !(iv in values));
        const newPartialVariables = {
          ...this.partialVariables ?? {},
          ...values
        };
        const promptDict = {
          ...this,
          inputVariables: newInputVariables,
          partialVariables: newPartialVariables
        };
        return new _ImagePromptTemplate(promptDict);
      }
      /**
       * Formats the prompt template with the provided values.
       * @param values The values to be used to format the prompt template.
       * @returns A promise that resolves to a string which is the formatted prompt.
       */
      async format(values) {
        const formatted = {};
        for (const [key, value] of Object.entries(this.template)) {
          if (typeof value === "string") {
            formatted[key] = renderTemplate(value, this.templateFormat, values);
          } else {
            formatted[key] = value;
          }
        }
        const url = values.url || formatted.url;
        const detail = values.detail || formatted.detail;
        if (!url) {
          throw new Error("Must provide either an image URL.");
        }
        if (typeof url !== "string") {
          throw new Error("url must be a string.");
        }
        const output = { url };
        if (detail) {
          output.detail = detail;
        }
        return output;
      }
      /**
       * Formats the prompt given the input values and returns a formatted
       * prompt value.
       * @param values The input values to format the prompt.
       * @returns A Promise that resolves to a formatted prompt value.
       */
      async formatPromptValue(values) {
        const formattedPrompt = await this.format(values);
        return new ImagePromptValue(formattedPrompt);
      }
    };
  }
});

// node_modules/@langchain/core/dist/prompts/dict.js
function _getInputVariables(template, templateFormat) {
  const inputVariables = [];
  for (const v of Object.values(template)) {
    if (typeof v === "string") {
      parseTemplate2(v, templateFormat).forEach((t) => {
        if (t.type === "variable") {
          inputVariables.push(t.name);
        }
      });
    } else if (Array.isArray(v)) {
      for (const x of v) {
        if (typeof x === "string") {
          parseTemplate2(x, templateFormat).forEach((t) => {
            if (t.type === "variable") {
              inputVariables.push(t.name);
            }
          });
        } else if (typeof x === "object") {
          inputVariables.push(..._getInputVariables(x, templateFormat));
        }
      }
    } else if (typeof v === "object" && v !== null) {
      inputVariables.push(..._getInputVariables(v, templateFormat));
    }
  }
  return Array.from(new Set(inputVariables));
}
function _insertInputVariables(template, inputs, templateFormat) {
  const formatted = {};
  for (const [k, v] of Object.entries(template)) {
    if (typeof v === "string") {
      formatted[k] = renderTemplate(v, templateFormat, inputs);
    } else if (Array.isArray(v)) {
      const formattedV = [];
      for (const x of v) {
        if (typeof x === "string") {
          formattedV.push(renderTemplate(x, templateFormat, inputs));
        } else if (typeof x === "object") {
          formattedV.push(_insertInputVariables(x, inputs, templateFormat));
        }
      }
      formatted[k] = formattedV;
    } else if (typeof v === "object" && v !== null) {
      formatted[k] = _insertInputVariables(v, inputs, templateFormat);
    } else {
      formatted[k] = v;
    }
  }
  return formatted;
}
var DictPromptTemplate;
var init_dict = __esm({
  "node_modules/@langchain/core/dist/prompts/dict.js"() {
    init_base4();
    init_template();
    DictPromptTemplate = class extends Runnable {
      static lc_name() {
        return "DictPromptTemplate";
      }
      constructor(fields) {
        const templateFormat = fields.templateFormat ?? "f-string";
        const inputVariables = _getInputVariables(fields.template, templateFormat);
        super({ inputVariables, ...fields });
        Object.defineProperty(this, "lc_namespace", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ["langchain_core", "prompts", "dict"]
        });
        Object.defineProperty(this, "lc_serializable", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        Object.defineProperty(this, "template", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "templateFormat", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "inputVariables", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.template = fields.template;
        this.templateFormat = templateFormat;
        this.inputVariables = inputVariables;
      }
      async format(values) {
        return _insertInputVariables(this.template, values, this.templateFormat);
      }
      async invoke(values) {
        return await this._callWithConfig(this.format.bind(this), values, {
          runType: "prompt"
        });
      }
    };
  }
});

// node_modules/@langchain/core/dist/prompts/chat.js
function isTextTemplateParam(param) {
  if (param === null || typeof param !== "object" || Array.isArray(param)) {
    return false;
  }
  return Object.keys(param).length === 1 && "text" in param && typeof param.text === "string";
}
function isImageTemplateParam(param) {
  if (param === null || typeof param !== "object" || Array.isArray(param)) {
    return false;
  }
  return "image_url" in param && (typeof param.image_url === "string" || typeof param.image_url === "object" && param.image_url !== null && "url" in param.image_url && typeof param.image_url.url === "string");
}
function _isBaseMessagePromptTemplate(baseMessagePromptTemplateLike) {
  return typeof baseMessagePromptTemplateLike.formatMessages === "function";
}
function _coerceMessagePromptTemplateLike(messagePromptTemplateLike, extra) {
  if (_isBaseMessagePromptTemplate(messagePromptTemplateLike) || isBaseMessage(messagePromptTemplateLike)) {
    return messagePromptTemplateLike;
  }
  if (Array.isArray(messagePromptTemplateLike) && messagePromptTemplateLike[0] === "placeholder") {
    const messageContent = messagePromptTemplateLike[1];
    if (extra?.templateFormat === "mustache" && typeof messageContent === "string" && messageContent.slice(0, 2) === "{{" && messageContent.slice(-2) === "}}") {
      const variableName = messageContent.slice(2, -2);
      return new MessagesPlaceholder({ variableName, optional: true });
    } else if (typeof messageContent === "string" && messageContent[0] === "{" && messageContent[messageContent.length - 1] === "}") {
      const variableName = messageContent.slice(1, -1);
      return new MessagesPlaceholder({ variableName, optional: true });
    }
    throw new Error(`Invalid placeholder template for format ${extra?.templateFormat ?? `"f-string"`}: "${messagePromptTemplateLike[1]}". Expected a variable name surrounded by ${extra?.templateFormat === "mustache" ? "double" : "single"} curly braces.`);
  }
  const message = coerceMessageLikeToMessage(messagePromptTemplateLike);
  let templateData;
  if (typeof message.content === "string") {
    templateData = message.content;
  } else {
    templateData = message.content.map((item) => {
      if ("text" in item) {
        return { ...item, text: item.text };
      } else if ("image_url" in item) {
        return { ...item, image_url: item.image_url };
      } else {
        return item;
      }
    });
  }
  if (message._getType() === "human") {
    return HumanMessagePromptTemplate.fromTemplate(templateData, extra);
  } else if (message._getType() === "ai") {
    return AIMessagePromptTemplate.fromTemplate(templateData, extra);
  } else if (message._getType() === "system") {
    return SystemMessagePromptTemplate.fromTemplate(templateData, extra);
  } else if (ChatMessage.isInstance(message)) {
    return ChatMessagePromptTemplate.fromTemplate(message.content, message.role, extra);
  } else {
    throw new Error(`Could not coerce message prompt template from input. Received message type: "${message._getType()}".`);
  }
}
function isMessagesPlaceholder(x) {
  return x.constructor.lc_name() === "MessagesPlaceholder";
}
var BaseMessagePromptTemplate, MessagesPlaceholder, BaseMessageStringPromptTemplate, BaseChatPromptTemplate, ChatMessagePromptTemplate, _StringImageMessagePromptTemplate, HumanMessagePromptTemplate, AIMessagePromptTemplate, SystemMessagePromptTemplate, ChatPromptTemplate;
var init_chat2 = __esm({
  "node_modules/@langchain/core/dist/prompts/chat.js"() {
    init_messages2();
    init_prompt_values();
    init_base4();
    init_string2();
    init_base5();
    init_prompt();
    init_image();
    init_template();
    init_errors();
    init_dict();
    BaseMessagePromptTemplate = class extends Runnable {
      constructor() {
        super(...arguments);
        Object.defineProperty(this, "lc_namespace", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ["langchain_core", "prompts", "chat"]
        });
        Object.defineProperty(this, "lc_serializable", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
      }
      /**
       * Calls the formatMessages method with the provided input and options.
       * @param input Input for the formatMessages method
       * @param options Optional BaseCallbackConfig
       * @returns Formatted output messages
       */
      async invoke(input, options) {
        return this._callWithConfig((input2) => this.formatMessages(input2), input, { ...options, runType: "prompt" });
      }
    };
    MessagesPlaceholder = class extends BaseMessagePromptTemplate {
      static lc_name() {
        return "MessagesPlaceholder";
      }
      constructor(fields) {
        if (typeof fields === "string") {
          fields = { variableName: fields };
        }
        super(fields);
        Object.defineProperty(this, "variableName", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "optional", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.variableName = fields.variableName;
        this.optional = fields.optional ?? false;
      }
      get inputVariables() {
        return [this.variableName];
      }
      async formatMessages(values) {
        const input = values[this.variableName];
        if (this.optional && !input) {
          return [];
        } else if (!input) {
          const error = new Error(`Field "${this.variableName}" in prompt uses a MessagesPlaceholder, which expects an array of BaseMessages as an input value. Received: undefined`);
          error.name = "InputFormatError";
          throw error;
        }
        let formattedMessages;
        try {
          if (Array.isArray(input)) {
            formattedMessages = input.map(coerceMessageLikeToMessage);
          } else {
            formattedMessages = [coerceMessageLikeToMessage(input)];
          }
        } catch (e) {
          const readableInput = typeof input === "string" ? input : JSON.stringify(input, null, 2);
          const error = new Error([
            `Field "${this.variableName}" in prompt uses a MessagesPlaceholder, which expects an array of BaseMessages or coerceable values as input.`,
            `Received value: ${readableInput}`,
            `Additional message: ${e.message}`
          ].join("\n\n"));
          error.name = "InputFormatError";
          error.lc_error_code = e.lc_error_code;
          throw error;
        }
        return formattedMessages;
      }
    };
    BaseMessageStringPromptTemplate = class extends BaseMessagePromptTemplate {
      constructor(fields) {
        if (!("prompt" in fields)) {
          fields = { prompt: fields };
        }
        super(fields);
        Object.defineProperty(this, "prompt", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.prompt = fields.prompt;
      }
      get inputVariables() {
        return this.prompt.inputVariables;
      }
      async formatMessages(values) {
        return [await this.format(values)];
      }
    };
    BaseChatPromptTemplate = class extends BasePromptTemplate {
      constructor(input) {
        super(input);
      }
      async format(values) {
        return (await this.formatPromptValue(values)).toString();
      }
      async formatPromptValue(values) {
        const resultMessages = await this.formatMessages(values);
        return new ChatPromptValue(resultMessages);
      }
    };
    ChatMessagePromptTemplate = class extends BaseMessageStringPromptTemplate {
      static lc_name() {
        return "ChatMessagePromptTemplate";
      }
      constructor(fields, role) {
        if (!("prompt" in fields)) {
          fields = { prompt: fields, role };
        }
        super(fields);
        Object.defineProperty(this, "role", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.role = fields.role;
      }
      async format(values) {
        return new ChatMessage(await this.prompt.format(values), this.role);
      }
      static fromTemplate(template, role, options) {
        return new this(PromptTemplate.fromTemplate(template, {
          templateFormat: options?.templateFormat
        }), role);
      }
    };
    _StringImageMessagePromptTemplate = class extends BaseMessagePromptTemplate {
      static _messageClass() {
        throw new Error("Can not invoke _messageClass from inside _StringImageMessagePromptTemplate");
      }
      constructor(fields, additionalOptions) {
        if (!("prompt" in fields)) {
          fields = { prompt: fields };
        }
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ["langchain_core", "prompts", "chat"]
        });
        Object.defineProperty(this, "lc_serializable", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        Object.defineProperty(this, "inputVariables", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: []
        });
        Object.defineProperty(this, "additionalOptions", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: {}
        });
        Object.defineProperty(this, "prompt", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "messageClass", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "chatMessageClass", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.prompt = fields.prompt;
        if (Array.isArray(this.prompt)) {
          let inputVariables = [];
          this.prompt.forEach((prompt) => {
            if ("inputVariables" in prompt) {
              inputVariables = inputVariables.concat(prompt.inputVariables);
            }
          });
          this.inputVariables = inputVariables;
        } else {
          this.inputVariables = this.prompt.inputVariables;
        }
        this.additionalOptions = additionalOptions ?? this.additionalOptions;
      }
      createMessage(content) {
        const constructor = this.constructor;
        if (constructor._messageClass()) {
          const MsgClass = constructor._messageClass();
          return new MsgClass({ content });
        } else if (constructor.chatMessageClass) {
          const MsgClass = constructor.chatMessageClass();
          return new MsgClass({
            content,
            role: this.getRoleFromMessageClass(MsgClass.lc_name())
          });
        } else {
          throw new Error("No message class defined");
        }
      }
      getRoleFromMessageClass(name) {
        switch (name) {
          case "HumanMessage":
            return "human";
          case "AIMessage":
            return "ai";
          case "SystemMessage":
            return "system";
          case "ChatMessage":
            return "chat";
          default:
            throw new Error("Invalid message class name");
        }
      }
      static fromTemplate(template, additionalOptions) {
        if (typeof template === "string") {
          return new this(PromptTemplate.fromTemplate(template, additionalOptions));
        }
        const prompt = [];
        for (const item of template) {
          if (typeof item === "string") {
            prompt.push(PromptTemplate.fromTemplate(item, additionalOptions));
          } else if (item === null) {
          } else if (isTextTemplateParam(item)) {
            let text = "";
            if (typeof item.text === "string") {
              text = item.text ?? "";
            }
            const options = {
              ...additionalOptions,
              additionalContentFields: item
            };
            prompt.push(PromptTemplate.fromTemplate(text, options));
          } else if (isImageTemplateParam(item)) {
            let imgTemplate = item.image_url ?? "";
            let imgTemplateObject;
            let inputVariables = [];
            if (typeof imgTemplate === "string") {
              let parsedTemplate;
              if (additionalOptions?.templateFormat === "mustache") {
                parsedTemplate = parseMustache(imgTemplate);
              } else {
                parsedTemplate = parseFString(imgTemplate);
              }
              const variables = parsedTemplate.flatMap((item2) => item2.type === "variable" ? [item2.name] : []);
              if ((variables?.length ?? 0) > 0) {
                if (variables.length > 1) {
                  throw new Error(`Only one format variable allowed per image template.
Got: ${variables}
From: ${imgTemplate}`);
                }
                inputVariables = [variables[0]];
              } else {
                inputVariables = [];
              }
              imgTemplate = { url: imgTemplate };
              imgTemplateObject = new ImagePromptTemplate({
                template: imgTemplate,
                inputVariables,
                templateFormat: additionalOptions?.templateFormat,
                additionalContentFields: item
              });
            } else if (typeof imgTemplate === "object") {
              if ("url" in imgTemplate) {
                let parsedTemplate;
                if (additionalOptions?.templateFormat === "mustache") {
                  parsedTemplate = parseMustache(imgTemplate.url);
                } else {
                  parsedTemplate = parseFString(imgTemplate.url);
                }
                inputVariables = parsedTemplate.flatMap((item2) => item2.type === "variable" ? [item2.name] : []);
              } else {
                inputVariables = [];
              }
              imgTemplateObject = new ImagePromptTemplate({
                template: imgTemplate,
                inputVariables,
                templateFormat: additionalOptions?.templateFormat,
                additionalContentFields: item
              });
            } else {
              throw new Error("Invalid image template");
            }
            prompt.push(imgTemplateObject);
          } else if (typeof item === "object") {
            prompt.push(new DictPromptTemplate({
              template: item,
              templateFormat: additionalOptions?.templateFormat
            }));
          }
        }
        return new this({ prompt, additionalOptions });
      }
      async format(input) {
        if (this.prompt instanceof BaseStringPromptTemplate) {
          const text = await this.prompt.format(input);
          return this.createMessage(text);
        } else {
          const content = [];
          for (const prompt of this.prompt) {
            let inputs = {};
            if (!("inputVariables" in prompt)) {
              throw new Error(`Prompt ${prompt} does not have inputVariables defined.`);
            }
            for (const item of prompt.inputVariables) {
              if (!inputs) {
                inputs = { [item]: input[item] };
              }
              inputs = { ...inputs, [item]: input[item] };
            }
            if (prompt instanceof BaseStringPromptTemplate) {
              const formatted = await prompt.format(inputs);
              let additionalContentFields;
              if ("additionalContentFields" in prompt) {
                additionalContentFields = prompt.additionalContentFields;
              }
              if (formatted !== "") {
                content.push({
                  ...additionalContentFields,
                  type: "text",
                  text: formatted
                });
              }
            } else if (prompt instanceof ImagePromptTemplate) {
              const formatted = await prompt.format(inputs);
              let additionalContentFields;
              if ("additionalContentFields" in prompt) {
                additionalContentFields = prompt.additionalContentFields;
              }
              content.push({
                ...additionalContentFields,
                type: "image_url",
                image_url: formatted
              });
            } else if (prompt instanceof DictPromptTemplate) {
              const formatted = await prompt.format(inputs);
              let additionalContentFields;
              if ("additionalContentFields" in prompt) {
                additionalContentFields = prompt.additionalContentFields;
              }
              content.push({
                ...additionalContentFields,
                ...formatted
              });
            }
          }
          return this.createMessage(content);
        }
      }
      async formatMessages(values) {
        return [await this.format(values)];
      }
    };
    HumanMessagePromptTemplate = class extends _StringImageMessagePromptTemplate {
      static _messageClass() {
        return HumanMessage;
      }
      static lc_name() {
        return "HumanMessagePromptTemplate";
      }
    };
    AIMessagePromptTemplate = class extends _StringImageMessagePromptTemplate {
      static _messageClass() {
        return AIMessage;
      }
      static lc_name() {
        return "AIMessagePromptTemplate";
      }
    };
    SystemMessagePromptTemplate = class extends _StringImageMessagePromptTemplate {
      static _messageClass() {
        return SystemMessage;
      }
      static lc_name() {
        return "SystemMessagePromptTemplate";
      }
    };
    ChatPromptTemplate = class _ChatPromptTemplate extends BaseChatPromptTemplate {
      static lc_name() {
        return "ChatPromptTemplate";
      }
      get lc_aliases() {
        return {
          promptMessages: "messages"
        };
      }
      constructor(input) {
        super(input);
        Object.defineProperty(this, "promptMessages", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "validateTemplate", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        Object.defineProperty(this, "templateFormat", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "f-string"
        });
        if (input.templateFormat === "mustache" && input.validateTemplate === void 0) {
          this.validateTemplate = false;
        }
        Object.assign(this, input);
        if (this.validateTemplate) {
          const inputVariablesMessages = /* @__PURE__ */ new Set();
          for (const promptMessage of this.promptMessages) {
            if (promptMessage instanceof BaseMessage)
              continue;
            for (const inputVariable of promptMessage.inputVariables) {
              inputVariablesMessages.add(inputVariable);
            }
          }
          const totalInputVariables = this.inputVariables;
          const inputVariablesInstance = new Set(this.partialVariables ? totalInputVariables.concat(Object.keys(this.partialVariables)) : totalInputVariables);
          const difference = new Set([...inputVariablesInstance].filter((x) => !inputVariablesMessages.has(x)));
          if (difference.size > 0) {
            throw new Error(`Input variables \`${[
              ...difference
            ]}\` are not used in any of the prompt messages.`);
          }
          const otherDifference = new Set([...inputVariablesMessages].filter((x) => !inputVariablesInstance.has(x)));
          if (otherDifference.size > 0) {
            throw new Error(`Input variables \`${[
              ...otherDifference
            ]}\` are used in prompt messages but not in the prompt template.`);
          }
        }
      }
      _getPromptType() {
        return "chat";
      }
      async _parseImagePrompts(message, inputValues) {
        if (typeof message.content === "string") {
          return message;
        }
        const formattedMessageContent = await Promise.all(message.content.map(async (item) => {
          if (item.type !== "image_url") {
            return item;
          }
          let imageUrl = "";
          if (typeof item.image_url === "string") {
            imageUrl = item.image_url;
          } else {
            imageUrl = item.image_url.url;
          }
          const promptTemplatePlaceholder = PromptTemplate.fromTemplate(imageUrl, {
            templateFormat: this.templateFormat
          });
          const formattedUrl = await promptTemplatePlaceholder.format(inputValues);
          if (typeof item.image_url !== "string" && "url" in item.image_url) {
            item.image_url.url = formattedUrl;
          } else {
            item.image_url = formattedUrl;
          }
          return item;
        }));
        message.content = formattedMessageContent;
        return message;
      }
      async formatMessages(values) {
        const allValues = await this.mergePartialAndUserVariables(values);
        let resultMessages = [];
        for (const promptMessage of this.promptMessages) {
          if (promptMessage instanceof BaseMessage) {
            resultMessages.push(await this._parseImagePrompts(promptMessage, allValues));
          } else {
            let inputValues;
            if (this.templateFormat === "mustache") {
              inputValues = { ...allValues };
            } else {
              inputValues = promptMessage.inputVariables.reduce((acc, inputVariable) => {
                if (!(inputVariable in allValues) && !(isMessagesPlaceholder(promptMessage) && promptMessage.optional)) {
                  const error = addLangChainErrorFields(new Error(`Missing value for input variable \`${inputVariable.toString()}\``), "INVALID_PROMPT_INPUT");
                  throw error;
                }
                acc[inputVariable] = allValues[inputVariable];
                return acc;
              }, {});
            }
            const message = await promptMessage.formatMessages(inputValues);
            resultMessages = resultMessages.concat(message);
          }
        }
        return resultMessages;
      }
      async partial(values) {
        const newInputVariables = this.inputVariables.filter((iv) => !(iv in values));
        const newPartialVariables = {
          ...this.partialVariables ?? {},
          ...values
        };
        const promptDict = {
          ...this,
          inputVariables: newInputVariables,
          partialVariables: newPartialVariables
        };
        return new _ChatPromptTemplate(promptDict);
      }
      static fromTemplate(template, options) {
        const prompt = PromptTemplate.fromTemplate(template, options);
        const humanTemplate = new HumanMessagePromptTemplate({ prompt });
        return this.fromMessages([humanTemplate]);
      }
      /**
       * Create a chat model-specific prompt from individual chat messages
       * or message-like tuples.
       * @param promptMessages Messages to be passed to the chat model
       * @returns A new ChatPromptTemplate
       */
      static fromMessages(promptMessages, extra) {
        const flattenedMessages = promptMessages.reduce((acc, promptMessage) => acc.concat(
          // eslint-disable-next-line no-instanceof/no-instanceof
          promptMessage instanceof _ChatPromptTemplate ? promptMessage.promptMessages : [
            _coerceMessagePromptTemplateLike(promptMessage, extra)
          ]
        ), []);
        const flattenedPartialVariables = promptMessages.reduce((acc, promptMessage) => (
          // eslint-disable-next-line no-instanceof/no-instanceof
          promptMessage instanceof _ChatPromptTemplate ? Object.assign(acc, promptMessage.partialVariables) : acc
        ), /* @__PURE__ */ Object.create(null));
        const inputVariables = /* @__PURE__ */ new Set();
        for (const promptMessage of flattenedMessages) {
          if (promptMessage instanceof BaseMessage)
            continue;
          for (const inputVariable of promptMessage.inputVariables) {
            if (inputVariable in flattenedPartialVariables) {
              continue;
            }
            inputVariables.add(inputVariable);
          }
        }
        return new this({
          ...extra,
          inputVariables: [...inputVariables],
          promptMessages: flattenedMessages,
          partialVariables: flattenedPartialVariables,
          templateFormat: extra?.templateFormat
        });
      }
      /** @deprecated Renamed to .fromMessages */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      static fromPromptMessages(promptMessages) {
        return this.fromMessages(promptMessages);
      }
    };
  }
});

// node_modules/@langchain/core/dist/prompts/few_shot.js
var few_shot_exports = {};
__export(few_shot_exports, {
  FewShotChatMessagePromptTemplate: () => FewShotChatMessagePromptTemplate,
  FewShotPromptTemplate: () => FewShotPromptTemplate
});
var FewShotPromptTemplate, FewShotChatMessagePromptTemplate;
var init_few_shot = __esm({
  "node_modules/@langchain/core/dist/prompts/few_shot.js"() {
    init_string2();
    init_template();
    init_prompt();
    init_chat2();
    FewShotPromptTemplate = class _FewShotPromptTemplate extends BaseStringPromptTemplate {
      constructor(input) {
        super(input);
        Object.defineProperty(this, "lc_serializable", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: false
        });
        Object.defineProperty(this, "examples", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "exampleSelector", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "examplePrompt", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "suffix", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ""
        });
        Object.defineProperty(this, "exampleSeparator", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "\n\n"
        });
        Object.defineProperty(this, "prefix", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ""
        });
        Object.defineProperty(this, "templateFormat", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "f-string"
        });
        Object.defineProperty(this, "validateTemplate", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        Object.assign(this, input);
        if (this.examples !== void 0 && this.exampleSelector !== void 0) {
          throw new Error("Only one of 'examples' and 'example_selector' should be provided");
        }
        if (this.examples === void 0 && this.exampleSelector === void 0) {
          throw new Error("One of 'examples' and 'example_selector' should be provided");
        }
        if (this.validateTemplate) {
          let totalInputVariables = this.inputVariables;
          if (this.partialVariables) {
            totalInputVariables = totalInputVariables.concat(Object.keys(this.partialVariables));
          }
          checkValidTemplate(this.prefix + this.suffix, this.templateFormat, totalInputVariables);
        }
      }
      _getPromptType() {
        return "few_shot";
      }
      static lc_name() {
        return "FewShotPromptTemplate";
      }
      async getExamples(inputVariables) {
        if (this.examples !== void 0) {
          return this.examples;
        }
        if (this.exampleSelector !== void 0) {
          return this.exampleSelector.selectExamples(inputVariables);
        }
        throw new Error("One of 'examples' and 'example_selector' should be provided");
      }
      async partial(values) {
        const newInputVariables = this.inputVariables.filter((iv) => !(iv in values));
        const newPartialVariables = {
          ...this.partialVariables ?? {},
          ...values
        };
        const promptDict = {
          ...this,
          inputVariables: newInputVariables,
          partialVariables: newPartialVariables
        };
        return new _FewShotPromptTemplate(promptDict);
      }
      /**
       * Formats the prompt with the given values.
       * @param values The values to format the prompt with.
       * @returns A promise that resolves to a string representing the formatted prompt.
       */
      async format(values) {
        const allValues = await this.mergePartialAndUserVariables(values);
        const examples = await this.getExamples(allValues);
        const exampleStrings = await Promise.all(examples.map((example) => this.examplePrompt.format(example)));
        const template = [this.prefix, ...exampleStrings, this.suffix].join(this.exampleSeparator);
        return renderTemplate(template, this.templateFormat, allValues);
      }
      serialize() {
        if (this.exampleSelector || !this.examples) {
          throw new Error("Serializing an example selector is not currently supported");
        }
        if (this.outputParser !== void 0) {
          throw new Error("Serializing an output parser is not currently supported");
        }
        return {
          _type: this._getPromptType(),
          input_variables: this.inputVariables,
          example_prompt: this.examplePrompt.serialize(),
          example_separator: this.exampleSeparator,
          suffix: this.suffix,
          prefix: this.prefix,
          template_format: this.templateFormat,
          examples: this.examples
        };
      }
      static async deserialize(data) {
        const { example_prompt } = data;
        if (!example_prompt) {
          throw new Error("Missing example prompt");
        }
        const examplePrompt = await PromptTemplate.deserialize(example_prompt);
        let examples;
        if (Array.isArray(data.examples)) {
          examples = data.examples;
        } else {
          throw new Error("Invalid examples format. Only list or string are supported.");
        }
        return new _FewShotPromptTemplate({
          inputVariables: data.input_variables,
          examplePrompt,
          examples,
          exampleSeparator: data.example_separator,
          prefix: data.prefix,
          suffix: data.suffix,
          templateFormat: data.template_format
        });
      }
    };
    FewShotChatMessagePromptTemplate = class _FewShotChatMessagePromptTemplate extends BaseChatPromptTemplate {
      _getPromptType() {
        return "few_shot_chat";
      }
      static lc_name() {
        return "FewShotChatMessagePromptTemplate";
      }
      constructor(fields) {
        super(fields);
        Object.defineProperty(this, "lc_serializable", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        Object.defineProperty(this, "examples", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "exampleSelector", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "examplePrompt", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "suffix", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ""
        });
        Object.defineProperty(this, "exampleSeparator", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "\n\n"
        });
        Object.defineProperty(this, "prefix", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ""
        });
        Object.defineProperty(this, "templateFormat", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "f-string"
        });
        Object.defineProperty(this, "validateTemplate", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        this.examples = fields.examples;
        this.examplePrompt = fields.examplePrompt;
        this.exampleSeparator = fields.exampleSeparator ?? "\n\n";
        this.exampleSelector = fields.exampleSelector;
        this.prefix = fields.prefix ?? "";
        this.suffix = fields.suffix ?? "";
        this.templateFormat = fields.templateFormat ?? "f-string";
        this.validateTemplate = fields.validateTemplate ?? true;
        if (this.examples !== void 0 && this.exampleSelector !== void 0) {
          throw new Error("Only one of 'examples' and 'example_selector' should be provided");
        }
        if (this.examples === void 0 && this.exampleSelector === void 0) {
          throw new Error("One of 'examples' and 'example_selector' should be provided");
        }
        if (this.validateTemplate) {
          let totalInputVariables = this.inputVariables;
          if (this.partialVariables) {
            totalInputVariables = totalInputVariables.concat(Object.keys(this.partialVariables));
          }
          checkValidTemplate(this.prefix + this.suffix, this.templateFormat, totalInputVariables);
        }
      }
      async getExamples(inputVariables) {
        if (this.examples !== void 0) {
          return this.examples;
        }
        if (this.exampleSelector !== void 0) {
          return this.exampleSelector.selectExamples(inputVariables);
        }
        throw new Error("One of 'examples' and 'example_selector' should be provided");
      }
      /**
       * Formats the list of values and returns a list of formatted messages.
       * @param values The values to format the prompt with.
       * @returns A promise that resolves to a string representing the formatted prompt.
       */
      async formatMessages(values) {
        const allValues = await this.mergePartialAndUserVariables(values);
        let examples = await this.getExamples(allValues);
        examples = examples.map((example) => {
          const result = {};
          this.examplePrompt.inputVariables.forEach((inputVariable) => {
            result[inputVariable] = example[inputVariable];
          });
          return result;
        });
        const messages = [];
        for (const example of examples) {
          const exampleMessages = await this.examplePrompt.formatMessages(example);
          messages.push(...exampleMessages);
        }
        return messages;
      }
      /**
       * Formats the prompt with the given values.
       * @param values The values to format the prompt with.
       * @returns A promise that resolves to a string representing the formatted prompt.
       */
      async format(values) {
        const allValues = await this.mergePartialAndUserVariables(values);
        const examples = await this.getExamples(allValues);
        const exampleMessages = await Promise.all(examples.map((example) => this.examplePrompt.formatMessages(example)));
        const exampleStrings = exampleMessages.flat().map((message) => message.content);
        const template = [this.prefix, ...exampleStrings, this.suffix].join(this.exampleSeparator);
        return renderTemplate(template, this.templateFormat, allValues);
      }
      /**
       * Partially formats the prompt with the given values.
       * @param values The values to partially format the prompt with.
       * @returns A promise that resolves to an instance of `FewShotChatMessagePromptTemplate` with the given values partially formatted.
       */
      async partial(values) {
        const newInputVariables = this.inputVariables.filter((variable) => !(variable in values));
        const newPartialVariables = {
          ...this.partialVariables ?? {},
          ...values
        };
        const promptDict = {
          ...this,
          inputVariables: newInputVariables,
          partialVariables: newPartialVariables
        };
        return new _FewShotChatMessagePromptTemplate(promptDict);
      }
    };
  }
});

// node_modules/@langchain/core/dist/prompts/base.js
var BasePromptTemplate;
var init_base5 = __esm({
  "node_modules/@langchain/core/dist/prompts/base.js"() {
    init_base4();
    BasePromptTemplate = class extends Runnable {
      get lc_attributes() {
        return {
          partialVariables: void 0
          // python doesn't support this yet
        };
      }
      constructor(input) {
        super(input);
        Object.defineProperty(this, "lc_serializable", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        Object.defineProperty(this, "lc_namespace", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ["langchain_core", "prompts", this._getPromptType()]
        });
        Object.defineProperty(this, "inputVariables", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "outputParser", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "partialVariables", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "metadata", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "tags", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        const { inputVariables } = input;
        if (inputVariables.includes("stop")) {
          throw new Error("Cannot have an input variable named 'stop', as it is used internally, please rename.");
        }
        Object.assign(this, input);
      }
      /**
       * Merges partial variables and user variables.
       * @param userVariables The user variables to merge with the partial variables.
       * @returns A Promise that resolves to an object containing the merged variables.
       */
      async mergePartialAndUserVariables(userVariables) {
        const partialVariables = this.partialVariables ?? {};
        const partialValues = {};
        for (const [key, value] of Object.entries(partialVariables)) {
          if (typeof value === "string") {
            partialValues[key] = value;
          } else {
            partialValues[key] = await value();
          }
        }
        const allKwargs = {
          ...partialValues,
          ...userVariables
        };
        return allKwargs;
      }
      /**
       * Invokes the prompt template with the given input and options.
       * @param input The input to invoke the prompt template with.
       * @param options Optional configuration for the callback.
       * @returns A Promise that resolves to the output of the prompt template.
       */
      async invoke(input, options) {
        const metadata = {
          ...this.metadata,
          ...options?.metadata
        };
        const tags = [...this.tags ?? [], ...options?.tags ?? []];
        return this._callWithConfig((input2) => this.formatPromptValue(input2), input, { ...options, tags, metadata, runType: "prompt" });
      }
      /**
       * Return a json-like object representing this prompt template.
       * @deprecated
       */
      serialize() {
        throw new Error("Use .toJSON() instead");
      }
      /**
       * @deprecated
       * Load a prompt template from a json-like object describing it.
       *
       * @remarks
       * Deserializing needs to be async because templates (e.g. {@link FewShotPromptTemplate}) can
       * reference remote resources that we read asynchronously with a web
       * request.
       */
      static async deserialize(data) {
        switch (data._type) {
          case "prompt": {
            const { PromptTemplate: PromptTemplate2 } = await Promise.resolve().then(() => (init_prompt(), prompt_exports));
            return PromptTemplate2.deserialize(data);
          }
          case void 0: {
            const { PromptTemplate: PromptTemplate2 } = await Promise.resolve().then(() => (init_prompt(), prompt_exports));
            return PromptTemplate2.deserialize({ ...data, _type: "prompt" });
          }
          case "few_shot": {
            const { FewShotPromptTemplate: FewShotPromptTemplate2 } = await Promise.resolve().then(() => (init_few_shot(), few_shot_exports));
            return FewShotPromptTemplate2.deserialize(data);
          }
          default:
            throw new Error(`Invalid prompt type in config: ${data._type}`);
        }
      }
    };
  }
});

// node_modules/base64-js/index.js
var require_base64_js = __commonJS({
  "node_modules/base64-js/index.js"(exports2) {
    "use strict";
    exports2.byteLength = byteLength;
    exports2.toByteArray = toByteArray;
    exports2.fromByteArray = fromByteArray;
    var lookup2 = [];
    var revLookup = [];
    var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
    var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for (i = 0, len = code.length; i < len; ++i) {
      lookup2[i] = code[i];
      revLookup[code.charCodeAt(i)] = i;
    }
    var i;
    var len;
    revLookup["-".charCodeAt(0)] = 62;
    revLookup["_".charCodeAt(0)] = 63;
    function getLens(b64) {
      var len2 = b64.length;
      if (len2 % 4 > 0) {
        throw new Error("Invalid string. Length must be a multiple of 4");
      }
      var validLen = b64.indexOf("=");
      if (validLen === -1) validLen = len2;
      var placeHoldersLen = validLen === len2 ? 0 : 4 - validLen % 4;
      return [validLen, placeHoldersLen];
    }
    function byteLength(b64) {
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
    }
    function _byteLength(b64, validLen, placeHoldersLen) {
      return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
    }
    function toByteArray(b64) {
      var tmp;
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      var arr2 = new Arr(_byteLength(b64, validLen, placeHoldersLen));
      var curByte = 0;
      var len2 = placeHoldersLen > 0 ? validLen - 4 : validLen;
      var i2;
      for (i2 = 0; i2 < len2; i2 += 4) {
        tmp = revLookup[b64.charCodeAt(i2)] << 18 | revLookup[b64.charCodeAt(i2 + 1)] << 12 | revLookup[b64.charCodeAt(i2 + 2)] << 6 | revLookup[b64.charCodeAt(i2 + 3)];
        arr2[curByte++] = tmp >> 16 & 255;
        arr2[curByte++] = tmp >> 8 & 255;
        arr2[curByte++] = tmp & 255;
      }
      if (placeHoldersLen === 2) {
        tmp = revLookup[b64.charCodeAt(i2)] << 2 | revLookup[b64.charCodeAt(i2 + 1)] >> 4;
        arr2[curByte++] = tmp & 255;
      }
      if (placeHoldersLen === 1) {
        tmp = revLookup[b64.charCodeAt(i2)] << 10 | revLookup[b64.charCodeAt(i2 + 1)] << 4 | revLookup[b64.charCodeAt(i2 + 2)] >> 2;
        arr2[curByte++] = tmp >> 8 & 255;
        arr2[curByte++] = tmp & 255;
      }
      return arr2;
    }
    function tripletToBase64(num) {
      return lookup2[num >> 18 & 63] + lookup2[num >> 12 & 63] + lookup2[num >> 6 & 63] + lookup2[num & 63];
    }
    function encodeChunk(uint8, start, end) {
      var tmp;
      var output = [];
      for (var i2 = start; i2 < end; i2 += 3) {
        tmp = (uint8[i2] << 16 & 16711680) + (uint8[i2 + 1] << 8 & 65280) + (uint8[i2 + 2] & 255);
        output.push(tripletToBase64(tmp));
      }
      return output.join("");
    }
    function fromByteArray(uint8) {
      var tmp;
      var len2 = uint8.length;
      var extraBytes = len2 % 3;
      var parts = [];
      var maxChunkLength = 16383;
      for (var i2 = 0, len22 = len2 - extraBytes; i2 < len22; i2 += maxChunkLength) {
        parts.push(encodeChunk(uint8, i2, i2 + maxChunkLength > len22 ? len22 : i2 + maxChunkLength));
      }
      if (extraBytes === 1) {
        tmp = uint8[len2 - 1];
        parts.push(
          lookup2[tmp >> 2] + lookup2[tmp << 4 & 63] + "=="
        );
      } else if (extraBytes === 2) {
        tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1];
        parts.push(
          lookup2[tmp >> 10] + lookup2[tmp >> 4 & 63] + lookup2[tmp << 2 & 63] + "="
        );
      }
      return parts.join("");
    }
  }
});

// src/config/queue.ts
var import_bullmq = require("bullmq");

// src/config/redis.ts
var import_ioredis = __toESM(require("ioredis"));

// src/config/env.ts
var import_zod = require("zod");
var import_dotenv = __toESM(require("dotenv"));
import_dotenv.default.config();
var envSchema = import_zod.z.object({
  // Server
  PORT: import_zod.z.string().default("4000").transform(Number),
  NODE_ENV: import_zod.z.enum(["development", "production", "test"]).default("development"),
  FRONTEND_URL: import_zod.z.string().default("http://localhost:5173"),
  // Auth
  JWT_SECRET: import_zod.z.string().min(10, "JWT_SECRET must be at least 10 characters"),
  JWT_EXPIRES_IN: import_zod.z.string().default("7d"),
  // Database
  DATABASE_URL: import_zod.z.string().url("DATABASE_URL must be a valid connection string"),
  // Redis
  REDIS_URL: import_zod.z.string().default("redis://localhost:6379"),
  // AI — Google Gemini
  GOOGLE_API_KEY: import_zod.z.string().optional().default(""),
  AI_MODEL: import_zod.z.string().default("gemini-2.0-flash"),
  // Scraping
  SCRAPER_TIMEOUT_MS: import_zod.z.string().default("30000").transform(Number),
  PROXY_URL: import_zod.z.string().optional().default(""),
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: import_zod.z.string().default("900000").transform(Number),
  RATE_LIMIT_MAX_FREE: import_zod.z.string().default("10").transform(Number),
  RATE_LIMIT_MAX_PRO: import_zod.z.string().default("100").transform(Number)
});
function validateEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("\u274C Invalid environment variables:");
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
  }
  return parsed.data;
}
var env = validateEnv();

// src/config/redis.ts
var redis = null;
function getRedisClient() {
  if (!redis) {
    redis = new import_ioredis.default(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      // Required for BullMQ
      enableReadyCheck: false,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2e3);
        return delay;
      }
    });
    redis.on("connect", () => {
      console.log("\u2705 Redis connected successfully");
    });
    redis.on("error", (err) => {
      console.error("\u274C Redis connection error:", err.message);
    });
  }
  return redis;
}
async function connectRedis() {
  const client2 = getRedisClient();
  try {
    await client2.ping();
    console.log("\u2705 Redis ping successful");
  } catch (error) {
    console.error("\u274C Redis connection failed:", error);
  }
}
function createBullMQConnection() {
  return new import_ioredis.default(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false
  });
}

// src/config/queue.ts
var ANALYSIS_QUEUE_NAME = "analysis-queue";
function createAnalysisWorker(processor) {
  const worker = new import_bullmq.Worker(ANALYSIS_QUEUE_NAME, processor, {
    connection: createBullMQConnection(),
    concurrency: 3,
    stalledInterval: 3e4,
    // 30s stalled check
    limiter: {
      max: 10,
      duration: 6e4
      // Max 10 jobs per minute
    }
  });
  worker.on("completed", (job) => {
    console.log(`\u2705 Job ${job.id} completed`);
  });
  worker.on("failed", (job, err) => {
    console.error(`\u274C Job ${job?.id} failed:`, err.message);
  });
  worker.on("stalled", (jobId) => {
    console.warn(`\u26A0\uFE0F Job ${jobId} stalled`);
  });
  return worker;
}

// src/config/database.ts
var import_client = require("@prisma/client");
var globalForPrisma = globalThis;
var prisma = globalForPrisma.prisma ?? new import_client.PrismaClient({
  log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
});
if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
async function connectDatabase() {
  const maxAttempts = 5;
  let attempt = 1;
  while (attempt <= maxAttempts) {
    try {
      await prisma.$connect();
      console.log("\u2705 Database connected successfully");
      return;
    } catch (error) {
      console.warn(`\u26A0\uFE0F Database connection attempt ${attempt}/${maxAttempts} failed: ${error.message || error}`);
      if (attempt === maxAttempts) {
        console.error("\u274C Database connection failed after max retries:", error);
        process.exit(1);
      }
      attempt++;
      await new Promise((resolve) => setTimeout(resolve, 3e3));
    }
  }
}

// src/agents/trustcart.agent.ts
var import_agents = require("langchain/agents");

// node_modules/@langchain/core/dist/prompts/index.js
init_base5();
init_chat2();
init_few_shot();

// node_modules/@langchain/core/dist/prompts/pipeline.js
init_base5();
init_chat2();

// node_modules/@langchain/core/dist/prompts/index.js
init_prompt();
init_string2();
init_template();
init_image();

// node_modules/@langchain/core/dist/prompts/structured.js
init_base4();
init_chat2();

// node_modules/@langchain/core/dist/prompts/index.js
init_dict();

// src/utils/logger.ts
var import_winston = __toESM(require("winston"));
var { combine, timestamp, printf, colorize, errors } = import_winston.default.format;
var logFormat = printf(({ level, message, timestamp: timestamp2, stack, ...meta }) => {
  let log = `${timestamp2} [${level}]: ${message}`;
  if (stack) {
    log += `
${stack}`;
  }
  if (Object.keys(meta).length > 0) {
    log += `
${JSON.stringify(meta, null, 2)}`;
  }
  return log;
});
var logger = import_winston.default.createLogger({
  level: env.NODE_ENV === "development" ? "debug" : "info",
  format: combine(
    errors({ stack: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    logFormat
  ),
  defaultMeta: { service: "trustcart" },
  transports: [
    // Console transport (always)
    new import_winston.default.transports.Console({
      format: combine(
        colorize({ all: true }),
        errors({ stack: true }),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        logFormat
      )
    }),
    // File transport for errors
    new import_winston.default.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5242880,
      // 5MB
      maxFiles: 5
    }),
    // File transport for all logs
    new import_winston.default.transports.File({
      filename: "logs/combined.log",
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
});
if (env.NODE_ENV === "test") {
  logger.transports.forEach((t) => {
    if (t instanceof import_winston.default.transports.File) {
      t.silent = true;
    }
  });
}

// src/middleware/error.middleware.ts
var AppError = class extends Error {
  statusCode;
  isOperational;
  code;
  details;
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR", isOperational = true, details) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
};
var ScrapingError = class extends AppError {
  constructor(message = "Failed to scrape product page") {
    super(message, 422, "SCRAPING_ERROR");
  }
};
var AIError = class extends AppError {
  constructor(message = "AI service unavailable") {
    super(message, 502, "AI_ERROR");
  }
};

// src/services/ai.service.ts
var chatModel = null;
async function getChatModel() {
  if (chatModel) return chatModel;
  try {
    if (env.GOOGLE_API_KEY) {
      const { ChatGoogleGenerativeAI } = await import("@langchain/google-genai");
      chatModel = new ChatGoogleGenerativeAI({
        apiKey: env.GOOGLE_API_KEY,
        model: env.AI_MODEL || "gemini-2.0-flash",
        temperature: 0.3,
        maxOutputTokens: 4096,
        maxRetries: 0
      });
      logger.info(`\u{1F916} AI Provider: Google Gemini (${env.AI_MODEL})`);
    } else {
      logger.warn("\u26A0\uFE0F No GOOGLE_API_KEY configured. Agent will use heuristic-only mode.");
      return null;
    }
    return chatModel;
  } catch (error) {
    logger.error("Failed to initialize Gemini model:", error);
    throw new AIError("Failed to initialize AI service");
  }
}
async function generateSentimentSummary(productName, reviewStats) {
  const model = await getChatModel();
  if (!model) {
    return generateHeuristicSummary(productName, reviewStats);
  }
  try {
    const prompt = `Summarize the review analysis for "${productName}" in 1-2 sentences for an Indian consumer.
Stats: ${reviewStats.totalReviews} total reviews, ${reviewStats.fakePercentage.toFixed(1)}% potentially fake, average rating ${reviewStats.avgRating.toFixed(1)}/5 (adjusted: ${reviewStats.adjustedRating.toFixed(1)}/5).
Suspicious patterns found: ${reviewStats.suspiciousPatterns.join(", ") || "none"}.
Be concise, direct, and helpful.`;
    const response = await model.invoke(prompt);
    return response.content;
  } catch (error) {
    logger.warn("AI sentiment summary failed, using heuristic:", error);
    return generateHeuristicSummary(productName, reviewStats);
  }
}
function generateHeuristicSummary(productName, stats) {
  const parts = [];
  if (stats.fakePercentage > 40) {
    parts.push(`${productName} has a high proportion of potentially fake reviews (${stats.fakePercentage.toFixed(0)}%)`);
  } else if (stats.fakePercentage > 20) {
    parts.push(`${productName} has some questionable reviews (${stats.fakePercentage.toFixed(0)}% flagged)`);
  } else {
    parts.push(`${productName} reviews appear mostly authentic`);
  }
  if (stats.adjustedRating < stats.avgRating - 0.5) {
    parts.push(`the adjusted rating drops to ${stats.adjustedRating.toFixed(1)}/5 after removing suspicious reviews`);
  }
  if (stats.suspiciousPatterns.length > 0) {
    parts.push(`concerns include: ${stats.suspiciousPatterns.slice(0, 2).join(", ")}`);
  }
  return parts.join("; ") + ".";
}

// node_modules/@langchain/core/dist/tools/index.js
var import_v36 = require("zod/v3");
init_esm2();
init_manager();

// node_modules/@langchain/core/dist/utils/js-sha1/hash.js
var root = typeof window === "object" ? window : {};
var HEX_CHARS = "0123456789abcdef".split("");
var EXTRA = [-2147483648, 8388608, 32768, 128];
var SHIFT = [24, 16, 8, 0];
var blocks = [];
function Sha1(sharedMemory) {
  if (sharedMemory) {
    blocks[0] = blocks[16] = blocks[1] = blocks[2] = blocks[3] = blocks[4] = blocks[5] = blocks[6] = blocks[7] = blocks[8] = blocks[9] = blocks[10] = blocks[11] = blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
    this.blocks = blocks;
  } else {
    this.blocks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  }
  this.h0 = 1732584193;
  this.h1 = 4023233417;
  this.h2 = 2562383102;
  this.h3 = 271733878;
  this.h4 = 3285377520;
  this.block = this.start = this.bytes = this.hBytes = 0;
  this.finalized = this.hashed = false;
  this.first = true;
}
Sha1.prototype.update = function(message) {
  if (this.finalized) {
    return;
  }
  var notString = typeof message !== "string";
  if (notString && message.constructor === root.ArrayBuffer) {
    message = new Uint8Array(message);
  }
  var code, index = 0, i, length = message.length || 0, blocks3 = this.blocks;
  while (index < length) {
    if (this.hashed) {
      this.hashed = false;
      blocks3[0] = this.block;
      blocks3[16] = blocks3[1] = blocks3[2] = blocks3[3] = blocks3[4] = blocks3[5] = blocks3[6] = blocks3[7] = blocks3[8] = blocks3[9] = blocks3[10] = blocks3[11] = blocks3[12] = blocks3[13] = blocks3[14] = blocks3[15] = 0;
    }
    if (notString) {
      for (i = this.start; index < length && i < 64; ++index) {
        blocks3[i >> 2] |= message[index] << SHIFT[i++ & 3];
      }
    } else {
      for (i = this.start; index < length && i < 64; ++index) {
        code = message.charCodeAt(index);
        if (code < 128) {
          blocks3[i >> 2] |= code << SHIFT[i++ & 3];
        } else if (code < 2048) {
          blocks3[i >> 2] |= (192 | code >> 6) << SHIFT[i++ & 3];
          blocks3[i >> 2] |= (128 | code & 63) << SHIFT[i++ & 3];
        } else if (code < 55296 || code >= 57344) {
          blocks3[i >> 2] |= (224 | code >> 12) << SHIFT[i++ & 3];
          blocks3[i >> 2] |= (128 | code >> 6 & 63) << SHIFT[i++ & 3];
          blocks3[i >> 2] |= (128 | code & 63) << SHIFT[i++ & 3];
        } else {
          code = 65536 + ((code & 1023) << 10 | message.charCodeAt(++index) & 1023);
          blocks3[i >> 2] |= (240 | code >> 18) << SHIFT[i++ & 3];
          blocks3[i >> 2] |= (128 | code >> 12 & 63) << SHIFT[i++ & 3];
          blocks3[i >> 2] |= (128 | code >> 6 & 63) << SHIFT[i++ & 3];
          blocks3[i >> 2] |= (128 | code & 63) << SHIFT[i++ & 3];
        }
      }
    }
    this.lastByteIndex = i;
    this.bytes += i - this.start;
    if (i >= 64) {
      this.block = blocks3[16];
      this.start = i - 64;
      this.hash();
      this.hashed = true;
    } else {
      this.start = i;
    }
  }
  if (this.bytes > 4294967295) {
    this.hBytes += this.bytes / 4294967296 << 0;
    this.bytes = this.bytes % 4294967296;
  }
  return this;
};
Sha1.prototype.finalize = function() {
  if (this.finalized) {
    return;
  }
  this.finalized = true;
  var blocks3 = this.blocks, i = this.lastByteIndex;
  blocks3[16] = this.block;
  blocks3[i >> 2] |= EXTRA[i & 3];
  this.block = blocks3[16];
  if (i >= 56) {
    if (!this.hashed) {
      this.hash();
    }
    blocks3[0] = this.block;
    blocks3[16] = blocks3[1] = blocks3[2] = blocks3[3] = blocks3[4] = blocks3[5] = blocks3[6] = blocks3[7] = blocks3[8] = blocks3[9] = blocks3[10] = blocks3[11] = blocks3[12] = blocks3[13] = blocks3[14] = blocks3[15] = 0;
  }
  blocks3[14] = this.hBytes << 3 | this.bytes >>> 29;
  blocks3[15] = this.bytes << 3;
  this.hash();
};
Sha1.prototype.hash = function() {
  var a = this.h0, b = this.h1, c = this.h2, d = this.h3, e = this.h4;
  var f, j, t, blocks3 = this.blocks;
  for (j = 16; j < 80; ++j) {
    t = blocks3[j - 3] ^ blocks3[j - 8] ^ blocks3[j - 14] ^ blocks3[j - 16];
    blocks3[j] = t << 1 | t >>> 31;
  }
  for (j = 0; j < 20; j += 5) {
    f = b & c | ~b & d;
    t = a << 5 | a >>> 27;
    e = t + f + e + 1518500249 + blocks3[j] << 0;
    b = b << 30 | b >>> 2;
    f = a & b | ~a & c;
    t = e << 5 | e >>> 27;
    d = t + f + d + 1518500249 + blocks3[j + 1] << 0;
    a = a << 30 | a >>> 2;
    f = e & a | ~e & b;
    t = d << 5 | d >>> 27;
    c = t + f + c + 1518500249 + blocks3[j + 2] << 0;
    e = e << 30 | e >>> 2;
    f = d & e | ~d & a;
    t = c << 5 | c >>> 27;
    b = t + f + b + 1518500249 + blocks3[j + 3] << 0;
    d = d << 30 | d >>> 2;
    f = c & d | ~c & e;
    t = b << 5 | b >>> 27;
    a = t + f + a + 1518500249 + blocks3[j + 4] << 0;
    c = c << 30 | c >>> 2;
  }
  for (; j < 40; j += 5) {
    f = b ^ c ^ d;
    t = a << 5 | a >>> 27;
    e = t + f + e + 1859775393 + blocks3[j] << 0;
    b = b << 30 | b >>> 2;
    f = a ^ b ^ c;
    t = e << 5 | e >>> 27;
    d = t + f + d + 1859775393 + blocks3[j + 1] << 0;
    a = a << 30 | a >>> 2;
    f = e ^ a ^ b;
    t = d << 5 | d >>> 27;
    c = t + f + c + 1859775393 + blocks3[j + 2] << 0;
    e = e << 30 | e >>> 2;
    f = d ^ e ^ a;
    t = c << 5 | c >>> 27;
    b = t + f + b + 1859775393 + blocks3[j + 3] << 0;
    d = d << 30 | d >>> 2;
    f = c ^ d ^ e;
    t = b << 5 | b >>> 27;
    a = t + f + a + 1859775393 + blocks3[j + 4] << 0;
    c = c << 30 | c >>> 2;
  }
  for (; j < 60; j += 5) {
    f = b & c | b & d | c & d;
    t = a << 5 | a >>> 27;
    e = t + f + e - 1894007588 + blocks3[j] << 0;
    b = b << 30 | b >>> 2;
    f = a & b | a & c | b & c;
    t = e << 5 | e >>> 27;
    d = t + f + d - 1894007588 + blocks3[j + 1] << 0;
    a = a << 30 | a >>> 2;
    f = e & a | e & b | a & b;
    t = d << 5 | d >>> 27;
    c = t + f + c - 1894007588 + blocks3[j + 2] << 0;
    e = e << 30 | e >>> 2;
    f = d & e | d & a | e & a;
    t = c << 5 | c >>> 27;
    b = t + f + b - 1894007588 + blocks3[j + 3] << 0;
    d = d << 30 | d >>> 2;
    f = c & d | c & e | d & e;
    t = b << 5 | b >>> 27;
    a = t + f + a - 1894007588 + blocks3[j + 4] << 0;
    c = c << 30 | c >>> 2;
  }
  for (; j < 80; j += 5) {
    f = b ^ c ^ d;
    t = a << 5 | a >>> 27;
    e = t + f + e - 899497514 + blocks3[j] << 0;
    b = b << 30 | b >>> 2;
    f = a ^ b ^ c;
    t = e << 5 | e >>> 27;
    d = t + f + d - 899497514 + blocks3[j + 1] << 0;
    a = a << 30 | a >>> 2;
    f = e ^ a ^ b;
    t = d << 5 | d >>> 27;
    c = t + f + c - 899497514 + blocks3[j + 2] << 0;
    e = e << 30 | e >>> 2;
    f = d ^ e ^ a;
    t = c << 5 | c >>> 27;
    b = t + f + b - 899497514 + blocks3[j + 3] << 0;
    d = d << 30 | d >>> 2;
    f = c ^ d ^ e;
    t = b << 5 | b >>> 27;
    a = t + f + a - 899497514 + blocks3[j + 4] << 0;
    c = c << 30 | c >>> 2;
  }
  this.h0 = this.h0 + a << 0;
  this.h1 = this.h1 + b << 0;
  this.h2 = this.h2 + c << 0;
  this.h3 = this.h3 + d << 0;
  this.h4 = this.h4 + e << 0;
};
Sha1.prototype.hex = function() {
  this.finalize();
  var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3, h4 = this.h4;
  return HEX_CHARS[h0 >> 28 & 15] + HEX_CHARS[h0 >> 24 & 15] + HEX_CHARS[h0 >> 20 & 15] + HEX_CHARS[h0 >> 16 & 15] + HEX_CHARS[h0 >> 12 & 15] + HEX_CHARS[h0 >> 8 & 15] + HEX_CHARS[h0 >> 4 & 15] + HEX_CHARS[h0 & 15] + HEX_CHARS[h1 >> 28 & 15] + HEX_CHARS[h1 >> 24 & 15] + HEX_CHARS[h1 >> 20 & 15] + HEX_CHARS[h1 >> 16 & 15] + HEX_CHARS[h1 >> 12 & 15] + HEX_CHARS[h1 >> 8 & 15] + HEX_CHARS[h1 >> 4 & 15] + HEX_CHARS[h1 & 15] + HEX_CHARS[h2 >> 28 & 15] + HEX_CHARS[h2 >> 24 & 15] + HEX_CHARS[h2 >> 20 & 15] + HEX_CHARS[h2 >> 16 & 15] + HEX_CHARS[h2 >> 12 & 15] + HEX_CHARS[h2 >> 8 & 15] + HEX_CHARS[h2 >> 4 & 15] + HEX_CHARS[h2 & 15] + HEX_CHARS[h3 >> 28 & 15] + HEX_CHARS[h3 >> 24 & 15] + HEX_CHARS[h3 >> 20 & 15] + HEX_CHARS[h3 >> 16 & 15] + HEX_CHARS[h3 >> 12 & 15] + HEX_CHARS[h3 >> 8 & 15] + HEX_CHARS[h3 >> 4 & 15] + HEX_CHARS[h3 & 15] + HEX_CHARS[h4 >> 28 & 15] + HEX_CHARS[h4 >> 24 & 15] + HEX_CHARS[h4 >> 20 & 15] + HEX_CHARS[h4 >> 16 & 15] + HEX_CHARS[h4 >> 12 & 15] + HEX_CHARS[h4 >> 8 & 15] + HEX_CHARS[h4 >> 4 & 15] + HEX_CHARS[h4 & 15];
};
Sha1.prototype.toString = Sha1.prototype.hex;
Sha1.prototype.digest = function() {
  this.finalize();
  var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3, h4 = this.h4;
  return [
    h0 >> 24 & 255,
    h0 >> 16 & 255,
    h0 >> 8 & 255,
    h0 & 255,
    h1 >> 24 & 255,
    h1 >> 16 & 255,
    h1 >> 8 & 255,
    h1 & 255,
    h2 >> 24 & 255,
    h2 >> 16 & 255,
    h2 >> 8 & 255,
    h2 & 255,
    h3 >> 24 & 255,
    h3 >> 16 & 255,
    h3 >> 8 & 255,
    h3 & 255,
    h4 >> 24 & 255,
    h4 >> 16 & 255,
    h4 >> 8 & 255,
    h4 & 255
  ];
};
Sha1.prototype.array = Sha1.prototype.digest;
Sha1.prototype.arrayBuffer = function() {
  this.finalize();
  var buffer = new ArrayBuffer(20);
  var dataView = new DataView(buffer);
  dataView.setUint32(0, this.h0);
  dataView.setUint32(4, this.h1);
  dataView.setUint32(8, this.h2);
  dataView.setUint32(12, this.h3);
  dataView.setUint32(16, this.h4);
  return buffer;
};

// node_modules/@langchain/core/dist/utils/js-sha256/hash.js
var HEX_CHARS2 = "0123456789abcdef".split("");
var EXTRA2 = [-2147483648, 8388608, 32768, 128];
var SHIFT2 = [24, 16, 8, 0];
var K = [
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
];
var blocks2 = [];
function Sha256(is224, sharedMemory) {
  if (sharedMemory) {
    blocks2[0] = blocks2[16] = blocks2[1] = blocks2[2] = blocks2[3] = blocks2[4] = blocks2[5] = blocks2[6] = blocks2[7] = blocks2[8] = blocks2[9] = blocks2[10] = blocks2[11] = blocks2[12] = blocks2[13] = blocks2[14] = blocks2[15] = 0;
    this.blocks = blocks2;
  } else {
    this.blocks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  }
  if (is224) {
    this.h0 = 3238371032;
    this.h1 = 914150663;
    this.h2 = 812702999;
    this.h3 = 4144912697;
    this.h4 = 4290775857;
    this.h5 = 1750603025;
    this.h6 = 1694076839;
    this.h7 = 3204075428;
  } else {
    this.h0 = 1779033703;
    this.h1 = 3144134277;
    this.h2 = 1013904242;
    this.h3 = 2773480762;
    this.h4 = 1359893119;
    this.h5 = 2600822924;
    this.h6 = 528734635;
    this.h7 = 1541459225;
  }
  this.block = this.start = this.bytes = this.hBytes = 0;
  this.finalized = this.hashed = false;
  this.first = true;
  this.is224 = is224;
}
Sha256.prototype.update = function(message) {
  if (this.finalized) {
    return;
  }
  var notString, type = typeof message;
  if (type !== "string") {
    if (type === "object") {
      if (message === null) {
        throw new Error(ERROR);
      } else if (ARRAY_BUFFER && message.constructor === ArrayBuffer) {
        message = new Uint8Array(message);
      } else if (!Array.isArray(message)) {
        if (!ARRAY_BUFFER || !ArrayBuffer.isView(message)) {
          throw new Error(ERROR);
        }
      }
    } else {
      throw new Error(ERROR);
    }
    notString = true;
  }
  var code, index = 0, i, length = message.length, blocks3 = this.blocks;
  while (index < length) {
    if (this.hashed) {
      this.hashed = false;
      blocks3[0] = this.block;
      this.block = blocks3[16] = blocks3[1] = blocks3[2] = blocks3[3] = blocks3[4] = blocks3[5] = blocks3[6] = blocks3[7] = blocks3[8] = blocks3[9] = blocks3[10] = blocks3[11] = blocks3[12] = blocks3[13] = blocks3[14] = blocks3[15] = 0;
    }
    if (notString) {
      for (i = this.start; index < length && i < 64; ++index) {
        blocks3[i >>> 2] |= message[index] << SHIFT2[i++ & 3];
      }
    } else {
      for (i = this.start; index < length && i < 64; ++index) {
        code = message.charCodeAt(index);
        if (code < 128) {
          blocks3[i >>> 2] |= code << SHIFT2[i++ & 3];
        } else if (code < 2048) {
          blocks3[i >>> 2] |= (192 | code >>> 6) << SHIFT2[i++ & 3];
          blocks3[i >>> 2] |= (128 | code & 63) << SHIFT2[i++ & 3];
        } else if (code < 55296 || code >= 57344) {
          blocks3[i >>> 2] |= (224 | code >>> 12) << SHIFT2[i++ & 3];
          blocks3[i >>> 2] |= (128 | code >>> 6 & 63) << SHIFT2[i++ & 3];
          blocks3[i >>> 2] |= (128 | code & 63) << SHIFT2[i++ & 3];
        } else {
          code = 65536 + ((code & 1023) << 10 | message.charCodeAt(++index) & 1023);
          blocks3[i >>> 2] |= (240 | code >>> 18) << SHIFT2[i++ & 3];
          blocks3[i >>> 2] |= (128 | code >>> 12 & 63) << SHIFT2[i++ & 3];
          blocks3[i >>> 2] |= (128 | code >>> 6 & 63) << SHIFT2[i++ & 3];
          blocks3[i >>> 2] |= (128 | code & 63) << SHIFT2[i++ & 3];
        }
      }
    }
    this.lastByteIndex = i;
    this.bytes += i - this.start;
    if (i >= 64) {
      this.block = blocks3[16];
      this.start = i - 64;
      this.hash();
      this.hashed = true;
    } else {
      this.start = i;
    }
  }
  if (this.bytes > 4294967295) {
    this.hBytes += this.bytes / 4294967296 << 0;
    this.bytes = this.bytes % 4294967296;
  }
  return this;
};
Sha256.prototype.finalize = function() {
  if (this.finalized) {
    return;
  }
  this.finalized = true;
  var blocks3 = this.blocks, i = this.lastByteIndex;
  blocks3[16] = this.block;
  blocks3[i >>> 2] |= EXTRA2[i & 3];
  this.block = blocks3[16];
  if (i >= 56) {
    if (!this.hashed) {
      this.hash();
    }
    blocks3[0] = this.block;
    blocks3[16] = blocks3[1] = blocks3[2] = blocks3[3] = blocks3[4] = blocks3[5] = blocks3[6] = blocks3[7] = blocks3[8] = blocks3[9] = blocks3[10] = blocks3[11] = blocks3[12] = blocks3[13] = blocks3[14] = blocks3[15] = 0;
  }
  blocks3[14] = this.hBytes << 3 | this.bytes >>> 29;
  blocks3[15] = this.bytes << 3;
  this.hash();
};
Sha256.prototype.hash = function() {
  var a = this.h0, b = this.h1, c = this.h2, d = this.h3, e = this.h4, f = this.h5, g = this.h6, h = this.h7, blocks3 = this.blocks, j, s0, s1, maj, t1, t2, ch, ab, da, cd, bc;
  for (j = 16; j < 64; ++j) {
    t1 = blocks3[j - 15];
    s0 = (t1 >>> 7 | t1 << 25) ^ (t1 >>> 18 | t1 << 14) ^ t1 >>> 3;
    t1 = blocks3[j - 2];
    s1 = (t1 >>> 17 | t1 << 15) ^ (t1 >>> 19 | t1 << 13) ^ t1 >>> 10;
    blocks3[j] = blocks3[j - 16] + s0 + blocks3[j - 7] + s1 << 0;
  }
  bc = b & c;
  for (j = 0; j < 64; j += 4) {
    if (this.first) {
      if (this.is224) {
        ab = 300032;
        t1 = blocks3[0] - 1413257819;
        h = t1 - 150054599 << 0;
        d = t1 + 24177077 << 0;
      } else {
        ab = 704751109;
        t1 = blocks3[0] - 210244248;
        h = t1 - 1521486534 << 0;
        d = t1 + 143694565 << 0;
      }
      this.first = false;
    } else {
      s0 = (a >>> 2 | a << 30) ^ (a >>> 13 | a << 19) ^ (a >>> 22 | a << 10);
      s1 = (e >>> 6 | e << 26) ^ (e >>> 11 | e << 21) ^ (e >>> 25 | e << 7);
      ab = a & b;
      maj = ab ^ a & c ^ bc;
      ch = e & f ^ ~e & g;
      t1 = h + s1 + ch + K[j] + blocks3[j];
      t2 = s0 + maj;
      h = d + t1 << 0;
      d = t1 + t2 << 0;
    }
    s0 = (d >>> 2 | d << 30) ^ (d >>> 13 | d << 19) ^ (d >>> 22 | d << 10);
    s1 = (h >>> 6 | h << 26) ^ (h >>> 11 | h << 21) ^ (h >>> 25 | h << 7);
    da = d & a;
    maj = da ^ d & b ^ ab;
    ch = g & h ^ ~g & e;
    t1 = f + s1 + ch + K[j + 1] + blocks3[j + 1];
    t2 = s0 + maj;
    g = c + t1 << 0;
    c = t1 + t2 << 0;
    s0 = (c >>> 2 | c << 30) ^ (c >>> 13 | c << 19) ^ (c >>> 22 | c << 10);
    s1 = (g >>> 6 | g << 26) ^ (g >>> 11 | g << 21) ^ (g >>> 25 | g << 7);
    cd = c & d;
    maj = cd ^ c & a ^ da;
    ch = f & g ^ ~f & h;
    t1 = e + s1 + ch + K[j + 2] + blocks3[j + 2];
    t2 = s0 + maj;
    f = b + t1 << 0;
    b = t1 + t2 << 0;
    s0 = (b >>> 2 | b << 30) ^ (b >>> 13 | b << 19) ^ (b >>> 22 | b << 10);
    s1 = (f >>> 6 | f << 26) ^ (f >>> 11 | f << 21) ^ (f >>> 25 | f << 7);
    bc = b & c;
    maj = bc ^ b & d ^ cd;
    ch = f & g ^ ~f & h;
    t1 = e + s1 + ch + K[j + 3] + blocks3[j + 3];
    t2 = s0 + maj;
    e = a + t1 << 0;
    a = t1 + t2 << 0;
    this.chromeBugWorkAround = true;
  }
  this.h0 = this.h0 + a << 0;
  this.h1 = this.h1 + b << 0;
  this.h2 = this.h2 + c << 0;
  this.h3 = this.h3 + d << 0;
  this.h4 = this.h4 + e << 0;
  this.h5 = this.h5 + f << 0;
  this.h6 = this.h6 + g << 0;
  this.h7 = this.h7 + h << 0;
};
Sha256.prototype.hex = function() {
  this.finalize();
  var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3, h4 = this.h4, h5 = this.h5, h6 = this.h6, h7 = this.h7;
  var hex = HEX_CHARS2[h0 >>> 28 & 15] + HEX_CHARS2[h0 >>> 24 & 15] + HEX_CHARS2[h0 >>> 20 & 15] + HEX_CHARS2[h0 >>> 16 & 15] + HEX_CHARS2[h0 >>> 12 & 15] + HEX_CHARS2[h0 >>> 8 & 15] + HEX_CHARS2[h0 >>> 4 & 15] + HEX_CHARS2[h0 & 15] + HEX_CHARS2[h1 >>> 28 & 15] + HEX_CHARS2[h1 >>> 24 & 15] + HEX_CHARS2[h1 >>> 20 & 15] + HEX_CHARS2[h1 >>> 16 & 15] + HEX_CHARS2[h1 >>> 12 & 15] + HEX_CHARS2[h1 >>> 8 & 15] + HEX_CHARS2[h1 >>> 4 & 15] + HEX_CHARS2[h1 & 15] + HEX_CHARS2[h2 >>> 28 & 15] + HEX_CHARS2[h2 >>> 24 & 15] + HEX_CHARS2[h2 >>> 20 & 15] + HEX_CHARS2[h2 >>> 16 & 15] + HEX_CHARS2[h2 >>> 12 & 15] + HEX_CHARS2[h2 >>> 8 & 15] + HEX_CHARS2[h2 >>> 4 & 15] + HEX_CHARS2[h2 & 15] + HEX_CHARS2[h3 >>> 28 & 15] + HEX_CHARS2[h3 >>> 24 & 15] + HEX_CHARS2[h3 >>> 20 & 15] + HEX_CHARS2[h3 >>> 16 & 15] + HEX_CHARS2[h3 >>> 12 & 15] + HEX_CHARS2[h3 >>> 8 & 15] + HEX_CHARS2[h3 >>> 4 & 15] + HEX_CHARS2[h3 & 15] + HEX_CHARS2[h4 >>> 28 & 15] + HEX_CHARS2[h4 >>> 24 & 15] + HEX_CHARS2[h4 >>> 20 & 15] + HEX_CHARS2[h4 >>> 16 & 15] + HEX_CHARS2[h4 >>> 12 & 15] + HEX_CHARS2[h4 >>> 8 & 15] + HEX_CHARS2[h4 >>> 4 & 15] + HEX_CHARS2[h4 & 15] + HEX_CHARS2[h5 >>> 28 & 15] + HEX_CHARS2[h5 >>> 24 & 15] + HEX_CHARS2[h5 >>> 20 & 15] + HEX_CHARS2[h5 >>> 16 & 15] + HEX_CHARS2[h5 >>> 12 & 15] + HEX_CHARS2[h5 >>> 8 & 15] + HEX_CHARS2[h5 >>> 4 & 15] + HEX_CHARS2[h5 & 15] + HEX_CHARS2[h6 >>> 28 & 15] + HEX_CHARS2[h6 >>> 24 & 15] + HEX_CHARS2[h6 >>> 20 & 15] + HEX_CHARS2[h6 >>> 16 & 15] + HEX_CHARS2[h6 >>> 12 & 15] + HEX_CHARS2[h6 >>> 8 & 15] + HEX_CHARS2[h6 >>> 4 & 15] + HEX_CHARS2[h6 & 15];
  if (!this.is224) {
    hex += HEX_CHARS2[h7 >>> 28 & 15] + HEX_CHARS2[h7 >>> 24 & 15] + HEX_CHARS2[h7 >>> 20 & 15] + HEX_CHARS2[h7 >>> 16 & 15] + HEX_CHARS2[h7 >>> 12 & 15] + HEX_CHARS2[h7 >>> 8 & 15] + HEX_CHARS2[h7 >>> 4 & 15] + HEX_CHARS2[h7 & 15];
  }
  return hex;
};
Sha256.prototype.toString = Sha256.prototype.hex;
Sha256.prototype.digest = function() {
  this.finalize();
  var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3, h4 = this.h4, h5 = this.h5, h6 = this.h6, h7 = this.h7;
  var arr2 = [
    h0 >>> 24 & 255,
    h0 >>> 16 & 255,
    h0 >>> 8 & 255,
    h0 & 255,
    h1 >>> 24 & 255,
    h1 >>> 16 & 255,
    h1 >>> 8 & 255,
    h1 & 255,
    h2 >>> 24 & 255,
    h2 >>> 16 & 255,
    h2 >>> 8 & 255,
    h2 & 255,
    h3 >>> 24 & 255,
    h3 >>> 16 & 255,
    h3 >>> 8 & 255,
    h3 & 255,
    h4 >>> 24 & 255,
    h4 >>> 16 & 255,
    h4 >>> 8 & 255,
    h4 & 255,
    h5 >>> 24 & 255,
    h5 >>> 16 & 255,
    h5 >>> 8 & 255,
    h5 & 255,
    h6 >>> 24 & 255,
    h6 >>> 16 & 255,
    h6 >>> 8 & 255,
    h6 & 255
  ];
  if (!this.is224) {
    arr2.push(h7 >>> 24 & 255, h7 >>> 16 & 255, h7 >>> 8 & 255, h7 & 255);
  }
  return arr2;
};
Sha256.prototype.array = Sha256.prototype.digest;
Sha256.prototype.arrayBuffer = function() {
  this.finalize();
  var buffer = new ArrayBuffer(this.is224 ? 28 : 32);
  var dataView = new DataView(buffer);
  dataView.setUint32(0, this.h0);
  dataView.setUint32(4, this.h1);
  dataView.setUint32(8, this.h2);
  dataView.setUint32(12, this.h3);
  dataView.setUint32(16, this.h4);
  dataView.setUint32(20, this.h5);
  dataView.setUint32(24, this.h6);
  if (!this.is224) {
    dataView.setUint32(28, this.h7);
  }
  return buffer;
};

// node_modules/@langchain/core/dist/caches/base.js
init_utils2();

// node_modules/@langchain/core/dist/language_models/base.js
init_prompt_values();
init_utils2();
init_async_caller2();

// node_modules/js-tiktoken/dist/chunk-VL2OQCWN.js
var import_base64_js = __toESM(require_base64_js(), 1);
var __defProp2 = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
function bytePairMerge(piece, ranks) {
  let parts = Array.from(
    { length: piece.length },
    (_, i) => ({ start: i, end: i + 1 })
  );
  while (parts.length > 1) {
    let minRank = null;
    for (let i = 0; i < parts.length - 1; i++) {
      const slice = piece.slice(parts[i].start, parts[i + 1].end);
      const rank = ranks.get(slice.join(","));
      if (rank == null)
        continue;
      if (minRank == null || rank < minRank[0]) {
        minRank = [rank, i];
      }
    }
    if (minRank != null) {
      const i = minRank[1];
      parts[i] = { start: parts[i].start, end: parts[i + 1].end };
      parts.splice(i + 1, 1);
    } else {
      break;
    }
  }
  return parts;
}
function bytePairEncode(piece, ranks) {
  if (piece.length === 1)
    return [ranks.get(piece.join(","))];
  return bytePairMerge(piece, ranks).map((p) => ranks.get(piece.slice(p.start, p.end).join(","))).filter((x) => x != null);
}
function escapeRegex(str) {
  return str.replace(/[\\^$*+?.()|[\]{}]/g, "\\$&");
}
var _Tiktoken = class {
  /** @internal */
  specialTokens;
  /** @internal */
  inverseSpecialTokens;
  /** @internal */
  patStr;
  /** @internal */
  textEncoder = new TextEncoder();
  /** @internal */
  textDecoder = new TextDecoder("utf-8");
  /** @internal */
  rankMap = /* @__PURE__ */ new Map();
  /** @internal */
  textMap = /* @__PURE__ */ new Map();
  constructor(ranks, extendedSpecialTokens) {
    this.patStr = ranks.pat_str;
    const uncompressed = ranks.bpe_ranks.split("\n").filter(Boolean).reduce((memo, x) => {
      const [_, offsetStr, ...tokens] = x.split(" ");
      const offset = Number.parseInt(offsetStr, 10);
      tokens.forEach((token, i) => memo[token] = offset + i);
      return memo;
    }, {});
    for (const [token, rank] of Object.entries(uncompressed)) {
      const bytes = import_base64_js.default.toByteArray(token);
      this.rankMap.set(bytes.join(","), rank);
      this.textMap.set(rank, bytes);
    }
    this.specialTokens = { ...ranks.special_tokens, ...extendedSpecialTokens };
    this.inverseSpecialTokens = Object.entries(this.specialTokens).reduce((memo, [text, rank]) => {
      memo[rank] = this.textEncoder.encode(text);
      return memo;
    }, {});
  }
  encode(text, allowedSpecial = [], disallowedSpecial = "all") {
    const regexes = new RegExp(this.patStr, "ug");
    const specialRegex = _Tiktoken.specialTokenRegex(
      Object.keys(this.specialTokens)
    );
    const ret = [];
    const allowedSpecialSet = new Set(
      allowedSpecial === "all" ? Object.keys(this.specialTokens) : allowedSpecial
    );
    const disallowedSpecialSet = new Set(
      disallowedSpecial === "all" ? Object.keys(this.specialTokens).filter(
        (x) => !allowedSpecialSet.has(x)
      ) : disallowedSpecial
    );
    if (disallowedSpecialSet.size > 0) {
      const disallowedSpecialRegex = _Tiktoken.specialTokenRegex([
        ...disallowedSpecialSet
      ]);
      const specialMatch = text.match(disallowedSpecialRegex);
      if (specialMatch != null) {
        throw new Error(
          `The text contains a special token that is not allowed: ${specialMatch[0]}`
        );
      }
    }
    let start = 0;
    while (true) {
      let nextSpecial = null;
      let startFind = start;
      while (true) {
        specialRegex.lastIndex = startFind;
        nextSpecial = specialRegex.exec(text);
        if (nextSpecial == null || allowedSpecialSet.has(nextSpecial[0]))
          break;
        startFind = nextSpecial.index + 1;
      }
      const end = nextSpecial?.index ?? text.length;
      for (const match of text.substring(start, end).matchAll(regexes)) {
        const piece = this.textEncoder.encode(match[0]);
        const token2 = this.rankMap.get(piece.join(","));
        if (token2 != null) {
          ret.push(token2);
          continue;
        }
        ret.push(...bytePairEncode(piece, this.rankMap));
      }
      if (nextSpecial == null)
        break;
      let token = this.specialTokens[nextSpecial[0]];
      ret.push(token);
      start = nextSpecial.index + nextSpecial[0].length;
    }
    return ret;
  }
  decode(tokens) {
    const res = [];
    let length = 0;
    for (let i2 = 0; i2 < tokens.length; ++i2) {
      const token = tokens[i2];
      const bytes = this.textMap.get(token) ?? this.inverseSpecialTokens[token];
      if (bytes != null) {
        res.push(bytes);
        length += bytes.length;
      }
    }
    const mergedArray = new Uint8Array(length);
    let i = 0;
    for (const bytes of res) {
      mergedArray.set(bytes, i);
      i += bytes.length;
    }
    return this.textDecoder.decode(mergedArray);
  }
};
var Tiktoken = _Tiktoken;
__publicField(Tiktoken, "specialTokenRegex", (tokens) => {
  return new RegExp(tokens.map((i) => escapeRegex(i)).join("|"), "g");
});

// node_modules/@langchain/core/dist/utils/tiktoken.js
init_async_caller2();

// node_modules/@langchain/core/dist/language_models/base.js
init_base4();
var getVerbosity = () => false;
var BaseLangChain = class extends Runnable {
  get lc_attributes() {
    return {
      callbacks: void 0,
      verbose: void 0
    };
  }
  constructor(params) {
    super(params);
    Object.defineProperty(this, "verbose", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "callbacks", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "tags", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "metadata", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.verbose = params.verbose ?? getVerbosity();
    this.callbacks = params.callbacks;
    this.tags = params.tags ?? [];
    this.metadata = params.metadata ?? {};
  }
};

// node_modules/@langchain/core/dist/tools/index.js
init_config();
init_tool();
init_singletons();
init_utils();
init_zod();
init_json_schema();

// node_modules/@langchain/core/dist/tools/types.js
init_base4();
init_zod();

// node_modules/@langchain/core/dist/tools/index.js
var StructuredTool = class extends BaseLangChain {
  get lc_namespace() {
    return ["langchain", "tools"];
  }
  constructor(fields) {
    super(fields ?? {});
    Object.defineProperty(this, "returnDirect", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: false
    });
    Object.defineProperty(this, "verboseParsingErrors", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: false
    });
    Object.defineProperty(this, "responseFormat", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "content"
    });
    Object.defineProperty(this, "defaultConfig", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.verboseParsingErrors = fields?.verboseParsingErrors ?? this.verboseParsingErrors;
    this.responseFormat = fields?.responseFormat ?? this.responseFormat;
    this.defaultConfig = fields?.defaultConfig ?? this.defaultConfig;
    this.metadata = fields?.metadata ?? this.metadata;
  }
  /**
   * Invokes the tool with the provided input and configuration.
   * @param input The input for the tool.
   * @param config Optional configuration for the tool.
   * @returns A Promise that resolves with the tool's output.
   */
  async invoke(input, config) {
    let toolInput;
    let enrichedConfig = ensureConfig(mergeConfigs(this.defaultConfig, config));
    if (_isToolCall(input)) {
      toolInput = input.args;
      enrichedConfig = {
        ...enrichedConfig,
        toolCall: input
      };
    } else {
      toolInput = input;
    }
    return this.call(toolInput, enrichedConfig);
  }
  /**
   * @deprecated Use .invoke() instead. Will be removed in 0.3.0.
   *
   * Calls the tool with the provided argument, configuration, and tags. It
   * parses the input according to the schema, handles any errors, and
   * manages callbacks.
   * @param arg The input argument for the tool.
   * @param configArg Optional configuration or callbacks for the tool.
   * @param tags Optional tags for the tool.
   * @returns A Promise that resolves with a string.
   */
  async call(arg, configArg, tags) {
    const inputForValidation = _isToolCall(arg) ? arg.args : arg;
    let parsed;
    if (isInteropZodSchema(this.schema)) {
      try {
        parsed = await interopParseAsync(this.schema, inputForValidation);
      } catch (e) {
        let message = `Received tool input did not match expected schema`;
        if (this.verboseParsingErrors) {
          message = `${message}
Details: ${e.message}`;
        }
        throw new ToolInputParsingException(message, JSON.stringify(arg));
      }
    } else {
      const result2 = validate3(inputForValidation, this.schema);
      if (!result2.valid) {
        let message = `Received tool input did not match expected schema`;
        if (this.verboseParsingErrors) {
          message = `${message}
Details: ${result2.errors.map((e) => `${e.keywordLocation}: ${e.error}`).join("\n")}`;
        }
        throw new ToolInputParsingException(message, JSON.stringify(arg));
      }
      parsed = inputForValidation;
    }
    const config = parseCallbackConfigArg(configArg);
    const callbackManager_ = CallbackManager.configure(config.callbacks, this.callbacks, config.tags || tags, this.tags, config.metadata, this.metadata, { verbose: this.verbose });
    const runManager = await callbackManager_?.handleToolStart(
      this.toJSON(),
      // Log the original raw input arg
      typeof arg === "string" ? arg : JSON.stringify(arg),
      config.runId,
      void 0,
      void 0,
      void 0,
      config.runName
    );
    delete config.runId;
    let result;
    try {
      result = await this._call(parsed, runManager, config);
    } catch (e) {
      await runManager?.handleToolError(e);
      throw e;
    }
    let content;
    let artifact;
    if (this.responseFormat === "content_and_artifact") {
      if (Array.isArray(result) && result.length === 2) {
        [content, artifact] = result;
      } else {
        throw new Error(`Tool response format is "content_and_artifact" but the output was not a two-tuple.
Result: ${JSON.stringify(result)}`);
      }
    } else {
      content = result;
    }
    let toolCallId;
    if (_isToolCall(arg)) {
      toolCallId = arg.id;
    }
    if (!toolCallId && _configHasToolCallId(config)) {
      toolCallId = config.toolCall.id;
    }
    const formattedOutput = _formatToolOutput({
      content,
      artifact,
      toolCallId,
      name: this.name,
      metadata: this.metadata
    });
    await runManager?.handleToolEnd(formattedOutput);
    return formattedOutput;
  }
};
var DynamicStructuredTool = class extends StructuredTool {
  static lc_name() {
    return "DynamicStructuredTool";
  }
  constructor(fields) {
    super(fields);
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "description", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "func", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "schema", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.name = fields.name;
    this.description = fields.description;
    this.func = fields.func;
    this.returnDirect = fields.returnDirect ?? this.returnDirect;
    this.schema = fields.schema;
  }
  /**
   * @deprecated Use .invoke() instead. Will be removed in 0.3.0.
   */
  // Match the base class signature
  async call(arg, configArg, tags) {
    const config = parseCallbackConfigArg(configArg);
    if (config.runName === void 0) {
      config.runName = this.name;
    }
    return super.call(arg, config, tags);
  }
  _call(arg, runManager, parentConfig) {
    return this.func(arg, runManager, parentConfig);
  }
};
function _formatToolOutput(params) {
  const { content, artifact, toolCallId, metadata } = params;
  if (toolCallId && !isDirectToolOutput(content)) {
    if (typeof content === "string" || Array.isArray(content) && content.every((item) => typeof item === "object")) {
      return new ToolMessage({
        status: "success",
        content,
        artifact,
        tool_call_id: toolCallId,
        name: params.name,
        metadata
      });
    } else {
      return new ToolMessage({
        status: "success",
        content: _stringify(content),
        artifact,
        tool_call_id: toolCallId,
        name: params.name,
        metadata
      });
    }
  } else {
    return content;
  }
}
function _stringify(content) {
  try {
    return JSON.stringify(content, null, 2) ?? "";
  } catch (_noOp) {
    return `${content}`;
  }
}

// src/agents/tools/scrape.tool.ts
var import_zod6 = require("zod");

// src/services/scraper.service.ts
function normalizeUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname === "dl.flipkart.com") {
      const pathParts = u.pathname.replace(/^\/dl\//, "/");
      u.hostname = "www.flipkart.com";
      u.pathname = pathParts;
      const pid = u.searchParams.get("pid");
      if (pid) {
        u.search = `?pid=${pid}`;
      }
      return u.toString();
    }
    return url;
  } catch {
    return url;
  }
}
var PLATFORM_SELECTORS = {
  AMAZON: {
    title: "#productTitle",
    price: ".a-price-whole, #priceblock_ourprice, #priceblock_dealprice, .a-color-price",
    rating: "#acrPopover .a-icon-alt, .a-icon-alt",
    reviewCount: "#acrCustomerReviewText",
    seller: "#sellerProfileTriggerId, #merchant-info a",
    description: "#productDescription, #feature-bullets",
    brand: "#bylineInfo",
    image: "#landingImage, #imgBlkFront",
    reviews: '[data-hook="review"]',
    inStock: "#availability span",
    category: "#wayfinding-breadcrumbs_feature_div"
  },
  FLIPKART: {
    // Flipkart obfuscates class names — use multiple candidates and structural selectors
    title: 'span.VU-ZEz, span.B_NuCI, h1 span, .pdp-title, [class*="ProductTitle"], .G6XhRU a, h1',
    price: 'div.Nx9bqj._4b5DiR, div._30jeq3._16Jk6d, div._30jeq3, [class*="SellingPrice"], [class*="selling-price"]',
    rating: 'div.XQDdHH, div._3LWZlK, span._1lRcqv span, [class*="RatingBar"]',
    reviewCount: 'span.Wphh3N span, span._2_R_DZ span, [class*="RatingsCount"], [class*="ratings-count"]',
    seller: '#sellerName span, [class*="SellerName"] span, [class*="seller-name"]',
    description: 'div._1AN87F, div._1mXcCf, [class*="product-description"]',
    brand: 'span.G6XhRU, [class*="BrandName"]',
    image: 'img._396cs4, img._2r_T1I, img.DByuf4, [class*="ProductImage"] img, ._2_sXSF img, .CXW8mj img',
    reviews: 'div._27M-vq, div.col._2wzgFH, [class*="ReviewCard"], [class*="review-card"]',
    inStock: '._16FRp0, [class*="NotAvailable"]',
    category: '._1MR4o5, [class*="breadcrumb"]'
  },
  MYNTRA: {
    title: ".pdp-name, .pdp-title, h1.pdp-name",
    price: ".pdp-price strong, .pdp-discount-container .pdp-price",
    rating: ".index-overallRating div:first-child",
    reviewCount: ".index-ratingsCount",
    description: ".pdp-product-description-content",
    image: ".image-grid-image img, .image-grid-image",
    reviews: ".user-review",
    inStock: ".pdp-add-to-bag"
  },
  MEESHO: {
    title: '[class*="ProductTitle"], h1',
    price: '[class*="StyledPrice"], [class*="ProductPrice"], [class*="selling-price"]',
    rating: '[class*="RatingStars"]',
    reviewCount: '[class*="ReviewCount"]',
    image: '[class*="ProductImage"] img',
    reviews: '[class*="ReviewCard"]'
  },
  SNAPDEAL: {
    title: ".pdp-e-i-head, h1",
    price: ".payBlkBig, .pdp-final-price span",
    rating: ".avrg-rating",
    reviewCount: ".numbr-overwrap",
    seller: ".seller-info-name",
    image: "#bx-slider-left-image-panel img, .cloudzoom",
    reviews: ".reviewBox",
    description: ".detailsSubHdng + div"
  },
  NYKAA: {
    title: ".css-xjhr9g, h1.css-1gc4x7i, h1",
    price: '.css-1jczs19, .css-17ctnp, [class*="price"]',
    rating: ".css-1t5gbfz",
    reviewCount: ".css-19srwpo",
    image: '.css-1rzg3mz img, [class*="product-image"] img',
    reviews: ".css-1d6w6if"
  }
};
async function scrapeProductPage(url, platform) {
  let browser = null;
  const normalizedUrl = normalizeUrl(url);
  if (normalizedUrl !== url) {
    logger.info(`\u{1F517} Normalized URL: ${url} \u2192 ${normalizedUrl}`);
  }
  try {
    const { chromium } = await import("playwright");
    browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu"
      ]
    });
    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      viewport: { width: 1366, height: 768 },
      locale: "en-IN"
    });
    const page = await context.newPage();
    page.setDefaultTimeout(env.SCRAPER_TIMEOUT_MS);
    await page.goto(normalizedUrl, {
      waitUntil: "domcontentloaded",
      timeout: env.SCRAPER_TIMEOUT_MS
    });
    await page.waitForTimeout(3e3);
    const jsonLd = await extractJsonLd(page);
    const metaData = await extractMetaTags(page);
    const selectors = PLATFORM_SELECTORS[platform] || PLATFORM_SELECTORS.AMAZON;
    const cssData = await extractViaCss(page, selectors);
    const pageTitle = await page.title();
    const rawProductName = jsonLd?.name || cssData.product_name || metaData.title || cleanPageTitle(pageTitle, platform) || "Unknown Product";
    const productName = deduplicateProductName(rawProductName);
    const price = jsonLd?.price || parsePrice(cssData.price_text) || metaData.price || 0;
    const rating = jsonLd?.rating || parseRating(cssData.rating_text) || 0;
    const reviewCount = jsonLd?.reviewCount || parseNumber(cssData.review_count_text) || 0;
    const productImage = jsonLd?.image || cssData.image || metaData.image || "";
    const sellerName = cssData.seller_name || jsonLd?.seller || "Unknown Seller";
    const brand = jsonLd?.brand || cssData.brand || "";
    const description = cssData.description || metaData.description || jsonLd?.description || "";
    const reviews = await extractReviews(page, platform, selectors);
    logger.info(`\u{1F4E6} Extraction layers \u2014 JSON-LD: ${!!jsonLd?.name}, Meta: ${!!metaData.title}, CSS: ${!!cssData.product_name}, Title: ${!!pageTitle}`);
    await browser.close();
    return {
      product_name: productName,
      brand,
      price,
      currency: "INR",
      rating,
      review_count: reviewCount,
      seller_name: sellerName,
      seller_rating: void 0,
      seller_review_count: void 0,
      images: productImage ? [productImage] : [],
      description,
      category: cssData.category || "",
      in_stock: !cssData.in_stock_text?.toLowerCase().includes("unavailable"),
      platform,
      scraped_at: (/* @__PURE__ */ new Date()).toISOString(),
      raw_reviews: reviews
    };
  } catch (error) {
    if (browser) {
      try {
        await browser.close();
      } catch {
      }
    }
    logger.error(`Scraping failed for ${normalizedUrl}:`, error);
    throw new ScrapingError(
      `Failed to scrape product page: ${error.message || "Unknown error"}`
    );
  }
}
async function extractJsonLd(page) {
  try {
    const data = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      for (const script of scripts) {
        try {
          const json = JSON.parse(script.textContent || "");
          const items = Array.isArray(json) ? json : [json];
          for (const item of items) {
            if (item["@type"] === "Product" || item["@type"]?.includes?.("Product")) {
              return item;
            }
            if (item["@graph"]) {
              for (const g of item["@graph"]) {
                if (g["@type"] === "Product" || g["@type"]?.includes?.("Product")) {
                  return g;
                }
              }
            }
          }
        } catch {
        }
      }
      return null;
    });
    if (!data) return null;
    const price = data.offers?.price || data.offers?.lowPrice || data.offers?.highPrice || Array.isArray(data.offers) && data.offers[0]?.price || 0;
    const image = typeof data.image === "string" ? data.image : Array.isArray(data.image) ? data.image[0] : data.image?.url || "";
    const rating = data.aggregateRating?.ratingValue ? parseFloat(data.aggregateRating.ratingValue) : 0;
    const reviewCount = data.aggregateRating?.reviewCount ? parseInt(data.aggregateRating.reviewCount) : data.aggregateRating?.ratingCount ? parseInt(data.aggregateRating.ratingCount) : 0;
    const seller = data.offers?.seller?.name || Array.isArray(data.offers) && data.offers[0]?.seller?.name || "";
    logger.info(`\u{1F4CB} JSON-LD found: "${data.name}" | \u20B9${price} | \u2B50${rating} | ${reviewCount} reviews`);
    return {
      name: data.name || "",
      price: parseFloat(String(price)) || 0,
      image,
      brand: typeof data.brand === "string" ? data.brand : data.brand?.name || "",
      rating,
      reviewCount,
      seller,
      description: data.description || ""
    };
  } catch (error) {
    logger.warn("JSON-LD extraction failed:", error);
    return null;
  }
}
async function extractMetaTags(page) {
  try {
    return await page.evaluate(() => {
      const getMeta = (names) => {
        for (const name of names) {
          const el = document.querySelector(`meta[property="${name}"]`) || document.querySelector(`meta[name="${name}"]`);
          if (el) {
            const content = el.getAttribute("content")?.trim();
            if (content) return content;
          }
        }
        return "";
      };
      const title = getMeta(["og:title", "twitter:title"]);
      const description = getMeta(["og:description", "twitter:description", "description"]);
      const image = getMeta(["og:image", "twitter:image"]);
      const priceText = getMeta(["product:price:amount", "og:price:amount", "twitter:data1"]);
      return {
        title,
        description,
        image,
        price: parseFloat(priceText.replace(/[^0-9.]/g, "")) || 0
      };
    });
  } catch (error) {
    logger.warn("Meta tag extraction failed:", error);
    return { title: "", description: "", image: "", price: 0 };
  }
}
async function extractViaCss(page, selectors) {
  try {
    return await page.evaluate((sel) => {
      const getText = (selector) => {
        if (!selector) return "";
        const candidates = selector.split(",").map((s) => s.trim());
        for (const s of candidates) {
          try {
            const el = document.querySelector(s);
            if (el) {
              const text = (el.textContent || "").trim();
              if (text) return text;
            }
          } catch {
          }
        }
        return "";
      };
      const getImage = (selector) => {
        if (!selector) return "";
        const candidates = selector.split(",").map((s) => s.trim());
        for (const s of candidates) {
          try {
            const el = document.querySelector(s);
            if (el) return el.src || el.getAttribute("data-src") || el.getAttribute("data-srcset")?.split(" ")[0] || "";
          } catch {
          }
        }
        return "";
      };
      return {
        product_name: getText(sel.title || ""),
        price_text: getText(sel.price || ""),
        rating_text: getText(sel.rating || ""),
        review_count_text: getText(sel.reviewCount || ""),
        seller_name: getText(sel.seller || ""),
        description: getText(sel.description || ""),
        brand: getText(sel.brand || ""),
        image: getImage(sel.image || ""),
        in_stock_text: getText(sel.inStock || ""),
        category: getText(sel.category || "")
      };
    }, selectors);
  } catch (error) {
    logger.warn("CSS extraction failed:", error);
    return {};
  }
}
async function extractReviews(page, platform, selectors) {
  try {
    const reviewSelector = selectors.reviews;
    if (!reviewSelector) return [];
    await page.evaluate(() => window.scrollBy(0, 2e3));
    await page.waitForTimeout(1e3);
    const reviewElements = await page.$$(reviewSelector);
    if (reviewElements.length === 0) {
      logger.info(`\u2139\uFE0F No review elements found with selector: ${reviewSelector}`);
      return [];
    }
    const reviews = [];
    for (const el of reviewElements.slice(0, 50)) {
      try {
        const review = await el.evaluate(
          (node, plat) => {
            const getText = (sel) => {
              const el2 = node.querySelector(sel);
              return el2 ? (el2.textContent || "").trim() : "";
            };
            let author = "";
            let rating = 0;
            let title = "";
            let body = "";
            let date2 = "";
            let verified = false;
            let helpful = 0;
            if (plat === "AMAZON") {
              author = getText(".a-profile-name");
              const ratingText = getText(".a-icon-alt");
              rating = parseFloat(ratingText) || 0;
              title = getText('[data-hook="review-title"] span');
              body = getText('[data-hook="review-body"] span');
              date2 = getText('[data-hook="review-date"]');
              verified = !!node.querySelector('[data-hook="avp-badge"]');
              const helpfulText = getText('[data-hook="helpful-vote-statement"]');
              helpful = parseInt(helpfulText) || 0;
            } else if (plat === "FLIPKART") {
              author = getText("._2V5EHH") || getText('[class*="UserName"]') || getText("p:last-child");
              const ratingEl = node.querySelector("._3LWZlK") || node.querySelector('[class*="RatingBar"]') || node.querySelector("div > div:first-child");
              rating = ratingEl ? parseFloat(ratingEl.textContent || "0") : 0;
              title = getText(".t-ZTKy p:first-child") || getText("._2-N8zT") || getText('[class*="ReviewTitle"]');
              body = getText(".t-ZTKy") || getText(".qwjRop div") || getText('[class*="ReviewText"]') || (node.textContent || "").substring(0, 500);
              date2 = getText("._2sc7ZR") || getText(".rgkKRe") || getText('[class*="Date"]');
              verified = !!node.querySelector("._2mcZGG") || !!node.querySelector('[class*="Verified"]');
            } else {
              body = (node.textContent || "").trim().substring(0, 500);
            }
            return { author, rating, title, body, date: date2, verified, helpful };
          },
          platform
        );
        if (review.body || review.title) {
          reviews.push({
            author: review.author || "Anonymous",
            rating: review.rating,
            title: review.title,
            body: review.body,
            date: review.date,
            verified_purchase: review.verified,
            helpful_votes: review.helpful,
            images: []
          });
        }
      } catch {
      }
    }
    logger.info(`\u{1F4DD} Extracted ${reviews.length} reviews from page`);
    return reviews;
  } catch (error) {
    logger.warn("Review extraction failed:", error);
    return [];
  }
}
function deduplicateProductName(name) {
  if (!name) return name;
  const separators = ["  - ", " - ", " | ", " \u2013 ", " \u2014 "];
  for (const sep of separators) {
    const idx = name.indexOf(sep);
    if (idx > 0) {
      const left = name.substring(0, idx).trim();
      const right = name.substring(idx + sep.length).trim();
      if (left === right) return left;
      if (left.includes(right)) return left;
      if (right.includes(left)) return right;
    }
  }
  return name.trim();
}
function cleanPageTitle(title, platform) {
  if (!title) return "";
  let cleaned = title.replace(/\s*[-|–—]\s*(Amazon\.in|Flipkart\.com|Flipkart|Myntra|Meesho|Snapdeal|Nykaa|Online Shopping|Buy Online).*/gi, "").replace(/^Buy\s+/i, "").replace(/\s*\(.*?\)\s*$/, "").trim();
  return cleaned || title.trim();
}
function parsePrice(text) {
  if (!text) return 0;
  const withoutCurrency = text.replace(/rs\.?/i, "").replace(/inr/i, "");
  const cleaned = withoutCurrency.replace(/[₹,\s]/g, "").replace(/[^0-9.]/g, "");
  return parseFloat(cleaned) || 0;
}
function parseRating(text) {
  if (!text) return 0;
  const match = text.match(/(\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : 0;
}
function parseNumber(text) {
  if (!text) return 0;
  const cleaned = text.replace(/[,\s]/g, "");
  const match = cleaned.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

// src/utils/platformDetector.ts
var PLATFORM_PATTERNS = [
  {
    platform: "AMAZON",
    hostnames: ["amazon.in", "www.amazon.in", "amzn.in", "amzn.to"]
  },
  {
    platform: "FLIPKART",
    hostnames: ["flipkart.com", "www.flipkart.com", "dl.flipkart.com"]
  },
  {
    platform: "MYNTRA",
    hostnames: ["myntra.com", "www.myntra.com"]
  },
  {
    platform: "MEESHO",
    hostnames: ["meesho.com", "www.meesho.com"]
  },
  {
    platform: "SNAPDEAL",
    hostnames: ["snapdeal.com", "www.snapdeal.com"]
  },
  {
    platform: "NYKAA",
    hostnames: ["nykaa.com", "www.nykaa.com", "nykaafashion.com", "www.nykaafashion.com"]
  },
  {
    platform: "AJIO",
    hostnames: ["ajio.com", "www.ajio.com"]
  }
];
function detectPlatform(url) {
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    return {
      platform: "UNKNOWN",
      hostname: "",
      isValid: false,
      error: "Invalid URL format. Please provide a valid product URL."
    };
  }
  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return {
      platform: "UNKNOWN",
      hostname: parsedUrl.hostname,
      isValid: false,
      error: "URL must use HTTP or HTTPS protocol."
    };
  }
  const hostname = parsedUrl.hostname.toLowerCase();
  for (const entry of PLATFORM_PATTERNS) {
    if (entry.hostnames.includes(hostname)) {
      return {
        platform: entry.platform,
        hostname,
        isValid: true
      };
    }
  }
  return {
    platform: "UNKNOWN",
    hostname,
    isValid: false,
    error: `Unsupported platform: ${hostname}. Supported platforms: Amazon.in, Flipkart, Myntra, Meesho, Snapdeal, Nykaa, Ajio.`
  };
}
function buildSearchUrl(platform, query) {
  const encoded = encodeURIComponent(query);
  const searchUrls = {
    AMAZON: `https://www.amazon.in/s?k=${encoded}`,
    FLIPKART: `https://www.flipkart.com/search?q=${encoded}`,
    MYNTRA: `https://www.myntra.com/${encoded}`,
    MEESHO: `https://www.meesho.com/search?q=${encoded}`,
    SNAPDEAL: `https://www.snapdeal.com/search?keyword=${encoded}`,
    NYKAA: `https://www.nykaa.com/search/result/?q=${encoded}`,
    AJIO: `https://www.ajio.com/search/?text=${encoded}`
  };
  return searchUrls[platform] || `https://www.google.com/search?q=${encoded}+buy+online`;
}

// src/agents/tools/scrape.tool.ts
var scrapeProductTool = new DynamicStructuredTool({
  name: "scrape_product_page",
  description: "Scrapes a product listing page from an Indian e-commerce site and returns structured product data including name, price, rating, seller info, and raw reviews.",
  schema: import_zod6.z.object({
    url: import_zod6.z.string().describe("The full product URL to scrape")
  }),
  func: async ({ url }) => {
    try {
      logger.info(`\u{1F50D} Scraping product page: ${url}`);
      const detection = detectPlatform(url);
      if (!detection.isValid) {
        return JSON.stringify({
          error: true,
          message: detection.error || "Unsupported platform"
        });
      }
      const product = await scrapeProductPage(url, detection.platform);
      logger.info(
        `\u2705 Scraped: ${product.product_name} | \u20B9${product.price} | ${product.raw_reviews.length} reviews`
      );
      return JSON.stringify(product);
    } catch (error) {
      logger.error("Scrape tool error:", error);
      return JSON.stringify({
        error: true,
        message: error.message || "Failed to scrape product page"
      });
    }
  }
});

// src/agents/tools/review-analyzer.tool.ts
var import_zod7 = require("zod");

// src/services/review.service.ts
var INCENTIVIZED_PATTERNS = [
  /free.*in.*exchange.*review/i,
  /received.*for.*honest.*review/i,
  /got.*this.*at.*a.*discount/i,
  /provided.*free.*for.*testing/i,
  /amazing product.*shipping.*great.*quality/i,
  /\b(excellent|superb|outstanding)\b.*\b(product|quality|packaging)\b.*\b(highly recommend|must buy)\b/i,
  /i received this product/i,
  /i got this for free/i,
  /discount.*review/i,
  /sample.*product/i
];
async function analyzeReviews(reviews, productName, metadata) {
  if (reviews.length === 0) {
    const metaReviewCount = metadata?.review_count || 0;
    const metaAvgRating = metadata?.avg_rating || 0;
    return {
      total_reviews: metaReviewCount,
      fake_count: 0,
      real_count: metaReviewCount,
      fake_percentage: 0,
      avg_rating: metaAvgRating,
      adjusted_rating: metaAvgRating,
      rating_distribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
      suspicious_patterns: metaReviewCount > 0 ? ["Individual reviews could not be extracted \u2014 analysis based on platform-reported aggregate data only"] : [],
      sentiment_summary: metaReviewCount > 0 ? `Platform reports ${metaReviewCount} reviews with an average rating of ${metaAvgRating}/5. Individual reviews were not available for deeper analysis.` : "No reviews available for analysis.",
      confidence: metaReviewCount > 0 ? 0.3 : 0
    };
  }
  const suspiciousPatterns = [];
  const reviewFlags = /* @__PURE__ */ new Map();
  reviews.forEach((_, i) => reviewFlags.set(i, /* @__PURE__ */ new Set()));
  const burstResult = detectReviewBurst(reviews);
  if (burstResult.detected) {
    suspiciousPatterns.push(
      `Review burst detected: ${burstResult.burstCount} reviews in a 7-day window (${burstResult.burstPercentage.toFixed(0)}% of total)`
    );
    burstResult.flaggedIndices.forEach((i) => reviewFlags.get(i)?.add("burst"));
  }
  const similarityResult = detectTextSimilarity(reviews);
  if (similarityResult.detected) {
    suspiciousPatterns.push(
      `${similarityResult.clusters} clusters of near-identical reviews found`
    );
    similarityResult.flaggedIndices.forEach((i) => reviewFlags.get(i)?.add("similarity"));
  }
  const unverifiedResult = checkUnverifiedRatio(reviews);
  if (unverifiedResult.flagged) {
    suspiciousPatterns.push(
      `High unverified purchase ratio: ${unverifiedResult.ratio.toFixed(0)}% of reviews are not verified purchases`
    );
  }
  const incentivizedResult = detectIncentivizedLanguage(reviews);
  if (incentivizedResult.detected) {
    suspiciousPatterns.push(
      `${incentivizedResult.count} reviews contain incentivized/promotional language`
    );
    incentivizedResult.flaggedIndices.forEach((i) => reviewFlags.get(i)?.add("incentivized"));
  }
  const ratingDist = computeRatingDistribution(reviews);
  const distributionAnomaly = checkRatingDistributionAnomaly(ratingDist, reviews.length);
  if (distributionAnomaly.flagged) {
    suspiciousPatterns.push(
      `Polarized rating distribution: ${distributionAnomaly.fiveStarPct.toFixed(0)}% 5-star and ${distributionAnomaly.oneStarPct.toFixed(0)}% 1-star reviews`
    );
  }
  const profileResult = checkReviewerProfiles(reviews);
  if (profileResult.detected) {
    suspiciousPatterns.push(
      `${profileResult.count} reviewers show suspicious profile patterns (single-review accounts, duplicates)`
    );
    profileResult.flaggedIndices.forEach((i) => reviewFlags.get(i)?.add("profile"));
  }
  const genericResult = detectGenericLanguage(reviews);
  if (genericResult.detected) {
    suspiciousPatterns.push(
      `${genericResult.percentage.toFixed(0)}% of reviews are very short or generic (<15 words)`
    );
    genericResult.flaggedIndices.forEach((i) => reviewFlags.get(i)?.add("generic"));
  }
  const aiPatternResult = detectAIPatterns(reviews);
  if (aiPatternResult.detected) {
    suspiciousPatterns.push(
      `${aiPatternResult.count} reviews show AI-generated text patterns`
    );
    aiPatternResult.flaggedIndices.forEach((i) => reviewFlags.get(i)?.add("ai_generated"));
  }
  const fakeCount = [...reviewFlags.entries()].filter(
    ([_, flags]) => flags.size >= 2
  ).length;
  const realCount = reviews.length - fakeCount;
  const fakePercentage = fakeCount / reviews.length * 100;
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const realReviews = reviews.filter(
    (_, i) => (reviewFlags.get(i)?.size || 0) < 2
  );
  const adjustedRating = realReviews.length > 0 ? realReviews.reduce((sum, r) => sum + r.rating, 0) / realReviews.length : avgRating;
  const confidence = Math.min(1, reviews.length / 50) * 0.8 + 0.2;
  let sentimentSummary;
  try {
    sentimentSummary = await generateSentimentSummary(productName, {
      totalReviews: reviews.length,
      fakePercentage,
      avgRating,
      adjustedRating,
      suspiciousPatterns
    });
  } catch {
    sentimentSummary = `Analyzed ${reviews.length} reviews. ${fakePercentage.toFixed(0)}% flagged as potentially fake. Adjusted rating: ${adjustedRating.toFixed(1)}/5.`;
  }
  return {
    total_reviews: reviews.length,
    fake_count: fakeCount,
    real_count: realCount,
    fake_percentage: fakePercentage,
    avg_rating: Math.round(avgRating * 10) / 10,
    adjusted_rating: Math.round(adjustedRating * 10) / 10,
    rating_distribution: ratingDist,
    suspicious_patterns: suspiciousPatterns,
    sentiment_summary: sentimentSummary,
    confidence
  };
}
function detectReviewBurst(reviews) {
  const dated = reviews.map((r, i) => ({ date: parseDate(r.date), index: i })).filter((r) => r.date !== null).sort((a, b) => a.date.getTime() - b.date.getTime());
  if (dated.length < 5) return { detected: false, burstCount: 0, burstPercentage: 0, flaggedIndices: [] };
  const WINDOW_MS = 7 * 24 * 60 * 60 * 1e3;
  let maxBurstCount = 0;
  let burstIndices = [];
  for (let i = 0; i < dated.length; i++) {
    const windowEnd = dated[i].date.getTime() + WINDOW_MS;
    const inWindow = dated.filter((d) => d.date.getTime() >= dated[i].date.getTime() && d.date.getTime() <= windowEnd);
    if (inWindow.length > maxBurstCount) {
      maxBurstCount = inWindow.length;
      burstIndices = inWindow.map((d) => d.index);
    }
  }
  const burstPercentage = maxBurstCount / reviews.length * 100;
  const detected = burstPercentage > 40;
  return { detected, burstCount: maxBurstCount, burstPercentage, flaggedIndices: detected ? burstIndices : [] };
}
function detectTextSimilarity(reviews) {
  const flagged = /* @__PURE__ */ new Set();
  let clusters = 0;
  for (let i = 0; i < reviews.length; i++) {
    for (let j = i + 1; j < reviews.length; j++) {
      const textA = (reviews[i].body || "").toLowerCase().trim();
      const textB = (reviews[j].body || "").toLowerCase().trim();
      if (textA.length < 10 || textB.length < 10) continue;
      const similarity = computeJaccardSimilarity(textA, textB);
      if (similarity > 0.7) {
        flagged.add(i);
        flagged.add(j);
        clusters++;
      }
    }
  }
  return {
    detected: clusters > 0,
    clusters,
    flaggedIndices: [...flagged]
  };
}
function checkUnverifiedRatio(reviews) {
  const unverified = reviews.filter((r) => !r.verified_purchase).length;
  const ratio = unverified / reviews.length * 100;
  return { flagged: ratio > 60, ratio };
}
function detectIncentivizedLanguage(reviews) {
  const flagged = [];
  reviews.forEach((r, i) => {
    const text = `${r.title} ${r.body}`;
    for (const pattern of INCENTIVIZED_PATTERNS) {
      if (pattern.test(text)) {
        flagged.push(i);
        break;
      }
    }
  });
  return {
    detected: flagged.length > 0,
    count: flagged.length,
    flaggedIndices: flagged
  };
}
function computeRatingDistribution(reviews) {
  const dist = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
  reviews.forEach((r) => {
    const key = String(Math.max(1, Math.min(5, Math.round(r.rating))));
    dist[key] = (dist[key] || 0) + 1;
  });
  return dist;
}
function checkRatingDistributionAnomaly(dist, total) {
  if (total === 0) return { flagged: false, fiveStarPct: 0, oneStarPct: 0 };
  const fiveStarPct = (dist["5"] || 0) / total * 100;
  const oneStarPct = (dist["1"] || 0) / total * 100;
  return {
    flagged: fiveStarPct + oneStarPct > 80,
    fiveStarPct,
    oneStarPct
  };
}
function checkReviewerProfiles(reviews) {
  const authorCounts = /* @__PURE__ */ new Map();
  reviews.forEach((r, i) => {
    const author = (r.author || "").toLowerCase().trim();
    if (author && author !== "anonymous") {
      const existing = authorCounts.get(author) || [];
      existing.push(i);
      authorCounts.set(author, existing);
    }
  });
  const flagged = [];
  authorCounts.forEach((indices) => {
    if (indices.length >= 2) {
      indices.forEach((i) => flagged.push(i));
    }
  });
  return {
    detected: flagged.length > 0,
    count: flagged.length,
    flaggedIndices: flagged
  };
}
function detectGenericLanguage(reviews) {
  const flagged = [];
  reviews.forEach((r, i) => {
    const text = (r.body || "").trim();
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    if (wordCount < 15 && wordCount > 0) {
      flagged.push(i);
    }
  });
  const percentage = flagged.length / reviews.length * 100;
  return {
    detected: percentage > 30,
    percentage,
    flaggedIndices: percentage > 30 ? flagged : []
  };
}
function detectAIPatterns(reviews) {
  const fillerPhrases = [
    "in conclusion",
    "it is worth noting",
    "i would like to mention",
    "all in all",
    "to summarize",
    "having said that",
    "needless to say",
    "it goes without saying",
    "in my honest opinion",
    "from my perspective"
  ];
  const flagged = [];
  reviews.forEach((r, i) => {
    const text = (r.body || "").toLowerCase();
    let fillerCount = 0;
    fillerPhrases.forEach((phrase) => {
      if (text.includes(phrase)) fillerCount++;
    });
    if (fillerCount >= 2) {
      flagged.push(i);
    }
  });
  return {
    detected: flagged.length > 0,
    count: flagged.length,
    flaggedIndices: flagged
  };
}
function parseDate(dateStr) {
  if (!dateStr) return null;
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) return parsed;
  const match = dateStr.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
  if (match) {
    return /* @__PURE__ */ new Date(`${match[2]} ${match[1]}, ${match[3]}`);
  }
  return null;
}
function computeJaccardSimilarity(textA, textB) {
  const wordsA = new Set(textA.split(/\s+/).filter((w) => w.length > 3));
  const wordsB = new Set(textB.split(/\s+/).filter((w) => w.length > 3));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let intersection = 0;
  wordsA.forEach((word) => {
    if (wordsB.has(word)) intersection++;
  });
  const union = wordsA.size + wordsB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

// src/agents/tools/review-analyzer.tool.ts
var reviewAnalyzerTool = new DynamicStructuredTool({
  name: "analyze_reviews",
  description: "Analyzes product reviews for authenticity, detects fake reviews using heuristic + AI signals, and returns trust metrics including fake review percentage, adjusted rating, and suspicious patterns.",
  schema: import_zod7.z.object({
    reviews: import_zod7.z.array(
      import_zod7.z.object({
        author: import_zod7.z.string(),
        rating: import_zod7.z.number(),
        title: import_zod7.z.string(),
        body: import_zod7.z.string(),
        date: import_zod7.z.string(),
        verified_purchase: import_zod7.z.boolean(),
        helpful_votes: import_zod7.z.number(),
        images: import_zod7.z.array(import_zod7.z.string())
      })
    ).describe("Array of raw review objects from the product page"),
    product_name: import_zod7.z.string().describe("Name of the product being analyzed"),
    metadata_review_count: import_zod7.z.number().optional().describe("Aggregate review count from page metadata (JSON-LD)"),
    metadata_avg_rating: import_zod7.z.number().optional().describe("Aggregate avg rating from page metadata (JSON-LD)")
  }),
  func: async ({ reviews, product_name, metadata_review_count, metadata_avg_rating }) => {
    try {
      logger.info(`\u{1F4CA} Analyzing ${reviews.length} reviews for: ${product_name}`);
      const result = await analyzeReviews(reviews, product_name, {
        review_count: metadata_review_count,
        avg_rating: metadata_avg_rating
      });
      logger.info(
        `\u2705 Review analysis complete: ${result.fake_percentage.toFixed(1)}% fake, adjusted rating: ${result.adjusted_rating}/5`
      );
      return JSON.stringify(result);
    } catch (error) {
      logger.error("Review analyzer tool error:", error);
      return JSON.stringify({
        error: true,
        message: error.message || "Failed to analyze reviews"
      });
    }
  }
});

// src/agents/tools/price-fetcher.tool.ts
var import_zod8 = require("zod");

// src/services/price.service.ts
var crypto4 = __toESM(require("crypto"));
var PLATFORMS_TO_CHECK = [
  "AMAZON",
  "FLIPKART",
  "SNAPDEAL"
];
async function fetchPriceComparisons(productName, brand, currentPlatform, currentPrice) {
  const redis2 = getRedisClient();
  const cacheKey = `price:cache:${hashString(`${brand} ${productName}`)}`;
  const cached = await redis2.get(cacheKey);
  if (cached) {
    logger.info("Price comparison cache hit");
    return JSON.parse(cached);
  }
  const searchQuery = productName.trim();
  const comparisons = [];
  comparisons.push({
    platform: currentPlatform,
    price: currentPrice,
    currency: "INR",
    url: "",
    in_stock: true,
    last_updated: (/* @__PURE__ */ new Date()).toISOString()
  });
  const isUnknown = !productName || productName === "Unknown Product" || productName.length < 3;
  if (isUnknown) {
    logger.warn("\u26A0\uFE0F Skipping price comparison \u2014 product name is unknown or too short");
    return {
      comparisons,
      best_price_platform: currentPlatform,
      best_price: currentPrice,
      original_price: currentPrice,
      savings_amount: 0,
      savings_percentage: 0
    };
  }
  const otherPlatforms = PLATFORMS_TO_CHECK.filter((p) => p !== currentPlatform);
  const searchPromises = otherPlatforms.map(async (platform) => {
    try {
      const pricePoint = await searchPlatformPrice(platform, searchQuery);
      if (pricePoint) {
        comparisons.push(pricePoint);
      }
    } catch (error) {
      logger.warn(`Price fetch failed for ${platform}:`, error);
    }
  });
  await Promise.all(searchPromises);
  const validPrices = comparisons.filter((c) => c.price > 0 && c.in_stock);
  const bestPrice = validPrices.length > 0 ? validPrices.reduce((min, c) => c.price < min.price ? c : min) : comparisons[0];
  const result = {
    comparisons,
    best_price_platform: bestPrice?.platform || currentPlatform,
    best_price: bestPrice?.price || currentPrice,
    original_price: currentPrice,
    savings_amount: Math.max(0, currentPrice - (bestPrice?.price || currentPrice)),
    savings_percentage: currentPrice > 0 ? Math.max(0, (currentPrice - (bestPrice?.price || currentPrice)) / currentPrice * 100) : 0
  };
  await redis2.setex(cacheKey, 7200, JSON.stringify(result));
  return result;
}
async function searchPlatformPrice(platform, searchQuery) {
  let browser = null;
  try {
    const { chromium } = await import("playwright");
    browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-blink-features=AutomationControlled"
      ]
    });
    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      viewport: { width: 1366, height: 768 },
      extraHTTPHeaders: {
        "Accept-Language": "en-IN,en-GB;q=0.9,en;q=0.8",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Upgrade-Insecure-Requests": "1"
      }
    });
    const page = await context.newPage();
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", {
        get: () => void 0
      });
    });
    const searchUrl = buildSearchUrl(platform, searchQuery);
    await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 15e3 });
    await page.waitForTimeout(2e3);
    const result = await extractSearchResult(page, platform);
    if (result && result.price > 0) {
      return {
        platform,
        price: result.price,
        currency: "INR",
        url: result.url || searchUrl,
        in_stock: true,
        seller_name: result.seller,
        last_updated: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    return null;
  } catch (error) {
    logger.warn(`Search on ${platform} failed:`, error);
    return null;
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        logger.error(`Failed to close browser for ${platform}:`, closeError);
      }
    }
  }
}
async function extractSearchResult(page, platform) {
  try {
    return await page.evaluate((plat) => {
      const config = {
        AMAZON: {
          container: '[data-component-type="s-search-result"], .s-result-item',
          price: ".a-price-whole, .a-offscreen",
          link: "h2 a, .a-link-normal"
        },
        FLIPKART: {
          container: "div.CGtC98, div._757ZBr, div._1sdMkc, div[data-id], ._1AtVb7",
          price: ".Nx9bqj, ._30jeq3",
          link: 'a.CGtC98, a._1fQZEK, a[href*="/p/"]'
        },
        SNAPDEAL: {
          container: '.product-tuple-listing, .fav-tuple, [class*="product-tuple"]',
          price: ".product-price, .lfloat.product-price",
          link: 'a.dp-trigger, a[href*="/product/"]'
        },
        MEESHO: {
          container: '[class*="ProductCard"], a[href*="/product/"]',
          price: '[class*="Price"]',
          link: "a"
        },
        MYNTRA: {
          container: ".product-base",
          price: ".product-discountedPrice, .product-price",
          link: "a"
        },
        NYKAA: {
          container: '.css-qlopj4, [class*="product-card"]',
          price: ".css-111z9ua, .css-17ctnp",
          link: "a"
        }
      };
      const sel = config[plat] || config.AMAZON;
      const containers = Array.from(document.querySelectorAll(sel.container));
      for (const container of containers) {
        const priceEl2 = container.querySelector(sel.price);
        const linkEl2 = container.querySelector(sel.link);
        if (priceEl2 && linkEl2) {
          let priceText = priceEl2.textContent?.trim() || "";
          priceText = priceText.replace(/rs\.?/i, "").replace(/inr/i, "");
          priceText = priceText.replace(/[₹,\s]/g, "").replace(/[^0-9.]/g, "");
          const price = parseFloat(priceText) || 0;
          const url = linkEl2.href || "";
          if (price > 0 && url) {
            return {
              price,
              url
            };
          }
        }
      }
      const priceEl = document.querySelector(sel.price);
      const linkEl = document.querySelector(sel.link);
      if (priceEl && linkEl) {
        let priceText = priceEl.textContent?.trim() || "";
        priceText = priceText.replace(/rs\.?/i, "").replace(/inr/i, "");
        priceText = priceText.replace(/[₹,\s]/g, "").replace(/[^0-9.]/g, "");
        const price = parseFloat(priceText) || 0;
        const url = linkEl.href || "";
        if (price > 0 && url) {
          return { price, url };
        }
      }
      return null;
    }, platform);
  } catch {
    return null;
  }
}
function hashString(str) {
  return crypto4.createHash("md5").update(str.toLowerCase()).digest("hex");
}

// src/agents/tools/price-fetcher.tool.ts
var priceFetcherTool = new DynamicStructuredTool({
  name: "fetch_price_comparisons",
  description: "Searches for the same product on other Indian e-commerce platforms (Amazon, Flipkart, Snapdeal, Meesho, Myntra, Nykaa) and returns current prices to find the best deal.",
  schema: import_zod8.z.object({
    product_name: import_zod8.z.string().describe("Name of the product"),
    brand: import_zod8.z.string().describe("Brand name of the product"),
    current_platform: import_zod8.z.string().describe("Platform the product was originally found on"),
    current_price: import_zod8.z.number().describe("Current price on the original platform")
  }),
  func: async ({ product_name, brand, current_platform, current_price }) => {
    try {
      logger.info(`\u{1F4B0} Fetching price comparisons for: ${brand} ${product_name}`);
      const result = await fetchPriceComparisons(
        product_name,
        brand,
        current_platform,
        current_price
      );
      logger.info(
        `\u2705 Found ${result.comparisons.length} price points. Best: \u20B9${result.best_price} on ${result.best_price_platform}`
      );
      return JSON.stringify(result);
    } catch (error) {
      logger.error("Price fetcher tool error:", error);
      return JSON.stringify({
        error: true,
        message: error.message || "Failed to fetch prices"
      });
    }
  }
});

// src/agents/tools/seller-checker.tool.ts
var import_zod9 = require("zod");

// src/utils/scoreCalculator.ts
function computeAuthenticityScore(inputs) {
  let score = 100;
  score -= inputs.reviewFakePercentage * 0.5;
  score -= (100 - inputs.sellerTrustScore) * 0.2;
  if (!inputs.ratingDistributionNormal) {
    score -= 10;
  }
  if (inputs.burstDetected) {
    score -= 10;
  }
  if (inputs.incentivizedLanguageFound) {
    score -= 15;
  }
  score += inputs.verifiedPurchaseRatio * 5;
  return Math.max(0, Math.min(100, Math.round(score)));
}
function getTrustLabel(score) {
  if (score >= 71) return "TRUSTED";
  if (score >= 41) return "SUSPICIOUS";
  if (score >= 0) return "FAKE";
  return "UNKNOWN";
}
function getRecommendation(score) {
  if (score >= 71) return "BUY";
  if (score >= 41) return "CAUTION";
  return "AVOID";
}
function computeSellerTrustScore(inputs) {
  let score = 0;
  score += inputs.rating / 5 * 40;
  if (inputs.reviewCount > 0) {
    score += Math.min(20, Math.log10(inputs.reviewCount) / 4 * 20);
  }
  if (inputs.accountAgeDays !== void 0) {
    score += Math.min(20, inputs.accountAgeDays / 365 * 20);
  } else {
    score += 10;
  }
  if (inputs.flagCount > 0) {
    score -= 30;
  }
  if (inputs.isVerified) {
    score += 20;
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}
function getSellerTrustLabel(score) {
  if (score >= 70) return "HIGH";
  if (score >= 40) return "MEDIUM";
  if (score >= 0) return "LOW";
  return "UNKNOWN";
}
function isRatingDistributionNormal(distribution) {
  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
  if (total === 0) return true;
  const oneStarPct = (distribution["1"] || 0) / total * 100;
  const fiveStarPct = (distribution["5"] || 0) / total * 100;
  return oneStarPct + fiveStarPct <= 80;
}

// src/services/seller.service.ts
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));
var flaggedSellers = [];
try {
  const filePath = path.join(__dirname, "..", "..", "data", "flagged-sellers.json");
  flaggedSellers = JSON.parse(fs.readFileSync(filePath, "utf-8"));
} catch (err) {
  logger.warn("Could not load flagged sellers file:", err);
}
async function checkSellerReputation(sellerName, platform, sellerId) {
  const normalizedName = sellerName.trim();
  const normalizedId = sellerId || normalizedName.toLowerCase().replace(/\s+/g, "_");
  const redis2 = getRedisClient();
  const cacheKey = `seller:cache:${platform}:${normalizedId}`;
  const cached = await redis2.get(cacheKey);
  if (cached) {
    logger.info(`Seller cache hit: ${normalizedName}`);
    return JSON.parse(cached);
  }
  let sellerRecord = await prisma.seller.findFirst({
    where: {
      platform,
      seller_id: normalizedId
    }
  });
  const isStale = sellerRecord ? sellerRecord.last_checked && Date.now() - sellerRecord.last_checked.getTime() > 7 * 24 * 60 * 60 * 1e3 : true;
  const flagged = flaggedSellers.filter(
    (s) => s.platform === platform && (s.seller_id === normalizedId || s.name.toLowerCase() === normalizedName.toLowerCase())
  );
  const riskFlags = flagged.map((f) => f.reason);
  const rating = sellerRecord?.rating || 3.5;
  const reviewCount = sellerRecord?.review_count || 0;
  const isVerified = sellerRecord?.verified || false;
  const existingFlags = sellerRecord?.flags || [];
  const allFlags = [.../* @__PURE__ */ new Set([...existingFlags, ...riskFlags])];
  const trustScore = computeSellerTrustScore({
    rating,
    reviewCount,
    flagCount: allFlags.length,
    isVerified
  });
  const trustLabel = getSellerTrustLabel(trustScore);
  try {
    sellerRecord = await prisma.seller.upsert({
      where: {
        platform_seller_id: {
          platform,
          seller_id: normalizedId
        }
      },
      create: {
        name: normalizedName,
        platform,
        seller_id: normalizedId,
        rating,
        review_count: reviewCount,
        trust_score: trustScore,
        flags: allFlags,
        verified: isVerified,
        last_checked: /* @__PURE__ */ new Date()
      },
      update: {
        trust_score: trustScore,
        flags: allFlags,
        last_checked: /* @__PURE__ */ new Date()
      }
    });
  } catch (error) {
    logger.warn("Failed to upsert seller record:", error);
  }
  let recommendation = "";
  if (trustLabel === "HIGH") {
    recommendation = `${normalizedName} appears to be a reputable seller on ${platform} with good ratings.`;
  } else if (trustLabel === "MEDIUM") {
    recommendation = `${normalizedName} has an average reputation. Verify product authenticity before purchasing.`;
  } else if (trustLabel === "LOW") {
    recommendation = `Caution: ${normalizedName} has a low trust score. Consider purchasing from a more reputable seller.`;
  } else {
    recommendation = `Insufficient data to evaluate ${normalizedName}. Proceed with caution.`;
  }
  const result = {
    seller_name: normalizedName,
    platform,
    rating,
    review_count: reviewCount,
    trust_score: trustScore,
    trust_label: trustLabel,
    flags: allFlags,
    verified: isVerified,
    recommendation
  };
  await redis2.setex(cacheKey, 604800, JSON.stringify(result));
  return result;
}

// src/agents/tools/seller-checker.tool.ts
var sellerCheckerTool = new DynamicStructuredTool({
  name: "check_seller_reputation",
  description: "Evaluates a seller's reputation, history, and flags known problematic sellers. Returns a trust score (0-100), trust label, risk flags, and a recommendation.",
  schema: import_zod9.z.object({
    seller_name: import_zod9.z.string().describe("Name of the seller"),
    platform: import_zod9.z.string().describe("E-commerce platform (AMAZON, FLIPKART, etc.)"),
    seller_id: import_zod9.z.string().optional().describe("Platform's native seller ID if available")
  }),
  func: async ({ seller_name, platform, seller_id }) => {
    try {
      logger.info(`\u{1F3EA} Checking seller reputation: ${seller_name} on ${platform}`);
      const result = await checkSellerReputation(seller_name, platform, seller_id);
      logger.info(
        `\u2705 Seller check complete: ${result.trust_label} (score: ${result.trust_score}/100)`
      );
      return JSON.stringify(result);
    } catch (error) {
      logger.error("Seller checker tool error:", error);
      return JSON.stringify({
        error: true,
        message: error.message || "Failed to check seller"
      });
    }
  }
});

// src/agents/trustcart.agent.ts
var TRUSTCART_SYSTEM_PROMPT = `You are TrustCart, an expert AI agent specializing in e-commerce product authentication 
and price intelligence for Indian consumers.

When given a product URL:
1. ALWAYS call scrape_product_page first to get product data
2. ALWAYS call analyze_reviews with the scraped reviews
3. ALWAYS call check_seller_reputation with the seller info
4. ALWAYS call fetch_price_comparisons to find better prices
5. After all tools complete, synthesize findings into a structured JSON verdict

Your final answer MUST be valid JSON with this exact structure:
{{
  "authenticity_score": <0-100 integer>,
  "trust_label": "<TRUSTED|SUSPICIOUS|FAKE|UNKNOWN>",
  "recommendation": "<BUY|AVOID|CAUTION>",
  "verdict": "<2-3 sentence plain-language summary for an Indian consumer>",
  "key_positives": ["<up to 3 positive findings>"],
  "key_concerns": ["<up to 5 concerns or red flags>"],
  "best_price_tip": "<one sentence on where to buy if recommending purchase>"
}}

Be direct. Prioritize consumer safety. When in doubt, say CAUTION.
Do NOT include any text outside the JSON object. Return ONLY valid JSON.`;
var tools = [scrapeProductTool, reviewAnalyzerTool, priceFetcherTool, sellerCheckerTool];
async function executeTrustCartAgent(url, analysisId, onProgress) {
  const chatModel2 = await getChatModel();
  if (!chatModel2) {
    logger.info("\u{1F527} Running in heuristic-only mode (no AI key configured)");
    return await runHeuristicPipeline(url, analysisId, onProgress);
  }
  try {
    logger.info(`\u{1F916} Starting TrustCart agent for analysis: ${analysisId}`);
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", TRUSTCART_SYSTEM_PROMPT + "\n\nAvailable Tools:\n{tools}\n\nTool Names:\n{tool_names}"],
      ["human", "{input}\n\n{agent_scratchpad}"]
    ]);
    const agent = await (0, import_agents.createReactAgent)({
      llm: chatModel2,
      tools,
      prompt
    });
    const executor = new import_agents.AgentExecutor({
      agent,
      tools,
      maxIterations: 8,
      returnIntermediateSteps: true,
      verbose: true
    });
    if (onProgress) await onProgress("Agent started", 10);
    const result = await executor.invoke({
      input: `Analyze this product URL for authenticity, fake reviews, seller reputation, and price comparison: ${url}`
    });
    if (onProgress) await onProgress("Verdict synthesized", 95);
    const outputStr = result.output;
    let agentVerdict;
    try {
      const jsonMatch = outputStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        agentVerdict = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in agent output");
      }
    } catch {
      logger.warn("Failed to parse agent verdict, generating from intermediate steps");
      agentVerdict = buildVerdictFromSteps(result.intermediateSteps);
    }
    const stepData = extractStepData(result.intermediateSteps);
    return {
      verdict: agentVerdict,
      scrapedData: stepData.scrapeData,
      reviewAnalysis: stepData.reviewData,
      priceComparison: stepData.priceData,
      sellerReputation: stepData.sellerData
    };
  } catch (error) {
    logger.error("Agent execution failed:", error);
    logger.info("Falling back to heuristic pipeline...");
    return await runHeuristicPipeline(url, analysisId, onProgress);
  }
}
async function runHeuristicPipeline(url, analysisId, onProgress) {
  if (onProgress) await onProgress("Scraping product page", 10);
  const scrapeResult = await scrapeProductTool.invoke({ url });
  const scrapedData = JSON.parse(scrapeResult);
  if (scrapedData.error) {
    throw new Error(scrapedData.message || "Scraping failed");
  }
  if (onProgress) await onProgress("Analyzing reviews", 30);
  const reviewResult = await reviewAnalyzerTool.invoke({
    reviews: scrapedData.raw_reviews || [],
    product_name: scrapedData.product_name,
    metadata_review_count: scrapedData.review_count || 0,
    metadata_avg_rating: scrapedData.rating || 0
  });
  const reviewData = JSON.parse(reviewResult);
  if (onProgress) await onProgress("Checking seller", 55);
  const sellerResult = await sellerCheckerTool.invoke({
    seller_name: scrapedData.seller_name || "Unknown",
    platform: scrapedData.platform || "UNKNOWN"
  });
  const sellerData = JSON.parse(sellerResult);
  if (onProgress) await onProgress("Comparing prices", 70);
  const priceResult = await priceFetcherTool.invoke({
    product_name: scrapedData.product_name,
    brand: scrapedData.brand || "",
    current_platform: scrapedData.platform,
    current_price: scrapedData.price
  });
  const priceData = JSON.parse(priceResult);
  if (onProgress) await onProgress("Computing verdict", 85);
  const authenticityScore = computeAuthenticityScore({
    reviewFakePercentage: reviewData.fake_percentage || 0,
    sellerTrustScore: sellerData.trust_score || 50,
    ratingDistributionNormal: isRatingDistributionNormal(reviewData.rating_distribution || {}),
    burstDetected: (reviewData.suspicious_patterns || []).some(
      (p) => p.toLowerCase().includes("burst")
    ),
    incentivizedLanguageFound: (reviewData.suspicious_patterns || []).some(
      (p) => p.toLowerCase().includes("incentivized")
    ),
    verifiedPurchaseRatio: reviewData.total_reviews > 0 ? reviewData.real_count / reviewData.total_reviews : 0.5
  });
  const trustLabel = getTrustLabel(authenticityScore);
  const recommendation = getRecommendation(authenticityScore);
  const verdict = {
    authenticity_score: authenticityScore,
    trust_label: trustLabel,
    recommendation,
    verdict: buildHeuristicVerdictText(scrapedData, reviewData, sellerData, authenticityScore),
    key_positives: buildPositives(scrapedData, reviewData, sellerData),
    key_concerns: reviewData.suspicious_patterns?.slice(0, 5) || [],
    best_price_tip: priceData.best_price_platform !== scrapedData.platform ? `Best price found on ${priceData.best_price_platform} at \u20B9${priceData.best_price} (save \u20B9${priceData.savings_amount})` : `Current price on ${scrapedData.platform} appears competitive.`
  };
  return {
    verdict,
    scrapedData,
    reviewAnalysis: reviewData,
    priceComparison: priceData,
    sellerReputation: sellerData
  };
}
function extractStepData(steps) {
  let scrapeData = {};
  let reviewData = {};
  let priceData = {};
  let sellerData = {};
  for (const step of steps || []) {
    try {
      const toolName = step.action?.tool;
      const output = step.observation;
      if (typeof output === "string") {
        const parsed = JSON.parse(output);
        if (toolName === "scrape_product_page") scrapeData = parsed;
        else if (toolName === "analyze_reviews") reviewData = parsed;
        else if (toolName === "fetch_price_comparisons") priceData = parsed;
        else if (toolName === "check_seller_reputation") sellerData = parsed;
      }
    } catch {
    }
  }
  return { scrapeData, reviewData, priceData, sellerData };
}
function buildVerdictFromSteps(steps) {
  const data = extractStepData(steps);
  const score = computeAuthenticityScore({
    reviewFakePercentage: data.reviewData?.fake_percentage || 0,
    sellerTrustScore: data.sellerData?.trust_score || 50,
    ratingDistributionNormal: true,
    burstDetected: false,
    incentivizedLanguageFound: false,
    verifiedPurchaseRatio: 0.5
  });
  return {
    authenticity_score: score,
    trust_label: getTrustLabel(score),
    recommendation: getRecommendation(score),
    verdict: "Analysis completed using automated heuristics.",
    key_positives: [],
    key_concerns: data.reviewData?.suspicious_patterns?.slice(0, 5) || [],
    best_price_tip: "Compare prices across platforms before purchasing."
  };
}
function buildHeuristicVerdictText(product, reviews, seller, score) {
  const parts = [];
  if (score >= 71) {
    parts.push(`${product.product_name} appears to be a genuine product with mostly authentic reviews.`);
  } else if (score >= 41) {
    parts.push(`${product.product_name} has some questionable review patterns that warrant caution.`);
  } else {
    parts.push(`${product.product_name} shows significant red flags in review authenticity and seller reputation.`);
  }
  if (reviews.fake_percentage > 30) {
    parts.push(`${reviews.fake_percentage.toFixed(0)}% of reviews were flagged as potentially fake.`);
  }
  if (seller.trust_label === "LOW") {
    parts.push(`The seller has a low trust score \u2014 consider buying from a more reputable seller.`);
  }
  return parts.join(" ");
}
function buildPositives(product, reviews, seller) {
  const positives = [];
  if (product.rating >= 4) {
    positives.push(`High overall rating of ${product.rating}/5`);
  }
  if (reviews.fake_percentage < 15) {
    positives.push("Reviews appear mostly authentic");
  }
  if (seller.trust_label === "HIGH") {
    positives.push(`Reputable seller with ${seller.trust_score}/100 trust score`);
  }
  if (seller.verified) {
    positives.push("Platform-verified seller");
  }
  return positives.slice(0, 3);
}

// src/workers/analysis.worker.ts
async function processAnalysisJob(job) {
  const { url, analysisId, userId } = job.data;
  const redis2 = getRedisClient();
  logger.info(`\u{1F504} Processing analysis job: ${job.id} | URL: ${url}`);
  try {
    await prisma.analysis.update({
      where: { id: analysisId },
      data: { status: "PROCESSING" }
    });
    const onProgress = async (step, percentage) => {
      logger.info(`  \u{1F4C8} [${percentage}%] ${step}`);
      await redis2.setex(`analysis:progress:${job.id}`, 3600, String(percentage));
      await job.updateProgress(percentage);
    };
    await onProgress("Starting analysis", 10);
    const result = await executeTrustCartAgent(url, analysisId, onProgress);
    await onProgress("Saving results", 90);
    if (result.reviewAnalysis && !result.reviewAnalysis.error) {
      await prisma.reviewAnalysis.create({
        data: {
          analysis_id: analysisId,
          total_reviews: result.reviewAnalysis.total_reviews || 0,
          fake_review_count: result.reviewAnalysis.fake_count || 0,
          real_review_count: result.reviewAnalysis.real_count || 0,
          avg_rating: result.reviewAnalysis.avg_rating || 0,
          rating_distribution: result.reviewAnalysis.rating_distribution || {},
          fake_percentage: result.reviewAnalysis.fake_percentage || 0,
          suspicious_patterns: result.reviewAnalysis.suspicious_patterns || [],
          sentiment_summary: result.reviewAnalysis.sentiment_summary || null
        }
      });
    }
    if (result.priceComparison?.comparisons) {
      for (const comp of result.priceComparison.comparisons) {
        await prisma.priceComparison.create({
          data: {
            analysis_id: analysisId,
            platform: comp.platform,
            price: comp.price,
            currency: comp.currency || "INR",
            url: comp.url || "",
            in_stock: comp.in_stock ?? true,
            seller_name: comp.seller_name || null,
            fetched_at: /* @__PURE__ */ new Date()
          }
        });
      }
    }
    await prisma.analysis.update({
      where: { id: analysisId },
      data: {
        status: "COMPLETED",
        product_name: result.scrapedData?.product_name || null,
        product_image: result.scrapedData?.images?.[0] || null,
        authenticity_score: result.verdict.authenticity_score,
        trust_label: result.verdict.trust_label,
        verdict: result.verdict.verdict,
        recommendation: result.verdict.recommendation,
        raw_data: {
          scraped: result.scrapedData,
          reviewAnalysis: result.reviewAnalysis,
          priceComparison: result.priceComparison,
          sellerReputation: result.sellerReputation,
          agentVerdict: result.verdict
        },
        completed_at: /* @__PURE__ */ new Date()
      }
    });
    await onProgress("Analysis complete", 100);
    await redis2.del(`analysis:result:${analysisId}`);
    logger.info(`\u2705 Analysis complete: ${analysisId} | Score: ${result.verdict.authenticity_score}`);
    return {
      analysisId,
      score: result.verdict.authenticity_score,
      recommendation: result.verdict.recommendation
    };
  } catch (error) {
    logger.error(`\u274C Analysis job failed: ${job.id}`, error);
    await prisma.analysis.update({
      where: { id: analysisId },
      data: {
        status: "FAILED",
        error_message: error.message || "Analysis failed unexpectedly"
      }
    });
    await redis2.setex(`analysis:progress:${job.id}`, 3600, "0");
    throw error;
  }
}
async function startWorker() {
  logger.info("\u{1F680} Starting TrustCart analysis worker...");
  await connectDatabase();
  await connectRedis();
  const worker = createAnalysisWorker(processAnalysisJob);
  logger.info(`\u2705 Worker listening on queue: ${ANALYSIS_QUEUE_NAME}`);
  const shutdown = async (signal) => {
    logger.info(`${signal} received. Closing worker...`);
    await worker.close();
    process.exit(0);
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}
startWorker().catch((err) => {
  logger.error("Worker failed to start:", err);
  process.exit(1);
});
/*! Bundled license information:

@langchain/core/dist/utils/fast-json-patch/src/helpers.js:
  (*!
   * https://github.com/Starcounter-Jack/JSON-Patch
   * (c) 2017-2022 Joachim Wester
   * MIT licensed
   *)

@langchain/core/dist/utils/fast-json-patch/src/duplex.js:
  (*!
   * https://github.com/Starcounter-Jack/JSON-Patch
   * (c) 2013-2021 Joachim Wester
   * MIT license
   *)

mustache/mustache.mjs:
  (*!
   * mustache.js - Logic-less {{mustache}} templates with JavaScript
   * http://github.com/janl/mustache.js
   *)

@langchain/core/dist/utils/js-sha1/hash.js:
  (*
   * [js-sha1]{@link https://github.com/emn178/js-sha1}
   *
   * @version 0.6.0
   * @author Chen, Yi-Cyuan [emn178@gmail.com]
   * @copyright Chen, Yi-Cyuan 2014-2017
   * @license MIT
   *)

@langchain/core/dist/utils/js-sha256/hash.js:
  (**
   * [js-sha256]{@link https://github.com/emn178/js-sha256}
   *
   * @version 0.11.1
   * @author Chen, Yi-Cyuan [emn178@gmail.com]
   * @copyright Chen, Yi-Cyuan 2014-2025
   * @license MIT
   *)
*/
