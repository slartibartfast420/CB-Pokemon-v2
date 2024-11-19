//import {$app} from "./api/$app";
//import {$callback} from "./api/$callback";
//import {$kv} from "./api/$kv";
//import {$limitcam} from "./api/$limitcam";
//import {$room} from "./api/$room";
import {$tip} from "./api/$tip";
import {$user} from "./api/$user";
//import {$settings} from "./api/$settings";
import {game} from "./sharedCode";

/** React when a tip is received by the room. */
if(!$tip.isAnon){
    game.addFreebiePokemon($user);
}
game.purchaseObjects($user, $tip);
game.levelUp($user, $tip);