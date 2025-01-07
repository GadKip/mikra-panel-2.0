import mammoth from 'mammoth';

export async function convertDocxToHtml(docxFile) {
    try {
        const result = await mammoth.convertToHtml({ arrayBuffer: await docxFile.arrayBuffer() }, {
            styleMap: [
                "p[style-name='Normal'] => p.verse-text",
                "table => table.verse-table",
                "tr => tr.verse-row",
                "td:nth-child(1) => td.verse-cell.col-1",
                "td:nth-child(2) => td.verse-cell.col-2",
                "td:nth-child(3) => td.verse-cell.col-3",
                "td:nth-child(4) => td.verse-cell.col-4",
                "p => p.rtl",
                "* => *[dir=rtl]"
            ],
            transformDocument: (element) => {
                if (element.type === 'paragraph') {
                    element.alignment = 'right';
                }
                return element;
            }
        });

        const styledHtml = `
            <html dir="rtl">
            <head>
                <meta charset="UTF-8">
                <style>
                    @font-face {
                        font-family: 'Ezra SIL SR';
                        src: url('/assets/fonts/SILEOTSR.ttf') format('truetype');
                    }
                    @font-face {
                        font-family: 'Guttman Keren';
                        src: url('/assets/fonts/Guttman Keren.ttf') format('truetype');
                    }
                    @font-face {
                        font-family: 'David';
                        src: url('/assets/fonts/david.ttf') format('truetype');
                    }
                    
                    body {
                        direction: rtl;
                        text-align: right;
                        margin: 0;
                        padding: 0;
                    }
                    .verse-table {
                        width: 100%;
                        border-collapse: collapse;
                        direction: rtl;
                        table-layout: fixed;
                    }
                    .verse-cell {
                        padding: 4px 8px;
                        vertical-align: top;
                        text-align: right;
                    }
                    .col-1 {
                        font-family: 'Ezra SIL SR', serif;
                        width: 10%;
                        font-size: 5px;
                    }
                    .col-2 {
                        font-family: 'Ezra SIL SR', serif;
                        width: 10%;
                        font-size: 6px;
                    }
                    .col-3 {
                        font-family: 'Ezra SIL SR', serif;
                        width: 40%;
                    }
                    .col-4 {
                        font-family: 'Guttman Keren', serif;
                        width: 40%;
                    }
                    .col-4 span.comment {
                        font-family: 'David', serif;
                    }
                    .verse-text {
                        margin: 0.5em 0;
                        text-align: right;
                        direction: rtl;
                        font-size: 18px;
                    }
                    td p {
                        margin: 0;
                        padding: 0;
                        white-space: normal;
                    }
                </style>
            </head>
            <body>
                ${result.value}
            </body>
            </html>
        `;

        return new Blob([styledHtml], { type: 'text/html' });
    } catch (error) {
        console.error('Error converting DOCX to HTML:', error);
        throw new Error('Failed to convert DOCX file');
    }
}
