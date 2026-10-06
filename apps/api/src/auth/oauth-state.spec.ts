import { oauthStateMatches } from '@aprendaufu/auth';

describe('oauthStateMatches', () => {
  it('aceita quando os valores sao iguais', () => {
    expect(oauthStateMatches('abc123', 'abc123')).toBe(true);
  });

  it('rejeita quando os valores diferem', () => {
    expect(oauthStateMatches('abc123', 'abc124')).toBe(false);
  });

  it('rejeita quando o tamanho difere', () => {
    expect(oauthStateMatches('abc', 'abc123')).toBe(false);
  });

  it('rejeita quando algum valor esta ausente', () => {
    expect(oauthStateMatches(undefined, 'abc123')).toBe(false);
    expect(oauthStateMatches('abc123', undefined)).toBe(false);
  });
});
