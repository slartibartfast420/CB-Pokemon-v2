/**
 * Checks if user has super user rights within the app/bot.
 * @param user username
 * @param isMod boolean is mod, check against allow mod setting
 */
export function isSuperuser(user: string, owner: string, isMod: boolean, mod_allow_broadcaster_cmd: boolean) {
    return (user === owner || (isMod && mod_allow_broadcaster_cmd));
}

export function isDevOrHelper(user: string, list: string[]) {
    console.log(`Test list: ${list}`);
    return list.includes(user);
}

export function customStringify(v: any) {
    const cache = new Map();
    return JSON.stringify(v, (_, value) => {
        if (typeof value === "object" && value !== null) {
            if (cache.get(value)) {
            // Circular reference found, discard key
            return;
            }
            // Store value in our map
            cache.set(value, true);
        }
        return value;
    });
}

