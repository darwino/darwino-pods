/* 
 * (c) Copyright Darwino Inc. 2014-2017.
 */
import React, { Component } from "react";
import { FormSection } from 'redux-form';
import PropTypes from 'prop-types';

/*
 *
 */
export class DocumentSubform extends FormSection {

    // Context to read from the parent - router
    static contextTypes = {
        _reduxForm: PropTypes.object,
        documentForm: PropTypes.object
    };
      
    constructor(props, context) {
        super(props, context)
        if(!context.documentForm) {
            throw new Error('DocumentSubform must be inside a component within a DocumentForm');        
        }
    }

    componentWillMount() {
        this.getForm()._registerSubform(this)
    }

    componentWillUnmount() {
        this.getForm()._unregisterSubform(this)
    }

    getForm() {
        return this.context.documentForm;
    }

    getFieldValue(field) {
        // Should use the name as the path prefix!
        return this.getForm().getFieldValue(field)
    }

    setFieldValue(field,value) {
        // Should use the name as the path prefix!
        this.getForm().setFieldValue(field,value)
    }
}

export default DocumentSubform
