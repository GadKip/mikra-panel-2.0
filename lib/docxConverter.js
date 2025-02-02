import mammoth from 'mammoth';

export async function convertDocxToJson(docxFile) {
    try {
        const result = await mammoth.convertToHtml({
            arrayBuffer: await docxFile.arrayBuffer(),
            styleMap: [
                "p[style-name='Heading 1'] => h1",
                "p[style-name='Heading 2'] => h2",
                "p[style-name='Heading 3'] => h3",
                "strong => b",
                "b => b",
                "table => table",
                "tr => tr",
                "td => td"
            ]
        });

        const parser = new DOMParser();
        const doc = parser.parseFromString(result.value, 'text/html');

        const tables = Array.from(doc.querySelectorAll('table')).map(table => {
            return Array.from(table.querySelectorAll('tr'))
                .map(tr => ({
                    row: Array.from(tr.querySelectorAll('td'))
                        .map((td, colIndex) => processCell(td, colIndex))
                }));
        });

        return { tables };
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