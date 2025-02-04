import mammoth from 'mammoth';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';

export async function convertDocxToJson(docxFile) {
    try {
        const options = {
            transformDocument: (element) => {
                if (element.type === 'run' && element.properties) {
                    const fontSize = extractFontSize(element);
                    if (fontSize) {
                        element.styleId = `font-size-${fontSize}`;
                    }
                }
                return element;
            }
        };

        const result = await mammoth.convertToHtml({
            arrayBuffer: await docxFile.arrayBuffer()
        }, options);

        // Create proper HTML document
        const htmlDoc = `<!DOCTYPE html><html><body>${result.value}</body></html>`;
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlDoc, 'text/html');
        
        // Process document content
        const bodyContent = doc.getElementsByTagName('body')[0];
        const content = [];
        
        // Process nodes in order
        Array.from(bodyContent.childNodes).forEach(node => {
            if (node.nodeType === 1) { // Element nodes only
                if (node.nodeName.toLowerCase() === 'table') {
                    content.push(processTable(node));
                } else if (node.nodeName.toLowerCase() === 'p') {
                    const textContent = processTextNode(node);
                    if (textContent) {
                        content.push(textContent);
                    }
                }
            }
        });

        return { content };

    } catch (error) {
        console.error('Conversion error:', error);
        throw error;
    }
}

function extractFontSize(element) {
    if (element.properties) {
        // Check both sz and szCs properties for font size
        const size = element.properties.sz?.[0]?.['$']?.['w:val'] || 
                    element.properties.szCs?.[0]?.['$']?.['w:val'];
        if (size) {
            return Math.round(parseInt(size) / 2); // Convert DOCX size to points
        }
    }
    return null;
}

function processDocument(doc) {
    const content = [];
    const bodyNode = doc.getElementsByTagName('body')[0];

    // Process all nodes in sequential order
    Array.from(bodyNode.childNodes).forEach(node => {
        // Skip empty text nodes and comments
        if (node.nodeType === 3 && !node.textContent.trim()) return;
        if (node.nodeType === 8) return; // Skip comments

        if (node.nodeName.toLowerCase() === 'table') {
            content.push(processTable(node));
        } else if (node.nodeName.toLowerCase() === 'p') {
            const textContent = processTextNode(node);
            if (textContent) {
                content.push(textContent);
            }
        }
    });

    return { content };
}

function processTable(tableNode) {
    const tableData = [];
    const rows = tableNode.getElementsByTagName('tr');

    Array.from(rows).forEach(row => {
        const rowData = { row: [] };
        const cells = row.getElementsByTagName('td');

        Array.from(cells).forEach((cell, colIndex) => {
            rowData.row.push(processCell(cell, colIndex));
        });

        tableData.push(rowData);
    });

    return {
        type: 'table',
        data: tableData
    };
}

function processTextNode(node) {
    const textContent = node.textContent.trim();
    if (!textContent) return null;

    const style = node.getAttribute('class') || 'p';
    const fontSize = extractFontSizeFromNode(node);

    return {
        type: 'text',
        style: style.replace('fresh', ''),
        data: {
            text: textContent,
            fontSize: fontSize || getDefaultFontSize(style),
            styles: {
                bold: node.getElementsByTagName('strong').length > 0,
                italic: node.getElementsByTagName('i').length > 0,
                underline: node.getElementsByTagName('u').length > 0
            }
        }
    };
}

function getDefaultFontSize(style) {
    // Default font sizes for different styles
    const sizes = {
        'h1': '24',
        'h2': '20',
        'h3': '18',
        'p': '12'
    };
    return sizes[style] || '12';
}

function processCell(cell, colIndex) {
    const fontSizes = [];
    const defaultFontSize = '12';

    // Process text nodes recursively to preserve font sizes
    function processTextNodes(node) {
        Array.from(node.childNodes).forEach(child => {
            if (child.nodeType === 3) { // Text node
                const text = child.nodeValue.trim();
                if (text) {
                    const parentElement = child.parentNode;
                    let fontSize = extractFontSizeFromNode(parentElement) || defaultFontSize;
                    fontSizes.push({
                        text,
                        fontSize: parseInt(fontSize)
                    });
                }
            } else if (child.nodeType === 1) { // Element node
                processTextNodes(child);
            }
        });
    }

    processTextNodes(cell);

    return {
        cell: cell.textContent.trim(),
        styles: {
            fontFamily: colIndex === 3 ? 'Guttman Keren' : 'Ezra SIL SR',
            bold: cell.getElementsByTagName('strong').length > 0 || 
                  cell.getElementsByTagName('b').length > 0,
            italic: cell.getElementsByTagName('i').length > 0,
            underline: cell.getElementsByTagName('u').length > 0,
            fontSizes
        }
    };
}

function extractFontSizeFromNode(node) {
    // Check for direct font size data
    const fontSize = node.getAttribute('data-font-size');
    if (fontSize) return fontSize;

    // Check spans within the node
    const spans = node.getElementsByTagName('span');
    for (let span of Array.from(spans)) {
        const sizeClass = span.getAttribute('class');
        if (sizeClass && sizeClass.startsWith('font-size-')) {
            return sizeClass.replace('font-size-', '');
        }
    }

    return null;
}