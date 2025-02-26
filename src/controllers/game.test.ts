import test from 'ava';
import {Room} from "../api/$room";
import {User} from "../api/$user";
import {Tip} from "../api/$tip";
import {Message} from "../api/$message";
import {KV} from "../api/$kv";
import Game from "./game";

const App = {
    Name: "Pokemon Collector",
    Version: "0.7.5",
    Dev: "AppMaintainer",
    FairyHelper: [],
    OriginalAuthors: ["asudem", "thmo_"], // Thanks for the idea and everything! Hit me up if you want me to contribute and/or merge or whatever!
    Prefix: "/",
    CMDS: {
        ADDUSER: "adduser",
        LEVELUP: "levelup",
        EVOLVE: "evolve",
        CHANGE: "change",
        REVIVE: "revive",
        REMOVE: "remove",
        RELEASE: "release",
        GETNEWPKMN: "getnewpkmn",
        LISTTRAINERS: "listtrainers",
        LISTELITEFOUR: "listelitefour",
        IDENTIFY: "identify",
        SUPPORT: "support",
        BUYSTONE: "buystone",
        TRADE: "trade",
        LEVEL: "level",
        ATTACK: "attack",
        SENDHELP: "sendhelp",
        ACCEPT: "-accept",
        DECLINE: "-decline",
        REVIVEUSER: "reviveuser",
    }
};
    
test('create game', t => {
    const game = new Game(App);
    console.log(game)
    t.true(game !== undefined);
});

test('initialize broadcaster', t => {
    const $room: Room = {owner: 'Foo'} as Room;
    const game = new Game(App);
    game.setBroadcaster($room)
    t.true(game !== undefined);
});

test('user enter', t => {
    const $room: Room = {owner: 'Foo'} as Room;
    const $user: User = {username: 'bar'} as User;
    const game = new Game(App);
    game.setBroadcaster($room)
    const $kv = {} as KV;
    game.sendWelcomeMessage($user, $room, $kv);
    game.addFreebiePokemonToFanclub($user, $kv);
    t.true(game !== undefined);
});

test('user messages', t => {
    const $room: Room = {owner: 'Foo'} as Room;
    const $user: User = {username: 'bar'} as User;
    const $message: Message = {orig: 'foobar'} as Message;
    const game = new Game(App);
    game.setBroadcaster($room)
    game.stripEmoticon($message);
    game.handleCommands($message,$user);
    game.addPokemonFlair($message,$user);
    t.true(game !== undefined);
});

test('user commands', t => {
    const $room: Room = {owner: 'Foo'} as Room;
    const $user: User = {username: 'bar', inFanclub: true} as User;
    const $user2: User = {username: 'baz', inFanclub: true} as User;
    const game = new Game(App);
    game.setBroadcaster($room);
    game.addFreebiePokemonToFanclub($user);
    game.addFreebiePokemonToFanclub($user2);

    const $message1: Message = {orig: `/identify ${$user.username}`} as Message;
    game.stripEmoticon($message1);
    game.handleCommands($message1,$user);
    game.addPokemonFlair($message1,$user);

    const $message2: Message = {orig: `/level ${$user.username}`} as Message;
    game.stripEmoticon($message2);
    game.handleCommands($message2,$user);
    game.addPokemonFlair($message2,$user);

    const $message3: Message = {orig: `/attack ${$user2.username}`} as Message;
    game.stripEmoticon($message3);
    game.handleCommands($message3,$user);
    game.addPokemonFlair($message3,$user);

    const $message4: Message = {orig: `/release ${$user.username}`} as Message;
    game.stripEmoticon($message4);
    game.handleCommands($message4,$user);
    game.addPokemonFlair($message4,$user);

    t.true(game !== undefined);
});

test('tip for pokemon', t => {
    const $room: Room = {owner: 'Foo'} as Room;
    const $user: User = {username: 'bar'} as User;

    const game = new Game(App);
    game.setSettings({catch_pokemon : 0}, $kv);
    game.setBroadcaster($room)
    
    const $tip1: Tip = {tokens: 5} as Tip;
    game.addFreebiePokemon($user);
    game.purchaseObjects($user, $tip1);
    game.levelUp($user, $tip1);

    const $message4: Message = {orig: `/release ${$user.username}`} as Message;
    game.stripEmoticon($message4);
    game.handleCommands($message4,$user);
    game.addPokemonFlair($message4,$user);

    const $tip2: Tip = {tokens: 500} as Tip;
    game.purchaseObjects($user, $tip2);
    game.levelUp($user, $tip2);


    t.true(game !== undefined);
});

test('tip for buystone', t => {
    const $room: Room = {owner: 'Foo'} as Room;
    const $user: User = {username: 'bar'} as User;
    const $owner: User = {username: 'Foo', isOwner : true} as User;

    const game = new Game(App);
    game.setSettings({catch_pokemon : 0}, $kv);
    game.setBroadcaster($room)
    
    // const $tip1: Tip = {tokens: 5} as Tip;
    // game.addFreebiePokemon($user);
    // game.purchaseObjects($user, $tip1);
    // game.levelUp($user, $tip1);
    const $message1: Message = {orig: `/adduser bar 25`} as Message;
    game.handleCommands($message1,$owner);

    const $message4: Message = {orig: `/buystone`} as Message;
    game.stripEmoticon($message4);
    game.handleCommands($message4,$user);
    game.addPokemonFlair($message4,$user);
    // confirm buy stone
    const $message5: Message = {orig: `/buystone`} as Message;
    game.stripEmoticon($message5);
    game.handleCommands($message5,$user);
    game.addPokemonFlair($message5,$user);

    const $tip2: Tip = {tokens: 200} as Tip;
    game.purchaseObjects($user, $tip2);
    game.levelUp($user, $tip2);


    t.true(game !== undefined);
});