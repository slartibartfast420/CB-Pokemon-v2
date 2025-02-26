//import { $callback } from "../api/$callback";
import { KV } from "../api/$kv";
import { Room } from "../api/$room";
import { User } from "../api/$user";
import { customStringify } from "../misc/helpers";
import Game from "./game";
import Messenger from "./messenger";
import PokeDex from "./pokedex";


export function userCommands(this: Game, command, args, $user: User, $room : Room, $kv : KV){
    switch (command) {
        case this.config.CMDS.GETNEWPKMN: {
            try {
                if(this.settings.fanclub_auto_catch && this.accessControl.hasClaim($user, "IN_FANCLUB")){
                    this.changeFreebiePokemonFanclub($user, $kv);
                }
            } catch (err){
                Messenger.sendErrorMessage($room, "Pokemon: You do not have permission to use this command.", $user.username);
            }
            break;
        }
        case this.config.CMDS.RELEASE: {
            try {
                const pt = $kv.get("PokemonTrainerDTO");
                this.tm.updateData(pt);
                if (this.tm.PokemonTrainers.has($user.username)) {
                    Messenger.sendInfoMessage($room, `You wave goodbye to your level ${this.tm.PokemonTrainers.get($user.username)!.Pokemon.Level} ${this.tm.PokemonTrainers.get($user.username)!.Pokemon.Name} as it scurries freely into the wild!`, $user.username);
                    this.tm.RemovePokemonFromTrainer($user.username);
                } else {
                    Messenger.sendErrorMessage($room, "Huh? It looks like you don't have a Pokemon. What exactly are you releasing?", $user.username);
                }
            } catch (err) {
                Messenger.sendInfoMessage($room, "Huh? It looks like you don't have a Pokemon. What exactly are you releasing?", $user.username);
            }
            break;
        }
        case this.config.CMDS.IDENTIFY: {
            const [targetUser] = args;
            try {
                const pt = $kv.get("PokemonTrainerDTO");
                this.tm.updateData(pt);
                if (this.tm.PokemonTrainers.has(targetUser)) {
                    Messenger.sendMessageToUser($room, PokeDex.IdentifyPokemon(this.tm.PokemonTrainers.get(targetUser)!.Pokemon), $user.username);
                } else if (targetUser === "" || targetUser === undefined) {
                    Messenger.sendErrorMessage($room, "USAGE: '/identify <user>' where <user> should be the name of the user who's Pokemon you want to identify.", $user.username);
                } else {
                    Messenger.sendErrorMessage($room, "Huh? It looks like [" + targetUser + "] doesn't have a Pokemon. Check the user's spelling?", $user.username);
                }
            } catch (err) {
                Messenger.sendErrorMessage($room, "USAGE: '/identify <user>' where <user> should be the name of the user who's Pokemon you want to identify. " + err, $user.username);
            }
            break;
        }
        case this.config.CMDS.BUYSTONE: {
            const pt = $kv.get("PokemonTrainerDTO");
            this.tm.updateData(pt);
            if(!this.tm.PokemonTrainers.has($user.username)){
                Messenger.sendErrorMessage($room, "You don't have a Pokemon.", $user.username);
                break;
            }

            const trainer = this.tm.PokemonTrainers.get($user.username)!;
            if (trainer.Pokemon.Fainted) {
                Messenger.sendErrorMessage($room, "Your Pokemon is fainted and cannot use a stone. Revive it first!", $user.username);
                break;
            }

            if (!trainer.Pokemon.UsesStone) {
                Messenger.sendInfoMessage($room, "Your Pokemon does not evolve using a stone!", $user.username);
                break;
            }

            if ($user.username === $room.owner) {
                trainer.BuyStoneWarning = false;
                trainer.BuyStoneConfirmation = true;
                this.tm.EvolvePokemonOfUser($user.username, $room);
                break;
            }

            if (trainer.BuyStoneWarning === true) {
                Messenger.sendInfoMessage($room, "Okay, your next tip of " + this.settings.stone_price + " tokens will buy you a " + trainer.Pokemon.Types[0].Stone, $user.username);
                trainer.BuyStoneConfirmation = true;
                trainer.BuyStoneWarning = false;
            } else {
                Messenger.sendInfoMessage($room, "Are you sure you want to purchase a " + trainer.Pokemon.Types[0].Stone + "? It costs " + this.settings.stone_price + " tokens to purchase a stone. Type '/buystone' again to allow your next tip of " + this.settings.stone_price + " tokens to buy a " + trainer.Pokemon.Types[0].Stone, $user.username);
                trainer.BuyStoneWarning = true;
            }
            break;
        }
        case this.config.CMDS.REVIVE: {
            const pt = $kv.get("PokemonTrainerDTO");
            this.tm.updateData(pt);
            
            if (!this.tm.PokemonTrainers.has($user.username)) {
                Messenger.sendErrorMessage($room, "You don't have a Pokemon to revive.", $user.username);
                break;
            }

            const trainer = this.tm.PokemonTrainers.get($user.username)!;
            if (!trainer.Pokemon.Fainted) {
                Messenger.sendErrorMessage($room, "Your Pokemon doesn't need reviving - it still has HP!", $user.username);
                break;
            }

            if ($user.username === $room.owner) {
                trainer.BuyReviveWarning = false;
                trainer.BuyReviveConfirmation = true;
                trainer.Pokemon.Fainted = false;
                trainer.Pokemon.FaintedAt = null;
                trainer.Pokemon.updateStats();
                Messenger.sendSuccessMessage($room, "Your Pokemon has been revived!", $user.username);
            } else if (trainer.BuyReviveWarning === true) {
                Messenger.sendInfoMessage($room, `Your next tip of ${this.settings.revive_price} tokens will revive your Pokemon.`, $user.username);
                trainer.BuyReviveConfirmation = true;
                trainer.BuyReviveWarning = false;
            } else {
                Messenger.sendInfoMessage($room, `A revive potion costs ${this.settings.revive_price} tokens. Type '/revive' again to confirm purchase.`, $user.username);
                trainer.BuyReviveWarning = true;
            }
            break;
        }
        case this.config.CMDS.TRADE: {
            const [param1] = args;
            const pt = $kv.get("PokemonTrainerDTO");
            try {
                this.tm.updateData(pt);
                if (!this.tm.PokemonTrainers.has($user.username)) {
                    throw("Missing Pokemon");
                }

                // Check if user's pokemon is fainted
                if (this.tm.PokemonTrainers.get($user.username)!.Pokemon.Fainted) {
                    throw("Your Pokemon is fainted and cannot be traded. Revive it first!");
                }
                
                if (param1 === this.config.CMDS.ACCEPT) {
                    const receiver = this.tm.PokemonTrainers.get($user.username)!;
                    const requester = this.tm.PokemonTrainers.get(receiver.TradeRequestReceivedFrom!)!;

                    // Check if either pokemon is fainted before accepting trade
                    if (receiver.Pokemon.Fainted || requester.Pokemon.Fainted) {
                        throw("Cannot complete trade - one or both Pokemon are fainted. Revive them first!");
                    }

                    if (requester.TradeRequestedAt === $user.username) {
                        Messenger.sendInfoMessage($room, "Preparations complete. Trade has been accepted. Initiating trade.", $user.username);
                        Messenger.sendInfoMessage($room, "Preparations complete. Trade has been accepted. Initiating trade.", requester.User);
                        this.tm.TradePokemonWithUser(receiver.User, requester.User, $room);
                        Messenger.sendSuccessMessage($room, `${requester.User} and ${receiver.User} have successfully traded their pokemon!`);
                    } else {
                        Messenger.sendErrorMessage($room, "Oops, something went wrong during the trading. Your cache has been cleared and the trade info has been reset.", $user.username);
                        Messenger.sendErrorMessage($room, "Oops, something went wrong during the trading. Your cache has been cleared and the trade info has been reset.", requester.User);
                    }

                    this.tm.PokemonTrainers.get(requester.User)!.TradeRequestedAt = undefined;
                    this.tm.PokemonTrainers.get(receiver.User)!.TradeRequestReceivedFrom = undefined;
                } else if (param1 === this.config.CMDS.DECLINE) {
                    const receiver = this.tm.PokemonTrainers.get($user.username)!;
                    const requester = this.tm.PokemonTrainers.get(receiver.TradeRequestReceivedFrom!)!;
                    if (requester.TradeRequestedAt === $user.username) {
                        Messenger.sendErrorMessage($room, "The trade you requested was sadly declined.", requester.User);
                    }
                    Messenger.sendErrorMessage($room, "You declined the trade request", receiver.User);

                    this.tm.PokemonTrainers.get(requester.User)!.TradeRequestedAt = undefined;
                    this.tm.PokemonTrainers.get(receiver.User)!.TradeRequestReceivedFrom = undefined;
                } else if (this.tm.PokemonTrainers.has(param1)) {
                    // Check if target's pokemon is fainted
                    if (this.tm.PokemonTrainers.get(param1)!.Pokemon.Fainted) {
                        throw(`${param1}'s Pokemon is fainted and cannot be traded!`);
                    }

                    const requester = this.tm.PokemonTrainers.get($user.username)!;
                    const receiver = this.tm.PokemonTrainers.get(param1)!;

                    const requesterHasNoOpenTrade = requester.TradeRequestedAt === undefined && requester.TradeRequestReceivedFrom === undefined;
                    const receiverHasNoOpenTrade = receiver.TradeRequestedAt === undefined && receiver.TradeRequestReceivedFrom === undefined;
                    if (requesterHasNoOpenTrade && receiverHasNoOpenTrade) {
                        this.tm.PokemonTrainers.get(receiver.User)!.TradeRequestReceivedFrom = requester.User;
                        this.tm.PokemonTrainers.get(requester.User)!.TradeRequestedAt = receiver.User;

                        Messenger.sendSuccessMessage($room, "Your trade request has been sent!", requester.User);
                        Messenger.sendSuccessMessage($room, "Trade request received!", receiver.User);
                        Messenger.sendInfoMessage($room, `${requester.User} wants to trade their LVL ${requester.Pokemon.Level} ${requester.Pokemon.Name} with your pokemon!`, receiver.User);
                        Messenger.sendInfoMessage($room, "Type '/trade -accept' to accept the trade or type '/trade -decline' to decline the offer.", receiver.User);
                    } else {
                        if (!requesterHasNoOpenTrade) {
                            Messenger.sendErrorMessage($room, "You still have an open trade request.", requester.User);
                        }
                        if (!receiverHasNoOpenTrade) {
                            Messenger.sendErrorMessage($room, "Your trading partner still has an open trade request.", requester.User);
                        }
                    }
                } else {
                    throw new Error(`User ${param1} does not have a pokemon.`);
                }
            } catch(err) {
                Messenger.sendErrorMessage($room, err);
                Messenger.sendInfoMessage($room, "Use '/trade <username>' to request a trade with another trainer (<username>)", $user.username);
                Messenger.sendInfoMessage($room, "Use '/trade -accept' to accept the last trade you received and intiate trading.", $user.username);
                Messenger.sendInfoMessage($room, "Use '/trade -decline' to decline the last trade request.", $user.username);
            }
            break;
        }
        case this.config.CMDS.LEVEL: {
            const [targetUser] = args;
            try {
                const pt = $kv.get("PokemonTrainerDTO");
                this.tm.updateData(pt);
                if (!this.tm.PokemonTrainers.has(targetUser)) {
                    Messenger.sendErrorMessage($room, "USAGE: '/level <user>' where <user> should be the name of the user who's Pokemon you level want to see.", $user.username);
                    break;
                }

                const targetPokemon = this.tm.PokemonTrainers.get(targetUser)!.Pokemon;

                if (targetPokemon.Evolves !== 0) {
                    Messenger.sendInfoMessage($room, `${targetUser}'s ${targetPokemon.Name} is currently level ${targetPokemon.Level} and needs ${(targetPokemon.Evolves - targetPokemon.Level)} levels (or ${(targetPokemon.Evolves - targetPokemon.Level) * this.settings.level_pokemon} tokens) to evolve.`, $user.username);
                } else if (targetPokemon.UsesStone) {
                    Messenger.sendInfoMessage($room, `${targetUser}'s ${targetPokemon.Name} is currently level ${targetPokemon.Level} and needs a ${targetPokemon.Types[0].Stone} to evolve. ${targetUser} may type '/buystone' to purchase one!`, $user.username);
                } else if (targetPokemon.TradeEvolve) {
                    Messenger.sendInfoMessage($room, `${targetUser}'s ${targetPokemon.Name} is currently level ${targetPokemon.Level} and needs to be traded to evolve. Type '/trade' followed by a username to evolve them!`, $user.username);
                } else {
                    Messenger.sendInfoMessage($room, `${targetUser}'s ${targetPokemon.Name} is currently level ${targetPokemon.Level} This Pokemon does not evolve.`, $user.username);
                }
            } catch (err) {
                Messenger.sendErrorMessage($room, "Could not get the level of " + targetUser + "'s Pokemon. Please check the spelling or verify they have caught a Pokemon. " + err);
            }
            break;
        }
        case this.config.CMDS.ATTACK: {
            const [targetUser] = args;
            const pt = $kv.get("PokemonTrainerDTO");
            this.tm.updateData(pt);

            // Check if target user is in the room
            const targetInRoom = $room.users.some(([username]) => username === targetUser);
            if (!targetInRoom) {
                Messenger.sendErrorMessage($room, "That user is not currently in the room.", $user.username);
                break;
            }

            if (this.tm.PokemonTrainers.has(targetUser)) {
                if (this.tm.PokemonTrainers.has($user.username)) {
                    // Check if attacker's pokemon is fainted
                    if (this.tm.PokemonTrainers.get($user.username)!.Pokemon.Fainted) {
                        Messenger.sendErrorMessage($room, "Your Pokemon is fainted and cannot attack! You need to revive it first.", $user.username);
                        break;
                    }

                    // Check if target's pokemon is fainted 
                    if (this.tm.PokemonTrainers.get(targetUser)!.Pokemon.Fainted) {
                        Messenger.sendErrorMessage($room, "That Pokemon is already fainted! Leave it alone.", $user.username);
                        break;
                    }

                    if ($user.username === targetUser) {
                        Messenger.sendErrorMessage($room, "Your Pokemon can't attack itself now, can it? Do you have weird fetishes...?", $user.username);
                    } else if (targetUser === $room.owner && this.isEliteFourMember($user.username)) {
                        Messenger.sendErrorMessage($room, "Hey now.. you are a member of the Elite Four, you shouldn't fight against " + $room.owner, $user.username);
                    } else if (this.isEliteFourMember(targetUser) && this.isEliteFourMember($user.username)) {
                        Messenger.sendErrorMessage($room, "Hey now.. you are a member of the Elite Four, you shouldn't fight against " + targetUser, $user.username);
                    } else if (targetUser === $room.owner && !this.eliteFourDefeated()) {
                        Messenger.sendErrorMessage($room, "Wow, woah.. Calm down little fellow trainer. You can't just head to the final boss before beating the Elite Four!", $user.username);
                    } else {
                        const move = this.tm.PokemonTrainers.get($user.username)!.Pokemon.Move;
                        const currentHP = this.tm.PokemonTrainers.get(targetUser)!.Pokemon.Life;
                        const leftHP = this.tm.PokemonTrainers.get($user.username)!.Pokemon.Attack(this.tm.PokemonTrainers.get(targetUser)!.Pokemon);

                        if (this.settings.public_fights !== true) {
                            Messenger.sendSuccessMessage($room, "Your Pokemon now fights with your foe's Pokemon! Wish em luck!", $user.username);
                            Messenger.sendErrorMessage($room, `Your Pokemon is being attacked by ${$user.username}'s Pokemon! Wish em luck!`, targetUser);
                            Messenger.sendInfoMessage($room, `Dealt ${currentHP - leftHP} Points of Damage. Using ${move.Name}`, $user.username);
                            Messenger.sendInfoMessage($room, `Received ${currentHP - leftHP} Points of Damage. Using ${move.Name}`, targetUser);
                        }

                        if (leftHP <= 0) {
                            if (this.settings.public_fights === true) {
                                Messenger.sendSuccessMessage($room, `${$user.username} successfully defeated ${targetUser} (dealt ${currentHP - leftHP} damage, using ${move.Name})`);
                            } else {
                                Messenger.sendSuccessMessage($room, "Your Pokemon defeated your foe's Pokemon, congrats! Your pokemon levels up!", $user.username);
                                Messenger.sendErrorMessage($room, "Your Pokemon sadly lost all its life points in the battle. It is fainted. You can revive or release it. :(", targetUser);
                            }

                            this.tm.LevelUpPokemonOfUser($user.username, $room, 2);
                        } else {
                            if (this.settings.public_fights === true) {
                                Messenger.sendInfoMessage($room, `${$user.username} attacked ${targetUser} (dealt ${currentHP - leftHP} damage, using ${move.Name}, ${leftHP} HP left)`);
                            }

                            Messenger.sendErrorMessage($room, `Your Pokemon fought hard, but couldn't beat your foe. Tho it is hurt... It has ${leftHP} HP left.`, $user.username);
                            Messenger.sendSuccessMessage($room, `Your Pokemon successfully defended itself, but lost life points. It has ${leftHP} HP left. Better start fighting back (using '/attack ${$user.username}')`, targetUser);
                        }
                    }
                } else {
                    Messenger.sendErrorMessage($room, "You need a Pokemon yourself first, before you can go into the wild and randomly attack other players my friend.", $user.username);
                }
            } else {
                Messenger.sendErrorMessage($room, "This user does not have a pokemon to attack.", $user.username);
                Messenger.sendErrorMessage($room, "USAGE: '/attack <user>' where <user> should be the name of the user who you want to fight with.", $user.username);
            }
            break;
        }
        case this.config.CMDS.LISTTRAINERS: {
            const pt = $kv.get("PokemonTrainerDTO");
            this.tm.updateData(pt);
            this.tm.PokemonTrainers.forEach((trainer) => {
                Messenger.sendInfoMessage($room, trainer.User + " has " + trainer.Pokemon.Name + " on Level " + trainer.Pokemon.Level + " and it as " + trainer.Pokemon.Life + " HP left.", $user.username);
            });
            break;
        }
        case this.config.CMDS.LISTELITEFOUR: {
            this.listEliteFourMembers($user.username, $room);
            break;
        }
        case "debugpkm": {
            this.tm.PokemonTrainers.forEach((trainer) => Messenger.sendInfoMessage($room, customStringify(trainer), $user.username));
            break;
        }
    }
    $kv.set("PokemonTrainerDTO", this.tm.saveData());
}