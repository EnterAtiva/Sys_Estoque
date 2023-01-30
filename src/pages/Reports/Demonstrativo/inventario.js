import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'

function inventarioPDF(demonstra) {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;

    const reportTitle = [
        {
            text: 'Demonstrativo do Inventario Mensal', alignment: 'center',
            fontSize: 15,
            bold: true,
            margin: [15, 20, 0, 45] // left, top, right, bottom
        },
    ];  

    const dados = demonstra.map((demons) => {
        return [
            { text: demons.codigo, fontSize: 9, margin: [0, 2, 0, 2], alignment: 'center' },
            { text: demons.produto, fontSize: 9, margin: [0, 2, 0, 2] },
            { text: demons.anterior, fontSize: 9, margin: [0, 2, 0, 2], alignment: 'right' },
            { text: demons.entrada, fontSize: 9, margin: [0, 2, 0, 2], alignment: 'right' },
            { text: demons.saida, fontSize: 9, margin: [0, 2, 0, 2], alignment: 'right' },
            { text: demons.inventario, fontSize: 9, margin: [0, 2, 0, 2], alignment: 'right' },
            { text: demons.atual, fontSize: 9, margin: [0, 2, 0, 2], alignment: 'right' },
            { text: demons.valor, fontSize: 9, margin: [0, 2, 0, 2], alignment: 'right' }
        ]
    });

    const details = [
        {
            table: {
                headerRows: 1,
                widths: [20, 170, 43, 43, 43, 43, 43, 50],   // '*'
                body: [
                    [
                        { text: 'Cód.', style: 'tableHeader', fontSize: 9, alignment: 'center' },
                        { text: 'Produto', style: 'tableHeader', fontSize: 9, alignment: 'center' },
                        { text: 'Anterior', style: 'tableHeader', fontSize: 9, alignment: 'right' },
                        { text: 'Entrada', style: 'tableHeader', fontSize: 9, alignment: 'right' },
                        { text: 'Saída', style: 'tableHeader', fontSize: 9, alignment: 'right' },
                        { text: 'Inventario', style: 'tableHeader', fontSize: 9, alignment: 'right' },
                        { text: 'no Mês', style: 'tableHeader', fontSize: 9, alignment: 'right' },
                        { text: 'Valor', style: 'tableHeader', fontSize: 9, alignment: 'right' }
                    ],
                    ...dados
                ]
            },
            layout: 'lightHorizontalLines' // headerLineOnly
        }
    ];

    function Rodape(currentPage, pageCount) {
        return [
            {
                text: currentPage + ' / ' + pageCount,
                alignment: 'right',
                fontSize: 9,
                margin: [0, 10, 20, 0] // left, top, right, bottom
            }
        ]
    }

    const docDefinitios = {
        pageSize: 'A4',
        pageMargins: [15, 50, 15, 40],

        header: [reportTitle],
        content: [details],
        footer: Rodape
    }

    //pdfMake.createPdf(docDefinitios).download();
    pdfMake.createPdf(docDefinitios).open({}, window.open('', '_blank'));
}

export default inventarioPDF;