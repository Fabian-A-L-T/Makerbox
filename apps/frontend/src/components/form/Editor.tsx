import Quill, { Delta } from 'quill';
import { useEffect, useLayoutEffect, useRef } from 'react';

interface EditorProps {
  readOnly?: boolean;
  defaultValue?: Delta;
  onTextChange?: React.Dispatch<React.SetStateAction<any>>;
  onSelectionChange?: React.Dispatch<React.SetStateAction<any>>;
  ref: React.RefObject<Quill | null>;
}

// Editor is an uncontrolled React component
const Editor = ({ readOnly, defaultValue, onTextChange, onSelectionChange, ref }: EditorProps) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const defaultValueRef = useRef(defaultValue);
    const onTextChangeRef = useRef(onTextChange);
    const onSelectionChangeRef = useRef(onSelectionChange);

    useLayoutEffect(() => {
        onTextChangeRef.current = onTextChange;
        onSelectionChangeRef.current = onSelectionChange;
    });

    useEffect(() => {
        ref.current?.enable(!readOnly);
    }, [ref, readOnly]);

    useEffect(() => {
        const container = containerRef.current;
        if(container)  {
            const editorContainer = container.appendChild(
                container.ownerDocument.createElement('div'),
            );
            const quill = new Quill(editorContainer, {
                modules: {
                    toolbar: [
                        [{ 'size': ['small', false, 'large', 'huge'] },{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        ['blockquote', 'code-block'],
                        [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
                        [{ 'align': [] }, { 'indent': '-1'}, { 'indent': '+1' }],   
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
                        [{ 'color': [] }],
                        ['clean']  
                    ]
                },
                theme: 'snow',
            });
            ref.current = quill;

            if (defaultValueRef.current) {
                quill.setContents(defaultValueRef.current);
            }

            quill.on('text-change', () => {
                onTextChangeRef.current?.(quill.getContents());
            });

            quill.on('selection-change', (...args) => {
                onSelectionChangeRef.current?.({...args});
            });
        }
        return () => {
            ref.current = null;
            if (container) container.innerHTML = '';
        };
    }, [ref]);

    return <div ref={containerRef}></div>;
}

Editor.displayName = 'Editor';

export default Editor;