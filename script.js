// Function to load and parse the JSON file
function loadJSONFile(file, callback) {
  const reader = new FileReader();

  reader.onload = function (event) {
    try {
      const rawJSON = String.raw`${event.target.result}`;
      const json = JSON.parse(rawJSON);
      callback(null, json);
    } catch (error) {
      callback(error);
    }
  };

  reader.readAsText(file);
}

// Function to find a block by ID in a nested JSON object
function findBlockByID(json, id) {
  if (json.id === id) {
    return json;
  }

  for (const key in json) {
    if (typeof json[key] === 'object') {
      const foundBlock = findBlockByID(json[key], id);
      if (foundBlock) {
        return foundBlock;
      }
    }
  }

  return null;
}

// Function to find data by key in a nested JSON object
function findDataByKey(json, key) {
  const result = [];

  function search(obj, key) {
    if (typeof obj === 'object') {
      if (Array.isArray(obj)) {
        obj.forEach((item) => {
          search(item, key);
        });
      } else {
        for (const prop in obj) {
          if (prop === key) {
            result.push(obj[prop]);
          } else {
            search(obj[prop], key);
          }
        }
      }
    }
  }

  search(json, key);
  return result;
}

function getKebabFromCamel(camel) {
  return camel.split('').map((l) => l === l.toLowerCase() ? l : '-' + l.toLowerCase()).join('');
}

function getValidRGBA({ r, g, b, a }, opacity = 1) {
  const roundedAlpha = Math.round(opacity * 100) / 100; // Round the alpha channel value to two decimal places
  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${roundedAlpha})`;
}

function getColorFromFills(fillsArr) {
  const opacity = fillsArr[0].opacity;

  return getValidRGBA(fillsArr[0].color, opacity);
}

function getInlineStylesFromObject(obj) {
  let inline = '';
  Object.keys(obj).forEach((k) => {
    if (
      !(k === 'fontFamily' ||
      k === 'fontPostScriptName' ||
      k === 'paragraphSpacing' ||
      k === 'textAutoResize' ||
      k === 'textAlignHorizontal' ||
      k === 'textAlignVertical' ||
      k === 'lineHeightPercent' ||
      k === 'lineHeightUnit' ||
      k === 'whiteSpace')
    ) {
      if (k === 'fills') {
        inline += ' color: ' + getColorFromFills(obj[k]) + ';';
      } else if (k === 'fontWeight') {
        inline += ' ' + getKebabFromCamel(k) + ': ' + obj[k] + ';';
      } else if (k === 'fontSize' || k === 'letterSpacing') {
        inline += ' ' + getKebabFromCamel(k) + ': ' + obj[k] + 'px;';
      } else if (k === 'lineHeightPx') {
        inline += ' ' + getKebabFromCamel(k).slice(0, -3) + ': ' + obj[k] + 'px;';
      } else if (k === 'italic') {
        inline += ' font-tyle: ' + obj[k] + ';';
      } else if (k === 'textDecoration') {
        if (obj[k] === 'STRIKETHROUGH') {
          inline += ' ' + getKebabFromCamel(k) + ': ' + 'line-through;';
        } else {
          inline += ' ' + getKebabFromCamel(k) + ': ' + obj[k].toLowerCase() + ';';
        }
      } else {
        inline += ' ' + getKebabFromCamel(k) + ': ' + obj[k] + ';';
      }
    }
  });

  return inline;
}

function transformStyleObjectToInlineStyles(obj) {
  const transformedObj = {};

  for (const key in obj) {
    const value = obj[key];
    transformedObj[key] = getInlineStylesFromObject(value);
  }

  return transformedObj;
}

const raw = (string) => String.raw`${string}`;

function extractFontFamiliesAndWeights(styles) {
  const fontData = {};

  Object.values(styles).forEach(style => {
    const { fontFamily, fontWeight } = style;

    if (fontFamily) {
      if (!fontData[fontFamily]) {
        fontData[fontFamily] = new Set();
      }

      if (fontWeight) {
        fontData[fontFamily].add(fontWeight.toString());
      }
    }
  });

  const fontFamilies = Object.keys(fontData).reduce((result, fontFamily) => {
    result[fontFamily] = Array.from(fontData[fontFamily]).sort();
    return result;
  }, {});

  return fontFamilies;
}

function compileTextWithStyles(text, map, table ) {
  return `<pre style="${raw(table['0']).trim()} white-space: pre-wrap;">
    ${(() => {
      let spans = '';

      for (let i = 0; i < text.length; i++) {
        if ((i === 0 || map[i - 1] !== map[i]) && map[i] !== 133 && map[i] !== 132) {
          spans += `<span style="${raw(table[String(map[i])]).trim()}">`;
        }
        if ((map[i] === 133 || map[i] === 132)) {
          continue;
        } else if (
          (map[i] !== 133 && map[i] !== 132) && (map[i - 1] === 133 || map[i - 1] === 132)
        ) {
          spans += '<br /> <br />'
        } else {
          spans += text.charAt(i);
        }

        if (i === map.length - 1 || map[i + 1] !== map[i]) {
          spans += '</span>'
        }
      }

      return spans;
    })()}
  </pre>`
}

function generateFontLinks(fonts) {
  const fontLinks = [];

  for (const fontFamily in fonts) {
    const fontWeights = fonts[fontFamily].join(',');

    const fontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@${fontWeights}&display=swap`;
    const fontLink = `<link href="${fontUrl}" rel="stylesheet">`;

    fontLinks.push(fontLink);
  }

  return fontLinks.join('\n');
}

function renderTextNode(event) {
  event.preventDefault();

  const fileInput = document.getElementById('file');
  const textArea = document.getElementById('textArea');

  const file = fileInput.files[0];
  const text = textArea.value.trim();

  if (!file && text === '') {
    alert('Please select a JSON file or enter JSON data.');
    return;
  }

  let json;

  if (file) {
    loadJSONFile(file, function (error, parsedJSON) {
      if (error) {
        alert('Error parsing JSON file.');
        console.error(error);
        return;
      }
      json = parsedJSON;
      renderText(json);
    });
  } else {
    try {
      json = JSON.parse(text);
      renderText(json);
    } catch (error) {
      alert('Error parsing JSON data.');
      console.error(error);
      return;
    }
  }
}

function renderText(json) {
  const outputContainer = document.querySelector('.output');

  if (json) {
    const frameNode = document.createElement('iframe');
    const frameStyles = findDataByKey(json, 'absoluteRenderBounds');

    frameNode.style.position = 'relative';
    frameNode.style.width = '100%';
    frameNode.style.height = '100%';

    const textNode = findBlockByID(json, '1:4');
    const zeroStyle = findBlockByID(json, '0:1');

    const zeroBackground = findDataByKey(zeroStyle, 'backgroundColor')[0];
    const zeroBackGroundRGBA = getValidRGBA(zeroBackground);

    const { children } = zeroStyle;
    const rectangle = children[0];
    const textNodeObject = children[1];

    const zeroColor = getValidRGBA(textNode.fills[0].color);
    const textNodeStyles = findDataByKey(textNode, 'absoluteBoundingBox');
    const { y, width, height } = textNodeStyles[0];

    const styleOverrideMap = textNodeObject.characterStyleOverrides;
    const styleOverrideTable = findDataByKey(textNode, 'styleOverrideTable')[0];

    const zeroStyleTable = findDataByKey(textNode, 'style');
    styleOverrideTable['0'] = zeroStyleTable[0];

    const inlineStylesObj = transformStyleObjectToInlineStyles(styleOverrideTable);

    const fonts = extractFontFamiliesAndWeights(styleOverrideTable);

    console.log(fonts);

    const fontLinks = generateFontLinks(fonts);
    console.log(fontLinks);

    const frameContent = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          ${fontLinks}
          <title>Parsed JSON Content</title>
          <style>
            @import url(//fonts.googleapis.com/earlyaccess/jejugothic.css);

            body {
              margin: 0;
              font-family: 'Jeju Gothic', sans-serif;
            }
          </style>
        </head>
        <body
          style="height: 50dvh; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: ${zeroBackGroundRGBA};"
        >
          <div class="rectangle" style="display: flex; flex-direction: column; align-items: center;
          position: relative; top: 100px;
          justify-content: center; border: ${rectangle.strokeWeight}px ${rectangle.fills[0].type.toLowerCase()} ${getValidRGBA(rectangle.fills[0].color)}; width: ${rectangle.absoluteRenderBounds.width}px; height: ${rectangle.absoluteRenderBounds.height}px;">
            <div style="margin: auto 0; width: ${width}px; height: ${height}px; color: ${zeroColor};">
              ${
                compileTextWithStyles(textNode.characters, styleOverrideMap, inlineStylesObj)
              }
            </div>
          </div>
        </body>
      </html>
    `;

    frameNode.srcdoc = frameContent;
    outputContainer.appendChild(frameNode);
  } else {
    const noResultContainer = document.createElement('div');
    noResultContainer.textContent = 'No matching block found.';
    outputContainer.appendChild(noResultContainer);
  }
}

function handleInput() {
  const fileInput = document.getElementById('file');
  const textArea = document.getElementById('textArea');
  const renderTextNodeButton = document.querySelector('#renderTextNode');

  const file = fileInput.files[0];
  const text = textArea.value.trim();

  renderTextNodeButton.disabled = !file && text === '';
}

function copyHTMLToClipboard() {
  const frameNode = document.querySelector('iframe');

  const frameHTML = frameNode.getAttribute('srcdoc');

  navigator.clipboard.writeText(frameHTML)
    .then(() => {
      const copyMessage = document.createElement('span');
      copyMessage.classList.add('copy-message');
      copyMessage.textContent = 'HTML copied to clipboard!';
      document.body.appendChild(copyMessage);

      // Remove the copy message after 2 seconds
      setTimeout(() => {
        document.body.removeChild(copyMessage);
      }, 2500);
    })
    .catch((error) => {
      console.error('Error copying HTML to clipboard:', error);
    });
}

document.addEventListener('DOMContentLoaded', function() {

  const renderTextNodeButton = document.querySelector('#renderTextNode');
  renderTextNodeButton.addEventListener('click', renderTextNode);

  const fileInput = document.getElementById('file');
  const textArea = document.getElementById('textArea');

  fileInput.addEventListener('input', handleInput);
  textArea.addEventListener('input', handleInput);

  const copyToClipboardButton = document.querySelector('#copyHTMLtoClipboard');
  copyToClipboardButton.addEventListener('click', copyHTMLToClipboard);

  // Check for changes in the .output container using MutationObserver
  const outputContainer = document.querySelector('.output');
  if (outputContainer) {
    const observer = new MutationObserver(handleFrameLoad);
    observer.observe(outputContainer, { childList: true });
  }

  function handleFrameLoad() {
    const outputContainer = document.querySelector('.output');

    if (outputContainer.innerHTML.trim() === '') {
      copyToClipboardButton.disabled = true;
    } else {
      copyToClipboardButton.disabled = false;
    }
  }

});
