import { useEffect, useRef, useState } from "react";
import { drawPositionedExtentTree, type DrawingSettings } from "../trees/drawing";
import "../trees/treeParser";
import { Button } from "./components/Button";
import { Input } from "./components/Input";
import { useCanvas } from "./hooks/useCanvas";
import { twcm } from "../trees/utils";
import { useTree } from "./hooks/useTree";
import type { PositionedTreeOrientation } from "../trees/positionedTree";

function App() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [showMenu, setShowMenu] = useState(false);

    const [scale, setScale] = useState(devicePixelRatio);
    const [doRef, setDoRef] = useState(false);
    const [doRefPos, setDoRefPos] = useState(false);

    const [drawingSettings, setDrawingSettings] = useState<DrawingSettings>({
        circleRadius: 15,
        nodeSeperation: 30 * 2,
        levelSeperation: 30 * 2,
        drawExtents: false,
        drawExtentsAtDepthLevel: 0,
        drawTrueExtents: false,
        edgeStyle: "direct",
        showLabels: true,
    });
    function changeSettings<T extends keyof DrawingSettings>(key: T, value: DrawingSettings[T]) {
        const settingsCopy = { ...drawingSettings };
        settingsCopy[key] = value;
        setDrawingSettings(settingsCopy);
    }

    const [treeString, setTreeString] = useState(`L (A, [
  L (B, [
    L (C, [
      L (D, []),
      L (E, []),
      L (F, [])
    ])
  ]), 
  L (G, [
    L (H, []),
    L (I, []),
    L (J, [])
  ]),
  L (K, []),
  L (L, [
    L (M, []),
    L (N, []),
    L (O, [])
  ])
])`);
    const [positionedTreeOrientation, setPositionedTreeOrientation] = useState<PositionedTreeOrientation>("Center");
    const [treeHeight, positionedExtentTree, positionedExtentTreeExtent] = useTree(
        treeString,
        positionedTreeOrientation,
        doRef,
        doRefPos
    );

    // draw
    const draw = (ctx: CanvasRenderingContext2D) => {
        if (positionedExtentTree !== null) {
            const height = (positionedExtentTreeExtent.length - 1) * 75;

            ctx.save();
            ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
            ctx.scale(scale, scale);
            ctx.translate(-ctx.canvas.width / 2, -ctx.canvas.height / 2);
            drawPositionedExtentTree(
                ctx,
                positionedExtentTree,
                ctx.canvas.width / 2,
                ctx.canvas.height / 2 - height / 2,
                drawingSettings
            );
            ctx.restore();
        }
    };

    const drawOnCanvas = () => {
        if (canvasRef.current !== null) {
            const canv = canvasRef.current;

            const ctx = canv.getContext("2d");
            if (ctx) {
                ctx.clearRect(0, 0, canv.width, canv.height);
                draw(ctx);
            }
        }
    };

    // run effect when settings changed
    useEffect(() => {
        drawOnCanvas();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [drawingSettings, scale, positionedExtentTree, positionedExtentTreeExtent, doRef, doRefPos]);

    // run effect when tree changed to draw tree again
    useEffect(() => {
        changeSettings(
            "drawExtentsAtDepthLevel",
            Math.max(0, Math.min(drawingSettings.drawExtentsAtDepthLevel, treeHeight))
        );

        drawOnCanvas();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [positionedExtentTree]);

    // handlers
    const handleChangeExtentsAtDepthLevel = () => {
        const currVal = drawingSettings.drawExtentsAtDepthLevel;
        const nextVal = currVal >= treeHeight ? 0 : currVal + 1;
        changeSettings("drawExtentsAtDepthLevel", nextVal);
    };
    const handlePositionedTreeOrientationChange = () => {
        if (positionedTreeOrientation === "Left") {
            setPositionedTreeOrientation("Center");
        } else if (positionedTreeOrientation === "Center") {
            setPositionedTreeOrientation("Right");
        } else {
            setPositionedTreeOrientation("Left");
        }
    };

    const handleScale = (e: React.FormEvent<HTMLInputElement>) => {
        setScale(Math.max(0.1, Math.min(Number((e.target as HTMLInputElement).value) / 10, 3)));
    };

    useCanvas(canvasRef, draw);

    return (
        <div className="w-screen h-screen overflow-hidden  font-mono">
            <div className="bg-white/80 fixed z-20 flex flex-col gap-2 top-0 right-0 p-5 opacity-30 hover:opacity-100 transition-opacity h-full">
                <div className="flex flex-row items-center justify-end gap-5">
                    <Button onClick={() => setShowMenu(!showMenu)}>{showMenu ? "close" : "open"}</Button>
                </div>

                {showMenu && (
                    <>
                        <div className="flex flex-row items-center justify-between gap-5">
                            <p>Node Radius</p>
                            <Input
                                type="number"
                                value={drawingSettings.circleRadius}
                                onChange={(e) => {
                                    changeSettings("circleRadius", Math.max(0, Math.min(Number(e.target.value), 100)));
                                }}
                            />
                        </div>
                        <div className="flex flex-row items-center justify-between gap-5">
                            <p>Node Hoz. Seperation</p>
                            <Input
                                type="number"
                                value={drawingSettings.nodeSeperation}
                                onChange={(e) => {
                                    changeSettings(
                                        "nodeSeperation",
                                        Math.max(0, Math.min(Number(e.target.value), 100))
                                    );
                                }}
                            />
                        </div>
                        <div className="flex flex-row items-center justify-between gap-5">
                            <p>Level Seperation</p>
                            <Input
                                type="number"
                                value={drawingSettings.levelSeperation}
                                onChange={(e) => {
                                    changeSettings(
                                        "levelSeperation",
                                        Math.max(0, Math.min(Number(e.target.value), 100))
                                    );
                                }}
                            />
                        </div>
                        <div className="flex flex-row items-center justify-between gap-5">
                            <p>Draw Extents</p>
                            <Button
                                onClick={() => {
                                    changeSettings("drawExtents", !drawingSettings.drawExtents);
                                }}
                            >
                                {drawingSettings.drawExtents ? "on" : "off"}
                            </Button>
                        </div>
                        <div className="flex flex-row items-center justify-between gap-5">
                            <p>Draw Extents at Level</p>
                            <Button onClick={handleChangeExtentsAtDepthLevel}>
                                {drawingSettings.drawExtentsAtDepthLevel}
                            </Button>
                        </div>
                        <div className="flex flex-row items-center justify-between gap-5">
                            <p>Draw True Extents</p>
                            <Button onClick={() => changeSettings("drawTrueExtents", !drawingSettings.drawTrueExtents)}>
                                {drawingSettings.drawTrueExtents ? "on" : "off"}
                            </Button>
                        </div>
                        <div className="flex flex-row items-center justify-between gap-5">
                            <p>Edge Style</p>
                            <Button
                                onClick={() =>
                                    changeSettings(
                                        "edgeStyle",
                                        drawingSettings.edgeStyle === "fork" ? "direct" : "fork"
                                    )
                                }
                            >
                                {drawingSettings.edgeStyle === "fork" ? "Fork" : "Direct"}
                            </Button>
                        </div>
                        <div className="flex flex-row items-center justify-between gap-5">
                            <p>Show Labels</p>
                            <Button onClick={() => changeSettings("showLabels", !drawingSettings.showLabels)}>
                                {drawingSettings.showLabels ? "on" : "off"}
                            </Button>
                        </div>

                        <div className="flex flex-row items-center justify-between gap-5">
                            <p>Tree Orientation</p>
                            <Button onClick={handlePositionedTreeOrientationChange}>{positionedTreeOrientation}</Button>
                        </div>

                        <div className="flex flex-row items-center justify-between gap-5">
                            <p>Scale</p>
                            <Input
                                type="range"
                                value={Math.trunc(scale * 10)}
                                min={1}
                                max={30}
                                onChange={handleScale}
                            ></Input>
                        </div>

                        <div className="flex flex-row items-center justify-between gap-5">
                            <p>Reflect (pre-design)</p>
                            <Button onClick={() => setDoRef(!doRef)}>{doRef ? "on" : "off"}</Button>
                        </div>

                        <div className="flex flex-row items-center justify-between gap-5">
                            <p>Reflect Position (post-design)</p>
                            <Button onClick={() => setDoRefPos(!doRefPos)}>{doRefPos ? "on" : "off"}</Button>
                        </div>

                        <div className="w-full h-full flex flex-col items-start justify-between gap-2">
                            <p>Haskell Tree String</p>

                            <textarea
                                className={twcm(
                                    positionedExtentTree === null && "border-red-500",
                                    "border h-full w-full focus:ring-0 focus:outline-0 resize-none"
                                )}
                                value={treeString}
                                onChange={(e) => {
                                    setTreeString(e.target.value);
                                }}
                            ></textarea>

                            <p className="border p-1 text-sm w-full text-center">newtype LTree a = L (a, [LTree a])</p>
                        </div>
                    </>
                )}
            </div>

            {positionedExtentTree === null && (
                <div className="fixed w-full h-full z-0 flex items-center justify-center">
                    <p className="text-red-500">Invalid Haskell Tree String</p>
                </div>
            )}

            <canvas ref={canvasRef} />
        </div>
    );
}

export default App;
