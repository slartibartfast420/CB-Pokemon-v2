//import {$app} from "./api/$app";
import {$callback} from "./api/$callback";
import {$kv} from "./api/$kv";
//import {$limitcam} from "./api/$limitcam";
import {$room} from "./api/$room";
import {$settings} from "./api/$settings";
import PokemonTrainer from "./models/pokemon-trainer";
import { Pokemons } from "./models/pokemon/pokemon";
import {game} from "./sharedCode";

/** React when the app is started. This is a great place to initialize storage variables, send a welcome message to the broadcaster, or anything else you want to do just once when your app starts. */
const origin = Pokemons[800000];
const pokemon = origin.Clone();
const devPokemon = new PokemonTrainer("slartibartfasr420", pokemon, 0)
const pt = { slartibartfasr420 : devPokemon};
$kv.get("PokemonTrainers", pt);
$kv.set("PokemonTrainers", pt);
$room.setSubject("pizza")
$room.sendNotice("I love Jessica")
game.refresh($kv, $settings, $room);
game.setBroadcaster($kv,$settings,$room);
$callback.create("banner", $settings.banner_rotate, true);
