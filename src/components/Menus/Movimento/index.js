import { useContext }  from 'react';
import './movimento.css';
import { AuthContext } from '../../../contexts/auth';
import avatar          from '../../../assets/avatar.png';
import { Link }        from 'react-router-dom';
import { FiHome, FiUser, FiSettings } from "react-icons/fi";
import { RiUser2Fill, RiTeamFill, RiArrowGoBackFill } from 'react-icons/ri';   
import { FaBox, FaArrowCircleRight, FaArrowCircleLeft, FaFileSignature, FaRegListAlt } from 'react-icons/fa'; 

export default function Movimento(){
  const { user } = useContext(AuthContext);

  return(
    <div className="sidebar">
      <div>
        <img src={user.avatarUrl === null ? avatar : user.avatarUrl } alt="Foto avatar" />
      </div>

      <Link to="/entrada">
        <FaArrowCircleRight color="#FFF" size={24} />
        Entrada de produtos
      </Link>

      <Link to="/saida">
        <FaArrowCircleLeft color="#FFF" size={24} />
        Saída de produtos
      </Link>    

      <Link to="/inventario">
        <FaFileSignature color="#FFF" size={24} />
        Inventario
      </Link>    

      <Link to="/demostrativo">
        <FaRegListAlt color="#FFF" size={24} />
        Demonstrativo do inventario
      </Link>    

      <Link to="/menubase">
        <RiArrowGoBackFill color="#FFF" size={24} />
        Voltar
      </Link>    
    </div>
  )
}