# Figma CSS Theme Generator

Figma plugin that generates CSS custom properties from your document's text and color styles.

## What does it do?

> **Figma Styles** ♻️ **CSS Custom Properties**

This plugin can **generate CSS custom properties** from your Figma document's color and text styles. It parses all the styles and generates a CSS stylesheet you can use in your CSS-based projects. This way you can take your design to code and remove a layer of translation between designers and developers.

## Development

This project uses Typescript and Webpack for compiling code to a production bundle.

### Getting Started

1. Install Figma plugin using `manifest.json` in project repo.
1. Install dependencies: `yarn`
1. Run Webpack in "watch" mode: `yarn dev`
1. Run the plugin in Figma

### Figma Guide

You can find more information about Figma's plugin setup here:

https://www.figma.com/plugin-docs/setup/

# Credits / Shoutout

- [Diez CLI](https://github.com/diez/diez/blob/7c224a3cb8d66262191da3aef12a1a4144bc39bc/src/extractors/extractors/src/extractors/figma.ts)
- [Figma Plugin DS](https://github.com/thomas-lowry/figma-plugin-ds) by @thomas-lowry
- [deepmerge](https://github.com/TehShrike/deepmerge)
