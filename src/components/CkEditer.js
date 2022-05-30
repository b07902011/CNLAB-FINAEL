import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

export const CkEditer = ({ content, onChange }) => {
    return (
        <CKEditor
            editor={ ClassicEditor }
            data={content}
            onChange={ ( _, editor ) => {
                const data = editor.getData();
                onChange(data);
            } }
        />
    ) 
}