import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/auth';
import './signin.css';
//import logo from '../../assets/logo.png';  
import logo from '../../assets/logo002.png';

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, loadingAuth } = useContext(AuthContext);

  function handleSubmit(e) {
    e.preventDefault();

    if (email !== '' && password !== '') {
      signIn(email, password)
    }
  }

  return (
    <div className="container-center">
      <div className="login">
        <div className="login-area">
          <img src={logo} alt="Sistema Logo" />
        </div>

        <form className='formSig' onSubmit={handleSubmit}>
          <h1>Entrar</h1>

          <div className='grupo'>
            <label>E-mail</label>
            <input type="text" className='email' placeholder="email@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className='grupo'>
            <label>Senha</label>
            <input type="password" className='senha' placeholder="*******" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <div className='grupoBTN'>
            <button className="btn-register" type="submit">{loadingAuth ? 'Carregando...' : 'Acessar'}</button>
          </div>
        </form>

        <Link to="/register">Criar uma conta</Link>
      </div>
    </div>
  );
}

export default SignIn;