import {$room} from "../api/$room";

import { MsgColors } from "../misc/colors";
import { Groups } from "../misc/groups";
import { Pokemons } from "../../old_src/src/models/pokemon/pokemon";

export default class Messenger {

    public static sendWelcomeMessage(user?: string) {
        let name = "trainer";

        if (user !== undefined) {
            name = user;
        }

        const welcomeMsg = `:pkmnoak Hello there, ${name}! Welcome to the world of Chaturbate!
                            Here you will find ${$room.owner}'s room is inhabited by creatures called Pokemon!
                            The number of registered Pokemon in the Pokedex is currently at ${Pokemons.length - 1}
                            There are still more Pokemon are waiting to be discovered.
                            Keep an eye out for them in the future!`;
        this.sendInfoMessage(welcomeMsg, user);
    }

    public static sendMessageToUser(message: string, user: string, background?: MsgColors, foreground?: MsgColors) {
        this.sendMessage(message, user, background, foreground);
    }

    public static sendMessageToGroup(message: string, group: Groups, background?: MsgColors, foreground?: MsgColors) {
        this.sendMessage(message, undefined, background, foreground, undefined, group);
    }

    public static sendBroadcasterNotice(message: string): void {
        this.sendMessageToUser(message, $room.owner, MsgColors.Yellow, MsgColors.Purple);
    }

    public static sendErrorMessage(message: string, user?: string, group?: Groups) {
        this.sendMessage(message, user, undefined, MsgColors.Red, undefined, group);
    }

    public static sendWarningMessage(message: string, user?: string, group?: Groups) {
        this.sendMessage(message, user, undefined, MsgColors.Orange, undefined, group);
    }

    public static sendSuccessMessage(message: string, user?: string, group?: Groups) {
        this.sendMessage(message, user, undefined, MsgColors.Green, undefined, group);
    }

    public static sendInfoMessage(message: string, user?: string, group?: Groups) {
        this.sendMessage(message, user, undefined, MsgColors.Black, undefined, group);
    }

    private static sendMessage(message: string, user?: string, background?: MsgColors, foreground?: MsgColors, weight?: weight, group?: Groups) {
        if (weight === undefined) {
            weight = "bold";
        }
        $room.sendNotice(message, { toUsername: user, bgColor: background as string, color: foreground as string, fontWeight: weight, toColorGroup: group as group});
    }
}
