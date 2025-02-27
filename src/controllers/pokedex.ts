//import { Settings } from "../api/$settings";
import { Pokemon, Pokemons } from "../models/pokemon/pokemon";
import { SettingsLocal } from "../definitions/settingslocal";
import { Rarity } from "../models/pokemon/rarity";

export default class PokeDex {
    public static GetPokemonIcon(pokemon: Pokemon): string {
        let s = pokemon.Id + "";
        while (s.length < 3) { s = "0" + s; }
        return ":pkmn" + s;
    }

    public static IdentifyPokemon(pokemon: Pokemon): string {
        return `PokeDex Entry #${pokemon.Id}: ${this.GetPokemonIcon(pokemon)} ${pokemon.Name} - ${pokemon.Rarity}, ${pokemon.Types[0].Name} - ${pokemon.Description}`;
    }

    public static GetEvolutionText(pokemon: Pokemon): string {
        if (!pokemon.TradeEvolve && !pokemon.UsesStone && pokemon.Evolves === 0) {
            return `${this.GetPokemonIcon(pokemon)} ${pokemon.Name} doesn't evolve anymore...`;
        }

        if (pokemon.TradeEvolve) {
            return `${this.GetPokemonIcon(pokemon)} ${pokemon.Name} evolves by trading with another user, using the command /trade {username}!`;
        }

        if (pokemon.UsesStone) {
            return `${this.GetPokemonIcon(pokemon)} ${pokemon.Name} evolves by using a ${pokemon.Types[0].Stone}. You can buy a stone in the pokeshop!`;
        }

        if (pokemon.Evolves > 0 && pokemon.Evolves > pokemon.Level) {
            return `${this.GetPokemonIcon(pokemon)} ${pokemon.Name} evolves by leveling up to ${pokemon.Evolves}.`;
        }

        return "Evolution is a weird thing, isn't it...";
    }

    public static GetPokemonStats(pokemon: Pokemon): string {
        return `${this.GetPokemonIcon(pokemon)} ${pokemon.Name} - Level: ${pokemon.Level} | HP: ${pokemon.Life} | ATK: ${pokemon.Atk} | DEF: ${pokemon.Def}`;
    }

    public static GetMoveStats(pokemon: Pokemon): string {
        return `${this.GetPokemonIcon(pokemon)} ${pokemon.Name}'s Move: ${pokemon.Move.Name} - Power: ${pokemon.Move.Power} | Type: ${pokemon.Move.Type.Name}`;
    }

    public static GetRandomPokemon(settings : SettingsLocal, tipAmount = 0, ): number {
        let rarity = Rarity.Common;
        if (tipAmount >= settings.mystic_tip) {
            rarity = Rarity.Mystic;
        } else if (tipAmount >= settings.legendary_tip) {
            rarity = Rarity.Legendary;
        } else if (tipAmount >= settings.rare_tip) {
            rarity = Rarity.Rare;
        } else if (tipAmount >= settings.uncommon_tip) {
            rarity = Rarity.Uncommon;
        }

        return this.GetRandomPokemonOfRarity(rarity);
    }

    public static GetRandomPokemonOfRarity(rarity: Rarity): number {
        let random = 0;

        while (random === 0 || Pokemons[random].Rarity !== rarity) {
            random = Math.ceil(Math.random() * Pokemons.length - 1);
        }

        return random;
    }
}
