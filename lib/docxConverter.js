import mammoth from 'mammoth';

function processTable(node) {
    const tableRows = Array.from(node.querySelectorAll('tr'))
        .map(tr => ({
            row: Array.from(tr.querySelectorAll('td'))
                .map((td, colIndex) => processCell(td, colIndex))
        }));
    return tableRows;
}

export async function convertDocxToJson(docxFile) {
    try {
        const result = await mammoth.convertToHtml({
            arrayBuffer: await docxFile.arrayBuffer()
        });

        const parser = new DOMParser();
        const doc = parser.parseFromString(result.value, 'text/html');
        const content = [];

        doc.body.childNodes.forEach(node => {
            if (node.nodeName === 'TABLE') {
                content.push({
                    type: 'table',
                    data: processTable(node)
                });
            } else if (node.nodeName === 'H1' || node.nodeName === 'H2' || node.nodeName === 'H3' || node.nodeName === 'P') {
                content.push({
                    type: 'text',
                    style: node.nodeName.toLowerCase(),
                    data: {
                        text: node.textContent.trim()
                    }
                });
            }
        });

        return { content };
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

function processCell(td, colIndex) {
    const cellText = td.textContent.trim();
    const styles = {
        fontFamily: colIndex === 3 ? 'Guttman Keren' : 'Ezra SIL SR',
        bold: td.querySelector('b, strong') !== null,
        italic: td.querySelector('i') !== null,
        underline: td.querySelector('u') !== null,
        isHeading1: td.querySelector('h1') !== null,
        isHeading2: td.querySelector('h2') !== null,
        isHeading3: td.querySelector('h3') !== null,
    };

    return { cell: cellText, styles };
}