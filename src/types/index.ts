export type { Profile } from './profile';
export type { GlobalConfig, ShenzhenTaxConfig } from './config';
export type {
  AssetItem,
  AssetType,
  LiabilityItem,
} from './assets';
export { ASSET_TYPE_LABELS } from './assets';
export type {
  SalaryConfig,
  BonusConfig,
  RSUGrant,
  ExpenseConfig,
} from './income';

export interface FireState {
  profile: import('./profile').Profile;
  config: import('./config').GlobalConfig;
  shenzhenTax: import('./config').ShenzhenTaxConfig;
  assets: import('./assets').AssetItem[];
  liabilities: import('./assets').LiabilityItem[];
  salary: import('./income').SalaryConfig;
  bonus: import('./income').BonusConfig;
  rsuGrants: import('./income').RSUGrant[];
  expense: import('./income').ExpenseConfig;
  lastUpdated: string;
}
