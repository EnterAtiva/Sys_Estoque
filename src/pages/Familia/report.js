import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'

function CriaPDF(familia) {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
 
    const reportTitle = [
        {
            text: 'Mancini & Trindade',
            fontSize: 10,
            style: 'header',
            margin: [10, 5, 0, 0]    // left, top, right, bottom
        },
        {
            text: 'Cadastro das Famílias dos Produtos',
            style: 'subheader',
            fontSize: 14,
            alignment: 'center',
            margin: [10, 5, 0, 0]
        },
    ];

    const dados = familia.map((familias) => {
        return [
            { text: familias.codigo, fontSize: 8, margin: [0, 2, 0, 2], alignment: 'center' },
            { text: familias.nome, fontSize: 8, margin: [0, 2, 0, 2], alignment: 'left' },
            { text: familias.user, fontSize: 8, margin: [0, 2, 0, 2], alignment: 'left' },
            { text: familias.cadastroFormated, fontSize: 8, margin: [0, 2, 0, 2], alignment: 'center' }
        ]
    });

    const details = [
        {
            table: {
                headerRows: 1,
                widths: [40, 250, 100, 50],   // '*'
                body: [
                    [
                        { text: 'Código', style: 'tableHeader', fontSize: 9, alignment: 'left' },
                        { text: 'Família', style: 'tableHeader', fontSize: 9, alignment: 'left' },
                        { text: 'Cadastrador', style: 'tableHeader', fontSize: 9, alignment: 'left' },
                        { text: 'Data', style: 'tableHeader', fontSize: 9, alignment: 'center' }
                    ],
                    ...dados
                ]
            },
            layout: 'headerLineOnly' // 'lightHorizontalLines'
        }
    ];

    function Rodape(currentPage, pageCount) {
        return [
            {
                text: '_________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________',
                alignment: 'center',
                fontSize: 5
            },

            {
                text: `Página ${currentPage.toString()} de ${pageCount}`,
                alignment: 'right',
                fontSize: 7,
                margin: [0, 10, 20, 0] // left, top, right, bottom
            },
            {
                text: 'Mancini & Trindade',
                fontSize: 7,
                alignment: 'center',
            },
        ]
    }

    const docDefinitios = {
        pageSize: 'A4',
        pageMargins: [10, 50, 15, 40],

        header: [reportTitle],
        content: [details],
        footer: Rodape
    }

    //pdfMake.createPdf(docDefinitios).download();
    pdfMake.createPdf(docDefinitios).open({}, window.open('', '_blank'));
}

export default CriaPDF;