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
import { FaBox, FaArrowCircleLeft } from 'react-icons/fa';
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
  const [clientesSelected, setClientesSelected] = useState();
  const [loadProdutos, setLoadProdutos] = useState(true);
  const [produtos, setProdutos] = useState([]);
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

  //Chamado quando troca o CLIENTE
  function handleChangeClientes(e) {
    setClientesSelected(e.target.value);
  }

  //Chamado quando troca o PRODUTO    
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
      let busca = document.getElementById("qtEstoque");
      let qtSaida = busca.value;
      if (qtSaida.length > 0) {
        calculaEstoque()
      }
    }
  }

  function calculaEstoque() {
    let busca = 0;
    busca = document.getElementById("qtEstoque");   //Input
    let qtSaida = busca.value;
    let qtSaidaConv = parseFloat(valorUS(qtSaida));

    busca = document.getElementById("qtEstAnt");   //Input
    let qtEst = busca.value;
    let qtEstAnt = parseFloat(valorUS(qtEst));

    let qtEstAtu = (qtEstAnt - qtSaidaConv);
    setQtdeEstAtual(qtEstAtu.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }));

    let temSaida = document.getElementById("vlCompra");
    let temVlSaida = temSaida.value;
    if (temVlSaida.length > 0) {
      calculaTotalSaida();
    };
  }

  async function formataSaida(e) {
    await setQtdeEstoque(decimal3(e.target.value));
    calculaEstoque()
  }

  async function formataValorSaida(e) {
    await setValorDaSaida(decimal2(e.target.value));
    calculaTotalSaida()
  }

  function calculaTotalSaida() {
    let busca = 0;
    let caminho = 0;
    let qtEstAtu = 0;
    let vlEstAnt = 0;
    let vlCompraConv = 0;

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

    let calVlEstAtu = (vlEstAnt - vlCompraConv);
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
    setClientesSelected('');
    setProdutosSelected('');
    setConversao('');
    setQtdeEstoque('');
    setValorDaSaida('');
    setValorIpi('');
    setValorUnitario('');
    setNumNf('');
    setQtdeEstAnterior('');
    setQtdeEstAtual('');
    setValorEstAnterior('');
    setValorEstAtual('');
    setEdit({});
    setDelet({});
    loadCodigo();
    carregaListaSaidas();
  }

  function mostarLancamento(item) {
    limpaTela()

    if (item.codigo > 0) {
      const unsub = onSnapshot(firebase.firestore().collection("estoque")
        .where('codigo', '==', item.codigo),
        (snapshot) => {
          snapshot.forEach((doc) => {
            //lancamento: doc.data().codigo,
            setCodigo(doc.data().codigo);
            setNumNf(doc.data().numNf);
            setQtdeSaida(doc.data().qtdeCompra);
            setConversao(doc.data().conversao);
            setQtdeEstoque(doc.data().qtdeEstoque);
            setValorDaSaida(doc.data().valorDaCompra);
            setValorIpi(doc.data().valorIpi);
            setValorUnitario(doc.data().valorUnitario);
            setQtdeEstAnterior(doc.data().qtdeEstAnterior);
            setQtdeEstAtual(doc.data().qtdeEstAtual);
            setValorEstAnterior(doc.data().valorEstAnterior);
            setValorEstAtual(doc.data().valorEstAtual);
          })
        })
    }

    let indexFor = clientes.findIndex(clientes => clientes.nomeFantasia === item.fornecedor);
    setClientesSelected(indexFor);

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

    // Excluindo o movimento de entrada
    if (delet?.id) {
      await firebase.firestore().collection('estoque')
        .doc(delet.id)
        .delete(delet.id)
        .then(() => {
          toast.success('Movimento de saida de estoque deletedo com sucesso!');
          limpaTela();
        })
        .catch((err) => {
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
            qtdeCompra: '0,000',
            conversao: '0,000',
            qtdeEstoque: qtdeEstoque,
            valorDaCompra: valorDaCompra,
            valorIpi: '0,00',
            valorUnitario: valorUnitario,
            numNf: numNf,
            qtdeEstAnterior: qtdeEstAnterior,
            qtdeEstAtual: qtdeEstAtual,
            valorEstAnterior: valorEstAnterior,
            valorEstAtual: valorEstAtual,
            periodo: parseInt(ano.concat(mes)),
            cadastro: new Date(),
            user: user.nome
          })
          .then(() => {
            toast.success('Movimento de saida de estoque editado com sucesso!');
            limpaTela();
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
          qtdeCompra: '0,000',
          conversao: '0,000',
          qtdeEstoque: qtdeEstoque,
          valorDaCompra: valorDaCompra,
          valorIpi: '0,00',
          valorUnitario: valorUnitario,
          numNf: numNf,
          qtdeEstAnterior: qtdeEstAnterior,
          qtdeEstAtual: qtdeEstAtual,
          valorEstAnterior: valorEstAnterior,
          valorEstAtual: valorEstAtual,
          periodo: parseInt(ano.concat(mes)),
          cadastro: new Date(),
          user: user.nome
        })
        .then(() => {
          toast.success('Movimento de saida criado com sucesso!');
          limpaTela();
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
        <Title name="Saida de produtos">
          <FaArrowCircleLeft size={25} />
        </Title>

        <div className="containerSAIDA">
          <form className="form-saida" autoComplete="off" id="form" onSubmit={handleRegister} >

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
              <label>Cliente</label>
              {loadClientes ? (
                <input type="text" disabled={true} value="Carregando os clientes dos produtos..." />
              ) : (
                <select id="buscaForn" className='cliente' value={clientesSelected} onChange={handleChangeClientes} >
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
            </div>

            <div className='grupo'>
              <label>Numero da NFe</label>
              <input id="nuNf" className="nf" type="text" placeholder="" value={numNf} onChange={(e) => setNumNf(e.target.value)} />
            </div>

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
            {/* ESTE CAMPO ESTÁ INVISIVEL */}
            <select id="codProdx" className="codProdx" value={produtosSelected} onChange={handleChangeProdutos} >
                <option value="">Código do produto</option>
                {produtos.map((item, index) => {
                  return (
                    <option key={item.id} value={index} >
                      {item.codigo}
                    </option>
                  )
                })}
              </select>
            </div>

            <div className='grupo'>
              <label>Estoque anterior</label>
              <input type="text" className='qtEstAnt' id="qtEstAnt" placeholder="" value={qtdeEstAnterior} disabled={true} />
            </div>

            <div className='grupo'>
              <label>Quantidade de saida</label>
              <input type="text" className='qtEstoque' id="qtEstoque" placeholder="" value={qtdeEstoque} onChange={formataSaida} />
            </div>

            <div className='grupo'>
              <label>Estoque atual</label>
              <input type="text" className='qtEstAtu' id="qtEstAtu" placeholder="" value={qtdeEstAtual} disabled={true} />
            </div>

            <div className='grupo'>
              <label>Valor do estoque anterior</label>
              <input type="text" className='vlEstAnt' id="vlEstAnt" placeholder="" value={valorEstAnterior} disabled={true} />
            </div>

            <div className='grupo'>
              <label>Valor da saida</label>
              <input type="text" className='vlCompra' id="vlCompra" placeholder="" value={valorDaCompra} onChange={formataValorSaida} />
            </div>

            <div className='grupo'>
              <label>Valor do estoque atual</label>
              <input type="text" className='vlEstAtu' id="vlEstAtu" placeholder="" value={valorEstAtual} disabled={true} />
            </div>

            <div className='grupo'>
              <label>Valor unitário</label>
              <input id="vlUnitario" className='vlUnitario' type="text" placeholder="0,00" value={valorUnitario} disabled={true} />
            </div>

            <div className='grupoBTN'>
              {Object.keys(edit).length > 0 ? (
                <button className="btn-register" style={{ backgroundColor: '#6add39' }} type="submit">Atualizar movimento de saida</button>
              ) : Object.keys(delet).length > 0 ? (
                <button className="btn-register" style={{ backgroundColor: '#f63535' }} type="submit">Excluir movimento de saida</button>
              ) : (
                <button className="btn-register" type="submit">Cadastrar movimento de saida</button>
              )}
              <button className="btn-register2" type="button" onClick={limpaTela}>Cancelar</button>
            </div>
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
            <table className='table_Saida'>
              <thead className='thead_Saida'>
                <tr>
                  <th scope="col">Lanc.</th>
                  <th scope="col">Cliente</th>
                  <th scope="col">Produto</th>
                  <th scope="col">Saida</th>
                  <th scope="col">Valor</th>
                  <th scope="col">Unitário</th>
                  <th scope="col">Cadastro</th>
                  <th scope="col">Ação</th>
                </tr>
              </thead>
              <tbody className='tbody_Saida'>
                {estoques.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td data-label="Lanc.">{item.codigo}</td>
                      <td data-label="Cliente">{item.fornecedor}</td>
                      <td data-label="Produto">{item.produto}</td>
                      <td data-label="Saida">{item.qtdeEstoque}</td>
                      <td data-label="Valor">{item.valorDaCompra}</td>
                      <td data-label="Unitário">{item.valorUnitario}</td>
                      <td data-label="Cadastro">{item.user}</td>
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

