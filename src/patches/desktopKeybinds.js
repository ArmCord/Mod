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
import { findLazy, mapMangledModuleLazy, SelectedGuildStore, NavigationRouter, FluxDispatcher, SettingsRouter } from "../lib";
const GuildNavBinds = mapMangledModuleLazy("mod+alt+down", {
    CtrlTab: m => m.binds?.at(-1) === "ctrl+tab",
    CtrlShiftTab: m => m.binds?.at(-1) === "ctrl+shift+tab",
});

const DigitBinds = findLazy(m => m.binds?.[0] === "mod+1");
const ComponentDispatch = findLazy(m => m.emitter?._events?.INSERT_TEXT);
function onKey(e) {
    const hasCtrl = e.ctrlKey || (e.metaKey && navigator.platform.includes("Mac"));

    if (hasCtrl) switch (e.key) {
        case "t":
        case "T":
            e.preventDefault();
            if (e.shiftKey) {
                if (SelectedGuildStore.getGuildId()) NavigationRouter.transitionToGuild("@me");
                ComponentDispatch.safeDispatch("TOGGLE_DM_CREATE");
            } else {
                FluxDispatcher.dispatch({
                    type: "QUICKSWITCHER_SHOW",
                    query: "",
                    queryMode: null
                });
            }
            break;
        case ",":
            e.preventDefault();
            SettingsRouter.open("My Account");
            break;
        case "Tab":
            const handler = e.shiftKey ? GuildNavBinds.CtrlShiftTab : GuildNavBinds.CtrlTab;
            handler.action(e);
            break;
        default:
            if (e.key >= "1" && e.key <= "9") {
                e.preventDefault();
                DigitBinds.action(e, `mod+${e.key}`);
            }
            break;
    }
}
export function inject() {
    document.addEventListener("keydown", onKey);
}