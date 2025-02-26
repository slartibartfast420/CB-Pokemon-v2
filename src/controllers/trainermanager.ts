import {Room} from "../api/$room";
import { SettingsLocal } from "../definitions/settingslocal";
//import { KV } from "../api/$kv";
import PokemonTrainer from "../models/pokemon-trainer";
import { Pokemon, Pokemons } from "../models/pokemon/pokemon";
import PokemonDTO from "../models/pokemon/pokemonDTO";
import PokemonTrainerDTO from "../models/trainerDTO";
import Messenger from "./messenger";
import PokeDex from "./pokedex";

export default class TrainerManager {
    public PokemonTrainers: Map<string, PokemonTrainer> = new Map<string, PokemonTrainer>();

    public updateData(pto : PokemonTrainerDTO[]){
        this.ImportFromDTO(pto);
    }
    public saveData() : PokemonTrainerDTO[]{
        return this.ExportToDTO();
    }

    public AddPokemonToTrainer(pokeDexID: number, user: string, tipped = 0) {
        const origin = Pokemons[pokeDexID];
        if (origin !== undefined) {
            const pokemon = origin.Clone();
            this.PokemonTrainers.set(user, new PokemonTrainer(user, pokemon, tipped));
        }
    }

    public RemovePokemonFromTrainer(user: string) {
        this.PokemonTrainers.delete(user);
    }

    public LevelUpPokemonOfUser(user: string, $room, numberOfLevels: number) {
        if (this.PokemonTrainers.has(user)) {
            this.PokemonTrainers.get(user)!.Pokemon.LvlUp(numberOfLevels);
            while (this.PokemonTrainers.get(user)!.Pokemon.Evolves !== 0 && this.PokemonTrainers.get(user)!.Pokemon.Level >= this.PokemonTrainers.get(user)!.Pokemon.Evolves) {
                this.EvolvePokemonOfUser(user,$room);
            }
        }
    }

    public EvolvePokemonOfUser(user: string, $room : Room) {
        if (this.PokemonTrainers.has(user)) {
            const oldPokemon = this.PokemonTrainers.get(user)!.Pokemon;
            const newPokemon = this.EvolvePokemon(oldPokemon);
            this.PokemonTrainers.get(user)!.Pokemon = newPokemon;

            Messenger.sendInfoMessage($room,`Your ${PokeDex.GetPokemonIcon(oldPokemon)} ${oldPokemon.Name} has evolved into a ${PokeDex.GetPokemonIcon(newPokemon)} ${newPokemon.Name}!`);
            Messenger.sendInfoMessage($room,PokeDex.GetEvolutionText(newPokemon));
        }
    }

    public EvolvePokemon(pokemon: Pokemon): Pokemon {
        if (pokemon.Evolves === 0) {
            return pokemon;
        }
        const newPokemon = Pokemons[pokemon.Id + 1].Clone();
        if (newPokemon.Level < pokemon.Level) {
            newPokemon.Level = pokemon.Level;
        }
        newPokemon.Petname = pokemon.Petname;
        newPokemon.updateStats();
        return newPokemon;
    }

    public TradePokemonWithUser(user1: string, user2: string, $room) {
        if (!this.PokemonTrainers.has(user1) || !this.PokemonTrainers.has(user2)) {
            return;
        }

        const pokemon1 = this.PokemonTrainers.get(user1)!.Pokemon;
        const pokemon2 = this.PokemonTrainers.get(user2)!.Pokemon;

        if (pokemon1.TradeEvolve) {
            const newPokemon = this.EvolvePokemon(pokemon1);
            this.PokemonTrainers.get(user2)!.Pokemon = newPokemon;
            Messenger.sendInfoMessage($room, `Your ${PokeDex.GetPokemonIcon(pokemon1)} ${pokemon1.Name} has evolved into a ${PokeDex.GetPokemonIcon(newPokemon)} ${newPokemon.Name}!`, user2);
            Messenger.sendInfoMessage($room, PokeDex.GetEvolutionText(newPokemon), user2);
        } else {
            this.PokemonTrainers.get(user2)!.Pokemon = pokemon1;
        }

        if (pokemon2.TradeEvolve) {
            const newPokemon = this.EvolvePokemon(pokemon2);
            this.PokemonTrainers.get(user1)!.Pokemon = newPokemon;
            Messenger.sendInfoMessage($room, `Your ${PokeDex.GetPokemonIcon(pokemon2)} ${pokemon2.Name} has evolved into a ${PokeDex.GetPokemonIcon(newPokemon)} ${newPokemon.Name}!`, user1);
            Messenger.sendInfoMessage($room, PokeDex.GetEvolutionText(newPokemon), user1);
        } else {
            this.PokemonTrainers.get(user1)!.Pokemon = pokemon2;
        }
    }

    public ChangePokemonOfUser(user: string, $room : Room, $settings : SettingsLocal) {
        if (this.PokemonTrainers.has(user)) {
            const oldPkmn = this.PokemonTrainers.get(user)!.Pokemon;
            const newId = PokeDex.GetRandomPokemon($settings, this.PokemonTrainers.get(user)!.Tipped);
            const origin = Pokemons[newId];
            if (origin !== undefined) {
                this.PokemonTrainers.get(user)!.Pokemon = origin.Clone();
            }
            Messenger.sendInfoMessage($room, "Your " + oldPkmn.Name + " has been swapped for a " + this.PokemonTrainers.get(user)!.Pokemon.Name + ".", user);
        } else{
            Messenger.sendErrorMessage($room, `${user} does not have a pokemon.`);
        }
    }

    public ExportToDTO(): PokemonTrainerDTO[] {
        const exportdata: PokemonTrainerDTO[] = [];
        this.PokemonTrainers.forEach((trainer) => {
            const pokemonDTO = new PokemonDTO(trainer.Pokemon.Id, trainer.Pokemon.Life, trainer.Pokemon.Move.Name, trainer.Pokemon.Level, trainer.Pokemon.Petname, trainer.Pokemon.CaughtAt, trainer.Pokemon.Fainted, trainer.Pokemon.FaintedAt);
            exportdata.push(new PokemonTrainerDTO(trainer.User, pokemonDTO, trainer.Tipped, trainer.BuyStoneWarning, trainer.BuyStoneConfirmation, trainer.BuyReviveWarning, trainer.BuyReviveConfirmation, trainer.TrainerSince, trainer.TradeRequestedAt, trainer.TradeRequestReceivedFrom));
        });

        return exportdata;
    }

    public ImportFromDTO(importdata: PokemonTrainerDTO[]) {
        importdata.forEach((trainer) => {
            const origin = Pokemons[trainer.Pokemon.Id];
            if (origin !== undefined) {
                if (trainer.Pokemon.CaughtAt === undefined) {
                    trainer.Pokemon.CaughtAt = new Date();
                    trainer.Pokemon.FaintedAt = null;
                    trainer.Pokemon.Fainted = false;
                    trainer.BuyReviveWarning = false;
                    trainer.BuyReviveConfirmation = false;
                }
                const pokemon = origin.Clone(trainer.Pokemon.CaughtAt);
                const move = pokemon.availableMoves.find((m) => m.Name === trainer.Pokemon.Move);
                if (move !== undefined) {
                    pokemon.Move = move;
                }
                pokemon.Life = trainer.Pokemon.Life;
                pokemon.Level = trainer.Pokemon.Level;
                pokemon.Petname = trainer.Pokemon.Petname;
                pokemon.CaughtAt = trainer.Pokemon.CaughtAt;
                pokemon.Fainted = trainer.Pokemon.Fainted;
                pokemon.FaintedAt = trainer.Pokemon.FaintedAt;

                const pokemontrainer = new PokemonTrainer(trainer.User, pokemon, trainer.Tipped);
                pokemontrainer.BuyStoneConfirmation = trainer.BuyStoneConfirmation;
                pokemontrainer.BuyStoneWarning = trainer.BuyStoneWarning;
                pokemontrainer.BuyReviveConfirmation = trainer.BuyReviveConfirmation;
                pokemontrainer.BuyReviveWarning = trainer.BuyReviveWarning;
                pokemontrainer.TradeRequestReceivedFrom = trainer.TradeRequestReceivedFrom;
                pokemontrainer.TradeRequestedAt = trainer.TradeRequestedAt;
                pokemontrainer.TrainerSince = trainer.TrainerSince;

                this.PokemonTrainers.set(trainer.User, pokemontrainer);
            }
        });
    }
}
