export function replaceVars(path: string): string {
  return path.toString().replace(/{/g, ':').replace(/}/g, '');
}
