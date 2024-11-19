import {$settings} from "../api/$settings";
import {$room} from "../api/$room";

import { Pokemons } from "../../old_src/src/models/pokemon/pokemon";
import Messenger from "./messenger";
import PokeDex from "./pokedex";

export default class Banner {

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
            $room.sendNotice(this.startMessage + pricesMessage + "Let the Battles Begin!", { toUsername: user} );
        } else {
            $room.sendNotice(this.startMessage + pricesMessage + "Let the Battles Begin!");
        }
    }

    public sendWelcomeAndBannerMessage(user?: string) {
        Messenger.sendWelcomeMessage(user);
        this.sendBanner(user);
    }
}
