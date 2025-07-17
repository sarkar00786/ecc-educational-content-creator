import { describe, it, expect } from 'vitest';
import { 
  validateEmail, 
  validatePassword, 
  validateContentInput, 
  sanitizeInput 
} from '../../utils/validation';

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
      expect(validateEmail('x@y.z')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
      expect(validateEmail(null)).toBe(false);
      expect(validateEmail(undefined)).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      expect(validatePassword('Password123!')).toBe(true);
      expect(validatePassword('MySecure@Pass1')).toBe(true);
    });

    it('should reject weak passwords', () => {
      expect(validatePassword('12345')).toBe(false); // too short
      expect(validatePassword('password')).toBe(false); // no uppercase/numbers
      expect(validatePassword('PASSWORD')).toBe(false); // no lowercase/numbers
      expect(validatePassword('Password')).toBe(false); // no numbers/special chars
      expect(validatePassword('')).toBe(false);
      expect(validatePassword(null)).toBe(false);
    });
  });

  describe('validateContentInput', () => {
    it('should validate proper content inputs', () => {
      const validInput = {
        bookContent: 'Sample content for testing',
        audienceClass: 'Grade 5',
        audienceAge: '10-11',
        audienceRegion: 'United States'
      };
      expect(validateContentInput(validInput)).toBe(true);
    });

    it('should reject incomplete content inputs', () => {
      expect(validateContentInput({})).toBe(false);
      expect(validateContentInput({ bookContent: '' })).toBe(false);
      expect(validateContentInput({ 
        bookContent: 'Content', 
        audienceClass: '', 
        audienceAge: '10', 
        audienceRegion: 'US' 
      })).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(validateContentInput(null)).toBe(false);
      expect(validateContentInput(undefined)).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should remove dangerous HTML tags', () => {
      expect(sanitizeInput('<script>alert("xss")</script>Hello'))
        .toBe('Hello');
      expect(sanitizeInput('<img src="x" onerror="alert(1)">'))
        .toBe('');
    });

    it('should preserve safe content', () => {
      expect(sanitizeInput('Hello World')).toBe('Hello World');
      expect(sanitizeInput('Test with numbers 123')).toBe('Test with numbers 123');
    });

    it('should handle special characters safely', () => {
      expect(sanitizeInput('Math: 2 < 3 > 1')).toBe('Math: 2 &lt; 3 &gt; 1');
      expect(sanitizeInput('Quote: "Hello"')).toBe('Quote: &quot;Hello&quot;');
    });
  });
});
