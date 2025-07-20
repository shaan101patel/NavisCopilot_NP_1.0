# Testing Guide

This directory contains unit tests for the Navis Copilot frontend application.

## Test Structure

```
src/__tests__/
├── components/          # Component tests
├── hooks/              # Custom hook tests
├── services/           # Service/API tests
└── utils/              # Utility function tests
```

## Running Tests

### Quick Tests
```bash
npm test                 # Run tests in watch mode
npm run test:watch       # Run tests in watch mode (same as npm test)
npm run test:coverage    # Run tests with coverage report
npm run test:ci          # Run tests for CI (no watch, with coverage)
```

### Test Commands
- `npm test` - Run tests in watch mode (interactive)
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report
- `npm run test:ci` - Run tests for continuous integration

## Writing Tests

### Component Tests
- Use `@testing-library/react` for rendering and interactions
- Test user interactions (clicks, form submissions, etc.)
- Test accessibility features
- Mock external dependencies

### Hook Tests
- Use `@testing-library/react-hooks` for testing custom hooks
- Test state changes and side effects
- Mock browser APIs (localStorage, matchMedia, etc.)

### Service Tests
- Mock external API calls
- Test error handling
- Test success scenarios
- Use Jest mocks for Supabase client

### Utility Tests
- Test pure functions
- Test edge cases
- Test input validation

## Test Coverage

The project aims for 70% test coverage across:
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the code does, not how it does it
2. **Use Descriptive Test Names**: Test names should clearly describe what is being tested
3. **Arrange-Act-Assert**: Structure tests with clear sections
4. **Mock External Dependencies**: Don't test third-party libraries
5. **Test Edge Cases**: Include tests for error conditions and boundary values
6. **Keep Tests Simple**: Each test should test one thing
7. **Use Meaningful Assertions**: Make assertions that clearly show what you're testing

## Example Test Structure

```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup mocks and test data
  });

  it('should render correctly', () => {
    // Arrange
    const props = { /* test props */ };
    
    // Act
    render(<ComponentName {...props} />);
    
    // Assert
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interactions', () => {
    // Arrange
    const mockHandler = jest.fn();
    
    // Act
    fireEvent.click(screen.getByRole('button'));
    
    // Assert
    expect(mockHandler).toHaveBeenCalled();
  });
});
```

## Mocking Guidelines

### Supabase Client
```typescript
jest.mock('../../services/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      // ... other methods
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      // ... other methods
    })),
  },
}));
```

### Browser APIs
```typescript
// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
```

## Troubleshooting

### Common Issues

1. **Tests failing due to missing mocks**: Ensure all external dependencies are properly mocked
2. **Async test failures**: Use `waitFor` or `act` for async operations
3. **Component not rendering**: Check if all required props are provided
4. **Hook test failures**: Ensure hooks are called within React components or use `renderHook`

### Debugging Tests

- Use `console.log` in tests for debugging
- Run tests with `--verbose` flag for more output
- Use `--runInBand` to run tests sequentially
- Check coverage report for untested code paths 