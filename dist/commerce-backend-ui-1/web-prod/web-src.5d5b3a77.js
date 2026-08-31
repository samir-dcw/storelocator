// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

(function (
  modules,
  entry,
  mainEntry,
  parcelRequireName,
  externals,
  distDir,
  publicUrl,
  devServer
) {
  /* eslint-disable no-undef */
  var globalObject =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
      ? global
      : {};
  /* eslint-enable no-undef */

  // Save the require from previous bundle to this closure if any
  var previousRequire =
    typeof globalObject[parcelRequireName] === 'function' &&
    globalObject[parcelRequireName];

  var importMap = previousRequire.i || {};
  var cache = previousRequire.cache || {};
  // Do not use `require` to prevent Webpack from trying to bundle this call
  var nodeRequire =
    typeof module !== 'undefined' &&
    typeof module.require === 'function' &&
    module.require.bind(module);

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        if (externals[name]) {
          return externals[name];
        }
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire =
          typeof globalObject[parcelRequireName] === 'function' &&
          globalObject[parcelRequireName];
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

        var err = new Error("Cannot find module '" + name + "'");
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = (cache[name] = new newRequire.Module(name));

      modules[name][0].call(
        module.exports,
        localRequire,
        module,
        module.exports,
        globalObject
      );
    }

    return cache[name].exports;

    function localRequire(x) {
      var res = localRequire.resolve(x);
      if (res === false) {
        return {};
      }
      // Synthesize a module to follow re-exports.
      if (Array.isArray(res)) {
        var m = {__esModule: true};
        res.forEach(function (v) {
          var key = v[0];
          var id = v[1];
          var exp = v[2] || v[0];
          var x = newRequire(id);
          if (key === '*') {
            Object.keys(x).forEach(function (key) {
              if (
                key === 'default' ||
                key === '__esModule' ||
                Object.prototype.hasOwnProperty.call(m, key)
              ) {
                return;
              }

              Object.defineProperty(m, key, {
                enumerable: true,
                get: function () {
                  return x[key];
                },
              });
            });
          } else if (exp === '*') {
            Object.defineProperty(m, key, {
              enumerable: true,
              value: x,
            });
          } else {
            Object.defineProperty(m, key, {
              enumerable: true,
              get: function () {
                if (exp === 'default') {
                  return x.__esModule ? x.default : x;
                }
                return x[exp];
              },
            });
          }
        });
        return m;
      }
      return newRequire(res);
    }

    function resolve(x) {
      var id = modules[name][1][x];
      return id != null ? id : x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.require = nodeRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.distDir = distDir;
  newRequire.publicUrl = publicUrl;
  newRequire.devServer = devServer;
  newRequire.i = importMap;
  newRequire.register = function (id, exports) {
    modules[id] = [
      function (require, module) {
        module.exports = exports;
      },
      {},
    ];
  };

  // Only insert newRequire.load when it is actually used.
  // The code in this file is linted against ES5, so dynamic import is not allowed.
  // INSERT_LOAD_HERE

  Object.defineProperty(newRequire, 'root', {
    get: function () {
      return globalObject[parcelRequireName];
    },
  });

  globalObject[parcelRequireName] = newRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (mainEntry) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(mainEntry);

    // CommonJS
    if (typeof exports === 'object' && typeof module !== 'undefined') {
      module.exports = mainExports;

      // RequireJS
    } else if (typeof define === 'function' && define.amd) {
      define(function () {
        return mainExports;
      });
    }
  }
})({"vd4T0":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
var _uixGuest = require("@adobe/uix-guest");
var _configJson = require("./src/config.json");
var _configJsonDefault = parcelHelpers.interopDefault(_configJson);
function getExtensionIdFromReferrer() {
    if (!document.referrer) return null;
    const match = document.referrer.match(/\/extensionId\/([^/?#]+)/i);
    return match ? decodeURIComponent(match[1]) : null;
}
function getExtensionIdFromHostname() {
    const match = window.location.hostname.match(/^(.+)\.adobeio-static\.net$/i);
    return match ? match[1] : null;
}
function getExtensionId() {
    // Commerce Admin uses org-project-workspace casing in the menu URL, not the
    // lowercase runtime namespace hostname. Both the control frame and UI frame
    // must register/attach with the same id.
    return (0, _configJsonDefault.default).extensionId || getExtensionIdFromReferrer() || getExtensionIdFromHostname() || 'store_locator';
}
const EXTENSION_ID = getExtensionId();
const ACTION_PATH = '/api/v1/web/store-locator-actions/admin-store-api';
let guestConnectionPromise = null;
const emptyForm = ()=>({
        id: '',
        name: '',
        source_code: '',
        address: '',
        phone: '',
        hours: '',
        latitude: '',
        longitude: '',
        amenities: '',
        enabled: true
    });
function isEmbeddedInHost() {
    return window.parent !== window;
}
function isUiFrame() {
    return isEmbeddedInHost() && window.name.startsWith('uix-guest-');
}
function isControlFrame() {
    return isEmbeddedInHost() && !window.name;
}
function runtimeBaseUrl() {
    return window.location.origin.replace('adobeio-static.net', 'adobeioruntime.net');
}
async function getGuestConnection() {
    if (!isUiFrame()) return null;
    if (!guestConnectionPromise) guestConnectionPromise = (0, _uixGuest.attach)({
        id: EXTENSION_ID
    });
    return guestConnectionPromise;
}
async function getAuthHeaders() {
    const guest = await getGuestConnection();
    if (!guest) return {};
    const imsToken = guest.sharedContext.get('imsToken');
    const imsOrgId = guest.sharedContext.get('imsOrgId') || guest.sharedContext.get('imsOrg');
    if (!imsToken) throw new Error('Unable to read IMS credentials from Commerce Admin.');
    if (!imsOrgId) throw new Error('Unable to read IMS org ID from Commerce Admin.');
    return {
        Authorization: `Bearer ${imsToken}`,
        'x-gw-ims-org-id': imsOrgId,
        'Content-Type': 'application/json'
    };
}
async function callStoreApi(method, body) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${runtimeBaseUrl()}${ACTION_PATH}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });
    const payload = await response.json().catch(()=>({}));
    if (!response.ok) throw new Error(payload.error || `Request failed with status ${response.status}`);
    return payload;
}
function render(root, state) {
    const { stores, selectedId, form, status, error } = state;
    const selectedStore = stores.find((store)=>store.id === selectedId);
    root.innerHTML = `
    <header>
      <h1>Store Locator</h1>
      <button type="button" class="primary" data-action="refresh">Refresh</button>
    </header>
    ${error ? `<p class="error">${error}</p>` : ''}
    <div class="layout">
      <section class="panel">
        <h2>Stores</h2>
        <ul class="store-list">
          ${stores.length ? stores.map((store)=>`
              <li class="${store.id === selectedId ? 'active' : ''} ${store.enabled === false ? 'disabled' : ''}" data-store-id="${store.id}">
                <strong>${escapeHtml(store.name)}</strong>
                <span class="store-meta">${escapeHtml(store.id)}${store.enabled === false ? " \xb7 Disabled" : ''}</span>
              </li>
            `).join('') : '<li>No stores found.</li>'}
        </ul>
      </section>
      <section class="panel">
        <h2>${selectedStore ? 'Edit Store' : 'Add Store'}</h2>
        <form class="form-grid" data-form="store">
          <label>
            Store ID
            <input name="id" value="${escapeAttr(form.id)}" ${selectedStore ? 'readonly' : ''} required />
          </label>
          <label>
            Name
            <input name="name" value="${escapeAttr(form.name)}" required />
          </label>
          <label>
            Source Code
            <input name="source_code" value="${escapeAttr(form.source_code)}" />
          </label>
          <label>
            Address
            <textarea name="address" rows="2">${escapeHtml(form.address)}</textarea>
          </label>
          <label>
            Phone
            <input name="phone" value="${escapeAttr(form.phone)}" />
          </label>
          <label>
            Hours
            <input name="hours" value="${escapeAttr(form.hours)}" />
          </label>
          <label>
            Latitude
            <input name="latitude" value="${escapeAttr(form.latitude)}" />
          </label>
          <label>
            Longitude
            <input name="longitude" value="${escapeAttr(form.longitude)}" />
          </label>
          <label>
            Amenities (comma-separated)
            <input name="amenities" value="${escapeAttr(form.amenities)}" />
          </label>
          <label>
            <span>Enabled</span>
            <input type="checkbox" name="enabled" ${form.enabled ? 'checked' : ''} />
          </label>
          <div class="form-actions">
            <button type="submit" class="primary">${selectedStore ? 'Save Changes' : 'Create Store'}</button>
            <button type="button" data-action="new">New Store</button>
            ${selectedStore ? '<button type="button" class="danger" data-action="delete">Delete</button>' : ''}
          </div>
        </form>
        ${status ? `<p class="status">${escapeHtml(status)}</p>` : ''}
      </section>
    </div>
  `;
}
function escapeHtml(value) {
    return String(value !== null && value !== void 0 ? value : '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}
function escapeAttr(value) {
    return escapeHtml(value).replaceAll("'", '&#39;');
}
function readForm(root) {
    const formElement = root.querySelector('[data-form="store"]');
    const data = new FormData(formElement);
    return {
        id: String(data.get('id') || '').trim(),
        name: String(data.get('name') || '').trim(),
        source_code: String(data.get('source_code') || '').trim(),
        address: String(data.get('address') || '').trim(),
        phone: String(data.get('phone') || '').trim(),
        hours: String(data.get('hours') || '').trim(),
        latitude: String(data.get('latitude') || '').trim(),
        longitude: String(data.get('longitude') || '').trim(),
        amenities: String(data.get('amenities') || '').split(',').map((item)=>item.trim()).filter(Boolean),
        enabled: formElement.querySelector('[name="enabled"]').checked
    };
}
function storeToForm(store) {
    var _store_latitude, _store_longitude;
    return {
        id: store.id || '',
        name: store.name || '',
        source_code: store.source_code || '',
        address: store.address || '',
        phone: store.phone || '',
        hours: store.hours || '',
        latitude: (_store_latitude = store.latitude) !== null && _store_latitude !== void 0 ? _store_latitude : '',
        longitude: (_store_longitude = store.longitude) !== null && _store_longitude !== void 0 ? _store_longitude : '',
        amenities: Array.isArray(store.amenities) ? store.amenities.join(', ') : '',
        enabled: store.enabled !== false
    };
}
async function bootstrap() {
    const root = document.getElementById('root');
    if (isControlFrame()) {
        await (0, _uixGuest.register)({
            id: EXTENSION_ID,
            methods: {}
        });
        root.innerHTML = '';
        return;
    }
    if (isEmbeddedInHost() && !isUiFrame()) {
        root.innerHTML = '';
        return;
    }
    const state = {
        stores: [],
        selectedId: null,
        form: emptyForm(),
        status: isUiFrame() ? "Connecting to Commerce Admin\u2026" : '',
        error: ''
    };
    const update = ()=>{
        render(root, state);
        bindEvents();
    };
    const loadStores = async ()=>{
        state.error = '';
        state.status = "Loading stores\u2026";
        update();
        try {
            const payload = await callStoreApi('GET');
            state.stores = payload.items || [];
            state.status = `${state.stores.length} store(s) loaded.`;
        } catch (error) {
            state.error = error.message;
            state.status = '';
        }
        update();
    };
    const bindEvents = ()=>{
        var _root_querySelector, _root_querySelector1, _root_querySelector2, _root_querySelector3;
        (_root_querySelector = root.querySelector('[data-action="refresh"]')) === null || _root_querySelector === void 0 ? void 0 : _root_querySelector.addEventListener('click', ()=>{
            loadStores();
        });
        root.querySelectorAll('[data-store-id]').forEach((element)=>{
            element.addEventListener('click', ()=>{
                const store = state.stores.find((item)=>item.id === element.dataset.storeId);
                if (!store) return;
                state.selectedId = store.id;
                state.form = storeToForm(store);
                state.status = `Editing ${store.name}.`;
                update();
            });
        });
        (_root_querySelector1 = root.querySelector('[data-action="new"]')) === null || _root_querySelector1 === void 0 ? void 0 : _root_querySelector1.addEventListener('click', ()=>{
            state.selectedId = null;
            state.form = emptyForm();
            state.status = 'Creating a new store.';
            update();
        });
        (_root_querySelector2 = root.querySelector('[data-action="delete"]')) === null || _root_querySelector2 === void 0 ? void 0 : _root_querySelector2.addEventListener('click', async ()=>{
            if (!state.selectedId || !window.confirm(`Delete store ${state.selectedId}?`)) return;
            try {
                await callStoreApi('DELETE', {
                    id: state.selectedId
                });
                state.selectedId = null;
                state.form = emptyForm();
                state.status = 'Store deleted.';
                await loadStores();
            } catch (error) {
                state.error = error.message;
                update();
            }
        });
        (_root_querySelector3 = root.querySelector('[data-form="store"]')) === null || _root_querySelector3 === void 0 ? void 0 : _root_querySelector3.addEventListener('submit', async (event)=>{
            event.preventDefault();
            const payload = readForm(root);
            try {
                if (state.selectedId) {
                    await callStoreApi('PATCH', payload);
                    state.status = `Saved ${payload.name}.`;
                } else {
                    await callStoreApi('POST', payload);
                    state.selectedId = payload.id;
                    state.status = `Created ${payload.name}.`;
                }
                await loadStores();
                const refreshed = state.stores.find((store)=>store.id === state.selectedId);
                if (refreshed) state.form = storeToForm(refreshed);
                update();
            } catch (error) {
                state.error = error.message;
                update();
            }
        });
    };
    update();
    if (isUiFrame()) try {
        await getGuestConnection();
    } catch (error) {
        state.error = error.message;
        state.status = '';
        update();
        return;
    }
    await loadStores();
}
bootstrap().catch((error)=>{
    const root = document.getElementById('root');
    root.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`;
});

},{"@adobe/uix-guest":"fiXLU","./src/config.json":"81rC3","@parcel/transformer-js/src/esmodule-helpers.js":"4CjSt"}],"fiXLU":[function(require,module,exports,__globalThis) {
var _objectSpread = require("@swc/helpers/_/_object_spread");
var _objectSpreadProps = require("@swc/helpers/_/_object_spread_props");
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all)=>{
    for(var name in all)__defProp(target, name, {
        get: all[name],
        enumerable: true
    });
};
var __copyProps = (to, from, except, desc)=>{
    if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
            get: ()=>from[key],
            enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
    }
    return to;
};
var __toCommonJS = (mod)=>__copyProps(__defProp({}, "__esModule", {
        value: true
    }), mod);
// src/index.ts
var src_exports = {};
__export(src_exports, {
    GuestServer: ()=>GuestServer,
    GuestUI: ()=>GuestUI,
    PrimaryGuest: ()=>GuestServer,
    UIGuest: ()=>GuestUI,
    attach: ()=>attach,
    createGuest: ()=>createGuest,
    register: ()=>register
});
module.exports = __toCommonJS(src_exports);
// src/guest.ts
var import_uix_core2 = require("b288915145c74faf");
// src/debug-guest.ts
var import_uix_core = require("b288915145c74faf");
function debugGuest(guest) {
    return (0, import_uix_core.debugEmitter)(guest, {
        theme: "yellow medium",
        type: "Guest"
    }).listen("beforeconnect", (log, { detail: { guest: guest2 } })=>{
        log.info(guest2);
    }).listen("connecting", (log, { detail: { connection } })=>{
        log.info(connection);
    }).listen("connected", (log, { detail: { guest: guest2 } })=>{
        log.info(guest2);
    }).listen("error", (log, { detail: { error, guest: guest2 } })=>{
        log.error("\u274C Failed to connect! %s", error.message, guest2, error);
    });
}
// src/guest.ts
var SharedContext = class {
    reset(values) {
        this._map = new Map(Object.entries(values));
    }
    /**
   * @public
   * Retrieve a copy of a value from the {@link @adobe/uix-host#HostConfig.sharedContext} object. *Note that this is not a reference to any actual objects from the parent. If the parent updates an "inner object" inside the SharedContext, that change will not be reflected in the Guest!*
   */ get(key) {
        return this._map.get(key);
    }
    constructor(values){
        this.reset(values);
    }
};
var Guest2 = class extends import_uix_core2.Emitter {
    /**
   * @internal
   */ async invokeChecker(invoker, address) {
        try {
            const res = await invoker(address);
            return new Promise((resolve)=>resolve(res));
        } catch (e) {
            await new Promise((resolve)=>setTimeout(resolve, 500));
            return this.invokeChecker(invoker, address);
        }
    }
    /**
   * @internal
   */ async invokeAwaiter(invoker, address) {
        const final = setTimeout(()=>{
            return new Promise((resolve, reject)=>reject(`${address} doesn't exist`));
        }, 2e4);
        const res = await this.invokeChecker(invoker, address);
        return new Promise((resolve)=>{
            clearTimeout(final);
            return resolve(res);
        }).catch((e)=>{
            clearTimeout(final);
            return e;
        });
    }
    /** @internal */ getLocalMethods() {
        return {
            emit: (...args)=>{
                this.logger.log(`Event "${args[0]}" emitted from host`);
                this.emit(...args);
            }
        };
    }
    /**
   * Accept a connection from the Host.
   * @returns A Promise that resolves when the Host has established a connection.
   * @deprecated It is preferable to use {@link register} for primary frames,
   * and {@link attach} for UI frames and other secondary frames, than to
   * instantiate a Guest and then call `.connect()` on it. The latter style
   * returns an object that cannot be used until it is connected, and therefore
   * risks errors.
   * @public
   */ async connect() {
        return this._connect();
    }
    /**
   * @internal
   */ async _connect() {
        this.emit("beforeconnect", {
            guest: this
        });
        try {
            const hostConnectionPromise = (0, import_uix_core2.connectParentWindow)({
                targetOrigin: "*",
                timeout: this.timeout,
                logger: this.logger
            }, this.getLocalMethods());
            this.hostConnectionPromise = hostConnectionPromise;
            this.hostConnection = await this.hostConnectionPromise;
            this.emit("connected", {
                guest: this
            });
        } catch (e) {
            this.emit("error", {
                guest: this,
                error: e
            });
            this.logger.error("Connection failed!", e);
            throw e;
        }
        try {
            this.sharedContext = new SharedContext(await this.hostConnection.getRemoteApi().getSharedContext());
        } catch (e) {
            this.emit("error", {
                guest: this,
                error: e
            });
            this.logger.error("getSharedContext failed!", e);
            throw e;
        }
        try {
            this.configuration = await this.hostConnection.getRemoteApi().getConfiguration();
        } catch (e) {
            this.emit("error", {
                guest: this,
                error: e
            });
            this.logger.error("getConfiguration failed!", e);
            throw e;
        }
        if (window.parent && window.parent !== window) window.parent.postMessage({
            type: "guest-ready",
            guestId: this.id
        }, "*");
    }
    /**
   * @param config - Initializer for guest object, including ID.
   */ constructor(config){
        super(config.id);
        this.logger = import_uix_core2.quietConsole;
        /**
     * Proxy object for calling methods on the host.
     *
     * @remarks Any APIs exposed to the extension via {@link @adobe/uix-host#Port.provide}
     * can be called on this object. Because these methods are called with RPC,
     * they are all asynchronous, The return types of all Host methods will be
     * Promises which resolve to the value the Host method returns.
     * @public
     */ this.host = (0, import_uix_core2.makeNamespaceProxy)(async (address)=>{
            await this.hostConnectionPromise;
            try {
                const result = await (0, import_uix_core2.timeoutPromise)(()=>`Calling ${(0, import_uix_core2.formatHostMethodAddress)(address)}`, this.invokeAwaiter(this.hostConnection.getRemoteApi().invokeHostMethod, address), 1e4);
                return result;
            } catch (e) {
                const error = e instanceof Error ? e : new Error(e);
                this.logger.error(error);
                throw error;
            }
        });
        this.timeout = 2e4;
        if (typeof config.timeout === "number") this.timeout = config.timeout;
        if (config.debug) this.logger = debugGuest(this);
        this.addEventListener("contextchange", (event)=>{
            this.sharedContext = new SharedContext(event.detail.context);
        });
    }
};
// src/guest-ui.ts
var GuestUI = class extends Guest2 {
    /**
   * @internal
   */ calculateChildrenMargin(elems) {
        let margin = 0;
        for(let i = 0; i < elems.length; i++){
            const style = elems[i].currentStyle || window.getComputedStyle(elems[i]);
            const marginTop = parseInt(style.marginTop);
            const marginBottom = parseInt(style.marginBottom);
            if (marginTop > 0) margin = margin + marginTop;
            if (marginBottom > 0) margin = margin + marginBottom;
        }
        return margin;
    }
    /**
   * {@inheritDoc Guest."constructor"}
   */ constructor(config){
        super(config);
        this.addEventListener("connected", ()=>{
            const resizeObserver = new ResizeObserver((entries)=>{
                const doc = entries.find((entry)=>entry.target === document.body);
                const borderBoxSize = doc.borderBoxSize.length ? doc.borderBoxSize[0] : doc.borderBoxSize;
                this.hostConnection.getRemoteApi().onIframeResize({
                    height: borderBoxSize.blockSize + this.calculateChildrenMargin(doc.target.querySelectorAll("*")),
                    width: borderBoxSize.inlineSize
                });
            });
            resizeObserver.observe(document.body);
        });
        this.logger.log("Will add resize observer on connect");
    }
};
// src/guest-server.ts
var GuestServer = class extends Guest2 {
    getLocalMethods() {
        return (0, _objectSpreadProps._)((0, _objectSpread._)({}, super.getLocalMethods()), {
            apis: this.localMethods,
            metadata: this.metadata
        });
    }
    /**
   * Pass an interface of methods which Host may call as callbacks.
   *
   * @remarks It is preferable to use {@link register} to obtain a guest object
   * and register local methods in one step. The returned guest object will be
   * pre-registered and connected.
   * @public
   */ async register(implementedMethods, metadata) {
        this.localMethods = implementedMethods;
        this.metadata = (0, _objectSpreadProps._)((0, _objectSpread._)({}, metadata), {
            extensionId: this.id
        });
        return this._connect();
    }
};
// src/index.ts
function createGuest(config) {
    const guest = new GuestServer(config);
    return guest;
}
async function attach(config) {
    const guest = new GuestUI(config);
    await guest._connect();
    return guest;
}
async function register(config) {
    const guest = new GuestServer(config);
    guest.register(config.methods, config.metadata);
    return guest;
}

},{"@swc/helpers/_/_object_spread":"6n78J","@swc/helpers/_/_object_spread_props":"cpwdi","b288915145c74faf":"gHHrI"}],"6n78J":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "_", ()=>_object_spread);
var _definePropertyJs = require("./_define_property.js");
function _object_spread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
            return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
        ownKeys.forEach(function(key) {
            (0, _definePropertyJs._)(target, key, source[key]);
        });
    }
    return target;
}

},{"./_define_property.js":"f7pzt","@parcel/transformer-js/src/esmodule-helpers.js":"4CjSt"}],"f7pzt":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "_", ()=>_define_property);
function _define_property(obj, key, value) {
    if (key in obj) Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
    });
    else obj[key] = value;
    return obj;
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"4CjSt"}],"4CjSt":[function(require,module,exports,__globalThis) {
exports.interopDefault = function(a) {
    return a && a.__esModule ? a : {
        default: a
    };
};
exports.defineInteropFlag = function(a) {
    Object.defineProperty(a, '__esModule', {
        value: true
    });
};
exports.exportAll = function(source, dest) {
    Object.keys(source).forEach(function(key) {
        if (key === 'default' || key === '__esModule' || Object.prototype.hasOwnProperty.call(dest, key)) return;
        Object.defineProperty(dest, key, {
            enumerable: true,
            get: function() {
                return source[key];
            }
        });
    });
    return dest;
};
exports.export = function(dest, destName, get) {
    Object.defineProperty(dest, destName, {
        enumerable: true,
        get: get
    });
};

},{}],"cpwdi":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "_", ()=>_object_spread_props);
function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) symbols = symbols.filter(function(sym) {
            return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        });
        keys.push.apply(keys, symbols);
    }
    return keys;
}
function _object_spread_props(target, source) {
    source = source != null ? source : {};
    if (Object.getOwnPropertyDescriptors) Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    else ownKeys(Object(source)).forEach(function(key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
    return target;
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"4CjSt"}],"gHHrI":[function(require,module,exports,__globalThis) {
var _objectSpread = require("@swc/helpers/_/_object_spread");
var _objectSpreadProps = require("@swc/helpers/_/_object_spread_props");
var _objectWithoutProperties = require("@swc/helpers/_/_object_without_properties");
'use strict';
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod)=>function __require() {
        return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = {
            exports: {}
        }).exports, mod), mod.exports;
    };
var __copyProps = (to, from, except, desc)=>{
    if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
            get: ()=>from[key],
            enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
    }
    return to;
};
var __toESM = (mod, isNodeMode, target)=>(target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(// If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
        value: mod,
        enumerable: true
    }) : target, mod));
// ../../node_modules/eventemitter3/index.js
var require_eventemitter3 = __commonJS({
    "../../node_modules/eventemitter3/index.js" (exports1, module) {
        var has = Object.prototype.hasOwnProperty;
        var prefix = "~";
        function Events() {}
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
            if (typeof fn !== "function") throw new TypeError("The listener must be a function");
            var listener = new EE(fn, context || emitter, once), evt = prefix ? prefix + event : event;
            if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
            else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
            else emitter._events[evt] = [
                emitter._events[evt],
                listener
            ];
            return emitter;
        }
        function clearEvent(emitter, evt) {
            if (--emitter._eventsCount === 0) emitter._events = new Events();
            else delete emitter._events[evt];
        }
        function EventEmitter2() {
            this._events = new Events();
            this._eventsCount = 0;
        }
        EventEmitter2.prototype.eventNames = function eventNames() {
            var names = [], events, name;
            if (this._eventsCount === 0) return names;
            for(name in events = this._events)if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
            if (Object.getOwnPropertySymbols) return names.concat(Object.getOwnPropertySymbols(events));
            return names;
        };
        EventEmitter2.prototype.listeners = function listeners(event) {
            var evt = prefix ? prefix + event : event, handlers = this._events[evt];
            if (!handlers) return [];
            if (handlers.fn) return [
                handlers.fn
            ];
            for(var i = 0, l = handlers.length, ee = new Array(l); i < l; i++)ee[i] = handlers[i].fn;
            return ee;
        };
        EventEmitter2.prototype.listenerCount = function listenerCount(event) {
            var evt = prefix ? prefix + event : event, listeners = this._events[evt];
            if (!listeners) return 0;
            if (listeners.fn) return 1;
            return listeners.length;
        };
        EventEmitter2.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
            var evt = prefix ? prefix + event : event;
            if (!this._events[evt]) return false;
            var listeners = this._events[evt], len = arguments.length, args, i;
            if (listeners.fn) {
                if (listeners.once) this.removeListener(event, listeners.fn, void 0, true);
                switch(len){
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
                for(i = 1, args = new Array(len - 1); i < len; i++)args[i - 1] = arguments[i];
                listeners.fn.apply(listeners.context, args);
            } else {
                var length = listeners.length, j;
                for(i = 0; i < length; i++){
                    if (listeners[i].once) this.removeListener(event, listeners[i].fn, void 0, true);
                    switch(len){
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
                            if (!args) for(j = 1, args = new Array(len - 1); j < len; j++)args[j - 1] = arguments[j];
                            listeners[i].fn.apply(listeners[i].context, args);
                    }
                }
            }
            return true;
        };
        EventEmitter2.prototype.on = function on(event, fn, context) {
            return addListener(this, event, fn, context, false);
        };
        EventEmitter2.prototype.once = function once(event, fn, context) {
            return addListener(this, event, fn, context, true);
        };
        EventEmitter2.prototype.removeListener = function removeListener(event, fn, context, once) {
            var evt = prefix ? prefix + event : event;
            if (!this._events[evt]) return this;
            if (!fn) {
                clearEvent(this, evt);
                return this;
            }
            var listeners = this._events[evt];
            if (listeners.fn) {
                if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) clearEvent(this, evt);
            } else {
                for(var i = 0, events = [], length = listeners.length; i < length; i++)if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) events.push(listeners[i]);
                if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
                else clearEvent(this, evt);
            }
            return this;
        };
        EventEmitter2.prototype.removeAllListeners = function removeAllListeners(event) {
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
        EventEmitter2.prototype.off = EventEmitter2.prototype.removeListener;
        EventEmitter2.prototype.addListener = EventEmitter2.prototype.on;
        EventEmitter2.prefixed = prefix;
        EventEmitter2.EventEmitter = EventEmitter2;
        if ("undefined" !== typeof module) module.exports = EventEmitter2;
    }
});
// src/debuglog.ts
var isDarkMode = ()=>typeof window.matchMedia === "function" && window.matchMedia("(prefers-color-scheme: dark)").matches;
var Layouts = {
    medium: {
        padX: 5,
        padY: 3,
        rounded: 4,
        fontSize: 100,
        emphasis: "font-weight: bold;"
    },
    small: {
        padX: 3,
        padY: 1,
        rounded: 2,
        fontSize: 95,
        emphasis: "font-style: italic;"
    }
};
var Colors = {
    yellow: {
        text: "#333333",
        bg: "#EBD932",
        hilight: "#F7E434",
        shadow: "#D1C12C"
    },
    green: {
        text: "#333333",
        bg: "#96EB5E",
        hilight: "#9EF763",
        shadow: "#85D154"
    },
    blue: {
        text: "#333333",
        bg: "#8DD0EB",
        hilight: "#88F0F7",
        shadow: "#74AED4"
    },
    gray: isDarkMode() ? {
        text: "#eeeeee",
        bg: "transparent",
        hilight: "#cecece",
        shadow: "#cecece"
    } : {
        text: "#333333",
        bg: "#eeeeee",
        hilight: "#f6f6f6",
        shadow: "#cecece"
    }
};
function memoizeUnary(fn) {
    const cache = /* @__PURE__ */ new Map();
    return (arg)=>{
        if (!cache.has(arg)) {
            const result = fn(arg);
            cache.set(arg, result);
            if (cache.size > 100) cache.delete(cache.keys().next().value);
            return result;
        }
        return cache.get(arg);
    };
}
var toTheme = memoizeUnary((theme)=>{
    if (typeof theme === "string") {
        const [color, size] = theme.split(" ");
        return (0, _objectSpread._)({}, Colors[color], Layouts[size]);
    }
    return theme;
});
var block = `display: inline-block; border: 1px solid;`;
var flatten = (side)=>`padding-${side}: 0px; border-${side}-width: 0px; border-top-${side}-radius: 0px; border-bottom-${side}-radius: 0px;`;
var toColor = ({ bg, hilight, shadow, text })=>`color: ${text}; background: ${bg}; border-color: ${hilight} ${shadow} ${shadow} ${hilight};`;
var toLayout = ({ fontSize, padY, padX, rounded })=>`font-size: ${fontSize}%; padding: ${padY}px ${padX}px; border-radius: ${rounded}px;`;
var toBubbleStyle = memoizeUnary((theme)=>{
    const base = `${block}${toColor(theme)}${toLayout(theme)}`;
    return [
        `${base}${flatten("right")}`,
        `${base}${flatten("left")}${theme.emphasis}`
    ];
});
function toBubblePrepender(bubbleLeft, bubbleRight, theme) {
    const prefix = `%c${bubbleLeft}%c ${bubbleRight}`;
    const [left, right] = toBubbleStyle(theme);
    return (args)=>{
        const bubbleArgs = [
            prefix,
            left,
            right
        ];
        if (typeof args[0] === "string") {
            bubbleArgs[0] = `${prefix}%c ${args.shift()}`;
            bubbleArgs.push("");
        }
        return [
            ...bubbleArgs,
            ...args
        ];
    };
}
var stateTypes = {
    event: "\uFE0F\u26A1\uFE0F"
};
var stateDelim = " \u293B ";
var getStateFormatter = memoizeUnary((stateJson)=>{
    const stateStack = JSON.parse(stateJson);
    const firstState = stateStack.shift();
    const left = stateTypes[firstState.type];
    const right = [
        firstState.name,
        ...stateStack.map((state)=>`${stateTypes[state.type]} ${state.name}`)
    ].join(stateDelim);
    return toBubblePrepender(left, right, toTheme("gray small"));
});
var getStatePrepender = (stateStack)=>getStateFormatter(JSON.stringify(stateStack));
var overrideMethods = [
    "log",
    "error",
    "warn",
    "info",
    "debug"
];
var identity = (x)=>x;
var noop = ()=>void 0;
function _customConsole(theme, type, name) {
    const prepender = toBubblePrepender(`X${type}`, name, toTheme(theme));
    let statePrepender = identity;
    const stateStack = [];
    const loggerProto = {
        detach: {
            writable: true,
            configurable: true,
            value () {
                overrideMethods.forEach((method)=>{
                    this[method] = noop;
                });
            }
        },
        pushState: {
            value (state) {
                stateStack.push(state);
                statePrepender = getStatePrepender(stateStack);
            }
        },
        popState: {
            value () {
                stateStack.pop();
                statePrepender = stateStack.length === 0 ? identity : getStatePrepender(stateStack);
            }
        }
    };
    const customConsole = Object.create(console, overrideMethods.reduce((out, level)=>{
        out[level] = {
            writable: true,
            configurable: true,
            value (...args) {
                console[level](...prepender(statePrepender(args)));
            }
        };
        return out;
    }, loggerProto));
    return customConsole;
}
var quietConsole = new Proxy(console, {
    get () {
        return noop;
    }
});
// src/debug-emitter.ts
function debugEmitter(emitter, opts) {
    const logger = _customConsole(opts.theme, opts.type || Object.getPrototypeOf(emitter).constructor.name, opts.id || emitter.id);
    const oldDispatch = emitter.dispatchEvent;
    emitter.dispatchEvent = (event)=>{
        logger.pushState({
            type: "event",
            name: event.type
        });
        const retVal = oldDispatch.call(emitter, event);
        logger.popState();
        return retVal;
    };
    const subscriptions = [];
    const oldDetach = logger.detach;
    logger.detach = ()=>{
        oldDetach.call(logger);
        subscriptions.forEach((unsubscribe)=>unsubscribe());
    };
    function listen(type, listener) {
        subscriptions.push(emitter.addEventListener(type, (event)=>listener(logger, event)));
        return logger;
    }
    logger.listen = listen;
    return logger;
}
// src/emitter.ts
var Emitter = class extends EventTarget {
    /**
   * Convenience method to construct and dispatch custom events.
   *
   * @param type - Name of one of the allowed events this can emit
   * @param detail - Object to expose in the {@link https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail | CustomEvent#detail}
   * property.
   * @public
   */ emit(type, detail) {
        const event = new CustomEvent(type, {
            detail
        });
        this.dispatchEvent(event);
    }
    /**
   * Subscribe to an event and receive an unsubscribe callback.
   * @see [EventTarget.addEventListener - MDN](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)
   *
   * Identical to `EventTarget.addEventListener`, but returns an "unsubscriber"
   * function which detaches the listener when invoked. Solves an ergonomic
   * problem with native EventTargets where it's impossible to detach listeners
   * without having a reference to the original handler.
   *
   * @typeParam E - Name of one of the allowed events this can emit
   * @param type - Event type
   * @param listener - Event handler
   * @returns Call to unsubscribe listener.
   */ addEventListener(type, listener) {
        super.addEventListener(type, listener);
        return ()=>super.removeEventListener(type, listener);
    }
    constructor(id){
        super();
        this.id = id;
    }
};
// src/namespace-proxy.ts
function makeNamespaceProxy(invoke, path = []) {
    const handler = {
        get: (target2, prop)=>{
            if (typeof prop === "string") {
                if (!Reflect.has(target2, prop)) {
                    const next = makeNamespaceProxy(invoke, path.concat(prop));
                    Reflect.set(target2, prop, next);
                }
                return Reflect.get(target2, prop);
            } else throw new Error(`Cannot look up a symbol ${String(prop)} on a host connection proxy.`);
        }
    };
    const target = {};
    if (path.length < 2) return new Proxy(target, handler);
    const invoker = (...args)=>invoke({
            path: path.slice(0, -1),
            name: path[path.length - 1],
            args
        });
    return new Proxy(invoker, (0, _objectSpreadProps._)((0, _objectSpread._)({}, handler), {
        apply (target2, _, args) {
            return target2(...args);
        }
    }));
}
// src/constants.ts
var NS_ROOT = "_$pg";
var VERSION = '"1.1.11"';
var INIT_CALLBACK = `${NS_ROOT}_init_cb`;
// src/value-assertions.ts
function isPlainObject(value) {
    if (!value || typeof value !== "object") return false;
    const proto = Reflect.getPrototypeOf(value);
    return proto === null || proto === Object.prototype;
}
function isPrimitive(value) {
    if (!value) return true;
    const theType = typeof value;
    return theType === "string" || theType === "number" || theType === "boolean";
}
function isIterable(value) {
    return Array.isArray(value);
}
function isFunction(value) {
    return typeof value === "function";
}
function hasProp(value, prop) {
    return !isPrimitive(value) && Reflect.has(value, prop);
}
function isIframe(value) {
    if (!value || isPrimitive(value)) return false;
    const { nodeName } = value;
    return typeof nodeName === "string" && nodeName.toLowerCase() === "iframe";
}
function isObjectWithPrototype(value) {
    if (!value || typeof value !== "object") return false;
    const proto = Reflect.getPrototypeOf(value);
    return proto !== Object.prototype;
}
// src/message-wrapper.ts
function wrap(message) {
    return {
        [NS_ROOT]: message
    };
}
function unwrap(wrappedMessage) {
    return wrappedMessage[NS_ROOT];
}
function isWrapped(item) {
    if (!isPlainObject(item)) return false;
    const keys = Object.keys(item);
    const hasRoot = keys.includes(NS_ROOT);
    if (hasRoot && keys.length != 1) {
        console.error(`malformed tunnel message, should have one prop "${NS_ROOT}" at root`, item);
        return false;
    }
    return hasRoot;
}
// src/object-walker.ts
var NOT_TRANSFORMED = Symbol.for("NOT_TRANSFORMED");
var CIRCULAR = "[[Circular]]";
function transformRecursive(transform, value, parent, _refs = /* @__PURE__ */ new WeakSet()) {
    if (isPrimitive(value)) return value;
    const transformed = transform(value, parent);
    if (transformed !== NOT_TRANSFORMED) return transformed;
    if (isIterable(value)) {
        const outArray = [];
        for (const item of value)outArray.push(transformRecursive(transform, item, void 0, _refs));
        return outArray;
    }
    if (isPlainObject(value)) {
        if (_refs.has(value)) return CIRCULAR;
        _refs.add(value);
        const outObj = {};
        for (const key of Reflect.ownKeys(value))Reflect.set(outObj, key, transformRecursive(transform, Reflect.get(value, key), void 0, _refs));
        return outObj;
    }
    if (isObjectWithPrototype(value)) {
        if (_refs.has(value)) return CIRCULAR;
        _refs.add(value);
        const getObjectKeys = (obj)=>{
            const result = /* @__PURE__ */ new Set();
            do {
                if (Reflect.getPrototypeOf(obj) !== null) for (const prop of Object.getOwnPropertyNames(obj)){
                    if (prop === "constructor") continue;
                    result.add(prop);
                }
            }while (obj = Reflect.getPrototypeOf(obj));
            return [
                ...result
            ];
        };
        const outObj = {};
        const properties = getObjectKeys(value);
        for (const key of properties)Reflect.set(outObj, key, transformRecursive(transform, Reflect.get(value, key), value, _refs));
        return outObj;
    }
    throw new Error(`Bad value! ${Object.prototype.toString.call(value)}`);
}
// src/rpc/call-receiver.ts
function receiveCalls(fn, ticket, remote) {
    const responder = async ({ fnId, callId, args })=>{
        try {
            const value = await fn(...args);
            remote.deref().respond({
                fnId,
                callId,
                value,
                status: "resolve"
            });
        } catch (error) {
            remote.deref().respond({
                fnId,
                callId,
                status: "reject",
                error
            });
        }
    };
    return remote.deref().onCall(ticket, responder);
}
// src/rpc/call-sender.ts
var DisconnectionError = class extends Error {
    constructor(){
        super("Function belongs to a simulated remote object which has been disconnected! The tunnel may have been destroyed by page navigation or reload.");
    }
};
function dispatch(subject, callTicket, rejectionPool, resolve, reject) {
    subject.onRespond(callTicket, (responseTicket)=>{
        rejectionPool.delete(reject);
        if (responseTicket.status === "resolve") resolve(responseTicket.value);
        else reject(responseTicket.error);
    });
    subject.send(callTicket);
}
function makeCallSender({ fnId }, subjectRef) {
    let callCounter = 0;
    const rejectionPool = /* @__PURE__ */ new Set();
    let sender = function(...args) {
        return new Promise((resolve, reject)=>{
            rejectionPool.add(reject);
            const callId = ++callCounter;
            const callTicket = {
                fnId,
                callId,
                args
            };
            return dispatch(subjectRef.deref(), callTicket, rejectionPool, resolve, reject);
        });
    };
    const destroy = ()=>{
        subjectRef = null;
        sender = ()=>{
            throw new DisconnectionError();
        };
        for (const reject of rejectionPool)reject(new DisconnectionError());
        rejectionPool.clear();
    };
    subjectRef.deref().onDestroyed(destroy);
    const facade = async function(...args) {
        return sender(...args);
    };
    Object.defineProperty(facade, "name", {
        value: fnId
    });
    return facade;
}
// src/remote-subject.ts
var RemoteSubject = class {
    // #endregion Constructors
    // #region Public Methods
    notifyCleanup(ticket) {
        return this.emitter.emit(`${ticket.fnId}_g`, {});
    }
    notifyConnect() {
        return this.emitter.emit("connected");
    }
    notifyDestroy() {
        return this.emitter.emit("destroyed");
    }
    onCall(ticket, handler) {
        return this.subscribe(`${ticket.fnId}_c`, (ticket2)=>handler(this.processCallTicket(ticket2, this.simulator.materialize)));
    }
    onConnected(handler) {
        return this.subscribe("connected", handler);
    }
    onDestroyed(handler) {
        return this.subscribe("destroyed", handler);
    }
    onOutOfScope(ticket, handler) {
        return this.subscribeOnce(`${ticket.fnId}_g`, handler);
    }
    onRespond(ticket, handler) {
        const fnAndCall = `${ticket.fnId}${ticket.callId}`;
        return this.subscribeOnce(`${fnAndCall}_r`, (ticket2)=>handler(this.processResponseTicket(ticket2, this.simulator.materialize)));
    }
    respond(ticket) {
        const fnAndCall = `${ticket.fnId}${ticket.callId}`;
        return this.emitter.emit(`${fnAndCall}_r`, this.processResponseTicket(ticket, this.simulator.simulate));
    }
    send(ticket) {
        return this.emitter.emit(`${ticket.fnId}_c`, this.processCallTicket(ticket, this.simulator.simulate));
    }
    // #endregion Public Methods
    // #region Private Methods
    processCallTicket(_param, mapper) {
        var { args } = _param, ticket = (0, _objectWithoutProperties._)(_param, [
            "args"
        ]);
        return (0, _objectSpreadProps._)((0, _objectSpread._)({}, ticket), {
            args: args.map(mapper)
        });
    }
    processResponseTicket(ticket, mapper) {
        return ticket.status === "resolve" ? (0, _objectSpreadProps._)((0, _objectSpread._)({}, ticket), {
            value: mapper(ticket.value)
        }) : ticket;
    }
    subscribe(type, handler) {
        this.emitter.on(type, handler);
        return ()=>{
            this.emitter.off(type, handler);
        };
    }
    subscribeOnce(type, handler) {
        const once = (arg)=>{
            this.emitter.off(type, once);
            handler(arg);
        };
        return this.subscribe(type, once);
    }
    // #endregion Properties
    // #region Constructors
    constructor(emitter, simulator){
        this.emitter = emitter;
        this.simulator = simulator;
    }
};
// src/object-simulator.ts
function isDefMessage(value) {
    return isWrapped(value) && hasProp(unwrap(value), "fnId");
}
var bindAll = (inst, methods)=>{
    for (const methodName of methods){
        const method = inst[methodName];
        if (typeof method === "function") inst[methodName] = method.bind(inst);
    }
};
var ObjectSimulator = class {
    // #endregion Constructors
    // #region Public Static Methods
    static create(emitter, Cleanup) {
        let simulator;
        const simulatorInterface = {
            simulate: (x)=>simulator.simulate(x),
            materialize: (x)=>simulator.materialize(x)
        };
        const subject = new RemoteSubject(emitter, simulatorInterface);
        const cleanupNotifier = new Cleanup((fnId)=>{
            return subject.notifyCleanup({
                fnId
            });
        });
        simulator = new ObjectSimulator(subject, cleanupNotifier);
        return simulator;
    }
    // #endregion Public Static Methods
    // #region Public Methods
    makeReceiver(fn, parent) {
        if (typeof fn !== "function") return NOT_TRANSFORMED;
        let fnTicket = this.receiverTicketCache.get(fn);
        if (!fnTicket) {
            fnTicket = {
                fnId: `${fn.name || "<anonymous>"}_${++this.fnCounter}`
            };
            let boundFunction = fn;
            if (parent) boundFunction = fn.bind(parent);
            const cleanup = receiveCalls(boundFunction, fnTicket, new WeakRef(this.subject));
            this.subject.onOutOfScope(fnTicket, cleanup);
            this.receiverTicketCache.set(boundFunction, fnTicket);
        }
        return wrap(fnTicket);
    }
    makeSender(message) {
        if (!isDefMessage(message)) return NOT_TRANSFORMED;
        const ticket = unwrap(message);
        if (!this.senderCache.has(ticket)) {
            const sender = makeCallSender(ticket, new WeakRef(this.subject));
            this.cleanupNotifier.register(sender, ticket.fnId, sender);
            this.senderCache.set(ticket, sender);
            return sender;
        } else return this.senderCache.get(ticket);
    }
    materialize(simulated) {
        return transformRecursive(this.makeSender, simulated);
    }
    simulate(localObject) {
        return transformRecursive(this.makeReceiver, localObject);
    }
    // #endregion Properties
    // #region Constructors
    constructor(subject, cleanupNotifier){
        this.fnCounter = 0;
        this.receiverTicketCache = /* @__PURE__ */ new WeakMap();
        this.senderCache = /* @__PURE__ */ new WeakMap();
        this.cleanupNotifier = cleanupNotifier;
        this.subject = subject;
        bindAll(this, [
            "makeSender",
            "makeReceiver",
            "simulate",
            "materialize"
        ]);
    }
};
// src/promises/timed.ts
function timeoutPromise(describe, promise, ms, onReject) {
    return new Promise((resolve, reject)=>{
        const cleanupAndReject = async (e)=>{
            try {
                if (onReject) await onReject(e);
            } finally{
                reject(e);
            }
        };
        const timeout = setTimeout(()=>{
            cleanupAndReject(new Error(`${typeof describe === "function" ? describe() : describe} timed out after ${ms}ms`));
        }, ms);
        promise.then((result)=>{
            clearTimeout(timeout);
            resolve(result);
        }).catch((e)=>{
            clearTimeout(timeout);
            cleanupAndReject(e);
        });
    });
}
// src/tickets.ts
var INIT_TICKET = {
    fnId: INIT_CALLBACK
};
// src/tunnel/tunnel.ts
var import_eventemitter3 = __toESM(require_eventemitter3());
// src/tunnel/tunnel-messenger.ts
var VERSION_CORRECTED = {
    "0.7.0": "0.8.0",
    "0.8.0": "0.8.1"
};
function getVersionParts(version) {
    const realVersion = VERSION_CORRECTED.hasOwnProperty(version) ? VERSION_CORRECTED[version] : version;
    const [major, minor = "UNKNOWN", suffix = "UNKNOWN"] = realVersion.split(".");
    const [patch, prerelease = ""] = suffix.split("-");
    return {
        major,
        minor,
        patch,
        prerelease
    };
}
var thisVersion = getVersionParts(VERSION);
var TunnelMessenger = class {
    resetWarnings() {
        this.versionWarnings.clear();
    }
    makeAccepted(id) {
        return wrap({
            accepts: id,
            version: VERSION
        });
    }
    makeOffered(id) {
        return wrap({
            offers: id,
            version: VERSION
        });
    }
    isHandshakeAccepting(message, id) {
        return this.isHandshake(message) && unwrap(message).accepts === id;
    }
    isHandshakeOffer(message) {
        return this.isHandshake(message) && typeof unwrap(message).offers === "string";
    }
    isCompatibleVersion(versionString) {
        const version = getVersionParts(versionString);
        return version.major === thisVersion.major && version.minor === thisVersion.minor && version.prerelease === thisVersion.prerelease;
    }
    isHandshake(message) {
        if (!isWrapped(message)) {
            this.logMalformed(message);
            return false;
        }
        const tunnelData = unwrap(message);
        if (!isPlainObject(tunnelData) || typeof tunnelData.version !== "string" || !(Reflect.has(tunnelData, "accepts") || Reflect.has(tunnelData, "offers"))) {
            this.logMalformed(message);
            return false;
        }
        const { version } = tunnelData;
        if (!this.isCompatibleVersion(version) && !this.versionWarnings.has(version)) {
            this.versionWarnings.add(version);
            this.logger.warn(`SDK version mismatch. ${this.myOrigin} is using v${VERSION}, but received message from ${this.remoteOrigin} using SDK v${version}. Extensions may be broken or unresponsive.`);
        }
        return true;
    }
    logMalformed(message) {
        let inspectedMessage;
        try {
            inspectedMessage = JSON.stringify(message, null, 2);
        } catch (_) {
            try {
                inspectedMessage = message.toString();
            } catch (e) {
                inspectedMessage = Object.prototype.toString.call(message);
            }
        }
        this.logger.error(`Malformed tunnel message sent from SDK at ${this.remoteOrigin} to ${this.myOrigin}:
${inspectedMessage}
Message must be an object with "${NS_ROOT}" property, which must be an object with a "version" string and an either an "accepts" or "offers" property containing an ID string.`);
    }
    constructor(opts){
        this.versionWarnings = /* @__PURE__ */ new Set();
        this.myOrigin = opts.myOrigin;
        this.remoteOrigin = opts.targetOrigin === "*" ? "remote document" : opts.targetOrigin;
        this.logger = opts.logger;
    }
};
// src/tunnel/tunnel.ts
var RETRY_MS = 100;
var STATUSCHECK_MS = 5e3;
var KEY_BASE = 36;
var KEY_LENGTH = 8;
var KEY_EXP = KEY_BASE ** KEY_LENGTH;
var makeKey = ()=>Math.round(Math.random() * KEY_EXP).toString(KEY_BASE);
var badTimeout = "\n - timeout value must be a number of milliseconds";
var badTargetOrigin = "\n - targetOrigin must be a valid URL origin or '*' for any origin";
function isFromOrigin(event, source, targetOrigin) {
    try {
        return source === event.source && (targetOrigin === "*" || targetOrigin === new URL(event.origin).origin);
    } catch (_) {
        return false;
    }
}
var { emit: emitOn } = import_eventemitter3.default.prototype;
var Tunnel = class extends import_eventemitter3.default {
    // #endregion Constructors
    // #region Public Static Methods
    /**
   * Create a Tunnel that connects to the page running in the provided iframe.
   *
   * @remarks
   * Returns a Tunnel that listens for connection requests from the page in the
   * provided iframe, which it will send periodically until timeout if that page
   * has called {@link Tunnel.toParent}. If it receives one, the Tunnel will accept the
   * connection and send an exclusive MessagePort to the xrobject on the other
   * end. The tunnel may reconnect if the iframe reloads, in which case it will
   * emit another "connected" event.
   *
   * @alpha
   */ static toIframe(target, options, versionCallback) {
        if (!isIframe(target)) throw new Error(`Provided tunnel target is not an iframe! ${Object.prototype.toString.call(target)}`);
        const config = Tunnel._normalizeConfig(options);
        const tunnel = new Tunnel(config);
        const messenger = new TunnelMessenger({
            myOrigin: window.location.origin,
            targetOrigin: config.targetOrigin,
            logger: config.logger
        });
        tunnel.on("destroyed", ()=>config.logger.log(`Tunnel to iframe at ${config.targetOrigin} destroyed!`, tunnel, target));
        tunnel.on("connected", ()=>config.logger.log(`Tunnel to iframe at ${config.targetOrigin} connected!`, tunnel, target));
        tunnel.on("error", (e)=>config.logger.log(`Tunnel to iframe at ${config.targetOrigin} error!`, tunnel, target, e));
        let frameStatusCheck;
        let timeout;
        let acceptedOfferId;
        const offerListener = (event)=>{
            if (isFromOrigin(event, target.contentWindow, config.targetOrigin) && messenger.isHandshakeOffer(event.data)) {
                const { offers: offerKey, version } = unwrap(event.data);
                if (tunnel.isConnected && offerKey === acceptedOfferId) return;
                const accepted = messenger.makeAccepted(offerKey);
                if (versionCallback) versionCallback(version);
                const channel = new MessageChannel();
                target.contentWindow.postMessage(accepted, config.targetOrigin, [
                    channel.port1
                ]);
                tunnel.connect(channel.port2);
                acceptedOfferId = offerKey;
            }
        };
        const cleanup = ()=>{
            clearTimeout(timeout);
            clearInterval(frameStatusCheck);
            window.removeEventListener("message", offerListener);
            acceptedOfferId = void 0;
        };
        timeout = window.setTimeout(()=>{
            tunnel.abort(new Error(`Timed out awaiting initial message from target iframe after ${config.timeout}ms`));
        }, config.timeout);
        tunnel.on("destroyed", cleanup);
        tunnel.on("connected", ()=>clearTimeout(timeout));
        frameStatusCheck = window.setInterval(()=>{
            if (!target.isConnected) {
                cleanup();
                if (tunnel.isConnected) {
                    const frameDisconnectError = new Error(`Tunnel target iframe at ${tunnel.config.targetOrigin} was disconnected from the document!`);
                    Object.assign(frameDisconnectError, {
                        target
                    });
                    tunnel.abort(frameDisconnectError);
                } else tunnel.destroy();
            }
        }, STATUSCHECK_MS);
        window.addEventListener("message", offerListener);
        return tunnel;
    }
    /**
   * Create a Tunnel that connects to the page running in the parent window.
   *
   * @remarks
   * Returns a Tunnel that starts sending connection requests to the parent
   * window, sending them periodically until the window responds with an accept
   * message or the timeout passes. The parent window will accept the request if
   * it calls {@link Tunnel.toIframe}.
   *
   * @alpha
   */ static toParent(source, opts) {
        let retrying;
        let timeout;
        let timedOut = false;
        const key = makeKey();
        const config = Tunnel._normalizeConfig(opts);
        const tunnel = new Tunnel(config);
        tunnel.on("destroyed", ()=>config.logger.log(`Tunnel ${key} to parent window destroyed!`, tunnel));
        tunnel.on("connected", ()=>config.logger.log(`Tunnel ${key} to parent window connected!`, tunnel));
        tunnel.on("error", (e)=>config.logger.log(`Tunnel ${key} to parent window error!`, tunnel, e));
        const messenger = new TunnelMessenger({
            myOrigin: window.location.origin,
            targetOrigin: config.targetOrigin,
            logger: config.logger
        });
        const acceptListener = (event)=>{
            if (!timedOut && isFromOrigin(event, source, config.targetOrigin) && messenger.isHandshakeAccepting(event.data, key)) {
                cleanup();
                if (!event.ports || !event.ports.length) {
                    const portError = new Error("Received handshake accept message, but it did not include a MessagePort to establish tunnel");
                    tunnel.emitLocal("error", portError);
                    return;
                }
                tunnel.connect(event.ports[0]);
            }
        };
        const cleanup = ()=>{
            clearInterval(retrying);
            clearTimeout(timeout);
            window.removeEventListener("message", acceptListener);
        };
        timeout = window.setTimeout(()=>{
            if (!timedOut) {
                timedOut = true;
                tunnel.abort(new Error(`Timed out waiting for initial response from parent after ${config.timeout}ms`));
            }
        }, config.timeout);
        window.addEventListener("message", acceptListener);
        tunnel.on("destroyed", ()=>{
            cleanup();
        });
        tunnel.on("connected", ()=>{
            cleanup();
        });
        const sendOffer = ()=>{
            if (tunnel.isConnected) clearInterval(retrying);
            else source.postMessage(messenger.makeOffered(key), config.targetOrigin);
        };
        retrying = window.setInterval(sendOffer, RETRY_MS);
        sendOffer();
        return tunnel;
    }
    // #endregion Public Static Methods
    // #region Public Methods
    connect(remote) {
        if (this._messagePort) {
            this._messagePort.removeEventListener("message", this._emitFromMessage);
            this._messagePort.close();
        }
        this._messagePort = remote;
        remote.addEventListener("message", this._emitFromMessage);
        this.emitLocal("connected");
        this._messagePort.start();
        this.isConnected = true;
    }
    abort(error) {
        this.emitLocal("error", error);
        this.destroy(error);
    }
    destroy(e) {
        if (this._messagePort) {
            this._messagePort.close();
            this._messagePort = null;
            this.isConnected = false;
        }
        const context = e ? [
            e
        ] : [];
        this.emitLocal("destroyed", ...context);
    }
    emit(type, payload) {
        if (!this._messagePort) return false;
        this._messagePort.postMessage({
            type,
            payload
        });
        return true;
    }
    // #endregion Public Methods
    // #region Private Static Methods
    static _normalizeConfig(options = {}) {
        let errorMessage = "";
        const config = (0, _objectSpreadProps._)((0, _objectSpread._)({
            timeout: 4e3
        }, options), {
            logger: options.logger || quietConsole
        });
        const timeoutMs = Number(config.timeout);
        if (!Number.isSafeInteger(timeoutMs)) errorMessage += badTimeout;
        if (config.targetOrigin !== "*") try {
            new URL(config.targetOrigin);
        } catch (e) {
            errorMessage += badTargetOrigin;
        }
        if (errorMessage) throw new Error(`Invalid tunnel configuration: ${errorMessage}`);
        return config;
    }
    // #endregion Properties
    // #region Constructors
    constructor(config){
        super();
        this.emitLocal = (type, payload)=>{
            return emitOn.call(this, type, payload);
        };
        // #endregion Private Static Methods
        // #region Private Methods
        this._emitFromMessage = ({ data: { type, payload } })=>{
            this.emitLocal(type, payload);
        };
        this.config = config;
    }
};
// src/cross-realm-object.ts
var INIT_MESSAGE = wrap(INIT_TICKET);
async function setupApiExchange(tunnel, apiToSend) {
    let done = false;
    let remoteApi;
    const xrObject = {
        tunnel,
        getRemoteApi () {
            return remoteApi;
        }
    };
    return timeoutPromise("Initial API exchange", new Promise((resolve, reject)=>{
        const simulator = ObjectSimulator.create(tunnel, FinalizationRegistry);
        const sendApi = simulator.makeSender(INIT_MESSAGE);
        const apiCallback = (api)=>{
            remoteApi = api;
            if (!done) {
                done = true;
                resolve(xrObject);
            }
        };
        tunnel.on("api", apiCallback);
        const unsubscribe = receiveCalls((api)=>tunnel.emitLocal("api", api), INIT_TICKET, new WeakRef(simulator.subject));
        const destroy = (e)=>{
            unsubscribe();
            if (!done) {
                done = true;
                if (e) reject(e);
            }
        };
        tunnel.on("destroyed", destroy);
        tunnel.on("connected", ()=>sendApi(apiToSend).catch(destroy));
    }), tunnel.config.timeout, (e)=>{
        tunnel.abort(e);
    });
}
async function connectParentWindow(tunnelOptions, apiToSend) {
    const tunnel = Tunnel.toParent(window.parent, tunnelOptions);
    return setupApiExchange(tunnel, apiToSend);
}
async function connectIframe(frame, tunnelOptions, apiToSend, versionCallback) {
    const tunnel = Tunnel.toIframe(frame, tunnelOptions, versionCallback);
    return setupApiExchange(tunnel, apiToSend);
}
// src/logging-formatters.ts
function formatHostMethodArgument(argument) {
    try {
        return JSON.stringify(argument, null, 2);
    } catch (e) {
        if (isIterable(argument)) return `Iterable<${argument.length}>`;
        if (isPrimitive(argument) || isFunction(argument)) return `${argument}`;
        return Object.prototype.toString.call(argument);
    }
}
function formatHostMethodAddress(address) {
    var _a, _b;
    const path = ((_a = address.path) == null ? void 0 : _a.length) < 1 ? "<Missing method path!>" : address.path.join(".");
    const name = address.name || "<Missing method name!>";
    const args = (_b = address.args) == null ? void 0 : _b.map(formatHostMethodArgument).join(",");
    return `host.${path}.${name}(${args})`;
}
// src/promises/wait.ts
function wait(ms) {
    return new Promise((resolve)=>{
        setTimeout(resolve, ms);
    });
}
exports.Emitter = Emitter;
exports.Tunnel = Tunnel;
exports._customConsole = _customConsole;
exports.connectIframe = connectIframe;
exports.connectParentWindow = connectParentWindow;
exports.debugEmitter = debugEmitter;
exports.formatHostMethodAddress = formatHostMethodAddress;
exports.formatHostMethodArgument = formatHostMethodArgument;
exports.makeNamespaceProxy = makeNamespaceProxy;
exports.quietConsole = quietConsole;
exports.timeoutPromise = timeoutPromise;
exports.wait = wait; //# sourceMappingURL=out.js.map

},{"@swc/helpers/_/_object_spread":"6n78J","@swc/helpers/_/_object_spread_props":"cpwdi","@swc/helpers/_/_object_without_properties":"3Fuj1"}],"3Fuj1":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "_", ()=>_object_without_properties);
var _objectWithoutPropertiesLooseJs = require("./_object_without_properties_loose.js");
function _object_without_properties(source, excluded) {
    if (source == null) return {};
    var target = {}, sourceKeys, key, i;
    if (typeof Reflect !== "undefined" && Reflect.ownKeys) {
        sourceKeys = Reflect.ownKeys(Object(source));
        for(i = 0; i < sourceKeys.length; i++){
            key = sourceKeys[i];
            if (excluded.indexOf(key) >= 0) continue;
            if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
            target[key] = source[key];
        }
        return target;
    }
    target = (0, _objectWithoutPropertiesLooseJs._)(source, excluded);
    if (Object.getOwnPropertySymbols) {
        sourceKeys = Object.getOwnPropertySymbols(source);
        for(i = 0; i < sourceKeys.length; i++){
            key = sourceKeys[i];
            if (excluded.indexOf(key) >= 0) continue;
            if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
            target[key] = source[key];
        }
    }
    return target;
}

},{"./_object_without_properties_loose.js":"btXqD","@parcel/transformer-js/src/esmodule-helpers.js":"4CjSt"}],"btXqD":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "_", ()=>_object_without_properties_loose);
function _object_without_properties_loose(source, excluded) {
    if (source == null) return {};
    var target = {}, sourceKeys = Object.getOwnPropertyNames(source), key, i;
    for(i = 0; i < sourceKeys.length; i++){
        key = sourceKeys[i];
        if (excluded.indexOf(key) >= 0) continue;
        if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
        target[key] = source[key];
    }
    return target;
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"4CjSt"}],"81rC3":[function(require,module,exports,__globalThis) {
module.exports = JSON.parse("{\"registration\":\"https://1890365-544scarletbarracuda-stage.adobeio-static.net/api/v1/web/admin-ui-sdk/registration\",\"admin-ui-sdk/registration\":\"https://1890365-544scarletbarracuda-stage.adobeio-static.net/api/v1/web/admin-ui-sdk/registration\"}");

},{}]},["vd4T0"], "vd4T0", "parcelRequire0107", {})

//# sourceMappingURL=web-src.5d5b3a77.js.map
