/**
 * Access broadcaster provided app settings with this method.
 * All settings that you create for your app become available as properties of the $settings object.
 */
export type Settings = Record<string, never>;

export declare const $settings: Settings;