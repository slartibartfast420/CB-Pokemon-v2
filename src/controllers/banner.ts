import {Room} from "../api/$room";
import { Pokemons } from "../models/pokemon/pokemon";
import Messenger from "./messenger";
import PokeDex from "./pokedex";
import { SettingsObj } from "../misc/settingsobj";

export default class Banner {
    private room : Room;
    private settings : SettingsObj;
    private pokeDex : PokeDex;

    constructor(public $room: Room, settingsObj: SettingsObj, pokeDex : PokeDex) {
           this.room = $room;
           this.settings = settingsObj;
           this.pokeDex = pokeDex;
        }
    
    private startMessage =  `Pokemon - Gotta Catch 'Em All (with Tokens :P)!
                            '/level <username>' to see a Pokemon's level.
                            '/identify <username>' uses the Pokedex.
                            '/attack <username>' to attack your foe!
                            '/release' to remove your Pokemon :(...
                            Prices:\n`;

    public sendBanner(user?: string): void {
        const tempPrices = [this.settings.catch_pokemon, this.settings.uncommon_tip, this.settings.rare_tip, this.settings.legendary_tip, this.settings.mystic_tip];
        let pricesMessage = "";

        for (const price of tempPrices) {
            const pkmn = Pokemons[this.pokeDex.GetRandomPokemon(price)];
            pricesMessage += `:pkmnball Catch ${pkmn.Rariry.toString()} for ${price} Tokens! ${this.pokeDex.GetPokemonIcon(pkmn)}\n`;
        }

        if (user !== undefined){
            if (this.room.sendNotice){
                this.room.sendNotice(this.startMessage + pricesMessage + "Let the Battles Begin!", { toUsername: user} );
            } else {
                console.log(this.startMessage + pricesMessage + "Let the Battles Begin!")
            }
            
        } else {
            if (this.room.sendNotice){
                this.room.sendNotice(this.startMessage + pricesMessage + "Let the Battles Begin!");
            } else{
                console.log(this.startMessage + pricesMessage + "Let the Battles Begin!")
            }
        }
    }

    public sendWelcomeAndBannerMessage(user?: string) {
        Messenger.sendWelcomeMessage(this.room, user);
        this.sendBanner(user);
    }
}
