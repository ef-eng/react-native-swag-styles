import * as React from 'react';
import { Button, View, Text, useWindowDimensions } from 'react-native';
import { makeStyles } from 'react-native-swag-styles';

import { useAppTheme } from './AppTheme';

export const Example = () => {
  const [toggle, setToggle] = React.useState<boolean>(false);
  const styles = useStyles(toggle);

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.text}>Box 1</Text>
        <Button
          title="Press Me"
          color={styles.buttonColor}
          onPress={() => setToggle((t) => !t)}
        />
      </View>
      <View style={styles.box}>
        <Text style={styles.text}>Box 2</Text>
      </View>
    </View>
  );
};

const useStyles = makeStyles(
  useAppTheme,
  useWindowDimensions,
  /**
   * @param theme from `useAppTheme`
   * @param dimensions from `useWindowDimensions`
   * @param toggle from argument of `useStyles`
   */
  (theme, { width, height }, toggle: boolean) => ({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.bgColor,
    },
    box: {
      width: Math.min(400, width),
      height: height / 2 - 40,
      marginVertical: 20,
      backgroundColor: '#666',
    },
    text: {
      textAlign: 'center',
      color: theme.fgColor,
    },
    buttonColor: toggle ? '#F00' : '#0F0',
  })
);
