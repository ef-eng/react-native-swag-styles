import * as React from 'react';
import { StyleSheet } from 'react-native';
import { renderHook } from '@testing-library/react-hooks';

import { makeStyles } from '../index';

const styleSheetCreate = jest.spyOn(StyleSheet, 'create');

describe('makeStyles', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return useStyles hook', () => {
    const useStyles = makeStyles(() => ({
      underlayColor: '#333',
      container: {
        paddingTop: 24,
        paddingBottom: 32,
      },
    }));
    // styles should be lazily created
    expect(styleSheetCreate).not.toHaveBeenCalled();

    const { result } = renderHook(() => useStyles());
    expect(result.current).toMatchInlineSnapshot(`
      Object {
        "container": Object {
          "paddingBottom": 32,
          "paddingTop": 24,
        },
        "underlayColor": "#333",
      }
    `);
    expect(styleSheetCreate).toBeCalledTimes(1);
    expect(styleSheetCreate).toBeCalledWith({
      container: {
        paddingTop: 24,
        paddingBottom: 32,
      },
    });
  });

  it('should support prop', () => {
    const useStyles = makeStyles((small: boolean) => {
      const iconSize = small ? 16 : 24;
      return {
        icon: {
          width: iconSize,
          height: iconSize,
        },
      };
    });
    // styles should be lazily created
    expect(styleSheetCreate).not.toHaveBeenCalled();

    const { result, rerender } = renderHook((props) => useStyles(props), {
      initialProps: false,
    });
    expect(result.current).toMatchInlineSnapshot(`
      Object {
        "icon": Object {
          "height": 24,
          "width": 24,
        },
      }
    `);
    expect(styleSheetCreate).toBeCalledTimes(1);

    rerender(true);

    expect(result.current).toMatchInlineSnapshot(`
      Object {
        "icon": Object {
          "height": 16,
          "width": 16,
        },
      }
    `);
    expect(styleSheetCreate).toBeCalledTimes(2);
  });

  it('should memoize StyleSheet result', () => {
    const styleCallback = jest.fn();
    const useStyles = makeStyles((input: string) => {
      styleCallback(input);
      const iconSize = input === 'small' ? 16 : 24;
      return {
        size: input,
        icon: {
          width: iconSize,
          height: iconSize,
        },
        other: {
          paddingTop: 24,
        },
      };
    });
    // styles should be lazily created
    expect(styleCallback).not.toHaveBeenCalled();
    expect(styleSheetCreate).not.toHaveBeenCalled();

    const { result, rerender } = renderHook((props) => useStyles(props), {
      initialProps: 'small',
    });
    const smallResult = result.current;
    expect(styleCallback).lastCalledWith('small');
    expect(styleCallback).toBeCalledTimes(1);

    rerender('medium');
    const mediumResult = result.current;
    expect(styleCallback).lastCalledWith('medium');
    expect(styleCallback).toBeCalledTimes(2);

    // should use memoized result
    rerender('small');
    expect(result.current).toBe(smallResult);
    expect(styleCallback).lastCalledWith('medium');
    expect(styleCallback).toBeCalledTimes(2);

    // should create new styles
    rerender('large');
    const largeResult = result.current;
    expect(largeResult).not.toEqual(smallResult);
    expect(largeResult).not.toEqual(mediumResult);
    expect(styleCallback).lastCalledWith('large');
    expect(styleCallback).toBeCalledTimes(3);

    // should use memoized result
    rerender('medium');
    expect(result.current).toBe(mediumResult);
    rerender('small');
    expect(result.current).toBe(smallResult);
    rerender('large');
    expect(result.current).toBe(largeResult);

    // Result should be memoized, so only three StyleSheet.create calls
    expect(styleSheetCreate).toBeCalledTimes(3);
    expect(styleCallback).toBeCalledTimes(3);
  });

  it('should support hook and prop', () => {
    const CounterStepContext = React.createContext(1);
    const useStep = jest
      .fn()
      .mockImplementation(() => React.useContext(CounterStepContext));
    const useStyles = makeStyles(useStep, (step, small: boolean) => {
      const iconSize = small ? 16 : 24;
      return {
        step,
        icon: {
          width: iconSize,
          height: iconSize,
        },
      };
    });
    // styles should be lazily created
    expect(styleSheetCreate).not.toHaveBeenCalled();
    expect(useStep).not.toHaveBeenCalled();

    const { result, rerender } = renderHook(({ small }) => useStyles(small), {
      initialProps: {
        step: 2,
        small: false,
      },
      wrapper: ({ children, step }) => (
        <CounterStepContext.Provider value={step}>
          {children}
        </CounterStepContext.Provider>
      ),
    });
    expect(result.current).toMatchInlineSnapshot(`
      Object {
        "icon": Object {
          "height": 24,
          "width": 24,
        },
        "step": 2,
      }
    `);
    expect(styleSheetCreate).toBeCalledTimes(1);
    expect(useStep).toBeCalledTimes(1);

    rerender({ step: 3, small: true });

    expect(result.current).toMatchInlineSnapshot(`
      Object {
        "icon": Object {
          "height": 16,
          "width": 16,
        },
        "step": 3,
      }
    `);
    expect(styleSheetCreate).toBeCalledTimes(2);
    expect(useStep).toBeCalledTimes(2);

    rerender({ step: 3, small: false });

    expect(result.current).toMatchInlineSnapshot(`
      Object {
        "icon": Object {
          "height": 24,
          "width": 24,
        },
        "step": 3,
      }
    `);
    expect(styleSheetCreate).toBeCalledTimes(3);
    expect(useStep).toBeCalledTimes(3);

    rerender({ step: 2, small: false });

    // hooks should be called each time it renders
    expect(useStep).toBeCalledTimes(4);
    // should use memoized result
    expect(styleSheetCreate).toBeCalledTimes(3);
  });

  it('should support multiple hooks and props', () => {
    const AlphaContext = React.createContext('alpha');
    const BetaContext = React.createContext('beta');
    const useAlpha = () => React.useContext(AlphaContext);
    const useBeta = () => React.useContext(BetaContext);
    const useGamma = () => ({ flex: 1 });
    const useStyles = makeStyles(
      useAlpha,
      useBeta,
      useGamma,
      (alpha, beta, gamma, delta: string, epsilon: boolean, zeta: number) => ({
        alpha,
        beta: {
          color: beta,
        },
        gamma,
        delta: {
          backgroundColor: delta,
        },
        epsilon: {
          textAlign: epsilon ? 'left' : 'right',
        },
        zeta: {
          margin: zeta,
        },
      })
    );
    // styles should be lazily created
    expect(styleSheetCreate).not.toHaveBeenCalled();

    const { result, rerender } = renderHook(
      ({ delta, epsilon, zeta }) => useStyles(delta, epsilon, zeta),
      {
        initialProps: {
          alpha: 'a',
          beta: 'red',
          delta: 'yellow',
          epsilon: false,
          zeta: 40,
        },
        wrapper: ({ children, alpha, beta }) => (
          <AlphaContext.Provider value={alpha}>
            <BetaContext.Provider value={beta}>{children}</BetaContext.Provider>
          </AlphaContext.Provider>
        ),
      }
    );
    expect(result.current).toMatchInlineSnapshot(`
      Object {
        "alpha": "a",
        "beta": Object {
          "color": "red",
        },
        "delta": Object {
          "backgroundColor": "yellow",
        },
        "epsilon": Object {
          "textAlign": "right",
        },
        "gamma": Object {
          "flex": 1,
        },
        "zeta": Object {
          "margin": 40,
        },
      }
    `);
    expect(styleSheetCreate).toBeCalledTimes(1);

    rerender({
      alpha: 'al',
      beta: 'blue',
      delta: 'transparent',
      epsilon: true,
      zeta: 20,
    });

    expect(result.current).toMatchInlineSnapshot(`
      Object {
        "alpha": "al",
        "beta": Object {
          "color": "blue",
        },
        "delta": Object {
          "backgroundColor": "transparent",
        },
        "epsilon": Object {
          "textAlign": "left",
        },
        "gamma": Object {
          "flex": 1,
        },
        "zeta": Object {
          "margin": 20,
        },
      }
    `);
    expect(styleSheetCreate).toBeCalledTimes(2);

    // same as initial props
    rerender({
      alpha: 'a',
      beta: 'red',
      delta: 'yellow',
      epsilon: false,
      zeta: 40,
    });

    expect(styleSheetCreate).toBeCalledTimes(2);
  });
});
