import * as vscode from 'vscode';
import { startServer, stopServer } from './server'; 

let serverInstance: any;

export function activate(context: vscode.ExtensionContext) {

    let startServerCommand = vscode.commands.registerCommand('talktovs.startServer', () => {
        serverInstance = startServer(context); 
    });

    let stopServerCommand = vscode.commands.registerCommand('talktovs.stopServer', () => {
        if (serverInstance) {
            stopServer(serverInstance);
            vscode.window.showInformationMessage('Server gestopt.');
        } else {
            vscode.window.showInformationMessage('Server was niet gestart.');
        }
    });
    context.subscriptions.push(startServerCommand);
    context.subscriptions.push(stopServerCommand);
}

export function deactivate() {
    if (serverInstance) {
        stopServer(serverInstance);
    }
}
