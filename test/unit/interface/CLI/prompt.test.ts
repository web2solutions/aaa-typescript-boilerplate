import { Prompt } from '@src/interface/CLI/core/prompt';

describe('cli prompt', () => {
  it('asks and trims values', async () => {
    expect.hasAssertions();
    const question = jest.fn().mockResolvedValue('  hello  ');
    const close = jest.fn();

    const prompt = new Prompt(() => ({ question, close } as any));
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
    const close = jest.fn();
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const prompt = new Prompt(() => ({ question, close } as any));
    const selected = await prompt.choose('Menu', ['One', 'Two', 'Three']);

    expect(selected).toBe(1);
    expect(question).toHaveBeenCalledTimes(3);
    expect(logSpy).toHaveBeenCalledWith('Invalid option. Please choose a valid number.');
    prompt.close();
    expect(close).toHaveBeenCalledTimes(1);

    logSpy.mockRestore();
  });
});
