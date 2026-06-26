/* eslint-disable no-await-in-loop */
/* eslint-disable no-constant-condition */
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

export class Prompt {
  private readonly rl = readline.createInterface({ input, output });

  public async ask(question: string): Promise<string> {
    const value = await this.rl.question(question);
    return value.trim();
  }

  public async choose(title: string, options: string[]): Promise<number> {
    // eslint-disable-next-line no-console
    console.log(`\n${title}`);
    options.forEach((option, index) => {
      // eslint-disable-next-line no-console
      console.log(` ${index + 1}. ${option}`);
    });

    while (true) {
      const answer = await this.ask('Choose an option: ');
      const selected = Number(answer);
      if (Number.isInteger(selected) && selected >= 1 && selected <= options.length) {
        return selected - 1;
      }
      // eslint-disable-next-line no-console
      console.log('Invalid option. Please choose a valid number.');
    }
  }

  public close(): void {
    this.rl.close();
  }
}
