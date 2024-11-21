import test from 'ava';
import proxyquire from 'proxyquire';
import Game from "./game";
import {$room, Room} from "../api/$room";

const App = {
    Name: "Pokemon - Gotta Catch 'Em All",
    Version: "1.6.2",
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
    }
};

test('create game', t => {
    const $room: Room = {owner : "chad"} as Room;
    const game = new Game(App, $room);
    t.true(Game !== undefined);
});