import { StyleSheet } from 'react-native';

import { createStyleSheet } from '../index';

const styleSheetCreate = jest.spyOn(StyleSheet, 'create');

describe('createStyleSheet', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create StyleSheet', () => {
    styleSheetCreate.mockReturnValueOnce({
      container: 1,
      strikethrough: 2,
      empty: 3,
    } as any);
    const styles = createStyleSheet({
      underlayColor: '#333',
      container: {
        paddingTop: 24,
        paddingBottom: 32,
      },
      someBoolean: false,
      strikethrough: {
        textDecorationLine: 'line-through',
      },
      empty: {},
      size: 32,
    });
    expect(styles).toMatchInlineSnapshot(`
      Object {
        "container": 1,
        "empty": 3,
        "size": 32,
        "someBoolean": false,
        "strikethrough": 2,
        "underlayColor": "#333",
      }
    `);
    expect(styleSheetCreate).toHaveBeenCalledTimes(1);
  });

  it('should work with empty input', () => {
    const styles = createStyleSheet({});
    expect(styles).toMatchInlineSnapshot(`Object {}`);
    expect(styleSheetCreate).toHaveBeenCalledTimes(1);
  });

  it('should throw if style does not conform to StyleSheet', () => {
    expect(() =>
      createStyleSheet({
        underlayColor: '#333',
        container: {
          color: 'bar',
        },
        empty: {},
        size: 32,
      })
    ).toThrowError();
  });
});
