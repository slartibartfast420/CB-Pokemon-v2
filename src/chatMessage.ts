import {$kv} from "./api/$kv";
import {$message} from "./api/$message";
import {$room} from "./api/$room";
import { $settings } from "./api/$settings";
import {$user} from "./api/$user";
import {game} from "./sharedCode";

/** React when a message is published in chat. */
if ($message.orig.trim().indexOf("/") == 0){
    const args = $message.orig.trim().slice(1).split(/\s+/g);
    const command = args.shift().toLowerCase();

    switch (command){
        case game.config.CMDS.SUPPORT : {
            game.toggleSupport($user, $room, $kv);
            break;
        }
        case game.config.CMDS.ADDUSER : {
            game.addUser(args,$user,$room);
            break;
        }
        case game.config.CMDS.EVOLVE: {
            game.change(args,$user,$room,$kv);
            break;
        }
        case game.config.CMDS.CHANGE: {
            game.remove(args,$user,$room);
            break;
        }
        case game.config.CMDS.REMOVE: {
            game.levelup(args,$user,$room);
            break;
        }
        case game.config.CMDS.SENDHELP: {
            game.sendHelp(args,$user,$settings,$room);
            break;
        }
        case game.config.CMDS.RELEASE: {
            game.userCommands(command,args,$user,$room,$kv);
            break;
        }
        case game.config.CMDS.IDENTIFY: {
            game.userCommands(command,args,$user,$room,$kv);
            break;
        }
        case game.config.CMDS.BUYSTONE: {
            game.userCommands(command,args,$user,$room,$kv);
            break;
        }
        case game.config.CMDS.TRADE: {
            game.userCommands(command,args,$user,$room,$kv);
            break;
        }
        case game.config.CMDS.LEVEL: {
            game.userCommands(command,args,$user,$room,$kv);
            break;
        }
        case game.config.CMDS.ATTACK: {
            game.userCommands(command,args,$user,$room,$kv);
            break;
        }
        case game.config.CMDS.LISTTRAINERS: {
            game.userCommands(command,args,$user,$room,$kv);
            break;
        }
        case game.config.CMDS.LISTELITEFOUR: {
            game.userCommands(command,args,$user,$room,$kv);
            break;
        }
    }
}