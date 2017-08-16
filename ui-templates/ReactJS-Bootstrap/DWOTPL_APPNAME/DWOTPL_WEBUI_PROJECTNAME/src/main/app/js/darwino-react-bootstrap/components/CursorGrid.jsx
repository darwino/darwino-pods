/* 
 * (c) Copyright Darwino Inc. 2014-2017.
 */
import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';

import ReactDataGrid from 'react-data-grid';
// Is there a better syntax for this?
//import {Data:{Selectors} as Selectors}  from 'react-data-grid-addons';
//import {Data}  from 'react-data-grid-addons';
//const Selectors = Data.Selectors;
import Selectors  from '../../darwino-react-bootstrap/components/react-grid/Selectors';
import JstoreCursor from '../../darwino-react/jstore/cursor';
import EmptyDataFetcher from '../../darwino-react/data/EmptyDataFetcher';
import ArrayDataFetcher from '../../darwino-react/data/ArrayDataFetcher';
import PagingDataFetcher from '../../darwino-react/data/PagingDataFetcher';


const  DefaultRowGroupRenderer = (props) => {
    let treeDepth = props.treeDepth || 0;
    let marginLeft = treeDepth * 20;

    let style = {
        //height: '30px',
        border: '1px solid #dddddd',
        paddingTop: '5px',
        paddingBottom: '5px',
        paddingLeft: '5px'
    };

    let onKeyDown = (e) => {
        if (e.key === 'ArrowLeft') {
            props.handleRowExpandToggle(false);
        }
        if (e.key === 'ArrowRight') {
            props.handleRowExpandToggle(true);
        }
        if (e.key === 'Enter') {
            props.handleRowExpandToggle(!props.isExpanded);
        }
    };

    return (
        <div style={style} onKeyDown={onKeyDown} tabIndex={0}>
            <span className="row-expand-icon" style={{float: 'left', marginLeft: marginLeft, cursor: 'pointer'}} onClick={props.onRowExpandClick} >{props.isExpanded ? String.fromCharCode('9660') : String.fromCharCode('9658')}</span>
            <strong>{props.name}</strong>
            </div>
    );
};
/*
 * Data Grid diplaying the result of a cursor
 */
export class CursorGrid extends Component {
    static contextTypes = {
        router: PropTypes.object
    };

    selector = false // React grid add-on Selector

    // Cursor property
    orderBy = null
    descending = false
    ftSearch = null

    constructor(props) {
        super(props);
        this.handleRowClick = this.handleRowClick.bind(this);
        this.handleGridSort = this.handleGridSort.bind(this);
        this.handleRowExpandToggle = this.handleRowExpandToggle.bind(this);
        this.rowGetter = this.rowGetter.bind(this);
        this.getSubRowDetails = this.getSubRowDetails.bind(this);
        this.onCellExpand = this.onCellExpand.bind(this);
        this.state = {}
        if(props.groupBy) {
            this.state.groupBy= props.groupBy;
            this.state.expandedRows= {};
        }
        if(props.showResponses) {
            this.state.expanded = {}
        }
    }

    findColumn(key) {
        const columns = this.props.grid && this.props.grid.columns;
        if(columns) {
            for(let i=0; i<columns.length; i++) {
                if(columns[i].key==key) return columns[i]
            }
        }
        return null;
    }

    componentWillMount() {
        this.reinitData();
    }

    reinitData() {
        let dataLoader = this.createDataLoader();
        if(this.props.groupBy || this.props.showResponses) {
            this.selector = true
            this.dataFetcher = this.createArrayDataFetcher(dataLoader);
        } else {
            this.dataFetcher = this.createPagingDataFetcher(dataLoader);
        }
        this.dataFetcher.init();
    }
    createDataLoader() {
        const { databaseId, storeId, params } = this.props;
        let jsc = new JstoreCursor()
            .database(databaseId)
            .store(storeId)
            .queryParams(params)
        ;
        if(this.orderBy) {
            jsc.orderby(this.orderBy,this.descending)
        }
        if(this.ftSearch) {
            jsc.ftsearch(this.ftSearch)
        }
        return jsc.getDataLoader(entry => {
            // Do it recusively for the chidren if any
            function process(e) {
                var r = {...e.json, __meta: e};
                if(r.__meta && r.__meta.children) {
                    r.__meta.children = r.__meta.children.map(process);
                }
                return r;
            }
            return process(entry);
        });            
    }

    createPagingDataFetcher(dataLoader) {
        return new PagingDataFetcher({
            dataLoader,
            autoFetch: true,
            onDataLoaded: () => {this.forceUpdate()},
            ...this.props.dataFetcher
        })
    }
    createArrayDataFetcher(dataLoader) {
        return new ArrayDataFetcher({
            dataLoader,
            onDataLoaded: () => {this.setState({rows: this.dataFetcher.getRows()})},
            ...this.props.dataFetcher
        })
    }


    handleRowClick(entry) {
        const { baseRoute, dynamicRoute } = this.props;
        if((!baseRoute && !dynamicRoute) || !entry || !entry.__meta) {
            return;
        }
        if(entry.__meta.category) {
            return;
        }        
        let url = dynamicRoute ? dynamicRoute(entry) : baseRoute + '/' + entry.__meta.unid;  
        // https://stackoverflow.com/questions/42701129/how-to-push-to-history-in-react-router-v4
        if(url) this.context.router.history.push(url);
    }

    handleRowExpandToggle({ columnGroupName, name, shouldExpand }) {
        let expandedRows = Object.assign({}, this.state.expandedRows);
        expandedRows[columnGroupName] = Object.assign({}, expandedRows[columnGroupName]);
        expandedRows[columnGroupName][name] = {isExpanded: shouldExpand};
        this.setState({expandedRows: expandedRows});
    }

    handleGridSort(sortColumn, sortDirection) {
        let c = this.findColumn(sortColumn);
        if(c && sortDirection!="NONE") {
            this.orderBy = c.sortField||sortColumn
            this.descending = sortDirection=='DESC'
        } else {
            this.orderBy = null
        }
        this.reinitData();
    }

    onSearchChange(evt) {
        this.setState({_ftSearch: evt.target.value});
    }

    createActionBar() {
        return (
            <div className="action-bar">
                {this.getCreateButton()}
                {this.getDeleteAllButton()}
            </div>
        );
    }

    createFTSearchBar() {
        return (
            <form className="navbar-form" role="search" style={{padding: 0}}
                    onSubmit={(evt) => {evt.preventDefault(); this.ftSearch=this._ftSearch; this.reinitData();}}>
                <div className="input-group">
                    <input type="text" className="form-control" size="30" placeholder="Search..." name="q" 
                        onChange={(evt) => this._ftSearch=evt.target.value}/>
                    <div className="input-group-btn">
                        <button className="btn btn-default" type="submit">
                            <i className="glyphicon glyphicon-search"></i>
                        </button>
                    </div>
                </div>
            </form>        
        );
    }

    getCreateButton() {
        const { createButtonText, baseRoute } = this.props;
        if(!createButtonText || !baseRoute) {
            return null
        } else {
            return (
                <Link to={`${baseRoute}`} className="btn btn-primary">{createButtonText}</Link>
            )
        }
    }

    getDeleteAllButton() {
        const { deleteAllButtonText } = this.props;
        if(!deleteAllButtonText) {
            return null
        } else {
            return (
                <div className="pull-right">
                    <button onClick={this.handleDeleteAllDocuments} className="btn btn-danger">{deleteAllButtonText}</button>
                </div>
            )
        }
    }

    rowGetter(i) {
        if(this.selector) {
            return Selectors.getRows(this.state)[i];
        }
        return i>=0 ? this.dataFetcher.getRow(i) : null;
    }
    rowsCount() {
        if(this.selector) {
            let count = Selectors.getRows(this.state).length;
            return count
        }
        return this.dataFetcher.getRowCount();
    }

    getSubRowDetails(rowItem) {
        //alert("getSubRowDetails="+JSON.stringify(rowItem))
        let rowId = rowItem.__meta.unid
        let isExpanded = this.state.expanded[rowId] ? this.state.expanded[rowId] : false;
        return {
            group: rowItem.__meta.children && rowItem.__meta.children.length > 0,
            expanded: isExpanded,
            children: rowItem.__meta.children,
            field: this.props.grid.columns[0].key,
            treeDepth: rowItem.treeDepth || 0,
            siblingIndex: rowItem.siblingIndex,
            numberSiblings: rowItem.numberSiblings
        };
    }
    onCellExpand(args) {
        let rows = this.state.rows.slice(0);
        let rowKey = args.rowData.__meta.unid;
        let rowIndex = rows.indexOf(args.rowData);
        let subRows = args.expandArgs.children;

        let expanded = Object.assign({}, this.state.expanded);
        if (expanded && !expanded[rowKey]) {
            expanded[rowKey] = true;
            this.updateSubRowDetails(subRows, args.rowData.treeDepth);
            rows.splice(rowIndex + 1, 0, ...subRows);
        } else if (expanded[rowKey]) {
            expanded[rowKey] = false;
            rows.splice(rowIndex + 1, subRows.length);
        }

        this.setState({ expanded: expanded, rows: rows });
    }
    updateSubRowDetails(subRows, parentTreeDepth) {
        let treeDepth = parentTreeDepth || 0;
        subRows.forEach((sr, i) => {
            sr.treeDepth = treeDepth + 1;
            sr.siblingIndex = i;
            sr.numberSiblings = subRows.length;
        });
    }

    render() {
        const props = this.props;
        return  (
            <div>
                {this.createActionBar()}
                {props.ftSearch && this.createFTSearchBar()}
                <ReactDataGrid
                    rowGetter={this.rowGetter}
                    rowsCount={this.rowsCount()}
                    minHeight={500}
                    onRowClick={(idx,data) => {
                        this.handleRowClick(data)
                    }}
                    onRowExpandToggle={this.handleRowExpandToggle}
                    rowGroupRenderer={DefaultRowGroupRenderer}
                    onGridSort={this.handleGridSort}
                    { ...(props.showResponses && 
                        {
                            getSubRowDetails: this.getSubRowDetails,
                            onCellExpand: this.onCellExpand
                        }
                    )}
                    {...this.props.grid}                
                />
            </div>
        );
    }    
}

export default CursorGrid
