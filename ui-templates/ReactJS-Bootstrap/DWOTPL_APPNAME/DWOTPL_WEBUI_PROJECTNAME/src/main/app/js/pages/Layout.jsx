/* 
 * (c) Copyright Darwino Inc. 2014-2017.
 */

import React from "react";

import { Route, Switch } from 'react-router-dom';

import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import Navigator from "./Navigator.jsx";
import AdminConsole from "../darwino-react-bootstrap/components/AdminConsole.jsx";

import Home from "./Home.jsx";

import SampleForm from "./app/SampleForm.jsx";
import SampleView from "./app/SampleView.jsx";

export default class Layout extends React.Component {
  render() {
    const { location } = this.props;
    return (
      <div>
        <Header/>
        <div className="container-fluid" id="body-container">
          <div className="row">
            <div className="col-sm-3 col-lg-2 sidebar">
              <Navigator location={location} />
            </div>
            <div className="col-sm-9 col-lg-10 main" id="content">
              <Switch>
                <Route exact path="/" component={Home}></Route>

                <Route exact path="/app/docs" component={SampleView}></Route>
                <Route exact path="/app/doc/" component={SampleForm}></Route>
                <Route exact path="/app/doc/:unid" component={SampleForm}></Route>

                <Route exact path="/admin/console" component={AdminConsole}></Route>
              </Switch>
            </div>
          </div>
        </div>
        <Footer/>
      </div>

    );
  }
}
