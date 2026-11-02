import { useRef, useState } from 'react';
import Quill, {Delta} from 'quill';
import 'quill/dist/quill.snow.css';
import Editor from './Editor';

interface QuillTextEditorProps {
  label: string;
  name: string;
  defaultValue?: string;
  className?: string;
  isRequired?: boolean;
}

export default function QuillTextEditor({ label, name, defaultValue = '', className = '', isRequired = false }: QuillTextEditorProps) {
  const quillRef = useRef<Quill | null>(null);
  const [currentDelta, setCurrentDelta] = useState<Delta | undefined>();
  let deltaData: Delta;

  try {
    deltaData = defaultValue ? JSON.parse(defaultValue) : new Delta();
  } 
  catch (error) {
    console.error('Error parsing defaultValue:', error);
    deltaData = new Delta();
  }

  return (
    <div className={`flex flex-col gap-1 h-full ${className}`}>
      <label className="text-base">
        {label} {isRequired && <span className="text-[var(--color-danger)]">*</span>}
      </label>
      <div className="h-full rounded-[var(--border-radius-ui)] border border-[var(--color-border)] bg-[var(--color-form-text-bg)]">
        <Editor ref={quillRef} defaultValue={deltaData} onTextChange={setCurrentDelta}/>
      </div>
      <input value={currentDelta ? JSON.stringify(currentDelta) : defaultValue} type="hidden" name={name}/>
    </div>
  );
}
