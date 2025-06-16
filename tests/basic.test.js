// Basic test to verify Jest is working correctly
// CommonJS format

/**
 * Basic test suite to verify Jest is working correctly
 */
describe('Basic test suite', () => {
  /**
   * Test basic arithmetic operations
   */
  test('basic arithmetic operations', () => {
    expect(1 + 1).toBe(2);
    expect(5 - 3).toBe(2);
    expect(2 * 3).toBe(6);
    expect(6 / 2).toBe(3);
  });

  /**
   * Test string operations
   */
  test('string operations', () => {
    expect('hello ' + 'world').toBe('hello world');
    expect('hello world'.split(' ')).toEqual(['hello', 'world']);
    expect('hello world'.toUpperCase()).toBe('HELLO WORLD');
  });

  /**
   * Test array operations
   */
  test('array operations', () => {
    const arr = [1, 2, 3];
    expect(arr.length).toBe(3);
    expect(arr.map(x => x * 2)).toEqual([2, 4, 6]);
    expect(arr.filter(x => x > 1)).toEqual([2, 3]);
  });

  /**
   * Test object operations
   */
  test('object operations', () => {
    const obj = { name: 'John', age: 30 };
    expect(obj.name).toBe('John');
    expect(obj.age).toBe(30);
    expect(Object.keys(obj)).toEqual(['name', 'age']);
  });

  /**
   * Test async operations
   */
  test('async operations', async () => {
    const promise = Promise.resolve('success');
    await expect(promise).resolves.toBe('success');
  });
});