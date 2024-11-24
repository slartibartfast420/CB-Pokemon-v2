import Game from "./controllers/game";
/** Contains all the shared code for all event handlers */
// Do not change this...
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AppAuthor = 'slartibartfasr420';
// ...change this instead if you fork this app
export const AppMaintainer = 'slartibartfasr420';

const app : App = {
    Name: "Pokemon Collector",
    Version: "1.7.0",
    Dev: AppMaintainer,
    FairyHelper: [],
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
