//import {$app} from "./api/$app";
//import {$callback} from "./api/$callback";
import {$kv} from "./api/$kv";
//import {$limitcam} from "./api/$limitcam";
import {$room} from "./api/$room";
import {$user} from "./api/$user";
import {$settings} from "./api/$settings";
import {game} from "./sharedCode";

/** React when a user enters the room. */
game.refresh($kv, $settings, $room);
game.sendDevInfo($user, $room);
game.sendWelcomeMessage($user, $room, $kv);
game.addFreebiePokemonToFanclub($user, $kv);