//import {$app} from "./api/$app";
//import {$callback} from "./api/$callback";
//import {$fanclub} from "./api/$fanclub";
//import {$kv} from "./api/$kv";
//import {$limitcam} from "./api/$limitcam";
//import {$media} from "./api/$media";
// {$message} from "./api/$message";
//import {$room} from "./api/$room";
//import {$tip} from "./api/$tip";
//import {$user} from "./api/$user";
//import {$settings} from "./api/$settings";

/** Contains all the shared code for all event handlers */
import Game from "./controllers/game";

const app : App = {
    Name: "Pokemon Collector",
    Version: "1.7.0",
    Dev: "slartibartfasr420",
    FairyHelper: ["djdazzydeaf81", "jibleeto"],
    OriginalAuthors: ["asudem", "thmo_"], // Thanks for the idea and everything! Hit me up if you want me to contribute and/or merge or whatever!
    Prefix: "/",
    CMDS: {
        ADDUSER: "adduser",
        LEVELUP: "levelup",
        EVOLVE: "evolve",
        CHANGE: "change",
        REMOVE: "remove",
        RELEASE: "release",
        LISTTRAINERS: "listtrainers",
        LISTELITEFOUR: "listelitefour",
        IDENTIFY: "identify",
        SUPPORT: "support",
        BUYSTONE: "buystone",
        TRADE: "trade",
        LEVEL: "level",
        ATTACK: "attack",
        SENDHELP: "sendhelp",
        //EXPORT: "export",
        //IMPORT: "import",
        ACCEPT: "-accept",
        DECLINE: "-decline",
    },
};
export const game = new Game(app);
