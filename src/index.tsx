import * as React from 'react';
import { ViewStyle, TextStyle, ImageStyle, StyleSheet } from 'react-native';
import memoize from 'fast-memoize';

type StyleValue = ViewStyle | TextStyle | ImageStyle;
type StyleConstant = number | string | boolean;

export type NamedStyles<T> = {
  [P in keyof T]: StyleValue | StyleConstant;
};

export type UseStyles<T, P extends Array<unknown> = []> = (
  ...args: P
) => Readonly<T>;

interface MakeStyles {
  <T extends NamedStyles<T>, P extends Array<unknown>>(
    definition: (...args: P) => T | NamedStyles<T>
  ): UseStyles<T, P>;
  <T extends NamedStyles<T>, H, P extends Array<unknown>>(
    useHook: () => H,
    definition: (...args: [H, ...P]) => T | NamedStyles<T>
  ): UseStyles<T, P>;
  <T extends NamedStyles<T>, H1, H2, P extends Array<unknown>>(
    useHook1: () => H1,
    useHook2: () => H2,
    definition: (...args: [H1, H2, ...P]) => T | NamedStyles<T>
  ): UseStyles<T, P>;
  <T extends NamedStyles<T>, H1, H2, H3, P extends Array<unknown>>(
    useHook1: () => H1,
    useHook2: () => H2,
    useHook3: () => H3,
    definition: (...args: [H1, H2, H3, ...P]) => T | NamedStyles<T>
  ): UseStyles<T, P>;
  <T extends NamedStyles<T>, H1, H2, H3, H4, P extends Array<unknown>>(
    useHook1: () => H1,
    useHook2: () => H2,
    useHook3: () => H3,
    useHook4: () => H4,
    definition: (...args: [H1, H2, H3, H4, ...P]) => T | NamedStyles<T>
  ): UseStyles<T, P>;
  // add more here if we need more arguments
}

/**
 * Create a `useStyles` hook from any number of hooks and
 * a StyleSheet creator function
 *
 * *Note:* this method has to be called statically (outside render functions)
 */
export const makeStyles: MakeStyles = (
  // Strict type is declared above
  ...args: ReadonlyArray<any>
) => {
  const definition = args[args.length - 1];
  const hooks = args.slice(0, args.length - 1);
  const memoCreateStyles = memoize(
    (...memoArgs) => {
      const styleSheet = definition(...memoArgs);
      return createStyleSheet(styleSheet);
    },
    // support variable number of arguments
    { strategy: memoize.strategies.variadic }
  );
  return (...props: ReadonlyArray<unknown>) => {
    const states = hooks.map((hook) => hook());
    return React.useMemo(
      () => memoCreateStyles(...states, ...props),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [...states, ...props]
    );
  };
};

/**
 * Create a StyleSheet from given object with support for constant values
 */
export const createStyleSheet = <T extends NamedStyles<T>>(
  definition: T | NamedStyles<T>
): Readonly<T> => {
  // filter constant values
  const filteredStyleSheet = Object.entries<StyleValue | StyleConstant>(
    definition
  ).reduce<Record<string, StyleValue>>(
    (obj, [key, value]) =>
      isStyle(value) ? Object.assign(obj, { [key]: value }) : obj,
    {}
  );
  return {
    ...definition,
    ...StyleSheet.create(filteredStyleSheet),
  } as T;
};

const isStyle = (s: StyleValue | StyleConstant): s is StyleValue =>
  typeof s === 'object';

interface WithStylesRenderFunction<T, P = object> {
  (props: React.PropsWithChildren<P>, styles: T): React.ReactElement | null;
  displayName?: string;
}

/**
 * Convenient higher-order component for attaching `useStyles` hook to components
 */
export const connectStyles =
  <T extends NamedStyles<T>>(useStyles: UseStyles<T>) =>
  <P extends object>(
    render: WithStylesRenderFunction<T, P>
  ): React.ComponentType<P> => {
    const WrappedComponent = (props: P) => {
      const styles = useStyles();
      return render(props, styles);
    };
    WrappedComponent.displayName = `withStyles(${
      render.displayName || render.name || 'Component'
    })`;
    return WrappedComponent;
  };
