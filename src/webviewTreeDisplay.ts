import * as vscode from 'vscode';
import { TreeNode } from "./treenode";


export function displayTree(root: TreeNode | null, maxTreeDepth: number) {
	const panel = vscode.window.createWebviewPanel(
	  "binarytree",
	  "Binary Tree",
	  vscode.ViewColumn.One,
	  {}
	);

	panel.webview.html = getWebviewContent(getTree(root, 0));

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
                width: 20px;
                height: 20px;
                padding: 20px;
                background: #48c268;
            }
        </style>

        ${tree[0]}
    </body>
    </html>`;
}


function getTree(root: TreeNode | null, level: number): [string, number] {
    if (!root) {
        return ["", level];
    }

    let result: string = "";

    result += `<node> ${root.val} </node> <br>`;

    let left: [string, number] = getTree(root.left, level+1);
    result += left[0];

    let right: [string, number] = getTree(root.right, level+1);
    result += right[0];

    let maxLevel: number = Math.max(level, left[1], right[1]);

	return [result, maxLevel];
}
