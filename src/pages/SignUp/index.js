
import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/auth';
import './signup.css';
//import logo from '../../assets/logo.png';
import logo from '../../assets/logo002.png';

function SignUp() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signUp, loadingAuth } = useContext(AuthContext);

  function handleSubmit(e) {
    e.preventDefault();

    if (nome !== '' && email !== '' && password !== '') {
      signUp(email, password, nome)
    }
  }

  return (
    <div className="container-center-up">
      <div className="login-up">
        <div className="login-area-up">
          <img src={logo} alt="Sistema Logo" />
        </div>

        <form className='formSigUp' onSubmit={handleSubmit}>
          <h1>Cadastrar conta</h1>

          <div className='grupo'>
            <label>Nome</label>
            <input type="text" className='nome' placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>

          <div className='grupo'>
            <label>E-mail</label>
            <input type="text" className='email' placeholder="email@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className='grupo'>
            <label>Senha</label>
            <input type="password" className='senha' placeholder="*******" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <div className='grupoBTN'>
            <button className="btn-register" type="submit">{loadingAuth ? 'Carregando...' : 'Cadastrar'}</button>
          </div>
        </form>

        <Link to="/">Já tem uma conta? Entre</Link>
      </div>
    </div>
  );
}

export default SignUp;