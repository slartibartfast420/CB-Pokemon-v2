//import {$app} from "./api/$app";
//import {$callback} from "./api/$callback";
import {$kv} from "./api/$kv";
//import {$limitcam} from "./api/$limitcam";
import {$room} from "./api/$room";
//import {$settings} from "./api/$settings";
//import {} from "./sharedCode";

/** React when the broadcast is started in the room. */
$room.sendNotice("Pikachu!");

// Increment broadcasterNumber
$kv.incr("broadcasterNumber");

// Set the broadcastStartedAt to the current time
$kv.set("broadcastStartedAt", new Date().toISOString());

