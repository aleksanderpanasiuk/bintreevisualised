import { debug } from 'console';
import * as vscode from 'vscode';
import { TreeNode } from "./treenode"


export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "bintreevisualised" is now active!');

	let disposable = vscode.commands.registerCommand('bintreevisualised.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from BinTreeVisualised!');
	});

	vscode.commands.registerCommand("bintreevisualised.buildTree", buildTree);

	context.subscriptions.push(disposable);

}

function getDebugSession(){
	const session = vscode.debug.activeDebugSession;

	if (!session)
	{
		vscode.window.showErrorMessage("Debug session is not started.");
		return;
	}

	return session;
}

async function buildTree() {
	const session = getDebugSession();

	if (!session)
	{
		return;
	}

	const response_thread = await session?.customRequest("threads");

	if (!response_thread) {
		return;
	}

	let threadId: number = response_thread.threads[0].id;

	const response_frame = await session?.customRequest("stackTrace", { "threadId": threadId });
	const frameId = response_frame.stackFrames[0].id;

	const response_variable = await session?.customRequest("evaluate", {"expression": "root", "frameId": frameId});
	let value: string = response_variable?.result;
	let type: string = response_variable?.type;
	let reference: number = response_variable?.variablesReference;

	console.log(value);
	console.log(type);
	console.log(reference);

	const response_varaibles = await session?.customRequest("variables", {"variablesReference": reference});

	console.log(response_varaibles);
}

// This method is called when your extension is deactivated
export function deactivate() {
	console.log("deactiavted");
}
