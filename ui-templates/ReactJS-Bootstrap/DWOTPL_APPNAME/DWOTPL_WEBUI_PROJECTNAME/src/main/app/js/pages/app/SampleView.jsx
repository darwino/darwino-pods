/* 
 * (c) Copyright Darwino Inc. 2014-2017.
 */

import React from "react";
import Constants from "./Constants.jsx";
import CursorGrid from "../../darwino-react-bootstrap/components/CursorGrid.jsx"

const SampleView = () => {
    return (
        <CursorGrid
            databaseId={Constants.DATABASE}
            storeId={'_default'}
            params={{
                extract: {
                    _unid: "_unid",
                    myfield: "myfield",
                },
                orderby: "_cdate d"
            }}
            grid={{
                columns:[
                    {name: "UNID", key: "_unid"},
                    {name: "My Field", key: "myfield"}
                ],
                enableCellSelect: true
            }}
            baseRoute="/app/doc"
            createButtonText="Create a new document"
            deleteAllButtonText="Delete all documents"
        />
    )
}

export default SampleView
