import { useEffect } from "react";

export const useCanvas = (
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    draw: (ctx: CanvasRenderingContext2D) => void
) => {
    const handleResize = () => {
        if (canvasRef.current !== null) {
            const canv = canvasRef.current;

            canv.style.width = window.innerWidth + "px";
            canv.style.height = window.innerHeight + "px";
            canv.width = window.innerWidth * devicePixelRatio;
            canv.height = window.innerHeight * devicePixelRatio;

            const ctx = canv.getContext("2d");
            if (ctx) draw(ctx);
        }
    };

    useEffect(() => {
        handleResize();
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draw]);
};
