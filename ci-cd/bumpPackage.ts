/* eslint-disable no-console */
/* eslint-disable jest/require-hook */
// eslint-disable-next-line import/no-extraneous-dependencies
import fs from 'fs';
import pkg, { version } from '../package.json';

function getMinor(v: string) {
  const versionArray = v.split('.');
  return Number(versionArray[versionArray.length - 1]);
}

function bumpPackageVersion(pk: any, newVersion: string) : Promise<void> {
  return new Promise((resolve, reject) => {
    const newPackage = { ...pk };
    newPackage.version = newVersion;
    console.log(`>>> new package version: ${newVersion}`);
    fs.writeFile('./package.json', JSON.stringify(newPackage, null, 2), (err) => {
      if (err) reject(err);
      else {
        resolve();
      }
    });
  });
}

(async () => {
  setImmediate(async () => {
    console.log('========== Start Bump Package');
    console.log(`>>> current package version: ${version}`);
    const versionArray = version.split('.');
    let newMinor = getMinor(version);
    // eslint-disable-next-line no-plusplus
    newMinor++;
    versionArray[versionArray.length - 1] = newMinor as unknown as string;
    const newVersion = versionArray.join('.');
    await bumpPackageVersion(pkg, newVersion);
    console.log('========== End Bump Package');
  });
})();
