import type { PositionedExtentTree } from "./positionedTree";
import { getRandomColor } from "./utils";

export interface DrawingSettings {
    circleRadius: number;
    nodeSeperation: number;
    levelSeperation: number;
    drawExtents: boolean;
    drawExtentsAtDepthLevel: number;
    drawTrueExtents: boolean;
    showLabels: boolean;
    edgeStyle: "direct" | "fork";
}

export const drawPositionedExtentTree = <T>(
    ctx: CanvasRenderingContext2D,
    positionedExtentTree: PositionedExtentTree<T>,
    x: number,
    y: number,
    drawingSettings: DrawingSettings,
    d = 0,
    prevX?: number,
    index?: number
) => {
    const { circleRadius: cr, nodeSeperation: s, levelSeperation: dy } = drawingSettings;

    // draw up to parent (if exists) but only up to middle
    // where all lines of all children meet
    if (prevX) {
        ctx.save();
        ctx.beginPath();
        if (drawingSettings.edgeStyle === "fork") {
            ctx.moveTo(prevX, y - dy / 2);
            ctx.lineTo(x, y - dy / 2);
            ctx.lineTo(x, y);
        } else {
            ctx.moveTo(prevX, y - dy);
            ctx.lineTo(x, y);
        }

        ctx.stroke();
        ctx.restore();
    }

    let th = 0;
    // draw the child nodes
    for (let i = 0; i < positionedExtentTree[1].length; i++) {
        const subtree = positionedExtentTree[1][i];
        const subtreeX = x + subtree[0][1] * s;
        th = Math.max(th, drawPositionedExtentTree(ctx, subtree, subtreeX, y + dy, drawingSettings, d + 1, x, i));
    }

    // for (const subtree of positionedExtentTree[1]) {
    //     const subtreeX = x + subtree[0][1] * s;
    //     th = Math.max(th, drawPositionedExtentTree(ctx, subtree, subtreeX, y + dy, drawingSettings, d + 1, x, ));
    // }

    // draw partial line from parent to child to middle
    // this prevents multiple children drawing this one
    // middle line multiples times
    if (positionedExtentTree[1].length > 0 && drawingSettings.edgeStyle === "fork") {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + dy / 2);
        ctx.stroke();
        ctx.restore();
    }

    // after every connectiong lines have been drawn

    // draw the node
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, cr, 0, 2 * Math.PI, false);
    ctx.closePath();
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // draw label
    if (drawingSettings.showLabels) {
        ctx.save();
        const text = positionedExtentTree[0][0][0] + "";
        ctx.font = `${cr}px times black`;
        const textMetrics = ctx.measureText(text);
        ctx.fillText(
            text,
            x - textMetrics.width / 2,
            y + (textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent) / 2
        );
        ctx.restore();
    }

    // draw extent
    if (drawingSettings.drawExtents && d === drawingSettings.drawExtentsAtDepthLevel) {
        const extents = positionedExtentTree[0][0][1];

        ctx.save();
        ctx.beginPath();

        const path = new Path2D();

        // const pad = th * 10;
        const pad = 0;

        let padX = cr;
        if (drawingSettings.drawTrueExtents) padX = 0;

        let ys = y;
        for (let i = 0; i < extents.length; i++) {
            const [xl] = extents[i];

            if (i === 0) path.moveTo(x + xl * s - padX - pad, ys - dy / 2 - pad);
            else path.lineTo(x + xl * s - padX - pad, ys - dy / 2 - pad);

            if (i === extents.length - 1) path.lineTo(x + xl * s - padX - pad, ys + dy / 2 + pad);
            else path.lineTo(x + xl * s - padX - pad, ys + dy / 2 - pad);

            ys += dy;
        }
        ys -= dy;

        for (let i = extents.length - 1; i >= 0; i--) {
            const [, xr] = extents[i];

            if (i === extents.length - 1) path.lineTo(x + xr * s + padX + pad, ys + dy / 2 + pad);
            else path.lineTo(x + xr * s + padX + pad, ys + dy / 2 - pad);

            path.lineTo(x + xr * s + padX + pad, ys - dy / 2 - pad);

            ys -= dy;
        }
        path.closePath();

        ctx.setLineDash([14]);
        let val = (index ?? 0) % 4;
        if (val == 0) {
            ctx.strokeStyle = "rgb(0, 152, 250)";
        } else if (val == 1) {
            ctx.strokeStyle = "rgb(246, 27, 26)";
        } else if (val == 2) {
            ctx.strokeStyle = "rgb(255, 163, 43)";
        } else if (val == 3) {
            ctx.strokeStyle = "rgb(0, 168, 37)";
        } else {
            ctx.strokeStyle = getRandomColor();
        }

        ctx.lineCap = ctx.lineJoin = "round";
        ctx.lineWidth = 3;
        ctx.stroke(path);
        path.closePath();
        ctx.restore();
    }

    return th + 1;
};
