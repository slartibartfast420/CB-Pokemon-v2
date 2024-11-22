import { Pokemons } from "../models/pokemon/pokemon";
import Messenger from "./messenger";
import PokeDex from "./pokedex";
import { KV } from "../api/$kv";

export default class Banner {
    private startMessage =  `Pokemon - Gotta Catch 'Em All (with Tokens :P)!
                            '/level <username>' to see a Pokemon's level.
                            '/identify <username>' uses the Pokedex.
                            '/attack <username>' to attack your foe!
                            '/release' to remove your Pokemon :(...
                            Prices:\n`;

    public sendBanner($kv : KV, user?: string): void {
        const settings = $kv.get("Settings");
        const room = $kv.get("room");
        const tempPrices = [settings.catch_pokemon, settings.uncommon_tip, settings.rare_tip, settings.legendary_tip, settings.mystic_tip];
        let pricesMessage = "";

        for (const price of tempPrices) {
            const pkmn = Pokemons[PokeDex.GetRandomPokemon($kv, price)];
            pricesMessage += `:pkmnball Catch ${pkmn.Rariry.toString()} for ${price} Tokens! ${PokeDex.GetPokemonIcon(pkmn)}\n`;
        }

        if (user !== undefined){
            if (room.sendNotice){
                room.sendNotice(this.startMessage + pricesMessage + "Let the Battles Begin!", { toUsername: user} );
            } else {
                console.log(this.startMessage + pricesMessage + "Let the Battles Begin!")
            }
            
        } else {
            if (room.sendNotice){
                room.sendNotice(this.startMessage + pricesMessage + "Let the Battles Begin!");
            } else{
                console.log(this.startMessage + pricesMessage + "Let the Battles Begin!")
            }
        }
    }

    public sendWelcomeAndBannerMessage($kv :KV, user?: string ) {
        const room = $kv.get("room");
        Messenger.sendWelcomeMessage(room, user);
        this.sendBanner($kv, user);
    }
}
