//import {$app} from "./api/$app";
//import {$callback} from "./api/$callback";
import {$kv} from "./api/$kv";
import { $room } from "./api/$room";
//import {$limitcam} from "./api/$limitcam";
//import {$room} from "./api/$room";
import {$settings} from "./api/$settings";
import { game } from "./sharedCode";
//import {game} from "./sharedCode";

/** React when a user updates the app settings. */
game.refresh($kv, $settings);
game.initBroadcaster($room,$kv);
