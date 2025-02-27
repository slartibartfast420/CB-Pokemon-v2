# Help out extending the list of available Pokemon!

### The Format of the Pokemon inside my code:
new Pokemon(PokeDex#, "Name of the Pokemon", [Types.Type1, Types.Type2], Rarity.RarityOfPokemon, BaseLevel, EvolutionStage, EvolvesAtLevel, "PokeDex Description Text", TrueOrFalse:TradeToEvolve?, TrueOrFalse:EvolutionStoneToEvolve?, BaseAtk, BaseDef, BaseHP, [Moves.AvailableMove1, Moves.AvailableMove2])

### Real Example of Pikachu and Charizard:
``` typescript
...,
...,
new Pokemon(6, "Charizard", [ Types.Fire, Types.Flying ], Rarity.Rare, 1, 3, 0, "Spits fire that is hot enough to melt boulders. Known to cause forest fires unintentionally.", false, false, 84, 78, 78, [ Moves.FlareBlitz, Moves.HeatWave, Moves.DragonClaw, Moves.ShadowClaw, Moves.AirSlash, Moves.Scratch, Moves.Growl, Moves.Ember, Moves.Smokescreen, Moves.Ember, Moves.Smokescreen, Moves.DragonRage, Moves.ScaryFace, Moves.FireFang, Moves.FlameBurst, Moves.WingAttack, Moves.Slash, Moves.Flamethrower, Moves.FireSpin, Moves.Inferno, Moves.HeatWave, Moves.FlareBlitz, Moves.AirCutter, Moves.AncientPower, Moves.BeatUp, Moves.BellyDrum, Moves.Bite, Moves.Counter, Moves.Crunch, Moves.DragonDance, Moves.DragonPulse, Moves.DragonRush, Moves.FlareBlitz, Moves.FocusPunch, Moves.MetalClaw, Moves.Outrage ]),
...,
...,
new Pokemon(25, "Pikachu", [ Types.Electric ], Rarity.Common, 1, 1, 0, "When several of these Pokémon gather, their electricity could build and cause lightning storms.", false, true, 55, 40, 35, [ Moves.TailWhip, Moves.ThunderShock, Moves.Growl, Moves.PlayNice, Moves.QuickAttack, Moves.ThunderWave, Moves.ElectroBall, Moves.DoubleTeam, Moves.Nuzzle, Moves.Slam, Moves.Thunderbolt, Moves.Feint, Moves.Agility, Moves.Discharge, Moves.LightScreen, Moves.Thunder, Moves.Bestow, Moves.Bide, Moves.Charge, Moves.DisarmingVoice, Moves.DoubleSlap, Moves.Encore, Moves.Endure, Moves.FakeOut, Moves.Flail, Moves.LuckyChant, Moves.Present, Moves.Reversal, Moves.ThunderPunch, Moves.Tickle, Moves.Wish, Moves.VoltTackle ]),
...,
```



For Devs.. Here the class, including the constructor and the functions called in it:
```typescript
export class Pokemon {
    public Petname: string | null = null;
    public Move: Move;
    public Atk: number;
    public Def: number;
    public Life: number;
    public Fainted: boolean;
    public FaintedAt: Date;
    public CaughtAt: Date;

    constructor(
        public Id: number,
        public Name: string,
        // tslint:disable-next-line:no-shadowed-variable
        public Types: Type[],
        public Rarity: Rarity = Rarity.Common,
        public Level = 1,
        public Stage: 1|2|3 = 1,
        public Evolves = 0,
        public Description = "The PokeDex doesn't have Data on this strange unknown Pokemon... Have you maybe found a new type of Pokemon?",
        public TradeEvolve = false,
        public UsesStone = false,
        public BaseAtk = 40,
        public BaseDef = 40,
        public BaseLife = 40,
        public availableMoves: Move[] = [Moves.Scratch, Moves.Pound],
    ) {
        this.Move = this.GetRandomMove();
        this.Atk = BaseAtk;
        this.Def = BaseDef;
        this.Life = BaseLife;
        this.CaughtAt = new Date(),
        this.Fainted = false;
        this.FaintedAt = null;

        this.updateStats();
    }

    public updateStats() {
        this.Life = Math.round(this.BaseLife * 2 * this.Level / 100 + 10 + this.Level);
        this.Atk = Math.round(this.BaseAtk * 2 * this.Level / 100 + 5);
        this.Def = Math.round(this.BaseDef * 2 * this.Level / 100 + 5);
    }
}
```