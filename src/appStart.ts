//import {$app} from "./api/$app";
import {$callback} from "./api/$callback";
import {$kv} from "./api/$kv";
//import {$limitcam} from "./api/$limitcam";
import {$room} from "./api/$room";
import {$settings} from "./api/$settings";
import {game} from "./sharedCode";

/** React when the app is started. This is a great place to initialize storage variables, send a welcome message to the broadcaster, or anything else you want to do just once when your app starts. */
$kv.set("broadcaster", $room.owner);
const support_mode = $kv.get("SupportMode", false);
$kv.set("SupportMode", support_mode)

const dto = $kv.get("PokemonTrainerDTO", []);
$kv.set("PokemonTrainerDTO", dto);

game.refresh($kv, $settings);
game.initBroadcaster($room,$kv);
game.setBroadcaster($room);
$callback.create("banner", $settings.banner_rotate, true);
