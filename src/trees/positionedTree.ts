import { rev, unzip } from "./utils";

// extent of a tree, each entry is extent of specific depth-level
export type Extent = [number, number][];

// type of labeled tree
export type LabeledTree<T> = [T, LabeledTree<T>[]];
export type Position = number;
export type PositionedTree<T> = LabeledTree<[T, Position]>;
export type PositionedExtentTree<T> = LabeledTree<[[T, Extent], Position]>;
export type PositionedTreeOrientation = "Left" | "Center" | "Right";

const fit = (ex1: Extent, ex2: Extent): number => {
    if (ex1.length === 0 || ex2.length === 0) return 0;
    else {
        const [, r] = ex1[0];
        const [l] = ex2[0];
        return Math.max(fit(ex1.slice(1), ex2.slice(1)), r - l + 1);
    }
};

const mergeExtents = (ex1: Extent, ex2: Extent): Extent => {
    if (ex1.length === 0) return ex2;
    if (ex2.length === 0) return ex1;
    const [l] = ex1[0];
    const [, r] = ex2[0];

    return [[l, r], ...mergeExtents(ex1.slice(1), ex2.slice(1))];
};

const mergeExtentsList = (es: Extent[]) => es.reduce(mergeExtents, []);

const moveExtent = (ex: Extent, x: number): Extent => {
    if (ex.length === 0) return [];
    else {
        const [l, r] = ex[0];
        return [[l + x, r + x], ...moveExtent(ex.slice(1), x)];
    }
};

const moveTree = <T>([[label, x], subtrees]: PositionedTree<T>, dx: number): PositionedTree<T> => {
    return [[label, x + dx], subtrees];
};

// fitting of multiple extents to the left
const fitlistl = (es: Extent[]) => {
    const fitlistlh = (acc: Extent, es: Extent[]): number[] => {
        if (es.length === 0) return [];
        else {
            const x = fit(acc, es[0]);
            return [x, ...fitlistlh(mergeExtents(acc, moveExtent(es[0], x)), es.slice(1))];
        }
    };
    return fitlistlh([], es);
};

// fitting of multiple extents to the right
const flipextent = (ext: Extent): Extent => ext.map(([a, b]) => [-b, -a]);
const fitlistr = (es: Extent[]) => rev(fitlistl(rev(es).map(flipextent)).map((e) => -e));

// fitting lists to the center
const mean = (x: number, y: number) => (x + y) / 2;
const fitlist = (es: Extent[]) => {
    const l = fitlistl(es);
    const r = fitlistr(es);

    return l.map((a, i) => {
        const b = r[i];
        return mean(a, b);
    });
};

// building a PositionedExtentTree
export const buildPosTree = <T>(
    [label, subtrees]: LabeledTree<T>,
    positionedTreeOrientation: PositionedTreeOrientation
): [PositionedExtentTree<T>, Extent] => {
    const [subtrees2, extents] = unzip(subtrees.map((s) => buildPosTree(s, positionedTreeOrientation)));

    let positions;
    if (positionedTreeOrientation === "Center") positions = fitlist(extents);
    else if (positionedTreeOrientation === "Left") positions = fitlistl(extents);
    else positions = fitlistr(extents);

    const ptrees = subtrees2.map((st, i) => moveTree(st, positions[i]));
    const pextents = extents.map((ext, i) => moveExtent(ext, positions[i]));
    const resExtents: Extent = [[0, 0], ...mergeExtentsList(pextents)];
    const resTree: PositionedExtentTree<T> = [[[label, resExtents.map((e) => [...e])], 0], ptrees];
    return [resTree, resExtents];
};
