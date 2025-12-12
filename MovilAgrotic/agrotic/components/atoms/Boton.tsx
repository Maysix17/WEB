import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ButtonProps } from '../../types/General/Button.types';

const Boton: React.FC<ButtonProps> = ({
  label,
  text,
  children,
  onClick,
  disabled = false,
  color = "success",
  variant = "solid",
  type = "button",
  className,
  ariaLabel,
  size = "md"
}) => {
  // Determine the button content
  const buttonContent = label || text || children;

  // Get styles based on props
  const buttonStyle = getButtonStyle(color, variant, size, disabled);
  const textStyle = getTextStyle(color, variant, disabled);

  return (
    <TouchableOpacity
      style={[styles.button, buttonStyle]}
      onPress={disabled ? undefined : onClick}
      disabled={disabled}
      accessibilityLabel={ariaLabel}
    >
      <Text style={[styles.buttonText, textStyle]}>{buttonContent}</Text>
    </TouchableOpacity>
  );
};

const getButtonStyle = (color: string, variant: string, size: string, disabled: boolean) => {
  let backgroundColor = '#22c55e'; // success default
  let borderColor = 'transparent';
  let borderWidth = 0;

  // Color mapping
  switch (color) {
    case 'primary':
      backgroundColor = '#3b82f6';
      break;
    case 'secondary':
      backgroundColor = '#6b7280';
      break;
    case 'warning':
      backgroundColor = '#f59e0b';
      break;
    case 'danger':
      backgroundColor = '#ef4444';
      break;
    case 'success':
    default:
      backgroundColor = '#066839';
      break;
  }

  // Variant
  switch (variant) {
    case 'bordered':
      borderColor = backgroundColor;
      borderWidth = 1;
      backgroundColor = 'transparent';
      break;
    case 'light':
      backgroundColor = `${backgroundColor}20`; // 20% opacity
      break;
    case 'flat':
      backgroundColor = 'transparent';
      break;
    case 'faded':
      backgroundColor = `${backgroundColor}40`; // 40% opacity
      break;
    case 'ghost':
      backgroundColor = 'transparent';
      borderColor = backgroundColor;
      borderWidth = 1;
      break;
    case 'shadow':
      // Keep solid with shadow
      break;
    case 'solid':
    default:
      // Keep solid
      break;
  }

  if (disabled) {
    backgroundColor = '#d1d5db';
    borderColor = 'transparent';
    borderWidth = 0;
  }

  // Size
  let paddingVertical =10
  let paddingHorizontal = 20;
  let fontSize = 12;

  switch (size) {
    case 'sm':
      paddingVertical = 8;
      paddingHorizontal = 16;
      fontSize = 14;
      break;
    case 'lg':
      paddingVertical = 10;
      paddingHorizontal = 32;
      fontSize = 16;
      break;
    case 'md':
    default:
      break;
  }

  return {
    backgroundColor,
    borderColor,
    borderWidth,
    paddingVertical,
    paddingHorizontal,
  };
};

const getTextStyle = (color: string, variant: string, disabled: boolean) => {
  let textColor = '#ffffff';

  if (variant === 'bordered' || variant === 'ghost') {
    switch (color) {
      case 'primary':
        textColor = '#3b82f6';
        break;
      case 'secondary':
        textColor = '#6b7280';
        break;
      case 'warning':
        textColor = '#f59e0b';
        break;
      case 'danger':
        textColor = '#ef4444';
        break;
      case 'success':
      default:
        textColor = '#22c55e';
        break;
    }
  }

  if (disabled) {
    textColor = '#9ca3af';
  }

  return {
    color: textColor,
  };
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    alignSelf: 'stretch',
  },
  buttonText: {
    fontWeight: 'bold',
  },
});

export default Boton;