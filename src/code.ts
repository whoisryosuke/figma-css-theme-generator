import Color from "tinycolor2";
import merge from "./utils/deepmerge";

/**
 * Loops through a nested object to set the last objects param or value
 *
 * @param obj
 * @param newValue
 * @param isKey
 */
function walkObject(obj: object, newValue: string, isKey: boolean = false) {
  const keys = Object.keys(obj);

  // If it's the top level, create first param
  if (keys.length === 0) {
    obj[newValue] = {};
  }

  // Loop through objects parameters
  keys.forEach(function (key, i) {
    // Only do the first for perf reasons
    if (i === 0) {
      let value = obj[key];

      // If it's an object, recursively run again
      const nestedKeys = Object.keys(value);
      if (typeof value === "object" && nestedKeys.length > 0) {
        walkObject(value, newValue, isKey);
      } else {
        // Set param or value of nested object
        if (isKey) {
          obj[key][newValue] = {};
        } else {
          obj[key] = newValue;
        }
      }
    }
  });

  return obj;
}

/**
 * Describes a Figma paint type retrieved from the Figma API.
 * @ignore
 */
const enum FigmaPaintType {
  Solid = "SOLID",
  GradientLinear = "GRADIENT_LINEAR",
}

type FigmaPaint = SolidPaint | GradientPaint | { type: unknown };

const isFigmaLinearGradient = (paint: FigmaPaint): paint is GradientPaint => {
  return paint.type === FigmaPaintType.GradientLinear;
};

const isFigmaSolid = (paint: FigmaPaint): paint is SolidPaint => {
  return paint.type === FigmaPaintType.Solid;
};
/**
 * Describes a Figma effect type retrieved from the Figma API.
 * @ignore
 */
const enum FigmaEffectType {
  DropShadow = "DROP_SHADOW",
}

type FigmaEffect = ShadowEffect | { type: unknown };

const isFigmaDropShadow = (effect: Effect): effect is ShadowEffect => {
  return effect.type === FigmaEffectType.DropShadow;
};

// This shows the HTML page in "ui.html".
figma.showUI(__html__);

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = async (msg) => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  if (msg.type === "generate") {
    let theme;
    try {
      theme = JSON.parse(msg.theme);
    } catch (e) {
      console.error("JSON parse failed", e);
    }
    // @TODO: Parse JSON and generate text and color styles
    const localTextStyles = figma.getLocalTextStyles();

    // if (!theme) return;

    // Parse text styles
    if (theme.text) {
      Object.keys(theme.text)?.map(async (name) => {
        const themeFont = theme.text[name];
        const localStyle = localTextStyles.find(
          ({ name: localName }) => localName === name
        );
        const textStyle = localStyle || figma.createTextStyle();
        const fontName = {
          family: theme.fonts[themeFont.fontFamily],
          style: themeFont.fontStyle ? themeFont.fontStyle : "Regular",
        };

        textStyle.name = name;
        // Load font
        await figma.loadFontAsync(fontName);
        textStyle.fontName = fontName;
        textStyle.fontSize = themeFont.fontSize;
        textStyle.letterSpacing = themeFont.letterSpacing;
        textStyle.lineHeight = themeFont.lineHeight;
        textStyle.textCase = themeFont.textTransform;
        textStyle.textDecoration = themeFont.textDecoration;
      });
    }

    const localColorStyles = figma.getLocalPaintStyles();

    function createFigmaColorStyle(themeObject) {
      Object.keys(themeObject)?.map((name) => {
        const themeColor = themeObject[name];

        // check if has nested colors
        if (typeof themeColor === "object") {
          const colorKeys = Object.keys(themeColor);
          return colorKeys.forEach((objProperty) => {
            const nestedKeys = Object.keys(objProperty);
            if (typeof objProperty === "object" && nestedKeys?.length > 0)
              return createFigmaColorStyle(themeColor);
          });
        } else {
          const localStyle = localColorStyles.find(
            ({ name: localName }) => localName === name
          );
          const colorStyle: PaintStyle = localStyle || figma.createPaintStyle();
          colorStyle.name = name;

          const convertedColor = Color(themeColor).toRgb();
          const { r, g, b, a } = convertedColor;
          const color: RGB = {
            r: Math.round(r / 255),
            g: Math.round(g / 255),
            b: Math.round(b / 255),
          };

          const paintStyle: SolidPaint = {
            type: "SOLID",
            color,
            opacity: a,
          };
          colorStyle.paints = [paintStyle];
        }
      });
    }

    // Parse color styles
    if (theme.colors) {
      createFigmaColorStyle(theme.colors);
    }
  }
  if (msg.type === "copy") {
    // Input flags to change parsing
    // e.g. we can change color from RGB to HEX
    const flagColorType: string = "hex";
    const flagLowercaseNames = true;
    const namespace = msg.namespace ? msg.namespace : "spky";

    // Get text styles to generate text variants
    const textStyles = figma.getLocalTextStyles();

    // Parse font sizes
    // Create array of font sizes and sort numerically by least to most
    const fontSizesWithDupes = textStyles
      .map(({ fontSize }) => fontSize)
      .sort((a, b) => a - b);
    // Remove dupes
    const fontSizes = fontSizesWithDupes
      .filter((item, index) => fontSizesWithDupes.indexOf(item) == index)
      .map((item, index) => `--${namespace}-font-sizes-${index}: ${item}px;`);

    // Parse font families
    // Create array of font sizes and sort numerically by least to most
    const fontFamiliesWithDupes = textStyles.map(
      ({ fontName }) => fontName!.family
    );
    const fontFamilies = fontFamiliesWithDupes
      .filter((item, index) => fontFamiliesWithDupes.indexOf(item) == index)
      .sort()
      .map(
        (item) => `--${namespace}-font-family-${item.toLowerCase()}: ${item};`
      );

    // Grab index of font size
    function getFontSize(fontSize) {
      let fontIndex;
      fontSizes.filter((fontSizeValue, index) => {
        if (fontSizeValue === fontSize) fontIndex = index;
      });
      return parseInt(fontIndex);
    }

    // Parse text variants
    const textVariants = textStyles
      .map(
        ({
          name,
          fontName,
          fontSize,
          letterSpacing,
          lineHeight,
          textCase,
          textDecoration,
        }) => ({
          name,
          fontFamily: `${fontName!.family.toLowerCase()}`,
          fontWeight: fontName.style,
          fontSize: getFontSize(fontSize),
          letterSpacing,
          lineHeight,
          textCase,
          textDecoration,
        })
      )
      .reduce((map, obj) => {
        map[obj.name.replace("/", ".").toLowerCase()] = obj;
        return map;
      }, {});

    // Get colors
    const colors = figma.getLocalPaintStyles();

    // Create container for parsed colors
    let finalColors = [];

    // Loop through colors and convert Figma API to theme/CSS format
    colors.map(({ paints, type, remote, name }) => {
      // Parse name from Figma slash `/` to object `.`
      let filteredName = name;
      if (flagLowercaseNames) filteredName = filteredName.toLowerCase();
      const colorName = filteredName.replace("/", "-");

      // Parse Figma Paint API to CSS color properties
      paints?.forEach((paint) => {
        if (isFigmaLinearGradient(paint)) {
          // @TODO: Add to gradient section
          // @TODO: Maybe do this last and then use color values if possible?
        }
        if (isFigmaSolid(paint)) {
          // Add to colors section
          const { r, g, b } = paint.color;
          let newColor = `rgba (${Math.round(r * 255)}, ${Math.round(
            g * 255
          )}, ${Math.round(b * 255)}, ${paint.opacity})`;
          // Convert optionally to other values
          switch (flagColorType) {
            case "hex":
              newColor = Color(newColor).toHexString();
              break;
            case "rgba":
              newColor = Color(newColor).toRgbString();
              break;
            case "hsl":
              newColor = Color(newColor).toHslString();
              break;
            default:
              newColor = Color(newColor).toHexString();
              break;
          }
          // Add to last nested object parameter
          finalColors.push(`--${namespace}-colors-${colorName}: ${newColor};`);
        }
      });
    });

    const theme = {
      fontSizes,
      fonts: fontFamilies,
      text: textVariants,
      colors: finalColors,
    };

    const combineCSS = [...fontSizes, ...fontFamilies, ...finalColors];

    const finalCSS = combineCSS.join("\n");

    figma.ui.postMessage(finalCSS);
  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  // figma.closePlugin();
};
