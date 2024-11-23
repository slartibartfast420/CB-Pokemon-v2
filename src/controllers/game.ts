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
import { handleCommands } from "./handleCommands";
//import { throwDeprecation } from "process";

export default class Game {
    public settings: SettingsObj;
    public banner: Banner;
    public room: Room;
    private tm: TrainerManager;
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
        const pt = $kv.get("PokemonTrainers");
        this.tm.updateData(pt);
        if (!this.tm.PokemonTrainers.has($user.username)) {
            Messenger.sendWelcomeMessage($room, $user.username);
            this.banner.sendBanner($kv, $user.username);
        }
    }

    public addFreebiePokemonToFanclub($user: User, $kv : KV) {
        const settings = $kv.get("settings");
        const pt = $kv.get("PokemonTrainers");
        this.tm.updateData(pt);

        if (settings.fanclub_auto_catch && this.accessControl.hasClaim($user, "IN_FANCLUB") && !this.tm.PokemonTrainers.has($user.username)) {
            this.tm.AddPokemonToTrainer(PokeDex.GetRandomPokemon($kv), $user.username, 0);
            $kv.set("PokemonTrainers", this.tm.getData());
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

    public handleCommands($message: Message, $user: User, $kv : KV) {
        handleCommands($message, $user, $kv);
    }

    public addFreebiePokemon($user: User, $kv : KV) {
        const settings = $kv.get("settings");
        const pt = $kv.get("PokemonTrainers");
        this.tm.updateData(pt);
        if (settings.catch_pokemon === 0 && !this.tm.PokemonTrainers.has($user.username)) {
            this.tm.AddPokemonToTrainer(PokeDex.GetRandomPokemon($kv), $user.username, 0);
        }
        $kv.set("PokemonTrainers", this.tm.getData());
    }

    public addPokemonFlair($message: Message, $user: User, $kv : KV) {
        const pt = $kv.get("PokemonTrainers");
        this.tm.updateData(pt);
        let msg = $message.orig;
        if (this.tm.PokemonTrainers.has($user.username) && !$message.isSpam) {
            const pokemon = this.tm.PokemonTrainers.get($user.username)!.Pokemon;
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
        const pt = $kv.get("PokemonTrainers");
        this.tm.updateData(pt);
        const room =$kv.get("room");

        if (!this.tm.PokemonTrainers.has($user.username) && settings.catch_pokemon <= $tip.tokens) {
            this.tm.AddPokemonToTrainer(PokeDex.GetRandomPokemon($kv, $tip.tokens), $user.username, $tip.tokens);
            const pkmn = this.tm.PokemonTrainers.get($user.username)!.Pokemon;
            Messenger.sendInfoMessage(room, `You successfully caught a ${PokeDex.GetPokemonIcon(pkmn)} ${pkmn.Name}, congrats! Treat it well, fellow trainer.`);
        } else if (this.tm.PokemonTrainers.has($user.username) && this.tm.PokemonTrainers.get($user.username)!.BuyStoneConfirmation === true) {
            if ($tip.tokens === settings.stone_price) {
                Messenger.sendInfoMessage(room, "You just purchased a " + this.tm.PokemonTrainers.get($user.username)!.Pokemon.Types[0].Stone + "!", $user.username);
                this.tm.PokemonTrainers.get($user.username)!.BuyStoneWarning = false;
                this.tm.PokemonTrainers.get($user.username)!.BuyStoneConfirmation = false;
                this.tm.EvolvePokemonOfUser($user.username);
            }
        }
        $kv.set("PokemonTrainers", this.tm.getData());
    }

    public levelUp($user: User, $tip: Tip, $kv : KV) {
        const pt = $kv.get("PokemonTrainers");
        this.tm.updateData(pt);
        if (this.tm.PokemonTrainers.has($user.username)) {
            this.tm.PokemonTrainers.get($user.username)!.Tipped += $tip.tokens;
            this.tm.LevelUpPokemonOfUser($user.username, Math.floor($tip.tokens / this.settings.level_pokemon));
        }
        $kv.set("PokemonTrainers", this.tm.getData());
    }
    public setSettings($kv: KV, $settings : Settings){
        //const $settings = $kv.get("Settings");
        Object.assign(this.settings, $settings);
        //$kv.set("Settings", this.settings);
        this.banner = new Banner();        
        this.setAccessControl();
    }

    public refresh($kv: KV, $settings : Settings, $room : Room){
        this.setSettings($kv, $settings);
        this.tm = new TrainerManager($room);
        this.setupEliteFour($kv);
    }

    private setAccessControl(){
        if (this.settings.mod_allow_broadcaster_cmd) {
            this.accessControl = new AccessControl(this.settings.mod_allow_broadcaster_cmd, this.config.Dev, this.config.FairyHelper);
        } else {
            this.accessControl = new AccessControl(this.settings.mod_allow_broadcaster_cmd, "", []);
        }
    }

    public setBroadcaster($kv : KV, $settings : Settings, $room : Room){
        this.initBroadcaster($room,$kv);
        Messenger.sendSuccessMessage($room, "Pokemon Collector v" + this.config.Version + " started.");
        Messenger.sendBroadcasterNotice($room, "This Pokemon Bot is in beta. It can not become better if I do not know what is wrong. Please comment on the bot's page any errors or questions. Make sure to check out the original Version (PokeDex) of asudem! Thank you.");
    }
    private setupEliteFour($kv){
        const pt = $kv.get("PokemonTrainers");
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
        $kv.set("PokemonTrainers", this.tm.getData());
    }
    private initBroadcaster($room: Room, $kv : KV) {
        this.room=$room;
        let pt = $kv.get("PokemonTrainers");
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
        
        $kv.set("PokemonTrainers", this.tm.getData());
    }
    //#endregion

    private eliteFourDefeated(): boolean {
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

    private listEliteFourMembers(user: string ) {
        if (this.settings.elite_four_1 !== undefined && this.settings.elite_four_1.length > 0 && this.tm.PokemonTrainers.has(this.settings.elite_four_1)) {
            const trainer = this.tm.PokemonTrainers.get(this.settings.elite_four_1)!;
            Messenger.sendInfoMessage(this.room, trainer.User + " has " + trainer.Pokemon.Name + " on Level " + trainer.Pokemon.Level + " and it as " + trainer.Pokemon.Life + " HP left.", user);
        }
        if (this.settings.elite_four_2 !== undefined && this.settings.elite_four_2.length > 0 && this.tm.PokemonTrainers.has(this.settings.elite_four_2)) {
            const trainer = this.tm.PokemonTrainers.get(this.settings.elite_four_2)!;
            Messenger.sendInfoMessage(this.room, trainer.User + " has " + trainer.Pokemon.Name + " on Level " + trainer.Pokemon.Level + " and it as " + trainer.Pokemon.Life + " HP left.", user);
        }
        if (this.settings.elite_four_3 !== undefined && this.settings.elite_four_3.length > 0 && this.tm.PokemonTrainers.has(this.settings.elite_four_3)) {
            const trainer = this.tm.PokemonTrainers.get(this.settings.elite_four_3)!;
            Messenger.sendInfoMessage(this.room, trainer.User + " has " + trainer.Pokemon.Name + " on Level " + trainer.Pokemon.Level + " and it as " + trainer.Pokemon.Life + " HP left.", user);
        }
        if (this.settings.elite_four_4 !== undefined && this.settings.elite_four_4.length > 0 && this.tm.PokemonTrainers.has(this.settings.elite_four_4)) {
            const trainer = this.tm.PokemonTrainers.get(this.settings.elite_four_4)!;
            Messenger.sendInfoMessage(this.room, trainer.User + " has " + trainer.Pokemon.Name + " on Level " + trainer.Pokemon.Level + " and it as " + trainer.Pokemon.Life + " HP left.", user);
        }
    }
}
