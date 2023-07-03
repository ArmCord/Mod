import { log } from "./lib";
import { patchScreenshareQuality } from "./patches/screenshareQuality";
import {inject} from "./patches/desktopKeybinds"
log("Loading...")
window.ACHelper = {
    patchScreenshareQuality: patchScreenshareQuality
}
try {
    log("Loading desktop keybinds patch!")
    inject()
} catch (e) {
    console.error(e)
}