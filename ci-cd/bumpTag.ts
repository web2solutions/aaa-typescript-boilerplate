/* eslint-disable no-console */
/* eslint-disable jest/require-hook */
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  simpleGit, SimpleGit, TagResult
} from 'simple-git';
import { version } from '../package.json';

const _VERSION_PREFIX_ = 'v';

function getMinor(v: string) {
  const versionArray = v.split('.');
  return Number(versionArray[versionArray.length - 1]);
}

export class GitClient {
  private client: SimpleGit;

  constructor() {
    this.client = simpleGit();
  }

  getTags(): Promise<TagResult> {
    return new Promise((resolve, reject) => {
      this.client.tags({}, (error, TagList) => {
        if (error) {
          return reject(error);
        }
        return resolve(TagList);
      });
    });
  }

  setTag(newVersion: string) {
    return new Promise((resolve, reject) => {
      this.client.addTag(newVersion, (error, data) => {
        if (error) {
          return reject(error);
        }
        console.log('>>> new tag created:', data);
        return resolve(data);
      });
    });
  }
}
(async () => {
  console.log('========== Start Bump Tag');
  const gitClient = new GitClient();
  const tagList: TagResult = await gitClient.getTags();
  const latestTag = tagList.latest;
  console.log(`>>> Latest tag: ${latestTag}`);
  let newVersion = '';
  let newTag = '';
  if (!latestTag) {
    newVersion = '0.0.1';
    newTag = `${_VERSION_PREFIX_}${newVersion}`;
    await gitClient.setTag(newTag);
    return;
  }

  const versionArray = version.split('.');
  let newMinor = getMinor(version);

  // eslint-disable-next-line no-plusplus
  newMinor++;

  versionArray[versionArray.length - 1] = newMinor as unknown as string;
  newVersion = versionArray.join('.');
  newTag = `${_VERSION_PREFIX_}${newVersion}`;

  const lastestMinor = getMinor(latestTag);

  if (lastestMinor < newMinor) {
    await gitClient.setTag(newTag);
  }
  console.log('========== End Bump Tag');
})();
