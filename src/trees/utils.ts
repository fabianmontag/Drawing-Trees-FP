import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { LabeledTree } from "./positionedTree";

// tailwind class merge
// helper function to conditionally add tw classes, merges classes together
export const twcm = (...inputs: ClassValue[]) => {
    return twMerge(clsx(inputs));
};

export const unzip = <T, R>(arr: [T, R][]): [T[], R[]] => {
    const arr1: T[] = [];
    const arr2: R[] = [];

    for (const [e1, e2] of arr) {
        arr1.push(e1);
        arr2.push(e2);
    }

    return [arr1, arr2];
};

export const rev = <T>(l: T[]) => l.reduce((b, a) => [a, ...b], [] as T[]);

export const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

export const getTreeHeight = <T>(ltree: LabeledTree<T>): number => {
    return ltree[1].reduce((acc: number, st: LabeledTree<T>) => Math.max(acc, getTreeHeight(st) + 1), 0);
};
