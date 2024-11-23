import {$room} from "./api/$room";
import {$kv} from "./api/$kv";
import {$message} from "./api/$message";
import {$user} from "./api/$user";
import {$settings} from "./api/$settings";
import {game} from "./sharedCode";

/** Manipulate a message before it is published in the room chat. Use the methods available on the $message object to apply transformations. */
game.refresh($kv, $settings, $room);
game.stripEmoticon($message);
game.handleCommands($message,$user,$kv);
game.addPokemonFlair($message,$user,$kv);
