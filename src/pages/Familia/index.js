import { useState, useEffect, useContext } from 'react';
import firebase from '../../services/firebaseConnection';
import './familia.css';
import Title from '../../components/Title';
//import Cadastro from '../../components/Menus/Cadastro';
import Principal from '../../components/Menus/Principal';
import { toast } from 'react-toastify';
import { FiEdit2 } from 'react-icons/fi';
import { RiDeleteBin3Line, RiTeamFill } from 'react-icons/ri';
import { format } from 'date-fns';
import { AuthContext } from '../../contexts/auth';
import CriaPDF from './report';
import {
  doc,
  setDoc,
  collection,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';

//const listRef = firebase.firestore().collection('familia').orderBy('nome', 'asc');

export default function Familia() {
  const [nome, setNome] = useState('');
  const [familia, setFamilia] = useState([]);  //gera uma lista
  const { user } = useContext(AuthContext);
  const [edit, setEdit] = useState({});
  const [delet, setDelet] = useState({});
  const [codigo, setCodigo] = useState('');

  useEffect(() => {
    async function loadFamilia() {
      const unsub = onSnapshot(firebase.firestore().collection("familia").orderBy('nome', 'asc'), (snapshot) => {
        let listaFamilia = [];

        snapshot.forEach((doc) => {
          listaFamilia.push({
            id: doc.id,
            nome: doc.data().nome,
            codigo: doc.data().codigo,
            cadastro: doc.data().cadastro,
            cadastroFormated: format(doc.data().cadastro.toDate(), 'dd/MM/yyyy'),
            user: doc.data().user,
          })
        })
        setFamilia(listaFamilia);
      })
    }
    loadFamilia();
    loadCodigo();
  }, [])

  async function loadCodigo() {
    const unsub = onSnapshot(firebase.firestore().collection("familia")
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

  async function deleteFamilia(item) {
    setCodigo(item.codigo)
    setNome(item.nome)
    setEdit({});
    setDelet(item);
  }

  function editFamilia(item) {
    setCodigo(item.codigo)
    setNome(item.nome)
    setDelet({});
    setEdit(item);
  }

  function limpaTela() {
    setCodigo('');
    setNome('');
    setDelet({});
    setEdit({});
    loadCodigo();
  }

  async function handleAdd(e) {
    e.preventDefault();

    if (delet?.id) {
      await firebase.firestore().collection('familia')
        .doc(delet.id)
        .delete(delet.id)
        .then(() => {
          toast.success('Família deleteda com sucesso!');
          limpaTela();
        })
        .catch((err) => {
          toast.error('Ops erro ao excluir, tente mais tarde.')
          console.log(err);
        })
      return;
    }

    if (edit?.id) {
      if (nome) {
        await firebase.firestore().collection('familia')
          .doc(edit.id)
          .update({
            codigo: codigo,
            nome: nome,
            user: edit.user
          })
          .then(() => {
            toast.success('Família editada com sucesso!');
            limpaTela();
          })
          .catch((err) => {
            toast.error('Ops erro ao editar, tente mais tarde.')
            console.log(err);
          })
      } else {
        toast.error('Preencha o campo nome da família!')
      }
      return;
    }

    if (nome) {
      await firebase.firestore().collection('familia')
        .add({
          codigo: codigo,
          nome: nome,
          cadastro: new Date(),
          user: user.nome
        })
        .then(() => {
          toast.success('Família cadastrada com sucesso!');
          limpaTela();
        })
        .catch((error) => {
          console.log(error);
          toast.error('Erro ao cadastrar a família.');
        })
    } else {
      toast.error('Preencha o campo nome da família!')
    }
  }

  return (
    <div>
      {/*<Cadastro />*/}
      <Principal />
      <div className="content">
        <h1>Mancini & Trindade</h1>
        <Title name="Cadastro de Família dos Produtos">
          <RiTeamFill size={25} />
        </Title>

        <div className="containerFAM">
          <form className="form-familia" onSubmit={handleAdd}>

            <div className='grupo'>
              <label>Código</label>
              <input type="text" className='codigo' value={codigo} disabled={true} />
            </div>

            <div className='grupo'>
              <label>Nome da família</label>
              <input type="text" className='familia' placeholder="" value={nome} onChange={(e) => setNome(e.target.value)} />
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
              <button className="btn-register2" type="button" onClick={(e) => CriaPDF(familia)}>Imprimir</button>
            </div>
          </form>
        </div>
      </div>

      <article>
        {familia.length === 0 ? (
          <div className="container dashboard">
            <span>Nenhuma família registrada...</span>
          </div>
        ) : (
          <>
            <table className='table_Famil'>
              <thead className='thead_Famil'>
                <tr>
                  <th scope="col">Código</th>
                  <th scope="col">Família</th>
                  <th scope="col">Cadastrador</th>
                  <th scope="col">Cadastrado</th>
                  <th scope="col">Ação</th>
                </tr>
              </thead>
              <tbody className='tbody_Famil'>
                {familia.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td data-label="Código">{item.codigo}</td>
                      <td data-label="Família">{item.nome}</td>
                      <td data-label="Cadastrador">{item.user}</td>
                      <td data-label="Cadastrado">{item.cadastroFormated}</td>
                      <td data-label="Ação">
                        <button className="action" style={{ backgroundColor: '#6add39' }} onClick={() => editFamilia(item)}>
                          <FiEdit2 color="#FFF" size={15} />
                        </button>

                        <button className="action" style={{ backgroundColor: '#f63535' }} onClick={() => deleteFamilia(item)}>
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
