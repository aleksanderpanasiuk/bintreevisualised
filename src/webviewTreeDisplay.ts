import * as vscode from 'vscode';
import { TreeNode } from "./treenode";


const nodeSize: number = 30;
const nodeSizeHalf: number = nodeSize/2;


export function getWebviewContent(root: TreeNode | null, maxTreeDepth: number): string {
    let tree: [string, number, [number, number]] = getTree(root, maxTreeDepth, [0, 1]);
	return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Binary Tree</title>
    </head>
    <body>
        <style>
            node {
                border-radius: 50%;
                width: 20px;
                height: 20px;
                padding: ${nodeSizeHalf}px;
                background: #48c268;
                text-align: center;
                position: absolute;
                color: white;
                border-style: solid;
                border-width: 5px;
                border-color: #14752e;
                font-size: 20px;
                font-weight: bold;
            }

            line {
                background: #996600;
                border-width: 3px;
                border-color: #663300;
                border-style: solid;
                height: 10px;
                z-index: -1;
            }
        </style>

        ${tree[0]}

    </body>
    </html>`;
}


function getTree(root: TreeNode | null, maxTreeDepth: number, position: [number, number]): [string, number, [number, number]] {
    if (!root) {
        return ["", 0, [0, 0]];
    }

    let result: string = "";

    let left: [string, number, [number, number]] = getTree(root.left, maxTreeDepth, [position[0]+1, 2*position[1] - 1]);
    result += left[0];

    let right: [string, number, [number, number]] = getTree(root.right, maxTreeDepth, [position[0]+1, 2*position[1]]);
    result += right[0];

    let x: number = position[1] * 65 * Math.pow(2, maxTreeDepth) * 1.618 / (Math.pow(2, position[0])+1);
    let y: number = position[0] * 100 + 30;

    if (root.left) {
        result += drawLine(x+nodeSize, y+nodeSize, left[2][0]+nodeSize, left[2][1]+nodeSize);
    }

    if (root.right) {
        result += drawLine(x+nodeSize, y+nodeSize, right[2][0]+nodeSize, right[2][1]+nodeSize);
    }

    result += `<node style="top: ${y}px; left: ${x}px;"> ${root.val} </node>`;

    let maxLevel: number = Math.max(position[0], left[1], right[1]);
	return [result, maxLevel, [x, y]];
}


function drawLine(x1: number, y1: number, x2: number, y2: number): string {
    if (x2 < x1) {
        let tmp: number;
        tmp = x2 ; x2 = x1 ; x1 = tmp;
        tmp = y2 ; y2 = y1 ; y1 = tmp;
    }

    let lineLength: number = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    let m: number = (y2 - y1) / (x2 - x1);

    let degree: number = Math.atan(m) * 180 / Math.PI;

    return `<line class="line" style="transform-origin: top left; transform: rotate(${degree}deg); width: ${lineLength}px; position: absolute; top: ${y1}px; left: ${x1}px;"></line>`;
}
