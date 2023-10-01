# JSON Parser

[![JSON Parser Screenshot](https://github.com/vadym4che/json-parser/blob/main/screenshot.png)](https://vadym4che.github.io/json-parser/)

JSON Parser is a web application that allows you to parse and visualize JSON data. It provides a user-friendly interface to load JSON data from a file or paste it directly into the text area. You can then render the JSON data as HTML and copy it to your clipboard. This project is built with HTML, CSS, and JavaScript.

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [HTML and CSS](#html-and-css)
- [JavaScript](#javascript)
- [Usage](#usage)
- [Author](#author)

## Overview

JSON Parser is a handy tool for developers and data analysts who work with JSON data. It simplifies the process of parsing and visualizing JSON by offering the following features:

- Load JSON data from a file or paste it directly into the text area.
- Render the JSON data as HTML, making it easier to view and analyze.
- Copy the HTML representation of the JSON to your clipboard for easy sharing or embedding in documents.

You can try out the live demo [here](https://vadym4che.github.io/json-parser/).

## Project Structure

The project structure is minimal, consisting of the following files:

- `index.html`: The main HTML file that defines the structure of the web page.
- `style.css`: The CSS file that styles the web page for a user-friendly interface.
- `script.js`: The JavaScript file that handles the JSON parsing, rendering, and clipboard copy functionality.

## HTML and CSS

The HTML and CSS are designed to provide a clean and intuitive user interface. Notable elements and styles include:

- A JSON logo in the page title for visual representation.
- Input options for loading JSON from a file or pasting it into a text area.
- Stylish buttons for rendering JSON as HTML and copying HTML to the clipboard.
- Responsive design for both portrait and landscape orientations.
- Font family and weight detection for consistent rendering.

## JavaScript

The JavaScript code drives the core functionality of the JSON Parser:

- Parsing JSON data from a file or text area input.
- Finding and rendering specific JSON blocks.
- Extracting styles and font information from the JSON.
- Generating font links for Google Fonts integration.
- Copying the HTML representation of JSON to the clipboard.
- Handling user interactions and input validation.

## Usage

1. Open the JSON Parser web page.
2. Choose to load a JSON file or paste JSON data into the text area.
3. Click the "Render text-node from .json" button to visualize the JSON as HTML.
4. Click the "Copy HTML" button to copy the HTML to your clipboard.

Make sure to provide valid JSON data for accurate rendering.

## Author

(č) Vadym Chervoniak