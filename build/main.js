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
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var utils = __toESM(require("@iobroker/adapter-core"));
var import_axios = __toESM(require("axios"));
var import_cron = require("cron");
var import_object_definition = require("./lib/object_definition");
var import_source_map_support = __toESM(require("source-map-support"));
var import_Helper = require("./lib/Helper");
import_source_map_support.default.install();
class TractiveGPS extends utils.Adapter {
  constructor(options = {}) {
    super({
      ...options,
      name: "tractive-gps"
    });
    this.on("ready", this.onReady.bind(this));
    this.on("stateChange", this.onStateChange.bind(this));
    this.on("message", this.onMessage.bind(this));
    this.on("unload", this.onUnload.bind(this));
    this.requestTimer = null;
    this.interval = 6e4;
    this.client_id = "5f9be055d8912eb21a4cd7ba";
    this.allData = {
      userInfo: {
        user_id: "",
        expires_at: 0
      },
      trackers: [],
      tracker: [],
      device_hw_report: [],
      positions: [],
      device_pos_report: []
    };
    this.secret = "";
  }
  async onReady() {
    this.writeLog(`[Adapter v.${this.version} onReady] Starting adapter`, "debug");
    this.interval = this.config.interval * 1e3 + Math.floor(Math.random() * 100);
    this.setState("info.connection", false, true);
    const obj = await this.getForeignObjectAsync("system.config");
    if (obj && obj.native && obj.native.secret) {
      this.secret = obj.native.secret;
      console.log("system.config.native.secret found!");
      this.writeLog(`system.config.native.secret found!`, "debug");
    } else {
      console.log("Could not find system.config.native.secret!");
      this.writeLog(`Could not find system.config.native.secret!`, "error");
    }
    console.log("this.secret: " + this.secret);
    if (this.config.email && this.config.password) {
      if (this.config.access_token.startsWith(`$/aes-192-cbc:`)) {
        this.writeLog(`Decrypting access_token`, "debug");
        await this.extendForeignObjectAsync(`system.adapter.${this.namespace}`, {
          native: {
            access_token: (0, import_Helper.encrypt)(this.secret, this.decrypt(this.config.access_token))
          }
        });
      }
      if (this.config.user_id && this.config.expires_at > 0 && this.config.access_token) {
        const now = Math.round(Date.now() / 1e3);
        if (this.config.expires_at < now) {
          this.writeLog(`[Adapter v.${this.version} onReady] access_token expired`, "debug");
          await this.getAccessToken();
          this.setState("info.connection", true, true);
        } else {
          this.writeLog(`[Adapter v.${this.version} onReady] access_token valid`, "debug");
          this.allData.userInfo.user_id = this.config.user_id;
          this.allData.userInfo.expires_at = this.config.expires_at;
          await this.createCronjob();
          this.writeLog(`[Adapter v.${this.version} onReady] start requestData`, "debug");
          await this.requestData();
          this.setState("info.connection", true, true);
        }
      } else {
        this.writeLog(
          `[Adapter v.${this.version} onReady] access_token not available call new access_token`,
          "debug"
        );
        await this.getAccessToken();
        this.setState("info.connection", true, true);
      }
    } else {
      this.writeLog(`[Adapter v.${this.version} onReady] email and password are required`, "error");
    }
  }
  async createCronjob() {
    this.writeLog(`[Adapter v.${this.version} createCronjob] create cronjob`, "debug");
    const expires_at = this.config.expires_at;
    console.log("expires_at: ", new Date(expires_at * 1e3));
    const cronjob = new import_cron.CronJob(
      new Date(expires_at * 1e3),
      async () => {
        this.writeLog(`[Adapter v.${this.version} createCronjob] get new access_token`, "debug");
        console.log(`[Adapter v.${this.version} createCronjob] get new access_token`);
        await this.getAccessToken();
      },
      null,
      true,
      "Europe/Berlin"
    );
    console.log("cronjob: ", cronjob);
  }
  async requestData() {
    if (this.requestTimer)
      this.clearTimeout(this.requestTimer);
    await this.getTrackers();
    await this.getTrackerInfo();
    await this.getTrackerDeviceHwReport();
    await this.getTrackerLocation();
    await this.createStates();
    await this.writeAllData();
    console.log("all data", this.allData);
    this.requestTimer = this.setTimeout(() => {
      this.writeLog(`[Adapter v.${this.version} requestData] next request in ${this.interval} ms`, "debug");
      this.requestData();
    }, this.interval);
  }
  async writeAllData() {
    for (const device of this.allData.trackers) {
      for (const [key, value] of Object.entries(device)) {
        await this.setStateAsync(`${device._id}.trackers.${key}`, { val: value, ack: true });
      }
    }
    for (const device of this.allData.tracker) {
      for (const [key, value] of Object.entries(device)) {
        if (typeof value === "object" && value !== null) {
          await this.setStateAsync(`${device._id}.tracker.${key}`, {
            val: JSON.stringify(value),
            ack: true
          });
        } else {
          await this.setStateAsync(`${device._id}.tracker.${key}`, { val: value, ack: true });
        }
      }
    }
    for (const device of this.allData.device_hw_report) {
      for (const [key, value] of Object.entries(device)) {
        if (typeof value === "object" && value !== null) {
          await this.setStateAsync(`${device._id}.device_hw_report.${key}`, {
            val: JSON.stringify(value),
            ack: true
          });
        } else {
          await this.setStateAsync(`${device._id}.device_hw_report.${key}`, { val: value, ack: true });
        }
      }
    }
    for (const device of this.allData.device_pos_report) {
      for (const [key, value] of Object.entries(device)) {
        if (key === "latlong") {
          await this.setStateAsync(`${device._id}.device_pos_report.${key}`, {
            val: JSON.stringify(value),
            ack: true
          });
          await this.setStateAsync(`${device._id}.device_pos_report.latitude`, {
            val: value[0],
            ack: true
          });
          await this.setStateAsync(`${device._id}.device_pos_report.longitude`, {
            val: value[1],
            ack: true
          });
        } else {
          if (typeof value === "object" && value !== null) {
            await this.setStateAsync(`${device._id}.device_pos_report.${key}`, {
              val: JSON.stringify(value),
              ack: true
            });
          } else {
            await this.setStateAsync(`${device._id}.device_pos_report.${key}`, { val: value, ack: true });
          }
        }
      }
      if (this.allData.positions.length !== 0) {
        for (const positionsDevice of this.allData.positions) {
          for (const [key, value] of Object.entries(positionsDevice)) {
            await this.setStateAsync(`${device._id}.positions.${key}`, {
              val: JSON.stringify(value),
              ack: true
            });
          }
        }
      } else {
        const obj = await this.getObjectAsync(`${device._id}.positions.0`);
        if (obj) {
          await this.setStateAsync(`${device._id}.positions.0`, {
            val: JSON.stringify([]),
            ack: true
          });
        }
      }
    }
    await this.setStateAsync("json", JSON.stringify(this.allData), true);
  }
  async createStates() {
    for (const device of this.allData.trackers) {
      if (this.config.nameArray.length > 0) {
        console.log("this.config.nameArray", this.config.nameArray);
        for (const object of this.config.nameArray) {
          if (object.id === device._id) {
            await this.extendObjectAsync(device._id, {
              type: "device",
              common: {
                name: object.name
              },
              native: {}
            });
            await this.extendObjectAsync(`${device._id}.trackers`, {
              type: "channel",
              common: {
                name: "trackers"
              },
              native: {}
            });
            await this.extendObjectAsync(`${device._id}.trackers.name`, {
              type: "state",
              common: {
                name: "name",
                desc: "name of the tracker",
                type: "string",
                role: "text",
                read: true,
                write: false
              },
              native: {}
            });
            await this.setStateAsync(`${device._id}.trackers.name`, {
              val: object.name,
              ack: true
            });
          }
        }
      } else {
        await this.extendObjectAsync(device._id, {
          type: "device",
          common: {
            name: device._id
          },
          native: {}
        });
        await this.extendObjectAsync(`${device._id}.trackers`, {
          type: "channel",
          common: {
            name: "trackers"
          },
          native: {}
        });
      }
      for (const [key] of Object.entries(device)) {
        const common = import_object_definition.stateAttrb[key];
        if (common) {
          await this.extendObjectAsync(`${device._id}.trackers.${key}`, {
            type: "state",
            common,
            native: {}
          });
        } else {
          this.writeLog(
            `[Adapter v.${this.version} createStates] no state attribute found for ${key}`,
            "warn"
          );
        }
      }
    }
    for (const device of this.allData.tracker) {
      await this.extendObjectAsync(`${device._id}.tracker`, {
        type: "channel",
        common: {
          name: "tracker"
        },
        native: {}
      });
      for (const [key] of Object.entries(device)) {
        const common = import_object_definition.stateAttrb[key];
        if (common) {
          await this.extendObjectAsync(`${device._id}.tracker.${key}`, {
            type: "state",
            common,
            native: {}
          });
        } else {
          this.writeLog(
            `[Adapter v.${this.version} createStates] no state attribute found for ${key} in tracker`,
            "warn"
          );
        }
      }
    }
    for (const device of this.allData.device_hw_report) {
      await this.extendObjectAsync(`${device._id}.device_hw_report`, {
        type: "channel",
        common: {
          name: "device hardware report"
        },
        native: {}
      });
      for (const [key] of Object.entries(device)) {
        const common = import_object_definition.stateAttrb[key];
        if (common) {
          await this.extendObjectAsync(`${device._id}.device_hw_report.${key}`, {
            type: "state",
            common,
            native: {}
          });
        } else {
          this.writeLog(
            `[Adapter v.${this.version} createStates] no state attribute found for ${key} in device_hw_report`,
            "warn"
          );
        }
      }
    }
    for (const device of this.allData.device_pos_report) {
      await this.extendObjectAsync(`${device._id}.device_pos_report`, {
        type: "channel",
        common: {
          name: "device position report"
        },
        native: {}
      });
      for (const [key] of Object.entries(device)) {
        const common = import_object_definition.stateAttrb[key];
        if (common) {
          if (key === "latlong") {
            await this.extendObjectAsync(`${device._id}.device_pos_report.${key}`, {
              type: "state",
              common,
              native: {}
            });
            await this.extendObjectAsync(`${device._id}.device_pos_report.latitude`, {
              type: "state",
              common: import_object_definition.stateAttrb["latitude"],
              native: {}
            });
            await this.extendObjectAsync(`${device._id}.device_pos_report.longitude`, {
              type: "state",
              common: import_object_definition.stateAttrb["longitude"],
              native: {}
            });
          } else {
            await this.extendObjectAsync(`${device._id}.device_pos_report.${key}`, {
              type: "state",
              common,
              native: {}
            });
          }
        } else {
          this.writeLog(
            `[Adapter v.${this.version} createStates] no state attribute found for ${key} in device_pos_report`,
            "warn"
          );
        }
      }
      for (const positionsDevice of this.allData.positions) {
        await this.extendObjectAsync(`${device._id}.positions`, {
          type: "channel",
          common: {
            name: "positions"
          },
          native: {}
        });
        for (const [key] of Object.entries(positionsDevice)) {
          const common = import_object_definition.stateAttrb["positions"];
          if (common) {
            await this.extendObjectAsync(`${device._id}.positions.${key}`, {
              type: "state",
              common,
              native: {}
            });
          } else {
            this.writeLog(
              `[Adapter v.${this.version} createStates] no state attribute found for ${key} in positions`,
              "warn"
            );
          }
        }
      }
    }
    await this.extendObjectAsync(`json`, {
      type: "state",
      common: {
        name: "json",
        desc: "all data from the api as json",
        type: "string",
        role: "json",
        read: true,
        write: false
      },
      native: {}
    });
  }
  writeLog(logText, logType) {
    if (logType === "silly")
      this.log.silly(logText);
    if (logType === "info")
      this.log.info(logText);
    if (logType === "debug")
      this.log.debug(logText);
    if (logType === "warn")
      this.log.warn(logText);
    if (logType === "error")
      this.log.error(logText);
  }
  async onStateChange(id, state) {
    if (state) {
      if (state.from === "system.adapter." + this.namespace) {
        return;
      } else {
        this.writeLog(
          `[Adapter v.${this.version} onStateChange] state ${id} changed: ${state.val} (ack = ${state.ack})`,
          "debug"
        );
      }
    } else {
      return;
    }
  }
  async getTrackers() {
    const url = `https://graph.tractive.com/3/user/${this.allData.userInfo.user_id}/trackers`;
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-tractive-client": this.client_id,
        "x-tractive-user": this.allData.userInfo.user_id,
        Authorization: `Bearer ${this.decrypt(this.config.access_token)}`
      }
    };
    try {
      const response = await (0, import_axios.default)(url, options);
      if (response.status === 200) {
        this.writeLog(
          `[Adapter v.${this.version} Axios V: ${import_axios.default.VERSION} getTrackers] response: ${JSON.stringify(
            response.data
          )}`,
          "debug"
        );
        if (response.data) {
          this.allData.trackers = response.data;
          this.writeLog(
            `[Adapter v.${this.version} Axios V: ${import_axios.default.VERSION}  getTrackers] trackers: ${JSON.stringify(
              this.allData.trackers
            )}`,
            "debug"
          );
          this.writeLog(
            `[Adapter v.${this.version} Axios V: ${import_axios.default.VERSION}  getTrackers] trackers: ${JSON.stringify(
              this.allData.trackers
            )}`,
            "debug"
          );
        } else {
          this.writeLog(`[Adapter v.${this.version} Axios V: ${import_axios.default.VERSION}  getTrackers] no data`, "warn");
        }
      } else {
        this.writeLog(
          `[Adapter v.${this.version} Axios V: ${import_axios.default.VERSION}  getTrackers] error: ${response.status}`,
          "error"
        );
        if (response.data) {
          this.writeLog(
            `[Adapter v.${this.version} Axios V: ${import_axios.default.VERSION}  getTrackers] response: ${JSON.stringify(
              response.data
            )}`,
            "error"
          );
        }
      }
    } catch (error) {
      this.writeLog(
        `[Adapter v.${this.version} Axios V: ${import_axios.default.VERSION}  getTrackers] error: ${error}`,
        "error"
      );
    }
  }
  async getTrackerInfo() {
    this.allData.tracker = [];
    for (const tracker of this.allData.trackers) {
      const url = `https://graph.tractive.com/3/tracker/${tracker._id}`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-tractive-client": this.client_id,
          "x-tractive-user": this.allData.userInfo.user_id,
          Authorization: `Bearer ${this.decrypt(this.config.access_token)}`
        }
      };
      try {
        const response = await (0, import_axios.default)(url, options);
        if (response.status === 200) {
          this.writeLog(
            `[Adapter v.${this.version} Axios V: ${import_axios.default.VERSION}  getTrackerInfo] response: ${JSON.stringify(response.data)}`,
            "debug"
          );
          if (response.data) {
            this.allData.tracker.push(response.data);
            this.writeLog(
              `[Adapter v.${this.version} Axios V: ${import_axios.default.VERSION}  getTrackerInfo] tracker: ${JSON.stringify(this.allData.tracker)}`,
              "debug"
            );
          } else {
            this.writeLog(
              `[Adapter v.${this.version} Axios V: ${import_axios.default.VERSION}  getTrackerInfo] no data`,
              "warn"
            );
          }
        }
      } catch (error) {
        this.writeLog(
          `[Adapter v.${this.version} Axios V: ${import_axios.default.VERSION}  getTrackerInfo] error: ${error}`,
          "error"
        );
      }
    }
  }
  async getTrackerDeviceHwReport() {
    this.allData.device_hw_report = [];
    for (const tracker of this.allData.trackers) {
      const url = `https://graph.tractive.com/3/device_hw_report/${tracker._id}`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-tractive-client": this.client_id,
          "x-tractive-user": this.allData.userInfo.user_id,
          Authorization: `Bearer ${this.decrypt(this.config.access_token)}`
        }
      };
      try {
        const response = await (0, import_axios.default)(url, options);
        if (response.status === 200) {
          this.writeLog(
            `[Adapter v.${this.version} Axios V: ${import_axios.default.VERSION}  getTrackerDeviceHwReport] response: ${JSON.stringify(response.data)}`,
            "debug"
          );
          if (response.data) {
            this.allData.device_hw_report.push(response.data);
            this.writeLog(
              `[Adapter v.${this.version} Axios V: ${import_axios.default.VERSION}  getTrackerDeviceHwReport] trackerDeviceHwReport: ${JSON.stringify(
                this.allData.device_hw_report
              )}`,
              "debug"
            );
          } else {
            this.writeLog(
              `[Adapter v.${this.version} Axios V: ${import_axios.default.VERSION}  getTrackerDeviceHwReport] no data`,
              "warn"
            );
          }
        }
      } catch (error) {
        if (error.response && error.response.data.code === 4002) {
          this.writeLog(
            `[Adapter v.${this.version} Axios V: ${import_axios.default.VERSION}  getTrackerDeviceHwReport] warn: ${JSON.stringify(
              error.response.data.message
            )} - the tracker does not yet contain any data`,
            "warn"
          );
        } else {
          this.writeLog(
            `[Adapter v.${this.version} Axios V: ${import_axios.default.VERSION}  getTrackerDeviceHwReport] error: ${error}`,
            "error"
          );
        }
      }
    }
  }
  async getTrackerLocation() {
    this.allData.device_pos_report = [];
    for (const tracker of this.allData.trackers) {
      const url = `https://graph.tractive.com/3/device_pos_report/${tracker._id}`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-tractive-client": this.client_id,
          "x-tractive-user": this.allData.userInfo.user_id,
          Authorization: `Bearer ${this.decrypt(this.config.access_token)}`
        }
      };
      try {
        const response = await (0, import_axios.default)(url, options);
        if (response.status === 200) {
          this.writeLog(
            `[Adapter v.${this.version} Axios V: ${import_axios.default.VERSION}  getTrackerLocation] response: ${JSON.stringify(response.data)}`,
            "debug"
          );
          if (response.data) {
            this.allData.device_pos_report.push(response.data);
            this.writeLog(
              `[Adapter v.${this.version} Axios V: ${import_axios.default.VERSION}  getTrackerLocation] trackerLocation: ${JSON.stringify(this.allData.device_pos_report)}`,
              "debug"
            );
          } else {
            this.writeLog(
              `[Adapter v.${this.version} Axios V: ${import_axios.default.VERSION}  getTrackerLocation] no data`,
              "warn"
            );
          }
        }
      } catch (error) {
        if (error.response && error.response.data.code === 4002) {
          this.writeLog(
            `[Adapter v.${this.version} Axios V: ${import_axios.default.VERSION}  getTrackerLocation] warn: ${JSON.stringify(
              error.response.data.message
            )} - the tracker does not yet contain any data`,
            "warn"
          );
        } else {
          this.writeLog(
            `[Adapter v.${this.version} Axios V: ${import_axios.default.VERSION}  getTrackerLocation] error: ${error}`,
            "error"
          );
        }
      }
    }
  }
  async getTrackerPosition(time_from, time_to) {
    this.allData.positions = [];
    for (const tracker of this.allData.trackers) {
      const url = `https://graph.tractive.com/3/tracker/${tracker._id}/positions?time_from=${time_from}&time_to=${time_to}&format=json_segments`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-tractive-client": this.client_id,
          "x-tractive-user": this.allData.userInfo.user_id,
          Authorization: `Bearer ${this.decrypt(this.config.access_token)}`
        }
      };
      try {
        const response = await (0, import_axios.default)(url, options);
        if (response.status === 200) {
          this.writeLog(
            `[Adapter v.${this.version} Axios V: ${import_axios.default.VERSION}  getTrackerPosition] response: ${JSON.stringify(response.data)}`,
            "debug"
          );
          if (response.data) {
            this.allData.positions.push(response.data);
            const testdata = {};
            testdata[tracker._id] = response.data;
            this.writeLog(
              `[Adapter v.${this.version} Axios V: ${import_axios.default.VERSION}  getTrackerPosition] trackerPosition: ${JSON.stringify(this.allData.positions)}`,
              "debug"
            );
          } else {
            this.writeLog(
              `[Adapter v.${this.version} Axios V: ${import_axios.default.VERSION}  getTrackerPosition] no data`,
              "warn"
            );
          }
        }
      } catch (error) {
        this.writeLog(
          `[Adapter v.${this.version} Axios V: ${import_axios.default.VERSION}  getTrackerPosition] error: ${error}`,
          "error"
        );
      }
    }
  }
  async onMessage(obj) {
    if (typeof obj === "object" && obj.message) {
      if (obj.command === "refreshToken") {
        this.writeLog(`[Adapter v.${this.version} onMessage] refresh the Token`, "debug");
        await this.getAccessToken();
        if (obj.callback)
          this.sendTo(obj.from, obj.command, "su", obj.callback);
      }
    }
  }
  async onUnload(callback) {
    try {
      this.writeLog(`[Adapter v.${this.version} onUnload] Adapter stopped`, "debug");
      if (this.requestTimer)
        this.clearTimeout(this.requestTimer);
      this.setState("info.connection", false, true);
      callback();
    } catch (e) {
      callback();
    }
  }
  async getAccessToken() {
    console.log("getAccessToken");
    const url = "https://graph.tractive.com/3/auth/token";
    console.log("url", url);
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tractive-client": this.client_id
      },
      data: {
        platform_email: this.config.email,
        platform_token: (0, import_Helper.decrypt)(this.secret, this.config.password),
        grant_type: "tractive"
      }
    };
    console.log("options", options);
    try {
      const response = await (0, import_axios.default)(url, options);
      console.log("response", response);
      if (response.status === 200) {
        this.writeLog(
          `[Adapter v.${this.version} Axios V: ${import_axios.default.VERSION}  getAccessToken] response: ${JSON.stringify(
            response.data
          )}`,
          "debug"
        );
        if (response.data) {
          const obj = await this.getForeignObjectAsync(`system.adapter.${this.namespace}`);
          if (obj) {
            obj.native.access_token = (0, import_Helper.encrypt)(this.secret, response.data.access_token);
            obj.native.user_id = response.data.user_id;
            obj.native.expires_at = response.data.expires_at;
            this.allData.userInfo.user_id = response.data.user_id;
            this.allData.userInfo.expires_at = response.data.expires_at;
            this.writeLog(
              `[Adapter v.${this.version} Axios V: ${import_axios.default.VERSION}  getAccessToken] obj: ${JSON.stringify(obj)}`,
              "debug"
            );
            await this.setForeignObjectAsync(`system.adapter.${this.namespace}`, obj);
            this.writeLog(
              `[Adapter v.${this.version} getAccessToken] new access_token: ${response.data.access_token}`,
              "debug"
            );
          }
        } else {
          this.writeLog(
            `[Adapter v.${this.version} Axios V: ${import_axios.default.VERSION} getAccessToken] no data`,
            "warn"
          );
        }
      } else {
        if (response.data) {
          this.writeLog(
            `[Adapter v.${this.version} Axios V: ${import_axios.default.VERSION} getAccessToken] ${response.status} ${response.statusText} ${response.data}`,
            "warn"
          );
        } else {
          this.writeLog(
            `[Adapter v.${this.version} Axios V: ${import_axios.default.VERSION} getAccessToken] ${response.status} ${response.statusText}`,
            "warn"
          );
        }
      }
    } catch (error) {
      this.writeLog(
        `[Adapter v.${this.version} Axios V: ${import_axios.default.VERSION} getAccessToken] error: ${error}`,
        "error"
      );
    }
  }
}
if (require.main !== module) {
  module.exports = (options) => new TractiveGPS(options);
} else {
  (() => new TractiveGPS())();
}
//# sourceMappingURL=main.js.map
