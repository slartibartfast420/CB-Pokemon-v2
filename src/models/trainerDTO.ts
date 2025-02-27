import PokemonDTO from "./pokemon/pokemonDTO";

export default class PokemonTrainerDTO {

    constructor(
        public User: string,
        public Pokemon: PokemonDTO,
        public Tipped = 0,
        public TrainerSince: Date,
        public TradeRequestedAt?: string,
        public TradeRequestReceivedFrom?: string
    ) { }
}
