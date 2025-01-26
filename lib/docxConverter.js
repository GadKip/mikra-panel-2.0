import mammoth from 'mammoth';

export async function convertDocxToHtml(docxFile) {
    try {
        console.warn('Starting conversion...');
        
        const result = await mammoth.convertToHtml(
            { arrayBuffer: await docxFile.arrayBuffer() },
            {
                styleMap: [
                    "table => table.verse-table",
                    "p[style-name='heading 2'] => p.verse-text",
                    "p[style-name='heading 4'] => p.verse-text",
                    "p => p.rtl"
                ]
            }
        );

        console.warn('Initial HTML:', result.value);

        // Process the HTML to add classes to tr and td elements
        let processedHtml = result.value.replace(
            /<table class="verse-table">(.*?)<\/table>/gs,
            (match, tableContent) => {
                console.warn('Processing table:', tableContent.substring(0, 100) + '...');
                
                const processedTable = tableContent.replace(
                    /<tr>(.*?)<\/tr>/g,
                    (trMatch, trContent) => {
                        const cells = trContent.match(/<td.*?<\/td>/g) || [];
                        const processedCells = cells.map((cell, index) => {
                            return cell.replace(
                                '<td',
                                `<td class="verse-cell col-${index + 1}"`
                            );
                        });
                        return `<tr class="verse-row">${processedCells.join('')}</tr>`;
                    }
                );

                console.warn('Processed table structure:', processedTable.substring(0, 100) + '...');
                return `<table class="verse-table">${processedTable}</table>`;
            }
        );

        console.warn('Final HTML:', processedHtml);

        // Add wrapper with styles
        const finalHtmlContent = `
            <div class="mikra-content" dir="rtl">
                ${processedHtml}
            </div>`;

        return new Blob([finalHtmlContent], { type: 'text/html' });
    } catch (error) {
        console.error('Error converting DOCX to HTML:', error);
        throw new Error('Failed to convert DOCX file');
    }
}