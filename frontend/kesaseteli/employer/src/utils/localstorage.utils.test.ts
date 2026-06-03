import { clearLocalStorage } from './localstorage.utils';

describe('clearLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('clears all of localStorage if no prefix is supplied', () => {
    localStorage.setItem('key1', 'val1');
    localStorage.setItem('key2', 'val2');
    clearLocalStorage();
    expect(localStorage).toHaveLength(0);
  });

  it('clears only items matching the prefix', () => {
    localStorage.setItem('prefix-key1', 'val1');
    localStorage.setItem('other-key2', 'val2');
    clearLocalStorage('prefix-');
    expect(localStorage.getItem('prefix-key1')).toBeNull();
    expect(localStorage.getItem('other-key2')).toBe('val2');
  });
});
