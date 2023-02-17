import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'

function CriaPDF(inventarios, anoMes, inventario, ajuste, valor) {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;

    const reportTitle = [
        {
            text: 'Mancini & Trindade',
            fontSize: 12,
            style: 'header',
            margin: [15, 5, 0, 0]    // left, top, right, bottom
        },
        {
            text: 'Inventario Mensal',
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

    const dados = inventarios.map((invent) => {
        return [
            { text: invent.produto, fontSize: 8, margin: [0, 2, 0, 2] },
            { text: invent.qtdeEstAnterior, fontSize: 8, margin: [0, 2, 0, 2], alignment: 'right' },
            { text: invent.qtdeCompra, fontSize: 8, margin: [0, 2, 0, 2], alignment: 'right' },
            { text: invent.qtdeEstoque, fontSize: 8, margin: [0, 2, 0, 2], alignment: 'right' },
            { text: invent.tipo, fontSize: 8, margin: [0, 2, 0, 2], alignment: 'left' },
            { text: invent.qtdeEstAtual, fontSize: 8, margin: [0, 2, 0, 2], alignment: 'right' },
            { text: invent.unid, fontSize: 8, margin: [0, 2, 0, 2], alignment: 'right' },
            { text: invent.valorEstAtual, fontSize: 8, margin: [0, 2, 0, 2], alignment: 'right' },
            { text: invent.user, fontSize: 8, margin: [0, 2, 0, 2], alignment: 'left' }
        ]
    });

    const details = [
        {
            table: {
                headerRows: 1,
                widths: [125, 43, 43, 43, 30, 43, 20, 50, 43],   // '*'
                body: [
                    [
                        { text: 'Produto', style: 'tableHeader', fontSize: 9, alignment: 'left' },
                        { text: 'Anterior', style: 'tableHeader', fontSize: 9, alignment: 'right' },
                        { text: 'Inventario', style: 'tableHeader', fontSize: 9, alignment: 'right' },
                        { text: 'Ajuste', style: 'tableHeader', fontSize: 9, alignment: 'right' },
                        { text: 'Tipo', style: 'tableHeader', fontSize: 9, alignment: 'left' },
                        { text: 'no Mês', style: 'tableHeader', fontSize: 9, alignment: 'right' },
                        { text: 'Und', style: 'tableHeader', fontSize: 9, alignment: 'right' },
                        { text: 'Valor', style: 'tableHeader', fontSize: 9, alignment: 'right' },
                        { text: 'Cadastro', style: 'tableHeader', fontSize: 9, alignment: 'left' }
                    ],
                    ...dados
                ]
            },
            layout: 'headerLineOnly' // 'lightHorizontalLines'
        },
        {
            text: '_________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________',
            alignment: 'center',
            fontSize: 5
        },
        {
            table: {
                headerRows: 1,
                widths: [125, 43, 43, 43, 30, 43, 20, 50, 43],   // '*'
                body: [
                    [
                        { text: 'Total', style: 'tableHeader', fontSize: 8, alignment: 'left' },
                        { text: '', style: 'tableHeader', fontSize: 8, alignment: 'left' },
                        { text: inventario, style: 'tableHeader', fontSize: 8, alignment: 'right' },
                        { text: ajuste, style: 'tableHeader', fontSize: 8, alignment: 'right' },
                        { text: '', style: 'tableHeader', fontSize: 8, alignment: 'left' },
                        { text: '', style: 'tableHeader', fontSize: 8, alignment: 'left' },
                        { text: '', style: 'tableHeader', fontSize: 8, alignment: 'left' },
                        { text: valor, style: 'tableHeader', fontSize: 8, alignment: 'right' },
                        { text: '', style: 'tableHeader', fontSize: 8, alignment: 'left' }
                    ],
                ]
            },
            layout: 'headerLineOnly' // 'lightHorizontalLines'
        },
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