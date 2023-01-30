import { useState, useEffect, useContext } from 'react';
import firebase from '../../services/firebaseConnection';
import { useHistory, useParams } from 'react-router-dom';
import Cadastro from '../../components/Menus/Cadastro';
import Title from '../../components/Title';
import { AuthContext } from '../../contexts/auth';
import { toast } from 'react-toastify';
import './produto.css';
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
  onSnapshot
} from 'firebase/firestore';

const listRef = firebase.firestore().collection("produto").orderBy('nome', 'asc')

export default function Produto() {
  const [loadFamilias, setLoadFamilias] = useState(true);
  const [familias, setFamilias] = useState([]);
  const [familiaSelected, setFamiliaSelected] = useState();
  const { id } = useParams();
  const history = useHistory();
  const [produto, setProduto] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [loadProdutos, setLoadProdutos] = useState(true);
  const [nome, setNome] = useState('');
  //const [tipo, setTipo] = useState('CT');
  const [tipo, setTipo] = useState('');
  const [edit, setEdit] = useState({});
  const [delet, setDelet] = useState({});
  const { user } = useContext(AuthContext);
  const [conversao, setConversao] = useState('');
  const [operador, setOperador] = useState('');
  const [codigo, setCodigo] = useState('');

  useEffect(() => {
    async function loadFamilias() {
      await firebase.firestore().collection('familia').orderBy('nome', 'asc')
        .get()
        .then((snapshot) => {
          let lista = [];
          snapshot.forEach((doc) => {
            lista.push({
              id: doc.id,
              codigo: doc.data().codigo,
              nome: doc.data().nome
            })
          })

          if (lista.length === 0) {
            console.log('NENHUMA FAMÍLIA ENCONTRADA');
            setFamilias([{ id: '1', nome: 'FREELA' }]);
            setLoadFamilias(false);
            return;
          }
          setFamilias(lista);
          setLoadFamilias(false);
          //console.log('Lista: ', lista);

          //if (id) {
          //  loadId(lista);
          //}
        })
        .catch((error) => {
          console.log('DEU ALGUM ERRO!', error);
          setLoadFamilias(false);
          setFamilias([{ id: '1', nome: '' }]);
        })
    }
    loadFamilias();
    loadCodigo();
    encheListaProdutos();
  }, [id]);

  async function loadCodigo() {
    const unsub = onSnapshot(firebase.firestore().collection("produto")
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

  async function mostrarProduto(item) {
    setCodigo(item.codigo);

    let index = familias.findIndex(familias => familias.nome === item.familia);
    await setFamiliaSelected(index);

    setNome(item.nome);
    setTipo(item.tipo);
    setConversao(item.conversao);
    setOperador(item.operador);

    let nomeFam = item.familia;
    encheListaProdutos(nomeFam);
    /*    
        await firebase.firestore().collection('familia').orderBy('nome', 'asc')
          .get()
          .then((snapshot) => {
            let listaFam = [];
            snapshot.forEach((doc) => {
              listaFam.push({
                id: doc.id,
                codigo: doc.data.codigo,
                nome: doc.data().nome
              })
              let index = listaFam.findIndex(listaFam => listaFam.id === item.familiaId);
              setFamiliaSelected(index);
            })
          })
    */
  }

  async function deleteProduto(item) {
    await mostrarProduto(item);
    setEdit({});
    setDelet(item);
  }

  async function editProduto(item) {
    await mostrarProduto(item);
    setDelet({});
    setEdit(item);
  }

  async function handleRegister(e) {
    e.preventDefault();

    // Excluindo o produto
    if (delet?.id) {
      await firebase.firestore().collection('produto')
        .doc(delet.id)
        .delete(delet.id)
        .then(() => {
          toast.success('Produto deletedo com sucesso!');
          limpaTela()
        })
        .catch((err) => {
          toast.error('Ops erro ao excluir, tente mais tarde.')
          console.log(err);
        })
      return;
    }

    //  Editando o produto    
    if (edit?.id) {
      if (!nome) {
        toast.error('O campo PRODUTO tem que ser preenchido.')
      } else if (!tipo) {
        toast.error('O campo TIPO de controle de estoque tem que ser preenchido.')
      } else if (!conversao) {
        toast.error('O campo VALOR PARA CONVERSÃO tem que ser preenchido, não tendo convrsão usar 1,000')
      } else if (!operador) {
        toast.error('O campo OPERADOR DE CONVERSÃO tem que ser preenchido.')
      } else {
        await firebase.firestore().collection('produto')
          .doc(edit.id)
          .update({
            codigo: codigo,
            nome: nome,
            tipo: tipo,
            conversao: conversao,
            operador: operador,
            familia: familias[familiaSelected].nome,
            familiaId: familias[familiaSelected].id,
            familiaCod: familias[familiaSelected].codigo
          })
          .then(() => {
            toast.success('Produto editado com sucesso!');
            limpaTela()
          })
          .catch((err) => {
            toast.error('Ops erro ao editar, tente mais tarde.')
            console.log(err);
          })
      }
      return;
    }

    //  Cadastrar o produto
    if (!familiaSelected) {
      toast.error('Os campos FAMÍLIA do produto tem que ser preenchidos.')
    } else if (!nome) {
      toast.error('O campo PRODUTO tem que ser preenchido.')
    } else if (!tipo) {
      toast.error('O campo TIPO de controle de estoque tem que ser preenchido.')
    } else if (!conversao) {
      toast.error('O campo VALOR PARA CONVERSÃO tem que ser preenchido, não tendo convrsão usar 1,000')
    } else if (!operador) {
      toast.error('O campo OPERADOR DE CONVERSÃO tem que ser preenchido.')
    } else {
      await firebase.firestore().collection('produto')
        .add({
          codigo: codigo,
          nome: nome,
          tipo: tipo,
          conversao: conversao,
          operador: operador,
          familia: familias[familiaSelected].nome,
          familiaId: familias[familiaSelected].id,
          familiaCod: familias[familiaSelected].codigo,
          cadastro: new Date(),
          user: user.nome
        })
        .then(() => {
          toast.success('Produto criado com sucesso!');
          limpaTela()
        })
        .catch((err) => {
          toast.error('Ops erro ao gravar, tente mais tarde.')
          console.log(err);
        })
    }
  }

  function limpaTela() {
    setCodigo('');
    setNome('');
    setTipo('');
    setConversao('');
    setOperador('');
    setFamiliaSelected('');
    setEdit({});
    setDelet({});
    encheListaProdutos();
    loadCodigo();
    //return;
  }

  //Chamado quando troca o TIPO
  function handleChangeTipo(e) {
    setTipo(e.target.value);
  }

  //Chamado quando troca o OPERADOR
  function handleChangeOperador(e) {
    setOperador(e.target.value);
  }

  function formataMoeda(e) {
    setConversao(decimal3(e.target.value));
  }

  //Chamado quando troca a FAMÍLIA
  async function handleChangeFamilia(e) {
    await setFamiliaSelected(e.target.value);

    let busca = document.getElementById("codFam");  // Select
    let nomeFam = busca.options[busca.selectedIndex].text;

    encheListaProdutos(nomeFam);
  }

  function encheListaProdutos(nomeFam) {
    if (nomeFam) {
      const unsub = onSnapshot(firebase.firestore().collection("produto")
        .orderBy('nome', 'asc')
        .where('familia', '==', nomeFam),
        (snapshot) => {
          let listaProduto = [];
          snapshot.forEach((doc) => {
            listaProduto.push({
              id: doc.id,
              codigo: doc.data().codigo,
              nome: doc.data().nome,
              familia: doc.data().familia,
              familiaId: doc.data().familiaId,
              familiaCod: doc.data().familiaCod,
              tipo: doc.data().tipo,
              conversao: doc.data().conversao,
              operador: doc.data().operador,
              cadastro: doc.data().cadastro,
              cadastroFormated: format(doc.data().cadastro.toDate(), 'dd/MM/yyyy'),
              user: doc.data().user,
            })
          })
          setProdutos(listaProduto);
        })
    } else {
      const unsub = onSnapshot(firebase.firestore().collection("produto")
        .orderBy('nome', 'asc'),
        (snapshot) => {
          let listaProduto = [];
          snapshot.forEach((doc) => {
            listaProduto.push({
              id: doc.id,
              codigo: doc.data().codigo,
              nome: doc.data().nome,
              familia: doc.data().familia,
              familiaId: doc.data().familiaId,
              familiaCod: doc.data().familiaCod,
              tipo: doc.data().tipo,
              conversao: doc.data().conversao,
              operador: doc.data().operador,
              cadastro: doc.data().cadastro,
              cadastroFormated: format(doc.data().cadastro.toDate(), 'dd/MM/yyyy'),
              user: doc.data().user,
            })
          })
          setProdutos(listaProduto);
        })
    }
  }


  function decimal2(v) {
    v = v.replace(/\D/g, "") // permite digitar apenas numero
    v = v.replace(/(\d{1})(\d{13})$/, "$1.$2") // coloca ponto antes dos ultimos digitos
    v = v.replace(/(\d{1})(\d{10})$/, "$1.$2") // coloca ponto antes dos ultimos 10 digitos
    v = v.replace(/(\d{1})(\d{7})$/, "$1.$2") // coloca ponto antes dos ultimos 7 digitos
    v = v.replace(/(\d{1})(\d{4})$/, "$1.$2") // coloca ponto antes dos ultimos 4 digitos
    v = v.replace(/(\d{1})(\d{1,1})$/, "$1,$2") // coloca virgula antes dos ultimos 1 digitos
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

  return (
    <div>
      <Cadastro />
      <div className="content">
        <h1>Mancini & Trindade</h1>
        <Title name="Cadastro de Produtos">
          <FaBox size={25} />
        </Title>

        <div className="containerPROD">
          <form className="form-produto" onSubmit={handleRegister} >

            <div className='grupo'>
              <label>Código</label>
              <input type="text" className='codigo' value={codigo} disabled={true} />
            </div>

            <div className='grupo'>
              <label>Família do produto</label>
              {loadFamilias ? (
                <input type="text" disabled={true} value="Carregando as famílias dos produtos..." />
              ) : (
                <select id="codFam" className='familia' value={familiaSelected} onChange={handleChangeFamilia} >
                  <option value=""> -- selecione -- </option>
                  {familias.map((item, index) => {
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
              <label>Nome do produto</label>
              <input type="text" className='produto' placeholder="" value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>

            <div className='grupo'>
              <label>Tipo de controle de estoque</label>
              <select className='tipo' value={tipo} onChange={handleChangeTipo}>
                <option value=""> -- selecione -- </option>
                <option value="CT">Cento</option>
                <option value="CX">Caixa</option>
                <option value="M³">Metros Cúbicos</option>
              </select>
            </div>

            <div className='grupo'>
              <label>Valor para conversão</label>
              <input type="text" className='taxa' placeholder="" value={conversao} onChange={formataMoeda} />
            </div>

            <div className='grupo'>
              <label>Operador da conversão</label>
              <select className='operador' value={operador} onChange={handleChangeOperador}>
                <option value=""> -- selecione -- </option>
                <option value="Dividir">Dividir (/)</option>
                <option value="Multiplicar">Multiplicar (*)</option>
                <option value="Somar">Somar (+)</option>
                <option value="Subtrair">Subtrair (-)</option>
              </select>
            </div>

            <div className='grupoBTN'>
              {Object.keys(edit).length > 0 ? (
                <button className="btn-register" style={{ backgroundColor: '#6add39' }} type="submit">Atualizar produto</button>
              ) : Object.keys(delet).length > 0 ? (
                <button className="btn-register" style={{ backgroundColor: '#f63535' }} type="submit">Excluir produto</button>
              ) : (
                <button className="btn-register" type="submit">Cadastrar produto</button>
              )}
              <button className="btn-register2" type="button" onClick={limpaTela}>Cancelar</button>
            </div>
          </form>
        </div>

      </div>

      <article>
        {produtos.length === 0 ? (
          <div className="container dashboard">
            <span>Nenhum produto cadastrado...</span>
          </div>
        ) : (
          <>
            <table className='table_Produto'>
              <thead className='thead_Produto'>
                <tr>
                  <th scope="col">Código</th>
                  <th scope="col">Produto</th>
                  <th scope="col">Família</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Conversão</th>
                  <th scope="col">Operador</th>
                  <th scope="col">Cadastro</th>
                  <th scope="col">Ação</th>
                </tr>
              </thead>
              <tbody className='tbody_Produto'>
                {produtos.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td data-label="Código">{item.codigo}</td>
                      <td data-label="Produto">{item.nome}</td>
                      <td data-label="Família">{item.familia}</td>
                      <td data-label="Tipo">{item.tipo}</td>
                      <td data-label="Conversão">{item.conversao}</td>
                      <td data-label="Operador">{item.operador}</td>
                      <td data-label="Cadastro">{item.user}</td>
                      <td data-label="Ação">
                        <button className="action" style={{ backgroundColor: '#6add39' }} onClick={() => editProduto(item)}>
                          <FiEdit2 color="#FFF" size={15} />
                        </button>

                        <button className="action" style={{ backgroundColor: '#f63535' }} onClick={() => deleteProduto(item)}>
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

