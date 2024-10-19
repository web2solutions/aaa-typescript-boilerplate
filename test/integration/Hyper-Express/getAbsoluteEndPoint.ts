const apiAddress = 'http://localhost:3000';

export function getAbsoluteEndPoint(endPoint: string) {
  return `${apiAddress}${endPoint}`;
}
