import * as vscode from 'vscode';
import { TreeNode } from "./treenode";


export function displayTree(root: TreeNode | undefined) {
	const panel = vscode.window.createWebviewPanel(
	  "binarytree",
	  "Binary Tree",
	  vscode.ViewColumn.One,
	  {}
	);

	panel.webview.html = getWebviewContent(getTree());

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


function getTree(): string {
	return "tree";
}