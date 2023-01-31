import { useContext }  from 'react';
import './principal.css';
import { AuthContext } from '../../../contexts/auth';
import avatar          from '../../../assets/avatar.png';
import { Link, useHistory, useParams } from 'react-router-dom';
import { FiHome, FiUser, FiSettings } from "react-icons/fi";
import { RiArrowLeftRightFill, RiArticleFill, RiUser2Fill, RiTeamFill} from "react-icons/ri";
import { FaBox, FaArrowCircleRight, FaArrowCircleLeft, FaFileSignature, FaRegListAlt, FaClipboard } from 'react-icons/fa'; 


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

      <a className="titulo">
      <RiArticleFill color="#FFF" size={17} />
      Cadastro
      </a>

      <Link to="/familia">
        <RiTeamFill color="#FFF" size={17} />
        Família do produto
      </Link>

      <Link to="/produto">
        <FaBox color="#FFF" size={17} />
        Produto
      </Link>    

      <Link to="/cliente">
        <RiUser2Fill color="#FFF" size={17} />
        Cliente/Fornecedor
      </Link>    

      <a className="titulo">
      <RiArrowLeftRightFill color="#FFF" size={17} />
      Estoque
      </a>

      <Link to="/entrada">
        <FaArrowCircleRight color="#FFF" size={17} />
        Entrada de produtos
      </Link>

      <Link to="/saida">
        <FaArrowCircleLeft color="#FFF" size={17} />
        Saída de produtos
      </Link>    

      <a className="titulo">
      <FaClipboard color="#FFF" size={17} />
      Inventario
      </a>

      <Link to="/inventario">
        <FaFileSignature color="#FFF" size={17} />
        Lançamentos
      </Link>    

      <Link to="/demostrativo">
        <FaRegListAlt color="#FFF" size={17} />
        Demonstrativo
      </Link>    

      <a className="titulo">
      <FiSettings color="#FFF" size={17} />
      Configurações
      </a>

      <Link to="/profile">
      <FiUser color="#FFF" size={17} />
        Usuário
      </Link>           




      {/*
      <Link to={`/menubase/${tela1}` }> 
        <RiArticleFill color="#FFF" size={24} />
        **Cadastro**
      </Link>    

      <Link to={`/menubase/${tela2}` }>
        <RiArrowLeftRightFill color="#FFF" size={24} />
        **Movimentação**
      </Link>    

      <Link to="/#">
        <FiUser color="#FFF" size={24} />
        Estoques
      </Link>    
    */}     
    </div>
  )
}