import * as vscode from 'vscode';
import { TreeNode } from "./treenode";


export function displayTree(root: TreeNode | null) {
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
                border: 2px solid;
            }
        </style>

        ${tree}
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

    console.log(Math.max(level, left[1], right[1]));

	return [result, Math.max(level, left[1], right[1])];
}
