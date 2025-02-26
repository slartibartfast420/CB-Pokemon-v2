import {$kv} from "./api/$kv";
import {$message} from "./api/$message";
import {$user} from "./api/$user";
import {$settings} from "./api/$settings";
import {game, AppMaintainer} from "./sharedCode";
import { $app } from "./api/$app";
import { SettingsLocal } from "./definitions/settingslocal";

/** Manipulate a message before it is published in the room chat. 
 * Use the methods available on the $message object to apply transformations. */
if ($message.orig.trim().indexOf("/") !== 0) {
    game.setSettings($settings as unknown as SettingsLocal);
    game.setAccessControl();
    game.addPokemonFlair($message,$user,$kv);
  } else {
    if ($message.setBody) {
      $message.setSpam(true);
      $message.setColor("#FFFFFF");
      $message.setBgColor("#E7E7E7");
    } else if ($kv.get("broadcaster", null) === AppMaintainer || $app.version === 'Testbed') { // testing only allowed in the author's room and on dev
      
    }
}