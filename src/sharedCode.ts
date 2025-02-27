import Game from "./controllers/game";
/** Contains all the shared code for all event handlers */
// Do not change this...
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AppAuthor = 'slartibartfasr420';
// ...change this instead if you fork this app
export const AppMaintainer = 'slartibartfasr420';

const app : App = {
    Name: "Pokemon Collector",
    Version: "0.7.5",
    Dev: AppMaintainer,
    FairyHelper: [],
    OriginalAuthors: ["asudem", "thmo_"], // Thanks for the idea and everything! Hit me up if you want me to contribute and/or merge or whatever!
    Prefix: "/",
    CMDS: {
        ADDUSER: "adduser",
        REVIVEUSER: "reviveuser",
        LEVELUP: "levelup",
        EVOLVE: "evolve",
        CHANGE: "change",
        SENDHELP: "sendhelp",
        REMOVE: "remove",

        LISTTRAINERS: "listtrainers",
        LISTELITEFOUR: "listelitefour",
        SUPPORT: "support",

        RELEASE: "release",
        GETNEWPKMN: "getnewpkmn",
        IDENTIFY: "identify",
        TRADE: "trade",
        ATTACK: "attack",
        POKESHOP: "pokeshop",
        ACCEPT: "-accept",
        DECLINE: "-decline",
    },
};
export const game = new Game(app);
