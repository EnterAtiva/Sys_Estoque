import { useState, useEffect, useContext } from 'react';
import firebase from '../../services/firebaseConnection';
import { useHistory, useParams } from 'react-router-dom';
import Principal from '../../components/Menus/Principal';
import Title from '../../components/Title';
import { AuthContext } from '../../contexts/auth';
import { toast } from 'react-toastify';
import './lista.css';
import { FiEdit2 } from 'react-icons/fi';
import { RiDeleteBin3Line } from 'react-icons/ri';
import { FaBox, FaArrowCircleRight, FaRegFilePdf, FaFileAlt } from 'react-icons/fa';
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
    async function loadProdutos() {
      const unsub = onSnapshot(firebase.firestore().collection("produto")
        .orderBy('nome', 'asc'),
        (snapshot) => {
          let listaProduto = [];

          snapshot.forEach((doc) => {
            listaProduto.push({
              id: doc.id,
              codigo: doc.data().codigo,
              nome: doc.data().nome
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
  }, []);

  function buscaAnoMes() {
    let ano = document.getElementById("ano");
    let vlAno = ano.options[ano.selectedIndex].text;

    let mes = document.getElementById("mes");
    let vlMes = mes.options[mes.selectedIndex].text;

    setAnoMes(vlMes + " de " + vlAno);
  }

  async function trocaAno(e) {
    await setAno(e.target.value);

    let prod = document.getElementById("nomProd");
    let vlProd = prod.value;
    carregaListaEstoques(e.target.value, mes, vlProd);
    buscaAnoMes();
  }

  async function trocaMes(e) {
    await setMes(e.target.value);

    let prod = document.getElementById("nomProd");
    let vlProd = prod.value;
    carregaListaEstoques(ano, e.target.value, vlProd);
    buscaAnoMes();
  }

  function handleChangeProdutos(e) {
    setProdutosSelected(e.target.value);
    carregaListaEstoques(ano, mes, e.target.value);
  }

  function carregaListaEstoques(ano, mes, vlProd) {
    if (ano !== 0 && mes !== 0 && vlProd == 0) {
      const unsub = onSnapshot(firebase.firestore().collection("estoque")
        .orderBy('produto')
        .orderBy('codigo', 'asc')
        .where("ano", "==", ano)
        .where("mes", "==", mes),
        (snapshot) => {
          let listaEstoques = [];
          snapshot.forEach((doc) => {
            let compra = "0,000";
            let fardo = "0,0";
            if (doc.data().fornecedorCod !== 0) {
              compra = doc.data().qtdeCompra
            } else {
              fardo = doc.data().qtdeFardo
            };
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
              //qtdeCompra: doc.data().qtdeCompra,
              qtdeCompra: compra,
              qtdeFardo: fardo,
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
              unid: doc.data().unid,
            })
          })
          setEstoques(listaEstoques);
        })
    } else if (ano !== 0 && mes !== 0 && vlProd !== 0) {
      const unsub = onSnapshot(firebase.firestore().collection("estoque")
        .orderBy('produto')
        .orderBy('codigo', 'asc')
        .where("ano", "==", ano)
        .where("mes", "==", mes)
        .where("produtoCod", "==", parseInt(vlProd)),
        (snapshot) => {
          let listaEstoques = [];
          let compra = "0,000";
          let fardo = "0,0";
          snapshot.forEach((doc) => {
            if (doc.data().fornecedorCod !== 0) {
              compra = doc.data().qtdeCompra
            } else {
              fardo = doc.data().qtdeFardo
            };
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
              //qtdeCompra: doc.data().qtdeCompra,
              qtdeCompra: compra,
              qtdeFardo: fardo,
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
              unid: doc.data().unid,
            })
          })
          setEstoques(listaEstoques);
        })
    }
  }

  function limpaTela() {
    setProdutosSelected('');
    carregaListaEstoques(ano, mes, 0);
  }

  async function handleRegister(e) {
    e.preventDefault();
  }

  return (
    <div>
      <Principal />
      <div className="content">
        <h1>Mancini & Trindade</h1>
        <Title name="Lista Movimentação de Estoque">
          <FaFileAlt size={25} />
        </Title>

        <div className="containerLISTA">
          <form className="form-lista" autoComplete="off" id="form" onSubmit={handleRegister} >

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
              <label>Produto</label>
              {loadProdutos ? (
                <input type="text" disabled={true} value="Carregando os produtos..." />
              ) : (
                <select className='produto' id="nomProd" value={produtosSelected} onChange={handleChangeProdutos} >
                  <option value=""> -- selecione -- </option>
                  {produtos.map((item, index) => {
                    return (
                      <option key={item.id} value={item.codigo} >
                        {item.nome}
                      </option>
                    )
                  })}
                </select>
              )}
            </div>

            <div className='grupoBTN'>
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
            <table className='table_Lista'>
              <thead className='thead_Lista'>
                <tr>
                  <th scope="col">Lanc.</th>
                  <th scope="col">Produto</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Compra</th>
                  <th scope="col">Inventario</th>
                  <th scope="col">Conversão</th>
                  <th scope="col">Qtde.</th>
                  <th scope="col">Estoque</th>
                  <th scope="col">Unid.</th>
                  <th scope="col">Valor</th>
                  <th scope="col">IPI</th>
                  <th scope="col">Valor Estoque</th>
                </tr>
              </thead>
              <tbody className='tbody_Lista'>
                {estoques.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td data-label="Lanc.">{item.codigo}</td>
                      <td data-label="Produto">{item.produto}</td>
                      <td data-label="Tipo">{item.tipo}</td>
                      <td data-label="Compra">{item.qtdeCompra}</td>
                      <td data-label="Inventario">{item.qtdeFardo}</td>
                      <td data-label="Conversão">{item.conversao}</td>
                      <td data-label="Qtde.">{item.qtdeEstoque}</td>
                      <td data-label="Estoque">{item.qtdeEstAtual}</td>
                      <td data-label="Unid.">{item.unid}</td>
                      <td data-label="Valor">{item.valorDaCompra}</td>
                      <td data-label="Ipi">{item.valorIpi}</td>
                      <td data-label="Valor Estoque">{item.valorEstAtual}</td>
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

