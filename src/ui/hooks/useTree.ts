import { useState, useEffect } from "react";
import {
    type PositionedExtentTree,
    type Extent,
    buildPosTree,
    type PositionedTreeOrientation,
    type LabeledTree,
} from "../../trees/positionedTree";
import { parseTreeF } from "../../trees/treeParser";
import { getTreeHeight, ref, refPosExt } from "../../trees/utils";

export const useTree = (
    treeString: string,
    positionedTreeOrientation: PositionedTreeOrientation,
    doRef: boolean,
    doRefPos: boolean
): [number, PositionedExtentTree<string>, Extent] | [0, null, null] => {
    const [positionedExtentTree, setPositionedExtentTree] = useState<
        [number, PositionedExtentTree<string>, Extent] | [0, null, null]
    >([0, null, null]);

    useEffect(() => {
        try {
            let lt: LabeledTree<string>;
            if (doRef) {
                lt = ref(parseTreeF(treeString));
            } else {
                lt = parseTreeF(treeString);
            }

            const treeHeight = getTreeHeight(lt);

            const [t, ext]: [PositionedExtentTree<string>, Extent] = buildPosTree(lt, positionedTreeOrientation);

            if (doRefPos) {
                setPositionedExtentTree([treeHeight, refPosExt(t), ext]);
            } else {
                setPositionedExtentTree([treeHeight, t, ext]);
            }
        } catch {
            setPositionedExtentTree([0, null, null]);
        }
    }, [treeString, positionedTreeOrientation, doRef, doRefPos]);

    return positionedExtentTree;
};
