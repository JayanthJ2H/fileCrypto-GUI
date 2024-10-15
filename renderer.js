const secretFileInput = document.getElementById('secretFile');
const keyFileInput = document.getElementById('keyFile');

const keyFileNameDisplay = document.getElementById('keyFileName');
const secretFileNameDisplay = document.getElementById('secretFileName');

const encrypt = document.getElementById('encrypt');
const decrypt = document.getElementById('decrypt');

const fileCircle = document.getElementById('fileCirle');
const keyCircle = document.getElementById('keyCircle');

const { ipcRenderer } = require('electron');
const { exec } = require('child_process');

const fileImage = document.getElementById('uploadFile');
const keyImage = document.getElementById('uploadKey');

let secretFile = null;
let keyFile = null;

let secret_file_name;
let key_file_name;

const reader = new FileReader();
const MAX_FILE_SIZE = 40 * 1024 * 1024;

function getFileName(input, displayElement, fileType) {
    const file = input.files[0];

    if (file && file.size < MAX_FILE_SIZE) {
        displayElement.textContent = `${file.name}`;
        
        if (fileType === 'secret') {
            if (file.name.endsWith('.txt')) {
                secretFile = file;
                secret_file_name = file.name.replace(/ /g, '_');
                fileImage.src = './images/fileadded.png';
                updateCircleStatus(fileCircle, 'success');
            } else {
                alert('Select a valid text file');
                input.value = "";
                reset(fileType);
            }
        } else if (fileType === 'key') {
            if (file.name.endsWith('.png') || file.name.endsWith('.jpg') || file.name.endsWith('.jpeg')) {
                keyFile = file;
                key_file_name = file.name.replace(/ /g, '_');
                keyImage.src = './images/keyadded.png';
                updateCircleStatus(keyCircle, 'success');
            } else {
                alert('Select a valid image file');
                input.value = "";
                reset(fileType);
            }
        }
    } else {
        alert('Exceeded maximum file size - [40MB]');
        input.value = "";
        reset(fileType);
    }
}

function reset(fileType) {
    if (fileType === 'secret') {
        secretFile = null;
        secret_file_name = '';
        fileImage.src = './images/addfile.png';
        secretFileNameDisplay.textContent = '';
        updateCircleStatus(fileCircle, 'neutral');
    } else if (fileType === 'key') {
        keyFile = null;
        key_file_name = '';
        keyImage.src = './images/addkey.png';
        keyFileNameDisplay.textContent = '';
        updateCircleStatus(keyCircle, 'neutral');
    }
}

function copyFile(command) {
    if (!secretFile) {
        alert('Please select a secret file');
        return;
    }
    if (!keyFile) {
        alert('Please select a key file');
        return;
    }

    reader.onload = function(event) {
        const secretBuffer = Buffer.from(event.target.result);
        ipcRenderer.send('copy-file-data', { buffer: secretBuffer, fileName: secret_file_name });

        const keyReader = new FileReader();
        keyReader.onload = function(event) {
            const keyBuffer = Buffer.from(event.target.result);
            ipcRenderer.send('copy-file-data', { buffer: keyBuffer, fileName: key_file_name });
        };
        keyReader.readAsArrayBuffer(keyFile);
    };
    reader.readAsArrayBuffer(secretFile);

    if (command === 'encrypt') {
        encryptFile();
    } else if (command === 'decrypt') {
        decryptFile();
    }
}

secretFileInput.addEventListener('change', () => {
    getFileName(secretFileInput, secretFileNameDisplay, 'secret');
});

keyFileInput.addEventListener('change', () => {
    getFileName(keyFileInput, keyFileNameDisplay, 'key');
});

encrypt.addEventListener('click', () => copyFile('encrypt'));
decrypt.addEventListener('click', () => copyFile('decrypt'));

function encryptFile() {
    exec(`python3 main.py -e -f ${secret_file_name} -k ${key_file_name}`, (error, stdout, stderr) => {
        if (error) {
            document.getElementById('log').textContent = `Encryption error: ${error.message}`;
            updateCircleStatus(fileCircle, 'error');
            return;
        }
        document.getElementById('log').textContent = stdout || stderr || 'Encryption successful!';
    });
}

function decryptFile() {

    exec(`python3 main.py -d -f ${secret_file_name} -k ${key_file_name}`, (error, stdout, stderr) => {
        if (error) {
            document.getElementById('log').textContent = `Decryption error: ${error.message}`;
            updateCircleStatus(fileCircle, 'error');
            return;
        }
        document.getElementById('log').textContent = stdout || stderr || 'Decryption successful!';
    });
}

function updateCircleStatus(circle, status) {
    if (status === 'success') {
        circle.style.backgroundColor = 'green';
    } else if (status === 'error') {
        circle.style.backgroundColor = 'red';
    } else {
        circle.style.backgroundColor = 'gray'; 
    }
}
