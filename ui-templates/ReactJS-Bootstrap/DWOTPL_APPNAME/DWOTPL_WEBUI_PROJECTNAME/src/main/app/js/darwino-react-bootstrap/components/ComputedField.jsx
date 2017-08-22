/* 
 * (c) Copyright Darwino Inc. 2014-2017.
 */
import React, { Component } from "react";
import PropTypes from 'prop-types';

/*
 * ComputedField
 */
import { FormGroup, ControlLabel } from 'react-bootstrap';

export class ComputedField extends Component {

    // Context to read from the parent - router
    static contextTypes = {
        documentForm: PropTypes.object
    };

    constructor(props, context) {
        super(props, context)

        if(!context.documentForm) {
            throw new Error('DocumentSubform must be inside a component within a DocumentForm');        
        }
    }
    
    render() {
        const {label, name, value} = this.props
        let v = name ? this.context.documentForm.getFieldValue(name) : value
        return (
            <FormGroup>
                {label && <ControlLabel>{label}</ControlLabel>}
                <p className="form-control-static">{v!=null && v.toString()}</p>
            </FormGroup>
        )
    }
}

export default ComputedField
