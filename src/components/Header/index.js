import { useContext } from 'react';
import './header.css';
import { AuthContext } from '../../contexts/auth';
import avatar from '../../assets/avatar.png';
import { Link } from 'react-router-dom';
import { FiHome, FiUser, FiSettings } from "react-icons/fi";
import { RiUser2Fill, RiTeamFill, RiArrowGoBackFill } from 'react-icons/ri';
import { FaBox } from 'react-icons/fa';

export default function Header() {
  const { user } = useContext(AuthContext);

  return (
    <div className="sidebar">
      <div>
        <img src={user.avatarUrl === null ? avatar : user.avatarUrl} alt="Foto avatar" />
      </div>

      <Link to="/menubase">
        <RiArrowGoBackFill color="#FFF" size={24} />
        Voltar
      </Link>

    </div>
  )
}