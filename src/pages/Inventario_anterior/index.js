import { useState, useEffect, useContext } from 'react';
import firebase                            from '../../services/firebaseConnection';
import { useHistory, useParams }           from 'react-router-dom';
import Movimento                           from '../../components/Menus/Movimento';
import Title                               from '../../components/Title';
import { AuthContext }                     from '../../contexts/auth';
import { toast }                           from 'react-toastify';
import './inventario.css';
import { FiEdit2 }                         from 'react-icons/fi';
import { RiDeleteBin3Line }                from 'react-icons/ri';
import { FaBox }                           from 'react-icons/fa';
import { format, set }                     from 'date-fns';
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
  const [codigo, setCodigo] = useState('');
  const [ano, setAno] = useState('');
  const [mes, setMes] = useState('');
  const [qtdeCompra, setQtdeCompra] = useState('');
  const [qtdeEstoque, setQtdeEstoque] = useState('');
  const [conversao, setConversao] = useState('');
  const [estoques, setEstoques] = useState([]);
  const [vlInven, setVlInven] = useState('0,000');
  const [codProduto, setCodProduto] = useState('');

  const [qtdeEstAnterior, setQtdeEstAnterior] = useState('0,000');
  const [qtdeEstAtual, setQtdeEstAtual] = useState('0,000');
  const [valorEstAnterior, setValorEstAnterior] = useState('0,00');
  const [valorEstAtual, setValorEstAtual] = useState('0,00');

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
            conversao: doc.data().conversao,
            operador: doc.data().operador
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
  }

  function carregaListaInventario(ano, mes) {
    if (ano !== null && mes !== null) {
      const unsub = onSnapshot(firebase.firestore().collection("estoque")
        .orderBy('produto')
        .where("ano", "==", ano)
        .where("mes", "==", mes)
        .where("fornecedor", "==", "INVENTARIO"),
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
              qtdeEstoque: doc.data().qtdeEstoque,
              cadastro: doc.data().cadastro,
              cadastroFormated: format(doc.data().cadastro.toDate(), 'dd/MM/yyyy'),
              user: doc.data().user,
            })
          })
          setEstoques(listaEstoques);
        })
    }
  }

  //Chamado quando troca o ANO   
  function handleChangeAno(e) {
    setAno(e.target.value);
    carregaListaInventario(e.target.value, mes)
    //buscaEstoqueAtual(e.target.value, mes)
  }

  //Chamado quando troca o MÊS 
  function handleChangeMes(e) {
    setMes(e.target.value);
    carregaListaInventario(ano, e.target.value)
    //buscaEstoqueAtual(ano, e.target.value)
  }

  //Chamado quando troca o PRODUTO
  async function handleChangeProdutos(e) {
    await setProdutosSelected(e.target.value);
    //buscaEstoqueAtual(ano, mes)
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
  }








  function buscaEstoqueAtual(ano, mes) {
    if (ano != 0 || mes != 0) {
      let busca = document.getElementById("codProd");  // Select
      let codigo = parseInt(busca.options[busca.selectedIndex].text);
      setCodProduto(codigo);
      //buscaMovimentacao(ano, mes, codProduto);
      resultadoInventario(ano, mes, codigo, vlInven);
    };
  }

  async function formataInventario(e) {
    await setQtdeInventario(decimal3(e.target.value));
    //calculaInventario();
    resultadoInventario(ano, mes, codProduto, (e.target.value));
  }

  async function resultadoInventario(ano, mes, codProduto, vlInven) {
    let saldo = 0;
    if (codProduto !== 0) {
      let ent = 0;
      let sai = 0;
      await firebase.firestore().collection("estoque")
        .where("produtoCod", "==", codProduto)
        .where("periodo", "<=", parseInt(ano.concat(mes)))
        .get()
        .then(function (busca) {
          busca.forEach((doc) => {
            if (doc.data().tipo == "Entrada") {
              ent = ent + parseFloat(valorUS(doc.data().qtdeEstoque))
            } else if (doc.data().tipo == "Saida") {
              sai = sai + parseFloat(valorUS(doc.data().qtdeEstoque))
            }
          })
          setEntraEstoque(new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 3 }).format(ent));
          setSaiEstoque(new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 3 }).format(sai));
          saldo = ent - sai;
          setEstoqueAtual(new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 3 }).format(saldo));

          //let inventario = parseFloat(valorUS(qtdeInventario));
          let inventario = parseFloat(valorUS(vlInven));
          if (saldo >= inventario) {
            setTipoMovimento('Saida');
            setErrInvent({});
            let ajuste = (saldo - inventario);
            setAjusteEstoque(new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 3 }).format(ajuste));
          } else {
            setTipoMovimento('O inventario não pode ser maior que o estoque atual.');
            setAjusteEstoque(new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 3 }).format(0));
            setErrInvent('SIM');
            //alert('O inventario não pode ser maior que o estoque atual.');  
          }
        });
    }
  }

  async function mostarLancamento(item) {
    setCodigo(item.codigo);
    let indexPro = produtos.findIndex(produtos => produtos.nome === item.produto);
    await setProdutosSelected(indexPro);

    setQtdeInventario(item.qtdeCompra);
    setAjusteEstoque(item.qtdeEstoque);
    setTipoMovimento("Saida");

    //buscaEstoqueAtual(verAno, verMes)
  }

  async function deleteInventario(item) {
    await mostarLancamento(item);
    setDelet(item);
  }

  async function editInventario(item) {
    await mostarLancamento(item);
    setEdit(item);
  }

  function handleRegister(e) {
    e.preventDefault();

    // Excluindo o movimento de saida de inventario
    if (delet?.id) {
      //alert("excluir id: ", delet.id);
      firebase.firestore().collection('estoque')
        .doc(delet.id)
        .delete(delet.id)
        .then(() => {
          toast.success('Movimento de inventario deletedo com sucesso!');
          setCodigo('');
          //setAno('');
          //setMes('')
          setProdutosSelected('')
          setEntraEstoque('0,000')
          setSaiEstoque('0,000')
          setEstoqueAtual('0,000')
          setQtdeInventario('')
          setTipoMovimento('')
          setAjusteEstoque('')
          setErrInvent({});
          setDelet({})
          loadCodigo();
          carregaListaInventario()
        })
        .catch((err) => {
          toast.error('Ops erro ao excluir, tente mais tarde.')
          console.log(err);
        })
      return;
    }

    //  Cadastrar o movimento de SAIDA gerado pelo INVENTARIO
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
            tipo: "Saida",
            fornecedor: "INVENTARIO",
            fornecedorId: "jvG7ZqZG9h46nVmrcyes",
            fornecedorCod: 0,
            produto: produtos[produtosSelected].nome,
            produtoId: produtos[produtosSelected].id,
            produtoCod: produtos[produtosSelected].codigo,
            qtdeCompra: qtdeInventario,    //aqui vai o valor da contagem no inventario
            conversao: 0,
            qtdeEstoque: ajusteEstoque,   //aqui vai o ajuste do estoque, gerado pela contagem do inventario
            valorDaCompra: 0,
            valorIpi: 0,
            valorUnitario: 0,
            periodo: parseInt(ano.concat(mes)),
            cadastro: new Date(),
            user: user.nome
          })
          .then(() => {
            toast.success('Movimento de saida de inventario criado com sucesso!');
            setCodigo('');
            //setAno('');
            //setMes('')
            setProdutosSelected('')
            setEntraEstoque('0,000')
            setSaiEstoque('0,000')
            setEstoqueAtual('0,000')
            setQtdeInventario('')
            setTipoMovimento('')
            setAjusteEstoque('')

            setErrInvent({});
            loadCodigo();
            carregaListaInventario()
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
          <FaBox size={25} />
        </Title>

        <div className="containerINVEN">
          <form className="form-profile" autoComplete="off" id="form" onSubmit={handleRegister} >

            <label>Código</label>
            <input type="text" id="cdLanc" className="codigo" value={codigo} disabled={true} />

            <label>Ano da movimentação</label>
            <select value={ano} id="idAno" className="ano" onChange={handleChangeAno}>
              <option value=""> -- selecione -- </option>
              <option value="2022">2.022</option>
              <option value="2023">2.023</option>
              <option value="2024">2.024</option>
              <option value="2025">2.025</option>
            </select>

            <label>Mês da movimentação</label>
            <select value={mes} id="IdMes" className="mes" onChange={handleChangeMes}>
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
            <select id="codProd" className="codProd" value={produtosSelected} onChange={handleChangeProdutos} >
              <option value="">Código do produto</option>
              {produtos.map((item, index) => {
                return (
                  <option key={item.id} value={index} >
                    {item.codigo}
                  </option>
                )
              })}
            </select>

            {Object.keys(delet).length > 0 ? (
              <>
                <input type="hidden" id="enEstoque" className="enEstoque" placeholder="Entradas no estoque atual" value={entraEstoque} disabled={true} />
                <input type="hidden" id="saEstoque" className="saEstoque" placeholder="Saidas no estoque atual" value={saiEstoque} disabled={true} />
                <input type="hidden" id="atuEstoque" className="atuEstoque" placeholder="Estoque atual" value={estoqueAtual} disabled={true} />
                <label>Quantidade do inventario</label>
                <input type="text" id="qtInvent" className="qtInvent" placeholder="Quantidade do inventario" value={qtdeInventario} onChange={formataInventario} disabled={true} />
              </>
            ) : (
              <>
                <label>Entradas no estoque</label>
                <input type="text" id="enEstoque" className="enEstoque" placeholder="Entradas no estoque atual" value={entraEstoque} disabled={true} />
                <label>Saida no estoque</label>
                <input type="text" id="saEstoque" className="saEstoque" placeholder="Saidas no estoque atual" value={saiEstoque} disabled={true} />
                <label>Estoque atual</label>
                <input type="text" id="atuEstoque" className="atuEstoque" placeholder="Estoque atual" value={estoqueAtual} disabled={true} />
                <label>Quantidade do inventario</label>
                <input type="text" id="qtInvent" className="qtInvent" placeholder="Quantidade do inventario" value={qtdeInventario} onChange={formataInventario} />
              </>
            )}

            {Object.keys(errInvent).length > 0 ? (
              <input type="text" id="tpMovim" className="tpMovim" style={{ backgroundColor: '#f63535' }} placeholder="Tipo do movimento" value={tipoMovimento} disabled={true} />
            ) : (
              <input type="text" id="tpMovim" className="tpMovim" style={{ backgroundColor: '#FFF' }} placeholder="Tipo do movimento" value={tipoMovimento} disabled={true} />
            )}

            <label>Quantidade de ajuste de estoque</label>
            <input type="text" id="ajuEstoque" className="ajuEstoque" placeholder="Ajuste" value={ajusteEstoque} disabled={true} />


            {Object.keys(delet).length > 0 ? (
              <button className="btn-register" style={{ backgroundColor: '#f63535' }} type="submit">Excluir movimento de inventario</button>
            ) : (
              <button className="btn-register" type="submit">Cadastrar movimento de inventario</button>
            )}

          </form>
        </div>

      </div>

      <article>
        {estoques.length === 0 ? (
          <div className="container dashboard">
            <span>Nenhum movimento de inventario cadastrado neste período...</span>
          </div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th scope="col">Código</th>
                  <th scope="col">Produto</th>
                  <th scope="col">Inventario</th>
                  <th scope="col">Ajuste</th>
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
                      <td data-label="Produto">{item.produto}</td>
                      <td data-label="Inventario">{item.qtdeCompra}</td>
                      <td data-label="Ajuste">{item.qtdeEstoque}</td>
                      <td data-label="Cadastrador">{item.user}</td>
                      <td data-label="Cadastrado">{item.cadastroFormated}</td>
                      <td data-label="Ação">
                        <button className="action" style={{ backgroundColor: '#f63535' }} onClick={() => deleteInventario(item)}>
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

