/* For local copy of parsed settings object
 */

export class SettingsObj implements SettingsLocal {
    mod_allow_broadcaster_cmd: boolean = true;
    banner_rotate: number = 240;
    broadcaster_pokemon: number = 25;
    catch_pokemon: number = 25;
    uncommon_tip: number = 50;
    rare_tip: number = 100;
    legendary_tip: number = 500;
    mystic_tip: number = 1000;
    level_pokemon: number = 10;
    stone_price: number = 200;
    fanclub_auto_catch: boolean = true;
    elite_four_1: string = '';
    elite_four_1_pokemon: number = 144;
    elite_four_2: string = '';
    elite_four_2_pokemon: number = 145;
    elite_four_3: string = '';
    elite_four_3_pokemon: number = 146
    elite_four_4: string = '';
    elite_four_4_pokemon: number = 151;
    public_fights: boolean = false;
    colorize_chat: boolean = true;

    constructor(settingsLocal?: Partial<SettingsLocal>) {
        if (settingsLocal) {
          Object.assign(this, settingsLocal);
        }
      }
  }