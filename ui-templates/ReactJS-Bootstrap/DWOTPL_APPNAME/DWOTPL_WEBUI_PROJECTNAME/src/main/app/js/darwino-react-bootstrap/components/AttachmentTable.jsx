/* 
 * (c) Copyright Darwino Inc. 2014-2017.
 */
import React, { Component } from "react";
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import { Field } from 'redux-form';
import { Link } from "react-router";
import { darwinoToStoreKey, updateDocument, createDocument, loadDocument, newDocument, deleteDocument, removeDocument } from "../../darwino-react/actions/jsonStoreActions.jsx";
import { renderAttachmentUrl, cleanAttachmentName } from "../../darwino-react/jstore/richtext";

/*
 * Document attachment table.
 */
export class AttachmentTable extends Component {

    // Context to read from the parent - router
    static contextTypes = {
        documentForm: PropTypes.object
    };
    
    constructor(props,context) {
        super(props,context);
        if(!context.documentForm) {
            throw new Error('AttachmentTable must be inside a component within a DocumentForm');        
        }
}

    render() {
        const {field} = this.props;
        const doc = this.context.documentForm.getDocument();
        if(!doc || !doc.attachments) {
            return null;
        }
        return (<table className="table table-condensed table-striped table-bordered table-attachments">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Size</th>
                    <th>Type</th>
                </tr>
            </thead>
            <tbody>
                {this.renderAttachmentRows(this.attachmentsForField(doc.attachments, field), doc.unid)}
            </tbody>
        </table>)
    }

    attachmentsForField(attachments, field) {
        return field ? attachments.filter(att => att.name.toLowerCase().indexOf(field+"^^") == 0) : attachments;
    }

    renderAttachmentRows(attachments, unid) {
        const { databaseId, storeId } = this.props;
        return attachments.map(att => {
            return (<tr key={att.name}>
                    <td>
                        <a href={renderAttachmentUrl(databaseId, storeId, unid, att.name)} target="_blank">
                        {cleanAttachmentName(att.name)}
                        </a>
                    </td>
                    <td>{att.length}</td>
                    <td>{att.mimeType}</td>
                </tr>
            )
        })
    }
}

export default AttachmentTable
