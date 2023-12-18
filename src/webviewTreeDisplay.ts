import * as vscode from 'vscode';
import { TreeNode } from "./treenode";


export function displayTree(root: TreeNode | null) {
	const panel = vscode.window.createWebviewPanel(
	  "binarytree",
	  "Binary Tree",
	  vscode.ViewColumn.One,
	  {}
	);

	panel.webview.html = getWebviewContent(getTree(root));

	panel.onDidDispose(
	  () => {
	  },
	  null,
	);
}


function getWebviewContent(tree: string): string{
	return `<!DOCTYPE html>
  <html lang="en">
  <head>
	  <meta charset="UTF-8">
	  <meta name="viewport" content="width=device-width, initial-scale=1.0">
	  <title>Binary Tree</title>
  </head>
  <body>
	  ${tree}
  </body>
  </html>`;
}


function getTree(root: TreeNode | null): string {
    if (!root) {
        return "";
    }

    let result: string = "";

    result += root.val + "<br>";

    result += getTree(root.left);
    result += getTree(root.right);

	return result;
}