export interface HeaderNumberingPluginSettings {
  skipTopLevel: boolean,
  maxLevel: number,
}

export const DEFAULT_SETTINGS: HeaderNumberingPluginSettings = {
  skipTopLevel: false,
  maxLevel: 10
}
