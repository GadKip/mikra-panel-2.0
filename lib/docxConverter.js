import mammoth from 'mammoth';

export async function convertDocxToJson(docxFile) {
    try {
        // Step 1: Convert to HTML with basic styles
        const result = await mammoth.convertToHtml({
            arrayBuffer: await docxFile.arrayBuffer(),
            styleMap: [
                "p[style-name='Heading 1'] => h1",
                "p[style-name='Heading 2'] => h2",
                "p[style-name='Heading 3'] => h3",
                "b => b",
                "i => i",
                "u => u",
                "table => table",
                "tr => tr",
                "td => td"
            ]
        });

        // Step 2: Parse HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(result.value, 'text/html');

        // Step 3: Extract table data with styles
        const tables = Array.from(doc.querySelectorAll('table')).map(table => {
            return Array.from(table.querySelectorAll('tr')).map(tr => ({
                row: Array.from(tr.querySelectorAll('td')).map((td, colIndex) => ({
                    cell: td.textContent.trim(),
                    styles: {
                        bold: td.querySelector('b') !== null,
                        italic: td.querySelector('i') !== null,
                        underline: td.querySelector('u') !== null,
                        isHeading1: td.querySelector('h1') !== null,
                        isHeading2: td.querySelector('h2') !== null,
                        isHeading3: td.querySelector('h3') !== null,
                        textSize: 1,
                        fontFamily: colIndex === 3 ? 'Guttman Keren' : 'Ezra SIL SR'
                    }
                }))
            }))
        });

        return { tables };

    } catch (error) {
        console.error('Error converting DOCX to JSON:', error);
        throw error;
    }
}