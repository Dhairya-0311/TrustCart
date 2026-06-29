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
var import_app = __toESM(require("./app"));
var import_env = require("./config/env");
var import_database = require("./config/database");
var import_redis = require("./config/redis");
var import_logger = require("./utils/logger");
async function bootstrap() {
  try {
    await (0, import_database.connectDatabase)();
    await (0, import_redis.connectRedis)();
    const server = import_app.default.listen(import_env.env.PORT, () => {
      import_logger.logger.info(`\u{1F680} TrustCart API running on port ${import_env.env.PORT}`);
      import_logger.logger.info(`\u{1F4DA} API Docs: http://localhost:${import_env.env.PORT}/api/v1/docs`);
      import_logger.logger.info(`\u{1F50D} Health: http://localhost:${import_env.env.PORT}/api/v1/health`);
      import_logger.logger.info(`\u{1F30D} Environment: ${import_env.env.NODE_ENV}`);
    });
    const shutdown = async (signal) => {
      import_logger.logger.info(`
${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        import_logger.logger.info("HTTP server closed");
        await (0, import_database.disconnectDatabase)();
        await (0, import_redis.disconnectRedis)();
        process.exit(0);
      });
      setTimeout(() => {
        import_logger.logger.error("Forced shutdown after timeout");
        process.exit(1);
      }, 1e4);
    };
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("unhandledRejection", (reason) => {
      import_logger.logger.error("Unhandled Rejection:", reason);
    });
    process.on("uncaughtException", (error) => {
      import_logger.logger.error("Uncaught Exception:", error);
      process.exit(1);
    });
  } catch (error) {
    import_logger.logger.error("Failed to bootstrap application:", error);
    process.exit(1);
  }
}
bootstrap();
