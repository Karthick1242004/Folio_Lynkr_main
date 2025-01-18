interface FormInputProps {
  type?: 'text' | 'email' | 'url' | 'textarea';
  name: string;
  label: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  id?: string;
  rows?: number;
}

export const FormInput: React.FC<FormInputProps> = ({ 
  type = 'text', 
  name, 
  label, 
  value, 
  onChange, 
  placeholder,
  rows = 3
}) => {
  return type === 'textarea' ? (
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2 border rounded-lg"
    />
  ) : (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-2 border rounded-lg"
    />
  );
};
  
  