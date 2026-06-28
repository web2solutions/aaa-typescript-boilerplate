import { DomainValidationError } from '@src/infra/exceptions';
import { DocumentValueObject } from '@src/modules/ddd/valueObjects/DocumentValueObject';
import { EDocumentType } from '@src/modules/ddd/valueObjects/EDocumentType';

describe('document value object', () => {
  it('should normalize payload and expose immutable primitives', () => {
    expect.hasAssertions();
    const value = new DocumentValueObject({
      type: EDocumentType.CPF,
      countryIssue: ' br ',
      data: ' 123.456.789-00 '
    });

    expect(value.type).toBe(EDocumentType.CPF);
    expect(value.countryIssue).toBe('BR');
    expect(value.data).toBe('123.456.789-00');
  });

  it('should support passport type normalization from uppercase input', () => {
    expect.hasAssertions();
    const value = new DocumentValueObject({
      type: 'PASSPORT',
      countryIssue: 'us',
      data: 'A1234567'
    });
    expect(value.type).toBe(EDocumentType.PASSPORT);
    expect(value.countryIssue).toBe('US');
  });

  it('should reject invalid type', () => {
    expect.hasAssertions();
    expect(() => new DocumentValueObject({
      type: 'INVALID',
      countryIssue: 'BR',
      data: '123'
    })).toThrow(DomainValidationError);
  });

  it('should reject empty type, countryIssue and data values', () => {
    expect.hasAssertions();
    expect(() => new DocumentValueObject({
      type: '',
      countryIssue: 'BR',
      data: '123'
    } as any)).toThrow('type can not be empty');

    expect(() => new DocumentValueObject({
      type: EDocumentType.CPF,
      countryIssue: '   ',
      data: '123'
    } as any)).toThrow('countryIssue can not be empty');

    expect(() => new DocumentValueObject({
      type: EDocumentType.CPF,
      countryIssue: 'BR',
      data: '   '
    } as any)).toThrow('data can not be empty');
  });

  it('should reject whitespace-only type after normalization', () => {
    expect.hasAssertions();
    expect(() => new DocumentValueObject({
      type: '   ',
      countryIssue: 'BR',
      data: '123'
    } as any)).toThrow('type can not be empty');
  });
});
