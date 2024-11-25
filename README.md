# v2 CB's #1 Pokemon Bot

My fork to create a v2 api version of this CB Pokemon bot, and further improve it.
it is based on the following two projects. 

I updated to v2 API.
I tested the trade system.
I updated dependencies.
I added Chikorita.
---

# CB's #1 Pokemon Bot

This started out as a fork of the [Pokedex Bot](https://de.chaturbate.com/apps/app_details/pokedex/?version=&slot=3) of [asudem](https://de.chaturbate.com/apps/user_uploads/3/asudem/).
I was bored on a Sunday and decided to take this, completely port it over to Typescript (another programming language) and extend it bit by bit.
The code is public, feel free to check it out, copy it and make your own version. But please let the dev (me) and original author (asudem) stay in there as legacy or link us somewhere at least: <https://github.com/thamo01/CB-Pokemon>

# Some Information

Current # of Pokemon: 152 (All Gen 1 Pokemon + Chikorita)
Current # of Attacks: 728 (All up to ORAS, only are partially Sun & Moon missing)
Current # of Types: 18 (All current Pokemontypes)
Current functionality:

- Catch Pokemon with different Pokeballs
- Level 'em up
- Release the pokemon and catch more
- Trade with other users
- Attack your opponents and battle with your pokemons.
***Damage is calculated according to whats known of the official games.**
It includes the Base Stats of your Pokemon and the new stats according to your level.
Takes account for what move your pokemon uses (moves are randomly picked from the available moveset to the specific pokemon).
Takes account of the move type and pokemon type. Nullifies damage if for ex. a ghost type is beeing attacked of a normal type.*
- Pokemon Icons
- Colored Background according to Pokemon type

---

# Chaturbate-AppV2-DevKit

Develop, test, and compile apps for the Chaturbate App v2 platform, all locally.

## Table of Contents

- [v2 CB's #1 Pokemon Bot](#v2-cbs-1-pokemon-bot)
  - [I added Chikorita.](#i-added-chikorita)
- [CB's #1 Pokemon Bot](#cbs-1-pokemon-bot)
- [Some Information](#some-information)
- [Chaturbate-AppV2-DevKit](#chaturbate-appv2-devkit)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Features](#features)
    - [Core Features](#core-features)
    - [Helper Libraries](#helper-libraries)
  - [REPL](#repl)
  - [Contribution](#contribution)
  - [License](#license)

## Introduction

Chaturbate-AppV2-DevKit provides a streamlined solution for developing apps for the Chaturbate App v2 platform using the v0.52.0 API. Write and test with TypeScript, then compile to JavaScript for deployment.

For comprehensive documentation, including setup, API details, and testing instructions, please visit the [DevKit Wiki](https://github.com/recursivedesire/Chaturbate-AppV2-DevKit/wiki).

## Features

### Core Features

- **TypeScript Integration**: Utilize TypeScript with custom Babel plugins tailored for the Chaturbate App v2 platform:
  - **devportal-compat-plugin**: Ensures all necessary code is available in bundled event-listener files by stripping unnecessary imports and inlining modules. [Learn more](https://github.com/recursivedesire/Chaturbate-AppV2-DevKit/wiki/DevPortal-Compat).
  - **macro-plugin**: Introduces compile-time TypeScript macro execution, allowing developers to execute code during the build process and directly replace function calls with their results. [Learn more](https://github.com/recursivedesire/Chaturbate-AppV2-DevKit/wiki/Macros).
- **Local API Definitions**: Local TypeScript definitions of the Chaturbate App v2 API, primed for development and testing.
- **AVA-powered Unit Testing**: Robust testing framework integration using AVA and TSC, allowing for effective unit tests. [Learn more](https://github.com/recursivedesire/Chaturbate-AppV2-DevKit/wiki/Testing).
- **Seamless TypeScript-to-JavaScript Compilation**: Easy compilation process facilitated by Babel, readying your code for deployment.

### Helper Libraries

- **Command System**: Modular command management with dynamic registration, permission checks, and argument parsing. [Learn more](https://github.com/recursivedesire/Chaturbate-AppV2-DevKit/wiki/Command-System).
- **Data Processing**: Tools for data encoding, decoding, and hashing, optimized for performance and security. [Learn more](https://github.com/recursivedesire/Chaturbate-AppV2-DevKit/wiki/Data-Processing).
- **StorageKV**: Advanced key-value storage with features like namespaces and skip lists for efficient data management. [Learn more](https://github.com/recursivedesire/Chaturbate-AppV2-DevKit/wiki/StorageKV).
- **Template Engine**: Dynamic string rendering with support for placeholders, conditional logic, and recursive templates. [Learn more](https://github.com/recursivedesire/Chaturbate-AppV2-DevKit/wiki/Template-Engine).

## REPL

Upcoming REPL console for local app testing will simulate the Chaturbate App v2 platform's experience using the v0.52.0 API, providing a robust testing environment without deploying your apps.

## Contribution

All forms of contributions are welcome! If you have ideas for improvements or want to collaborate, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. For more details, see the LICENSE file in our repository.
