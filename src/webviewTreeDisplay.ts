import * as vscode from 'vscode';
import { TreeNode } from "./treenode";
import internal from 'stream';


export function displayTree(root: TreeNode | null, maxTreeDepth: number) {
	const panel = vscode.window.createWebviewPanel(
	  "binarytree",
	  "Binary Tree",
	  vscode.ViewColumn.One,
	  {}
	);

	panel.webview.html = getWebviewContent(getTree(root, maxTreeDepth, [0, 1]));

	panel.onDidDispose(
	  () => {
	  },
	  null,
	);
}


function getWebviewContent(tree: [string, number]): string {
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
                width: 15px;
                height: 15px;
                padding: 15px;
                background: #48c268;
                text-align: center;
                position: fixed;
            }
        </style>

        ${tree[0]}
    </body>
    </html>`;
}


function getTree(root: TreeNode | null, maxTreeDepth: number, position: [number, number]): [string, number] {
    if (!root) {
        return ["", 0];
    }

    let result: string = "";

    let x: number = position[1] * 50 * Math.pow(2, maxTreeDepth) * 1.618 / (Math.pow(2, position[0])+1);
    let y: number = position[0] * 100 + 30;

    result += `<node style="top: ${y}px; left: ${x}px;"> ${root.val} </node> <br>`;

    let left: [string, number] = getTree(root.left, maxTreeDepth, [position[0]+1, 2*position[1] - 1]);
    result += left[0];

    let right: [string, number] = getTree(root.right, maxTreeDepth, [position[0]+1, 2*position[1]]);
    result += right[0];

    let maxLevel: number = Math.max(position[0], left[1], right[1]);

	return [result, maxLevel];
}
