import {$user,User} from "../api/$user";

type Claim = "IS_DEV" | "IS_BROADCASTER" | "IS_MOD" | "IS_HELPER" | "IN_FANCLUB" | "HAS_TOKEN" | "";
type PermissionLevel = "DEV" | "MOD" | "SUPERUSER" | "USER";

export default class AccessControl {

    constructor(
        public modsAllowed: boolean,
        private dev: string,
        private helpers: string[],
    ) {}

    public hasClaim($user: User, claim: Claim): boolean {
        return this.getClaims($user).includes(claim);
    }

    public getClaims($user: User): Claim[] {
        const claims: Claim[] = [];

        if ($user.username === this.dev) {
            claims.push("IS_DEV");
        }

        if ($user.isOwner) {
            claims.push("IS_BROADCASTER");
        }

        if (this.helpers.includes($user.username)) {
            claims.push("IS_HELPER");
        }

        if ($user.isMod) {
            claims.push("IS_MOD");
        }

        if ($user.inFanclub) {
            claims.push("IN_FANCLUB");
        }

        return claims;
    }

    public hasPermission($user: User, permission: PermissionLevel): boolean {
        if (this.hasClaim($user, "IS_DEV")) {
            return true;
        }

        const hasAnyClaim = (claims: Claim[]): boolean => {
            if (this.getClaims($user).some((claim) => (claims.includes(claim)))) {
                return true;
            }
            return false;
        };

        switch (permission) {
            case "MOD":
                if (this.modsAllowed) {
                    return hasAnyClaim(["IS_BROADCASTER", "IS_MOD"]);
                } else {
                    return hasAnyClaim(["IS_BROADCASTER"]);
                }
            case "SUPERUSER":
                if (this.modsAllowed) {
                    return hasAnyClaim(["IS_BROADCASTER", "IS_MOD", "IS_HELPER"]);
                } else {
                    return hasAnyClaim(["IS_BROADCASTER"]);
                }
            case "USER":
                return hasAnyClaim(["IS_BROADCASTER", "IS_MOD", "IS_HELPER", "IN_FANCLUB", "HAS_TOKEN"]);
            default:
                return false;
        }
    }
}
