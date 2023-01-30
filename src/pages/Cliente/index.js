import { useState, useEffect, useContext } from 'react';
import './cliente.css';
import Title from '../../components/Title';
import Cadastro from '../../components/Menus/Cadastro';
import firebase from '../../services/firebaseConnection';
import { FiEdit2, FiUser, FiMessageSquare } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { RiDeleteBin3Line, RiUser2Fill } from 'react-icons/ri';

import { format } from 'date-fns';
import { AuthContext } from '../../contexts/auth';
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

export default function Cliente() {
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [cidade, setCidade] = useState('');
  const [tipo, setTipo] = useState('Cliente');
  const [codigo, setCodigo] = useState('');
  const [cliente, setCliente] = useState([]);  //gera uma lista
  const { user } = useContext(AuthContext);
  const [edit, setEdit] = useState({});
  const [delet, setDelet] = useState({});

  useEffect(() => {
    async function loadCliente() {
      const unsub = onSnapshot(firebase.firestore().collection("cliente")
      .orderBy('nomeFantasia', 'asc'), 
      (snapshot) => {
        let listaCliente = [];
        snapshot.forEach((doc) => {
          listaCliente.push({
            id: doc.id,
            nomeFantasia: doc.data().nomeFantasia,
            cidade: doc.data().cidade,
            codigo: doc.data().codigo,
            tipo: doc.data().tipo,
            cadastro: doc.data().cadastro,
            cadastroFormated: format(doc.data().cadastro.toDate(), 'dd/MM/yyyy'),
            user: doc.data().user,
          })
        })
        // Busca o ultimo código cadastrado e soma 1
        setCliente(listaCliente);
        /*
        let xx = listaCliente.findLast((listaCliente) => listaCliente.codigo > 0);
        setCodigo(xx.codigo + 1);
        */
      })
    }
    loadCliente();
    loadCodigo();
  }, [])

  async function loadCodigo() {
    const unsub = onSnapshot(firebase.firestore().collection("cliente")
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

  async function deleteCliente(item) {
    setCodigo(item.codigo)
    setNomeFantasia(item.nomeFantasia)
    setCidade(item.cidade)
    setTipo(item.tipo)
    setEdit({});
    setDelet(item);
  }

  function editCliente(item) {
    setCodigo(item.codigo)
    setNomeFantasia(item.nomeFantasia)
    setCidade(item.cidade)
    setTipo(item.tipo)
    setDelet({});
    setEdit(item);
  }

  async function handleAdd(e) {
    e.preventDefault();

    // Excluindo o cliente / fornecedor
    if (delet?.id) {
      await firebase.firestore().collection('cliente')
        .doc(delet.id)
        .delete(delet.id)
        .then(() => {
          toast.success('Cliente / Fornecedor deletedo com sucesso!');
          limpaTela();
        })
        .catch((err) => {
          toast.error('Ops erro ao excluir, tente mais tarde.')
          console.log(err);
        })
      return;
    }

    // Editando o cliente / fornecedor
    if (edit?.id) {
      if (!nomeFantasia) {
        toast.error('Os campos NOME FANTASIA da empresa tem que ser preenchido.')
      } else {
        await firebase.firestore().collection('cliente')
          .doc(edit.id)
          .update({
            codigo: codigo,
            nomeFantasia: nomeFantasia,
            cidade: cidade,
            tipo: tipo,
            user: edit.user
          })
          .then(() => {
            toast.success('Cliente / Fornecedor editada com sucesso!');
            limpaTela();
          })
          .catch((err) => {
            toast.error('Ops erro ao editar, tente mais tarde.')
            console.log(err);
          })
        return;
      }
    }

    //// Cadastrando o cliente / fornecedor
    if (!nomeFantasia) {
      toast.error('Os campos NOME FANTASIA da empresa tem que ser preenchido.')
    } else {
      await firebase.firestore().collection('cliente')
        .add({
          codigo: codigo,
          nomeFantasia: nomeFantasia,
          cidade: cidade,
          tipo: tipo,
          cadastro: new Date(),
          user: user.nome
        })
        .then(() => {
          toast.info('Empresa cadastrada com sucesso!');
          limpaTela();
        })
        .catch((error) => {
          console.log(error);
          toast.error('Erro ao cadastrar a empresa.');
        })
    }
  }

  function limpaTela() {
    setCodigo('');
    setNomeFantasia('');
    setCidade('');
    setTipo('Cliente');
    setEdit({});
    setDelet({});
    loadCodigo();
  }

  //Chamado quando troca o TIPO
  function handleOptionChange(e) {
    setTipo(e.target.value);
  }

  return (
    <div>
      <Cadastro />
      <div className="content">
        <h1>Mancini & Trindade</h1>
        <Title name="Cadastro de Clientes / Fornecedores">
          <RiUser2Fill size={25} />
        </Title>

        <div className="containerCLIENTE">
          <form className="form-cliente" onSubmit={handleAdd}>

            <div className='grupo'>
              <label>Código</label>
              <input type="text" className='codigo' value={codigo} disabled={true} />
            </div>

            <div className='grupo'>
              <label>Nome fantasia</label>
              <input type="text" className='nomeFantasia' placeholder="" value={nomeFantasia} onChange={(e) => setNomeFantasia(e.target.value)} />
            </div>

            <div className='grupo'>
              <label>Cidade - Estado</label>
              <input type="text" className='cidade' placeholder="" value={cidade} onChange={(e) => setCidade(e.target.value)} />
            </div>

            <div className='grupo'>
              <label>Tipo</label>
              <div className="status">
                <input
                  type="radio"
                  name="radio"
                  value="Cliente"
                  onChange={handleOptionChange}
                  checked={tipo === 'Cliente'}
                />
                <span>Cliente</span>

                <input
                  type="radio"
                  name="radio"
                  value="Fornecedor"
                  onChange={handleOptionChange}
                  checked={tipo === 'Fornecedor'}
                />
                <span>Fornecedor</span>

                <input
                  type="radio"
                  name="radio"
                  value="Ambos"
                  onChange={handleOptionChange}
                  checked={tipo === 'Ambos'}
                />
                <span>Ambos</span>
              </div>
            </div>

            <div className='grupoBTN'>
              {Object.keys(edit).length > 0 ? (
                <button className="btn-register" style={{ backgroundColor: '#6add39' }} type="submit">Atualizar <br/> cliente / fornecedor</button>
              ) : Object.keys(delet).length > 0 ? (
                <button className="btn-register" style={{ backgroundColor: '#f63535' }} type="submit">Excluir <br/> cliente / fornecedor</button>
              ) : (
                <button className="btn-register" type="submit">Cadastrar <br/> cliente / fornecedor</button>
              )}
              <button className="btn-register2" type="button" onClick={limpaTela}>Cancelar</button>
            </div>

          </form>
        </div>
      </div>

      <article>
        {cliente.length === 0 ? (
          <div className="container dashboard">
            <span>Nenhum cliente / fornecedor cadastrado...</span>
          </div>
        ) : (
          <>
            <table className='table_Cliente'>
              <thead className='thead_Cliente'>
                <tr>
                  <th scope="col">Código</th>
                  <th scope="col">Nome fantasia</th>
                  <th scope="col">Cidade</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Cadastro</th>
                  <th scope="col">em</th>
                  <th scope="col">Ação</th>
                </tr>
              </thead>
              <tbody className='tbody_Cliente'>
                {cliente.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td data-label="Código">{item.codigo}</td>
                      <td data-label="Razão">{item.nomeFantasia}</td>
                      <td data-label="Cidade">{item.cidade}</td>
                      <td data-label="Tipo">{item.tipo}</td>
                      <td data-label="Cadastro">{item.user}</td>
                      <td data-label="em">{item.cadastroFormated}</td>
                      <td data-label="Ação">
                        <button className="action" style={{ backgroundColor: '#6add39' }} onClick={() => editCliente(item)}>
                          <FiEdit2 color="#FFF" size={15} />
                        </button>

                        <button className="action" style={{ backgroundColor: '#f63535' }} onClick={() => deleteCliente(item)}>
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