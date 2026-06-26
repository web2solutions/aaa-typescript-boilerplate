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
});
