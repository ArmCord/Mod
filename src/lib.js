/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2023 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import {cache, subscriptions, listeners} from "./webpack"
export let SelectedGuildStore;
export let FluxDispatcher;
export let SettingsRouter;

export function log(data) {
    console.log("%c[Helper]", "color: blue;", data);
}
export const filters = {
    byProps: (...props) =>
        props.length === 1
            ? m => m[props[0]] !== void 0
            : m => props.every(p => m[p] !== void 0),

    byCode: (...code) => m => {
        if (typeof m !== "function") return false;
        const s = Function.prototype.toString.call(m);
        for (const c of code) {
            if (!s.includes(c)) return false;
        }
        return true;
    },
    byStoreName: (name) => m =>
        m.constructor?.displayName === name
};
/**
 * Find the first module that matches the filter
 */
export function find(filter, getDefault = true, isWaitFor = false) {
    if (typeof filter !== "function")
        throw new Error("Invalid filter. Expected a function got " + typeof filter);

    for (const key in cache) {
        const mod = cache[key];
        if (!mod?.exports) continue;

        if (filter(mod.exports)) {
            return isWaitFor ? [mod.exports, Number(key)] : mod.exports;
        }

        if (typeof mod.exports !== "object") continue;

        if (mod.exports.default && filter(mod.exports.default)) {
            const found = getDefault ? mod.exports.default : mod.exports;
            return isWaitFor ? [found, Number(key)] : found;
        }

        // the length check makes search about 20% faster
        for (const nestedMod in mod.exports) if (nestedMod.length <= 3) {
            const nested = mod.exports[nestedMod];
            if (nested && filter(nested)) {
                return isWaitFor ? [nested, Number(key)] : nested;
            }
        }
    }

    if (!isWaitFor) {
        const err = new Error("Didn't find module matching this filter");
        console.warn(err);
        }

    return isWaitFor ? [null, null] : null;
};

/**
 * Find the first module that has the specified properties
 */
export function findByProps(...props) {
    return find(filters.byProps(...props));
}
const GET_KEY = Symbol.for("helper.lazy.get");
const CACHED_KEY = Symbol.for("helper.lazy.cached");
const handler = {};
/**
 * Wraps the result of {@see makeLazy} in a Proxy you can consume as if it wasn't lazy.
 * On first property access, the lazy is evaluated
 * @param factory lazy factory
 * @returns Proxy
 *
 * Note that the example below exists already as an api, see {@link findByPropsLazy}
 * @example const mod = proxyLazy(() => findByProps("blah")); console.log(mod.blah);
 */
export function proxyLazy(factory) {
    const proxyDummy = Object.assign(function () { }, {
        [CACHED_KEY]: void 0,
        [GET_KEY]: () => proxyDummy[CACHED_KEY] ??= factory(),
    });

    return new Proxy(proxyDummy, handler);
}

/**
 * find but lazy
 */
export function findLazy(filter, getDefault = true) {
    return proxyLazy(() => find(filter, getDefault));
}
/**
 * Finds a mangled module by the provided code "code" (must be unique and can be anywhere in the module)
 * then maps it into an easily usable module via the specified mappers
 * @param code Code snippet
 * @param mappers Mappers to create the non mangled exports
 * @returns Unmangled exports as specified in mappers
 *
 * @example mapMangledModule("headerIdIsManaged:", {
 *             openModal: filters.byCode("headerIdIsManaged:"),
 *             closeModal: filters.byCode("key==")
 *          })
 */
export function mapMangledModule(code, mappers) {
    const exports = {};

    const id = findModuleId(code);
    if (id === null)
        return exports;

    const mod = wreq(id);
    outer:
    for (const key in mod) {
        const member = mod[key];
        for (const newName in mappers) {
            // if the current mapper matches this module
            if (mappers[newName](member)) {
                exports[newName] = member;
                continue outer;
            }
        }
    }
    return exports;
}
/**
 * Same as {@link mapMangledModule} but lazy
 */
export function mapMangledModuleLazy(code, mappers) {
    return proxyLazy(() => mapMangledModule(code, mappers));
}
/**
 * Wait for a module that matches the provided filter to be registered,
 * then call the callback with the module as the first argument
 */
export function waitFor(filter, callback) {
    if (typeof filter === "string")
        filter = filters.byProps(filter);
    else if (Array.isArray(filter))
        filter = filters.byProps(...filter);
    else if (typeof filter !== "function")
        throw new Error("filter must be a string, string[] or function, got " + typeof filter);

    const [existing, id] = find(filter, true, true);
    if (existing) return void callback(existing, id);

    subscriptions.set(filter, callback);
}

export function waitForStore(name, cb) {
    waitFor(filters.byStoreName(name), cb);
}

export const NavigationRouter = mapMangledModuleLazy("transitionToGuild - ", {
    transitionTo: filters.byCode("transitionTo -"),
    transitionToGuild: filters.byCode("transitionToGuild -"),
    goBack: filters.byCode("goBack()"),
    goForward: filters.byCode("goForward()"),
});

waitFor(["dispatch", "subscribe"], m => {
    FluxDispatcher = m;
    const cb = () => {
        m.unsubscribe("CONNECTION_OPEN", cb);
        _resolveReady();
    };
    m.subscribe("CONNECTION_OPEN", cb);
});

waitForStore("SelectedGuildStore", m => SelectedGuildStore = m);
waitFor(["open", "saveAccountChanges"], m => SettingsRouter = m);
waitFor(["open", "saveAccountChanges"], m => SettingsRouter = m);