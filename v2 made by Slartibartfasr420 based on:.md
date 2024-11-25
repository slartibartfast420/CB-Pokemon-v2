v2 made by Slartibartfasr420 based on:

CB’s #1 Pokemon Bot
===================

This started out as a fork of the [Pokedex Bot](https://de.chaturbate.com/apps/app_details/pokedex/?version=&slot=3) of [asudem](https://de.chaturbate.com/apps/user_uploads/3/asudem/).  
I was bored on a Sunday and decided to take this, completely port it over to Typescript (another programming language) and extend it bit by bit.  
The code is public, feel free to check it out, copy it and make your own version. But please let the dev (me) and original author (asudem) stay in there as legacy or link us somewhere at least: [https://github.com/thamo01/CB-Pokemon](https://github.com/thamo01/CB-Pokemon)

You can turn on public battle messages in the settings!
=======================================================

Commands
========

_Commands for: broadcaster and mods (and me and my friends to help you guys out if we are in your rooms).  
You can choose to disable this in the setting of the app, then the commands only work for the broadcaster._

**Command**

**Description**

**/adduser <username> 25**

_Adds pokemon number 25 (Pikachu) to user <username>. The number is the PokeDex # of the Pokemon. See [this list](https://bulbapedia.bulbagarden.net/wiki/List_of_Pok%C3%A9mon_by_National_Pok%C3%A9dex_number#Generation_I)._

**/levelup <username> 10**

_Levelup the pokemon of user <username> by 10, or 20, or 100 levels without evolving the pokemon. Levels are capped at 100!_

**/evolve <username>**

_Evolves the pokemon of user <username>_

**/change <username>**

_Randomly changes the pokemon of user <username> using the amount of tokens he tipped._

**/remove <username>**

_Removes the pokemon of the user <username>_

**/sendhelp <username>**

_Sends welcome message and banner to the user <username>, if no user was given, message is sent to everyone_

_Commands for: everyone_

**Command**

**Description**

**/release**

_Releases the current pokemon_

**/identify <username>**

_Find out what pokemon the user <username> has_

**/level <username>**

_Find out what level the pokemon of user <username> is_

**/attack <username>**

_Attack the pokemon of user <username>_

**/trade <username>**
_Proposes a trade with user <username>_

**/listtrainers**

_Get’s a list of all trainers in the room with pokemon and level (so you can start attacking)_

**/listelitefour**

_Get's a list of all elite four members still alive (so you can defeat them before you go after the broadcaster)_

Some Information
================

Current # of Pokemon: 152 (All Gen 1 Pokemon + Chikorita)  
Current # of Attacks: 728 (All up to ORAS, only are partially Sun & Moon missing)  
Current # of Types: 18 (All current Pokemontypes)  
Current functionality:

*   Catch Pokemon with different Pokeballs
*   Level 'em up
*   Release the pokemon and catch more
*   Attack your opponents and battle with your pokemons.  
    _**Damage is calculated according to whats known of the official games.**  
    It includes the Base Stats of your Pokemon and the new stats according to your level.  
    Takes account for what move your pokemon uses (moves are randomly picked from the available moveset to the specific pokemon).  
    Takes account of the move type and pokemon type. Nullifies damage if for ex. a ghost type is beeing attacked of a normal type._
*   Pokemon Icons
*   Colored Background according to Pokemon type

Changelog
=========
*   **11.24.2024** - Added trade command to trade with users using /trade <username>
        Added Chikorita, will add more pokemon later.
        Updated everything to work as a v2 App
        
*   **02.02.2019** - Added mod command to send welcome and banner message to users or room using /sendhelp <optional: username>  
    Added an option on bot configuration page to make battles public. The messages sent are shorter than what you saw until now between the two fighters (one liners), but it still might clutter your chat, depending on how active your community is. (This encourages other people to battle and makes for more fun :D).  
    Added an option to choose whether or not color the chat (bot settings). I made it so you could choose between only the font-color or only the background-color or both, but that doesn't really work out since some of them aren't visible to the reader if set so, so only on/off.  
    _Also fixed the banner bug, now the rotating banner actuall rotates and works.. so remember to turn off any banners you made yourself if you use the integrated one!  
    The option to give fanclub users pokemons on enter now works instead of defaulting to give them pokemon (means, you can switch it on and off in the settings)._
*   **08.09.2018** - Added my list of friends to help you out using this bot. Someone reached out to me and I was thinking of this too sometimes. If support mode is on, you’ll be able to receive help from those if they visit your room. They’ll introduce themselfs and be reeaallyy nice to you, trust me :)  
    _Also I updated this documentation/readme so i’t a bit clearer ;)_
*   **30.06.2018** - Minor Bugfixes, changed the way the mods level up command works so you can have a level 100 Pikachu without it evolving to Raichu.  
    Added option to give fanclub members a common pokemon on entering the room for free. Show them some love right? :))  
    Added Mystic Tip, tho right now the only mystic Pokemon is Mew, keep that in mind!  
    Btw, seems like the bug was solved :))
*   **17.06.2018** - Had some minor changes in the last days not really worth mentioning. But now you have the possibility to chose your personal Elite Four! If you set them, all of them have to be defeated before people can battle against you. Choose your elite four members and their pokemon wisely. (Elite Four Members are part of the game, whether the user is online or not, they still appear as trainers!)
*   **14.06.2018** - Updated some things under the hood :) Please report any problems you might encounter so I can fix it! :D And thank you so much for using my little bot :)
*   **12.06.2018** - Added separate tip amount for legendary Pokemon (Mewtwo, Articuno, Moltres, Zapdos)  
    PS: Mew is in there! tho as an Unobtainable Pokemon. So, good luck catching that one… it can only be given to you by the Broadcaster or a Mod if support mode is activated, as if it would come to you by itself ;)
*   **10.06.2018** - Added the missing GIFs, now all them 151 Gen1 Pokemon can be used :D
*   **09.06.2018** - Added the rest of the Gen 1 Pokemon, all of the 151 are now available (Eevee’s evolutions can be caught, but not yet evolved into… legendaries are in too!) - But I still need to upload the gifs… so I commented them out, but I’ll be done with it shortly ;)
*   **03.06.2018** - Added battles, you can now fight each others!
*   **25.05.2018** - Forked it. Right now, you don’t have many features you get beyond the original version on asudem (except the fights), you might even have more bugs since this one is not as tested ^^.  
    But since this is Typescript I guess it’ll be quicker to add features to it and still have a good program over all.  
    So please try it out and give me feedback!  
    Currently you have the first 110 Pokemon available (until Weezing).  
    There are Uncommon Pokemon, Uncommon & Rare Pokemon. The better a Pokeball (set via Tokens) the better your Pokemon.  
    I included all the moves of all Pokemon since Generation 1 up to Ultra Sun and Ultra Moon in this bot. The Pokemons of the newer generations are still missing (Dex only goes to 110) but I’ll try to include 'em as fast as possible for me.