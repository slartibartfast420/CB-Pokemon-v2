//import {$app} from "./api/$app";
import {$callback} from "./api/$callback";
//import {$kv} from "./api/$kv";
//import {$limitcam} from "./api/$limitcam";
import {$room} from "./api/$room";
//import {$settings} from "./api/$settings";
import {} from "./sharedCode";
import {game} from "./sharedCode";

/** React when a callback fires. */

if ($callback.label === 'banner') {
    game.banner.sendBanner();
  }