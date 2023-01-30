import { Switch } from 'react-router-dom';
import Route      from './Route';
import SignIn     from '../pages/SignIn';
import SignUp     from '../pages/SignUp';
import Dashboard  from '../pages/Dashboard';
import Profile    from '../pages/Profile';
import New        from '../pages/New';

import Menubase   from '../pages/Menubase';
import Familia    from '../pages/Familia';
import Produto    from '../pages/Produto';
import Cliente    from '../pages/Cliente';
import Entrada    from '../pages/Entrada';
import Saida      from '../pages/Saida';
import Inventario from '../pages/Inventario';
import Demostrativo from '../pages/Demostrativo';

export default function Routes(){
  return(
    <Switch>
      <Route exact path="/" component={SignIn} />
      <Route exact path="/register" component={SignUp} />

      <Route exact path="/dashboard" component={Dashboard} isPrivate />
      <Route exact path="/profile" component={Profile} isPrivate />
      <Route exact path="/new" component={New} isPrivate />
      <Route exact path="/new/:id" component={New} isPrivate />

      <Route exact path="/menubase" component={Menubase} isPrivate />
      <Route exact path="/menubase/:tela0" component={Menubase} isPrivate />
      <Route exact path="/menubase/:tela1" component={Menubase} isPrivate />
      <Route exact path="/menubase/:tela2" component={Menubase} isPrivate />
      <Route exact path="/familia" component={Familia} isPrivate />
      <Route exact path="/produto" component={Produto} isPrivate />
      <Route exact path="/cliente" component={Cliente} isPrivate />
      <Route exact path="/entrada" component={Entrada} isPrivate />
      <Route exact path="/saida" component={Saida} isPrivate />
      <Route exact path="/inventario" component={Inventario} isPrivate />
      <Route exact path="/demostrativo" component={Demostrativo} isPrivate />
    </Switch>
  )
}