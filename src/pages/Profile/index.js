import { useState, useContext } from 'react';
import './profile.css';
//import Header from '../../components/Header';
import Principal from '../../components/Menus/Principal';
import Title from '../../components/Title';
import avatar from '../../assets/avatar.png';
import { Link } from 'react-router-dom';
import firebase from '../../services/firebaseConnection';
import { AuthContext } from '../../contexts/auth';
import { FiSettings, FiUpload, FiPlus } from 'react-icons/fi';

export default function Profile() {
  const { user, signOut, setUser, storageUser } = useContext(AuthContext);
  const [nome, setNome] = useState(user && user.nome);
  const [email, setEmail] = useState(user && user.email);
  const [avatarUrl, setAvatarUrl] = useState(user && user.avatarUrl);
  const [imageAvatar, setImageAvatar] = useState(null);

  function handleFile(e) {
    if (e.target.files[0]) {
      const image = e.target.files[0];

      if (image.type === 'image/jpeg' || image.type === 'image/png') {
        setImageAvatar(image);
        setAvatarUrl(URL.createObjectURL(e.target.files[0]))
      } else {
        alert('Envie uma imagem do tipo PNG ou JPEG');
        setImageAvatar(null);
        return null;
      }
    }
  }

  async function handleUpload() {
    const currentUid = user.uid;
    const uploadTask = await firebase.storage()
      .ref(`images/${currentUid}/${imageAvatar.name}`)
      .put(imageAvatar)
      .then(async () => {
        console.log('FOTO ENVIADA COM SUCESSO!');

        await firebase.storage().ref(`images/${currentUid}`)
          .child(imageAvatar.name).getDownloadURL()
          .then(async (url) => {
            let urlFoto = url;

            await firebase.firestore().collection('users')
              .doc(user.uid)
              .update({
                avatarUrl: urlFoto,
                nome: nome
              })
              .then(() => {
                let data = {
                  ...user,
                  avatarUrl: urlFoto,
                  nome: nome
                };
                setUser(data);
                storageUser(data);
              })
          })
      })
  }

  async function handleSave(e) {
    e.preventDefault();

    if (imageAvatar === null && nome !== '') {
      await firebase.firestore().collection('users')
        .doc(user.uid)
        .update({
          nome: nome
        })
        .then(() => {
          let data = {
            ...user,
            nome: nome
          };
          setUser(data);
          storageUser(data);
        })
    }
    else if (nome !== '' && imageAvatar !== null) {
      handleUpload();
    }
  }

  return (
    <div>
      {/*<Header />*/}
      <Principal />
      <div className="content">
        <h1>Mancini & Trindade</h1>
        <Title name="Meu perfil">
          <FiSettings size={25} />
        </Title>

        <div className="containerProfile">
          <form className="form-profile" onSubmit={handleSave}>
            <label className="label-avatar">
              <span>
                <FiUpload color="#FFF" size={25} />
              </span>

              <input type="file" accept="image/*" onChange={handleFile} /><br />
              {avatarUrl === null ?
                <img src={avatar} width="250" height="250" alt="Foto de perfil do usuario" />
                :
                <img src={avatarUrl} width="250" height="250" alt="Foto de perfil do usuario" />
              }
            </label>

            <div className='grupo'>
              <label>Nome</label>
              <input type="text" className='nome' value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>

            <div className='grupo'>
              <label>Email</label>
              <input type="text" className='email' value={email} disabled={true} />
            </div>

            <div className='grupoBTN'>
              <button className="btn-register" type="submit">
                Salvar
              </button>
            </div>

          </form>
        </div>

        <div className="container">
          <button className="logout-btn" onClick={() => signOut()} >
            Logout
          </button>
        </div>

      </div>
    </div>
  )
}


