export default class PokemonDTO {
    constructor(
    public Id: number,
    public Life: number,
    public Move: string,
    public Level: number,
    public Petname: string | null = null,
    ) {}
}
