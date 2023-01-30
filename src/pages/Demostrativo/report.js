import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'

function CriaPDF(demonstra, anoMes) {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;

    const reportTitle = [
        {
            text: 'Mancini & Trindade',
            fontSize: 12,
            style: 'header',
            margin: [15, 5, 0, 0]    // left, top, right, bottom
        },
        {
            text: 'Demonstrativo do Inventario Mensal',
            style: 'subheader',
            fontSize: 15,
            alignment: 'center',
            margin: [15, 5, 0, 0]
        },
        {
            text: 'Período: ' + anoMes,
            fontSize: 12,
            alignment: 'center',
            margin: [15, 5, 0, 5]
        },
    ];

    const dados = demonstra.map((demons) => {
        return [
            //{ text: demons.codigo, fontSize: 9, margin: [0, 2, 0, 2], alignment: 'center' },
            //{ text: demons.produto + " (" + demons.codigo + ")", fontSize: 9, margin: [0, 2, 0, 2], alignment: 'left'},
            { text: demons.produto, fontSize: 9, margin: [0, 2, 0, 2], alignment: 'left'},
            { text: demons.anterior, fontSize: 9, margin: [0, 2, 0, 2], alignment: 'right' },
            { text: demons.entrada, fontSize: 9, margin: [0, 2, 0, 2], alignment: 'right' },
            { text: demons.saida, fontSize: 9, margin: [0, 2, 0, 2], alignment: 'right' },
            { text: demons.inventario, fontSize: 9, margin: [0, 2, 0, 2], alignment: 'right' },
            { text: demons.atual, fontSize: 9, margin: [0, 2, 0, 2], alignment: 'right' },
            { text: demons.unid, fontSize: 9, margin: [0, 2, 0, 2], alignment: 'center' },
            { text: demons.valor, fontSize: 9, margin: [0, 2, 0, 2], alignment: 'right' }
        ]
    });

    const details = [
        {
            table: {
                headerRows: 1,
                //widths: [15, 150, 43, 43, 43, 43, 43, 17, 50],   // '*'
                widths: [160, 47, 45, 45, 45, 47, 17, 50],   // '*'
                body: [
                    [
                       //{ text: 'Cód.', style: 'tableHeader', fontSize: 9, alignment: 'center' },
                        { text: 'Produto', style: 'tableHeader', fontSize: 9, alignment: 'center' },
                        { text: 'Anterior', style: 'tableHeader', fontSize: 9, alignment: 'right' },
                        { text: 'Entrada', style: 'tableHeader', fontSize: 9, alignment: 'right' },
                        { text: 'Saída', style: 'tableHeader', fontSize: 9, alignment: 'right' },
                        { text: 'Inventario', style: 'tableHeader', fontSize: 9, alignment: 'right' },
                        { text: 'no Mês', style: 'tableHeader', fontSize: 9, alignment: 'right' },
                        { text: 'Und', style: 'tableHeader', fontSize: 9, alignment: 'center' },
                        { text: 'Valor', style: 'tableHeader', fontSize: 9, alignment: 'right' }
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
        pageMargins: [15, 70, 15, 40],

        header: [reportTitle],
        content: [details],
        footer: Rodape
    }

    //pdfMake.createPdf(docDefinitios).download();
    pdfMake.createPdf(docDefinitios).open({}, window.open('', '_blank'));
}

export default CriaPDF;