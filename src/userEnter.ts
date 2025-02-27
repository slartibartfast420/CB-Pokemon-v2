//import {$app} from "./api/$app";
//import {$callback} from "./api/$callback";
import {$kv} from "./api/$kv";
//import {$limitcam} from "./api/$limitcam";
import {$room} from "./api/$room";
import {$user} from "./api/$user";
import {$settings} from "./api/$settings";
import {game} from "./sharedCode";

/** React when a user enters the room. */
game.refresh($kv, $settings);
game.sendWelcomeMessage($user, $room, $kv);
if($settings.fanclub_auto_catch && $user.inFanclub){
    $room.sendNotice("You can use /getnewpkmn to get a new free pokemon.", { toUsername: $user.username, fontWeight: "bold"});
}