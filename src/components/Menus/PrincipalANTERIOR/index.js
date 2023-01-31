import { useContext }  from 'react';
import './principal.css';
import { AuthContext } from '../../../contexts/auth';
import avatar          from '../../../assets/avatar.png';
import { Link, useHistory, useParams } from 'react-router-dom';
import { FiHome, FiUser, FiSettings } from "react-icons/fi";
import { RiArrowLeftRightFill, RiArticleFill, RiArrowGoBackFill } from "react-icons/ri";


export default function Principal(){
  const { user } = useContext(AuthContext);
  const tela0 = "principal";
  const tela1 = "cadastro";
  const tela2 = "movimento";

  return(
    <div className="sidebar">
      <div>
        <img src={user.avatarUrl === null ? avatar : user.avatarUrl } alt="Foto avatar" />
      </div>

      <a className='teste'>
      <RiArticleFill color="#FFF" size={24} />
      teste
      </a>

      <Link to={`/menubase/${tela1}` }> 
        <RiArticleFill color="#FFF" size={24} />
        Cadastro
      </Link>    

      <Link to={`/menubase/${tela2}` }>
        <RiArrowLeftRightFill color="#FFF" size={24} />
        Movimentação
      </Link>    

      <Link to="/#">
        <FiUser color="#FFF" size={24} />
        Estoques
      </Link>    
      
      <Link to="/profile">
        <FiSettings color="#FFF" size={24} />
        Configurações
      </Link>           
    </div>
  )
}