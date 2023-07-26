import { find } from "../lib";
import * as spitroast from 'spitroast';

export function patchScreenshareQuality(framerate, height) {
    const StreamQuality = find(m => m.prototype?.getVideoQuality);
    const ASPECT_RATIO = 16 / 9;
    const width = Math.round(height * ASPECT_RATIO);

    spitroast.after("getVideoQuality", StreamQuality.prototype, (response) => {
        response = {
            bitrateMin: 500000,
            bitrateMax: 8000000,
            localWant: 100,
            capture: {
                framerate,
                width,
                height,
                pixelCount: height * width
            },
            encode: {
                framerate,
                width,
                height,
                pixelCount: height * width
            }
        }
        return response;
    }, false)
    spitroast.after("getQuality", StreamQuality.prototype, (response) => {        
        response = {
            bitrateMin: 500000,
            bitrateMax: 8000000,
            localWant: 100,
            capture: {
                framerate,
                width,
                height,
                pixelCount: height * width
            },
            encode: {
                framerate,
                width,
                height,
                pixelCount: height * width
            }
        }
        return response;
    }, false)
    // var arr = Array.from(findByProps("getAttenuateWhileSpeakingOthers").getMediaEngine().connections.entries())
    // arr[1][0].videoStreamParameters[0].maxResolution = {type: 'fixed', width: width, height: height}
}