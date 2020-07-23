# Styled Theme Generator

Figma plugin that generates a CSS in JS theme from your document's text and color styles, or lets you import a theme to generate Figma styles.

## What does it do?

> **Figma Styles** ♻️ **CSS in JS Theme**

This plugin can **generate a CSS in JS theme file** (according to [the System UI specification](https://system-ui.com/theme)) from your Figma document's color and text styles. It parses all the styles and generates a JSON object you can use in your CSS in JS theme file. This way you can take your design to code and remove a layer of translation between designers and developers.

This plugin can **generate Figma styles** from a CSS in JS theme file. It makes it easy to import pre-existing themes from CSS in JS libraries, eliminate the boilerplate of setting up a Figma style guide, and get to prototyping faster.

## Development

This project uses Typescript and VSCode's built-in "watch" mode that compiles Typescript files according to the `tsconfig.json`.

> If you're not using VSCode, you will have to run the Typescript build command on watch mode manually.

### Getting Started

1. Install dependencies: `yarn` or `npm i`
2. `yarn dev`

### Figma Guide

You can find more information about Figma's plugin setup here:

https://www.figma.com/plugin-docs/setup/

# Credits / Shoutout

- [Diez CLI](https://github.com/diez/diez/blob/7c224a3cb8d66262191da3aef12a1a4144bc39bc/src/extractors/extractors/src/extractors/figma.ts)
- [Figma Plugin DS](https://github.com/thomas-lowry/figma-plugin-ds) by @thomas-lowry
- [deepmerge](https://github.com/TehShrike/deepmerge)
