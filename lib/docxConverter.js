import mammoth from 'mammoth';

/**
 * Converts a DOCX file (as an ArrayBuffer) to HTML.
 * @param {ArrayBuffer} arrayBuffer - The DOCX file as an ArrayBuffer.
 * @returns {Promise<string>} - A promise that resolves with the HTML string.
 */
export const convertDocxToHtml = async (input) => {
    try {
        let arrayBuffer;
        
        // Handle different input types
        if (input instanceof Blob) {
            arrayBuffer = await input.arrayBuffer();
        } else if (input instanceof ArrayBuffer) {
            arrayBuffer = input;
        } else if (ArrayBuffer.isView(input)) {
            arrayBuffer = input.buffer;
        } else {
            throw new Error('Invalid input: Expected Blob, ArrayBuffer, or TypedArray');
        }

        // Convert to the format mammoth expects
        const result = await mammoth.convertToHtml({ 
            arrayBuffer: arrayBuffer,
            styleMap: [
                "p[style-name='Heading 1'] => h1:fresh",
                "p[style-name='Heading 2'] => h2:fresh",
                "p[style-name='Heading 3'] => h3:fresh"
            ]
        });

        console.log('HTML output:', {
            fullLength: result.value.length,
            preview: result.value.substring(0, 1500),
            containsImage: result.value.includes('img'),
            containsTable: result.value.includes('table')
        });

        if (!result || !result.value) {
            throw new Error('Conversion failed: Empty result');
        }

        return result.value;

    } catch (error) {
        console.error("Error converting DOCX to HTML:", error);
        throw new Error(`DOCX conversion failed: ${error.message}`);
    }
};

/**
 * Converts an HTML string to a JSON structure suitable for the JSONViewer component.
 * @param {string} htmlString - The HTML string to convert.
 * @returns {object} - A JSON object representing the content structure.
 */
export const convertHtmlToJson = (htmlString) => {
    console.log('Converting HTML to JSON...'); 
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    
    // Add this log
    console.log('All nodes:', Array.from(doc.body.childNodes)
        .map(node => ({
            type: node.nodeName,
            isElement: node.nodeType === Node.ELEMENT_NODE,
            content: node.textContent.substring(0, 50)
        }))
    );

    const body = doc.body;

    // Log the first few nodes and their children
    console.log('First few body nodes:', Array.from(doc.body.childNodes)
        .slice(0, 15)  // First 15 top-level nodes
        .map(node => ({
            type: node.nodeName,
            nodeType: node.nodeType,
            isElement: node.nodeType === Node.ELEMENT_NODE,
            hasChildren: node.hasChildNodes(),
            childCount: node.childNodes?.length,
            content: node.textContent.substring(0, 100),
            children: node.hasChildNodes() ? Array.from(node.childNodes)
                .slice(0, 3)  // First 3 children of each node
                .map(child => ({
                    type: child.nodeName,
                    nodeType: child.nodeType,
                    isElement: child.nodeType === Node.ELEMENT_NODE,
                    content: child.textContent.substring(0, 50),
                    hasImg: child.nodeName === 'IMG' || child.querySelector?.('img') !== null
                }))
                : []
        }))
    );

    const parseNode = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent.trim();
            return text ? {
                type: 'text',
                data: {
                    text: text,
                    style: null
                }
            } : null;
        }

        if (node.nodeType !== Node.ELEMENT_NODE) {
            return null;
        }

        // Check for nested img inside paragraphs
        if (node.nodeName === 'P') {
            const img = node.querySelector('img');
            if (img) {
                return {
                    type: 'image',
                    data: {
                        src: img.getAttribute('src'),
                        alt: img.getAttribute('alt')
                    }
                };
            }
        }

        switch (node.nodeName) {
            case 'P':
                return {
                    type: 'text',
                    data: {
                        text: node.textContent,
                        style: null
                    }
                };
            case 'H1':
            case 'H2':
            case 'H3':
                return {
                    type: 'text',
                    data: {
                        text: node.textContent,
                        style: node.nodeName.toLowerCase()
                    }
                };
            case 'TABLE':
                return {
                    type: 'table',
                    data: parseTable(node)
                };
            case 'UL':
            case 'OL':
                return {
                    type: 'list',
                    data: parseList(node)
                };
            case 'IMG':
                const imageData = {
                    src: node.getAttribute('src'),
                    alt: node.getAttribute('alt')
                };
                console.log('Converting IMG node:', {
                    hasSource: !!imageData.src,
                    sourceLength: imageData.src?.length,
                    sourceType: imageData.src?.substring(0, 30),
                    alt: imageData.alt
                });
                return {
                    type: 'image',
                    data: imageData
                };
            default:
                return {
                    type: 'text',
                    data: {
                        text: node.textContent,
                        style: null
                    }
                };
        }
    };

    const parseTable = (tableNode) => {
        const tableData = [];
        const rows = tableNode.querySelectorAll('tr');

        rows.forEach(row => {
            const rowData = [];
            const cells = row.querySelectorAll('td, th');

            cells.forEach(cell => {
                rowData.push(parseCell(cell));
            });

            tableData.push({ row: rowData });
        });

        return tableData;
    };

    const parseList = (listNode) => {
        const listData = [];
        const items = listNode.querySelectorAll('li');
        let marker;

        if (listNode.nodeName === 'OL') {
            // Ordered list
            let counter = 1;
            items.forEach(item => {
                marker = counter + ".";
                listData.push({
                    type: 'list-item',
                    data: {
                        text: item.textContent,
                        marker: marker,
                        level: 1 // You might want to implement nested list level detection
                    }
                });
                counter++;
            });
        } else {
            // Unordered list
            items.forEach(item => {
                marker = "•";
                listData.push({
                    type: 'list-item',
                    data: {
                        text: item.textContent,
                        marker: marker,
                        level: 1 // You might want to implement nested list level detection
                    }
                });
            });
        }

        return listData;
    };

    const parseCell = (cell) => {
        const img = cell.querySelector('img');
        const paragraphs = cell.querySelectorAll('p');
        
        // Log cell content for debugging
        console.log('Parsing cell:', {
            hasImage: !!img,
            hasParagraphs: paragraphs.length > 0,
            rawContent: cell.innerHTML
        });

        return {
            cell: cell.textContent.trim(),
            image: img ? {
                src: img.getAttribute('src'),
                alt: img.getAttribute('alt')
            } : null,
            styles: {}
        };
    };

    // Process all child nodes of the body
    const content = Array.from(body.childNodes)
        .map(node => parseNode(node))
        .filter(node => node !== null);

    return { content };
};

/**
 * Converts a DOCX file (as an ArrayBuffer) to a JSON structure suitable for the JSONViewer component.
 * @param {ArrayBuffer} arrayBuffer - The DOCX file as an ArrayBuffer.
 * @returns {Promise<object>} - A promise that resolves with the JSON object.
 */
export const convertDocxToJson = async (arrayBuffer) => {
    try {
        const htmlString = await convertDocxToHtml(arrayBuffer);
        return convertHtmlToJson(htmlString);
    } catch (error) {
        console.error("Error converting DOCX to JSON:", error);
        throw error;
    }
};
