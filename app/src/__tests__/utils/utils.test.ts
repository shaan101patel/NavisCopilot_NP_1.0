import { cn } from '../../lib/utils';

describe('Utility Functions', () => {
  describe('cn (className utility)', () => {
    it('should combine class names correctly', () => {
      const result = cn('class1', 'class2', 'class3');
      expect(result).toBe('class1 class2 class3');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      const result = cn('base-class', isActive && 'active-class', 'always-present');
      expect(result).toBe('base-class active-class always-present');
    });

    it('should filter out falsy values', () => {
      const result = cn('class1', false, null, undefined, 'class2', 0, 'class3');
      expect(result).toBe('class1 class2 class3');
    });

    it('should handle empty strings', () => {
      const result = cn('class1', '', 'class2');
      expect(result).toBe('class1 class2');
    });

    it('should handle arrays of classes', () => {
      const result = cn('class1', ['class2', 'class3'], 'class4');
      expect(result).toBe('class1 class2 class3 class4');
    });

    it('should handle objects with boolean values', () => {
      const result = cn('base', {
        'active': true,
        'disabled': false,
        'highlighted': true
      });
      expect(result).toBe('base active highlighted');
    });

    it('should return empty string for no arguments', () => {
      const result = cn();
      expect(result).toBe('');
    });
  });
}); 