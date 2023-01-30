import { useState, useEffect, useContext } from 'react';
import firebase from '../../services/firebaseConnection';
import { useHistory, useParams } from 'react-router-dom';
import Movimento from '../../components/Menus/Movimento';
import Title from '../../components/Title';
import { AuthContext } from '../../contexts/auth';
import { toast } from 'react-toastify';
import './saida.css';
import { FiEdit2 } from 'react-icons/fi';
import { RiDeleteBin3Line } from 'react-icons/ri';
import { FaBox } from 'react-icons/fa';
import { format, set } from 'date-fns';
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
  const [loadClientes, setLoadClientes] = useState(true);     
  const [clientes, setClientes] = useState([]);               
  //const [clientesSelected, setClientesSelected] = useState(0);  
  const [clientesSelected, setClientesSelected] = useState();  
  const [loadProdutos, setLoadProdutos] = useState(true);
  const [produtos, setProdutos] = useState([]);
  //const [produtosSelected, setProdutosSelected] = useState(0);  
  const [produtosSelected, setProdutosSelected] = useState();  
  const [codigo, setCodigo] = useState('');
  const [ano, setAno] = useState('');
  const [mes, setMes] = useState('');
  const [qtdeCompra, setQtdeSaida] = useState('');
  const [qtdeEstoque, setQtdeEstoque] = useState('');
  const [valorDaCompra, setValorDaSaida] = useState('');
  const [valorIpi, setValorIpi] = useState('');
  const [valorUnitario, setValorUnitario] = useState('');
  const [conversao, setConversao] = useState('');
  const [estoques, setEstoques] = useState([]);

  const { id } = useParams();
  const history = useHistory();
  const [edit, setEdit] = useState({});
  const [delet, setDelet] = useState({});
  const { user } = useContext(AuthContext);

  useEffect(() => {
    async function loadClientes() {
      await firebase.firestore().collection('cliente').orderBy('tipo').orderBy('nomeFantasia', 'asc').where("tipo", "!=", "Fornecedor")
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
            console.log('NENHUM CLIENTE ENCONTRADO...');
            setClientes([{ id: '1', nome: 'Sem cadastros...' }]);
            setLoadClientes(false);
            return;
          }
          setClientes(lista);
          setLoadClientes(false);
        })
        .catch((error) => {
          console.log('DEU ALGUM ERRO!', error);
          setLoadClientes(false);
          setClientes([{ id: '1', nome: '' }]);
        })
    }
    loadClientes();
  }, []);

  useEffect(() => {
    async function loadProdutos() {
      const unsub = onSnapshot(firebase.firestore().collection("produto").orderBy('nome', 'asc'), (snapshot) => {
        let listaProduto = [];

        snapshot.forEach((doc) => {
          listaProduto.push({
            id: doc.id,
            codigo: doc.data().codigo,
            nome: doc.data().nome,
            conversao: doc.data().conversao
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
    const unsub = onSnapshot(firebase.firestore().collection("estoque").orderBy('codigo', 'asc'), (snapshot) => {
      let listaCodigo = [];

      snapshot.forEach((doc) => {
        listaCodigo.push({
          codigo: doc.data().codigo,
        })
      })

      if (listaCodigo.length === 0) {
        console.log('NENHUM LANÇAMENTO ENCONTRADO...');
        setCodigo(1);
      } else {
        let xx = listaCodigo.findLast((listaCodigo) => listaCodigo.codigo > 0);
        setCodigo(xx.codigo + 1);  
      }
    })
  }

  //Chamado quando troca o ANO
  async function trocaAno(e) {
    await setAno(e.target.value);
    carregaListaSaidas()
  }

  //Chamado quando troca o MÊS
  async function trocaMes(e) {
    await setMes(e.target.value);
    carregaListaSaidas()
  }

  function carregaListaSaidas() {
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
        .where("tipo", "==", "Saida")
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
            //qtdeCompra: doc.data().qtdeCompra,
            //conversao: doc.data().conversao,
            qtdeEstoque: doc.data().qtdeEstoque,
            valorDaCompra: doc.data().valorDaCompra,
            valorUnitario: doc.data().valorUnitario,
            cadastro: doc.data().cadastro,
            cadastroFormated: format(doc.data().cadastro.toDate(), 'dd/MM/yyyy'),
            user: doc.data().user,
          })
        })
        setEstoques(listaEstoques);
      })
    }
  }
  
  //Chamado quando troca o CLIENTE
  function handleChangeClientes(e) {
    setClientesSelected(e.target.value);
  }

  //Chamado quando troca o PRODUTO
  async function handleChangeProdutos(e) {
    await setProdutosSelected(e.target.value);
  }

  async function formataSaida(e) {                
    await setQtdeEstoque(decimal3(e.target.value));
    calculaTotalSaida()
  }

  async function formataValorSaida(e) {
    await setValorDaSaida(decimal2(e.target.value));
    calculaTotalSaida()
  }

  function calculaTotalSaida() {
    let vlSaidaConv = 0;
    if (valorDaCompra.length === 0) {
      vlSaidaConv = 0;
    } else {
      let saida = document.getElementById("vlCompra");
      vlSaidaConv = parseFloat(valorUS(saida.value));  
    }

    let vlQtdConv = 0;
    if (qtdeEstoque.length === 0) {
      vlQtdConv = 0;
    } else {
      let qtd = document.getElementById("qtEstoque");
      vlQtdConv = parseFloat(valorUS(qtd.value));
    }

    if (vlSaidaConv == 0 && vlQtdConv == 0) {
      let resultado = (0)
      setValorUnitario(new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(resultado));
    } else if (vlSaidaConv == 0 && vlQtdConv !== 0) {
      let resultado = (0)
      setValorUnitario(new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(resultado));
    } else if (vlSaidaConv !== 0 && vlQtdConv == 0) {
      let resultado = (vlSaidaConv)
      setValorUnitario(new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(resultado));
    } else {
      let resultado = (vlSaidaConv / vlQtdConv);
      setValorUnitario(new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(resultado));
    }
  }

  function mostarLancamento(item) {
    setCodigo(item.codigo);
    setQtdeEstoque(item.qtdeEstoque);
    setValorDaSaida(item.valorDaCompra);
    setValorUnitario(item.valorUnitario);

    let indexFor = clientes.findIndex(clientes => clientes.nomeFantasia === item.fornecedor);
    setClientesSelected(indexFor);

    let indexPro = produtos.findIndex(produtos => produtos.nome === item.produto);
    setProdutosSelected(indexPro);
  }

  async function deleteEstoque(item) {
    await mostarLancamento(item);
    setDelet(item);
  }

  async function editEstoque(item) {
    await mostarLancamento(item);
    setEdit(item);
  }

  async function handleRegister(e) {
    e.preventDefault();

    // Excluindo o movimento de entrada
    if(delet?.id){
      //alert("excluir id: ", delet.id);
      await firebase.firestore().collection('estoque')
      .doc(delet.id)
      .delete(delet.id)
      .then(()=>{
        toast.success('Movimento de estoque deletedo com sucesso!');
        setClientesSelected('')
        setProdutosSelected('')
        setQtdeSaida('')
        setConversao('')
        setQtdeEstoque('')
        setValorDaSaida('')
        setValorIpi('')
        setValorUnitario('')
        setDelet({})
        loadCodigo();
        carregaListaSaidas()
      })
      .catch((err)=>{
        toast.error('Ops erro ao excluir, tente mais tarde.')
        console.log(err);
      })
      return;
    }

    //  Editando o movimento de SAIDA   
    if (edit?.id) {
      if (ano == 0 && mes == 0) {
        toast.error('Os campos ANO e MÊS tem que ser preenchidos.')
      } else if (clientesSelected == undefined || clientesSelected == null) {
        toast.error('O campo CLIENTE tem que ser preenchido.')
      } else if (produtosSelected == undefined || produtosSelected == null) {
        toast.error('O campo PRODUTO tem que ser preenchido.')
      } else if (qtdeEstoque == 0 || qtdeEstoque == undefined) {
        toast.error('O campo QUANTIDADE DE SAIDA tem que ser preenchido.')
      } else if (valorDaCompra == 0 || valorDaCompra == undefined) {
        toast.error('O campo VALOR DA SAIDA tem que ser preenchido.')
      } else {
        await firebase.firestore().collection('estoque')
        .doc(edit.id)
        .update({
          ano: ano,
          mes: mes,
          fornecedor: clientes[clientesSelected].nomeFantasia,
          fornecedorId: clientes[clientesSelected].id,
          fornecedorCod: clientes[clientesSelected].codigo,
          produto: produtos[produtosSelected].nome,
          produtoId: produtos[produtosSelected].id,
          produtoCod: produtos[produtosSelected].codigo,
          qtdeEstoque: qtdeEstoque,
          valorDaCompra: valorDaCompra,
          valorUnitario: valorUnitario,
          periodo: parseInt(ano.concat(mes)),
          cadastro: new Date(),
          user: user.nome
        })
        .then(() => {
          toast.success('Movimento de entrada editado com sucesso!');
          setCodigo('');
          //setAno('');
          //setMes('')
          setClientesSelected('')
          setProdutosSelected('')
          setQtdeSaida('')
          setConversao('')
          setQtdeEstoque('')
          setValorDaSaida('')
          setValorIpi('')
          setValorUnitario('')
          setEdit({});
          loadCodigo();
          carregaListaSaidas()
          })
        .catch((err) => {
          toast.error('Ops erro ao editar, tente mais tarde.')
          console.log(err);
        })
      }
      return;
    }
  
    //  Cadastrar o movimento de SAIDA
    if (ano == 0 && mes == 0) {
      toast.error('Os campos ANO e MÊS tem que ser preenchidos.')
    } else if (clientesSelected == undefined || clientesSelected == null) {
      toast.error('O campo CLIENTE tem que ser preenchido.')
    } else if (produtosSelected == undefined || produtosSelected == null) {
      toast.error('O campo PRODUTO tem que ser preenchido.')
    } else if (qtdeEstoque == 0 || qtdeEstoque == undefined) {
      toast.error('O campo QUANTIDADE DE SAIDA tem que ser preenchido.')
    } else if (valorDaCompra == 0 || valorDaCompra == undefined) {
      toast.error('O campo VALOR DA SAIDA tem que ser preenchido.')
    } else {
      await firebase.firestore().collection('estoque')     
      .add({
        codigo: codigo,
        ano: ano,
        mes: mes,
        tipo: "Saida",
        fornecedor: clientes[clientesSelected].nomeFantasia,
        fornecedorId: clientes[clientesSelected].id,
        fornecedorCod: clientes[clientesSelected].codigo,
        produto: produtos[produtosSelected].nome,
        produtoId: produtos[produtosSelected].id,
        produtoCod: produtos[produtosSelected].codigo,
        qtdeCompra: 0,
        conversao: 0,
        qtdeEstoque: qtdeEstoque,
        valorDaCompra: valorDaCompra,
        valorIpi: 0,
        valorUnitario: valorUnitario,
        periodo: parseInt(ano.concat(mes)),
        cadastro: new Date(),
        user: user.nome
      })
      .then(() => {
        toast.success('Movimento de saida criado com sucesso!');
        setCodigo('');
        //setAno('');
        //setMes('')
        setClientesSelected('')
        setProdutosSelected('')
        setQtdeSaida('')
        setConversao('')
        setQtdeEstoque('')
        setValorDaSaida('')
        setValorIpi('')
        setValorUnitario('')
        setEdit({});
        loadCodigo();
        carregaListaSaidas()
      })
      .catch((err) => {
        toast.error('Ops erro ao gravar, tente mais tarde.')
        console.log(err);
      })      
    }
  }
  
  function decimal2(v){
    v=v.replace(/\D/g,"") // permite digitar apenas numero
    v=v.replace(/(\d{1})(\d{14})$/,"$1.$2") // coloca ponto antes dos ultimos digitos
    v=v.replace(/(\d{1})(\d{11})$/,"$1.$2") // coloca ponto antes dos ultimos 11 digitos
    v=v.replace(/(\d{1})(\d{8})$/,"$1.$2") // coloca ponto antes dos ultimos 8 digitos
    v=v.replace(/(\d{1})(\d{5})$/,"$1.$2") // coloca ponto antes dos ultimos 5 digitos
    v=v.replace(/(\d{1})(\d{1,2})$/,"$1,$2") // coloca virgula antes dos ultimos 2 digitos
    return v;
  }

  function decimal3(v){
    v=v.replace(/\D/g,"") // permite digitar apenas numero
    v=v.replace(/(\d{1})(\d{15})$/,"$1.$2") // coloca ponto antes dos ultimos digitos
    v=v.replace(/(\d{1})(\d{12})$/,"$1.$2") // coloca ponto antes dos ultimos 12 digitos
    v=v.replace(/(\d{1})(\d{9})$/,"$1.$2") // coloca ponto antes dos ultimos 9 digitos
    v=v.replace(/(\d{1})(\d{6})$/,"$1.$2") // coloca ponto antes dos ultimos 6 digitos
    v=v.replace(/(\d{1})(\d{1,3})$/,"$1,$2") // coloca virgula antes dos ultimos 3 digitos
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
        <Title name="Saida de produtos">
          <FaBox size={25} />
        </Title>

        <div className="containerSAIDA">
          <form className="form-profile" autoComplete="off" id="form" onSubmit={handleRegister} >
            
            <label>Código</label>
            <input type="text" className="codigo" value={codigo} disabled={true} />

            <label>Ano da movimentação</label>
            <select value={ano} id="ano" className="ano" onChange={trocaAno}>
              <option value=""> -- selecione -- </option>
              <option value="2022">2.022</option>
              <option value="2023">2.023</option>
              <option value="2024">2.024</option>
              <option value="2025">2.025</option>
            </select>

            <label>Mês da movimentação</label>
            <select value={mes} id="mes"className="mes" onChange={trocaMes}>
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

            <label>Cliente</label>
            {loadClientes ? (
              <input type="text" disabled={true} value="Carregando os clientes dos produtos..." />
            ) : (
              <select id="buscaForn" value={clientesSelected} onChange={handleChangeClientes} >
                <option value=""> -- selecione -- </option>
                {clientes.map((item, index) => {
                  return (
                    <option key={item.id} value={index} >
                      {item.nomeFantasia}
                    </option>
                  )
                })}
              </select>
            )}

            <label>Produto</label>
            {loadProdutos ? (
              <input type="text" disabled={true} value="Carregando os produtos..." />
            ) : (
              <select value={produtosSelected} onChange={handleChangeProdutos} >
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

            <label>Quantidade de saida</label>            
            <input type="text" id="qtEstoque" placeholder="Quantidade de saida." value={qtdeEstoque} onChange={formataSaida} />

            <label>Valor da saida</label>
            <input type="text" id="vlCompra" placeholder="Valor da saida." value={valorDaCompra} onChange={formataValorSaida} />

            <label>Valor unitário</label>
            <input id="vlUnitario" type="text" placeholder="Valor unitário." value={valorUnitario} disabled={true} />

            {Object.keys(edit).length > 0 ? (
              <button className="btn-register" style={{ backgroundColor: '#6add39' }} type="submit">Atualizar movimento de saida</button>
            ) : Object.keys(delet).length > 0 ? (
              <button className="btn-register" style={{ backgroundColor: '#f63535' }} type="submit">Excluir movimento de saida</button>
            ) : (
              <button className="btn-register" type="submit">Cadastrar movimento de saida</button>
            )}

          </form>
        </div>

      </div>

      <article>
        {estoques.length === 0 ? (
          <div className="container dashboard">
            <span>Nenhum movimento de saida cadastrado neste período ...</span>
          </div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th scope="col">Código</th>
                  <th scope="col">Cliente</th>
                  <th scope="col">Produto</th>
                  <th scope="col">Estoque</th>
                  <th scope="col">Valor</th>
                  <th scope="col">Unitário</th>
                  <th scope="col">Cadastrado por</th>
                  <th scope="col">Cadastrado em</th>
                  <th scope="col">Ação</th>
                </tr>
              </thead>
              <tbody>
                {estoques.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td data-label="Código">{item.codigo}</td>
                      <td data-label="Cliente">{item.fornecedor}</td>
                      <td data-label="Produto">{item.produto}</td>
                      <td data-label="Estoque">{item.qtdeEstoque}</td>
                      <td data-label="Valor">{item.valorDaCompra}</td>
                      <td data-label="Unitário">{item.valorUnitario}</td>
                      <td data-label="Cadastrador">{item.user}</td>
                      <td data-label="Cadastrado">{item.cadastroFormated}</td>
                      <td data-label="Ação">
                        <button className="action" style={{ backgroundColor: '#6add39' }} onClick={() => editEstoque(item)}>
                          <FiEdit2 color="#FFF" size={17} />
                        </button>

                        <button className="action" style={{ backgroundColor: '#f63535' }} onClick={() => deleteEstoque(item)}>
                          <RiDeleteBin3Line color="#FFF" size={17} />
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

