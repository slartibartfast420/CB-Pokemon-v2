import {$settings} from "../api/$settings";
import {$room, Room} from "../api/$room";

import { Pokemons } from "../models/pokemon/pokemon";
import Messenger from "./messenger";
import PokeDex from "./pokedex";

export default class Banner {
    private room : Room;
    
    constructor(public $room: Room) {
           this.room = $room;
        }
    
    private startMessage =  `Pokemon - Gotta Catch 'Em All (with Tokens :P)!
                            '/level <username>' to see a Pokemon's level.
                            '/identify <username>' uses the Pokedex.
                            '/attack <username>' to attack your foe!
                            '/release' to remove your Pokemon :(...
                            Prices:\n`;

    public sendBanner(user?: string): void {
        const tempPrices = [$settings.catch_pokemon, $settings.uncommon_tip, $settings.rare_tip, $settings.legendary_tip, $settings.mystic_tip];
        let pricesMessage = "";

        for (const price of tempPrices) {
            const pkmn = Pokemons[PokeDex.GetRandomPokemon(parseInt(price, 10))];
            pricesMessage += `:pkmnball Catch ${pkmn.Rariry.toString()} for ${price} Tokens! ${PokeDex.GetPokemonIcon(pkmn)}\n`;
        }

        if (user !== undefined){
            this.room.sendNotice(this.startMessage + pricesMessage + "Let the Battles Begin!", { toUsername: user} );
        } else {
            this.room.sendNotice(this.startMessage + pricesMessage + "Let the Battles Begin!");
        }
    }

    public sendWelcomeAndBannerMessage(user?: string) {
        Messenger.sendWelcomeMessage(this.room, user);
        this.sendBanner(user);
    }
}
