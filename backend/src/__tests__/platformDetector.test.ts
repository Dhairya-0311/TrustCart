import { detectPlatform } from '../utils/platformDetector';

describe('platformDetector', () => {
  it('detects Amazon India', () => {
    const result = detectPlatform('https://www.amazon.in/dp/B08N5WRWNW');
    expect(result.isValid).toBe(true);
    expect(result.platform).toBe('AMAZON');
  });

  it('detects Flipkart', () => {
    const result = detectPlatform('https://www.flipkart.com/some-product/p/itm123');
    expect(result.isValid).toBe(true);
    expect(result.platform).toBe('FLIPKART');
  });

  it('detects Myntra', () => {
    const result = detectPlatform('https://www.myntra.com/t-shirt/12345');
    expect(result.isValid).toBe(true);
    expect(result.platform).toBe('MYNTRA');
  });

  it('detects Meesho', () => {
    const result = detectPlatform('https://www.meesho.com/product/12345');
    expect(result.isValid).toBe(true);
    expect(result.platform).toBe('MEESHO');
  });

  it('detects Nykaa', () => {
    const result = detectPlatform('https://www.nykaa.com/product/12345');
    expect(result.isValid).toBe(true);
    expect(result.platform).toBe('NYKAA');
  });

  it('rejects unsupported domains', () => {
    const result = detectPlatform('https://www.ebay.com/itm/12345');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects invalid URLs', () => {
    const result = detectPlatform('not-a-url');
    expect(result.isValid).toBe(false);
  });

  it('rejects empty string', () => {
    const result = detectPlatform('');
    expect(result.isValid).toBe(false);
  });
});
