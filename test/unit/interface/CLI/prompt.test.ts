import readline from 'node:readline/promises';
import { Prompt } from '@src/interface/CLI/core/prompt';

jest.mock<typeof import('node:readline/promises')>('node:readline/promises', () => ({
  ...jest.requireActual('node:readline/promises'),
  createInterface: jest.fn()
}));

describe('cli prompt', () => {
  const createInterfaceMock = readline.createInterface as unknown as jest.Mock;

  beforeEach(() => {
    createInterfaceMock.mockReset();
  });

  it('asks and trims values', async () => {
    expect.hasAssertions();
    const question = jest.fn().mockResolvedValue('  hello  ');
    const close = jest.fn();
    createInterfaceMock.mockReturnValue({ question, close });

    const prompt = new Prompt();
    const value = await prompt.ask('Type: ');

    expect(question).toHaveBeenCalledWith('Type: ');
    expect(value).toBe('hello');
    prompt.close();
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('keeps asking choose until a valid option is provided', async () => {
    expect.hasAssertions();
    const question = jest.fn()
      .mockResolvedValueOnce('0')
      .mockResolvedValueOnce('abc')
      .mockResolvedValueOnce('2');
    createInterfaceMock.mockReturnValue({ question, close: jest.fn() });
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const prompt = new Prompt();
    const selected = await prompt.choose('Menu', ['One', 'Two', 'Three']);

    expect(selected).toBe(1);
    expect(question).toHaveBeenCalledTimes(3);
    expect(logSpy).toHaveBeenCalledWith('Invalid option. Please choose a valid number.');

    logSpy.mockRestore();
  });
});
