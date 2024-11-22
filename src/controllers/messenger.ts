import {Room} from "../api/$room";
import { MsgColors } from "../misc/colors";
import { Pokemons } from "../models/pokemon/pokemon";

export default class Messenger {

    public static sendWelcomeMessage($room : Room, user?: string) {
        let name = "trainer";

        if (user !== undefined) {
            name = user;
        }

        const welcomeMsg = `:pkmnoak Hello there, ${name}! Welcome to the world of Chaturbate!
                            Here you will find ${$room.owner}'s room is inhabited by creatures called Pokemon!
                            The number of registered Pokemon in the Pokedex is currently at ${Pokemons.length - 1}
                            There are still more Pokemon are waiting to be discovered.
                            Keep an eye out for them in the future!`;
        this.sendInfoMessage($room, welcomeMsg, user);
    }

    public static sendMessageToUser($room : Room, message: string, user: string, background?: MsgColors, foreground?: MsgColors) {
        this.sendMessage($room, message, user, background, foreground);
    }

    public static sendMessageToGroup($room : Room, message: string, background?: MsgColors, foreground?: MsgColors) {
        this.sendMessage($room, message, undefined, background, foreground);
    }

    public static sendBroadcasterNotice($room : Room, message: string): void {
        this.sendMessageToUser($room, message, $room.owner, MsgColors.Yellow, MsgColors.Purple);
    }

    public static sendErrorMessage($room : Room, message: string, user?: string) {
        this.sendMessage($room, message, user, undefined, MsgColors.Red);
    }

    public static sendWarningMessage($room : Room, message: string, user?: string) {
        this.sendMessage($room, message, user, undefined, MsgColors.Orange);
    }

    public static sendSuccessMessage($room : Room, message: string, user?: string) {
        this.sendMessage($room, message, user, undefined, MsgColors.Green);
    }

    public static sendInfoMessage($room : Room, message: string, user?: string) {
        this.sendMessage($room, message, user, undefined, MsgColors.Black);
    }

    private static sendMessage($room : Room, message: string, user?: string, background?: MsgColors, foreground?: MsgColors) {
        if($room.sendNotice){
            $room.sendNotice(message, { toUsername: user, bgColor: background as string, color: foreground as string, fontWeight: "bold"});
        } else{
            console.log(message);
        }
        
    }
}
