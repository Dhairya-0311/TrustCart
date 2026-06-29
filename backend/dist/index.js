"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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

// src/app.ts
var import_express5 = __toESM(require("express"));
var import_cors = __toESM(require("cors"));
var import_helmet = __toESM(require("helmet"));
var import_compression = __toESM(require("compression"));
var import_morgan = __toESM(require("morgan"));
var import_cookie_parser = __toESM(require("cookie-parser"));
var import_swagger_jsdoc = __toESM(require("swagger-jsdoc"));
var import_swagger_ui_express = __toESM(require("swagger-ui-express"));

// node_modules/express-async-errors/index.js
var Layer = require("express/lib/router/layer");
var Router = require("express/lib/router");
var last = (arr = []) => arr[arr.length - 1];
var noop = Function.prototype;
function copyFnProps(oldFn, newFn) {
  Object.keys(oldFn).forEach((key) => {
    newFn[key] = oldFn[key];
  });
  return newFn;
}
function wrap(fn) {
  const newFn = function newFn2(...args) {
    const ret = fn.apply(this, args);
    const next = (args.length === 5 ? args[2] : last(args)) || noop;
    if (ret && ret.catch) ret.catch((err) => next(err));
    return ret;
  };
  Object.defineProperty(newFn, "length", {
    value: fn.length,
    writable: false
  });
  return copyFnProps(fn, newFn);
}
function patchRouterParam() {
  const originalParam = Router.prototype.constructor.param;
  Router.prototype.constructor.param = function param(name, fn) {
    fn = wrap(fn);
    return originalParam.call(this, name, fn);
  };
}
Object.defineProperty(Layer.prototype, "handle", {
  enumerable: true,
  get() {
    return this.__handle;
  },
  set(fn) {
    fn = wrap(fn);
    this.__handle = fn;
  }
});
patchRouterParam();

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
var ValidationError = class extends AppError {
  constructor(message = "Validation failed", details) {
    super(message, 400, "VALIDATION_ERROR", true, details);
  }
};
var AuthError = class extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, "AUTH_ERROR");
  }
};
var ForbiddenError = class extends AppError {
  constructor(message = "Access denied") {
    super(message, 403, "FORBIDDEN");
  }
};
var NotFoundError = class extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND");
  }
};
function errorMiddleware(err, _req, res, _next) {
  let statusCode = 500;
  let message = "An unexpected error occurred";
  let code = "INTERNAL_ERROR";
  let details = void 0;
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
    details = err.details;
  }
  if (statusCode >= 500) {
    logger.error(`[${code}] ${message}`, {
      stack: err.stack,
      statusCode
    });
  } else {
    logger.warn(`[${code}] ${message}`, { statusCode });
  }
  const response = {
    success: false,
    error: message,
    code
  };
  if (details) {
    response.details = details;
  }
  if (env.NODE_ENV === "development" && err.stack) {
    response.stack = err.stack;
  }
  res.status(statusCode).json(response);
}
function notFoundHandler(req, _res, next) {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
}

// node_modules/express-rate-limit/dist/index.mjs
var import_node_buffer = require("node:buffer");
var import_node_crypto = require("node:crypto");
var import_node_net = require("node:net");
var SUPPORTED_DRAFT_VERSIONS = [
  "draft-6",
  "draft-7",
  "draft-8"
];
var getResetSeconds = (resetTime, windowMs) => {
  let resetSeconds = void 0;
  if (resetTime) {
    const deltaSeconds = Math.ceil((resetTime.getTime() - Date.now()) / 1e3);
    resetSeconds = Math.max(0, deltaSeconds);
  } else if (windowMs) {
    resetSeconds = Math.ceil(windowMs / 1e3);
  }
  return resetSeconds;
};
var getPartitionKey = (key) => {
  const hash = (0, import_node_crypto.createHash)("sha256");
  hash.update(key);
  const partitionKey = hash.digest("hex").slice(0, 12);
  return import_node_buffer.Buffer.from(partitionKey).toString("base64");
};
var setLegacyHeaders = (response, info) => {
  if (response.headersSent) return;
  response.setHeader("X-RateLimit-Limit", info.limit.toString());
  response.setHeader("X-RateLimit-Remaining", info.remaining.toString());
  if (info.resetTime instanceof Date) {
    response.setHeader("Date", (/* @__PURE__ */ new Date()).toUTCString());
    response.setHeader(
      "X-RateLimit-Reset",
      Math.ceil(info.resetTime.getTime() / 1e3).toString()
    );
  }
};
var setDraft6Headers = (response, info, windowMs) => {
  if (response.headersSent) return;
  const windowSeconds = Math.ceil(windowMs / 1e3);
  const resetSeconds = getResetSeconds(info.resetTime);
  response.setHeader("RateLimit-Policy", `${info.limit};w=${windowSeconds}`);
  response.setHeader("RateLimit-Limit", info.limit.toString());
  response.setHeader("RateLimit-Remaining", info.remaining.toString());
  if (resetSeconds)
    response.setHeader("RateLimit-Reset", resetSeconds.toString());
};
var setDraft7Headers = (response, info, windowMs) => {
  if (response.headersSent) return;
  const windowSeconds = Math.ceil(windowMs / 1e3);
  const resetSeconds = getResetSeconds(info.resetTime, windowMs);
  response.setHeader("RateLimit-Policy", `${info.limit};w=${windowSeconds}`);
  response.setHeader(
    "RateLimit",
    `limit=${info.limit}, remaining=${info.remaining}, reset=${resetSeconds}`
  );
};
var setDraft8Headers = (response, info, windowMs, name, key) => {
  if (response.headersSent) return;
  const windowSeconds = Math.ceil(windowMs / 1e3);
  const resetSeconds = getResetSeconds(info.resetTime, windowMs);
  const partitionKey = getPartitionKey(key);
  const policy = `q=${info.limit}; w=${windowSeconds}; pk=:${partitionKey}:`;
  const header = `r=${info.remaining}; t=${resetSeconds}`;
  response.append("RateLimit-Policy", `"${name}"; ${policy}`);
  response.append("RateLimit", `"${name}"; ${header}`);
};
var setRetryAfterHeader = (response, info, windowMs) => {
  if (response.headersSent) return;
  const resetSeconds = getResetSeconds(info.resetTime, windowMs);
  response.setHeader("Retry-After", resetSeconds.toString());
};
var ValidationError2 = class extends Error {
  /**
   * The code must be a string, in snake case and all capital, that starts with
   * the substring `ERR_ERL_`.
   *
   * The message must be a string, starting with an uppercase character,
   * describing the issue in detail.
   */
  constructor(code, message) {
    const url = `https://express-rate-limit.github.io/${code}/`;
    super(`${message} See ${url} for more information.`);
    this.name = this.constructor.name;
    this.code = code;
    this.help = url;
  }
};
var ChangeWarning = class extends ValidationError2 {
};
var usedStores = /* @__PURE__ */ new Set();
var singleCountKeys = /* @__PURE__ */ new WeakMap();
var validations = {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  enabled: {
    default: true
  },
  // Should be EnabledValidations type, but that's a circular reference
  disable() {
    for (const k of Object.keys(this.enabled)) this.enabled[k] = false;
  },
  /**
   * Checks whether the IP address is valid, and that it does not have a port
   * number in it.
   *
   * See https://github.com/express-rate-limit/express-rate-limit/wiki/Error-Codes#err_erl_invalid_ip_address.
   *
   * @param ip {string | undefined} - The IP address provided by Express as request.ip.
   *
   * @returns {void}
   */
  ip(ip) {
    if (ip === void 0) {
      throw new ValidationError2(
        "ERR_ERL_UNDEFINED_IP_ADDRESS",
        `An undefined 'request.ip' was detected. This might indicate a misconfiguration or the connection being destroyed prematurely.`
      );
    }
    if (!(0, import_node_net.isIP)(ip)) {
      throw new ValidationError2(
        "ERR_ERL_INVALID_IP_ADDRESS",
        `An invalid 'request.ip' (${ip}) was detected. Consider passing a custom 'keyGenerator' function to the rate limiter.`
      );
    }
  },
  /**
   * Makes sure the trust proxy setting is not set to `true`.
   *
   * See https://github.com/express-rate-limit/express-rate-limit/wiki/Error-Codes#err_erl_permissive_trust_proxy.
   *
   * @param request {Request} - The Express request object.
   *
   * @returns {void}
   */
  trustProxy(request) {
    if (request.app.get("trust proxy") === true) {
      throw new ValidationError2(
        "ERR_ERL_PERMISSIVE_TRUST_PROXY",
        `The Express 'trust proxy' setting is true, which allows anyone to trivially bypass IP-based rate limiting.`
      );
    }
  },
  /**
   * Makes sure the trust proxy setting is set in case the `X-Forwarded-For`
   * header is present.
   *
   * See https://github.com/express-rate-limit/express-rate-limit/wiki/Error-Codes#err_erl_unset_trust_proxy.
   *
   * @param request {Request} - The Express request object.
   *
   * @returns {void}
   */
  xForwardedForHeader(request) {
    if (request.headers["x-forwarded-for"] && request.app.get("trust proxy") === false) {
      throw new ValidationError2(
        "ERR_ERL_UNEXPECTED_X_FORWARDED_FOR",
        `The 'X-Forwarded-For' header is set but the Express 'trust proxy' setting is false (default). This could indicate a misconfiguration which would prevent express-rate-limit from accurately identifying users.`
      );
    }
  },
  /**
   * Ensures totalHits value from store is a positive integer.
   *
   * @param hits {any} - The `totalHits` returned by the store.
   */
  positiveHits(hits) {
    if (typeof hits !== "number" || hits < 1 || hits !== Math.round(hits)) {
      throw new ValidationError2(
        "ERR_ERL_INVALID_HITS",
        `The totalHits value returned from the store must be a positive integer, got ${hits}`
      );
    }
  },
  /**
   * Ensures a single store instance is not used with multiple express-rate-limit instances
   */
  unsharedStore(store) {
    if (usedStores.has(store)) {
      const maybeUniquePrefix = store?.localKeys ? "" : " (with a unique prefix)";
      throw new ValidationError2(
        "ERR_ERL_STORE_REUSE",
        `A Store instance must not be shared across multiple rate limiters. Create a new instance of ${store.constructor.name}${maybeUniquePrefix} for each limiter instead.`
      );
    }
    usedStores.add(store);
  },
  /**
   * Ensures a given key is incremented only once per request.
   *
   * @param request {Request} - The Express request object.
   * @param store {Store} - The store class.
   * @param key {string} - The key used to store the client's hit count.
   *
   * @returns {void}
   */
  singleCount(request, store, key) {
    let storeKeys = singleCountKeys.get(request);
    if (!storeKeys) {
      storeKeys = /* @__PURE__ */ new Map();
      singleCountKeys.set(request, storeKeys);
    }
    const storeKey = store.localKeys ? store : store.constructor.name;
    let keys = storeKeys.get(storeKey);
    if (!keys) {
      keys = [];
      storeKeys.set(storeKey, keys);
    }
    const prefixedKey = `${store.prefix ?? ""}${key}`;
    if (keys.includes(prefixedKey)) {
      throw new ValidationError2(
        "ERR_ERL_DOUBLE_COUNT",
        `The hit count for ${key} was incremented more than once for a single request.`
      );
    }
    keys.push(prefixedKey);
  },
  /**
   * Warns the user that the behaviour for `max: 0` / `limit: 0` is
   * changing in the next major release.
   *
   * @param limit {number} - The maximum number of hits per client.
   *
   * @returns {void}
   */
  limit(limit) {
    if (limit === 0) {
      throw new ChangeWarning(
        "WRN_ERL_MAX_ZERO",
        `Setting limit or max to 0 disables rate limiting in express-rate-limit v6 and older, but will cause all requests to be blocked in v7`
      );
    }
  },
  /**
   * Warns the user that the `draft_polli_ratelimit_headers` option is deprecated
   * and will be removed in the next major release.
   *
   * @param draft_polli_ratelimit_headers {any | undefined} - The now-deprecated setting that was used to enable standard headers.
   *
   * @returns {void}
   */
  draftPolliHeaders(draft_polli_ratelimit_headers) {
    if (draft_polli_ratelimit_headers) {
      throw new ChangeWarning(
        "WRN_ERL_DEPRECATED_DRAFT_POLLI_HEADERS",
        `The draft_polli_ratelimit_headers configuration option is deprecated and has been removed in express-rate-limit v7, please set standardHeaders: 'draft-6' instead.`
      );
    }
  },
  /**
   * Warns the user that the `onLimitReached` option is deprecated and
   * will be removed in the next major release.
   *
   * @param onLimitReached {any | undefined} - The maximum number of hits per client.
   *
   * @returns {void}
   */
  onLimitReached(onLimitReached) {
    if (onLimitReached) {
      throw new ChangeWarning(
        "WRN_ERL_DEPRECATED_ON_LIMIT_REACHED",
        `The onLimitReached configuration option is deprecated and has been removed in express-rate-limit v7.`
      );
    }
  },
  /**
   * Warns the user when an invalid/unsupported version of the draft spec is passed.
   *
   * @param version {any | undefined} - The version passed by the user.
   *
   * @returns {void}
   */
  headersDraftVersion(version) {
    if (typeof version !== "string" || // @ts-expect-error This is fine. If version is not in the array, it will just return false.
    !SUPPORTED_DRAFT_VERSIONS.includes(version)) {
      const versionString = SUPPORTED_DRAFT_VERSIONS.join(", ");
      throw new ValidationError2(
        "ERR_ERL_HEADERS_UNSUPPORTED_DRAFT_VERSION",
        `standardHeaders: only the following versions of the IETF draft specification are supported: ${versionString}.`
      );
    }
  },
  /**
   * Warns the user when the selected headers option requires a reset time but
   * the store does not provide one.
   *
   * @param resetTime {Date | undefined} - The timestamp when the client's hit count will be reset.
   *
   * @returns {void}
   */
  headersResetTime(resetTime) {
    if (!resetTime) {
      throw new ValidationError2(
        "ERR_ERL_HEADERS_NO_RESET",
        `standardHeaders:  'draft-7' requires a 'resetTime', but the store did not provide one. The 'windowMs' value will be used instead, which may cause clients to wait longer than necessary.`
      );
    }
  },
  /**
   * Checks the options.validate setting to ensure that only recognized
   * validations are enabled or disabled.
   *
   * If any unrecognized values are found, an error is logged that
   * includes the list of supported vaidations.
   */
  validationsConfig() {
    const supportedValidations = Object.keys(this).filter(
      (k) => !["enabled", "disable"].includes(k)
    );
    supportedValidations.push("default");
    for (const key of Object.keys(this.enabled)) {
      if (!supportedValidations.includes(key)) {
        throw new ValidationError2(
          "ERR_ERL_UNKNOWN_VALIDATION",
          `options.validate.${key} is not recognized. Supported validate options are: ${supportedValidations.join(
            ", "
          )}.`
        );
      }
    }
  },
  /**
   * Checks to see if the instance was created inside of a request handler,
   * which would prevent it from working correctly, with the default memory
   * store (or any other store with localKeys.)
   */
  creationStack(store) {
    const { stack } = new Error(
      "express-rate-limit validation check (set options.validate.creationStack=false to disable)"
    );
    if (stack?.includes("Layer.handle [as handle_request]")) {
      if (!store.localKeys) {
        throw new ValidationError2(
          "ERR_ERL_CREATED_IN_REQUEST_HANDLER",
          "express-rate-limit instance should *usually* be created at app initialization, not when responding to a request."
        );
      }
      throw new ValidationError2(
        "ERR_ERL_CREATED_IN_REQUEST_HANDLER",
        `express-rate-limit instance should be created at app initialization, not when responding to a request.`
      );
    }
  }
};
var getValidations = (_enabled) => {
  let enabled;
  if (typeof _enabled === "boolean") {
    enabled = {
      default: _enabled
    };
  } else {
    enabled = {
      default: true,
      ..._enabled
    };
  }
  const wrappedValidations = {
    enabled
  };
  for (const [name, validation] of Object.entries(validations)) {
    if (typeof validation === "function")
      wrappedValidations[name] = (...args) => {
        if (!(enabled[name] ?? enabled.default)) {
          return;
        }
        try {
          ;
          validation.apply(
            wrappedValidations,
            args
          );
        } catch (error) {
          if (error instanceof ChangeWarning) console.warn(error);
          else console.error(error);
        }
      };
  }
  return wrappedValidations;
};
var MemoryStore = class {
  constructor() {
    this.previous = /* @__PURE__ */ new Map();
    this.current = /* @__PURE__ */ new Map();
    this.localKeys = true;
  }
  /**
   * Method that initializes the store.
   *
   * @param options {Options} - The options used to setup the middleware.
   */
  init(options) {
    this.windowMs = options.windowMs;
    if (this.interval) clearInterval(this.interval);
    this.interval = setInterval(() => {
      this.clearExpired();
    }, this.windowMs);
    if (this.interval.unref) this.interval.unref();
  }
  /**
   * Method to fetch a client's hit count and reset time.
   *
   * @param key {string} - The identifier for a client.
   *
   * @returns {ClientRateLimitInfo | undefined} - The number of hits and reset time for that client.
   *
   * @public
   */
  async get(key) {
    return this.current.get(key) ?? this.previous.get(key);
  }
  /**
   * Method to increment a client's hit counter.
   *
   * @param key {string} - The identifier for a client.
   *
   * @returns {ClientRateLimitInfo} - The number of hits and reset time for that client.
   *
   * @public
   */
  async increment(key) {
    const client = this.getClient(key);
    const now = Date.now();
    if (client.resetTime.getTime() <= now) {
      this.resetClient(client, now);
    }
    client.totalHits++;
    return client;
  }
  /**
   * Method to decrement a client's hit counter.
   *
   * @param key {string} - The identifier for a client.
   *
   * @public
   */
  async decrement(key) {
    const client = this.getClient(key);
    if (client.totalHits > 0) client.totalHits--;
  }
  /**
   * Method to reset a client's hit counter.
   *
   * @param key {string} - The identifier for a client.
   *
   * @public
   */
  async resetKey(key) {
    this.current.delete(key);
    this.previous.delete(key);
  }
  /**
   * Method to reset everyone's hit counter.
   *
   * @public
   */
  async resetAll() {
    this.current.clear();
    this.previous.clear();
  }
  /**
   * Method to stop the timer (if currently running) and prevent any memory
   * leaks.
   *
   * @public
   */
  shutdown() {
    clearInterval(this.interval);
    void this.resetAll();
  }
  /**
   * Recycles a client by setting its hit count to zero, and reset time to
   * `windowMs` milliseconds from now.
   *
   * NOT to be confused with `#resetKey()`, which removes a client from both the
   * `current` and `previous` maps.
   *
   * @param client {Client} - The client to recycle.
   * @param now {number} - The current time, to which the `windowMs` is added to get the `resetTime` for the client.
   *
   * @return {Client} - The modified client that was passed in, to allow for chaining.
   */
  resetClient(client, now = Date.now()) {
    client.totalHits = 0;
    client.resetTime.setTime(now + this.windowMs);
    return client;
  }
  /**
   * Retrieves or creates a client, given a key. Also ensures that the client being
   * returned is in the `current` map.
   *
   * @param key {string} - The key under which the client is (or is to be) stored.
   *
   * @returns {Client} - The requested client.
   */
  getClient(key) {
    if (this.current.has(key)) return this.current.get(key);
    let client;
    if (this.previous.has(key)) {
      client = this.previous.get(key);
      this.previous.delete(key);
    } else {
      client = { totalHits: 0, resetTime: /* @__PURE__ */ new Date() };
      this.resetClient(client);
    }
    this.current.set(key, client);
    return client;
  }
  /**
   * Move current clients to previous, create a new map for current.
   *
   * This function is called every `windowMs`.
   */
  clearExpired() {
    this.previous = this.current;
    this.current = /* @__PURE__ */ new Map();
  }
};
var isLegacyStore = (store) => (
  // Check that `incr` exists but `increment` does not - store authors might want
  // to keep both around for backwards compatibility.
  typeof store.incr === "function" && typeof store.increment !== "function"
);
var promisifyStore = (passedStore) => {
  if (!isLegacyStore(passedStore)) {
    return passedStore;
  }
  const legacyStore = passedStore;
  class PromisifiedStore {
    async increment(key) {
      return new Promise((resolve, reject) => {
        legacyStore.incr(
          key,
          (error, totalHits, resetTime) => {
            if (error) reject(error);
            resolve({ totalHits, resetTime });
          }
        );
      });
    }
    async decrement(key) {
      return legacyStore.decrement(key);
    }
    async resetKey(key) {
      return legacyStore.resetKey(key);
    }
    /* istanbul ignore next */
    async resetAll() {
      if (typeof legacyStore.resetAll === "function")
        return legacyStore.resetAll();
    }
  }
  return new PromisifiedStore();
};
var getOptionsFromConfig = (config) => {
  const { validations: validations2, ...directlyPassableEntries } = config;
  return {
    ...directlyPassableEntries,
    validate: validations2.enabled
  };
};
var omitUndefinedOptions = (passedOptions) => {
  const omittedOptions = {};
  for (const k of Object.keys(passedOptions)) {
    const key = k;
    if (passedOptions[key] !== void 0) {
      omittedOptions[key] = passedOptions[key];
    }
  }
  return omittedOptions;
};
var parseOptions = (passedOptions) => {
  const notUndefinedOptions = omitUndefinedOptions(passedOptions);
  const validations2 = getValidations(notUndefinedOptions?.validate ?? true);
  validations2.validationsConfig();
  validations2.draftPolliHeaders(
    // @ts-expect-error see the note above.
    notUndefinedOptions.draft_polli_ratelimit_headers
  );
  validations2.onLimitReached(notUndefinedOptions.onLimitReached);
  let standardHeaders = notUndefinedOptions.standardHeaders ?? false;
  if (standardHeaders === true) standardHeaders = "draft-6";
  const config = {
    windowMs: 60 * 1e3,
    limit: passedOptions.max ?? 5,
    // `max` is deprecated, but support it anyways.
    message: "Too many requests, please try again later.",
    statusCode: 429,
    legacyHeaders: passedOptions.headers ?? true,
    identifier(request, _response) {
      let duration = "";
      const property = config.requestPropertyName;
      const { limit } = request[property];
      const seconds = config.windowMs / 1e3;
      const minutes = config.windowMs / (1e3 * 60);
      const hours = config.windowMs / (1e3 * 60 * 60);
      const days = config.windowMs / (1e3 * 60 * 60 * 24);
      if (seconds < 60) duration = `${seconds}sec`;
      else if (minutes < 60) duration = `${minutes}min`;
      else if (hours < 24) duration = `${hours}hr${hours > 1 ? "s" : ""}`;
      else duration = `${days}day${days > 1 ? "s" : ""}`;
      return `${limit}-in-${duration}`;
    },
    requestPropertyName: "rateLimit",
    skipFailedRequests: false,
    skipSuccessfulRequests: false,
    requestWasSuccessful: (_request, response) => response.statusCode < 400,
    skip: (_request, _response) => false,
    keyGenerator(request, _response) {
      validations2.ip(request.ip);
      validations2.trustProxy(request);
      validations2.xForwardedForHeader(request);
      return request.ip;
    },
    async handler(request, response, _next, _optionsUsed) {
      response.status(config.statusCode);
      const message = typeof config.message === "function" ? await config.message(
        request,
        response
      ) : config.message;
      if (!response.writableEnded) {
        response.send(message);
      }
    },
    passOnStoreError: false,
    // Allow the default options to be overridden by the passed options.
    ...notUndefinedOptions,
    // `standardHeaders` is resolved into a draft version above, use that.
    standardHeaders,
    // Note that this field is declared after the user's options are spread in,
    // so that this field doesn't get overridden with an un-promisified store!
    store: promisifyStore(notUndefinedOptions.store ?? new MemoryStore()),
    // Print an error to the console if a few known misconfigurations are detected.
    validations: validations2
  };
  if (typeof config.store.increment !== "function" || typeof config.store.decrement !== "function" || typeof config.store.resetKey !== "function" || config.store.resetAll !== void 0 && typeof config.store.resetAll !== "function" || config.store.init !== void 0 && typeof config.store.init !== "function") {
    throw new TypeError(
      "An invalid store was passed. Please ensure that the store is a class that implements the `Store` interface."
    );
  }
  return config;
};
var handleAsyncErrors = (fn) => async (request, response, next) => {
  try {
    await Promise.resolve(fn(request, response, next)).catch(next);
  } catch (error) {
    next(error);
  }
};
var rateLimit = (passedOptions) => {
  const config = parseOptions(passedOptions ?? {});
  const options = getOptionsFromConfig(config);
  config.validations.creationStack(config.store);
  config.validations.unsharedStore(config.store);
  if (typeof config.store.init === "function") config.store.init(options);
  const middleware = handleAsyncErrors(
    async (request, response, next) => {
      const skip = await config.skip(request, response);
      if (skip) {
        next();
        return;
      }
      const augmentedRequest = request;
      const key = await config.keyGenerator(request, response);
      let totalHits = 0;
      let resetTime;
      try {
        const incrementResult = await config.store.increment(key);
        totalHits = incrementResult.totalHits;
        resetTime = incrementResult.resetTime;
      } catch (error) {
        if (config.passOnStoreError) {
          console.error(
            "express-rate-limit: error from store, allowing request without rate-limiting.",
            error
          );
          next();
          return;
        }
        throw error;
      }
      config.validations.positiveHits(totalHits);
      config.validations.singleCount(request, config.store, key);
      const retrieveLimit = typeof config.limit === "function" ? config.limit(request, response) : config.limit;
      const limit = await retrieveLimit;
      config.validations.limit(limit);
      const info = {
        limit,
        used: totalHits,
        remaining: Math.max(limit - totalHits, 0),
        resetTime
      };
      Object.defineProperty(info, "current", {
        configurable: false,
        enumerable: false,
        value: totalHits
      });
      augmentedRequest[config.requestPropertyName] = info;
      if (config.legacyHeaders && !response.headersSent) {
        setLegacyHeaders(response, info);
      }
      if (config.standardHeaders && !response.headersSent) {
        switch (config.standardHeaders) {
          case "draft-6": {
            setDraft6Headers(response, info, config.windowMs);
            break;
          }
          case "draft-7": {
            config.validations.headersResetTime(info.resetTime);
            setDraft7Headers(response, info, config.windowMs);
            break;
          }
          case "draft-8": {
            const retrieveName = typeof config.identifier === "function" ? config.identifier(request, response) : config.identifier;
            const name = await retrieveName;
            config.validations.headersResetTime(info.resetTime);
            setDraft8Headers(response, info, config.windowMs, name, key);
            break;
          }
          default: {
            config.validations.headersDraftVersion(config.standardHeaders);
            break;
          }
        }
      }
      if (config.skipFailedRequests || config.skipSuccessfulRequests) {
        let decremented = false;
        const decrementKey = async () => {
          if (!decremented) {
            await config.store.decrement(key);
            decremented = true;
          }
        };
        if (config.skipFailedRequests) {
          response.on("finish", async () => {
            if (!await config.requestWasSuccessful(request, response))
              await decrementKey();
          });
          response.on("close", async () => {
            if (!response.writableEnded) await decrementKey();
          });
          response.on("error", async () => {
            await decrementKey();
          });
        }
        if (config.skipSuccessfulRequests) {
          response.on("finish", async () => {
            if (await config.requestWasSuccessful(request, response))
              await decrementKey();
          });
        }
      }
      config.validations.disable();
      if (totalHits > limit) {
        if (config.legacyHeaders || config.standardHeaders) {
          setRetryAfterHeader(response, info, config.windowMs);
        }
        config.handler(request, response, next, options);
        return;
      }
      next();
    }
  );
  const getThrowFn = () => {
    throw new Error("The current store does not support the get/getKey method");
  };
  middleware.resetKey = config.store.resetKey.bind(config.store);
  middleware.getKey = typeof config.store.get === "function" ? config.store.get.bind(config.store) : getThrowFn;
  return middleware;
};
var lib_default = rateLimit;

// src/middleware/rateLimit.middleware.ts
var generalRateLimiter = lib_default({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.NODE_ENV === "development" ? 2e3 : 300,
  message: {
    success: false,
    error: "Too many requests. Please try again later.",
    code: "RATE_LIMIT_EXCEEDED"
  },
  standardHeaders: true,
  legacyHeaders: false
});
var authRateLimiter = lib_default({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 20,
  // 20 attempts per window
  message: {
    success: false,
    error: "Too many authentication attempts. Please try again later.",
    code: "RATE_LIMIT_EXCEEDED"
  },
  standardHeaders: true,
  legacyHeaders: false
});
var analysisRateLimiter = lib_default({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_FREE,
  message: {
    success: false,
    error: "Analysis rate limit exceeded. Upgrade to Pro for higher limits.",
    code: "RATE_LIMIT_EXCEEDED"
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  }
});

// src/routes/auth.routes.ts
var import_express = require("express");
var import_zod3 = require("zod");

// src/services/auth.service.ts
var import_bcryptjs = __toESM(require("bcryptjs"));
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));

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
async function disconnectDatabase() {
  await prisma.$disconnect();
  console.log("\u{1F4E6} Database disconnected");
}

// src/config/redis.ts
var import_ioredis = __toESM(require("ioredis"));
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
  const client = getRedisClient();
  try {
    await client.ping();
    console.log("\u2705 Redis ping successful");
  } catch (error) {
    console.error("\u274C Redis connection failed:", error);
  }
}
async function disconnectRedis() {
  if (redis) {
    await redis.quit();
    redis = null;
    console.log("\u{1F4E6} Redis disconnected");
  }
}
function createBullMQConnection() {
  return new import_ioredis.default(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false
  });
}

// src/services/auth.service.ts
var SALT_ROUNDS = 12;
function generateToken(user) {
  return import_jsonwebtoken.default.sign(
    { id: user.id, email: user.email, plan: user.plan },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}
function sanitizeUser(user) {
  const { password_hash, ...safeUser } = user;
  return safeUser;
}
async function register(data) {
  const existing = await prisma.user.findUnique({
    where: { email: data.email }
  });
  if (existing) {
    throw new ValidationError("An account with this email already exists.");
  }
  if (data.password.length < 8) {
    throw new ValidationError("Password must be at least 8 characters long.");
  }
  const password_hash = await import_bcryptjs.default.hash(data.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase().trim(),
      password_hash,
      name: data.name?.trim() || null
    }
  });
  const token = generateToken(user);
  return {
    user: sanitizeUser(user),
    token
  };
}
async function login(data) {
  const user = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase().trim() }
  });
  if (!user) {
    throw new AuthError("Invalid email or password.");
  }
  const isValid = await import_bcryptjs.default.compare(data.password, user.password_hash);
  if (!isValid) {
    throw new AuthError("Invalid email or password.");
  }
  const token = generateToken(user);
  return {
    user: sanitizeUser(user),
    token
  };
}
async function logout(token) {
  try {
    const decoded = import_jsonwebtoken.default.decode(token);
    if (decoded && decoded.exp) {
      const ttl = decoded.exp - Math.floor(Date.now() / 1e3);
      if (ttl > 0) {
        const redis2 = getRedisClient();
        await redis2.setex(`auth:blacklist:${token}`, ttl, "1");
      }
    }
  } catch {
  }
  return { message: "Logged out successfully." };
}
async function getProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: {
          analyses: true,
          alerts: true
        }
      }
    }
  });
  if (!user) {
    throw new NotFoundError("User not found.");
  }
  return sanitizeUser(user);
}
async function updateProfile(userId, data) {
  const updateData = {};
  if (data.name !== void 0) {
    updateData.name = data.name.trim();
  }
  if (data.password) {
    if (data.password.length < 8) {
      throw new ValidationError("Password must be at least 8 characters long.");
    }
    updateData.password_hash = await import_bcryptjs.default.hash(data.password, SALT_ROUNDS);
  }
  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData
  });
  return sanitizeUser(user);
}
async function refreshToken(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  if (!user) {
    throw new NotFoundError("User not found.");
  }
  const token = generateToken(user);
  return { token };
}

// src/controllers/auth.controller.ts
async function register2(req, res, next) {
  try {
    const { email, password, name } = req.body;
    const result = await register({ email, password, name });
    res.cookie("__auth", result.token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1e3
      // 7 days
    });
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}
async function login2(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await login({ email, password });
    res.cookie("__auth", result.token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1e3
    });
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}
async function logout2(req, res, next) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "") || req.cookies?.__auth;
    const result = await logout(token || "");
    res.clearCookie("__auth");
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}
async function getProfile2(req, res, next) {
  try {
    const user = await getProfile(req.user.id);
    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
}
async function updateProfile2(req, res, next) {
  try {
    const user = await updateProfile(req.user.id, req.body);
    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
}
async function refreshToken2(req, res, next) {
  try {
    const result = await refreshToken(req.user.id);
    res.cookie("__auth", result.token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1e3
    });
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

// src/middleware/auth.middleware.ts
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"));
async function authMiddleware(req, _res, next) {
  try {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else if (req.cookies?.__auth) {
      token = req.cookies.__auth;
    }
    if (!token) {
      throw new AuthError("Authentication required. Please log in.");
    }
    const redis2 = getRedisClient();
    const isBlacklisted = await redis2.get(`auth:blacklist:${token}`);
    if (isBlacklisted) {
      throw new AuthError("Token has been invalidated. Please log in again.");
    }
    const decoded = import_jsonwebtoken2.default.verify(token, env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      plan: decoded.plan
    };
    next();
  } catch (error) {
    if (error instanceof AuthError) {
      next(error);
    } else if (error instanceof import_jsonwebtoken2.default.TokenExpiredError) {
      next(new AuthError("Token expired. Please log in again."));
    } else if (error instanceof import_jsonwebtoken2.default.JsonWebTokenError) {
      next(new AuthError("Invalid token. Please log in again."));
    } else {
      next(new AuthError("Authentication failed."));
    }
  }
}

// src/middleware/validate.middleware.ts
var import_zod2 = require("zod");
function validate(schema, source = "body") {
  return (req, _res, next) => {
    try {
      const data = schema.parse(req[source]);
      req[source] = data;
      next();
    } catch (error) {
      if (error instanceof import_zod2.ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message
        }));
        next(new ValidationError("Invalid request data", formattedErrors));
      } else {
        next(error);
      }
    }
  };
}

// src/routes/auth.routes.ts
var router = (0, import_express.Router)();
var registerSchema = import_zod3.z.object({
  email: import_zod3.z.string().email("Invalid email address"),
  password: import_zod3.z.string().min(8, "Password must be at least 8 characters"),
  name: import_zod3.z.string().min(1).max(100).optional()
});
var loginSchema = import_zod3.z.object({
  email: import_zod3.z.string().email("Invalid email address"),
  password: import_zod3.z.string().min(1, "Password is required")
});
var updateProfileSchema = import_zod3.z.object({
  name: import_zod3.z.string().min(1).max(100).optional(),
  password: import_zod3.z.string().min(8).optional()
});
router.post(
  "/register",
  authRateLimiter,
  validate(registerSchema),
  register2
);
router.post(
  "/login",
  authRateLimiter,
  validate(loginSchema),
  login2
);
router.post("/logout", authMiddleware, logout2);
router.get("/me", authMiddleware, getProfile2);
router.patch(
  "/me",
  authMiddleware,
  validate(updateProfileSchema),
  updateProfile2
);
router.post("/refresh", authMiddleware, refreshToken2);
var auth_routes_default = router;

// src/routes/health.routes.ts
var import_express2 = require("express");

// src/config/queue.ts
var import_bullmq = require("bullmq");
var ANALYSIS_QUEUE_NAME = "analysis-queue";
var analysisQueue = null;
function getAnalysisQueue() {
  if (!analysisQueue) {
    analysisQueue = new import_bullmq.Queue(ANALYSIS_QUEUE_NAME, {
      connection: createBullMQConnection(),
      defaultJobOptions: {
        attempts: 2,
        backoff: {
          type: "exponential",
          delay: 5e3
        },
        removeOnComplete: {
          age: 86400,
          // 24 hours
          count: 100
        },
        removeOnFail: {
          age: 172800
          // 48 hours
        }
      }
    });
    console.log("\u2705 BullMQ analysis queue initialized");
  }
  return analysisQueue;
}

// src/routes/health.routes.ts
var router2 = (0, import_express2.Router)();
router2.get("/", async (_req, res) => {
  const health = {
    status: "ok",
    uptime: process.uptime(),
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    db: "disconnected",
    redis: "disconnected",
    queue: "unknown"
  };
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.db = "connected";
  } catch {
    health.db = "disconnected";
    health.status = "degraded";
  }
  try {
    const redis2 = getRedisClient();
    await redis2.ping();
    health.redis = "connected";
  } catch {
    health.redis = "disconnected";
    health.status = "degraded";
  }
  try {
    const queue = getAnalysisQueue();
    const waiting = await queue.getWaitingCount();
    const active = await queue.getActiveCount();
    health.queue = `active: ${active}, waiting: ${waiting}`;
  } catch {
    health.queue = "unavailable";
  }
  const statusCode = health.status === "ok" ? 200 : 503;
  res.status(statusCode).json({
    success: true,
    data: health
  });
});
var health_routes_default = router2;

// src/routes/analysis.routes.ts
var import_express3 = require("express");
var import_zod4 = require("zod");

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

// src/services/analysis.service.ts
async function createAnalysis(userId, url) {
  const detection = detectPlatform(url);
  if (!detection.isValid) {
    throw new ValidationError(detection.error || "Unsupported URL");
  }
  const redis2 = getRedisClient();
  const cacheKey = `analysis:recent:${userId}:${Buffer.from(url).toString("base64").slice(0, 50)}`;
  const recentAnalysisId = await redis2.get(cacheKey);
  if (recentAnalysisId) {
    const existing = await prisma.analysis.findUnique({
      where: { id: recentAnalysisId }
    });
    if (existing && ["PENDING", "PROCESSING", "COMPLETED"].includes(existing.status) && existing.product_name !== "Unknown Product") {
      return {
        analysis_id: existing.id,
        job_id: existing.job_id,
        status: existing.status,
        cached: true
      };
    }
  }
  const analysis = await prisma.analysis.create({
    data: {
      user_id: userId,
      url,
      platform: detection.platform,
      status: "PENDING"
    }
  });
  const queue = getAnalysisQueue();
  const job = await queue.add(
    "analyze-product",
    {
      url,
      analysisId: analysis.id,
      userId
    },
    {
      jobId: `analysis-${analysis.id}`,
      priority: 1
    }
  );
  await prisma.analysis.update({
    where: { id: analysis.id },
    data: { job_id: job.id }
  });
  await redis2.setex(cacheKey, 3600, analysis.id);
  await redis2.setex(`analysis:progress:${job.id}`, 3600, "0");
  return {
    analysis_id: analysis.id,
    job_id: job.id,
    status: "PENDING",
    cached: false
  };
}
async function getAnalysisStatus(analysisId, userId) {
  const analysis = await prisma.analysis.findUnique({
    where: { id: analysisId }
  });
  if (!analysis) {
    throw new NotFoundError("Analysis not found");
  }
  if (analysis.user_id !== userId) {
    throw new ForbiddenError("Access denied");
  }
  let progress_pct = 0;
  if (analysis.job_id && ["PENDING", "PROCESSING"].includes(analysis.status)) {
    const redis2 = getRedisClient();
    const cached = await redis2.get(`analysis:progress:${analysis.job_id}`);
    progress_pct = cached ? parseInt(cached, 10) : 0;
  } else if (analysis.status === "COMPLETED") {
    progress_pct = 100;
  }
  let step = "";
  if (progress_pct < 10) step = "Starting analysis...";
  else if (progress_pct < 30) step = "Scraping product page...";
  else if (progress_pct < 55) step = "Analyzing reviews...";
  else if (progress_pct < 70) step = "Checking seller reputation...";
  else if (progress_pct < 85) step = "Comparing prices...";
  else if (progress_pct < 100) step = "Generating verdict...";
  else step = "Analysis complete";
  return {
    id: analysis.id,
    status: analysis.status,
    progress_pct,
    step,
    error_message: analysis.error_message
  };
}
async function getAnalysis(analysisId, userId) {
  const redis2 = getRedisClient();
  const cacheKey = `analysis:result:${analysisId}`;
  const cached = await redis2.get(cacheKey);
  if (cached) {
    const parsed = JSON.parse(cached);
    if (parsed.user_id === userId) {
      return parsed;
    }
  }
  const analysis = await prisma.analysis.findUnique({
    where: { id: analysisId },
    include: {
      reviews: true,
      price_comparisons: {
        orderBy: { price: "asc" }
      }
    }
  });
  if (!analysis) {
    throw new NotFoundError("Analysis not found");
  }
  if (analysis.user_id !== userId) {
    throw new ForbiddenError("Access denied");
  }
  if (analysis.status === "COMPLETED") {
    await redis2.setex(cacheKey, 86400, JSON.stringify(analysis));
  }
  return analysis;
}
async function listAnalyses(userId, params) {
  const { page, limit, status } = params;
  const skip = (page - 1) * limit;
  const where = { user_id: userId };
  if (status) {
    where.status = status;
  }
  const [analyses, total] = await Promise.all([
    prisma.analysis.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        url: true,
        platform: true,
        status: true,
        product_name: true,
        product_image: true,
        authenticity_score: true,
        trust_label: true,
        recommendation: true,
        created_at: true,
        completed_at: true
      }
    }),
    prisma.analysis.count({ where })
  ]);
  const meta = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  };
  return { analyses, meta };
}
async function deleteAnalysis(analysisId, userId) {
  const analysis = await prisma.analysis.findUnique({
    where: { id: analysisId }
  });
  if (!analysis) {
    throw new NotFoundError("Analysis not found");
  }
  if (analysis.user_id !== userId) {
    throw new ForbiddenError("Access denied");
  }
  await prisma.analysis.delete({
    where: { id: analysisId }
  });
  const redis2 = getRedisClient();
  await redis2.del(`analysis:result:${analysisId}`);
  return { message: "Analysis deleted successfully" };
}
async function getReviewBreakdown(analysisId, userId) {
  const analysis = await prisma.analysis.findUnique({
    where: { id: analysisId },
    include: { reviews: true }
  });
  if (!analysis) throw new NotFoundError("Analysis not found");
  if (analysis.user_id !== userId) throw new ForbiddenError("Access denied");
  return {
    reviews: analysis.reviews,
    stats: analysis.reviews[0] || null
  };
}
async function getPriceComparisons(analysisId, userId) {
  const analysis = await prisma.analysis.findUnique({
    where: { id: analysisId },
    include: {
      price_comparisons: {
        orderBy: { price: "asc" }
      }
    }
  });
  if (!analysis) throw new NotFoundError("Analysis not found");
  if (analysis.user_id !== userId) throw new ForbiddenError("Access denied");
  return {
    comparisons: analysis.price_comparisons
  };
}

// src/controllers/analysis.controller.ts
async function createAnalysis2(req, res, next) {
  try {
    const { url } = req.body;
    const result = await createAnalysis(req.user.id, url);
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}
async function listAnalyses2(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const status = req.query.status;
    const result = await listAnalyses(req.user.id, {
      page,
      limit,
      status
    });
    res.status(200).json({
      success: true,
      data: result.analyses,
      meta: result.meta
    });
  } catch (error) {
    next(error);
  }
}
async function getAnalysis2(req, res, next) {
  try {
    const analysis = await getAnalysis(
      req.params.id,
      req.user.id
    );
    res.status(200).json({
      success: true,
      data: { analysis }
    });
  } catch (error) {
    next(error);
  }
}
async function getAnalysisStatus2(req, res, next) {
  try {
    const status = await getAnalysisStatus(
      req.params.id,
      req.user.id
    );
    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    next(error);
  }
}
async function deleteAnalysis2(req, res, next) {
  try {
    const result = await deleteAnalysis(
      req.params.id,
      req.user.id
    );
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}
async function getReviewBreakdown2(req, res, next) {
  try {
    const result = await getReviewBreakdown(
      req.params.id,
      req.user.id
    );
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}
async function getPriceComparisons2(req, res, next) {
  try {
    const result = await getPriceComparisons(
      req.params.id,
      req.user.id
    );
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

// src/routes/analysis.routes.ts
var router3 = (0, import_express3.Router)();
router3.use(authMiddleware);
var createAnalysisSchema = import_zod4.z.object({
  url: import_zod4.z.string().url("Please provide a valid URL")
});
router3.post(
  "/",
  analysisRateLimiter,
  validate(createAnalysisSchema),
  createAnalysis2
);
router3.get("/", listAnalyses2);
router3.get("/:id", getAnalysis2);
router3.get("/:id/status", getAnalysisStatus2);
router3.delete("/:id", deleteAnalysis2);
router3.get("/:id/reviews", getReviewBreakdown2);
router3.get("/:id/prices", getPriceComparisons2);
var analysis_routes_default = router3;

// src/routes/alert.routes.ts
var import_express4 = require("express");
var import_zod5 = require("zod");

// src/controllers/alert.controller.ts
async function createAlert(req, res, next) {
  try {
    const { product_url, platform, target_price } = req.body;
    const alert = await prisma.priceAlert.create({
      data: {
        user_id: req.user.id,
        product_url,
        platform,
        target_price
      }
    });
    res.status(201).json({
      success: true,
      data: { alert }
    });
  } catch (error) {
    next(error);
  }
}
async function listAlerts(req, res, next) {
  try {
    const alerts = await prisma.priceAlert.findMany({
      where: { user_id: req.user.id },
      orderBy: { created_at: "desc" }
    });
    res.status(200).json({
      success: true,
      data: { alerts }
    });
  } catch (error) {
    next(error);
  }
}
async function deleteAlert(req, res, next) {
  try {
    const alert = await prisma.priceAlert.findUnique({
      where: { id: req.params.id }
    });
    if (!alert) {
      throw new NotFoundError("Alert not found");
    }
    if (alert.user_id !== req.user.id) {
      throw new ForbiddenError("Access denied");
    }
    await prisma.priceAlert.delete({
      where: { id: req.params.id }
    });
    res.status(200).json({
      success: true,
      data: { message: "Alert deleted successfully" }
    });
  } catch (error) {
    next(error);
  }
}

// src/routes/alert.routes.ts
var router4 = (0, import_express4.Router)();
router4.use(authMiddleware);
var createAlertSchema = import_zod5.z.object({
  product_url: import_zod5.z.string().url("Please provide a valid URL"),
  platform: import_zod5.z.string().min(1),
  target_price: import_zod5.z.number().positive("Target price must be positive")
});
router4.post("/", validate(createAlertSchema), createAlert);
router4.get("/", listAlerts);
router4.delete("/:id", deleteAlert);
var alert_routes_default = router4;

// src/app.ts
var app = (0, import_express5.default)();
app.use((0, import_helmet.default)());
app.use((0, import_cors.default)({
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use((0, import_compression.default)());
app.use(import_express5.default.json({ limit: "10mb" }));
app.use(import_express5.default.urlencoded({ extended: true }));
app.use((0, import_cookie_parser.default)());
if (env.NODE_ENV !== "test") {
  app.use((0, import_morgan.default)("dev"));
}
app.use("/api/", generalRateLimiter);
var swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TrustCart API",
      version: "1.0.0",
      description: "AI-powered product authenticity & price comparison platform for Indian e-commerce.",
      contact: {
        name: "TrustCart Team"
      }
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api/v1`,
        description: "Development server"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }
  },
  apis: ["./src/routes/*.ts"]
};
var swaggerSpec = (0, import_swagger_jsdoc.default)(swaggerOptions);
app.use("/api/v1/docs", import_swagger_ui_express.default.serve, import_swagger_ui_express.default.setup(swaggerSpec, {
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "TrustCart API Docs"
}));
app.use("/api/v1/auth", auth_routes_default);
app.use("/api/v1/health", health_routes_default);
app.use("/api/v1/analyses", analysis_routes_default);
app.use("/api/v1/alerts", alert_routes_default);
app.get("/", (_req, res) => {
  res.json({
    success: true,
    data: {
      name: "TrustCart API",
      version: "1.0.0",
      docs: "/api/v1/docs",
      health: "/api/v1/health"
    }
  });
});
app.use(notFoundHandler);
app.use(errorMiddleware);
var app_default = app;

// src/index.ts
async function bootstrap() {
  try {
    await connectDatabase();
    await connectRedis();
    const server = app_default.listen(env.PORT, () => {
      logger.info(`\u{1F680} TrustCart API running on port ${env.PORT}`);
      logger.info(`\u{1F4DA} API Docs: http://localhost:${env.PORT}/api/v1/docs`);
      logger.info(`\u{1F50D} Health: http://localhost:${env.PORT}/api/v1/health`);
      logger.info(`\u{1F30D} Environment: ${env.NODE_ENV}`);
    });
    const shutdown = async (signal) => {
      logger.info(`
${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        logger.info("HTTP server closed");
        await disconnectDatabase();
        await disconnectRedis();
        process.exit(0);
      });
      setTimeout(() => {
        logger.error("Forced shutdown after timeout");
        process.exit(1);
      }, 1e4);
    };
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("unhandledRejection", (reason) => {
      logger.error("Unhandled Rejection:", reason);
    });
    process.on("uncaughtException", (error) => {
      logger.error("Uncaught Exception:", error);
      process.exit(1);
    });
  } catch (error) {
    logger.error("Failed to bootstrap application:", error);
    process.exit(1);
  }
}
bootstrap();
