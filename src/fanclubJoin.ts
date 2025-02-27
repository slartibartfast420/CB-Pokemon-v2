//import {$app} from "./api/$app";
//import {$callback} from "./api/$callback";
//import {$fanclub} from "./api/$fanclub";
//import {$kv} from "./api/$kv";
//import {$limitcam} from "./api/$limitcam";
import {$room} from "./api/$room";
import {$user} from "./api/$user";
import {$settings} from "./api/$settings";
//import { game } from "./sharedCode";

/** React when a user joins the room fanclub. */
if($settings.fanclub_auto_catch){
    $room.sendNotice("You can use /getnewpkmn to get a new free pokemon.", { toUsername: $user.username, fontWeight: "bold"});
}