/* 
 * (c) Copyright Darwino Inc. 2014-2017.
 */

import React from "react";

import NavLink from "../darwino-react-bootstrap/components/NavLink.jsx";
import NavGroup from "../darwino-react-bootstrap/components/NavGroup.jsx";

export default class Nav extends React.Component {
    render() {
        const { location } = this.props;
    
        return (
            <nav className="navbar navbar-default navbar-fixed-side" role="navigation">
                <div className="container">
                    <div className="navbar-header">
                        <button type="button" data-target="#dwo-nav-collapse" data-toggle="collapse" className="navbar-toggle">
                        <span className="sr-only">Toggle navigation</span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                        </button>
                    </div>
                    <div className="navbar-collapse collapse" id="dwo-nav-collapse">
                        <ul className="nav navbar-nav">
                            <NavLink to="/" exact={true}>Home</NavLink>

                            <NavGroup title="Documents" collapsible={true} defaultExpanded={true}>
                                <NavLink to="/app/contacts">Contacts</NavLink>
                                <NavLink to="/app/contactsg">Contacts Grid</NavLink>
                            </NavGroup>
                        </ul>
                    </div>
                </div>
            </nav>
        );
    }
}