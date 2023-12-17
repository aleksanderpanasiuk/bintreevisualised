import { debug } from 'console';
import * as vscode from 'vscode';
import { TreeNode } from "./treenode"
import { promises } from 'dns';


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

	let response_varaibles: object = await session.customRequest("variables", {"variablesReference": rootReference});

	console.log(response_varaibles);
}

// This method is called when your extension is deactivated
export function deactivate() {
	console.log("deactiavted");
}
