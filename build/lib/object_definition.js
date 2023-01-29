"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var object_definition_exports = {};
__export(object_definition_exports, {
  stateAttrb: () => stateAttrb
});
module.exports = __toCommonJS(object_definition_exports);
const stateAttrb = {
  time: {
    name: "Time",
    desc: "Time of the last update",
    type: "number",
    role: "value.time",
    def: 0,
    read: true,
    write: false
  },
  time_rcvd: {
    name: "Time Received",
    desc: "Time Received of the last update",
    type: "number",
    role: "value.time",
    def: 0,
    read: true,
    write: false
  },
  battery_level: {
    name: "Battery Level",
    desc: "Battery Level of the device",
    type: "number",
    role: "value.battery",
    unit: "%",
    def: 0,
    read: true,
    write: false
  },
  clip_mounted_state: {
    name: "Clip Mounted State",
    desc: "Clip Mounted State of the device",
    type: "string",
    role: "indicator",
    def: "null",
    read: true,
    write: false
  },
  _id: {
    name: "ID",
    desc: "ID of the device",
    type: "string",
    role: "value",
    def: "",
    read: true,
    write: false
  },
  _type: {
    name: "Type",
    desc: "Type of the device",
    type: "string",
    role: "value",
    def: "",
    read: true,
    write: false
  },
  _version: {
    name: "Version",
    desc: "Version of the device",
    type: "string",
    role: "value",
    def: "",
    read: true,
    write: false
  },
  report_id: {
    name: "Report ID",
    desc: "Report ID of the device",
    type: "string",
    role: "value",
    def: "",
    read: true,
    write: false
  },
  power_saving_zone_id: {
    name: "Power Saving Zone ID",
    desc: "Power Saving Zone ID of the device",
    type: "string",
    role: "value",
    def: "null",
    read: true,
    write: false
  },
  hw_status: {
    name: "Hardware Status",
    desc: "Hardware Status of the device",
    type: "string",
    role: "value",
    def: "null",
    read: true,
    write: false
  },
  hw_id: {
    name: "Hardware ID",
    desc: "Hardware ID of the device",
    type: "string",
    role: "value",
    def: "null",
    read: true,
    write: false
  },
  hw_type: {
    name: "Hardware Type",
    desc: "Hardware Type of the device",
    type: "string",
    role: "value",
    def: "null",
    read: true,
    write: false
  },
  model_number: {
    name: "Model Number",
    desc: "Model Number of the device",
    type: "string",
    role: "value",
    def: "null",
    read: true,
    write: false
  },
  bluetooth_mac: {
    name: "Bluetooth MAC",
    desc: "Bluetooth MAC of the device",
    type: "string",
    role: "value",
    def: "null",
    read: true,
    write: false
  },
  geofence_sensitivity: {
    name: "Geofence Sensitivity",
    desc: "Geofence Sensitivity of the device",
    type: "string",
    role: "value",
    def: "null",
    read: true,
    write: false
  },
  battery_save_mode: {
    name: "Battery Save Mode",
    desc: "Battery Save Mode of the device",
    type: "string",
    role: "value",
    def: "null",
    read: true,
    write: false
  },
  read_only: {
    name: "Read Only",
    desc: "Read Only of the device",
    type: "boolean",
    role: "indicator",
    def: false,
    read: true,
    write: false
  },
  demo: {
    name: "Demo",
    type: "boolean",
    role: "indicator",
    def: false,
    read: true,
    write: false
  },
  self_test_available: {
    name: "Self Test Available",
    desc: "Self Test Available of the device",
    type: "boolean",
    role: "indicator",
    def: false,
    read: true,
    write: false
  },
  capabilities: {
    name: "Capabilities",
    desc: "Capabilities of the device",
    type: "string",
    role: "json",
    def: "[]",
    read: true,
    write: false
  },
  supported_geofence_types: {
    name: "Supported Geofence Types",
    desc: "Supported Geofence Types of the device",
    type: "string",
    role: "json",
    def: "[]",
    read: true,
    write: false
  },
  fw_version: {
    name: "Firmware Version",
    desc: "Firmware Version of the device",
    type: "string",
    role: "value",
    def: "null",
    read: true,
    write: false
  },
  state: {
    name: "State",
    desc: "State of the device",
    type: "string",
    role: "value",
    def: "null",
    read: true,
    write: false
  },
  state_reason: {
    name: "State Reason",
    desc: "State Reason of the device",
    type: "string",
    role: "value",
    def: "null",
    read: true,
    write: false
  },
  charging_state: {
    name: "Charging State",
    desc: "Charging State of the device",
    type: "string",
    role: "value",
    def: "null",
    read: true,
    write: false
  },
  battery_state: {
    name: "Battery State",
    desc: "Battery State of the device",
    type: "string",
    role: "value",
    def: "null",
    read: true,
    write: false
  },
  positions: {
    name: "Positions Array",
    desc: "Positions Array of the device",
    type: "string",
    role: "json",
    def: "[]",
    read: true,
    write: false
  },
  sensor_used: {
    name: "Sensor Used",
    desc: "Sensor Used of the device",
    type: "string",
    role: "value",
    def: "null",
    read: true,
    write: false
  },
  pos_status: {
    name: "Position Status",
    desc: "Position Status of the device",
    type: "string",
    role: "value",
    def: "null",
    read: true,
    write: false
  },
  latlong: {
    name: "Latitude/Longitude",
    desc: "Latitude/Longitude of the device",
    type: "string",
    role: "json",
    def: "null",
    read: true,
    write: false
  },
  latitude: {
    name: "Latitude",
    desc: "Latitude of the device",
    type: "number",
    role: "value.gps.latitude",
    def: 0,
    read: true,
    write: false
  },
  longitude: {
    name: "Longitude",
    desc: "Longitude of the device",
    type: "number",
    role: "value.gps.longitude",
    def: 0,
    read: true,
    write: false
  },
  speed: {
    name: "Speed",
    desc: "Speed in meters per second",
    type: "number",
    role: "value.gps.speed",
    def: null,
    read: true,
    write: false
  },
  pos_uncertainty: {
    name: "Position Uncertainty",
    desc: "Position Uncertainty in meters",
    type: "number",
    role: "value",
    def: null,
    read: true,
    write: false
  },
  altitude: {
    name: "Altitude",
    desc: "Altitude in meters",
    type: "number",
    role: "value.gps.altitude",
    def: null,
    read: true,
    write: false
  },
  nearby_user_id: {
    name: "Nearby User ID",
    desc: "Nearby User ID",
    type: "string",
    role: "value",
    def: null,
    read: true,
    write: false
  },
  user_id: {
    name: "User ID",
    desc: "User ID",
    type: "string",
    role: "value",
    def: null,
    read: true,
    write: false
  },
  client_id: {
    name: "Client ID",
    desc: "Client ID",
    type: "string",
    role: "value",
    def: null,
    read: true,
    write: false
  },
  expires_at: {
    name: "Expires At",
    desc: "Expires token date",
    type: "string",
    role: "value.time",
    def: null,
    read: true,
    write: false
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  stateAttrb
});
//# sourceMappingURL=object_definition.js.map
