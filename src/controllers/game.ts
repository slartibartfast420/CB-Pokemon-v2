import {User} from "../api/$user";
import {Message} from "../api/$message";
import {Tip} from "../api/$tip";
import {SettingsObj} from "../misc/settingsobj";
import {Room} from "../api/$room";
import {KV} from "../api/$kv";
import AccessControl from "./accesscontrol";
import Banner from "./banner";
import Messenger from "./messenger";
import PokeDex from "./pokedex";
import TrainerManager from "./trainermanager";
import { Settings } from "http2";
import PokemonTrainer from "../models/pokemon-trainer";
import { userCommands } from "./userCommands";
import { Pokemons } from "../models/pokemon/pokemon";
//import { throwDeprecation } from "process";

export default class Game {
    public settings: SettingsObj;
    public banner: Banner = new Banner();
    public tm: TrainerManager = new TrainerManager();
    public accessControl: AccessControl;

    constructor(public config: App) {
        this.settings = new SettingsObj();
    }
    public sendHelp(args, $user: User, $settings : Settings, $room : Room){
        try {
            if (this.accessControl.hasPermission($user, "SUPERUSER")) {
                const [targetUser] = args;
                let user: string | undefined;
                if (targetUser !== undefined && targetUser !== "") {
                    user = targetUser;
                } else {
                    throw new Error("Missing arguments");
                }
                this.banner.sendWelcomeAndBannerMessage($settings, $room, user);
            } else {
                Messenger.sendErrorMessage($room, "Pokemon: You do not have permission to use this command.", $user.username);
            }
        } catch(err){
            Messenger.sendErrorMessage($room, "USAGE: '/sendHelp <user> where <user> should be the name of the user you want to send help to.", $user.username);
        }
    }
    public evolve(args, $user : User, $room : Room, $kv : KV){
        try {
            if (this.accessControl.hasPermission($user, "SUPERUSER")) {
                const pt = $kv.get("PokemonTrainerDTO");
                this.tm.updateData(pt);
                const [targetUser] = args;
                if(targetUser === undefined){
                    throw new Error("Missing arguments");
                }
                this.tm.EvolvePokemonOfUser(targetUser,$room);
                $kv.set("PokemonTrainerDTO", this.tm.saveData());
                Messenger.sendSuccessMessage($room,`${targetUser}'s pokemon has evolved.`)
            } else {
                Messenger.sendErrorMessage($room, "Pokemon: You do not have permission to use this command.", $user.username);
            }
        } catch(err){
            Messenger.sendErrorMessage($room, "USAGE: '/evolve <user> where <user> should be the name of the user you want to evolve.", $user.username);
        }
    }
    public change(args, $user : User, $room : Room, $kv : KV){
        try{
            if (this.accessControl.hasPermission($user, "SUPERUSER")) {
                const pt = $kv.get("PokemonTrainerDTO");
                this.tm.updateData(pt);
                const [targetUser] = args;
                if(targetUser === undefined){
                    throw new Error("Missing arguments");
                }
                this.tm.ChangePokemonOfUser(targetUser, $room, $kv);
                $kv.set("PokemonTrainerDTO", this.tm.saveData());
                //Messenger.sendSuccessMessage($room,`${targetUser}'s pokemon has been changed.`)
            } else {
                Messenger.sendErrorMessage($room, "Pokemon: You do not have permission to use this command.", $user.username);
            }
        } catch(err){
            Messenger.sendErrorMessage($room, "USAGE: '/change <user> where <user> should be the name of the user you want to change.", $user.username);
        }
    }
    public remove(args, $user : User, $room : Room, $kv : KV){
        try {
            if (this.accessControl.hasPermission($user, "SUPERUSER")) {
                const pt = $kv.get("PokemonTrainerDTO");
                this.tm.updateData(pt);
                const [targetUser] = args;
                this.tm.RemovePokemonFromTrainer(targetUser);
                $kv.set("PokemonTrainerDTO", this.tm.saveData());
                const reply = `${targetUser}'s pokemon has been released.`
                Messenger.sendSuccessMessage($room,reply);
            } else {
                Messenger.sendErrorMessage($room, "Pokemon: You do not have permission to use this command.", $user.username);
            }
        } catch(err){
            Messenger.sendErrorMessage($room, "USAGE: '/remove <user> where <user> should be the name of the user you want to remove.", $user.username);
        }
    }
    public addLevels(args, $user : User, $room : Room, $kv){
        try{
            if (this.accessControl.hasPermission($user, "SUPERUSER")) {
                const pt = $kv.get("PokemonTrainerDTO");
                this.tm.updateData(pt);
                const [targetUser, levelsString] = args;
                const levels = parseInt(levelsString, 10);
                if(targetUser === undefined || levels=== undefined ){
                    throw new Error("Missing arguments");
                }
                if (this.tm.PokemonTrainers.has(targetUser) && levels > 0) {
                    this.tm.PokemonTrainers.get(targetUser)!.Pokemon.Level += levels;
                    if ($user.username !== this.config.Dev && this.tm.PokemonTrainers.get(targetUser)!.Pokemon.Level > 100) {
                        this.tm.PokemonTrainers.get(targetUser)!.Pokemon.Level = 100;
                    }
                    const pkmn = this.tm.PokemonTrainers.get(targetUser)!.Pokemon;
                    pkmn.updateStats();
                    $kv.set("PokemonTrainerDTO", this.tm.saveData());
                    const reply = `${targetUser}'s ${PokeDex.GetPokemonIcon(pkmn)} ${pkmn.Name} has been leveled up to ${pkmn.Level}. `
                    Messenger.sendSuccessMessage($room,reply)
                }
            } else {
                Messenger.sendErrorMessage($room, "Pokemon: You do not have permission to use this command.", $user.username);
            }
        } catch(err){
            Messenger.sendErrorMessage($room, "USAGE: '/levelup <user> <levels>' where <user> should be the name of the user you want to give <levels> levels to.", $user.username);
        }
    }
    public addUser(args, $user : User, $room : Room, $kv : KV){
        try {
            if (this.accessControl.hasPermission($user, "SUPERUSER")) {
                const pt = $kv.get("PokemonTrainerDTO");
                this.tm.updateData(pt);
                const [targetUser, pokedexNumberString] = args;
                const pokedexNumber = parseInt(pokedexNumberString, 10);
                if(targetUser === undefined || pokedexNumber=== undefined ){
                    throw new Error("Missing arguments");
                }
                if (pokedexNumber <= Pokemons.length && pokedexNumber >= 0) {
                    this.tm.AddPokemonToTrainer(pokedexNumber, targetUser, 0);
                    const pkmn = this.tm.PokemonTrainers.get(targetUser)!.Pokemon;
                    const reply = `${PokeDex.GetPokemonIcon(pkmn)} ${pkmn.Name} was given to ${targetUser}`;
                    Messenger.sendSuccessMessage($room,reply)
                    $kv.set("PokemonTrainerDTO", this.tm.saveData());
                }
            } else {
                Messenger.sendErrorMessage($room, "Pokemon: You do not have permission to use this command.", $user.username);
            } 
        } catch (err) {
            Messenger.sendErrorMessage($room, "USAGE: '/adduser <user> <pokedex id>' where <user> should be the name of the user you want to give <pokedex id> to.", $user.username);
        }
    }
    public toggleSupport($user, $room, $kv){
        if (this.accessControl.hasPermission($user, "MOD")) {
            let support_mode = $kv.get("SupportMode", false)
            support_mode = !support_mode;
            $kv.set("SupportMode", support_mode)
            const reply = "Support mode for Pokedex bot Ver." + this.config.Version + " is now " + (support_mode ? "ACTIVATED" : "DEACTIVATED") + "!";
            Messenger.sendSuccessMessage($room,reply)
        } else {
            Messenger.sendErrorMessage($room, "Pokemon: You do not have permission to use this command.", $user.username);
        }
    }

    //#region OnEnter Functions
    public sendDevInfo($user: User, $room: Room) {
        if (this.accessControl.hasPermission($user, "SUPERUSER")) {
            Messenger.sendSuccessMessage($room, "Pokedex v" + this.config.Version + " Support Mode: ON!", this.config.Dev);
        } else {
            Messenger.sendErrorMessage($room, "Pokedex v" + this.config.Version + " Support Mode: OFF!", this.config.Dev);
        }
    }

    public sendWelcomeMessage($user: User, $room: Room, $kv : KV, $settings: Settings) {
        const pto = $kv.get("PokemonTrainerDTO");
        this.tm.updateData(pto);
        if (!this.tm.PokemonTrainers.has($user.username)) {
            Messenger.sendWelcomeMessage($room, $user.username);
            this.banner.sendBanner($settings, $room, $user.username);
        }
    }

    public addFreebiePokemonToFanclub($user: User, $kv : KV, $settings : Settings) {
        const pto = $kv.get("PokemonTrainerDTO");
        this.tm.updateData(pto);

        if (this.settings.fanclub_auto_catch && this.accessControl.hasClaim($user, "IN_FANCLUB") && !this.tm.PokemonTrainers.has($user.username)) {
            this.tm.AddPokemonToTrainer(PokeDex.GetRandomPokemon($settings), $user.username, 0);
            $kv.set("PokemonTrainerDTO", this.tm.saveData());
        }
    }
    //#endregion

    //#region OnMessage Functions
    public stripEmoticon($message: Message) {
        if ($message.orig.trim().startsWith(":") && $message.orig.indexOf("/") > -1) {
            const splitmsg = $message.orig.split(" ");
            if (splitmsg[1].indexOf("/") === 0) {
                if($message.setBody){
                    $message.setBody($message.orig.trim().substring($message.orig.indexOf("/"), $message.orig.length).trim());
                } else {
                    console.log($message.orig.trim().substring($message.orig.indexOf("/"), $message.orig.length).trim())
                }
            }
        }
    }

    public userCommands = userCommands;

    public addFreebiePokemon($user: User, $kv : KV, $settings : Settings) {
        const pt = $kv.get("PokemonTrainerDTO");
        this.tm.updateData(pt);
        if (this.settings.catch_pokemon === 0 && !this.tm.PokemonTrainers.has($user.username)) {
            this.tm.AddPokemonToTrainer(PokeDex.GetRandomPokemon($settings), $user.username, 0);
        }
        $kv.set("PokemonTrainerDTO", this.tm.saveData());
    }

    public addPokemonFlair($message: Message, $user: User, $kv : KV) {
        const pt = $kv.get("PokemonTrainerDTO");
        this.tm.updateData(pt);
        let msg = $message.orig;
        if (this.tm.PokemonTrainers.has($user.username) && !$message.isSpam) {
            const pokemon = this.tm.PokemonTrainers.get($user.username)!.Pokemon;
            msg = PokeDex.GetPokemonIcon(pokemon) + " " + msg;
            if (this.settings.colorize_chat) {
                $message.setColor(pokemon.Types[0].FontColor);
                $message.setBgColor(pokemon.Types[0].Color);
            }
        }
        if ($user.username === this.config.Dev && !$message.isSpam) {
            msg = ":pkmnoak " + msg;
        }
        $message.setBody(msg);
    }

    //#endregion

    //#region OnTip Functions
    public purchaseObjects($user: User, $room : Room, $tip: Tip, $kv : KV, $settings : Settings) {
        const pt = $kv.get("PokemonTrainerDTO");
        this.tm.updateData(pt);

        if (!this.tm.PokemonTrainers.has($user.username) && this.settings.catch_pokemon <= $tip.tokens) {
            this.tm.AddPokemonToTrainer(PokeDex.GetRandomPokemon($settings, $tip.tokens), $user.username, $tip.tokens);
            const pkmn = this.tm.PokemonTrainers.get($user.username)!.Pokemon;
            Messenger.sendInfoMessage($room, `You successfully caught a ${PokeDex.GetPokemonIcon(pkmn)} ${pkmn.Name}, congrats! Treat it well, fellow trainer.`);
        } else if (this.tm.PokemonTrainers.has($user.username) && this.tm.PokemonTrainers.get($user.username)!.BuyStoneConfirmation === true) {
            if ($tip.tokens === this.settings.stone_price) {
                Messenger.sendInfoMessage($room, "You just purchased a " + this.tm.PokemonTrainers.get($user.username)!.Pokemon.Types[0].Stone + "!", $user.username);
                this.tm.PokemonTrainers.get($user.username)!.BuyStoneWarning = false;
                this.tm.PokemonTrainers.get($user.username)!.BuyStoneConfirmation = false;
                this.tm.EvolvePokemonOfUser($user.username,$room);
            }
        }
        $kv.set("PokemonTrainerDTO", this.tm.saveData());
    }

    public levelUp($user: User, $room : Room, $tip: Tip, $kv : KV) {
        const pt = $kv.get("PokemonTrainerDTO");
        this.tm.updateData(pt);
        if (this.tm.PokemonTrainers.has($user.username)) {
            this.tm.PokemonTrainers.get($user.username)!.Tipped += $tip.tokens;
            this.tm.LevelUpPokemonOfUser($user.username, $room, Math.floor($tip.tokens / this.settings.level_pokemon));
        }
        $kv.set("PokemonTrainerDTO", this.tm.saveData());
    }
    public setSettings($kv: KV, $settings : Settings){
        Object.assign(this.settings, $settings);
    }

    public refresh($room: Room, $kv: KV, $settings : Settings){
        this.setSettings($kv, $settings);
        this.setAccessControl();
        this.setupEliteFour($kv);
        this.initBroadcaster($room,$kv);
    }

    public setAccessControl(){
        if (this.settings.mod_allow_broadcaster_cmd) {
            this.accessControl = new AccessControl(this.settings.mod_allow_broadcaster_cmd, this.config.Dev, this.config.FairyHelper);
        } else {
            this.accessControl = new AccessControl(this.settings.mod_allow_broadcaster_cmd, "", []);
        }
    }

    public setBroadcaster($kv : KV, $settings : Settings, $room : Room){
        //this.initBroadcaster($room,$kv);
        Messenger.sendSuccessMessage($room, "Pokemon Collector v" + this.config.Version + " started.");
        Messenger.sendBroadcasterNotice($room, "This Pokemon Bot is in beta. It can not become better if I do not know what is wrong. Please comment on the bot's page any errors or questions. Make sure to check out the original Version (PokeDex) of asudem! Thank you.");
    }
    public setupEliteFour($kv){
        const pt = $kv.get("PokemonTrainerDTO");
        this.tm.updateData(pt);
        if (this.settings.elite_four_1 !== undefined && this.settings.elite_four_1.length > 0 && this.settings.elite_four_1_pokemon !== 0) {
            this.tm.AddPokemonToTrainer(this.settings.elite_four_1_pokemon, this.settings.elite_four_1, 0);
            this.tm.PokemonTrainers.get(this.settings.elite_four_1)!.Pokemon.Level = 100;
            this.tm.PokemonTrainers.get(this.settings.elite_four_1)!.Pokemon.updateStats();
        }
        if (this.settings.elite_four_2 !== undefined && this.settings.elite_four_2.length > 0 && this.settings.elite_four_2_pokemon !== 0) {
            this.tm.AddPokemonToTrainer(this.settings.elite_four_2_pokemon, this.settings.elite_four_2, 0);
            this.tm.PokemonTrainers.get(this.settings.elite_four_2)!.Pokemon.Level = 100;
            this.tm.PokemonTrainers.get(this.settings.elite_four_2)!.Pokemon.updateStats();
        }
        if (this.settings.elite_four_3 !== undefined && this.settings.elite_four_3.length > 0 && this.settings.elite_four_3_pokemon !== 0) {
            this.tm.AddPokemonToTrainer(this.settings.elite_four_3_pokemon, this.settings.elite_four_3, 0);
            this.tm.PokemonTrainers.get(this.settings.elite_four_3)!.Pokemon.Level = 100;
            this.tm.PokemonTrainers.get(this.settings.elite_four_3)!.Pokemon.updateStats();
        }
        if (this.settings.elite_four_4 !== undefined && this.settings.elite_four_4.length > 0 && this.settings.elite_four_4_pokemon !== 0) {
            this.tm.AddPokemonToTrainer(this.settings.elite_four_4_pokemon, this.settings.elite_four_4, 0);
            this.tm.PokemonTrainers.get(this.settings.elite_four_4)!.Pokemon.Level = 100;
            this.tm.PokemonTrainers.get(this.settings.elite_four_4)!.Pokemon.updateStats();
        }
        $kv.set("PokemonTrainerDTO", this.tm.saveData());
    }
    public initBroadcaster($room: Room, $kv : KV) {
        let pt = $kv.get("PokemonTrainerDTO");
        if(pt.length == 0){
            pt = new Map<string, PokemonTrainer>();
        }
        this.tm.updateData(pt);
        if (this.settings.broadcaster_pokemon !== 0) {
            this.tm.AddPokemonToTrainer(this.settings.broadcaster_pokemon, $room.owner, 0);
            if (this.tm.PokemonTrainers.has($room.owner)) {
                this.tm.PokemonTrainers.get($room.owner)!.Pokemon.Level = 200;
                this.tm.PokemonTrainers.get($room.owner)!.Pokemon.updateStats();
            }
        }
        
        $kv.set("PokemonTrainerDTO", this.tm.saveData());
    }
    //#endregion

    public eliteFourDefeated(): boolean {
        let defeated = true;

        if (this.settings.elite_four_1.length > 0 && this.tm.PokemonTrainers.has(this.settings.elite_four_1)) {
            defeated = false;
        }
        if (this.settings.elite_four_2.length > 0 && this.tm.PokemonTrainers.has(this.settings.elite_four_2)) {
            defeated = false;
        }
        if (this.settings.elite_four_3.length > 0 && this.tm.PokemonTrainers.has(this.settings.elite_four_3)) {
            defeated = false;
        }
        if (this.settings.elite_four_4.length > 0 && this.tm.PokemonTrainers.has(this.settings.elite_four_4)) {
            defeated = false;
        }

        return defeated;
    }

    public isEliteFourMember(user: string): boolean {
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

    public listEliteFourMembers(user: string , $room : Room) {
        if (this.settings.elite_four_1 !== undefined && this.settings.elite_four_1.length > 0 && this.tm.PokemonTrainers.has(this.settings.elite_four_1)) {
            const trainer = this.tm.PokemonTrainers.get(this.settings.elite_four_1)!;
            Messenger.sendInfoMessage($room, trainer.User + " has " + trainer.Pokemon.Name + " on Level " + trainer.Pokemon.Level + " and it as " + trainer.Pokemon.Life + " HP left.", user);
        }
        if (this.settings.elite_four_2 !== undefined && this.settings.elite_four_2.length > 0 && this.tm.PokemonTrainers.has(this.settings.elite_four_2)) {
            const trainer = this.tm.PokemonTrainers.get(this.settings.elite_four_2)!;
            Messenger.sendInfoMessage($room, trainer.User + " has " + trainer.Pokemon.Name + " on Level " + trainer.Pokemon.Level + " and it as " + trainer.Pokemon.Life + " HP left.", user);
        }
        if (this.settings.elite_four_3 !== undefined && this.settings.elite_four_3.length > 0 && this.tm.PokemonTrainers.has(this.settings.elite_four_3)) {
            const trainer = this.tm.PokemonTrainers.get(this.settings.elite_four_3)!;
            Messenger.sendInfoMessage($room, trainer.User + " has " + trainer.Pokemon.Name + " on Level " + trainer.Pokemon.Level + " and it as " + trainer.Pokemon.Life + " HP left.", user);
        }
        if (this.settings.elite_four_4 !== undefined && this.settings.elite_four_4.length > 0 && this.tm.PokemonTrainers.has(this.settings.elite_four_4)) {
            const trainer = this.tm.PokemonTrainers.get(this.settings.elite_four_4)!;
            Messenger.sendInfoMessage($room, trainer.User + " has " + trainer.Pokemon.Name + " on Level " + trainer.Pokemon.Level + " and it as " + trainer.Pokemon.Life + " HP left.", user);
        }
    }
}
