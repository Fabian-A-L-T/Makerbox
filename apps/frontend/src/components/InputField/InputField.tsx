import './inputField.css'

interface InputFieldProps {
    label: string;
    type: string;
    placeholder: string;
    name: string;
    required?: boolean;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: () => void;
    error?: string ;
}

function InputField({ label, type, placeholder, name, required, value, onChange, onBlur, error }: InputFieldProps) {
    return (
        <div className={`login-input flex flex-col border-l-8 p-3`}>
            <label htmlFor={name} className="mb-3">{label}</label>
            <input
                id={name}
                type={type}
                placeholder={placeholder}
                className="border-b-2 border-[#B0B0B0]"
                name={name}
                required={required}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
            />
            {error && (
                <span className="text-[#DB0202] text-xs mt-1">{error}</span>
            )}
        </div>
    )
}

export default InputField;
