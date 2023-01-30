import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'

function CriaPDF(estoques, anoMes) {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
 
    const reportTitle = [
        {
            text: 'Mancini & Trindade',
            fontSize: 10,
            style: 'header',
            margin: [10, 5, 0, 0]    // left, top, right, bottom
        },
        {
            text: 'Entrada de Produtos Mensal',
            style: 'subheader',
            fontSize: 14,
            alignment: 'center',
            margin: [10, 5, 0, 0]
        },
        {
            text: 'Período: ' + anoMes,
            fontSize: 11,
            alignment: 'center',
            margin: [10, 5, 0, 5]
        },
    ];

    const dados = estoques.map((estoque) => {
        return [
            { text: estoque.fornecedor, fontSize: 8, margin: [0, 2, 0, 2], alignment: 'left' },
            { text: estoque.produto, fontSize: 8, margin: [0, 2, 0, 2], alignment: 'left' },
            { text: estoque.qtdeCompra, fontSize: 8, margin: [0, 2, 0, 2], alignment: 'right' },
            { text: estoque.conversao, fontSize: 8, margin: [0, 2, 0, 2], alignment: 'right' },
            { text: estoque.qtdeEstoque, fontSize: 8, margin: [0, 2, 0, 2], alignment: 'right' },
            { text: estoque.valorDaCompra, fontSize: 8, margin: [0, 2, 0, 2], alignment: 'right' },
            { text: estoque.valorIpi, fontSize: 8, margin: [0, 2, 0, 2], alignment: 'right' },
            { text: estoque.valorUnitario, fontSize: 8, margin: [0, 2, 0, 2], alignment: 'right' }
        ]
    });

    const details = [
        {
            table: {
                headerRows: 1,
                widths: [77, 137, 45, 45, 45, 45, 35, 35],   // '*'
                body: [
                    [
                        { text: 'Fornecedor', style: 'tableHeader', fontSize: 9, alignment: 'left' },
                        { text: 'Produto', style: 'tableHeader', fontSize: 9, alignment: 'left' },
                        { text: 'Entrada', style: 'tableHeader', fontSize: 9, alignment: 'right' },
                        { text: 'Conversão', style: 'tableHeader', fontSize: 9, alignment: 'right' },
                        { text: 'Estoque', style: 'tableHeader', fontSize: 9, alignment: 'right' },
                        { text: 'Valor', style: 'tableHeader', fontSize: 9, alignment: 'right' },
                        { text: 'IPI', style: 'tableHeader', fontSize: 9, alignment: 'right' },
                        { text: 'Unitário', style: 'tableHeader', fontSize: 9, alignment: 'right' }
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
        pageMargins: [10, 65, 15, 40],

        header: [reportTitle],
        content: [details],
        footer: Rodape
    }

    //pdfMake.createPdf(docDefinitios).download();
    pdfMake.createPdf(docDefinitios).open({}, window.open('', '_blank'));
}

export default CriaPDF;