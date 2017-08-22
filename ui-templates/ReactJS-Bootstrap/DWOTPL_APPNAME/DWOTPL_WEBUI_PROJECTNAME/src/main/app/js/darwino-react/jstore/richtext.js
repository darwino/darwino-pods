/*#!COPYRIGHT HEADER! - CONFIDENTIAL 
 *
 * Darwino Inc Confidential.
 *
 * (c) Copyright Darwino Inc. 2014-2016.
 *
 * Notice: The information contained in the source code for these files is the property 
 * of Darwino Inc. which, with its licensors, if any, owns all the intellectual property 
 * rights, including all copyright rights thereto.  Such information may only be used 
 * for debugging, troubleshooting and informational purposes.  All other uses of this information, 
 * including any production or commercial uses, are prohibited. 
 */
import queryString from 'query-string';
import DEV_OPTIONS from '../util/dev';

/*
 * Rich text utilities
 */
export function richTextToDisplayFormat({databaseId, storeId, instanceId, unid}, html) {
    if(html) {
        var INLINE_IMAGE_STORAGE_PATTERN = /src="\$document-attachment\/([^"]+(\||%7C){2}[^"]+)"/g
        return html.replace(INLINE_IMAGE_STORAGE_PATTERN, 
                'src="'+DEV_OPTIONS.serverPrefix+'$darwino-jstore'
                +'/databases/' + encodeURIComponent(databaseId)
                + '/stores/' + encodeURIComponent(storeId) 
                + '/documents/' + encodeURIComponent(unid) + '/attachments/$1'
                +(instanceId ? '?instance=' + encodeURIComponent(instanceId) : '') 
                + '"');
    }
    return html
}

export function richTextToStorageFormat({databaseId, storeId, instanceId, unid}, html) {
    if(html) {
        var INLINE_IMAGE_DISPLAY_PATTERN = /src="[^\"]*\$darwino-jstore\/databases\/([^\/]+)\/stores\/([^\/]+)\/documents\/([^\/]+)\/attachments\/([^\?]+)(\?instance=([^"]+))?"/g;
        return html.replace(INLINE_IMAGE_DISPLAY_PATTERN, 'src="$document-attachment/$4"');
    }
    return html
}

export function renderAttachmentUrl(databaseId, storeId, unid, name) {
    return    DEV_OPTIONS.serverPrefix+`$darwino-jstore/databases/${encodeURIComponent(databaseId)}`
            + `/stores/${encodeURIComponent(storeId)}/` 
            + `documents/${encodeURIComponent(unid)}/`
            + `attachments/${encodeURIComponent(name)}`;
}

export function cleanAttachmentName(name) {
    if(!name) { return "" }
    const inlineIndex = name.indexOf("||");
    if(inlineIndex > -1) {
        return name.substring(inlineIndex+2);
    }
    const attIndex = name.indexOf("^^");
    if(attIndex > -1) {
        return name.substring(attIndex+2);
    }
    return name;
}
