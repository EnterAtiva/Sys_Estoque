import { useState, useEffect, useContext } from 'react';
import firebase from '../../services/firebaseConnection';
import { useHistory, useParams } from 'react-router-dom';
import Movimento from '../../components/Menus/Movimento';
import Title from '../../components/Title';
import { AuthContext } from '../../contexts/auth';
import { toast } from 'react-toastify';
import './demostrativo.css';
import { FiEdit2 } from 'react-icons/fi';
import { RiDeleteBin3Line } from 'react-icons/ri';
import { FaBox, FaRegFilePdf } from 'react-icons/fa';
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
  connectFirestoreEmulator,
  documentId
} from 'firebase/firestore';


export default function Entrada() {
  const [demonstra, setDemonstra] = useState([]);
  const [demonsEntrada, setDemonsEntrada] = useState([]);
  const [estoqueAtual, setEstoqueAtual] = useState('0,000');
  const [entraEstoque, setEntraEstoque] = useState('0,000');
  const [saiEstoque, setSaiEstoque] = useState('0,000');
  const [qtdeInventario, setQtdeInventario] = useState('');
  const [tipoMovimento, setTipoMovimento] = useState('');
  const [errInvent, setErrInvent] = useState({});
  const [ajusteEstoque, setAjusteEstoque] = useState('');

  const [loadProdutos, setLoadProdutos] = useState(true);
  const [produtos, setProdutos] = useState([]);
  const [produtosSelected, setProdutosSelected] = useState();
  const [produtosXxSelected, setProdutosXxSelected] = useState();
  const [codigo, setCodigo] = useState('');
  const [ano, setAno] = useState('');
  const [mes, setMes] = useState('');
  const [anoMes, setAnoMes] = useState('');
  const [nomeProd, setNomeProd] = useState('');
  const [qtdeCompra, setQtdeCompra] = useState('');
  const [qtdeEstoque, setQtdeEstoque] = useState('');
  const [conversao, setConversao] = useState('');
  const [estoques, setEstoques] = useState([]);
  const [vlInven, setVlInven] = useState('0,000');
  const [codProduto, setCodProduto] = useState('');

  const [qtInv, setQtInv] = useState(0);
  const [qtEntrada, setQtEntrada] = useState(0);
  const [qtSaida, setQtSaida] = useState(0);
  const [codPro, setCodPro] = useState(0);
  const [nomPro, setNomPro] = useState('');

  const { id } = useParams();
  const history = useHistory();
  const [edit, setEdit] = useState({});
  const [delet, setDelet] = useState({});
  const { user } = useContext(AuthContext);

  useEffect(() => {
    function loadProdutos() {
      const unsub = onSnapshot(firebase.firestore().collection("produto")
        .orderBy('nome', 'asc'),
        (snapshot) => {
          let listaProduto = [];

          snapshot.forEach((doc) => {
            listaProduto.push({
              id: doc.id,
              codigo: doc.data().codigo,
              nome: doc.data().nome,
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
  }, []);

  function buscaAnoMes() {
    let ano = document.getElementById("idAno");
    let vlAno = ano.options[ano.selectedIndex].text;

    let mes = document.getElementById("idMes");
    let vlMes = mes.options[mes.selectedIndex].text;

    setAnoMes(vlMes + " de " + vlAno);
  }

  async function handleChangeAno(e) {
    await setAno(e.target.value);

    Lista(e.target.value, mes, nomeProd);
    buscaAnoMes()
  }

  async function handleChangeMes(e) {
    await setMes(e.target.value);

    Lista(ano, e.target.value, nomeProd);
    buscaAnoMes()
  }

  async function handleChangeProdutos(e) {
    await setProdutosSelected(e.target.value);

    let busca = document.getElementById("prod");  // Select
    setNomeProd(busca.options[busca.selectedIndex].text);
    Lista(ano, mes, busca.options[busca.selectedIndex].text);
  }

  function Lista(ano, mes, nomeProd) {
    let ListaPro = [];

    if (ano && mes && !nomeProd) {
      produtos.forEach((item) => {
        let qtdInv = 0;
        let qtdEnt = 0;
        let qtdSai = 0;
        let pegaEstAnt = 'Sim';
        let qtdEstAnt = 0;
        let qtdEstAtu = 0;
        let vlrEstAtu = 0;
        let unid = item.tipo;

        const unsub = onSnapshot(firebase.firestore().collection("estoque")
          .orderBy('codigo', 'asc')
          .where('produto', '==', item.nome)
          .where("periodo", "==", parseInt(ano.concat(mes))),
          (snapshot) => {
            snapshot.forEach((doc) => {
              if (pegaEstAnt == 'Sim') {
                qtdEstAnt = parseFloat(valorUS(doc.data().qtdeEstAnterior));
                pegaEstAnt = 'Não';
              }
              if (doc.data().fornecedorCod == 0) {
                //qtdInv = qtdInv + parseFloat(valorUS(doc.data().qtdeCompra));
                qtdInv = parseFloat(valorUS(doc.data().qtdeCompra));
                if (doc.data().tipo == 'Entrada') {
                  qtdEnt = qtdEnt + parseFloat(valorUS(doc.data().qtdeEstoque));
                } else {
                  qtdSai = qtdSai + parseFloat(valorUS(doc.data().qtdeEstoque));
                }
              } else if (doc.data().tipo == 'Entrada') {
                qtdEnt = qtdEnt + parseFloat(valorUS(doc.data().qtdeEstoque));
              } else {
                qtdSai = qtdSai + parseFloat(valorUS(doc.data().qtdeEstoque));
              }
              qtdEstAtu = parseFloat(valorUS(doc.data().qtdeEstAtual));
              vlrEstAtu = parseFloat(valorUS(doc.data().valorEstAtual));
            })
            ListaPro.push({
              codigo: item.codigo,
              produto: item.nome,
              unid: unid,
              inventario: (new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 3 }).format(qtdInv)),
              entrada: (new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 3 }).format(qtdEnt)),
              saida: (new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 3 }).format(qtdSai)),
              anterior: (new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 3 }).format(qtdEstAnt)),
              atual: (new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 3 }).format(qtdEstAtu)),
              valor: (new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(vlrEstAtu)),
            })
          })
      })

    } else if (ano && mes && nomeProd) {

      let produtoCodigo = 0;
      let produtoNome = nomeProd;
      let unid = '';
      let qtdInv = 0;
      let qtdEnt = 0;
      let qtdSai = 0;
      let pegaEstAnt = 'Sim';
      let qtdEstAnt = 0;
      let qtdEstAtu = 0;
      let vlrEstAtu = 0;

      const unsub = onSnapshot(firebase.firestore().collection("estoque")
        .where('produto', '==', nomeProd)
        .where("periodo", "==", parseInt(ano.concat(mes))),
        (snapshot) => {
          snapshot.forEach((doc) => {
            produtoCodigo = doc.data().produtoCod;
            produtoNome = nomeProd;
            unid = doc.data().unid;

            if (pegaEstAnt == 'Sim') {
              qtdEstAnt = parseFloat(valorUS(doc.data().qtdeEstAnterior));
              pegaEstAnt = 'Não';
            }
            if (doc.data().fornecedorCod == 0) {
              //qtdInv = qtdInv + parseFloat(valorUS(doc.data().qtdeCompra));
              qtdInv = parseFloat(valorUS(doc.data().qtdeCompra));
              if (doc.data().tipo == 'Entrada') {
                qtdEnt = qtdEnt + parseFloat(valorUS(doc.data().qtdeEstoque));
              } else {
                qtdSai = qtdSai + parseFloat(valorUS(doc.data().qtdeEstoque));
              }
            } else if (doc.data().tipo == 'Entrada') {
              qtdEnt = qtdEnt + parseFloat(valorUS(doc.data().qtdeEstoque));
            } else {
              qtdSai = qtdSai + parseFloat(valorUS(doc.data().qtdeEstoque));
            }
            qtdEstAtu = parseFloat(valorUS(doc.data().qtdeEstAtual));
            vlrEstAtu = parseFloat(valorUS(doc.data().valorEstAtual));
          })
          ListaPro.push({
            codigo: produtoCodigo,
            produto: produtoNome,
            unid: unid,
            inventario: (new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 3 }).format(qtdInv)),
            entrada: (new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 3 }).format(qtdEnt)),
            saida: (new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 3 }).format(qtdSai)),
            anterior: (new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 3 }).format(qtdEstAnt)),
            atual: (new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 3 }).format(qtdEstAtu)),
            valor: (new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(vlrEstAtu)),
          })
        })
    }
    setDemonstra(ListaPro);
    console.log('ListaPro: ', ListaPro);
    setProdutosXxSelected('aaa');
  }

  function limpaTela() {
    setAno('');
    setMes('');
    setProdutosSelected('');
    setNomeProd('');
    setDemonstra('');
  }

  function limpaTela2() {
    setProdutosXxSelected('');
  }

  async function handleRegister(e) {
    e.preventDefault();
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
        <Title name="Demonstrativo do Inventario Mensal">
          <FaBox size={25} />
        </Title>

        <div className="containerDEMONSTR">
          <form className="form-demonstr" autoComplete="off" id="form" onSubmit={handleRegister} >

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
                <select id='prod' className="prod" value={produtosSelected} onChange={handleChangeProdutos} >
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
            <select id="codProdx" className="codProdx" value={produtosXxSelected} onChange={handleChangeProdutos} disabled={true} >
              <option value=""></option>
              {produtos.map((item, index) => {
                return (
                  <option key={item.id} value={index} >
                    {item.codigo}
                  </option>
                )
              })}
            </select>

            <div className='grupoBTN'>
              <button className="btn-register" type="button" onClick={limpaTela2}>Mostrar Demonstrativo</button>
              <button className="btn-register2" type="button" onClick={limpaTela}>Limpar</button>
              <button className="btn-register3" type="button" onClick={(e) => CriaPDF(demonstra, anoMes)}>      
                <FaRegFilePdf color="#FFF" size={20}/>  Gerar PDF</button>
            </div>

          </form>
        </div>
      </div>

      <article>
        {demonstra.length === 0 ? (
          <div className="container dashboard">
            <span>Nenhum movimento cadastrado neste período...</span>
          </div>
        ) : (
          <>
            <table className='table_Demonstr'>
              <thead className='thead_Demonstr'>
                <tr>
                  <th scope="col">Código</th>
                  <th scope="col">Produto</th>
                  <th scope="col">Anterior</th>
                  <th scope="col">Entrada</th>
                  <th scope="col">Saída</th>
                  <th scope="col">Inventario</th>
                  <th scope="col">Atual</th>
                  <th scope="col">Unid</th>
                  <th scope="col">Valor</th>
                </tr>
              </thead>
              <tbody className='tbody_Demonstr'>
                {demonstra.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td data-label="Código">{item.codigo}</td>
                      <td data-label="Produto">{item.produto}</td>
                      <td data-label="Anterior">{item.anterior}</td>
                      <td data-label="Entrada">{item.entrada}</td>
                      <td data-label="Saída">{item.saida}</td>
                      <td data-label="Inventario">{item.inventario}</td>
                      <td data-label="Atual">{item.atual}</td>
                      <td data-label="Unid">{item.unid}</td>
                      <td data-label="Valor">{item.valor}</td>
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
