import { debug } from 'console';
import * as vscode from 'vscode';
import { TreeNode } from "./treenode";
import internal from 'stream';
import { getWebviewContent } from "./webviewTreeDisplay";


let valueName: string | undefined = vscode.workspace.getConfiguration().get("bintreevisualised.valueName");
let leftName: string | undefined = vscode.workspace.getConfiguration().get("bintreevisualised.leftName");
let rightName: string | undefined = vscode.workspace.getConfiguration().get("bintreevisualised.rightName");
let rootName: string | undefined = vscode.workspace.getConfiguration().get("bintreevisualised.rootName");

let panel: vscode.WebviewPanel | undefined;
let rootNode: TreeNode | null;
let maxTreeDepth: number | null;


export function activate(context: vscode.ExtensionContext) {
	console.log("BinTreeVisualised is now active!");

	context.subscriptions.push(
		vscode.commands.registerCommand("bintreevisualised.buildTree", getTreeFromDebugger),
		vscode.debug.registerDebugAdapterTrackerFactory('*', {
			createDebugAdapterTracker(session: vscode.DebugSession) {
			  return {
				onWillReceiveMessage: m => updateTree(m.command),
				onDidSendMessage: m => {}
			  };
			}
		})
	);
}


export function displayTree(root: TreeNode | null, maxTreeDepth: number) {
	if (!panel) {
		panel = vscode.window.createWebviewPanel(
			"binarytree",
			"Binary Tree",
			{	preserveFocus: true,
				viewColumn: vscode.ViewColumn.Beside},
			{}
		);

		panel.onDidDispose(
		() => {
			panel = undefined;
		},
		null,
		);
	}

	panel.webview.html = getWebviewContent(root, maxTreeDepth);
}


async function updateTree(command: string) {
	if ((command === "continue" || command === "stepIn" ||
		command === "next" || command === "stepOut") && panel) {
			await getTreeFromDebugger();
		}
}


function getDebugSession(){
	return vscode.debug.activeDebugSession;
}


async function getThreadId(session: vscode.DebugSession): Promise<number | undefined> {
	const response_thread = await session.customRequest("threads");

	if (!response_thread) {
		vscode.window.showErrorMessage("Could not recieve current thread.");
		return;
	}

	return response_thread.threads[0].id;
}


async function getRootReference(session: vscode.DebugSession, threadId: number): Promise<number | undefined> {
	const stackResponse = await session.customRequest("stackTrace", { "threadId": threadId });

	if (!stackResponse) {
		vscode.window.showErrorMessage("Could not recieve call stack.");
		return;
	}

	let frameId: number = stackResponse.stackFrames[0].id;

	const evaluateResponse = await session.customRequest("evaluate", {"expression": rootName, "frameId": frameId});
	if (!evaluateResponse) {
		vscode.window.showErrorMessage("Could not evaluate root.");
		return;
	}

	let reference: number = evaluateResponse.variablesReference;

	return reference;
}


async function buildTree(session: vscode.DebugSession, reference: number, treeDepth: number): Promise<[TreeNode, number] | null> {
	const responseVariable = await session.customRequest("variables", {"variablesReference": reference});
	if (!responseVariable) {
		vscode.window.showErrorMessage(`Could not evaluate variables for ${reference}.`);
		return null;
	}

	const variables = responseVariable.variables;

	let value: number | undefined;
	let leftNodeReference: number | undefined;
	let rightNodeReference: number | undefined;

	for (var variable of variables) {
		if (variable.name === valueName) {
			value = Number(variable.value);
		}
		else if (variable.name === leftName) {
			leftNodeReference = variable.variablesReference;
		}
		else if (variable.name === rightName) {
			rightNodeReference = variable.variablesReference;
		}
	}

	if (value) {
		let node: TreeNode = new TreeNode(value);

		let leftDepth: number = 0;
		let rightDepth: number = 0;

		if (leftNodeReference) {
			let leftNode: [TreeNode, number] | null = await buildTree(session, leftNodeReference, treeDepth+1);

			if (leftNode) {
				node.left = leftNode[0];
				leftDepth = leftNode[1];
			}
		}

		if (rightNodeReference) {
			let rightNode: [TreeNode, number] | null = await buildTree(session, rightNodeReference, treeDepth+1);

			if (rightNode) {
				node.right = rightNode[0];
				rightDepth = rightNode[1];
			}
		}

		return [node, Math.max(treeDepth, leftDepth, rightDepth)];
	}
	else {
		return null;
	}
}


async function getTreeFromDebugger() {
	let session: vscode.DebugSession | undefined = getDebugSession();
	if (!session) {
		vscode.window.showErrorMessage("Debug session is not started.");
		return;
	}

	let threadId: number | undefined = await getThreadId(session);
	if (!threadId) {
		return;
	}

	let rootReference: number| undefined = await getRootReference(session, threadId);
	if (!rootReference) {
		return;
	}

	rootNode = null;
	maxTreeDepth = 0;
	let nodeData: [TreeNode, number] | null = await buildTree(session, rootReference, 0);

	if (nodeData) {
		rootNode = nodeData[0];
		maxTreeDepth = nodeData[1];
	}

	displayTree(rootNode, maxTreeDepth);
}


export function deactivate() {
	console.log("BinTreeVisualised deactiavted");
}
