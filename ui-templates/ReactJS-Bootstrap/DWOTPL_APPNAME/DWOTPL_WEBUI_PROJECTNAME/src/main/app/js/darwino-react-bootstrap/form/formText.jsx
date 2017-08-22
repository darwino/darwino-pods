/* 
 * (c) Copyright Darwino Inc. 2014-2017.
 */
import React from "react";
import { FormControl, FormGroup, ControlLabel } from 'react-bootstrap';

export const renderText = (field,cb) => {
    const {label, input } = field
    let value = input.value
    if(cb) value = cb(value)
    return (
        <FormGroup>
            {label && <ControlLabel>{label}</ControlLabel>}
            <p className="form-control-static">{value!=null ? value.toString() : ""}</p>
        </FormGroup>
    )
};
