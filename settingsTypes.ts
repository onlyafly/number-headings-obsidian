export interface HeaderNumberingPluginSettings {
  skipTopLevel: boolean,
  maxLevel: number,
  styleLevel1: string,
  styleLevelOther: string,
}

export const DEFAULT_SETTINGS: HeaderNumberingPluginSettings = {
  skipTopLevel: false,
  maxLevel: 10,
  styleLevel1: '1',
  styleLevelOther: '1'
}
