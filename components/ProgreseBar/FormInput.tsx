interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
  }
  
  export function FormInput({ label, ...props }: FormInputProps) {
    return (
      <div className="space-y-2">
        <label className="block text-[#1A1E3C] font-medium">{label}</label>
        <input
          {...props}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#574EFA] focus:ring-2 focus:ring-[#574EFA]/20 outline-none transition-all placeholder:text-gray-400"
        />
      </div>
    );
  }
  
  