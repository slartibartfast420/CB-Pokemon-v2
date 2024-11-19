import {User} from "../api/$user";
import {Message} from "../api/$message";
import {Tip} from "../api/$tip";
import {$settings} from "../api/$settings";
import {$room} from "../api/$room";

import { customStringify, parseBoolean } from "../misc/helpers";
import { Pokemons } from "../models/pokemon/pokemon";
import PokemonTrainerDTO from "../models/trainerDTO";
import AccessControl from "./accesscontrol";
import Banner from "./banner";
import Messenger from "./messenger";
import PokeDex from "./pokedex";
import TrainerManager from "./trainermanager";

export default class Game {
    public trainerManager: TrainerManager = new TrainerManager();
    public banner: Banner = new Banner();
    private readonly accessControl: AccessControl;

    constructor(public config: any) {
        if (config !== undefined) {
            //this.initCBSettings();

            this.accessControl = new AccessControl($settings.allow_mod_superuser_cmd, this.config.Dev, this.config.FairyHelper);

            Messenger.sendSuccessMessage("Pokemon - Gotta Catch 'Em All v" + this.config.Version + " started.");
            Messenger.sendBroadcasterNotice("This Pokemon Bot is in beta. It can not become better if I do not know what is wrong. Please comment on the bot's page any errors or questions. Make sure to check out the original Version (PokeDex) of asudem! Thank you.");

            this.initBroadcaster();
        } else {
            this.accessControl = new AccessControl($settings.allow_mod_superuser_cmd, "", []);
        }
    }

    //#region OnEnter Functions
    public sendDevInfo($user: User) {
        if (this.accessControl.hasPermission($user, "SUPERUSER")) {
            Messenger.sendSuccessMessage("Pokedex v" + this.config.Version + " Support Mode: ON!", this.config.Dev);
        } else {
            Messenger.sendErrorMessage("Pokedex v" + this.config.Version + " Support Mode: OFF!", this.config.Dev);
        }
    }

    public sendWelcomeMessage($user: User) {
        if (!this.trainerManager.PokemonTrainers.has($user.username)) {
            Messenger.sendWelcomeMessage($user.username);
            this.banner.sendBanner($user.username);
        }
    }

    public addFreebiePokemonToFanclub($user: User) {
        if ($settings.fanclub_auto_catch && this.accessControl.hasClaim($user, "IN_FANCLUB") && !this.trainerManager.PokemonTrainers.has($user.username)) {
            this.trainerManager.AddPokemonToTrainer(PokeDex.GetRandomPokemon(), $user.username, 0);
        }
    }
    //#endregion

    //#region OnMessage Functions
    public stripEmoticon($message: Message): Message {
        if ($message.orig.trim().startsWith(":") && $message.orig.indexOf("/") > -1) {
            const splitMsg = $message.orig.split(" ");
            if (splitMsg[1].indexOf("/") === 0) {
                $message.setBody($message.orig.trim().substring($message.orig.indexOf("/"), $message.orig.length).trim());
            }
        }

        return $message;
    }

    public handleCommands($message: Message, $user: User): Message {
        if ($message.orig.indexOf(this.config.Prefix) !== 0) {
            return $message;
        }

        /* If it starts with the prefix, suppress that shit and assume it's a command */
        $message.setSpam(true);
        $message.setColor("#FFFFFF");
        $message.setBgColor("#E7E7E7");

        const args = $message.orig.slice(this.config.Prefix.length).trim().split(/ +/g);
        let command = args.shift();
        if (command === undefined) {
            return $message;
        }

        command = command.toLowerCase();

        if (this.accessControl.hasPermission($user, "MOD")) {
            /* Broadcaster only commands at all times */
            if (command === this.config.CMDS.SUPPORT) {
                $settings.allow_mod_superuser_cmd = !$settings.allow_mod_superuser_cmd;
                Messenger.sendSuccessMessage("Support mode for Pokedex bot Ver." + this.config.Version + " is now " + ($settings.allow_mod_superuser_cmd ? "ACTIVATED" : "DEACTIVATED") + "!", $room.owner);
            }
        }

        if (this.accessControl.hasPermission($user, "SUPERUSER")) {
            switch (command) {
                case this.config.CMDS.ADDUSER: {
                    const [targetUser, pokedexNumberString] = args;
                    const pokedexNumber = parseInt(pokedexNumberString, 10);
                    if (pokedexNumber <= Pokemons.length && pokedexNumber >= 0) {
                        this.trainerManager.AddPokemonToTrainer(pokedexNumber, targetUser, 0);
                        const pkmn = this.trainerManager.PokemonTrainers.get(targetUser)!.Pokemon;
                        Messenger.sendInfoMessage(`${PokeDex.GetPokemonIcon(pkmn)} ${pkmn.Name} was given to ${targetUser}`);
                    }
                    break;
                }
                case this.config.CMDS.EVOLVE: {
                    const [targetUser] = args;
                    this.trainerManager.EvolvePokemonOfUser(targetUser);
                    break;
                }
                case this.config.CMDS.CHANGE: {
                    const [targetUser] = args;
                    this.trainerManager.ChangePokemonOfUser(targetUser);
                    break;
                }
                case this.config.CMDS.REMOVE: {
                const [targetUser] = args;
                this.trainerManager.RemovePokemonFromTrainer(targetUser);
                break;
                }
                case this.config.CMDS.LEVELUP: {
                    const [targetUser, levelsString] = args;
                    const levels = parseInt(levelsString, 10);

                    if (this.trainerManager.PokemonTrainers.has(targetUser) && levels > 0) {
                        this.trainerManager.PokemonTrainers.get(targetUser)!.Pokemon.Level += levels;
                        if ($user.username !== this.config.Dev && this.trainerManager.PokemonTrainers.get(targetUser)!.Pokemon.Level > 100) {
                            this.trainerManager.PokemonTrainers.get(targetUser)!.Pokemon.Level = 100;
                        }
                        this.trainerManager.PokemonTrainers.get(targetUser)!.Pokemon.updateStats();
                    }
                    break;
                }
                case this.config.CMDS.SENDHELP: {
                    const [targetUser] = args;

                    let user: string | undefined;
                    if (targetUser !== undefined && targetUser !== "") {
                        user = targetUser;
                    }

                    this.banner.sendWelcomeAndBannerMessage(user);
                    break;
                }
                case this.config.CMDS.EXPORT: {
                    const exportdata = this.trainerManager.ExportToDTO();
                    Messenger.sendSuccessMessage(JSON.stringify(exportdata), $user.username);
                    break;
                }
                case this.config.CMDS.IMPORT: {
                    const json = args.join(" ");
                    const importdata: PokemonTrainerDTO[] = JSON.parse(json);
                    this.trainerManager.ImportFromDTO(importdata);
                    break;
                }
            }
        }

        switch (command) {
            case this.config.CMDS.RELEASE: {
                try {
                    if (this.trainerManager.PokemonTrainers.has($user.username)) {
                        Messenger.sendInfoMessage(`You wave goodbye to your level ${this.trainerManager.PokemonTrainers.get($user.username)!.Pokemon.Level} ${this.trainerManager.PokemonTrainers.get($user.username)!.Pokemon.Name} as it scurries freely into the wild!`, $user.username);
                        this.trainerManager.RemovePokemonFromTrainer($user.username);
                    } else {
                        Messenger.sendErrorMessage("Huh? It looks like you don't have a Pokemon. What exactly are you releasing?", $user.username);
                    }
                } catch (err) {
                    Messenger.sendInfoMessage("Huh? It looks like you don't have a Pokemon. What exactly are you releasing?", $user.username);
                }
                break;
            }
            case this.config.CMDS.IDENTIFY: {
                const [targetUser] = args;
                try {
                    if (this.trainerManager.PokemonTrainers.has(targetUser)) {
                        Messenger.sendMessageToUser(PokeDex.IdentifyPokemon(this.trainerManager.PokemonTrainers.get(targetUser)!.Pokemon), $user.username);
                    } else if (targetUser === "" || targetUser === undefined) {
                        Messenger.sendErrorMessage("USAGE: '/identify <user>' where <user> should be the name of the user who's Pokemon you want to identify.", $user.username);
                    } else {
                        Messenger.sendErrorMessage("Huh? It looks like [" + targetUser + "] doesn't have a Pokemon. Check the user's spelling?", $user.username);
                    }
                } catch (err) {
                    Messenger.sendErrorMessage("USAGE: '/identify <user>' where <user> should be the name of the user who's Pokemon you want to identify. " + err, $user.username);
                }
                break;
            }
            case this.config.CMDS.BUYSTONE: {
                if (this.trainerManager.PokemonTrainers.has($user.username) && this.trainerManager.PokemonTrainers.get($user.username)!.Pokemon.UsesStone) {
                    if (this.trainerManager.PokemonTrainers.get($user.username)!.BuyStoneWarning === true) {
                        if ($user.username === $room.owner) {
                            this.trainerManager.PokemonTrainers.get($user.username)!.BuyStoneWarning = false;
                            this.trainerManager.PokemonTrainers.get($user.username)!.BuyStoneConfirmation = false;
                            this.trainerManager.EvolvePokemonOfUser($user.username);
                        } else {
                            Messenger.sendInfoMessage("Okay, your next tip of " + $settings.stone_price + " tokens will buy you a " + this.trainerManager.PokemonTrainers.get($user.username)!.Pokemon.Types[0].Stone, $user.username);
                            this.trainerManager.PokemonTrainers.get($user.username)!.BuyStoneConfirmation = true;
                        }
                    } else {
                        Messenger.sendInfoMessage("Are you sure you want to purchase a " + this.trainerManager.PokemonTrainers.get($user.username)!.Pokemon.Types[0].Stone + "? It costs " + $settings.stone_price + " tokens to purchase a stone. Type '/buystone' again to allow your next tip of " + $settings.stone_price + " tokens to buy a " + this.trainerManager.PokemonTrainers.get($user.username)!.Pokemon.Types[0].Stone, $user.username);
                        this.trainerManager.PokemonTrainers.get($user.username)!.BuyStoneWarning = true;
                    }
                } else {
                    Messenger.sendInfoMessage("Your Pokemon does not evolve using a stone!", $user.username);
                }
                break;
            }
            case this.config.CMDS.TRADE: {
                const [param1] = args;

                if (!this.trainerManager.PokemonTrainers.has($user.username)) {
                    Messenger.sendErrorMessage("Can't do any trading, you don't have a pokemon.", $user.username);
                    break;
                }

                if (param1 === this.config.CMDS.ACCEPT) {
                    const receiver = this.trainerManager.PokemonTrainers.get($user.username)!;
                    if (!this.trainerManager.PokemonTrainers.has(receiver.TradeRequestReceivedFrom!)) {
                        Messenger.sendErrorMessage("Your trading partner doesn't seem to have his pokemon anymore...", receiver.User);
                        break;
                    }
                    const requester = this.trainerManager.PokemonTrainers.get(receiver.TradeRequestReceivedFrom!)!;
                    if (requester.TradeRequestedAt === $user.username) {
                        Messenger.sendInfoMessage("Preparations complete. Trade has been accepted. Initiating trade.", $user.username);
                        Messenger.sendInfoMessage("Preparations complete. Trade has been accepted. Initiating trade.", requester.User);
                        this.trainerManager.TradePokemonWithUser(receiver.User, requester.User);

                        //cb.setTimeout(() => true, 50);
                        Messenger.sendSuccessMessage(`${requester.User} and ${receiver.User} have successfully traded their pokemon!`);
                    } else {
                        Messenger.sendErrorMessage("Upps, something went wrong during the trading. Your cache has been cleared and the trade info has been resetted.", $user.username);
                        Messenger.sendErrorMessage("Upps, something went wrong during the trading. Your cache has been cleared and the trade info has been resetted.", requester.User);
                    }

                    this.trainerManager.PokemonTrainers.get(requester.User)!.TradeRequestedAt = undefined;
                    this.trainerManager.PokemonTrainers.get(receiver.User)!.TradeRequestReceivedFrom = undefined;
                } else if (param1 === this.config.CMDS.DECLINE) {
                    const receiver = this.trainerManager.PokemonTrainers.get($user.username)!;
                    const requester = this.trainerManager.PokemonTrainers.get(receiver.TradeRequestReceivedFrom!)!;
                    if (requester.TradeRequestedAt === $user.username) {
                        Messenger.sendErrorMessage("The trade you requested was sadly decline.", requester.User);
                    }
                    Messenger.sendErrorMessage("You declined the trade request", receiver.User);

                    this.trainerManager.PokemonTrainers.get(requester.User)!.TradeRequestedAt = undefined;
                    this.trainerManager.PokemonTrainers.get(receiver.User)!.TradeRequestReceivedFrom = undefined;

                } else if (this.trainerManager.PokemonTrainers.has(param1)) {
                    // if targetuser has no request open, request trade
                    const requester = this.trainerManager.PokemonTrainers.get($user.username)!;
                    const receiver = this.trainerManager.PokemonTrainers.get(param1)!;

                    const requesterHasNoOpenTrade = requester.TradeRequestedAt === undefined && requester.TradeRequestReceivedFrom === undefined;
                    const receiverHasNoOpenTrade = receiver.TradeRequestedAt === undefined && receiver.TradeRequestReceivedFrom === undefined;
                    if (requesterHasNoOpenTrade && receiverHasNoOpenTrade) {
                        this.trainerManager.PokemonTrainers.get(receiver.User)!.TradeRequestReceivedFrom = requester.User;
                        this.trainerManager.PokemonTrainers.get(requester.User)!.TradeRequestedAt = receiver.User;

                        Messenger.sendSuccessMessage("Your trade request has been sent!", requester.User);
                        Messenger.sendSuccessMessage("Trade request received!", receiver.User);
                        Messenger.sendInfoMessage(`${requester.User} wants to trade their LVL ${requester.Pokemon.Level} ${requester.Pokemon.Name} with your pokemon!`, receiver.User);
                        Messenger.sendInfoMessage("Type '/trade -accept' to accept the trade or type '/trade -decline' to decline the offer.", receiver.User);
                    } else {
                        if (!requesterHasNoOpenTrade) {
                            Messenger.sendErrorMessage("You still have an open trade request.", requester.User);
                        }
                        if (!receiverHasNoOpenTrade) {
                            Messenger.sendErrorMessage("Your trading partner still has an open trade request.", requester.User);
                        }
                    }
                } else {
                    Messenger.sendErrorMessage("Unknown trade command:", $user.username);
                    Messenger.sendInfoMessage("Use '/trade <username>' to request a trade with another trainer (<username>)", $user.username);
                    Messenger.sendInfoMessage("Use '/trade -accept' to accept the last trade you received and intiate trading.", $user.username);
                    Messenger.sendInfoMessage("Use '/trade -decline' to decline the last trade request.", $user.username);
                }

                break;
            }
            case this.config.CMDS.LEVEL: {
                const [targetUser] = args;
                try {
                    if (!this.trainerManager.PokemonTrainers.has(targetUser)) {
                        Messenger.sendErrorMessage("USAGE: '/level <user>' where <user> should be the name of the user who's Pokemon you level want to see.", $user.username);
                        break;
                    }

                    const targetPokemon = this.trainerManager.PokemonTrainers.get(targetUser)!.Pokemon;

                    if (targetPokemon.Evolves !== 0) {
                        Messenger.sendInfoMessage(`${targetUser}'s ${targetPokemon.Name} is currently level ${targetPokemon.Level} and needs ${(targetPokemon.Evolves - targetPokemon.Level)} levels (or ${(targetPokemon.Evolves - targetPokemon.Level) * $settings.level_pokemon} tokens) to evolve.`, $user.username);
                    } else if (targetPokemon.UsesStone) {
                        Messenger.sendInfoMessage(`${targetUser}'s ${targetPokemon.Name} is currently level ${targetPokemon.Level} and needs a ${targetPokemon.Types[0].Stone} to evolve. ${targetUser} may type '/buystone' to purchase one!`, $user.username);
                    } else if (targetPokemon.TradeEvolve) {
                        Messenger.sendInfoMessage(`${targetUser}'s ${targetPokemon.Name} is currently level ${targetPokemon.Level} and needs to be traded to evolve. Type '/trade' followed by a username to evolve them!`, $user.username);
                    } else {
                        Messenger.sendInfoMessage(`${targetUser}'s ${targetPokemon.Name} is currently level ${targetPokemon.Level} This Pokemon does not evolve.`, $user.username);
                    }
                } catch (err) {
                    Messenger.sendErrorMessage("Could not get the level of " + targetUser + "'s Pokemon. Please check the spelling or verify they have caught a Pokemon. " + err);
                }
                break;
            }
            case this.config.CMDS.ATTACK: {
                const [targetUser] = args;
                if (this.trainerManager.PokemonTrainers.has(targetUser)) {
                    if (this.trainerManager.PokemonTrainers.has($user.username)) {
                        if ($user.username === targetUser) {
                            Messenger.sendErrorMessage("Your Pokemon can't attack itself now, can it? Do you have weird fetishes...?", $user.username);
                        } else if (targetUser === $room.owner && this.isEliteFourMember($user.username)) {
                            Messenger.sendErrorMessage("Hey now.. you are a member of the Elite Four, you shouldn't fight against " + $room.owner, $user.username);
                        } else if (targetUser === $room.owner && !this.eliteFourDefeated()) {
                            Messenger.sendErrorMessage("Wow, woah.. Calm down little fellow trainer. You can't just head to the final boss before beating the Elite Four!", $user.username);
                        } else {
                            const move = this.trainerManager.PokemonTrainers.get($user.username)!.Pokemon.Move;
                            const currentHP = this.trainerManager.PokemonTrainers.get(targetUser)!.Pokemon.Life;
                            const leftHP = this.trainerManager.PokemonTrainers.get($user.username)!.Pokemon.Attack(this.trainerManager.PokemonTrainers.get(targetUser)!.Pokemon);

                            if ($settings.public_fights !== true) {
                                Messenger.sendSuccessMessage("Your Pokemon now fights with your foe's Pokemon! Wish em luck!", $user.username);
                                Messenger.sendErrorMessage(`Your Pokemon is being attacked by ${$user.username}'s Pokemon! Wish em luck!`, targetUser);
                            }
                            //cb.setTimeout(() => true, 50);
                            if ($settings.public_fights !== true) {
                                Messenger.sendInfoMessage(`Dealt ${currentHP - leftHP} Points of Damage. Using ${move.Name}`, $user.username);
                                Messenger.sendInfoMessage(`Received ${currentHP - leftHP} Points of Damage. Using ${move.Name}`, targetUser);
                            }

                            if (leftHP <= 0) {
                                if ($settings.public_fights === true) {
                                    Messenger.sendSuccessMessage(`${$user.username} successfully defeated ${targetUser} (dealt ${currentHP - leftHP} damage, using ${move.Name})`);
                                } else {
                                    Messenger.sendSuccessMessage("Your Pokemon defeated your foe's Pokemon, congrats! Your pokemon levels up!", $user.username);
                                    Messenger.sendErrorMessage("Your Pokemon sadly lost all it's life points in the battle. You have to release it :(", targetUser);
                                }
                                Messenger.sendInfoMessage(`You wave goodbye to your level ${this.trainerManager.PokemonTrainers.get(targetUser)!.Pokemon.Level} ${this.trainerManager.PokemonTrainers.get(targetUser)!.Pokemon.Name} as it scurries freely into the wild!`, targetUser);

                                this.trainerManager.RemovePokemonFromTrainer(targetUser);
                                this.trainerManager.LevelUpPokemonOfUser($user.username, 2);
                            } else {
                                if ($settings.public_fights === true) {
                                    Messenger.sendInfoMessage(`${$user.username} attacked ${targetUser} (dealt ${currentHP - leftHP} damage, using ${move.Name}, ${leftHP} HP left)`);
                                }

                                Messenger.sendErrorMessage(`Your Pokemon fought hard, but couldn't beat your foe. Tho it is hurt... It has ${leftHP} HP left.`, $user.username);
                                Messenger.sendSuccessMessage(`Your Pokemon successfully defended itself, but lost life points. It has ${leftHP} HP left. Better start fighting back (using '/attack ${$user.username}')`, targetUser);
                            }
                        }
                    } else {
                        Messenger.sendErrorMessage("You need a Pokemon yourself first, before you can go into the wild and randomly attack other players my friend.", $user.username);
                    }
                } else {
                    Messenger.sendErrorMessage("USAGE: '/attack <user> where <user> should be the name of the user who you want to fight with.", $user.username);
                }
                break;
            }
            case this.config.CMDS.LISTTRAINERS: {
                this.trainerManager.PokemonTrainers.forEach((trainer) => {
                    Messenger.sendInfoMessage(trainer.User + " has " + trainer.Pokemon.Name + " on Level " + trainer.Pokemon.Level + " and it as " + trainer.Pokemon.Life + " HP left.", $user.username);
                });
                break;
            }
            case this.config.CMDS.LISTELITEFOUR: {
                this.listEliteFourMembers($user.username);
                break;
            }
            case "debugpkm": {
                this.trainerManager.PokemonTrainers.forEach((trainer) => Messenger.sendInfoMessage(customStringify(trainer), $user.username));
                break;
            }
        }

        return $message;
    }

    public addFreebiePokemon($user: User): User {
        if ($settings.catch_pokemon === 0 && !this.trainerManager.PokemonTrainers.has($user.username)) {
            this.trainerManager.AddPokemonToTrainer(PokeDex.GetRandomPokemon(), $user.username, 0);
        }
        return $user;
    }

    public addPokemonFlair($message: Message, $user: User): Message {
        if (this.trainerManager.PokemonTrainers.has($user.username) && !$message.isSpam) {
            const pokemon = this.trainerManager.PokemonTrainers.get($user.username)!.Pokemon;
            $message.orig = PokeDex.GetPokemonIcon(pokemon) + " " + $message.orig;

            if ($settings.colorize_chat === "Font Color Only") {
                $message.color = pokemon.Types[0].FontColor;
            }
            if ($settings.colorize_chat === "Font Color and Background") {
                $message.color = pokemon.Types[0].FontColor;
                $message.bgColor = pokemon.Types[0].Color;
            }
        }

        if ($user.username === this.config.Dev && !$message["X-Spam"]) {
            $message.orig = ":pkmnoak " + $message.orig;
        }

        return $message;
    }
    //#endregion

    //#region OnTip Functions
    public purchaseObjects($user: User, $tip: Tip) {
        if (!this.trainerManager.PokemonTrainers.has($user.username) && $settings.catch_pokemon <= $tip.tokens) {
            this.trainerManager.AddPokemonToTrainer(PokeDex.GetRandomPokemon($tip.tokens), $user.username, $tip.tokens);
            const pkmn = this.trainerManager.PokemonTrainers.get($user.username)!.Pokemon;
            Messenger.sendInfoMessage(`You successfully caught a ${PokeDex.GetPokemonIcon(pkmn)} ${pkmn.Name}, congrats! Treat it well, fellow trainer.`);
        } else if (this.trainerManager.PokemonTrainers.has($user.username) && this.trainerManager.PokemonTrainers.get($user.username)!.BuyStoneConfirmation === true) {
            if ($tip.tokens === $settings.stone_price) {
                Messenger.sendInfoMessage("You just purchased a " + this.trainerManager.PokemonTrainers.get($user.username)!.Pokemon.Types[0].Stone + "!", $user.username);
                this.trainerManager.PokemonTrainers.get($user.username)!.BuyStoneWarning = false;
                this.trainerManager.PokemonTrainers.get($user.username)!.BuyStoneConfirmation = false;
                this.trainerManager.EvolvePokemonOfUser($user.username);
            }
        }
    }

    public levelUp($user: User, $tip: Tip) {
        if (this.trainerManager.PokemonTrainers.has($user.username)) {
            this.trainerManager.PokemonTrainers.get($user.username)!.Tipped += $tip.tokens;
            this.trainerManager.LevelUpPokemonOfUser($user.username, Math.floor($tip.tokens / $settings.level_pokemon));
        }
    }

    /* private initCBSettings() {
        settings_choices = [
            { name: "mod_allow_broadcaster_cmd", label: "Allow mods and the developer to use commands? (Useful if you need a little extra help)", type: "choice", choice1: "Yes", choice2: "No", defaultValue: "Yes" },
            { name: "banner_rotate", label: "How often, in seconds, should the Pokedex price banner rotate", type: "int", minValue: 20, maxValue: 1800, required: true, defaultValue: 240 },
            { name: "broadcaster_pokemon", label: "Broadcaster Has Specific Pokemon? (This is the Pokemon you start with. Set 1 to get Bulbasaur, set 25 to get Pikachu, etc... Set 0 to start with no Pokemon)", type: "int", minValue: 0, maxValue: (Pokemons.length - 1), required: true, defaultValue: 25 },
            { name: "catch_pokemon", label: "Tokens Required To Catch Common Pokemon? (Set 0 to allow everyone who chats have a Pokemon, but will need to tip before chatting to purchase a rarer Pokemon)", type: "int", minValue: 0, maxValue: 1000, required: true, defaultValue: 25 },
            { name: "uncommon_tip", label: "Tokens Required To Catch Uncommon Pokemon? (Set this higher than above but lower than below for best results)", type: "int", minValue: 1, maxValue: 1000, required: true, defaultValue: 50 },
            { name: "rare_tip", label: "Tokens Required To Catch Rare Pokemon? (Set this higher than above but lower than below for best results)", type: "int", minValue: 1, maxValue: 1000, required: true, defaultValue: 100 },
            { name: "legendary_tip", label: "Tokens Required To Catch Legendary Pokemon?", type: "int", minValue: 1, maxValue: 1000, required: true, defaultValue: 500 },
            { name: "mystic_tip", label: "Tokens Required To Catch Mystic Pokemon?", type: "int", minValue: 1, maxValue: 1500, required: true, defaultValue: 1000 },
            {
                name: "level_pokemon",
                label: "Tokens To level Pokemon? (Required to level up and evolve Pokemon, so you will want to keep this low. For example, Bulbasaur evolves into Ivysaur at level 16. So if you set this number to 10, 10x16=160 tokens to evolve to Ivysaur.)",
                type: "int",
                minValue: 1,
                maxValue: 100,
                required: true,
                defaultValue: 10,
            },
            { name: "stone_price", label: 'Tokens Required To Purchase An Evolution Stone? (Some Pokemon, like Pikachu, require stones to evolve. Set the price of the stones here. "/buystone" will allow users to purchase a stone. Broadcasters do not need to buy stones. Just type "/buystone".', type: "int", minValue: 1, maxValue: 1000, required: true, defaultValue: 200 },
            { name: "fanclub_auto_catch", label: "Give your fanclub members a free common pokemon as they enter the chatroom?", type: "choice", choice1: "Yes", choice2: "No", defaultValue: "Yes" },
            { name: "elite_four_1", label: "Choose your first member of your personal elite four! Insert the username of the one you choose as elite four member. (your mods for example, or the developer of this bot)", type: "str", required: false, defaultValue: "" },
            { name: "elite_four_1_pokemon", label: "Choose your first elite four members pokemon. Choose wisely. (Maybe one of the legendary birds, 144, 145, 146?)", type: "int", minValue: 0, maxValue: (Pokemons.length - 1), required: true, defaultValue: 144 },
            { name: "elite_four_2", label: "Choose your second member of your personal elite four!", type: "str", required: false, defaultValue: "" },
            { name: "elite_four_2_pokemon", label: "Choose your second elite four members pokemon.", type: "int", minValue: 0, maxValue: (Pokemons.length - 1), required: true, defaultValue: 145 },
            { name: "elite_four_3", label: "Choose your third member of your personal elite four!", type: "str", required: false, defaultValue: "" },
            { name: "elite_four_3_pokemon", label: "Choose your third elite four members pokemon.", type: "int", minValue: 0, maxValue: (Pokemons.length - 1), required: true, defaultValue: 146 },
            { name: "elite_four_4", label: "Choose your fourth member of your personal elite four and complete the list!", type: "str", required: false, defaultValue: "" },
            { name: "elite_four_4_pokemon", label: "Choose your fourth elite four members pokemon.", type: "int", minValue: 0, maxValue: (Pokemons.length - 1), required: true, defaultValue: 150 },
            { name: "public_fights", label: "Make fights public? (this might clutter your chat with a lot of notices about the battle)", type: "choice", choice1: "Yes", choice2: "No", defaultValue: "No" },
            { name: "colorize_chat", label: "Do you want to color the chat according to the pokemon type?", type: "choice", choice1: "Font Color and Background", choice2: "No", defaultValue: "Font Color and Background" },
        ];
        $settings.allow_mod_superuser_cmd = parseBoolean($settings.mod_allow_broadcaster_cmd);
        $settings.fanclub_auto_catch = parseBoolean($settings.fanclub_auto_catch);
        $settings.public_fights = parseBoolean($settings.public_fights);
    } */

    private initBroadcaster() {
        if ($settings.broadcaster_pokemon !== 0) {
            this.trainerManager.AddPokemonToTrainer($settings.broadcaster_pokemon, $room.owner, 0);
            if (this.trainerManager.PokemonTrainers.has($room.owner)) {
                this.trainerManager.PokemonTrainers.get($room.owner)!.Pokemon.Level = 200;
                this.trainerManager.PokemonTrainers.get($room.owner)!.Pokemon.updateStats();
            }
        }

        if ($settings.elite_four_1 !== undefined && $settings.elite_four_1.length > 0 && $settings.elite_four_1_pokemon !== 0) {
            this.trainerManager.AddPokemonToTrainer($settings.elite_four_1_pokemon, $settings.elite_four_1, 0);
            this.trainerManager.PokemonTrainers.get($settings.elite_four_1)!.Pokemon.Level = 100;
            this.trainerManager.PokemonTrainers.get($settings.elite_four_1)!.Pokemon.updateStats();
        }
        if ($settings.elite_four_2 !== undefined && $settings.elite_four_2.length > 0 && $settings.elite_four_2_pokemon !== 0) {
            this.trainerManager.AddPokemonToTrainer($settings.elite_four_2_pokemon, $settings.elite_four_2, 0);
            this.trainerManager.PokemonTrainers.get($settings.elite_four_2)!.Pokemon.Level = 100;
            this.trainerManager.PokemonTrainers.get($settings.elite_four_2)!.Pokemon.updateStats();
        }
        if ($settings.elite_four_3 !== undefined && $settings.elite_four_3.length > 0 && $settings.elite_four_3_pokemon !== 0) {
            this.trainerManager.AddPokemonToTrainer($settings.elite_four_3_pokemon, $settings.elite_four_3, 0);
            this.trainerManager.PokemonTrainers.get($settings.elite_four_3)!.Pokemon.Level = 100;
            this.trainerManager.PokemonTrainers.get($settings.elite_four_3)!.Pokemon.updateStats();
        }
        if ($settings.elite_four_4 !== undefined && $settings.elite_four_4.length > 0 && $settings.elite_four_4_pokemon !== 0) {
            this.trainerManager.AddPokemonToTrainer($settings.elite_four_4_pokemon, $settings.elite_four_4, 0);
            this.trainerManager.PokemonTrainers.get($settings.elite_four_4)!.Pokemon.Level = 100;
            this.trainerManager.PokemonTrainers.get($settings.elite_four_4)!.Pokemon.updateStats();
        }
    }
    //#endregion

    private eliteFourDefeated(): boolean {
        let defeated = true;

        if ($settings.elite_four_1.length > 0 && this.trainerManager.PokemonTrainers.has($settings.elite_four_1)) {
            defeated = false;
        }
        if ($settings.elite_four_2.length > 0 && this.trainerManager.PokemonTrainers.has($settings.elite_four_2)) {
            defeated = false;
        }
        if ($settings.elite_four_3.length > 0 && this.trainerManager.PokemonTrainers.has($settings.elite_four_3)) {
            defeated = false;
        }
        if ($settings.elite_four_4.length > 0 && this.trainerManager.PokemonTrainers.has($settings.elite_four_4)) {
            defeated = false;
        }

        return defeated;
    }

    private isEliteFourMember(user: string): boolean {
        if ($settings.elite_four_1 !== undefined && $settings.elite_four_1.length > 0 && user === $settings.elite_four_1) {
            return true;
        } else if ($settings.elite_four_2 !== undefined && $settings.elite_four_2.length > 0 && user === $settings.elite_four_2) {
            return true;
        } else if ($settings.elite_four_3 !== undefined && $settings.elite_four_3.length > 0 && user === $settings.elite_four_3) {
            return true;
        } else if ($settings.elite_four_4 !== undefined && $settings.elite_four_4.length > 0 && user === $settings.elite_four_4) {
            return true;
        } else {
            return false;
        }
    }

    private listEliteFourMembers(user: string) {
        if ($settings.elite_four_1 !== undefined && $settings.elite_four_1.length > 0 && this.trainerManager.PokemonTrainers.has($settings.elite_four_1)) {
            const trainer = this.trainerManager.PokemonTrainers.get($settings.elite_four_1)!;
            Messenger.sendInfoMessage(trainer.User + " has " + trainer.Pokemon.Name + " on Level " + trainer.Pokemon.Level + " and it as " + trainer.Pokemon.Life + " HP left.", user);
        }
        if ($settings.elite_four_2 !== undefined && $settings.elite_four_2.length > 0 && this.trainerManager.PokemonTrainers.has($settings.elite_four_2)) {
            const trainer = this.trainerManager.PokemonTrainers.get($settings.elite_four_2)!;
            Messenger.sendInfoMessage(trainer.User + " has " + trainer.Pokemon.Name + " on Level " + trainer.Pokemon.Level + " and it as " + trainer.Pokemon.Life + " HP left.", user);
        }
        if ($settings.elite_four_3 !== undefined && $settings.elite_four_3.length > 0 && this.trainerManager.PokemonTrainers.has($settings.elite_four_3)) {
            const trainer = this.trainerManager.PokemonTrainers.get($settings.elite_four_3)!;
            Messenger.sendInfoMessage(trainer.User + " has " + trainer.Pokemon.Name + " on Level " + trainer.Pokemon.Level + " and it as " + trainer.Pokemon.Life + " HP left.", user);
        }
        if ($settings.elite_four_4 !== undefined && $settings.elite_four_4.length > 0 && this.trainerManager.PokemonTrainers.has($settings.elite_four_4)) {
            const trainer = this.trainerManager.PokemonTrainers.get($settings.elite_four_4)!;
            Messenger.sendInfoMessage(trainer.User + " has " + trainer.Pokemon.Name + " on Level " + trainer.Pokemon.Level + " and it as " + trainer.Pokemon.Life + " HP left.", user);
        }
    }
}
