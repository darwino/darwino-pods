/* 
 * (c) Copyright Darwino Inc. 2014-2017.
 */
import React, { Component } from "react";
import { toPath } from 'lodash'
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import { Field } from 'redux-form';
import { Link } from "react-router";
import { darwinoToStoreKey, updateDocument, createDocument, loadDocument, newDocument, deleteDocument, removeDocument } from "../../darwino-react/actions/jsonStoreActions.jsx";

import _isEqual from 'lodash-es/isEqual';


// Read only means that the value is not displayed as a control but rather as piece of HTML
export const DEFAULT_MODE = 0;
    
// Read only means that the value is not displayed as a control but rather as piece of HTML
export const READONLY = 1;
        
// The value is displayed as a read only control
export const DISABLED = 2;
    
// The value is displayed as an editable control
export const EDITABLE = 3;

    
/*
 * Expected properties:
 * - databaseId (string)
 * - storeId (string)
 * - unid (string)
 */
export class DocumentForm extends Component {

    // Context to read from the parent - router
    static contextTypes = {
        router: PropTypes.object
    };

    // Context to pusblish to the children - documentForm
    static childContextTypes = {
        documentForm: React.PropTypes.object
    };
    getChildContext() {
        return {documentForm: this};
    }


    // Form registered by name
    // Static member for now, until we find a better solution with the redux form team
    // https://github.com/erikras/redux-form/issues/3340
    static __forms = {}

    // Form validation
    static validateForm = function(values,props) {
        let c = DocumentForm.__forms[props.form]
        return c ? c._onValidate(values) : {}
    }
    _onValidate = function(values) {
        const err = {}
        if(this.validate) Object.assign(err,this.validate(values))
        this.subforms.length && this.subforms.forEach((f) => {
            if(f.validate) { 
                Object.assign(err,f.validate(values))
            }
        })
        return err;
    }

    // Calculate computed fields on document load
    _onLoad(values) {
        if(!values) return
        this.fieldValues = values
        let computed = {}
        if(this.calculateOnLoad) this.calculateOnLoad(computed)
        this.subforms.length && this.subforms.forEach((f) => {
            if(f.calculateOnLoad) {
                f.calculateOnLoad(computed);
            }
        })
        this.computedValues = computed;
    }

    // Calculate computed fields on document change
    static onChange = function(values,dispatch,props) {
        let c = DocumentForm.__forms[props.form]
        if(c) c._onChange(values);
    }
    _onChange(values) {
        if(!values) return
        this.fieldValues = values
        let oldValues = {...this.computedValues}
        let computed = this.computedValues
        if(this.calculateOnChange) this.calculateOnChange(computed)
        this.subforms.length && this.subforms.forEach((f) => {
            if(f.calculateOnChange) {
                f.calculateOnChange(computed);
            }
        })
        if(!_isEqual(oldValues,computed)) {
            this.forceUpdate();
        }
    }


    // Default mapDispatchProps
    static mapDispatchToProps = {
        updateDocument, 
        createDocument, 
        loadDocument, 
        newDocument, 
        deleteDocument,
        removeDocument
    };

    constructor(props) {
        super(props);

        this.subforms = []
        this.handleUpdateDocument = this.handleUpdateDocument.bind(this);
        this.handleDeleteDocument = this.handleDeleteDocument.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.docEvents = {
            initialize: (doc,newDoc) => {
                this.setState({
                    mode: this.forceMode || (doc.readOnly ? DISABLED : EDITABLE),
                    docInitialized: true, 
                    newDoc, 
                    unid: doc.unid, 
                    doc
                })
                this.fieldValues = doc.json
                if(newDoc) {
                    if(this.defaultValues) this.defaultValues(doc.json)
                    this.subforms.length && this.subforms.forEach((f) => {
                        if(f.defaultValues) f.defaultValues(doc.json)
                    })
                }
                this._onLoad(doc.json)
            },
            prepareForDisplay: (values) => {
                if(this.prepareForDisplay) this.prepareForDisplay(values);
                this.subforms.length && this.subforms.forEach((f) => {
                    if(f.prepareForDisplay) f.prepareForDisplay(values)
                })
            },
            prepareForSave: (values) => {
                if(this.prepareForSave) this.prepareForSave(values);
                this.subforms.length && this.subforms.forEach((f) => {
                    if(f.prepareForSave) f.prepareForSave(values)
                })
            },
            documentReady: (doc) => {
                this.props.initialize(doc.json)
            }
        }

        // We grab the database information from the properties
        // Note that the unid can come from the URL as well
        const databaseId = props.databaseId;
        const storeId = props.storeId;
        const unid = props.unid || (props.match.params && props.match.params.unid) || null;

        // We store a copy of the fields and the computed fields in the component itself
        this.fieldValues = {}
        this.computedValues = {}

        // The state carries information on the current document assigned to the form
        this.state = {
            forceMode: DEFAULT_MODE,
            mode: DISABLED,
            docInitialized: false,
            databaseId: databaseId,
            storeId: storeId,
            unid: unid,
            newDoc: !unid,
            doc: {}
        }
    }
    
    componentDidMount() {
        const { loadDocument, newDocument } = this.props;
        const { databaseId, storeId, unid, newDoc } = this.state;

        // Add the current component to the validation list
        DocumentForm.__forms[this.props.form] = this

        // Load the initial values
        // We could also call newDocument is we want to call the service to get the
        // document initialized
        if(newDoc) {
            newDocument(databaseId, storeId, unid, false, this.docEvents);
        } else {
            loadDocument(databaseId, storeId, unid, this.docEvents);
        }
    }

    componentWillUnmount() {
        const { databaseId, storeId, unid, newDoc } = this.state;

        // Remove the validation function for that form
        if(DocumentForm.__forms[this.props.form]==this) {
            delete DocumentForm.__forms[this.props.form]
        }

        // Remove the document from the redux store
        if(!newDoc) {
            removeDocument(databaseId, storeId, unid, this.docEvents);
        }
    }

    _registerSubform(subform) {
        this.subforms.push(subform);
    }
    _unregisterSubform(subform) {
        const index = this.subforms.indexOf(subform);
        this.subforms.splice(index,1);
    }

    getForm() {
        return this;
    }

    getMode() {
        return this.state.mode;
    }

    setMode(mode) {
        const doc = this.state.doc;
        this.setState({
            forceMode: mode,
            mode: mode || (doc && !doc.readOnly ? EDITABLE : DISABLED),
        });
    }

    isReadOnly() {
        return this.state.mode==READONLY;
    }

    isDisabled() {
        return this.state.mode==DISABLED;
    }

    isEditable() {
        return this.state.mode==EDITABLE;
    }

    isInitialized() {
        return this.state.docInitialized;
    }

    isNewDoc() {
        return this.state.newDoc;
    }

    getDocument() {
        return this.state.doc;
    }

    getFieldValue(field,def) {
        let v = this.fieldValues[field];
        if(v===undefined) {
            v = this.computedValues[field];
        }
        return v!==undefined ? v : def;
    }

    setFieldValue(field,value) {
        this.props.change(field,value)
    }

    // // Future extension: get hierarchical fields
    // getPathValue(field) {
    //     const path = toPath(field)
    //     const length = path.length
    //     if (length) {
    //         if(this.props.values) {
    //             let v = this._extract(this.props.values,path)
    //             if(v!=undefined) return v;
    //         }
    //         if(this.props.computed) {
    //             let v = this._extract(this.props.computed,path)
    //             if(v!=undefined) return v;
    //         }
    //     }
    //     return undefined
    // }
    // _extract(values,path) {
    //     let result = values
    //     for (let i = 0; i < length && result; ++i) {
    //         result = result[path[i]]
    //     }    
    //     return result;
    // }

    handleUpdateDocument(state, dispatch) {
        const { databaseId, storeId, unid, doc, newDoc } = this.state;
        const { createDocument, updateDocument } = this.props;
        let promise;
        if(newDoc) {
            promise = createDocument(databaseId, storeId, unid, {
                ...state
            },this.docEvents);
        } else {
            promise = updateDocument(databaseId, storeId, unid, {
                ...doc.json,
                ...state
            }, this.docEvents)
        }

        promise.then(() => {
            if(this.props.nextPageSuccess) {
       			this.props.reset();
                this.context.router.history.push(this.props.nextPageSuccess);
            }
        }, () => {
            if(this.props.nextPageError) {
       			this.props.reset();
                this.context.router.history.push(this.props.nextPageError);
            }
        });
    }

    handleDeleteDocument(state, dispatch) {
        if(!confirm("This will delete the document.\nDo you want to continue?")) {
            return;
        }

        const { databaseId, storeId, unid } = this.state;
        const { deleteDocument } = this.props;

        deleteDocument(databaseId, storeId, unid).then(() => {
            if(this.props.nextPageSuccess) {
                this.context.router.history.push(this.props.nextPageSuccess);
            }
        }, () => {
            if(this.props.nextPageError) {
                this.context.router.history.push(this.props.nextPageError);
            }
        });
    }

    handleCancel(state, dispatch) {
        if(this.props.nextPageSuccess) {
            this.props.reset()
            this.context.router.history.push(this.props.nextPageSuccess);
        } 
    }
}

export default DocumentForm
