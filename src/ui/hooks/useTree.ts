import { useState, useEffect } from "react";
import {
    type PositionedExtentTree,
    type Extent,
    buildPosTree,
    type PositionedTreeOrientation,
} from "../../trees/positionedTree";
import { parseTreeF } from "../../trees/treeParser";
import { getTreeHeight } from "../../trees/utils";

export const useTree = (
    treeString: string,
    positionedTreeOrientation: PositionedTreeOrientation
): [number, PositionedExtentTree<string>, Extent] | [0, null, null] => {
    const [positionedExtentTree, setPositionedExtentTree] = useState<
        [number, PositionedExtentTree<string>, Extent] | [0, null, null]
    >([0, null, null]);

    useEffect(() => {
        try {
            const lt = parseTreeF(treeString);
            const treeHeight = getTreeHeight(lt);
            setPositionedExtentTree([treeHeight, ...buildPosTree(lt, positionedTreeOrientation)]);
        } catch {
            setPositionedExtentTree([0, null, null]);
        }
    }, [treeString, positionedTreeOrientation]);

    return positionedExtentTree;
};
