// import {$app} from "./api/$app";
// import {$callback} from "./api/$callback";
// import {$kv} from "./api/$kv";
// import {$limitcam} from "./api/$limitcam";
import {$room} from "./api/$room";
// import {$user} from "./api/$user";
// import {$settings} from "./api/$settings";
import {} from "./sharedCode";


/** Set or update the tip options that are displayed in the dropdown menu when a user opens the tipping dialog in the room. */
// Have users vote with their tips

const options = [
    'Read a book aloud',
    'Sing a song',
    'Do the Macarena',
  ].map(option => ({ label: option }))
  
  const tipOptions = {
    label: 'Vote with your tip:',
    options,
  }
  
  $room.setTipOptions(tipOptions)
  