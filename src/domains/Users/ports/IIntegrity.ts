// eslint-disable-next-line no-shadow
export enum EIntegrity {
  healthy = 'healthy',
  risky = 'risky',
}
export interface IIntegrity {
  status: EIntegrity
}
