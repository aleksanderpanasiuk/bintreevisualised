import { debug } from 'console';
import * as vscode from 'vscode';
import { TreeNode } from "./treenode";


export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "bintreevisualised" is now active!');

	let disposable = vscode.commands.registerCommand('bintreevisualised.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from BinTreeVisualised!');
	});

	vscode.commands.registerCommand("bintreevisualised.buildTree", buildTree);

	context.subscriptions.push(disposable);

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

	const evaluateResponse = await session.customRequest("evaluate", {"expression": "root", "frameId": frameId});
	if (!evaluateResponse) {
		vscode.window.showErrorMessage("Could not evaluate root.");
		return;
	}

	let reference: number = evaluateResponse.variablesReference;

	return reference;
}

async function getNode(session: vscode.DebugSession, reference: number): Promise<TreeNode | undefined> {
	const responseVariable = await session.customRequest("variables", {"variablesReference": reference});
	if (!responseVariable) {
		vscode.window.showErrorMessage("Could not evaluate variables for ${reference}.");
		return;
	}

	const variables = responseVariable.variables;

	let value: number | undefined;
	let leftNodeReference: number | undefined;
	let rightNodeReference: number | undefined;

	for (var variable of variables) {
		if (variable.name === "val") {
			value = Number(variable.value);
		}
		else if (variable.name === "left") {
			leftNodeReference = variable.variablesReference;
		}
		else if (variable.name === "right") {
			rightNodeReference = variable.variablesReference;
		}
	}

	if (value) {
		let node: TreeNode = new TreeNode(value);

		if (leftNodeReference) {
			let leftNode: TreeNode | undefined = await getNode(session, leftNodeReference);

			if (leftNode) {
				node.left = leftNode;
			}
		}

		if (rightNodeReference) {
			let rightNode: TreeNode | undefined = await getNode(session, rightNodeReference);

			if (rightNode) {
				node.right = rightNode;
			}
		}

		return node;
	}
	else {
		vscode.window.showErrorMessage("Variable doesn't have 'value' variable.");
		return;
	}
}

async function buildTree() {
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

	let node: TreeNode | undefined = await getNode(session, rootReference);

	console.log(node);
}

// This method is called when your extension is deactivated
export function deactivate() {
	console.log("deactiavted");
}
