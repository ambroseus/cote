"use strict";

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const parser = {
  bool: v => v != undefined ? v.toLowerCase() == 'true' : undefined,
  int: v => v != undefined ? parseInt(v, 10) : undefined,
  str: v => v,
  exists: v => !!v
};
const defaultOptions = {
  environment: '',
  useHostNames: false,
  broadcast: null,
  multicast: null
};
const envVarOptionsMap = {
  COTE_ENV: ['environment', parser.str],
  COTE_USE_HOST_NAMES: ['useHostNames', parser.exists],
  COTE_MULTICAST_ADDRESS: ['multicast', parser.str],
  COTE_CHECK_INTERVAL: ['checkInterval', parser.int],
  COTE_HELLO_INTERVAL: ['helloInterval', parser.int],
  COTE_HELLO_LOGS_ENABLED: ['helloLogsEnabled', parser.bool],
  COTE_STATUS_LOGS_ENABLED: ['statusLogsEnabled', parser.bool],
  COTE_LOG: ['log', parser.bool],
  COTE_NODE_TIMEOUT: ['nodeTimeout', parser.int]
};

module.exports = (options = {}) => {
  const environmentSettings = {};
  Object.entries(envVarOptionsMap).forEach(([envVar, [setting, parser]]) => {
    if (!(envVar in process.env)) return;
    const value = process.env[envVar];
    environmentSettings[setting] = parser(value);
  });

  if (!process.env.COTE_BROADCAST_ADDRESS && process.env.DOCKERCLOUD_IP_ADDRESS) {
    environmentSettings.broadcast = '10.7.255.255';
  }

  const keys = Object.keys(process.env).filter(k => k.slice(0, 15) == 'COTE_DISCOVERY_');
  keys.forEach(k => {
    const keyName = k.slice(15);
    const keyArray = keyName.split('_').map(k => k.toLowerCase());
    const pluginName = keyArray.shift();
    const pluginObj = environmentSettings[pluginName] = environmentSettings[pluginName] || {};
    keyArray.forEach(k => {
      pluginObj[k] = process.env[`COTE_DISCOVERY_${pluginName.toUpperCase()}_${k.toUpperCase()}`];
    }); // Discovery plugins (such as redis) may not have access to real IP addresses.
    // Therefore we automatically default to `true` for `COTE_USE_HOST_NAMES`,
    // since host names are accurate.

    environmentSettings.useHostNames = true;
  });
  return _objectSpread({}, defaultOptions, environmentSettings, options);
};
//# sourceMappingURL=options-builder.js.map