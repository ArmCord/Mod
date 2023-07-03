import { findByProps } from "../lib";
export function patchScreenshareQuality(width, height) {
    var arr = Array.from(findByProps("getAttenuateWhileSpeakingOthers").getMediaEngine().connections.entries())
    arr[1][0].videoStreamParameters[0].maxResolution = {type: 'fixed', width: width, height: height}
}