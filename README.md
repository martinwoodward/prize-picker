<p align="center">
    <img alt="Random Name Picker for Lucky Draw" src="./logo.svg" width="100" />
</p>

# Random Name Picker for GitHub prize draws!

:pray: First, huge shout-out to [@icelam](https://github.com/icelam) for a great and simple name picker we could fork and use for the GitHub booth!

:rocket: This site is deployed to GitHub Pages using GitHub Actions. The Actions workflow pulls entrants from commenters of a GitHub Issue.

🎫 To enter the draw (if there is one currently running), please head to the issues tab, and select the issue for the raffle you want to enter. Leave a comment to enter. 

### Instructions for running a raffle

If you are a Hubber who wants to use this for prize draws, please see the instructions on the [GitHub IRL repo](https://github.com/github/IRL/blob/main/event-guides/how-to-run-a-raffle.md)

Below is the original README:

---

<h1 align="center">Random Name Picker for Lucky Draw</h1>
<p align="center">
    Simple HTML5 random name picker for picking lucky draw winner using Web Animations and AudioContext API
</p>

<p align="center">
    <a href="https://www.typescriptlang.org/"><img height="20" src="https://img.shields.io/badge/built_with-TypeScript-007acc.svg?logo=typescript" alt="Built with TypeScript"></a>
    <a href="https://nodejs.org/en/"><img height="20" src="https://img.shields.io/badge/Node.js-12-026e00.svg?logo=Node.js" alt="Node.js"></a>
    <a href="https://yarnpkg.com/"><img height="20" src="https://img.shields.io/badge/Yarn-1-25799f.svg?logo=Yarn" alt="Yarn"></a>
    <a href="https://eslint.org/"><img height="20" src="https://img.shields.io/badge/code_style-ESLint-5b5be0.svg?logo=eslint" alt="Code Style"></a>
    <a href="https://conventionalcommits.org"><img height="20" src="https://img.shields.io/badge/conventional_commits-1.0.0-yellow.svg" alt="Conventional Commits"></a>
    <a href="./LICENSE"><img height="20" src="https://img.shields.io/github/license/icelam/random-name-picker?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAEFCu8CAAAABGdBTUEAALGPC/xhBQAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAHKADAAQAAAABAAAAHAAAAABHddaYAAAC5UlEQVRIDd2WPWtVQRCGby5pVASLiGghQSxyG8Ui2KWwCfkH9olY2JneQkiR0oCIxH/gB+qVFDYBIWBAbAIRSbCRpLXwIxLiPT7vnNm9e87ZxJtUwYH3zO47Mzv7Mbv3tlo5KYriGtgAJ81OY1ENdG/YI4boFEOI911BXgY/pdtwGuAtXpvmB1tAXHDnUolE5urkPOQo6MqA3pXWmJJL4Bb4rQ7yEYfxsjnIF29NJIoNC6e5fxOL/qN+9KCz7AaLpN8zI415N2i2EptpGrkRIjGeAuvR6IY1hSFLFUOug9Ms2M7ZxIUNytm1mnME186sdI2BOCwAyQMg54ugzSmKmwbPwSbolKH+hbAtQdsOoF+BsF3anUVwBdiOWRidFZDKTTrKEAJTm3GVrGkHzw/uPZbyx7DNNLfB7KGmRsCcr+/gjaiPSpAOTyX9qG4L/XBDdWXDDf1M+wtQ5fwCOtcb4Dto6VpLmzByB6gqdHbTItGSJdAGqibJQhmRfCF7IN4beSF2G9CqnGXQrxofXU+EykllNeoczRgYytDKMubDIRK0g5MF8rE69cGu0u9nlUcqaUZ41W0qK2nGcSzr4D2wV9U9wxp1rnpxn8agXAOHMQ9cy9kbHM7ngY4gFb03TxrO/yfBUifTtXt78jCrjY/jgEFnMn45LuNWUtknuu7NSm7D3QEn3HbatV1Q2jvgIRf1sfODKQaeymxZoMLlTqsq1LF+HvaTqQOzEzUCfni0/eNIA+DfuE3KEtbsegckGmMktTXacnBHPVe687ugkpT+axCkkhBSyRSjWI2xf1KMMVmYiQdWksK9BEFiQoiYLIlvJA3/zeTzCejP0RbB6YPbhZuB+0pR3KcdX0LaJtju0ZgBL8Bd+sbz2QIaU2OfBX3BaQLsgZysQtrk0M8Sh1A0w3DyyYnGnAiZ4gqZ/TvI2A8OGd1YIbF7+F3P+B6dYpYdsJNZgrjO0UdOIhmom0nwL0pnfnzkL1803jAoKhvyAAAAAElFTkSuQmCC" alt="License"></a>
    <a href="https://lgtm.com/projects/g/icelam/random-name-picker/context:javascript"><img alt="Language grade: JavaScript" src="https://img.shields.io/lgtm/grade/javascript/g/icelam/random-name-picker.svg?logo=lgtm&logoWidth=18"/></a>
    <a href="https://github.com/icelam/random-name-picker/releases"><img alt="Current version" src="https://img.shields.io/github/v/release/icelam/random-name-picker.svg?sort=semver&label=latest&logo=github"/></a>
</p>

## Live Demo
Demo is available at [https://pinkylam.me/playground/random-name-picker](https://pinkylam.me/playground/random-name-picker)

### Technology Stack
* Pug
* CSS3 (SCSS)
* Web Animations API
* AudioContext API

## Development

### Prerequisite
* Node 12 or nvm installed
* Yarn installed

### Install dependencies
To install dependencies:
```bash
yarn install
```

### Start development server
To start the development server:
```bash
yarn start
```

### Build production
To build the project for production:
```bash
yarn build
```
All the build files can be found in `/dist` folder.

## Cache Busting

This project implements automatic cache busting to ensure users receive updates immediately after deployment:

### How It Works
- **Automatic timestamps**: Build timestamp updates before each `yarn build`
- **Content hashing**: JS/CSS files get unique hashes (`[name].[chunkhash:8].js`)
- **Service worker**: Unique cache IDs per build with automatic cleanup
- **HTML meta tags**: Prevent HTML caching with cache-control headers

### Environment Variables
- `APP_VERSION`: Semantic version for cache identification  
- `APP_BUILD_TIMESTAMP`: Unix timestamp updated automatically on each build

When you run `yarn build`, the system automatically ensures browsers load the latest version while maintaining optimal performance for unchanged assets.
