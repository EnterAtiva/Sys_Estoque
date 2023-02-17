import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'

function CriaPDF(produtos) {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
 
    const reportTitle = [
        {
            text: 'Mancini & Trindade',
            fontSize: 10,
            style: 'header',
            margin: [10, 5, 0, 0]    // left, top, right, bottom
        },
        {
            text: 'Cadastro dos Produtos',
            style: 'subheader',
            fontSize: 14,
            alignment: 'center',
            margin: [10, 5, 0, 0]
        },
    ];

    const dados = produtos.map((produto) => {
        return [
            { text: produto.codigo, fontSize: 8, margin: [0, 2, 0, 2], alignment: 'center' },
            { text: produto.nome, fontSize: 8, margin: [0, 2, 0, 2], alignment: 'left' },
            { text: produto.familia, fontSize: 8, margin: [0, 2, 0, 2], alignment: 'left' },
            { text: produto.tipo, fontSize: 8, margin: [0, 2, 0, 2], alignment: 'center' },
            { text: produto.conversao, fontSize: 8, margin: [0, 2, 0, 2], alignment: 'right' },
            { text: produto.operador, fontSize: 8, margin: [0, 2, 0, 2], alignment: 'left' },
            { text: produto.user, fontSize: 8, margin: [0, 2, 0, 2], alignment: 'left' },
            { text: produto.cadastroFormated, fontSize: 8, margin: [0, 2, 0, 2], alignment: 'center' }
        ]
    });

    const details = [
        {
            table: {
                headerRows: 1,
                widths: [20, 200, 50, 15, 45, 40, 50, 45],   // '*'
                body: [
                    [
                        { text: 'Cód.', style: 'tableHeader', fontSize: 9, alignment: 'rigth' },
                        { text: 'Produto', style: 'tableHeader', fontSize: 9, alignment: 'left' },
                        { text: 'Família', style: 'tableHeader', fontSize: 9, alignment: 'left' },
                        { text: 'Und', style: 'tableHeader', fontSize: 8, alignment: 'center' },
                        { text: 'Fator', style: 'tableHeader', fontSize: 9, alignment: 'right' },
                        { text: 'Operador', style: 'tableHeader', fontSize: 9, alignment: 'left' },
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