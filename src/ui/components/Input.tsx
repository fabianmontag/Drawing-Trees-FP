export const Input: React.FunctionComponent<React.PropsWithChildren<React.InputHTMLAttributes<HTMLInputElement>>> = ({
    ...props
}) => {
    return <input className="border pr-1 w-20 h-8 text-right focus:ring-0 focus:outline-0" {...props} />;
};
