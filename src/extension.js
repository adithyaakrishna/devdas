"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
class TwitterReminderViewProvider {
    _extensionUri;
    static viewType = 'devdasTwitterReminder';
    _view;
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri
            ]
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        webviewView.webview.onDidReceiveMessage(data => {
            switch (data.type) {
                case 'addReminder':
                    this._addReminder(data.handle, data.interval);
                    break;
            }
        });
    }
    _getHtmlForWebview(webview) {
        const logoUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'ribbon.png'));
        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Twitter Reminder</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
                        padding: 0 20px;
                        color: var(--vscode-foreground);
                        background-color: var(--vscode-editor-background);
                    }
                    .header {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        margin-bottom: 20px;
                        border-bottom: 1px solid var(--vscode-panel-border);
                        padding-bottom: 10px;
                    }
                    .logo {
                        width: 30px;
                        height: 30px;
                    }
                    h1 {
                        margin: 0;
                        font-size: 1em;
                        font-weight: 600;
                    }
                    form {
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                    }
                    input, select, button {
                        background-color: var(--vscode-input-background);
                        color: var(--vscode-input-foreground);
                        border: 1px solid var(--vscode-input-border);
                        padding: 6px 8px;
                        border-radius: 2px;
                    }
                    input:focus, select:focus, button:focus {
                        outline: 1px solid var(--vscode-focusBorder);
                    }
                    button {
                        background-color: var(--vscode-button-background);
                        color: var(--vscode-button-foreground);
                        border: none;
                        padding: 8px 12px;
                        cursor: pointer;
                        font-weight: 600;
                    }
                    button:hover {
                        background-color: var(--vscode-button-hoverBackground);
                    }
                    #reminderList {
                        margin-top: 20px;
                    }
                    .reminder-item {
                        background-color: var(--vscode-editor-inactiveSelectionBackground);
                        border: 1px solid var(--vscode-panel-border);
                        padding: 10px;
                        margin-bottom: 10px;
                        border-radius: 4px;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <img src="${logoUri}" alt="Devdas Logo" class="logo">
                    <h1>Dev by Day, Devdas by Night</h1>
                </div>
                <form id="reminderForm">
                    <input type="text" id="twitterHandle" placeholder="Twitter handle (without @)" required>
                    <select id="reminderInterval" required>
                        ${Array.from({ length: 12 }, (_, i) => i + 1).map(num => `<option value="${num}">${num} hour${num !== 1 ? 's' : ''}</option>`).join('')}
                    </select>
                    <button type="submit">Add Reminder</button>
                </form>
                <div id="reminderList"></div>
                <script>
                    const vscode = acquireVsCodeApi();
                    const reminderList = document.getElementById('reminderList');
                    
                    document.getElementById('reminderForm').addEventListener('submit', (e) => {
                        e.preventDefault();
                        const handle = document.getElementById('twitterHandle').value;
                        const intervalElement = document.getElementById('reminderInterval');
                        const interval = parseInt(intervalElement.value, 10);
                        
                        vscode.postMessage({
                            type: 'addReminder',
                            handle: handle,
                            interval: interval
                        });
                        
                        // Add reminder to the list
                        const reminderItem = document.createElement('div');
                        reminderItem.className = 'reminder-item';
                        reminderItem.textContent = \`@\${handle} - Every \${interval} hour\${interval !== 1 ? 's' : ''}\`;
                        reminderList.appendChild(reminderItem);
                        
                        // Clear form
                        document.getElementById('twitterHandle').value = '';
                        intervalElement.selectedIndex = 0; // Reset dropdown to first option
                    });
                </script>
            </body>
            </html>`;
    }
    _addReminder(handle, interval) {
        vscode.window.showInformationMessage(`Reminder set for @${handle} every ${interval} hour(s).`);
        // Set up the actual reminder
        setInterval(() => {
            vscode.window.showInformationMessage(`Don't forget to like and reply to @${handle}'s tweets!`, 'Open Twitter')
                .then(selection => {
                if (selection === 'Open Twitter') {
                    vscode.env.openExternal(vscode.Uri.parse(`https://twitter.com/${handle}`));
                }
            });
        }, interval * 60 * 60 * 1000);
    }
}
function activate(context) {
    const provider = new TwitterReminderViewProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(TwitterReminderViewProvider.viewType, provider));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map