import { useState, useEffect, useContext } from 'react';
import firebase from '../../services/firebaseConnection';
import { useHistory, useParams } from 'react-router-dom';
import Principal from '../../components/Menus/Principal';
import Title from '../../components/Title';
import { AuthContext } from '../../contexts/auth';
import { toast } from 'react-toastify';
import './entrada.css';
import { FiEdit2 } from 'react-icons/fi';
import { RiDeleteBin3Line } from 'react-icons/ri';
import { FaBox, FaArrowCircleRight, FaRegFilePdf } from 'react-icons/fa';
import { format, set } from 'date-fns';
import CriaPDF from './report';
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  connectFirestoreEmulator
} from 'firebase/firestore';


export default function Entrada() {
  const [loadFornecedores, setLoadFornecedores] = useState(true);
  const [fornecedores, setFornecedores] = useState([]);
  const [fornecedoresSelected, setFornecedoresSelected] = useState();
  const [loadProdutos, setLoadProdutos] = useState(true);
  const [produtos, setProdutos] = useState([]);
  const [produtosSelected, setProdutosSelected] = useState();
  const [codigo, setCodigo] = useState(1);
  const [ano, setAno] = useState('');
  const [mes, setMes] = useState('');
  const [anoMes, setAnoMes] = useState('');
  const [qtdeCompra, setQtdeCompra] = useState('');
  const [qtdeEstoque, setQtdeEstoque] = useState('');
  const [valorDaCompra, setValorDaCompra] = useState('');
  const [valorIpi, setValorIpi] = useState('');
  const [novoIpi, setNovoIpi] = useState('0,00');
  const [valorUnitario, setValorUnitario] = useState('');
  const [conversao, setConversao] = useState('');
  const [estoques, setEstoques] = useState([]);

  const [numNf, setNumNf] = useState('');
  const [qtdeEstAnterior, setQtdeEstAnterior] = useState('0,000');
  const [qtdeEstAtual, setQtdeEstAtual] = useState('0,000');
  const [valorEstAnterior, setValorEstAnterior] = useState('0,00');
  const [valorEstAtual, setValorEstAtual] = useState('0,00');
  const [codProduto, setCodProduto] = useState('');

  const { id } = useParams();
  const history = useHistory();
  const [edit, setEdit] = useState({});
  const [delet, setDelet] = useState({});
  const { user } = useContext(AuthContext);

  useEffect(() => {
    async function loadFornecedores() {
      await firebase.firestore().collection('cliente')
        .orderBy('tipo')
        .orderBy('nomeFantasia', 'asc')
        .where("tipo", "!=", "Cliente")
        .get()
        .then((snapshot) => {
          let lista = [];
          snapshot.forEach((doc) => {
            lista.push({
              id: doc.id,
              codigo: doc.data().codigo,
              nomeFantasia: doc.data().nomeFantasia
            })
          })

          if (lista.length === 0) {
            console.log('NENHUM FORNECEDOR ENCONTRADO...');
            setFornecedores([{ id: '1', nome: 'Sem cadastros...' }]);
            setLoadFornecedores(false);
            return;
          }
          setFornecedores(lista);
          setLoadFornecedores(false);
        })
        .catch((error) => {
          console.log('DEU ALGUM ERRO!', error);
          setLoadFornecedores(false);
          setFornecedores([{ id: '1', nome: '' }]);
        })
    }
    loadFornecedores();
  }, []);

  useEffect(() => {
    async function loadProdutos() {
      const unsub = onSnapshot(firebase.firestore().collection("produto")
        .orderBy('nome', 'asc'),
        (snapshot) => {
          let listaProduto = [];

          snapshot.forEach((doc) => {
            listaProduto.push({
              id: doc.id,
              codigo: doc.data().codigo,
              nome: doc.data().nome,
              conversao: doc.data().conversao,
              operador: doc.data().operador,
              unid: doc.data().tipo
            })
          })

          if (listaProduto.length === 0) {
            console.log('NENHUM PRODUTO ENCONTRADO...');
            setProdutos([{ id: '1', nome: 'Sem cadastros...' }]);
            setLoadProdutos(false);
            return;
          }
          setProdutos(listaProduto);
          setLoadProdutos(false);
        })
    }
    loadProdutos();
    loadCodigo();
  }, []);

  async function loadCodigo() {
    const unsub = onSnapshot(firebase.firestore().collection("estoque")
      .orderBy('codigo', 'asc')
      .limitToLast(1),
      (snapshot) => {
        snapshot.forEach((doc) => {
          setCodigo(doc.data().codigo + 1);
        })
      })
    if (!codigo) {
      setCodigo(1);
    }
  }

  function buscaAnoMes() {
    let ano = document.getElementById("ano");
    let vlAno = ano.options[ano.selectedIndex].text;

    let mes = document.getElementById("mes");
    let vlMes = mes.options[mes.selectedIndex].text;

    setAnoMes(vlMes + " de " + vlAno);
  }

  async function trocaAno(e) {
    await setAno(e.target.value);
    carregaListaEntradas();
    buscaAnoMes()
  }

  async function trocaMes(e) {
    await setMes(e.target.value);
    carregaListaEntradas();
    buscaAnoMes()
  }

  function carregaListaEntradas() {
    let ano = document.getElementById("ano");
    let vlAno = ano.value;
    let mes = document.getElementById("mes");
    let vlMes = mes.value;

    if (vlAno !== 0 && vlMes !== 0) {
      const unsub = onSnapshot(firebase.firestore().collection("estoque")
        .orderBy('fornecedor', 'asc')
        .orderBy('produto')
        .where("ano", "==", vlAno)
        .where("mes", "==", vlMes)
        .where("tipo", "==", "Entrada")
        .where("fornecedor", "!=", "INVENTARIO"),
        (snapshot) => {
          let listaEstoques = [];

          snapshot.forEach((doc) => {
            listaEstoques.push({
              id: doc.id,
              codigo: doc.data().codigo,
              ano: doc.data().ano,
              mes: doc.data().mes,
              tipo: doc.data().tipo,
              fornecedor: doc.data().fornecedor,
              fornecedorId: doc.data().fornecedorId,
              fornecedorCod: doc.data().fornecedorCod,
              produto: doc.data().produto,
              produtoId: doc.data().produtoId,
              produtoCod: doc.data().produtoCod,
              qtdeCompra: doc.data().qtdeCompra,
              conversao: doc.data().conversao,
              qtdeEstoque: doc.data().qtdeEstoque,
              valorDaCompra: doc.data().valorDaCompra,
              valorIpi: doc.data().valorIpi,
              valorUnitario: doc.data().valorUnitario,
              numNf: doc.data().numNf,
              qtdeEstAnterior: doc.data().qtdeEstAnterior,
              qtdeEstAtual: doc.data().qtdeEstAtual,
              valorEstAnterior: doc.data().valorEstAnterior,
              valorEstAtual: doc.data().valorEstAtual,
              cadastro: doc.data().cadastro,
              cadastroFormated: format(doc.data().cadastro.toDate(), 'dd/MM/yyyy'),
              user: doc.data().user,
            })
          })
          setEstoques(listaEstoques);
        })
    }
  }

  function handleChangeFornecedores(e) {
    setFornecedoresSelected(e.target.value);
  }

  async function handleChangeProdutos(e) {
    await setProdutosSelected(e.target.value);
    setQtdeEstAnterior('0,000');
    setValorEstAnterior('0,00');

    buscaEstoqueAnterior()
  }

  function buscaEstoqueAnterior() {
    let busca = document.getElementById("codProdx");  // Select
    let codigoPro = parseInt(busca.options[busca.selectedIndex].text);

    let lanc = document.getElementById("cdLanc");   //Input
    let codigoLanc = parseFloat(lanc.value);

    if (codigoPro > 0) {
      const unsub = onSnapshot(firebase.firestore().collection("estoque")
        .orderBy('codigo', 'asc')
        .where('codigo', '<', codigoLanc)
        .where('produtoCod', '==', codigoPro)
        .limitToLast(1),
        (snapshot) => {
          snapshot.forEach((doc) => {
            if (doc.data().qtdeEstAtual == undefined) {
              setQtdeEstAnterior('0,000');
            } else {
              setQtdeEstAnterior(doc.data().qtdeEstAtual)
            }

            if (doc.data().valorEstAtual == undefined) {
              setValorEstAnterior('0,000');
            } else {
              setValorEstAnterior(doc.data().valorEstAtual)
            }
          })
        })
      let compra = document.getElementById("qtCompra");
      let vlCompra = compra.value;
      if (vlCompra.length > 0) {
        calculaEstoque()
      }
    }
  }

  async function formataCompra(e) {  
    await setQtdeCompra(decimal3(e.target.value));
    //await setQtdeCompra(e.target.value.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }));
    calculaEstoque()
  }

  async function formataQtdeConv(e) {  
    await setQtdeEstoque(decimal3(e.target.value));
    calculaEstQtConvertida(e.target.value)
  }

  
  function calculaEstQtConvertida(qtdeConver) {
    let varQtdeConver = parseFloat(valorUS(qtdeConver));

    let busca = document.getElementById("qtEstAnt");   //Input
    let qtEst = busca.value;
    let qtEstAnt = parseFloat(valorUS(qtEst));

    let qtEstAtu = (qtEstAnt + varQtdeConver);
    setQtdeEstAtual(qtEstAtu.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }));

    let temCompra = document.getElementById("vlCompra");
    let temVlCompra = temCompra.value;
    if (temVlCompra.length > 0) {
      calculaTotalCompra();
    };
  }


  function calculaEstoque() {
    let busca = 0;
    busca = document.getElementById("txConv");  // Select
    let vlTaxa = busca.options[busca.selectedIndex].text;
    setConversao(vlTaxa);
    let vlTaxaConv = parseFloat(valorUS(vlTaxa));

    busca = document.getElementById("tpOper");  // Select
    let operador = busca.options[busca.selectedIndex].text;

    busca = document.getElementById("qtCompra");   //Input
    let qtCompr = busca.value;
    let qtCompraConv = parseFloat(valorUS(qtCompr));

    busca = document.getElementById("qtEstAnt");   //Input
    let qtEst = busca.value;
    let qtEstAnt = parseFloat(valorUS(qtEst));

    if (vlTaxa == "1,0") {
      setQtdeEstoque(qtCompraConv.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }));
    } else {
      let resultado = 0;
      if (operador === "Dividir") {
        resultado = (qtCompraConv / vlTaxaConv);
        //console.log('resultado = (qtCompraConv / vlTaxaConv):', resultado, qtCompraConv, vlTaxaConv);
      } else if (operador === "Multiplicar") {
        resultado = (qtCompraConv * vlTaxaConv);
      } else if (operador === "Somar") {
        resultado = (qtCompraConv + vlTaxaConv);
      } else if (operador === "Subtrair") {
        resultado = (qtCompraConv - vlTaxaConv);
      }
      setQtdeEstoque(resultado.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }));

      //console.log('qtEstAtu: ', qtEstAnt, resultado);
      let qtEstAtu = (qtEstAnt + resultado);
      setQtdeEstAtual(qtEstAtu.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }));
    };

    let temCompra = document.getElementById("vlCompra");
    let temVlCompra = temCompra.value;
    if (temVlCompra.length > 0) {
      calculaTotalCompra();
    };
  }

  async function formataValorCompra(e) {
    await setValorDaCompra(decimal2(e.target.value));
    calculaTotalCompra()
  }

  async function formataValorIpi(e) {
    await setValorIpi(decimal2(e.target.value));
    await setNovoIpi(decimal2(e.target.value));
    let busca = document.getElementById("vlCompra");
    let vlCompra = busca.value;
    if (vlCompra.length === 0) {
      alert("Valor da compra não pode ser zero.")
    } else {
      calculaTotalCompra()
    }
  }

  function calculaTotalCompra() {
    let busca = 0;
    let caminho = 0;
    let qtEstAtu = 0;
    let vlEstAnt = 0;
    let vlCompraConv = 0;
    let vlIpiConv = 0;

    if (qtdeEstAtual.length > 0) {
      busca = document.getElementById("qtEstAtu");   //Input
      caminho = busca.value;
      qtEstAtu = parseFloat(valorUS(caminho));
    }

    if (valorEstAnterior.length > 0) {
      busca = document.getElementById("vlEstAnt");   //Input
      caminho = busca.value;
      vlEstAnt = parseFloat(valorUS(caminho));
    }

    if (valorDaCompra.length > 0) {
      busca = document.getElementById("vlCompra");
      caminho = busca.value;
      vlCompraConv = parseFloat(valorUS(caminho));
    }

    if (valorIpi.length > 0) {
      busca = document.getElementById("vlIpi");
      caminho = busca.value;
      vlIpiConv = parseFloat(valorUS(caminho));
    }

    let calVlEstAtu = (vlEstAnt + vlCompraConv + vlIpiConv);
    setValorEstAtual(calVlEstAtu.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

    let calVlUnitario = 0
    if (qtEstAtu > 0) {
      calVlUnitario = (calVlEstAtu / qtEstAtu);
    }
    //usar sempre está forma de formatação
    setValorUnitario(calVlUnitario.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  }

  function limpaTela() {
    setCodigo('');
    setFornecedoresSelected('');
    setProdutosSelected('');
    setQtdeCompra('');
    setConversao('');
    setQtdeEstoque('');
    setValorDaCompra('');
    setValorIpi('');
    setNovoIpi('0,00');
    setValorUnitario('');
    setNumNf('');
    setQtdeEstAnterior('');
    setQtdeEstAtual('');
    setValorEstAnterior('');
    setValorEstAtual('');
    setEdit({});
    setDelet({});
    loadCodigo();
    carregaListaEntradas();
  }

  async function mostarLancamento(item) {
    await limpaTela()

    if (item.codigo > 0) {
      const unsub = onSnapshot(firebase.firestore().collection("estoque")
        .where('codigo', '==', item.codigo),
        (snapshot) => {
          snapshot.forEach((doc) => {
            //lancamento: doc.data().codigo,
            setCodigo(doc.data().codigo);
            setNumNf(doc.data().numNf);
            setQtdeCompra(doc.data().qtdeCompra);
            setConversao(doc.data().conversao);
            setQtdeEstoque(doc.data().qtdeEstoque);
            setValorDaCompra(doc.data().valorDaCompra);
            setValorIpi(doc.data().valorIpi);
            setValorUnitario(doc.data().valorUnitario);
            setQtdeEstAnterior(doc.data().qtdeEstAnterior);
            setQtdeEstAtual(doc.data().qtdeEstAtual);
            setValorEstAnterior(doc.data().valorEstAnterior);
            setValorEstAtual(doc.data().valorEstAtual);
          })
        })
    }

    let indexFor = fornecedores.findIndex(fornecedores => fornecedores.nomeFantasia === item.fornecedor);
    setFornecedoresSelected(indexFor);

    let indexPro = produtos.findIndex(produtos => produtos.nome === item.produto);
    setProdutosSelected(indexPro);
  }

  async function deleteEstoque(item) {
    await mostarLancamento(item);
    setEdit({});
    setDelet(item);
  }

  async function editEstoque(item) {
    await mostarLancamento(item);
    setDelet({});
    setEdit(item);
  }

  async function handleRegister(e) {
    e.preventDefault();

    if (delet?.id) {
      await firebase.firestore().collection('estoque')
        .doc(delet.id)
        .delete(delet.id)
        .then(() => {
          toast.success('Movimento de estoque excluido com sucesso!');
          limpaTela()
        })
        .catch((err) => {
          toast.error('Ops erro ao excluir, tente mais tarde.')
          console.log(err);
        })
      return;
    }

    if (edit?.id) {
      if (ano == 0 && mes == 0) {
        toast.error('Os campos ANO e MÊS tem que ser preenchidos.')
      } else if (fornecedoresSelected == undefined || fornecedoresSelected == null) {
        toast.error('O campo FORNECEDOR tem que ser preenchido.')
      } else if (produtosSelected == undefined || produtosSelected == null) {
        toast.error('O campo PRODUTO tem que ser preenchido.')
      } else if (qtdeCompra == 0 || qtdeCompra == undefined) {
        toast.error('O campo QUANTIDADE DA COMPRA tem que ser preenchido.')
      } else if (valorDaCompra == 0 || valorDaCompra == undefined) {
        toast.error('O campo VALOR DA COMPRA tem que ser preenchido.')
      } else {
        await firebase.firestore().collection('estoque')
          .doc(edit.id)
          .update({
            ano: ano,
            mes: mes,
            fornecedor: fornecedores[fornecedoresSelected].nomeFantasia,
            fornecedorId: fornecedores[fornecedoresSelected].id,
            fornecedorCod: fornecedores[fornecedoresSelected].codigo,
            produto: produtos[produtosSelected].nome,
            produtoId: produtos[produtosSelected].id,
            produtoCod: produtos[produtosSelected].codigo,
            qtdeCompra: qtdeCompra,
            conversao: conversao,
            qtdeFardo: '0,0',
            qtdeEstoque: qtdeEstoque,
            valorDaCompra: valorDaCompra,
            valorIpi: novoIpi,
            valorUnitario: valorUnitario,
            numNf: numNf,
            qtdeEstAnterior: qtdeEstAnterior,
            qtdeEstAtual: qtdeEstAtual,
            valorEstAnterior: valorEstAnterior,
            valorEstAtual: valorEstAtual,
            periodo: parseInt(ano.concat(mes)),
            cadastro: new Date(),
            user: user.nome,
            unid: produtos[produtosSelected].unid
          })
          .then(() => {
            toast.success('Movimento de entrada editado com sucesso!');
            limpaTela()
          })
          .catch((err) => {
            toast.error('Ops erro ao editar, tente mais tarde.')
            console.log(err);
          })
      }
      return;
    }

    if (ano == 0 && mes == 0) {
      toast.error('Os campos ANO e MÊS tem que ser preenchidos.')
    } else if (fornecedoresSelected == undefined || fornecedoresSelected == null) {
      toast.error('O campo FORNECEDOR tem que ser preenchido.')
    } else if (produtosSelected == undefined || produtosSelected == null) {
      toast.error('O campo PRODUTO tem que ser preenchido.')
    } else if (qtdeCompra == 0 || qtdeCompra == undefined) {
      toast.error('O campo QUANTIDADE DA COMPRA tem que ser preenchido.')
    } else if (valorDaCompra == 0 || valorDaCompra == undefined) {
      toast.error('O campo VALOR DA COMPRA tem que ser preenchido.')
    } else {
      await firebase.firestore().collection('estoque')
        .add({
          codigo: codigo,
          ano: ano,
          mes: mes,
          tipo: "Entrada",
          fornecedor: fornecedores[fornecedoresSelected].nomeFantasia,
          fornecedorId: fornecedores[fornecedoresSelected].id,
          fornecedorCod: fornecedores[fornecedoresSelected].codigo,
          produto: produtos[produtosSelected].nome,
          produtoId: produtos[produtosSelected].id,
          produtoCod: produtos[produtosSelected].codigo,
          qtdeCompra: qtdeCompra,
          conversao: conversao,
          qtdeFardo: '0,0',
          qtdeEstoque: qtdeEstoque,
          valorDaCompra: valorDaCompra,
          //valorIpi: valorIpi,
          valorIpi: novoIpi,
          valorUnitario: valorUnitario,
          numNf: numNf,
          qtdeEstAnterior: qtdeEstAnterior,
          qtdeEstAtual: qtdeEstAtual,
          valorEstAnterior: valorEstAnterior,
          valorEstAtual: valorEstAtual,
          periodo: parseInt(ano.concat(mes)),
          cadastro: new Date(),
          user: user.nome,
          unid: produtos[produtosSelected].unid
        })
        .then(() => {
          toast.success('Movimento de entrada criado com sucesso!');
          limpaTela()
        })
        .catch((err) => {
          toast.error('Ops erro ao gravar, tente mais tarde.')
          console.log(err);
        })
    }
  }

  function decimal2(v) {
    v = v.replace(/\D/g, "") // permite digitar apenas numero
    v = v.replace(/(\d{1})(\d{14})$/, "$1.$2") // coloca ponto antes dos ultimos digitos
    v = v.replace(/(\d{1})(\d{11})$/, "$1.$2") // coloca ponto antes dos ultimos 11 digitos
    v = v.replace(/(\d{1})(\d{8})$/, "$1.$2") // coloca ponto antes dos ultimos 8 digitos
    v = v.replace(/(\d{1})(\d{5})$/, "$1.$2") // coloca ponto antes dos ultimos 5 digitos
    v = v.replace(/(\d{1})(\d{1,2})$/, "$1,$2") // coloca virgula antes dos ultimos 2 digitos
    return v;
  }

  function decimal3(v) {
    v = v.replace(/\D/g, "") // permite digitar apenas numero
    v = v.replace(/(\d{1})(\d{21})$/, "$1.$2") // coloca ponto antes dos ultimos digitos
    v = v.replace(/(\d{1})(\d{18})$/, "$1.$2") // coloca ponto antes dos ultimos digitos
    v = v.replace(/(\d{1})(\d{15})$/, "$1.$2") // coloca ponto antes dos ultimos 15 digitos
    v = v.replace(/(\d{1})(\d{12})$/, "$1.$2") // coloca ponto antes dos ultimos 12 digitos
    v = v.replace(/(\d{1})(\d{9})$/, "$1.$2") // coloca ponto antes dos ultimos 9 digitos
    v = v.replace(/(\d{1})(\d{6})$/, "$1.$2") // coloca ponto antes dos ultimos 6 digitos
    v = v.replace(/(\d{1})(\d{1,3})$/, "$1,$2") // coloca virgula antes dos ultimos 3 digitos
    return v;
  }

  function valorUS(vl) {
    vl = vl.replace('.', '')
    vl = vl.replace('.', '')
    vl = vl.replace('.', '')
    vl = vl.replace(',', '.')
    return vl;
  }

  return (
    <div>
      <Principal />
      <div className="content">
        <h1>Mancini & Trindade</h1>
        <Title name="Entrada de produtos">
          <FaArrowCircleRight size={25} />
        </Title>

        <div className="containerENTR">
          <form className="form-entrada" autoComplete="off" id="form" onSubmit={handleRegister} >

            <div className='grupo'>
              <label>Lançamento</label>
              <input type="text" id="cdLanc" className="codigo" value={codigo} disabled={true} />
            </div>

            <div className='grupo'>
              <label>Ano da movimentação</label>
              <select value={ano} id="ano" className="ano" onChange={trocaAno}>
                <option value=""> -- selecione -- </option>
                <option value="2022">2.022</option>
                <option value="2023">2.023</option>
                <option value="2024">2.024</option>
                <option value="2025">2.025</option>
              </select>
            </div>

            <div className='grupo'>
              <label>Mês da movimentação</label>
              <select value={mes} id="mes" className="mes" onChange={trocaMes}>
                <option value=""> -- selecione -- </option>
                <option value="1">Janeiro</option>
                <option value="2">Fevereiro</option>
                <option value="3">Março</option>
                <option value="4">Abril</option>
                <option value="5">Maio</option>
                <option value="6">Junho</option>
                <option value="7">Julho</option>
                <option value="8">Agosto</option>
                <option value="9">Setembro</option>
                <option value="10">Outubro</option>
                <option value="11">Novembro</option>
                <option value="12">Dezembro</option>
              </select>
            </div>

            <div className='grupo'>
              <label>Fornecedor do produto</label>
              {loadFornecedores ? (
                <input type="text" disabled={true} value="Carregando os fornecedores dos produtos..." />
              ) : (
                <select id="buscaForn" className='fornecedor' value={fornecedoresSelected} onChange={handleChangeFornecedores} >
                  <option value=""> -- selecione -- </option>
                  {fornecedores.map((item, index) => {
                    return (
                      <option key={item.id} value={index} >
                        {item.nomeFantasia}
                      </option>
                    )
                  })}
                </select>
              )}
            </div>

            <div className='grupo'>
              <label>Numero da NFe</label>
              <input id="nuNf" className="nf" type="text" placeholder="" value={numNf} onChange={(e) => setNumNf(e.target.value)} />
            </div>

            {/* ESTE CAMPO ESTÁ INVISIVEL */}
            <select id="codProdx" className="codProdx" value={produtosSelected} onChange={handleChangeProdutos} disabled={true} >
              <option value=""></option>
              {produtos.map((item, index) => {
                return (
                  <option key={item.id} value={index} >
                    {item.codigo}
                  </option>
                )
              })}
            </select>

            <div className='grupo'>
              <label>Produto</label>
              {loadProdutos ? (
                <input type="text" disabled={true} value="Carregando os produtos..." />
              ) : (
                <select className='produto' value={produtosSelected} onChange={handleChangeProdutos} >
                  <option value=""> -- selecione -- </option>
                  {produtos.map((item, index) => {
                    return (
                      <option key={item.id} value={index} >
                        {item.nome}
                      </option>
                    )
                  })}
                </select>
              )}
            </div>

            <div className='grupo'>
              <label>Quantidade comprada</label>
              <input type="text" id="qtCompra" className='qtCompra' placeholder="" value={qtdeCompra} onChange={formataCompra} />
            </div>

            <div className='grupo'>
              <label>Taxa de conversão</label>
              <select id="txConv" className="txConv" value={produtosSelected} onChange={handleChangeProdutos} disabled={true} >
                <option value=""></option>
                {produtos.map((item, index) => {
                  return (
                    <option key={item.id} value={index} disabled={true} >
                      {item.conversao}
                    </option>
                  )
                })}
              </select>
            </div>

            <div className='grupo'>
              <label>Quantidade convertida</label>
              <input type="text" id="qtEstoque" className='qtEstoque' placeholder="" value={qtdeEstoque} onChange={formataQtdeConv} />
            </div>

            {/* ESTE CAMPO ESTÁ INVISIVEL */}
            <select id="tpOper" className="tpOper" value={produtosSelected} onChange={handleChangeProdutos} >
              <option value="">Operador para conversão</option>
              {produtos.map((item, index) => {
                return (
                  <option key={item.id} value={index} >
                    {item.operador}
                  </option>
                )
              })}
            </select>

            <div className='grupo'>
              <label>Estoque anterior</label>
              <input type="text" id="qtEstAnt" className='qtEstAnt' placeholder="" value={qtdeEstAnterior} disabled={true} />
            </div>

            <div className='grupo'>
              <label>Estoque atual</label>
              <input type="text" id="qtEstAtu" className='qtEstAtu' placeholder="" value={qtdeEstAtual} disabled={true} />
            </div>

            <div className='grupo'>
              <label>Valor estoque anterior</label>
              <input type="text" id="vlEstAnt" className='vlEstAnt' placeholder="" value={valorEstAnterior} disabled={true} />
            </div>

            <div className='grupo'>
              <label>Valor total do produto</label>
              <input type="text" id="vlCompra" className='vlCompra' placeholder="" value={valorDaCompra} onChange={formataValorCompra} />
            </div>

            <div className='grupo'>
              <label>Valor total do IPI</label>
              <input type="text" id="vlIpi" className='vlIpi' placeholder="" value={valorIpi} onChange={formataValorIpi} />
            </div>

            <div className='grupo'>
              <label>Valor do estoque atual</label>
              <input type="text" id="vlEstAtu" className='vlEstAtu' placeholder="" value={valorEstAtual} disabled={true} />
            </div>

            <div className='grupo'>
              <label>Custo médio</label>
              <input type="text" id="vlUnitario" className='vlUnitario' placeholder="" value={valorUnitario} disabled={true} />
            </div>

            <div className='grupoBTN'>
              {Object.keys(edit).length > 0 ? (
                <button className="btn-register" style={{ backgroundColor: '#6add39' }} type="submit">Atualizar</button>
              ) : Object.keys(delet).length > 0 ? (
                <button className="btn-register" style={{ backgroundColor: '#f63535' }} type="submit">Excluir</button>
              ) : (
                <button className="btn-register" type="submit">Cadastrar</button>
              )}
              <button className="btn-register2" type="button" onClick={limpaTela}>Cancelar</button>
              <button className="btn-register2" type="button" onClick={(e) => CriaPDF(estoques, anoMes)}>Imprimir</button>
            </div>

          </form>
        </div>
      </div>

      <article>
        {estoques.length === 0 ? (
          <div className="container dashboard">
            <span>Nenhum movimento de entrada cadastrado neste período...</span>
          </div>
        ) : (
          <>
            <table className='table_Entrada'>
              <thead className='thead_Entrada'>
                <tr>
                  <th scope="col">Lanc.</th>
                  <th scope="col">Fornecedor</th>
                  <th scope="col">Produto</th>
                  <th scope="col">Entrada</th>
                  <th scope="col">Conversão</th>
                  <th scope="col">Estoque</th>
                  <th scope="col">Valor</th>
                  <th scope="col">IPI</th>
                  <th scope="col">Custo Médio</th>
                  <th scope="col">Ação</th>
                </tr>
              </thead>
              <tbody className='tbody_Entrada'>
                {estoques.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td data-label="Lanc.">{item.codigo}</td>
                      <td data-label="Fornecedor">{item.fornecedor}</td>
                      <td data-label="Produto">{item.produto}</td>
                      <td data-label="Entrada">{item.qtdeCompra}</td>
                      <td data-label="Conversão">{item.conversao}</td>
                      <td data-label="Estoque">{item.qtdeEstoque}</td>
                      <td data-label="Valor">{item.valorDaCompra}</td>
                      <td data-label="Ipi">{item.valorIpi}</td>
                      <td data-label="Custo Médio">{item.valorUnitario}</td>
                      <td data-label="Ação">
                        <button className="action" style={{ backgroundColor: '#6add39' }} onClick={() => editEstoque(item)}>
                          <FiEdit2 color="#FFF" size={15} />
                        </button>

                        <button className="action" style={{ backgroundColor: '#f63535' }} onClick={() => deleteEstoque(item)}>
                          <RiDeleteBin3Line color="#FFF" size={15} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </>
        )}
      </article>
    </div>
  )
}

