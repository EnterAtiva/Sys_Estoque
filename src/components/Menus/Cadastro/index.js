import { useContext }  from 'react';
import './cadastro.css';
import { AuthContext } from '../../../contexts/auth';
import avatar          from '../../../assets/avatar.png';
import { Link }        from 'react-router-dom';
import { FiHome, FiUser, FiSettings } from "react-icons/fi";
import { RiUser2Fill, RiTeamFill, RiArrowGoBackFill } from 'react-icons/ri';   
import { FaBox } from 'react-icons/fa'; 

export default function Cadastro(){
  const { user } = useContext(AuthContext);

  return(
    <div className="sidebar">
      <div>
        <img src={user.avatarUrl === null ? avatar : user.avatarUrl } alt="Foto avatar" />
      </div>

      <Link to="/familia">
        <RiTeamFill color="#FFF" size={24} />
        Família dos produtos
      </Link>

      <Link to="/produto">
        <FaBox color="#FFF" size={24} />
        Produto
      </Link>    

      <Link to="/cliente">
        <RiUser2Fill color="#FFF" size={24} />
        Cliente / Fornecedor
      </Link>    

      <Link to="/menubase">
        <RiArrowGoBackFill color="#FFF" size={24} />
        Voltar
      </Link>    

    </div>
  )
}