import express from 'express';
import * as vscode from 'vscode';
import { runTreeCommand } from './helpers/tree';

const API_KEY = '';

function apiKeyMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7); // Verwijder 'Bearer ' uit de header
        if (token === API_KEY) {
            return next();
        }
    }
    res.status(403).json({ error: 'Forbidden: Invalid Bearer Token' }); // Onjuist Bearer-token
}

export function startServer(context: vscode.ExtensionContext) {
    const app = express();
    const port = 3076;

    app.use(apiKeyMiddleware);

    app.get('/open-files-names', (req, res) => {
        const openFiles = vscode.window.visibleTextEditors.map(editor => editor.document.fileName);
        res.json(openFiles);
    });

    app.get('/file-tree', async (req, res) => {
        const rootPath = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : '';

        try {
            const filestructure = await runTreeCommand(rootPath);
            res.json({ filestructure });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error generating file structure' });
        }
    });

    app.get('/open-files', async (req, res) => {
        const fileContents: { [key: string]: string } = {};
        for (const editor of vscode.window.visibleTextEditors) {
            const document = editor.document;
            const fileName = document.fileName;
            const fileContent = document.getText();
            fileContents[fileName] = fileContent;
        }

        const rootPath = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : '';

        try {
            const filestructure = await runTreeCommand(rootPath);
            fileContents['filestructure'] = filestructure;
        } catch (error) {
            console.error(error);
            fileContents['filestructure'] = 'Error generating file structure';
        }

        res.json(fileContents);
    });

    const server = app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });

    context.subscriptions.push({
        dispose: () => server.close()
    });
}

export function stopServer(server: any) {
    server.close(() => {
        console.log('Server stopped.');
    });
}
