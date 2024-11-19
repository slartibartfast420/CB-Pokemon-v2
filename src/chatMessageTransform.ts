//import {$app} from "./api/$app";
//import {$kv} from "./api/$kv";
import {$message} from "./api/$message";
import {$user} from "./api/$user";
//import {$settings} from "./api/$settings";
import {game} from "./sharedCode";

/** Manipulate a message before it is published in the room chat. Use the methods available on the $message object to apply transformations. */
game.stripEmoticon($message);
game.handleCommands($message,$user);
game.addPokemonFlair($message,$user);
