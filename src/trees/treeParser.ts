// string labeled tree
// haskell labeled tree type:
// newtype LTree a = L (a, [LTree a])
// L (a, [L (a, []), L (a, [L (a, []), L (a, [])]), L (a, [])])

class TreeParseError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = "TreeParseError";
    }
}

import type { LabeledTree } from "./positionedTree";

// imperative recursive descent tree parser
export const parseTreeI = (treeString: string): LabeledTree<string> => {
    treeString = treeString.trim();
    treeString = treeString.replace(/ /g, "");
    treeString = treeString.replace(/\n/g, "");

    const resTree: LabeledTree<string>[] = [["", []]];

    let i = 0;
    while (i < treeString.length) {
        if (treeString[i] === "L" && treeString[i + 1] === "(") {
            let d = "";
            i += 2;
            while (i < treeString.length && treeString[i] !== ",") {
                d += treeString[i];
                i++;
            }

            if (treeString[i] === "," && treeString[i + 1] === "[") {
                resTree.push([d, []]);
            } else throw new TreeParseError("Invalid Tree");

            i += 2;
        } else if (treeString[i] === "]" && treeString[i + 1] === ")") {
            const p = resTree.pop()!;
            resTree[resTree.length - 1][1].push(p);
            i += 2;
            if (treeString[i] === ",") i++;
        } else throw new TreeParseError("Invalid Tree");
    }

    if (resTree.length === 1 && resTree[0][1].length === 1) return resTree[0][1][0];
    else throw new TreeParseError("Invalid Tree");
};

const parseAlphaNumString = (treeString: string): [string, string] => {
    // check if alpha-numeric
    if (treeString.length === 0) return ["", treeString];
    else if (RegExp("^[a-zA-Z0-9_]$").test(treeString[0])) {
        const [d, treeString_] = parseAlphaNumString(treeString.slice(1));
        return [treeString[0] + d, treeString_];
    } else return ["", treeString];
};

// functional recursive descent tree parser
const parseTreeFHelper = (treeString: string): [LabeledTree<string>, string] => {
    if (treeString[0] === "L" && treeString[1] === "(") {
        const [d, treeString_] = parseAlphaNumString(treeString.slice(2));

        if (treeString_[0] === "," && treeString_[1] === "[") {
            const parseTreeFp = (treeString: string): [LabeledTree<string>[], string] => {
                if (treeString[0] === "]" && treeString[1] === ")") return [[], treeString.slice(2)];
                else if (treeString[0] === "L") {
                    const [tree, treeString_] = parseTreeFHelper(treeString);
                    const [trees, treeString__] = parseTreeFp(treeString_);
                    return [[tree, ...trees], treeString__];
                } else if (treeString[0] === ",") {
                    const [tree, treeString_] = parseTreeFHelper(treeString.slice(1));
                    const [trees, treeString__] = parseTreeFp(treeString_);
                    return [[tree, ...trees], treeString__];
                } else throw new TreeParseError("Invalid Tree");
            };

            const [subtrees, treeString__] = parseTreeFp(treeString_.slice(2));

            return [[d, subtrees], treeString__];
        } else throw new TreeParseError("Invalid Tree");
    } else throw new TreeParseError("Invalid Tree");
};

export const parseTreeF = (treeString: string): LabeledTree<string> => {
    treeString = treeString.trim();
    treeString = treeString.replace(/ /g, "");
    treeString = treeString.replace(/\n/g, "");

    const [labeledtree, rest] = parseTreeFHelper(treeString);
    if (rest !== "") throw new TreeParseError("Invalid Tree");

    return labeledtree;
};
