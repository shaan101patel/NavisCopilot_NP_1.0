describe('Simple Test', () => {
  it('should pass', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle basic operations', () => {
    expect(2 * 3).toBe(6);
    expect(10 - 5).toBe(5);
    expect(15 / 3).toBe(5);
  });
});

// Make this file a module
export {}; 