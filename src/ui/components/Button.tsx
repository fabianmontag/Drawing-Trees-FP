export const Button: React.FunctionComponent<
    React.PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>
> = ({ onClick, children, ...props }) => {
    return (
        <button onClick={onClick} className="border w-20 h-8 px-1 cursor-pointer" {...props}>
            {children}
        </button>
    );
};
