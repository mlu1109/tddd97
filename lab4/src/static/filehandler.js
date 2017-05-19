function getFileTypeFromURI(dataURI) {
    return dataURI.slice(dataURI.indexOf(':') + 1, dataURI.indexOf('/'));
}

function getMimeTypeFromURI(dataURI) {
    return dataURI.slice(dataURI.indexOf(':') + 1, dataURI.indexOf(';'));
}

function fileToDataURI(file, callback) {
    let reader = new FileReader();
    reader.onload = (event) => {
        callback(event.target.result);
    };
    reader.readAsDataURL(file);
}

function dataURIToFile(dataURI) {
    return new File([dataURI], 'unnamed', {type: getMimeTypeFromURI(dataURI)})
}

