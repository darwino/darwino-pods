/* 
 * (c) Copyright Darwino Inc. 2014-2017.
 */

import React, { Component } from "react";
import Constants from "./Constants.jsx";
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import { Field, reduxForm, formValueSelector } from 'redux-form';
import { Link, Prompt } from "react-router-dom";
import { renderField, renderRadioGroup, renderCheckbox, renderSelect, renderRichText, renderDatePicker } from "../../darwino-react-bootstrap/form/formControls.jsx";
import DocumentForm from "../../darwino-react-bootstrap/components/DocumentForm.jsx";
import Section from "../../darwino-react-bootstrap/components/Section.jsx";

import JsonDebug from "../../darwino-react/util/JsonDebug.jsx";

const DATABASE = Constants.DATABASE;
const STORE = "_default";

const FORM_NAME = "contact";

const US_STATES = Constants.US_STATES;

export class Source extends DocumentForm {

    // Default values of the properties
    static defaultProps  = {
        nextPageSuccess: "/app/contacts"
    };

    constructor(props) {
        super(props)
        this.state = {};
    }

    handleActionClick() {
        alert("You clicked me!");
    }

    createActionBar() {
        return (
            <div className="action-bar">
                <button onClick={this.handleActionClick} className="btn btn-default">Click me!</button>
            </div>
        );
    }

    render() {
        const { handleSubmit, dirty, reset, invalid, submitting, newDoc, doc, type } = this.props;
        const disabled = !doc || doc.readOnly;
        
        return (
            <div>
                <form onSubmit={handleSubmit(this.handleUpdateDocument)}>
                    {this.createActionBar()}
                    <Prompt
                        when={dirty||newDoc}
                        message={location => (
                            `The contact is modified and not saved yet.\nDo you want to leave the current page without saving it?`
                        )}
                    />                    
                    <fieldset>
                        <legend>Contacts</legend>

                        <div className="col-md-12 col-sm-12">
                            <Field name="firstname" type="text" component={renderField} label="First Name" disabled={disabled}/>
                        </div>

                        <div className="col-md-12 col-sm-12">
                            <Field name="lastname" type="text" component={renderField} label="Last Name" disabled={disabled}/>
                        </div>

                        <div className="col-md-12 col-sm-12">
                            <Field name="email" type="text" component={renderField} label="E-Mail" disabled={disabled}/>
                        </div>

                        <div className="col-md-12 col-sm-12">
                            <Field name="sex" component={renderSelect} label="Sex" disabled={disabled}
                                options={[
                                    { value: "", label: "- Select One -"},
                                    { value: "M", label: "Male"},
                                    { value: "F", label: "Female"}
                                ]}
                            />
                        </div>

                        <div className="col-md-12 col-sm-12">
                            <Field name="firstcontact" component={renderDatePicker} label="Contact Since" disabled={disabled}/>
                        </div>

                        <Section defaultExpanded={true} title="Address" className="col-md-12 col-sm-12">
                            <div className="col-md-12 col-sm-12">
                                <Field name="street" type="text" component={renderField} label="Street" disabled={disabled}/>
                            </div>
                            <div className="col-md-12 col-sm-12">
                                <Field name="city" type="text" component={renderField} label="City" disabled={disabled}/>
                            </div>
                            <div className="col-md-2 col-sm-2">
                                <Field name="zipcode" type="text" component={renderField} label="Zip Code" disabled={disabled}/>
                            </div>
                            <div className="col-md-2 col-sm-2">
                                <Field name="state" type="text" component={renderSelect} label="State" disabled={disabled} options={US_STATES}/>
                            </div>
                        </Section>

                        <Section defaultExpanded={true} title="Phone Numbers" className="col-md-12 col-sm-12">
                            <div className="col-md-12 col-sm-12">
                                <Field name="home" type="text" component={renderField} label="Home" disabled={disabled}/>
                            </div>
                            <div className="col-md-12 col-sm-12">
                                <Field name="mobile" type="text" component={renderField} label="Mobile" disabled={disabled}/>
                            </div>
                            <div className="col-md-12 col-sm-12">
                                <Field name="work" type="text" component={renderField} label="Work" disabled={disabled}/>
                            </div>
                        </Section>

                        <div className="col-md-12 col-sm-12">
                            <Field name="comments" component={renderRichText} label="Comments" disabled={disabled}/>
                        </div>

                        <div>
                            <span style={disabled ? {display: 'none'} : {}}>
                                <div className="pull-right">
                                    <button onClick={this.handleDeleteDocument} className="btn btn-danger" style={newDoc ? {display: 'none'} : {}}>Delete</button>
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={invalid||submitting}>Submit</button>
                            </span>
                            <a className="btn btn-link" onClick={this.handleCancel}>Cancel</a>
                        </div>
                        
                        {/*Uncomment to display the current JSON content*/}
                        {/*<JsonDebug form={this.props.form}/>*/}
                    </fieldset>
                </form>
            </div>
        );
  }
}

function validate(values) {
    const errors = {};
    // Add the validation rules here!
    if(!values.firstname) {
        errors.firstname = "Missing First Name"
    }
    if(!values.lastname) {
        errors.lastname = "Missing Last Name"
    }
    return errors;
}

const selector = formValueSelector(FORM_NAME)
function mapStateToProps(state, ownProps) {
    return DocumentForm.mapStateToProps(state, ownProps, DATABASE, STORE)
}
const mapDispatchToProps = DocumentForm.mapDispatchToProps;

const form = reduxForm({
    form: FORM_NAME,
    validate,
    enableReinitialize: true
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(form(Source)))
