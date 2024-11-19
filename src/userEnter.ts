//import {$app} from "./api/$app";
//import {$callback} from "./api/$callback";
//import {$kv} from "./api/$kv";
//import {$limitcam} from "./api/$limitcam";
//import {$room} from "./api/$room";
import {$user} from "./api/$user";
//import {$settings} from "./api/$settings";
import {game} from "./sharedCode";

/** React when a user enters the room. */
game.sendDevInfo($user);
game.sendWelcomeMessage($user);
game.addFreebiePokemonToFanclub($user);