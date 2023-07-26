import { log } from "./lib";
import { patchScreenshareQuality } from "./patches/screenshareQuality";
if (window.armcord) {
    log("Loading...")
    window.ACHelper = {
        patchScreenshareQuality: patchScreenshareQuality
    }
    try {
        log("Loading screenshare quality patch!")
        //inject()
        patchScreenshareQuality(60, 720)
    } catch (e) {
        console.error(e)
    }
}