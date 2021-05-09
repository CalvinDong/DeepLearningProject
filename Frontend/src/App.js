import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import 'rsuite/dist/styles/rsuite-default.css';

import HomePage from './pages/index.js'

function AppRouter(props) {
  return (
    <Switch>
      <Route path="/"
        exact={true}
        component={HomePage}>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <AppRouter />
      </div>
    </BrowserRouter>
  );
}

export default App;
