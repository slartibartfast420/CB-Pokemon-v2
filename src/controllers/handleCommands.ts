import { KV } from "../api/$kv";
import { Message } from "../api/$message";
import { User } from "../api/$user";
import { customStringify } from "../misc/helpers";
import { Pokemons } from "../models/pokemon/pokemon";
import Messenger from "./messenger";
import PokeDex from "./pokedex";

export function handleCommands($message: Message, $user: User, $kv : KV){
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
    const pt = $kv.get("PokemonTrainers");
    this.tm.updateData(pt);

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
                    this.tm.AddPokemonToTrainer(pokedexNumber, targetUser, 0);
                    const pkmn = this.tm.PokemonTrainers.get(targetUser)!.Pokemon;
                    Messenger.sendInfoMessage(this.room, `${PokeDex.GetPokemonIcon(pkmn)} ${pkmn.Name} was given to ${targetUser}`);
                }
                break;
            }
            case this.config.CMDS.EVOLVE: {
                const [targetUser] = args;
                this.tm.EvolvePokemonOfUser(targetUser);
                break;
            }
            case this.config.CMDS.CHANGE: {
                const [targetUser] = args;
                this.tm.ChangePokemonOfUser(targetUser, $kv);
                break;
            }
            case this.config.CMDS.REMOVE: {
                const [targetUser] = args;
                this.tm.RemovePokemonFromTrainer(targetUser);
                break;
            }
            case this.config.CMDS.LEVELUP: {
                const [targetUser, levelsString] = args;
                const levels = parseInt(levelsString, 10);

                if (this.tm.PokemonTrainers.has(targetUser) && levels > 0) {
                    this.tm.PokemonTrainers.get(targetUser)!.Pokemon.Level += levels;
                    if ($user.username !== this.config.Dev && this.tm.PokemonTrainers.get(targetUser)!.Pokemon.Level > 100) {
                        this.tm.PokemonTrainers.get(targetUser)!.Pokemon.Level = 100;
                    }
                    this.tm.PokemonTrainers.get(targetUser)!.Pokemon.updateStats();
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
            //     const exportdata = this.tm.ExportToDTO();
            //     Messenger.sendSuccessMessage(this.room, JSON.stringify(exportdata), $user.username);
            //     break;
            // }
            // case this.config.CMDS.IMPORT: {
            //     const json = args.join(" ");
            //     const importdata: PokemonTrainerDTO[] = JSON.parse(json);
            //     this.tm.ImportFromDTO(importdata);
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
                if (this.tm.PokemonTrainers.has($user.username)) {
                    Messenger.sendInfoMessage(this.room, `You wave goodbye to your level ${this.tm.PokemonTrainers.get($user.username)!.Pokemon.Level} ${this.tm.PokemonTrainers.get($user.username)!.Pokemon.Name} as it scurries freely into the wild!`, $user.username);
                    this.tm.RemovePokemonFromTrainer($user.username);
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
                if (this.tm.PokemonTrainers.has(targetUser)) {
                    Messenger.sendMessageToUser(this.room, PokeDex.IdentifyPokemon(this.tm.PokemonTrainers.get(targetUser)!.Pokemon), $user.username);
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
            if(!this.tm.PokemonTrainers.has($user.username)){
                Messenger.sendErrorMessage(this.room, "You don't have a Pokemon.", $user.username);
                break;
            }

            if (this.tm.PokemonTrainers.has($user.username) && this.tm.PokemonTrainers.get($user.username)!.Pokemon.UsesStone) {
                //console.log(this.tm.PokemonTrainers.get($user.username));
                if (this.tm.PokemonTrainers.get($user.username)!.BuyStoneWarning === true) {
                    if ($user.username === this.room.owner) {
                        this.tm.PokemonTrainers.get($user.username)!.BuyStoneWarning = false;
                        this.tm.PokemonTrainers.get($user.username)!.BuyStoneConfirmation = false;
                        this.tm.EvolvePokemonOfUser($user.username);
                    } else {
                        Messenger.sendInfoMessage(this.room, "Okay, your next tip of " + this.settings.stone_price + " tokens will buy you a " + this.tm.PokemonTrainers.get($user.username)!.Pokemon.Types[0].Stone, $user.username);
                        this.tm.PokemonTrainers.get($user.username)!.BuyStoneConfirmation = true;
                    }
                } else {
                    Messenger.sendInfoMessage(this.room, "Are you sure you want to purchase a " + this.tm.PokemonTrainers.get($user.username)!.Pokemon.Types[0].Stone + "? It costs " + this.settings.stone_price + " tokens to purchase a stone. Type '/buystone' again to allow your next tip of " + this.settings.stone_price + " tokens to buy a " + this.tm.PokemonTrainers.get($user.username)!.Pokemon.Types[0].Stone, $user.username);
                    this.tm.PokemonTrainers.get($user.username)!.BuyStoneWarning = true;
                }
            } else {
                Messenger.sendInfoMessage(this.room, "Your Pokemon does not evolve using a stone!", $user.username);
            }
            break;
        }
        case this.config.CMDS.TRADE: {
            const [param1] = args;

            if (!this.tm.PokemonTrainers.has($user.username)) {
                Messenger.sendErrorMessage(this.room, "Can't do any trading, you don't have a pokemon.", $user.username);
                break;
            }

            if (param1 === this.config.CMDS.ACCEPT) {
                const receiver = this.tm.PokemonTrainers.get($user.username)!;
                if (!this.tm.PokemonTrainers.has(receiver.TradeRequestReceivedFrom!)) {
                    Messenger.sendErrorMessage(this.room, "Your trading partner doesn't seem to have his pokemon anymore...", receiver.User);
                    break;
                }
                const requester = this.tm.PokemonTrainers.get(receiver.TradeRequestReceivedFrom!)!;
                if (requester.TradeRequestedAt === $user.username) {
                    Messenger.sendInfoMessage(this.room, "Preparations complete. Trade has been accepted. Initiating trade.", $user.username);
                    Messenger.sendInfoMessage(this.room, "Preparations complete. Trade has been accepted. Initiating trade.", requester.User);
                    this.tm.TradePokemonWithUser(receiver.User, requester.User);

                    //cb.setTimeout(() => true, 50);
                    Messenger.sendSuccessMessage(this.room, `${requester.User} and ${receiver.User} have successfully traded their pokemon!`);
                } else {
                    Messenger.sendErrorMessage(this.room, "Upps, something went wrong during the trading. Your cache has been cleared and the trade info has been resetted.", $user.username);
                    Messenger.sendErrorMessage(this.room, "Upps, something went wrong during the trading. Your cache has been cleared and the trade info has been resetted.", requester.User);
                }

                this.tm.PokemonTrainers.get(requester.User)!.TradeRequestedAt = undefined;
                this.tm.PokemonTrainers.get(receiver.User)!.TradeRequestReceivedFrom = undefined;
            } else if (param1 === this.config.CMDS.DECLINE) {
                const receiver = this.tm.PokemonTrainers.get($user.username)!;
                const requester = this.tm.PokemonTrainers.get(receiver.TradeRequestReceivedFrom!)!;
                if (requester.TradeRequestedAt === $user.username) {
                    Messenger.sendErrorMessage(this.room, "The trade you requested was sadly decline.", requester.User);
                }
                Messenger.sendErrorMessage(this.room, "You declined the trade request", receiver.User);

                this.tm.PokemonTrainers.get(requester.User)!.TradeRequestedAt = undefined;
                this.tm.PokemonTrainers.get(receiver.User)!.TradeRequestReceivedFrom = undefined;

            } else if (this.tm.PokemonTrainers.has(param1)) {
                // if targetuser has no request open, request trade
                const requester = this.tm.PokemonTrainers.get($user.username)!;
                const receiver = this.tm.PokemonTrainers.get(param1)!;

                const requesterHasNoOpenTrade = requester.TradeRequestedAt === undefined && requester.TradeRequestReceivedFrom === undefined;
                const receiverHasNoOpenTrade = receiver.TradeRequestedAt === undefined && receiver.TradeRequestReceivedFrom === undefined;
                if (requesterHasNoOpenTrade && receiverHasNoOpenTrade) {
                    this.tm.PokemonTrainers.get(receiver.User)!.TradeRequestReceivedFrom = requester.User;
                    this.tm.PokemonTrainers.get(requester.User)!.TradeRequestedAt = receiver.User;

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
                if (!this.tm.PokemonTrainers.has(targetUser)) {
                    Messenger.sendErrorMessage(this.room, "USAGE: '/level <user>' where <user> should be the name of the user who's Pokemon you level want to see.", $user.username);
                    break;
                }

                const targetPokemon = this.tm.PokemonTrainers.get(targetUser)!.Pokemon;

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
            if (this.tm.PokemonTrainers.has(targetUser)) {
                if (this.tm.PokemonTrainers.has($user.username)) {
                    if ($user.username === targetUser) {
                        Messenger.sendErrorMessage(this.room, "Your Pokemon can't attack itself now, can it? Do you have weird fetishes...?", $user.username);
                    } else if (targetUser === this.room.owner && this.isEliteFourMember($user.username)) {
                        Messenger.sendErrorMessage(this.room, "Hey now.. you are a member of the Elite Four, you shouldn't fight against " + this.room.owner, $user.username);
                    } else if (targetUser === this.room.owner && !this.eliteFourDefeated()) {
                        Messenger.sendErrorMessage(this.room, "Wow, woah.. Calm down little fellow trainer. You can't just head to the final boss before beating the Elite Four!", $user.username);
                    } else {
                        const move = this.tm.PokemonTrainers.get($user.username)!.Pokemon.Move;
                        const currentHP = this.tm.PokemonTrainers.get(targetUser)!.Pokemon.Life;
                        const leftHP = this.tm.PokemonTrainers.get($user.username)!.Pokemon.Attack(this.tm.PokemonTrainers.get(targetUser)!.Pokemon);

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
                            Messenger.sendInfoMessage(this.room, `You wave goodbye to your level ${this.tm.PokemonTrainers.get(targetUser)!.Pokemon.Level} ${this.tm.PokemonTrainers.get(targetUser)!.Pokemon.Name} as it scurries freely into the wild!`, targetUser);

                            this.tm.RemovePokemonFromTrainer(targetUser);
                            this.tm.LevelUpPokemonOfUser($user.username, 2);
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
            this.tm.PokemonTrainers.forEach((trainer) => {
                Messenger.sendInfoMessage(this.room, trainer.User + " has " + trainer.Pokemon.Name + " on Level " + trainer.Pokemon.Level + " and it as " + trainer.Pokemon.Life + " HP left.", $user.username);
            });
            break;
        }
        case this.config.CMDS.LISTELITEFOUR: {
            this.listEliteFourMembers($user.username);
            break;
        }
        case "debugpkm": {
            this.tm.PokemonTrainers.forEach((trainer) => Messenger.sendInfoMessage(this.room, customStringify(trainer), $user.username));
            break;
        }
    }
    $kv.set("PokemonTrainers", this.tm.getData());
    return $message;
}