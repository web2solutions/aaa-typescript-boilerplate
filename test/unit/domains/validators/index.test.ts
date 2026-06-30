/* eslint-disable jest/prefer-expect-assertions */
import {
  throwIfNotFound,
  throwIfValuesAreDifferent,
  throwIfIsNotObject,
  canNotWriteDirectly,
  mustBeNumeric,
  mustBePassword,
  mustBeArray,
  mustBeGreaterThanZero,
  throwIfReadOnly,
  mustBePositiveNumber,
  throwIfPreUpdateValidationFails,
  canNotBeEmpty,
  mustEndsAtLeastInMinutes
} from '@src/shared/validators';

describe('domain validators', () => {
  it('throwIfNotFound must throw', async () => {
    expect(
      () => {
        throwIfNotFound(false);
      }
    ).toThrow('Record not found');
  });
  it('throwIfValuesAreDifferent must throw', async () => {
    expect(
      () => {
        throwIfValuesAreDifferent([1, 2]);
      }
    ).toThrow('The provided values are different');
  });
  it('throwIfIsNotObject must throw with field name', async () => {
    const field = 'field name';
    expect(
      () => {
        throwIfIsNotObject(field, []);
      }
    ).toThrow(`The property ${field} must be an object`);
  });
  it('throwIfIsNotObject must throw for primitive value', async () => {
    const field = 'field name';
    expect(
      () => {
        throwIfIsNotObject(field, 'not-an-object' as any);
      }
    ).toThrow(`The property ${field} must be an object`);
  });
  it('canNotWriteDirectly must throw with field name', async () => {
    const field = 'field name';
    expect(
      () => {
        canNotWriteDirectly(field);
      }
    ).toThrow(`The property ${field} can not be directly changed`);
  });
  it('mustBeNumeric must throw with field name', async () => {
    const field = 'field name';
    const value = 'bb';
    expect(
      () => {
        mustBeNumeric(field, value as any);
      }
    ).toThrow(`${field} must be a number`);
  });
  it('mustBePassword must be string', async () => {
    const field = 'password field';
    const value = 12345678;
    expect(
      () => {
        mustBePassword(field, value as any);
      }
    ).toThrow(`${field} must be a string.`);
  });
  it('mustBePassword must have at least 8 chars', async () => {
    const field = 'password field';
    const value = '1234567';
    expect(
      () => {
        mustBePassword(field, value as any);
      }
    ).toThrow(`${field} must have at least 8 chars.`);
  });
  it('mustBePassword strict policy branches', async () => {
    const field = 'password field';
    const previous = process.env.AAA_STRICT_PASSWORD_POLICY;
    process.env.AAA_STRICT_PASSWORD_POLICY = 'yes';
    try {
      expect(() => mustBePassword(field, 'lower123!')).toThrow(`${field} must include at least one uppercase letter.`);
      expect(() => mustBePassword(field, 'UPPER123!')).toThrow(`${field} must include at least one lowercase letter.`);
      expect(() => mustBePassword(field, 'Uppercase!')).toThrow(`${field} must include at least one number.`);
      expect(() => mustBePassword(field, 'Upper1234')).toThrow(`${field} must include at least one symbol.`);
      expect(() => mustBePassword(field, 'Upper123!')).not.toThrow();
    } finally {
      process.env.AAA_STRICT_PASSWORD_POLICY = previous;
    }
  });
  it('mustBeArray', async () => {
    const field = 'password field';
    const value = '1234567';
    expect(
      () => {
        mustBeArray(field, value as any);
      }
    ).toThrow(`${field} must be an array`);
  });
  it('mustBeGreaterThanZero throw with field name', async () => {
    const field = 'fake field';
    const value = -1;
    expect(
      () => {
        mustBeGreaterThanZero(field, value as any);
      }
    ).toThrow(`${field} must be greater than 0`);
  });
  it('mustBeGreaterThanZero throw must be a number', async () => {
    const field = 'fake field';
    const value = 'a';
    expect(
      () => {
        mustBeGreaterThanZero(field, value as any);
      }
    ).toThrow(`${field} must be a number.`);
  });

  it('mustBePositiveNumber throw with field name', async () => {
    const field = 'fake field';
    const value = -1;
    expect(
      () => {
        mustBePositiveNumber(field, value as any);
      }
    ).toThrow(`${field} must be a positive number`);
  });
  it('mustBePositiveNumber throw must be a number', async () => {
    const field = 'fake field';
    const value = 'a';
    expect(
      () => {
        mustBePositiveNumber(field, value as any);
      }
    ).toThrow(`${field} must be a number.`);
  });

  it('throwIfReadOnly must throw with field name', async () => {
    const field = 'field name';
    expect(
      () => {
        throwIfReadOnly(field, true);
      }
    ).toThrow(`Can not write to ${field}. The model is read only`);
  });

  it('throwIfPreUpdateValidationFails', async () => {
    const id = '1';
    expect(
      () => {
        throwIfPreUpdateValidationFails(id, { id: '2' });
      }
    ).toThrow('id and data.id must match');
  });

  it('canNotBeEmpty string', async () => {
    const field = 'field name';
    const value = '';
    expect(
      () => {
        canNotBeEmpty(field, value);
      }
    ).toThrow(`${field} can not be empty`);
  });
  it('canNotBeEmpty null', async () => {
    const field = 'field name';
    const value = null;
    expect(
      () => {
        canNotBeEmpty(field, value);
      }
    ).toThrow(`${field} can not be empty`);
  });
  it('canNotBeEmpty undefined', async () => {
    const field = 'field name';
    const value = undefined;
    expect(
      () => {
        canNotBeEmpty(field, value);
      }
    ).toThrow(`${field} can not be empty`);
  });
  it('canNotBeEmpty []', async () => {
    const field = 'field name';
    const value: any = [];
    expect(
      () => {
        canNotBeEmpty(field, value as any);
      }
    ).toThrow(`${field} can not be empty`);
  });
  it('canNotBeEmpty {}', async () => {
    const field = 'field name';
    const value: any = {};
    expect(
      () => {
        canNotBeEmpty(field, value as any);
      }
    ).toThrow(`${field} can not be empty`);
  });
  it('canNotBeEmpty allows non-empty values', async () => {
    expect(() => canNotBeEmpty('field', 'x')).not.toThrow();
    expect(() => canNotBeEmpty('field', { id: '1' })).not.toThrow();
    expect(() => canNotBeEmpty('field', [1])).not.toThrow();
  });
  it('mustEndsAtLeastInMinutes must ends before 5 minutes - 2 hours in the past', async () => {
    const twoHoursBefore = new Date();
    twoHoursBefore.setHours(twoHoursBefore.getHours() - 2);
    const minutesIntheFuture = 5;
    expect(
      () => {
        mustEndsAtLeastInMinutes(twoHoursBefore, minutesIntheFuture);
      }
    ).toThrow(`Event must ends in at least ${minutesIntheFuture} minutes in the future`);
  });
  it('mustEndsAtLeastInMinutes must ends before 5 minutes - 10 minutes in the past', async () => {
    const _10MinutesBefore = new Date();
    _10MinutesBefore.setMinutes(_10MinutesBefore.getMinutes() - 10);
    const minutesIntheFuture = 5;
    expect(
      () => {
        mustEndsAtLeastInMinutes(_10MinutesBefore, minutesIntheFuture);
      }
    ).toThrow(`Event must ends in at least ${minutesIntheFuture} minutes in the future`);
  });
  // eslint-disable-next-line jest/no-commented-out-tests
  /* it('mustEndsAtLeastInMinutes must ends before 5 minutes - 1 day in the past', async () => {
    const oneDayInThePast = new Date();
    oneDayInThePast.setDate(oneDayInThePast.getDay() - 2);
    const minutesIntheFuture = 5;
    expect(
      () => {
        mustEndsAtLeastInMinutes(oneDayInThePast, minutesIntheFuture);
      }
    ).toThrow(`Event must ends in at least ${minutesIntheFuture} minutes in the future`);
  }); */
  it('mustEndsAtLeastInMinutes must ends before 5 minutes - 1 month in the past', async () => {
    const oneMonthPast = new Date();
    oneMonthPast.setMonth(oneMonthPast.getMonth() - 1);
    const minutesIntheFuture = 5;
    expect(
      () => {
        mustEndsAtLeastInMinutes(oneMonthPast, minutesIntheFuture);
      }
    ).toThrow(`Event must ends in at least ${minutesIntheFuture} minutes in the future`);
  });
  it('mustEndsAtLeastInMinutes must ends before 5 minutes - 10 year in the past', async () => {
    const _10YearsBefore = new Date();
    _10YearsBefore.setFullYear(_10YearsBefore.getFullYear() - 10);
    const minutesIntheFuture = 5;
    expect(
      () => {
        mustEndsAtLeastInMinutes(_10YearsBefore, minutesIntheFuture);
      }
    ).toThrow(`Event must ends in at least ${minutesIntheFuture} minutes in the future`);
  });

  it('mustEndsAtLeastInMinutes validates same-hour minute threshold', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-26T10:00:00.000Z'));
    try {
      expect(
        () => {
          mustEndsAtLeastInMinutes(new Date('2026-06-26T10:03:00.000Z'), 5);
        }
      ).toThrow('Event must ends in at least 5 minutes in the future');
    } finally {
      jest.useRealTimers();
    }
  });
});
