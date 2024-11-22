import {User} from "../api/$user";
import {Message} from "../api/$message";
import {Tip} from "../api/$tip";
import {SettingsObj} from "../misc/settingsobj";
import {Room} from "../api/$room";
import {KV} from "../api/$kv";
import {customStringify} from "../misc/helpers";
import {Pokemons} from "../models/pokemon/pokemon";
import AccessControl from "./accesscontrol";
import Banner from "./banner";
import Messenger from "./messenger";
import PokeDex from "./pokedex";
import TrainerManager from "./trainermanager";

export default class Game {
    public settings: SettingsObj;
    public banner: Banner;
    public room: Room;
    private trainerManager: TrainerManager;
    private accessControl: AccessControl;

    constructor(public config: App) {
        this.settings = new SettingsObj();
    }

    //#region OnEnter Functions
    public sendDevInfo($user: User, $room: Room) {
        if (this.accessControl.hasPermission($user, "SUPERUSER")) {
            Messenger.sendSuccessMessage($room, "Pokedex v" + this.config.Version + " Support Mode: ON!", this.config.Dev);
        } else {
            Messenger.sendErrorMessage($room, "Pokedex v" + this.config.Version + " Support Mode: OFF!", this.config.Dev);
        }
    }

    public sendWelcomeMessage($user: User, $room: Room, $kv : KV) {
        const tm = $kv.get("trainerManager");
        if (!tm.PokemonTrainers.has($user.username)) {
            Messenger.sendWelcomeMessage($room, $user.username);
            this.banner.sendBanner($kv, $user.username);
        }
    }

    public addFreebiePokemonToFanclub($user: User, $kv : KV) {
        const settings = $kv.get("settings");
        const tm = $kv.get("trainerManager");
        if (settings.fanclub_auto_catch && this.accessControl.hasClaim($user, "IN_FANCLUB") && !tm.PokemonTrainers.has($user.username)) {
            tm.AddPokemonToTrainer(PokeDex.GetRandomPokemon($kv), $user.username, 0);
            $kv.set("trainerManager", tm);
        }
    }
    //#endregion

    //#region OnMessage Functions
    public stripEmoticon($message: Message) {
        if ($message.orig.trim().startsWith(":") && $message.orig.indexOf("/") > -1) {
            const splitMsg = $message.orig.split(" ");
            if (splitMsg[1].indexOf("/") === 0) {
                if($message.setBody){
                    $message.setBody($message.orig.trim().substring($message.orig.indexOf("/"), $message.orig.length).trim());
                } else {
                    console.log($message.orig.trim().substring($message.orig.indexOf("/"), $message.orig.length).trim())
                }
            }
        }
    }

    public handleCommands($message: Message, $user: User, $kv : KV) {
        if ($message.orig.indexOf(this.config.Prefix) !== 0) {
            return;
        }

        /* If it starts with the prefix, suppress that shit and assume it's a command */
        if($message.setBody){
            $message.setSpam(true);
            $message.setColor("#FFFFFF");
            $message.setBgColor("#E7E7E7");
        }
        
        const args = $message.orig.slice(this.config.Prefix.length).trim().split(/ +/g);
        let command = args.shift();
        if (command === undefined) {
            return;
        }

        command = command.toLowerCase();
        const tm = $kv.get("trainerManager");

        if (this.accessControl.hasPermission($user, "MOD")) {
            /* Broadcaster only commands at all times */
            if (command === this.config.CMDS.SUPPORT) {
                this.settings.mod_allow_broadcaster_cmd = !this.settings.mod_allow_broadcaster_cmd;
                Messenger.sendSuccessMessage(this.room, "Support mode for Pokedex bot Ver." + this.config.Version + " is now " + (this.settings.mod_allow_broadcaster_cmd ? "ACTIVATED" : "DEACTIVATED") + "!", this.room.owner);
            }
        }

        // if (!this.accessControl.hasPermission($user, "SUPERUSER")){
        //     console.log(`unauthorized ${JSON.stringify($user)}`);
        // }
        if (this.accessControl.hasPermission($user, "SUPERUSER")) {
            switch (command) {
                case this.config.CMDS.ADDUSER: {
                    const [targetUser, pokedexNumberString] = args;
                    const pokedexNumber = parseInt(pokedexNumberString, 10);
                    if (pokedexNumber <= Pokemons.length && pokedexNumber >= 0) {
                        tm.AddPokemonToTrainer(pokedexNumber, targetUser, 0);
                        const pkmn = tm.PokemonTrainers.get(targetUser)!.Pokemon;
                        Messenger.sendInfoMessage(this.room, `${PokeDex.GetPokemonIcon(pkmn)} ${pkmn.Name} was given to ${targetUser}`);
                    }
                    break;
                }
                case this.config.CMDS.EVOLVE: {
                    const [targetUser] = args;
                    tm.EvolvePokemonOfUser(targetUser);
                    break;
                }
                case this.config.CMDS.CHANGE: {
                    const [targetUser] = args;
                    tm.ChangePokemonOfUser(targetUser, $kv);
                    break;
                }
                case this.config.CMDS.REMOVE: {
                const [targetUser] = args;
                tm.RemovePokemonFromTrainer(targetUser);
                break;
                }
                case this.config.CMDS.LEVELUP: {
                    const [targetUser, levelsString] = args;
                    const levels = parseInt(levelsString, 10);

                    if (tm.PokemonTrainers.has(targetUser) && levels > 0) {
                        tm.PokemonTrainers.get(targetUser)!.Pokemon.Level += levels;
                        if ($user.username !== this.config.Dev && tm.PokemonTrainers.get(targetUser)!.Pokemon.Level > 100) {
                            tm.PokemonTrainers.get(targetUser)!.Pokemon.Level = 100;
                        }
                        tm.PokemonTrainers.get(targetUser)!.Pokemon.updateStats();
                    }
                    break;
                }
                case this.config.CMDS.SENDHELP: {
                    const [targetUser] = args;

                    let user: string | undefined;
                    if (targetUser !== undefined && targetUser !== "") {
                        user = targetUser;
                    }

                    this.banner.sendWelcomeAndBannerMessage($kv, user);
                    break;
                }
                // case this.config.CMDS.EXPORT: {
                //     const exportdata = tm.ExportToDTO();
                //     Messenger.sendSuccessMessage(this.room, JSON.stringify(exportdata), $user.username);
                //     break;
                // }
                // case this.config.CMDS.IMPORT: {
                //     const json = args.join(" ");
                //     const importdata: PokemonTrainerDTO[] = JSON.parse(json);
                //     tm.ImportFromDTO(importdata);
                //     break;
                // }
            }
        // } else {
        //     Messenger.sendErrorMessage(this.room, "Permission Denied", $user.username);
        //TODO Make it give errors for unauthorized commands
        }

        switch (command) {
            case this.config.CMDS.RELEASE: {
                try {
                    if (tm.PokemonTrainers.has($user.username)) {
                        Messenger.sendInfoMessage(this.room, `You wave goodbye to your level ${tm.PokemonTrainers.get($user.username)!.Pokemon.Level} ${tm.PokemonTrainers.get($user.username)!.Pokemon.Name} as it scurries freely into the wild!`, $user.username);
                        tm.RemovePokemonFromTrainer($user.username);
                    } else {
                        Messenger.sendErrorMessage(this.room, "Huh? It looks like you don't have a Pokemon. What exactly are you releasing?", $user.username);
                    }
                } catch (err) {
                    Messenger.sendInfoMessage(this.room, "Huh? It looks like you don't have a Pokemon. What exactly are you releasing?", $user.username);
                }
                break;
            }
            case this.config.CMDS.IDENTIFY: {
                const [targetUser] = args;
                try {
                    if (tm.PokemonTrainers.has(targetUser)) {
                        Messenger.sendMessageToUser(this.room, PokeDex.IdentifyPokemon(tm.PokemonTrainers.get(targetUser)!.Pokemon), $user.username);
                    } else if (targetUser === "" || targetUser === undefined) {
                        Messenger.sendErrorMessage(this.room, "USAGE: '/identify <user>' where <user> should be the name of the user who's Pokemon you want to identify.", $user.username);
                    } else {
                        Messenger.sendErrorMessage(this.room, "Huh? It looks like [" + targetUser + "] doesn't have a Pokemon. Check the user's spelling?", $user.username);
                    }
                } catch (err) {
                    Messenger.sendErrorMessage(this.room, "USAGE: '/identify <user>' where <user> should be the name of the user who's Pokemon you want to identify. " + err, $user.username);
                }
                break;
            }
            case this.config.CMDS.BUYSTONE: {
                if(!tm.PokemonTrainers.has($user.username)){
                    Messenger.sendErrorMessage(this.room, "You don't have a Pokemon.", $user.username);
                    break;
                }

                if (tm.PokemonTrainers.has($user.username) && tm.PokemonTrainers.get($user.username)!.Pokemon.UsesStone) {
                    //console.log(tm.PokemonTrainers.get($user.username));
                    if (tm.PokemonTrainers.get($user.username)!.BuyStoneWarning === true) {
                        if ($user.username === this.room.owner) {
                            tm.PokemonTrainers.get($user.username)!.BuyStoneWarning = false;
                            tm.PokemonTrainers.get($user.username)!.BuyStoneConfirmation = false;
                            tm.EvolvePokemonOfUser($user.username);
                        } else {
                            Messenger.sendInfoMessage(this.room, "Okay, your next tip of " + this.settings.stone_price + " tokens will buy you a " + tm.PokemonTrainers.get($user.username)!.Pokemon.Types[0].Stone, $user.username);
                            tm.PokemonTrainers.get($user.username)!.BuyStoneConfirmation = true;
                        }
                    } else {
                        Messenger.sendInfoMessage(this.room, "Are you sure you want to purchase a " + tm.PokemonTrainers.get($user.username)!.Pokemon.Types[0].Stone + "? It costs " + this.settings.stone_price + " tokens to purchase a stone. Type '/buystone' again to allow your next tip of " + this.settings.stone_price + " tokens to buy a " + tm.PokemonTrainers.get($user.username)!.Pokemon.Types[0].Stone, $user.username);
                        tm.PokemonTrainers.get($user.username)!.BuyStoneWarning = true;
                    }
                } else {
                    Messenger.sendInfoMessage(this.room, "Your Pokemon does not evolve using a stone!", $user.username);
                }
                break;
            }
            case this.config.CMDS.TRADE: {
                const [param1] = args;

                if (!tm.PokemonTrainers.has($user.username)) {
                    Messenger.sendErrorMessage(this.room, "Can't do any trading, you don't have a pokemon.", $user.username);
                    break;
                }

                if (param1 === this.config.CMDS.ACCEPT) {
                    const receiver = tm.PokemonTrainers.get($user.username)!;
                    if (!tm.PokemonTrainers.has(receiver.TradeRequestReceivedFrom!)) {
                        Messenger.sendErrorMessage(this.room, "Your trading partner doesn't seem to have his pokemon anymore...", receiver.User);
                        break;
                    }
                    const requester = tm.PokemonTrainers.get(receiver.TradeRequestReceivedFrom!)!;
                    if (requester.TradeRequestedAt === $user.username) {
                        Messenger.sendInfoMessage(this.room, "Preparations complete. Trade has been accepted. Initiating trade.", $user.username);
                        Messenger.sendInfoMessage(this.room, "Preparations complete. Trade has been accepted. Initiating trade.", requester.User);
                        tm.TradePokemonWithUser(receiver.User, requester.User);

                        //cb.setTimeout(() => true, 50);
                        Messenger.sendSuccessMessage(this.room, `${requester.User} and ${receiver.User} have successfully traded their pokemon!`);
                    } else {
                        Messenger.sendErrorMessage(this.room, "Upps, something went wrong during the trading. Your cache has been cleared and the trade info has been resetted.", $user.username);
                        Messenger.sendErrorMessage(this.room, "Upps, something went wrong during the trading. Your cache has been cleared and the trade info has been resetted.", requester.User);
                    }

                    tm.PokemonTrainers.get(requester.User)!.TradeRequestedAt = undefined;
                    tm.PokemonTrainers.get(receiver.User)!.TradeRequestReceivedFrom = undefined;
                } else if (param1 === this.config.CMDS.DECLINE) {
                    const receiver = tm.PokemonTrainers.get($user.username)!;
                    const requester = tm.PokemonTrainers.get(receiver.TradeRequestReceivedFrom!)!;
                    if (requester.TradeRequestedAt === $user.username) {
                        Messenger.sendErrorMessage(this.room, "The trade you requested was sadly decline.", requester.User);
                    }
                    Messenger.sendErrorMessage(this.room, "You declined the trade request", receiver.User);

                    tm.PokemonTrainers.get(requester.User)!.TradeRequestedAt = undefined;
                    tm.PokemonTrainers.get(receiver.User)!.TradeRequestReceivedFrom = undefined;

                } else if (tm.PokemonTrainers.has(param1)) {
                    // if targetuser has no request open, request trade
                    const requester = tm.PokemonTrainers.get($user.username)!;
                    const receiver = tm.PokemonTrainers.get(param1)!;

                    const requesterHasNoOpenTrade = requester.TradeRequestedAt === undefined && requester.TradeRequestReceivedFrom === undefined;
                    const receiverHasNoOpenTrade = receiver.TradeRequestedAt === undefined && receiver.TradeRequestReceivedFrom === undefined;
                    if (requesterHasNoOpenTrade && receiverHasNoOpenTrade) {
                        tm.PokemonTrainers.get(receiver.User)!.TradeRequestReceivedFrom = requester.User;
                        tm.PokemonTrainers.get(requester.User)!.TradeRequestedAt = receiver.User;

                        Messenger.sendSuccessMessage(this.room, "Your trade request has been sent!", requester.User);
                        Messenger.sendSuccessMessage(this.room, "Trade request received!", receiver.User);
                        Messenger.sendInfoMessage(this.room, `${requester.User} wants to trade their LVL ${requester.Pokemon.Level} ${requester.Pokemon.Name} with your pokemon!`, receiver.User);
                        Messenger.sendInfoMessage(this.room, "Type '/trade -accept' to accept the trade or type '/trade -decline' to decline the offer.", receiver.User);
                    } else {
                        if (!requesterHasNoOpenTrade) {
                            Messenger.sendErrorMessage(this.room, "You still have an open trade request.", requester.User);
                        }
                        if (!receiverHasNoOpenTrade) {
                            Messenger.sendErrorMessage(this.room, "Your trading partner still has an open trade request.", requester.User);
                        }
                    }
                } else {
                    Messenger.sendErrorMessage(this.room, "Unknown trade command:", $user.username);
                    Messenger.sendInfoMessage(this.room, "Use '/trade <username>' to request a trade with another trainer (<username>)", $user.username);
                    Messenger.sendInfoMessage(this.room, "Use '/trade -accept' to accept the last trade you received and intiate trading.", $user.username);
                    Messenger.sendInfoMessage(this.room, "Use '/trade -decline' to decline the last trade request.", $user.username);
                }

                break;
            }
            case this.config.CMDS.LEVEL: {
                const [targetUser] = args;
                try {
                    if (!tm.PokemonTrainers.has(targetUser)) {
                        Messenger.sendErrorMessage(this.room, "USAGE: '/level <user>' where <user> should be the name of the user who's Pokemon you level want to see.", $user.username);
                        break;
                    }

                    const targetPokemon = tm.PokemonTrainers.get(targetUser)!.Pokemon;

                    if (targetPokemon.Evolves !== 0) {
                        Messenger.sendInfoMessage(this.room, `${targetUser}'s ${targetPokemon.Name} is currently level ${targetPokemon.Level} and needs ${(targetPokemon.Evolves - targetPokemon.Level)} levels (or ${(targetPokemon.Evolves - targetPokemon.Level) * this.settings.level_pokemon} tokens) to evolve.`, $user.username);
                    } else if (targetPokemon.UsesStone) {
                        Messenger.sendInfoMessage(this.room, `${targetUser}'s ${targetPokemon.Name} is currently level ${targetPokemon.Level} and needs a ${targetPokemon.Types[0].Stone} to evolve. ${targetUser} may type '/buystone' to purchase one!`, $user.username);
                    } else if (targetPokemon.TradeEvolve) {
                        Messenger.sendInfoMessage(this.room, `${targetUser}'s ${targetPokemon.Name} is currently level ${targetPokemon.Level} and needs to be traded to evolve. Type '/trade' followed by a username to evolve them!`, $user.username);
                    } else {
                        Messenger.sendInfoMessage(this.room, `${targetUser}'s ${targetPokemon.Name} is currently level ${targetPokemon.Level} This Pokemon does not evolve.`, $user.username);
                    }
                } catch (err) {
                    Messenger.sendErrorMessage(this.room, "Could not get the level of " + targetUser + "'s Pokemon. Please check the spelling or verify they have caught a Pokemon. " + err);
                }
                break;
            }
            case this.config.CMDS.ATTACK: {
                const [targetUser] = args;
                if (tm.PokemonTrainers.has(targetUser)) {
                    if (tm.PokemonTrainers.has($user.username)) {
                        if ($user.username === targetUser) {
                            Messenger.sendErrorMessage(this.room, "Your Pokemon can't attack itself now, can it? Do you have weird fetishes...?", $user.username);
                        } else if (targetUser === this.room.owner && this.isEliteFourMember($user.username)) {
                            Messenger.sendErrorMessage(this.room, "Hey now.. you are a member of the Elite Four, you shouldn't fight against " + this.room.owner, $user.username);
                        } else if (targetUser === this.room.owner && !this.eliteFourDefeated()) {
                            Messenger.sendErrorMessage(this.room, "Wow, woah.. Calm down little fellow trainer. You can't just head to the final boss before beating the Elite Four!", $user.username);
                        } else {
                            const move = tm.PokemonTrainers.get($user.username)!.Pokemon.Move;
                            const currentHP = tm.PokemonTrainers.get(targetUser)!.Pokemon.Life;
                            const leftHP = tm.PokemonTrainers.get($user.username)!.Pokemon.Attack(tm.PokemonTrainers.get(targetUser)!.Pokemon);

                            if (this.settings.public_fights !== true) {
                                Messenger.sendSuccessMessage(this.room, "Your Pokemon now fights with your foe's Pokemon! Wish em luck!", $user.username);
                                Messenger.sendErrorMessage(this.room, `Your Pokemon is being attacked by ${$user.username}'s Pokemon! Wish em luck!`, targetUser);
                            }
                            //cb.setTimeout(() => true, 50);
                            if (this.settings.public_fights !== true) {
                                Messenger.sendInfoMessage(this.room, `Dealt ${currentHP - leftHP} Points of Damage. Using ${move.Name}`, $user.username);
                                Messenger.sendInfoMessage(this.room, `Received ${currentHP - leftHP} Points of Damage. Using ${move.Name}`, targetUser);
                            }

                            if (leftHP <= 0) {
                                if (this.settings.public_fights === true) {
                                    Messenger.sendSuccessMessage(this.room, `${$user.username} successfully defeated ${targetUser} (dealt ${currentHP - leftHP} damage, using ${move.Name})`);
                                } else {
                                    Messenger.sendSuccessMessage(this.room, "Your Pokemon defeated your foe's Pokemon, congrats! Your pokemon levels up!", $user.username);
                                    Messenger.sendErrorMessage(this.room, "Your Pokemon sadly lost all it's life points in the battle. You have to release it :(", targetUser);
                                }
                                Messenger.sendInfoMessage(this.room, `You wave goodbye to your level ${tm.PokemonTrainers.get(targetUser)!.Pokemon.Level} ${tm.PokemonTrainers.get(targetUser)!.Pokemon.Name} as it scurries freely into the wild!`, targetUser);

                                tm.RemovePokemonFromTrainer(targetUser);
                                tm.LevelUpPokemonOfUser($user.username, 2);
                            } else {
                                if (this.settings.public_fights === true) {
                                    Messenger.sendInfoMessage(this.room, `${$user.username} attacked ${targetUser} (dealt ${currentHP - leftHP} damage, using ${move.Name}, ${leftHP} HP left)`);
                                }

                                Messenger.sendErrorMessage(this.room, `Your Pokemon fought hard, but couldn't beat your foe. Tho it is hurt... It has ${leftHP} HP left.`, $user.username);
                                Messenger.sendSuccessMessage(this.room, `Your Pokemon successfully defended itself, but lost life points. It has ${leftHP} HP left. Better start fighting back (using '/attack ${$user.username}')`, targetUser);
                            }
                        }
                    } else {
                        Messenger.sendErrorMessage(this.room, "You need a Pokemon yourself first, before you can go into the wild and randomly attack other players my friend.", $user.username);
                    }
                } else {
                    Messenger.sendErrorMessage(this.room, "This user either is not in this room or does not have a pokemon to attack.", $user.username);
                    Messenger.sendErrorMessage(this.room, "USAGE: '/attack <user> where <user> should be the name of the user who you want to fight with.", $user.username);
                }
                break;
            }
            case this.config.CMDS.LISTTRAINERS: {
                tm.PokemonTrainers.forEach((trainer) => {
                    Messenger.sendInfoMessage(this.room, trainer.User + " has " + trainer.Pokemon.Name + " on Level " + trainer.Pokemon.Level + " and it as " + trainer.Pokemon.Life + " HP left.", $user.username);
                });
                break;
            }
            case this.config.CMDS.LISTELITEFOUR: {
                this.listEliteFourMembers($user.username);
                break;
            }
            case "debugpkm": {
                tm.PokemonTrainers.forEach((trainer) => Messenger.sendInfoMessage(this.room, customStringify(trainer), $user.username));
                break;
            }
        }

        return $message;
    }

    public addFreebiePokemon($user: User, $kv : KV) {
        const settings = $kv.get("settings");
        const tm = $kv.get("trainerManager");
        if (settings.catch_pokemon === 0 && !tm.PokemonTrainers.has($user.username)) {
            tm.AddPokemonToTrainer(PokeDex.GetRandomPokemon($kv), $user.username, 0);
        }
        $kv.set("trainerManager", tm);
    }

    public addPokemonFlair($message: Message, $user: User, $kv : KV) {
        const tm = $kv.get("trainerManager");
        let msg = $message.orig;
        if (tm.PokemonTrainers.has($user.username) && !$message.isSpam) {
            const pokemon = tm.PokemonTrainers.get($user.username)!.Pokemon;
            msg = PokeDex.GetPokemonIcon(pokemon) + " " + msg;
            if (this.settings.colorize_chat) {
                $message.color = pokemon.Types[0].FontColor;
                $message.bgColor = pokemon.Types[0].Color;
            }
        }
        if ($user.username === this.config.Dev && !$message.isSpam) {
            msg = ":pkmnoak " + msg;
        }
        $message.setBody(msg);
    }

    //#endregion

    //#region OnTip Functions
    public purchaseObjects($user: User, $tip: Tip, $kv : KV) {
        const settings = $kv.get("settings");
        const tm = $kv.get("trainerManager");
        const room =$kv.get("room");

        if (!tm.PokemonTrainers.has($user.username) && settings.catch_pokemon <= $tip.tokens) {
            tm.AddPokemonToTrainer(PokeDex.GetRandomPokemon($kv, $tip.tokens), $user.username, $tip.tokens);
            const pkmn = tm.PokemonTrainers.get($user.username)!.Pokemon;
            Messenger.sendInfoMessage(room, `You successfully caught a ${PokeDex.GetPokemonIcon(pkmn)} ${pkmn.Name}, congrats! Treat it well, fellow trainer.`);
        } else if (tm.PokemonTrainers.has($user.username) && tm.PokemonTrainers.get($user.username)!.BuyStoneConfirmation === true) {
            if ($tip.tokens === settings.stone_price) {
                Messenger.sendInfoMessage(room, "You just purchased a " + tm.PokemonTrainers.get($user.username)!.Pokemon.Types[0].Stone + "!", $user.username);
                tm.PokemonTrainers.get($user.username)!.BuyStoneWarning = false;
                tm.PokemonTrainers.get($user.username)!.BuyStoneConfirmation = false;
                tm.EvolvePokemonOfUser($user.username);
            }
        }
        $kv.set("trainerManager", tm);
    }

    public levelUp($user: User, $tip: Tip, $kv : KV) {
        const tm = $kv.get("trainerManager");
        if (tm.PokemonTrainers.has($user.username)) {
            tm.PokemonTrainers.get($user.username)!.Tipped += $tip.tokens;
            tm.LevelUpPokemonOfUser($user.username, Math.floor($tip.tokens / this.settings.level_pokemon));
        }
        $kv.set("trainerManager", tm);
    }
    public setSettings($kv: KV){
        const $settings = $kv.get("Settings");
        Object.assign(this.settings, $settings);
        $kv.set("Settings", this.settings);
        this.banner = new Banner();        
        this.setAccessControl();
        this.setupEliteFour($kv);
    }

    private setAccessControl(){
        if (this.settings.mod_allow_broadcaster_cmd) {
            this.accessControl = new AccessControl(this.settings.mod_allow_broadcaster_cmd, this.config.Dev, this.config.FairyHelper);
        } else {
            this.accessControl = new AccessControl(this.settings.mod_allow_broadcaster_cmd, "", []);
        }
    }

    public setBroadcaster($kv : KV){
        const room = $kv.get("room");
        let tm = $kv.get("trainerManager");
        tm = new TrainerManager($kv);
        $kv.set("trainerManager", tm);
        this.initBroadcaster(room);
        Messenger.sendSuccessMessage(room, "Pokemon Collector v" + this.config.Version + " started.");
        Messenger.sendBroadcasterNotice(room, "This Pokemon Bot is in beta. It can not become better if I do not know what is wrong. Please comment on the bot's page any errors or questions. Make sure to check out the original Version (PokeDex) of asudem! Thank you.");
    }
    private setupEliteFour($kv){
        const tm = $kv.get("trainerManager");

        if (this.settings.elite_four_1 !== undefined && this.settings.elite_four_1.length > 0 && this.settings.elite_four_1_pokemon !== 0) {
            tm.AddPokemonToTrainer(this.settings.elite_four_1_pokemon, this.settings.elite_four_1, 0);
            tm.PokemonTrainers.get(this.settings.elite_four_1)!.Pokemon.Level = 100;
            tm.PokemonTrainers.get(this.settings.elite_four_1)!.Pokemon.updateStats();
        }
        if (this.settings.elite_four_2 !== undefined && this.settings.elite_four_2.length > 0 && this.settings.elite_four_2_pokemon !== 0) {
            tm.AddPokemonToTrainer(this.settings.elite_four_2_pokemon, this.settings.elite_four_2, 0);
            tm.PokemonTrainers.get(this.settings.elite_four_2)!.Pokemon.Level = 100;
            tm.PokemonTrainers.get(this.settings.elite_four_2)!.Pokemon.updateStats();
        }
        if (this.settings.elite_four_3 !== undefined && this.settings.elite_four_3.length > 0 && this.settings.elite_four_3_pokemon !== 0) {
            tm.AddPokemonToTrainer(this.settings.elite_four_3_pokemon, this.settings.elite_four_3, 0);
            tm.PokemonTrainers.get(this.settings.elite_four_3)!.Pokemon.Level = 100;
            tm.PokemonTrainers.get(this.settings.elite_four_3)!.Pokemon.updateStats();
        }
        if (this.settings.elite_four_4 !== undefined && this.settings.elite_four_4.length > 0 && this.settings.elite_four_4_pokemon !== 0) {
            tm.AddPokemonToTrainer(this.settings.elite_four_4_pokemon, this.settings.elite_four_4, 0);
            tm.PokemonTrainers.get(this.settings.elite_four_4)!.Pokemon.Level = 100;
            tm.PokemonTrainers.get(this.settings.elite_four_4)!.Pokemon.updateStats();
        }
        $kv.set("trainerManager", tm);
    }
    private initBroadcaster($room: Room) {
        this.room=$room;
        if (this.settings.broadcaster_pokemon !== 0) {
            this.trainerManager.AddPokemonToTrainer(this.settings.broadcaster_pokemon, $room.owner, 0);
            if (this.trainerManager.PokemonTrainers.has($room.owner)) {
                this.trainerManager.PokemonTrainers.get($room.owner)!.Pokemon.Level = 200;
                this.trainerManager.PokemonTrainers.get($room.owner)!.Pokemon.updateStats();
            }
        }
    }
    //#endregion

    private eliteFourDefeated(): boolean {
        let defeated = true;

        if (this.settings.elite_four_1.length > 0 && this.trainerManager.PokemonTrainers.has(this.settings.elite_four_1)) {
            defeated = false;
        }
        if (this.settings.elite_four_2.length > 0 && this.trainerManager.PokemonTrainers.has(this.settings.elite_four_2)) {
            defeated = false;
        }
        if (this.settings.elite_four_3.length > 0 && this.trainerManager.PokemonTrainers.has(this.settings.elite_four_3)) {
            defeated = false;
        }
        if (this.settings.elite_four_4.length > 0 && this.trainerManager.PokemonTrainers.has(this.settings.elite_four_4)) {
            defeated = false;
        }

        return defeated;
    }

    private isEliteFourMember(user: string): boolean {
        if (this.settings.elite_four_1 !== undefined && this.settings.elite_four_1.length > 0 && user === this.settings.elite_four_1) {
            return true;
        } else if (this.settings.elite_four_2 !== undefined && this.settings.elite_four_2.length > 0 && user === this.settings.elite_four_2) {
            return true;
        } else if (this.settings.elite_four_3 !== undefined && this.settings.elite_four_3.length > 0 && user === this.settings.elite_four_3) {
            return true;
        } else if (this.settings.elite_four_4 !== undefined && this.settings.elite_four_4.length > 0 && user === this.settings.elite_four_4) {
            return true;
        } else {
            return false;
        }
    }

    private listEliteFourMembers(user: string) {
        if (this.settings.elite_four_1 !== undefined && this.settings.elite_four_1.length > 0 && this.trainerManager.PokemonTrainers.has(this.settings.elite_four_1)) {
            const trainer = this.trainerManager.PokemonTrainers.get(this.settings.elite_four_1)!;
            Messenger.sendInfoMessage(this.room, trainer.User + " has " + trainer.Pokemon.Name + " on Level " + trainer.Pokemon.Level + " and it as " + trainer.Pokemon.Life + " HP left.", user);
        }
        if (this.settings.elite_four_2 !== undefined && this.settings.elite_four_2.length > 0 && this.trainerManager.PokemonTrainers.has(this.settings.elite_four_2)) {
            const trainer = this.trainerManager.PokemonTrainers.get(this.settings.elite_four_2)!;
            Messenger.sendInfoMessage(this.room, trainer.User + " has " + trainer.Pokemon.Name + " on Level " + trainer.Pokemon.Level + " and it as " + trainer.Pokemon.Life + " HP left.", user);
        }
        if (this.settings.elite_four_3 !== undefined && this.settings.elite_four_3.length > 0 && this.trainerManager.PokemonTrainers.has(this.settings.elite_four_3)) {
            const trainer = this.trainerManager.PokemonTrainers.get(this.settings.elite_four_3)!;
            Messenger.sendInfoMessage(this.room, trainer.User + " has " + trainer.Pokemon.Name + " on Level " + trainer.Pokemon.Level + " and it as " + trainer.Pokemon.Life + " HP left.", user);
        }
        if (this.settings.elite_four_4 !== undefined && this.settings.elite_four_4.length > 0 && this.trainerManager.PokemonTrainers.has(this.settings.elite_four_4)) {
            const trainer = this.trainerManager.PokemonTrainers.get(this.settings.elite_four_4)!;
            Messenger.sendInfoMessage(this.room, trainer.User + " has " + trainer.Pokemon.Name + " on Level " + trainer.Pokemon.Level + " and it as " + trainer.Pokemon.Life + " HP left.", user);
        }
    }
}
