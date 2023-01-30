import { useState, useEffect, useContext } from 'react';
import firebase from '../../services/firebaseConnection';
import { useHistory, useParams } from 'react-router-dom';
import Movimento from '../../components/Menus/Movimento';
import Title from '../../components/Title';
import { AuthContext } from '../../contexts/auth';
import { toast } from 'react-toastify';
import './inventario.css';
import { RiDeleteBin3Line } from 'react-icons/ri';
import { FaBox, FaFileSignature, FaRegFilePdf } from 'react-icons/fa';
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


export default function Inventario() {
  const [qtdeInventario, setQtdeInventario] = useState('');
  const [tipoMovimento, setTipoMovimento] = useState('');
  const [invSaida, setInvSaida] = useState('');
  const [invEntrada, setInvEntrada] = useState('');
  const [ajusteEstoque, setAjusteEstoque] = useState('');

  const [loadProdutos, setLoadProdutos] = useState(true);
  const [produtos, setProdutos] = useState([]);
  const [produtosSelected, setProdutosSelected] = useState();
  const [codigo, setCodigo] = useState('');
  const [ano, setAno] = useState('');
  const [mes, setMes] = useState('');
  const [anoMes, setAnoMes] = useState('');
  const [qtdeCompra, setQtdeCompra] = useState('');
  const [qtdeEstoque, setQtdeEstoque] = useState('');
  const [conversao, setConversao] = useState('');
  const [inventarios, setInventarios] = useState([]);
  const [vlInven, setVlInven] = useState('0,000');
  const [codProduto, setCodProduto] = useState('');

  const [valorDaCompra, setValorDaCompra] = useState('');
  const [qtdeEstAnterior, setQtdeEstAnterior] = useState('');
  const [qtdeEstAtual, setQtdeEstAtual] = useState('0,000');
  const [valorEstAnterior, setValorEstAnterior] = useState('0,00');
  const [valorEstAtual, setValorEstAtual] = useState('0,00');
  const [valorUnitario, setValorUnitario] = useState('');

  const { id } = useParams();
  const history = useHistory();
  const [delet, setDelet] = useState({});
  const { user } = useContext(AuthContext);

  useEffect(() => {
    async function loadProdutos() {
      const unsub = onSnapshot(firebase.firestore().collection('produto')
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
              tipo: doc.data().tipo,
            })
          })

          if (listaProduto.length === 0) {
            console.log('NENHUM PRODUTO ENCONTRADO.');
            setProdutos([{ id: '1', nome: 'Sem cadastros.' }]);
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

  function loadCodigo() {
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

  function carregaListaInventario(ano, mes) {
    //if (ano !== null && mes !== null) {
    if (ano && mes) {
      const unsub = onSnapshot(firebase.firestore().collection("estoque")
        .orderBy('produto')
        .orderBy('codigo')
        .where("ano", "==", ano)
        .where("mes", "==", mes)
        .where("fornecedor", "==", 'INVENTARIO'),
        (snapshot) => {
          let listaInventario = [];

          snapshot.forEach((doc) => {
            listaInventario.push({
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
              qtdeEstAnterior: doc.data().qtdeEstAnterior,
              qtdeCompra: doc.data().qtdeCompra,
              qtdeEstoque: doc.data().qtdeEstoque,
              qtdeEstAtual: doc.data().qtdeEstAtual,
              valorEstAtual: doc.data().valorEstAtual,
              unid: doc.data().unid,
              cadastro: doc.data().cadastro,
              cadastroFormated: format(doc.data().cadastro.toDate(), 'dd/MM/yyyy'),
              user: doc.data().user,
            })
          })
          setInventarios(listaInventario);
        })
    }
  }

  function buscaAnoMes() {
    let ano = document.getElementById("idAno");
    let vlAno = ano.options[ano.selectedIndex].text;

    let mes = document.getElementById("idMes");
    let vlMes = mes.options[mes.selectedIndex].text;

    setAnoMes(vlMes + " de " + vlAno);
  }

  //Chamado quando troca o ANO   
  function handleChangeAno(e) {
    setAno(e.target.value);
    carregaListaInventario(e.target.value, mes)
    buscaAnoMes()
  }

  //Chamado quando troca o MÊS 
  function handleChangeMes(e) {
    setMes(e.target.value);
    carregaListaInventario(ano, e.target.value)
    buscaAnoMes()
  }

  //Chamado quando troca o PRODUTO
  async function handleChangeProdutos(e) {
    await setProdutosSelected(e.target.value);

    setQtdeEstAnterior('0,000');
    setValorEstAnterior('0,00');
    setAjusteEstoque('0,000');

    let busca = 0;
    busca = document.getElementById("codProd");  // Select
    let codPro = parseInt(busca.options[busca.selectedIndex].text);

    busca = document.getElementById("cdLanc");   //Input
    let codLan = parseFloat(busca.value);

    buscaEstoqueAnterior(codPro, codLan);
  }

  async function buscaEstoqueAnterior(codPro, codLan) {   // aqui
    let busca = 0;
    let xxQtdeInv = 0;

    busca = document.getElementById("qtInvent");   //Input
    let xxQtde = busca.value;
    if (xxQtde > 0 || xxQtde !== NaN) {
      xxQtdeInv = xxQtde;
    }

    let xxQtdeEstAnt = '0,000';
    let xxValorEstAnt = '0,00';

    if (codPro > 0) {
      await firebase.firestore().collection("estoque")
        .orderBy('codigo', 'asc')
        .where('codigo', '<', codLan)
        .where('produtoCod', '==', codPro)
        .limitToLast(1)
        .get()
        .then(function (busca) {
          busca.forEach((doc) => {
            if (doc.data().qtdeEstAtual !== "") {
              setQtdeEstAnterior(doc.data().qtdeEstAtual);
              xxQtdeEstAnt = doc.data().qtdeEstAtual;
            } else {
              setQtdeEstAnterior('0,000');
              xxQtdeEstAnt = '0,000';
            }

            if (doc.data().valorEstAtual == undefined) {
              setValorEstAnterior('0,00');
              xxValorEstAnt = '0,00';
            } else {
              setValorEstAnterior(doc.data().valorEstAtual);
              xxValorEstAnt = doc.data().valorEstAtual;
            }
            calculaEstoque(xxQtdeInv, xxQtdeEstAnt, xxValorEstAnt);
          })
        })
    }
  }

  async function formataValorMovimento(e) {  //gui
    await setValorDaCompra(decimal2(e.target.value));
    setValorEstAtual(decimal2(e.target.value));

    let qtEstAtual = 0;
    let vlEst = parseFloat(valorUS(e.target.value));

    if (qtdeEstAtual) {
      qtEstAtual = parseFloat(valorUS(qtdeEstAtual));
    };

    let vlUni = (vlEst / qtEstAtual);
    setValorUnitario(vlUni.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  }

  function calculaEstoque(qtdeInv, qtdeEstAnte, valorEstAnte) { //aqui
    let busca = 0;
    let xxQtdeInv = '0,000';

    busca = document.getElementById("qtInvent");   //Input
    let xxQtde = busca.value;
    if (xxQtde > 0 || xxQtde !== NaN) {
      xxQtdeInv = parseFloat(valorUS(xxQtde));;
    }

    let qtdeInvConv = '0,000';
    let qtdeEstAnteConv = '0,000';
    let valorEstAnteConv = '0,00';
    let qtdeAjuste = 0;

    if (qtdeInv !== "") {
      qtdeInvConv = parseFloat(valorUS(qtdeInv));
    } else {
      qtdeInvConv = 0;
    };

    if (qtdeEstAnte !== "") {
      qtdeEstAnteConv = parseFloat(valorUS(qtdeEstAnte));
    } else {
      qtdeEstAnteConv = 0;
    };

    if (valorEstAnte !== "") {
      valorEstAnteConv = parseFloat(valorUS(valorEstAnte));
    } else {
      valorEstAnteConv = 0;
    };

    let qtInveConv = 0;
    let qtEstAnt = 0;
    let tipoMov = "";

    setQtdeEstAtual(qtdeInv);

    //console.log('qtdeInvConv: ', qtdeInvConv);
    //if (qtdeInvConv >= 0) {
    if (qtdeEstAnteConv >= qtdeInvConv) {
      setTipoMovimento('Saida');
      tipoMov = "Saida";
      setInvSaida('SIM');
      setInvEntrada('');
      qtdeAjuste = (qtdeEstAnteConv - qtdeInvConv);
      setAjusteEstoque(qtdeAjuste.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }));
    } else {
      setTipoMovimento('Entrada');
      tipoMov = "Entrada";
      //setTipoMovimento('O inventario não pode ser maior que o estoque atual.');
      if (qtdeInvConv > 0) {
        qtdeAjuste = (qtdeInvConv - qtdeEstAnteConv);
        setAjusteEstoque(qtdeAjuste.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }));
      } else {
        setAjusteEstoque(qtdeInvConv.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }));
      }
      setInvSaida('');
      setInvEntrada('SIM');
    }
    //}

    if (valorEstAnteConv > 0) {
      let vlUni = (valorEstAnteConv / qtdeEstAnteConv);
      let vlInv = 0;
      let vlEstAtu = 0;
      //console.log('tipoMov: ', tipoMov);
      if (tipoMov == "Saida") {
        vlInv = (vlUni * (qtdeEstAnteConv - qtdeInvConv));
        vlEstAtu = (valorEstAnteConv - vlInv);
      } else {
        vlInv = (vlUni * (qtdeEstAnteConv + qtdeInvConv));
        vlEstAtu = (valorEstAnteConv + vlInv);
      }

      setValorDaCompra(vlInv.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      setValorEstAtual(vlEstAtu.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      setValorUnitario(vlUni.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      /*
      let vlEstAtu = 0;
      if (vlInv > 0) {
        vlEstAtu = (valorEstAnteConv - vlInv);
      } else {
        vlEstAtu = (valorEstAnteConv + vlInv);
      }
      setValorEstAtual(vlEstAtu.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      */
    } else {
      setValorDaCompra('');
      setValorEstAtual('');
      setValorUnitario('');
    };
  }

  async function formataInventario(e) {
    await setQtdeInventario(decimal3(e.target.value));
    calculaEstoque(e.target.value, qtdeEstAnterior, valorEstAnterior)
  }

  async function mostarLancamento(item) {
    limpaTela()

    if (item.codigo > 0) {
      const unsub = onSnapshot(firebase.firestore().collection("estoque")
        .where('codigo', '==', item.codigo),
        (snapshot) => {
          snapshot.forEach((doc) => {
            setCodigo(doc.data().codigo);
            setTipoMovimento(doc.data().tipo);
            setQtdeInventario(doc.data().qtdeCompra);
            setAjusteEstoque(doc.data().qtdeEstoque);
            setValorUnitario(doc.data().valorUnitario);
            setQtdeEstAnterior(doc.data().qtdeEstAnterior);
            setQtdeEstAtual(doc.data().qtdeEstAtual);
            setValorEstAnterior(doc.data().valorEstAnterior);
            setValorEstAtual(doc.data().valorEstAtual);
            setValorDaCompra(doc.data().valorDaCompra);
          })
        })
    }

    let indexPro = produtos.findIndex(produtos => produtos.nome === item.produto);
    setProdutosSelected(indexPro);
  }

  async function deleteInventario(item) {
    await mostarLancamento(item);
    setDelet(item);
  }

  function limpaTela() {
    setCodigo('');
    setQtdeInventario('');
    setTipoMovimento('');
    setAjusteEstoque('');
    setProdutosSelected('');
    setConversao('');
    setQtdeEstoque('');
    setValorUnitario('');
    setValorDaCompra('');
    setQtdeEstAnterior('');
    setQtdeEstAtual('');
    setValorEstAnterior('');
    setValorEstAtual('');
    setInvSaida('');
    setInvEntrada('');
    setDelet({});
    loadCodigo();
    //carregaListaInventario();
  }

  async function handleRegister(e) {
    e.preventDefault();

    // Excluindo o movimento de saída de inventario
    if (delet?.id) {
      await firebase.firestore().collection('estoque')
        .doc(delet.id)
        .delete(delet.id)
        .then(() => {
          toast.success('Movimento de inventario deletedo com sucesso!');
          limpaTela()
          carregaListaInventario()
        })
        .catch((err) => {
          toast.error('Ops erro ao excluir, tente mais tarde.')
          console.log(err);
        })
      return;
    }

    //  Cadastrar o movimento  gerado pelo INVENTARIO
    if (tipoMovimento != "O inventario não pode ser maior que o estoque atual.") {
      if (ano == 0 && mes == 0) {
        toast.error('Os campos ANO e MÊS tem que ser preenchidos.')
      } else if (produtosSelected == undefined || produtosSelected == null) {
        toast.error('O campo PRODUTO tem que ser preenchido.')
      } else {
        firebase.firestore().collection('estoque')
          .add({
            codigo: codigo,
            ano: ano,
            mes: mes,
            tipo: tipoMovimento,
            fornecedor: "INVENTARIO",
            fornecedorId: "jvG7ZqZG9h46nVmrcyes",
            fornecedorCod: 0,
            produto: produtos[produtosSelected].nome,
            produtoId: produtos[produtosSelected].id,
            produtoCod: produtos[produtosSelected].codigo,
            qtdeCompra: qtdeInventario,    //aqui vai o valor da contagem no inventario
            conversao: '0,000',
            qtdeEstoque: ajusteEstoque,   //aqui vai o ajuste do estoque, gerado pela contagem do inventario
            valorDaCompra: valorDaCompra,
            valorIpi: '0,00',
            valorUnitario: valorUnitario,
            numNf: '',
            qtdeEstAnterior: qtdeEstAnterior,
            qtdeEstAtual: qtdeEstAtual,
            valorEstAnterior: valorEstAnterior,
            valorEstAtual: valorEstAtual,
            unid: produtos[produtosSelected].tipo,
            periodo: parseInt(ano.concat(mes)),
            cadastro: new Date(),
            user: user.nome
          })
          .then(() => {
            toast.success('Movimento de saída de inventario criado com sucesso!');
            limpaTela();
            carregaListaInventario();
          })
          .catch((err) => {
            toast.error('Ops erro ao gravar o inventario, tente mais tarde.')
            console.log(err);
          })
      }
    } else {
      alert("O inventario não pode ser maior que o estoque atual.");
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
    v = v.replace(/(\d{1})(\d{15})$/, "$1.$2") // coloca ponto antes dos ultimos digitos
    v = v.replace(/(\d{1})(\d{12})$/, "$1.$2") // coloca ponto antes dos ultimos 12 digitos
    v = v.replace(/(\d{1})(\d{9})$/, "$1.$2") // coloca ponto antes dos ultimos 9 digitos
    v = v.replace(/(\d{1})(\d{6})$/, "$1.$2") // coloca ponto antes dos ultimos 6 digitos
    v = v.replace(/(\d{1})(\d{1,3})$/, "$1,$2") // coloca virgula antes dos ultimos 3 digitos
    return v;
  }

  function valorUS(vl) {
    vl = vl.replace('.', '')
    vl = vl.replace(',', '.')
    return vl;
  }

  return (
    <div>
      <Movimento />
      <div className="content">
        <h1>Mancini & Trindade</h1>
        <Title name="Inventario Mensal">
          <FaFileSignature size={25} />
        </Title>

        <div className="containerINVEN">
          <form className="form-inventario" autoComplete="off" id="form" onSubmit={handleRegister} >

            <div className='grupo'>
              <label>Lançamento</label>
              <input type="text" id="cdLanc" className="codigo" value={codigo} disabled={true} />
            </div>

            <div className='grupo'>
              <label>Ano da movimentação</label>
              <select value={ano} id="idAno" className="ano" onChange={handleChangeAno}>
                <option value=""> -- selecione -- </option>
                <option value="2022">2.022</option>
                <option value="2023">2.023</option>
                <option value="2024">2.024</option>
                <option value="2025">2.025</option>
              </select>
            </div>

            <div className='grupo'>
              <label>Mês da movimentação</label>
              <select value={mes} id="idMes" className="mes" onChange={handleChangeMes}>
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
              <label>Produto</label>
              {loadProdutos ? (
                <input type="text" disabled={true} value="Carregando os produtos..." />
              ) : (
                <select className="prod" value={produtosSelected} onChange={handleChangeProdutos} >
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

            {/* ESTE CAMPO ESTÁ INVISIVEL */}
            <select id="codProd" className="codProdX" value={produtosSelected} onChange={handleChangeProdutos} disabled={true} >
              <option value="">Código</option>
              {produtos.map((item, index) => {
                return (
                  <option key={item.id} value={index} >
                    {item.codigo}
                  </option>
                )
              })}
            </select>

            {/* ESTE CAMPO ESTÁ INVISIVEL */}
            <select id="txConv" className="txConv" value={produtosSelected} onChange={handleChangeProdutos} >
              <option value="">Valor para conversão.</option>
              {produtos.map((item, index) => {
                return (
                  <option key={item.id} value={index} disabled={true} >
                    {item.conversao}
                  </option>
                )
              })}
            </select>

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

            {/* ESTE CAMPO ESTÁ INVISIVEL */}
            <select id="proTipo" className="proTipo" value={produtosSelected} onChange={handleChangeProdutos} >
              <option value="">Unidade de estoque</option>
              {produtos.map((item, index) => {
                return (
                  <option key={item.id} value={index} >
                    {item.tipo}
                  </option>
                )
              })}
            </select>

            <div className='grupo'>
              <label>Estoque anterior</label>
              <input type="text" id="qtEstAnt" className='qtEstAnt' placeholder="0,000" value={qtdeEstAnterior} disabled={true} />
            </div>

            <div className='grupo'>
              <label>Quantidade do inventario</label>
              <input type="text" id="qtInvent" className="qtInvent" placeholder="" value={qtdeInventario} onChange={formataInventario} />
            </div>

            <div className='grupo'>
              <label>Movimento de</label>
              {Object.keys(invSaida).length > 0 ? (
                <input type="text" id="tpMovim" className="tpMovim" style={{ backgroundColor: '#db7b80' }} placeholder="" value={tipoMovimento} disabled={true} />
              ) : Object.keys(invEntrada).length > 0 ? (
                <input type="text" id="tpMovim" className="tpMovim" style={{ backgroundColor: '#89ca6d' }} placeholder="" value={tipoMovimento} disabled={true} />
              ) : (
                <input type="text" id="tpMovim" className="tpMovim" style={{ backgroundColor: '#FFF' }} placeholder="" value={tipoMovimento} disabled={true} />
              )}
            </div>

            <div className='grupo'>
              <label>Estoque atual</label>
              <input type="text" id="qtEstAtu" className='qtEstAtu' placeholder="0,000" value={qtdeEstAtual} disabled={true} />
            </div>

            <div className='grupo'>
              <label>Ajuste de estoque</label>
              <input type="text" id="ajuEstoque" className="ajuEstoque" placeholder="0,000" value={ajusteEstoque} disabled={true} />
            </div>

            <div className='grupo'>
              <label>Valor do estoque anterior</label>
              <input type="text" id="vlEstAnt" className='vlEstAnt' placeholder="0,00" value={valorEstAnterior} disabled={true} />
            </div>

            <div className='grupo'>
              <label>Valor da movimentação</label>
              <input type="text" id="vlCompra" className='vlCompra' placeholder="" value={valorDaCompra} onChange={formataValorMovimento} />
            </div>

            <div className='grupo'>
              <label>Valor do estoque atual</label>
              <input type="text" id="vlEstAtu" className='vlEstAtu' placeholder="0,00" value={valorEstAtual} disabled={true} />
            </div>

            <div className='grupoBTN'>
              {Object.keys(delet).length > 0 ? (
                <button className="btn-register" style={{ backgroundColor: '#f63535' }} type="submit">Excluir movimento de inventario</button>
              ) : (
                <button className="btn-register" type="submit">Cadastrar movimento de inventario</button>
              )}
              <button className="btn-register2" type="button" onClick={limpaTela}>Cancelar</button>
              <button className="btn-register3" type="button" onClick={(e) => CriaPDF(inventarios, anoMes)}>      
                <FaRegFilePdf color="#FFF" size={20}/>  Gerar PDF</button>
            </div>
          </form>
        </div>
      </div>

      <article>
        {inventarios.length === 0 ? (
          <div className="container dashboard">
            <span>Nenhum movimento de inventario cadastrado neste período...</span>
          </div>
        ) : (
          <>
            <table className='table_Inventario'>
              <thead className='thead_Inventario'>
                <tr>
                  <th scope="col">Lanç.</th>
                  <th scope="col">Produto</th>
                  <th scope="col">Anterior</th>
                  <th scope="col">Inventario</th>
                  <th scope="col">Ajuste</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Atual</th>
                  <th scope="col">Unid.</th>
                  <th scope="col">Valor</th>
                  <th scope="col">Cadastro</th>
                  <th scope="col">Ação</th>
                </tr>
              </thead>
              <tbody className='tbody_Inventario'>
                {inventarios.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td data-label="Lanç.">{item.codigo}</td>
                      <td data-label="Produto">{item.produto}</td>
                      <td data-label="Anterior">{item.qtdeEstAnterior}</td>
                      <td data-label="Inventario">{item.qtdeCompra}</td>
                      <td data-label="Ajuste">{item.qtdeEstoque}</td>
                      <td data-label="Tipo">{item.tipo}</td>
                      <td data-label="Atual">{item.qtdeEstAtual}</td>
                      <td data-label="Unid.">{item.unid}</td>
                      <td data-label="Valor">{item.valorEstAtual}</td>
                      <td data-label="Cadastro">{item.user}</td>
                      <td data-label="Ação">
                        <button className="action" style={{ backgroundColor: '#f63535' }} onClick={() => deleteInventario(item)}>
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
