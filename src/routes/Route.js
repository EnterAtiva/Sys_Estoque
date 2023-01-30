import { useContext }      from 'react';
import { Route, Redirect } from 'react-router-dom';
import { AuthContext }     from '../contexts/auth';

export default function RouteWrapper({
  component: Component,
  isPrivate,
  ...rest
}){
  const { signed, loading } = useContext(AuthContext);

  if(loading){
    return(
      <div></div>
    )
  }

  // tentou entrar na pagina privata e não está logado, vai para tela de login
  if(!signed && isPrivate){
    return <Redirect to="/" />
  }

  // está logado e a tela não é privada, vai para tela de dashboard
  if(signed && !isPrivate){
    //return <Redirect to="/dashboard" />
    return <Redirect to="/menubase" />
  }

  return(
    <Route
      {...rest}
      render={ props => (
        <Component {...props} />
      )}
    />
  )
}