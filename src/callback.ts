import {$callback} from "./api/$callback";
import {$room} from "./api/$room";
import {$settings} from "./api/$settings";
import {game} from "./sharedCode";

/** React when a callback fires. */

if ($callback.label === 'banner') {
  game.banner.sendBanner($settings, $room);
}